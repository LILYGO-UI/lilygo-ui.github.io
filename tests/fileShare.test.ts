import assert from 'node:assert/strict'
import { setImmediate as nextTurn } from 'node:timers/promises'
import test from 'node:test'
import { BleSignalDecoder, BLE_FRAME_TIMEOUT, createSignalEnvelope, encodeBleSignal, FileShareSession, FILE_SHARE_RX_UUID, FILE_SHARE_SERVICE_UUID, FILE_SHARE_TX_UUID, GATT_TEARDOWN_TIMEOUT, sha256 } from '../docs/.vitepress/theme/lib/fileShare.ts'
import type { FileShareConfig, FileTransferMetadata, SignalEnvelope } from '../docs/.vitepress/theme/lib/fileShare.ts'

async function until(predicate: () => boolean, message = 'condition was not reached', timeoutMs = 1000) {
  const deadline = Date.now() + timeoutMs
  while (!predicate()) {
    if (Date.now() >= deadline) assert.fail(message)
    await new Promise<void>(resolve => setTimeout(resolve, 1))
  }
}
function wait(milliseconds: number): Promise<void> { return new Promise(resolve => setTimeout(resolve, milliseconds)) }
let deviceSequence = 0
class Channel extends EventTarget {
  readyState = 'open'
  binaryType = ''
  bufferedAmount = 0
  bufferedAmountLowThreshold = 0
  sent: Array<string | ArrayBuffer> = []
  onSend?: (data: string | ArrayBuffer) => void
  send(data: string | ArrayBuffer) {
    if (this.readyState !== 'open') throw new Error('closed')
    this.sent.push(data); this.onSend?.(data)
  }
  receive(data: unknown) { this.dispatchEvent(new MessageEvent('message', { data })) }
  close() { if (this.readyState === 'closed') return; this.readyState = 'closed'; this.dispatchEvent(new Event('close')) }
  controls(kind?: string): any[] { return this.sent.filter(value => typeof value === 'string').map(value => JSON.parse(value as string)).filter(value => !kind || value.kind === kind) }
  binary(): ArrayBuffer[] { return this.sent.filter(value => value instanceof ArrayBuffer) as ArrayBuffer[] }
}
function connected(config: FileShareConfig = {}) {
  const session = new FileShareSession({ sessionId: 'test-session', ...config })
  const channel = new Channel()
  ;(session as any).bindChannel(channel)
  channel.dispatchEvent(new Event('open'))
  return { session, channel }
}
function control(channel: Channel, value: object) { channel.receive(JSON.stringify(value)) }
function packet(seq: number, bytes: number[]) { const value = new Uint8Array(bytes.length + 4); new DataView(value.buffer).setUint32(0, seq); value.set(bytes, 4); return value.buffer }
async function metadata(bytes: number[], overrides: Partial<FileTransferMetadata> = {}): Promise<FileTransferMetadata> { return { sessionId: 'test-session', fileId: 'incoming', fileName: '测试.bin', fileSize: bytes.length, chunkSize: 4, sha256: await sha256(new Uint8Array(bytes)), ...overrides } }
function automaticallyReceive(channel: Channel) {
  let meta: FileTransferMetadata
  channel.onSend = data => {
    if (typeof data !== 'string') return
    const value = JSON.parse(data)
    if (value.kind === 'file-start') { meta = value.metadata; control(channel, { kind: 'file-accepted', fileId: meta.fileId }) }
    if (value.kind === 'file-complete') control(channel, { kind: 'file-received', fileId: meta.fileId, fileName: meta.fileName, size: meta.fileSize, sha256: meta.sha256 })
  }
}

test('BLE frames round trip UTF-8 and obey the baseline 20-byte GATT value limit', () => {
  const original = createSignalEnvelope('sdp.offer', 'session', { description: { type: 'offer', sdp: '设备网络'.repeat(40) } })
  const frames = encodeBleSignal(original)
  assert.ok(frames.length > 1)
  assert.ok(frames.every(frame => frame.length <= 20))
  assert.equal(frames[0][0], 1); assert.equal(frames.at(-1)![0], 2)
  const decoder = new BleSignalDecoder()
  const decoded = frames.map(frame => decoder.push(frame)).filter(Boolean)
  assert.deepEqual(decoded, [original]); assert.equal(decoder.pending, false)
})
test('BLE rejects malformed, out-of-order, expired and oversized envelopes', () => {
  const frames = encodeBleSignal(createSignalEnvelope('session.hello', 'session', {}))
  const decoder = new BleSignalDecoder()
  assert.throws(() => decoder.push(Uint8Array.of(3, 1, 0, 0, 1)), /Malformed/)
  decoder.push(frames[0], 1)
  assert.throws(() => decoder.push(frames[2], 2), /out of order/)
  decoder.push(frames[0], 1)
  assert.throws(() => decoder.push(frames[1], BLE_FRAME_TIMEOUT + 2), /timed out/)
  assert.throws(() => decoder.push(frames[1]), /boundary/)
  assert.throws(() => encodeBleSignal(createSignalEnvelope('session.hello', 'session', { large: 'x'.repeat(65536) })), /64 KiB/)
  assert.equal(decoder.pending, false)
})

test('sender waits for acceptance and receiver verification, and sends big-endian sequence frames', async () => {
  const { session, channel } = connected({ chunkSize: 2 })
  let done = false
  const sending = session.sendFile(new File([Uint8Array.of(1, 2, 3)], 'test.bin')).then(() => { done = true })
  await until(() => channel.controls('file-start').length === 1)
  const meta = channel.controls('file-start')[0].metadata
  assert.equal(channel.binary().length, 0)
  control(channel, { kind: 'file-accepted', fileId: meta.fileId })
  await until(() => channel.controls('file-complete').length === 1)
  assert.equal(done, false); assert.equal(session.state, 'verifying')
  assert.deepEqual(channel.binary().map(value => [...new Uint8Array(value)]), [[0, 0, 0, 0, 1, 2], [0, 0, 0, 1, 3]])
  control(channel, { kind: 'file-received', fileId: meta.fileId, fileName: meta.fileName, size: 3, sha256: meta.sha256 })
  await sending
  assert.equal(done, true); assert.equal(session.state, 'completed')
  await session.close()
})
test('sender bounds outstanding chunks to a 32-chunk receive credit window', async () => {
  const { session, channel } = connected({ chunkSize: 4 })
  const sending = session.sendFile(new File([new Uint8Array(4 * 65)], 'window.bin'))
  await until(() => channel.controls('file-start').length === 1)
  const meta = channel.controls('file-start')[0].metadata
  control(channel, { kind: 'file-accepted', fileId: meta.fileId })
  await until(() => channel.binary().length === 32)
  await nextTurn(); assert.equal(channel.binary().length, 32)
  control(channel, { kind: 'file-progress', fileId: meta.fileId, chunks: 32, receivedBytes: 128 })
  await until(() => channel.binary().length === 64)
  await nextTurn(); assert.equal(channel.binary().length, 64)
  control(channel, { kind: 'file-progress', fileId: meta.fileId, chunks: 64, receivedBytes: 256 })
  await until(() => channel.controls('file-complete').length === 1)
  assert.equal(channel.binary().length, 65)
  control(channel, { kind: 'file-received', fileId: meta.fileId, size: 260, sha256: meta.sha256 })
  await sending; await session.close()
})
test('invalid final hash acknowledgement cannot report success', async () => {
  const { session, channel } = connected()
  const sending = session.sendFile(new File(['abc'], 'test.txt'))
  const rejected = assert.rejects(sending, /invalid file verification/)
  await until(() => channel.controls('file-start').length === 1)
  const meta = channel.controls('file-start')[0].metadata
  control(channel, { kind: 'file-accepted', fileId: meta.fileId })
  await until(() => channel.controls('file-complete').length === 1)
  control(channel, { kind: 'file-received', fileId: meta.fileId, size: 3, sha256: '0'.repeat(64) })
  await rejected; assert.equal(session.state, 'connected'); await session.close()
})
test('cancel rejects an acceptance wait, rejects concurrent send, and allows another transfer', async () => {
  const { session, channel } = connected()
  const sending = session.sendFile(new File(['abc'], 'cancel.txt'))
  const rejected = assert.rejects(sending, { name: 'AbortError' })
  await until(() => channel.controls('file-start').length === 1)
  await assert.rejects(session.sendFile(new File(['x'], 'concurrent.txt')), /current transfer/)
  session.cancelTransfer(); await rejected
  assert.equal(session.transferActive, false)
  assert.ok(channel.controls('file-cancel').length > 0)
  automaticallyReceive(channel)
  await session.sendFile(new File(['next'], 'next.txt'))
  assert.equal(session.state, 'completed'); await session.close()
})
test('channel closure rejects a backpressure wait without leaving an active transfer', async () => {
  const { session, channel } = connected({ highWaterMark: 100, lowWaterMark: 10 })
  const sending = session.sendFile(new File(['abc'], 'close.txt'))
  const rejected = assert.rejects(sending, /closed/)
  await until(() => channel.controls('file-start').length === 1)
  channel.bufferedAmount = 200
  control(channel, { kind: 'file-accepted', fileId: channel.controls('file-start')[0].metadata.fileId })
  await nextTurn(); channel.close(); await rejected
  assert.equal(session.transferActive, false); assert.equal(session.state, 'idle')
})
test('sender times out if the peer never acknowledges metadata', async () => {
  const { session } = connected({ approvalTimeoutMs: 20, transferTimeoutMs: 20 })
  await assert.rejects(session.sendFile(new File(['abc'], 'timeout.txt')), /did not confirm/)
  assert.equal(session.transferActive, false); await session.close()
})
test('receiver requires file-complete even for an empty file', async () => {
  const { session, channel } = connected()
  const files: unknown[] = []; session.on('fileComplete', value => files.push(value))
  const meta = await metadata([])
  control(channel, { kind: 'file-start', metadata: meta })
  await until(() => channel.controls('file-accepted').length === 1)
  assert.equal(files.length, 0)
  control(channel, { kind: 'file-complete', fileId: meta.fileId, chunks: 0 })
  await until(() => files.length === 1)
  assert.equal(channel.controls('file-received').length, 1); await session.close()
})
test('receiver verifies exact byte/chunk counts, digest, and rejects oversized metadata', async () => {
  for (const failure of ['truncated', 'extra', 'hash', 'metadata']) {
    const { session, channel } = connected({ maxFileSize: 10 })
    const files: unknown[] = []; session.on('fileComplete', value => files.push(value))
    const meta = await metadata([1, 2], failure === 'hash' ? { sha256: '0'.repeat(64) } : failure === 'metadata' ? { fileSize: 11 } : {})
    control(channel, { kind: 'file-start', metadata: meta })
    if (failure !== 'metadata') {
      await until(() => channel.controls('file-accepted').length === 1)
      if (failure !== 'truncated') channel.receive(packet(0, failure === 'extra' ? [1, 2, 3] : [1, 2]))
      if (failure !== 'extra') control(channel, { kind: 'file-complete', fileId: meta.fileId, chunks: failure === 'truncated' ? 0 : 1 })
    }
    await until(() => channel.controls('file-error').length === 1, `${failure} should return file-error`)
    assert.equal(files.length, 0); assert.equal(channel.controls('file-received').length, 0)
    await session.close()
  }
})
test('receiver serializes hashing with the following file and handles cancellation', async () => {
  const { session, channel } = connected()
  const files: string[] = []; session.on('fileComplete', value => files.push(value.fileId))
  const first = await metadata([1, 2], { fileId: 'one' })
  const second = await metadata([3, 4], { fileId: 'two' })
  for (const [meta, bytes] of [[first, [1, 2]], [second, [3, 4]]] as const) {
    control(channel, { kind: 'file-start', metadata: meta }); channel.receive(packet(0, [...bytes])); control(channel, { kind: 'file-complete', fileId: meta.fileId, chunks: 1 })
  }
  await until(() => files.length === 2)
  assert.deepEqual(files, ['one', 'two'])
  control(channel, { kind: 'file-start', metadata: first })
  await until(() => session.transferActive)
  control(channel, { kind: 'file-cancel', fileId: first.fileId })
  await until(() => !session.transferActive)
  assert.equal(files.length, 2); await session.close()
})

class Characteristic extends EventTarget {
  value?: DataView
  properties = { write: true, writeWithoutResponse: false }
  started = false
  writeMethods: string[] = []
  onWrite?: (value: Uint8Array) => void
  async startNotifications() { this.started = true; return this }
  async stopNotifications() { this.started = false; return this }
  async writeValueWithResponse(value: Uint8Array) { this.writeMethods.push('response'); this.onWrite?.(value) }
  async writeValueWithoutResponse(value: Uint8Array) { this.writeMethods.push('without-response'); this.onWrite?.(value) }
  async writeValue(value: Uint8Array) { this.writeMethods.push('legacy'); this.onWrite?.(value) }
  notify(envelope: SignalEnvelope) {
    for (const frame of encodeBleSignal(envelope)) { this.value = new DataView(frame.buffer, frame.byteOffset, frame.byteLength); this.dispatchEvent(new Event('characteristicvaluechanged')) }
  }
}
class Peer extends EventTarget {
  static instances: Peer[] = []
  channel = new Channel()
  iceGatheringState = 'complete'
  connectionState = 'new'
  iceConnectionState = 'new'
  localDescription?: object
  remoteDescription?: object
  sctp = { maxMessageSize: 65536 }
  options: unknown
  constructor(options: unknown) { super(); this.options = options; Peer.instances.push(this); this.channel.readyState = 'connecting' }
  createDataChannel(name: string, options: unknown) { assert.equal(name, 'file-share'); assert.deepEqual(options, { ordered: true }); return this.channel }
  async createOffer() { return { type: 'offer', sdp: 'v=0\r\na=candidate:local 1 udp 1 192.168.1.10 12345 typ host\r\n' } }
  async setLocalDescription(value: object) { this.localDescription = value }
  async setRemoteDescription(value: object) { this.remoteDescription = value; this.channel.readyState = 'open'; this.channel.dispatchEvent(new Event('open')) }
  async addIceCandidate() {}
  async getStats() { return new Map() }
  close() { this.connectionState = 'closed'; this.channel.close() }
}
function installBluetooth(onEnvelope: (envelope: SignalEnvelope, tx: Characteristic) => void, failGatt = false, disconnectDelayMs = 0) {
  const tx = new Characteristic(); const rx = new Characteristic(); const decoder = new BleSignalDecoder()
  const device = new EventTarget() as any
  let disconnectCalls = 0
  let connectCalls = 0
  device.id = `browser-opaque-id-${++deviceSequence}`; device.name = 'lilygo_eeff'
  device.gatt = {
    connected: false,
    async connect() {
      connectCalls += 1
      if (failGatt) throw new Error('GATT connection failed')
      this.connected = true
      return { async getPrimaryService(uuid: string) { assert.equal(uuid, FILE_SHARE_SERVICE_UUID); return { async getCharacteristic(id: string) { assert.ok(id === FILE_SHARE_RX_UUID || id === FILE_SHARE_TX_UUID); return id === FILE_SHARE_RX_UUID ? rx : tx } } } }
    },
    disconnect() {
      disconnectCalls += 1; this.connected = false
      if (disconnectDelayMs > 0) setTimeout(() => device.dispatchEvent(new Event('gattserverdisconnected')), disconnectDelayMs)
      else queueMicrotask(() => device.dispatchEvent(new Event('gattserverdisconnected')))
    },
  }
  rx.onWrite = value => { assert.equal(tx.started, true); const envelope = decoder.push(value); if (envelope) onEnvelope(envelope, tx) }
  Object.defineProperty(globalThis, 'navigator', { configurable: true, value: { bluetooth: { async requestDevice(options: unknown) { assert.deepEqual(options, { filters: [{ services: [FILE_SHARE_SERVICE_UUID] }], optionalServices: [FILE_SHARE_SERVICE_UUID] }); return device } } } })
  Object.defineProperty(globalThis, 'RTCPeerConnection', { configurable: true, value: Peer })
  Peer.instances = []
  return { tx, rx, device, get disconnectCalls() { return disconnectCalls }, get connectCalls() { return connectCalls } }
}
test('BLE connects and negotiates automatically after session.accepted', async () => {
  const received: SignalEnvelope[] = []
  const { tx } = installBluetooth((envelope, notifications) => {
    received.push(envelope)
    if (envelope.type === 'session.hello') notifications.notify(createSignalEnvelope('session.accepted', envelope.sessionId, { pairingRequired: false }))
    if (envelope.type === 'sdp.offer') notifications.notify(createSignalEnvelope('sdp.answer', envelope.sessionId, { description: { type: 'answer', sdp: 'v=0' } }))
  })
  const session = new FileShareSession({ sessionId: 'ble-session' })
  await session.discoverDevice()
  await until(() => session.state === 'connected', undefined, 5000)
  assert.deepEqual(received.map(value => value.type).slice(0, 2), ['session.hello', 'sdp.offer'])
  assert.deepEqual(Peer.instances[0].options, { iceServers: [] })
  assert.ok((received.find(value => value.type === 'sdp.offer')!.payload as any).description.sdp.includes('typ host'))
  await session.close()
})
test('connection errors fail closed instead of requesting a pairing code', async () => {
  installBluetooth((envelope, tx) => {
    if (envelope.type === 'session.hello') tx.notify(createSignalEnvelope('session.error', envelope.sessionId, { code: 'connection-denied', message: 'Connection denied.' }))
  })
  const session = new FileShareSession()
  await assert.rejects(session.discoverDevice(), /Connection denied/)
  await until(() => session.state === 'error')
  assert.equal(Peer.instances.length, 0); await session.close()
})
test('GATT failure is reported as an error instead of a selected/ready device', async () => {
  installBluetooth(() => {}, true)
  const session = new FileShareSession()
  await assert.rejects(session.discoverDevice(), /GATT connection failed/)
  assert.equal(session.state, 'error'); await session.close()
})
test('a browser-reported classic adapter name does not reject a service-matched device', async () => {
  const bluetooth = installBluetooth(() => {})
  bluetooth.device.name = 'raspberrypi'
  const session = new FileShareSession()
  await session.discoverDevice()
  await session.close()
})
test('closing a Bluetooth session completes teardown before the next session connects', async () => {
  const bluetooth = installBluetooth(() => {})
  const first = new FileShareSession({ sessionId: 'first-session' })
  await first.discoverDevice()
  await first.close()
  const second = new FileShareSession({ sessionId: 'second-session' })
  await second.discoverDevice()
  assert.equal(bluetooth.connectCalls, 2)
  assert.equal(bluetooth.disconnectCalls, 1)
  await second.close()
})
test('a delayed gattserverdisconnected event blocks a concurrent reconnect', async () => {
  const bluetooth = installBluetooth(() => {}, false, 25)
  const first = new FileShareSession({ sessionId: 'first-session' })
  await first.discoverDevice()
  const startedAt = Date.now()
  await first.close()
  assert.ok(Date.now() - startedAt >= 20)
  const second = new FileShareSession({ sessionId: 'second-session' })
  await second.discoverDevice()
  assert.equal(bluetooth.connectCalls, 2)
  await second.close()
})
test('a stale pending GATT connect reports a refresh recovery instead of racing a second connect', async () => {
  const bluetooth = installBluetooth(() => {})
  let connectAttempts = 0
  let completeConnect!: (server: object) => void
  bluetooth.device.gatt.connect = () => { connectAttempts += 1; return new Promise(resolve => { completeConnect = resolve }) }
  const first = new FileShareSession({ sessionId: 'stalled-session', gattTimeoutMs: 10 })
  await assert.rejects(first.discoverDevice(), /timed out before service discovery/)
  await wait(GATT_TEARDOWN_TIMEOUT + 10)
  const second = new FileShareSession({ sessionId: 'retry-session', gattTimeoutMs: 10 })
  await assert.rejects(second.discoverDevice(), /Refresh this page and try again/)
  assert.equal(connectAttempts, 1)
  completeConnect({})
  await first.close(); await second.close()
})
test('a stalled GATT connection times out and a late connection cannot resume negotiation', async () => {
  const bluetooth = installBluetooth(() => {})
  const { device, rx } = bluetooth
  let completeConnect!: (server: object) => void
  let discovered = false
  device.gatt.connect = () => new Promise(resolve => { completeConnect = resolve })
  const session = new FileShareSession({ gattTimeoutMs: 20 })
  await assert.rejects(session.discoverDevice(), /Bluetooth GATT connection to lilygo_eeff timed out before service discovery/)
  assert.equal(session.state, 'error')
  assert.equal(bluetooth.disconnectCalls, 1)
  device.gatt.connected = true
  completeConnect({ getPrimaryService() { discovered = true; throw new Error('Late discovery') } })
  await nextTurn()
  assert.equal(device.gatt.connected, false)
  assert.equal(discovered, false)
  assert.equal(rx.writeMethods.length, 0)
  await session.close()
})

test('GATT writes select the characteristic capability and support legacy browser APIs', async () => {
  for (const mode of ['response', 'both', 'without-response', 'legacy', 'legacy-without-properties']) {
    const received: SignalEnvelope[] = []
    const { rx } = installBluetooth(envelope => received.push(envelope))
    rx.properties = { write: mode !== 'without-response', writeWithoutResponse: mode === 'without-response' || mode === 'both' }
    if (mode.startsWith('legacy')) {
      Object.defineProperty(rx, 'writeValueWithResponse', { value: undefined })
      Object.defineProperty(rx, 'writeValueWithoutResponse', { value: undefined })
      if (mode === 'legacy-without-properties') Object.defineProperty(rx, 'properties', { value: undefined })
    }
    const session = new FileShareSession()
    await session.discoverDevice()
    assert.deepEqual(received.map(envelope => envelope.type), ['session.hello'])
    const expected = mode.startsWith('legacy') ? 'legacy' : mode === 'without-response' ? mode : 'response'
    assert.ok(rx.writeMethods.length > 0)
    assert.ok(rx.writeMethods.every(method => method === expected), mode)
    await session.close()
  }
})
test('a characteristic without write capability fails before sending a hello', async () => {
  const { rx, device } = installBluetooth(() => {})
  rx.properties = { write: false, writeWithoutResponse: false }
  const session = new FileShareSession()
  await assert.rejects(session.discoverDevice(), /Bluetooth signaling write 1\/\d+ failed:.*cannot write/)
  assert.equal(rx.writeMethods.length, 0)
  assert.equal(device.gatt.connected, false)
  assert.equal(session.state, 'error')
  await session.close()
})
test('a failed signaling write reports its stage without retrying the frame in another mode', async () => {
  const { rx, device } = installBluetooth(() => {})
  rx.properties = { write: true, writeWithoutResponse: true }
  rx.writeValueWithResponse = async value => {
    rx.writeMethods.push('response')
    if (rx.writeMethods.length >= 4) throw new Error('GATT operation failed for unknown reason.')
    rx.onWrite?.(value)
  }
  const session = new FileShareSession()
  await assert.rejects(session.discoverDevice(), /Bluetooth signaling write 4\/\d+ failed: GATT operation failed for unknown reason/)
  assert.equal(rx.writeMethods.length, 6)
  assert.equal(device.gatt.connected, false)
  assert.equal(session.state, 'error')
  await session.close()
})
test('a transient signaling write failure retries the same frame and completes the hello', async () => {
  const received: SignalEnvelope[] = []
  const { rx } = installBluetooth(envelope => received.push(envelope))
  let failed = false
  rx.writeValueWithResponse = async value => {
    rx.writeMethods.push('response')
    if (!failed && rx.writeMethods.length === 4) {
      failed = true
      throw new Error('GATT operation failed for unknown reason.')
    }
    rx.onWrite?.(value)
  }
  const session = new FileShareSession()
  await session.discoverDevice()
  assert.equal(failed, true)
  assert.equal(received.length, 1)
  assert.equal(rx.writeMethods.length, 8)
  await session.close()
})
test('notification setup failure reports its stage and removes the Bluetooth listeners', async () => {
  const { tx, device } = installBluetooth(() => {})
  tx.startNotifications = async () => { throw new Error('GATT operation failed for unknown reason.') }
  const session = new FileShareSession()
  const errors: Error[] = []
  const selected: unknown[] = []
  session.on('error', value => errors.push(value))
  session.on('device', value => selected.push(value))
  await assert.rejects(session.discoverDevice(), /Bluetooth notification setup failed: GATT operation failed for unknown reason/)
  assert.equal(device.gatt.connected, false)
  assert.equal(session.state, 'error')
  assert.equal(selected.length, 0)
  device.dispatchEvent(new Event('gattserverdisconnected'))
  tx.dispatchEvent(new Event('characteristicvaluechanged'))
  await nextTurn()
  assert.equal(errors.length, 1)
  await session.close()
})

test('file contents wait for per-file device approval; decline rejects before sending chunks', async () => {
  const { session, channel } = connected()
  const sending = session.sendFile(new File(['private contents'], 'private.txt'))
  await until(() => channel.controls('file-start').length === 1)
  const metadata = channel.controls('file-start')[0].metadata
  assert.equal(session.state, 'awaiting-approval')
  assert.equal(channel.sent.filter(value => value instanceof ArrayBuffer).length, 0)
  control(channel, { kind: 'file-pending', fileId: metadata.fileId, fileName: metadata.fileName, fileSize: metadata.fileSize })
  await nextTurn()
  assert.equal(session.state, 'awaiting-approval')
  control(channel, { kind: 'file-error', fileId: metadata.fileId, message: 'Declined on device.' })
  await assert.rejects(sending, /Declined on device/)
  assert.equal(channel.sent.filter(value => value instanceof ArrayBuffer).length, 0)
  assert.equal(session.state, 'connected')
  await session.close()
})

test('file chunks begin only after device approval matches the pending file', async () => {
  const { session, channel } = connected()
  const sending = session.sendFile(new File(['approved contents'], 'approved.txt'))
  await until(() => channel.controls('file-start').length === 1)
  const metadata = channel.controls('file-start')[0].metadata
  assert.equal(channel.sent.filter(value => value instanceof ArrayBuffer).length, 0)
  control(channel, { kind: 'file-pending', fileId: metadata.fileId, fileName: metadata.fileName, fileSize: metadata.fileSize })
  control(channel, { kind: 'file-accepted', fileId: metadata.fileId })
  await until(() => channel.sent.filter(value => value instanceof ArrayBuffer).length > 0)
  await until(() => channel.controls('file-complete').length === 1)
  control(channel, { kind: 'file-received', fileId: metadata.fileId, fileName: metadata.fileName, size: metadata.fileSize, sha256: metadata.sha256 })
  await sending
  await session.close()
})

test('an approval for a different file cannot release contents and mismatched details fail closed', async () => {
  const { session, channel } = connected()
  const sending = session.sendFile(new File(['private contents'], 'private.txt'))
  await until(() => channel.controls('file-start').length === 1)
  const metadata = channel.controls('file-start')[0].metadata
  control(channel, { kind: 'file-accepted', fileId: 'previous-file' })
  await nextTurn()
  assert.equal(session.state, 'awaiting-approval')
  assert.equal(channel.sent.filter(value => value instanceof ArrayBuffer).length, 0)
  control(channel, { kind: 'file-pending', fileId: metadata.fileId, fileName: 'different.txt', fileSize: metadata.fileSize })
  await assert.rejects(sending, /does not match this file/)
  assert.equal(channel.sent.filter(value => value instanceof ArrayBuffer).length, 0)
  assert.equal(session.state, 'connected')
  await session.close()
})

test('delayed cancellation ACK and old hashing work cannot cancel a replacement transfer', async () => {
  const { session, channel } = connected()
  let releaseHash!: () => void
  const hashing = new Promise<void>(resolve => { releaseHash = resolve })
  const slowFile = new File(['old'], 'old.txt')
  Object.defineProperty(slowFile, 'arrayBuffer', { value: async () => { await hashing; return new TextEncoder().encode('old').buffer } })
  const first = session.sendFile(slowFile)
  const firstRejected = assert.rejects(first, { name: 'AbortError' })
  session.cancelTransfer()
  const cancellation = channel.controls('file-cancel')[0]
  assert.ok(cancellation.fileId)
  const replacement = session.sendFile(new File(['new'], 'new.txt'))
  await until(() => channel.controls('file-start').length === 1)
  const current = channel.controls('file-start')[0].metadata
  assert.notEqual(current.fileId, cancellation.fileId)
  assert.equal(current.fileName, 'new.txt')
  // The actual Python helper replies with file-cancelled, possibly while the
  // replacement is waiting for acceptance. Neither this ACK nor old work owns it.
  control(channel, { kind: 'file-cancelled', fileId: cancellation.fileId })
  releaseHash()
  await firstRejected
  await nextTurn()
  assert.equal(channel.controls('file-cancel').length, 1)
  assert.equal(session.transferActive, true)
  assert.equal(session.state, 'awaiting-approval')
  assert.equal(channel.readyState, 'open')
  control(channel, { kind: 'file-cancelled', fileId: 'stale-unknown-file' })
  control(channel, { kind: 'file-accepted', fileId: current.fileId })
  await until(() => channel.controls('file-complete').length === 1)
  control(channel, { kind: 'file-received', fileId: current.fileId, fileName: current.fileName, size: current.fileSize, sha256: current.sha256 })
  await replacement
  assert.equal(session.state, 'completed')
  assert.equal(channel.controls('file-cancel').length, 1)
  await session.close()
})

test('empty and non-empty sends cannot claim cancellation after file-complete', async () => {
  for (const contents of ['', 'committed']) {
    const { session, channel } = connected()
    const sending = session.sendFile(new File([contents], 'finish.txt'))
    await until(() => channel.controls('file-start').length === 1)
    const meta = channel.controls('file-start')[0].metadata
    control(channel, { kind: 'file-accepted', fileId: meta.fileId })
    await until(() => session.state === 'verifying')
    assert.equal(channel.controls('file-complete').length, 1)
    assert.equal(session.cancelTransfer(), false)
    assert.equal(channel.controls('file-cancel').length, 0)
    assert.equal(session.state, 'verifying')
    assert.equal(session.transferActive, true)
    control(channel, { kind: 'file-received', fileId: meta.fileId, fileName: meta.fileName, size: meta.fileSize, sha256: meta.sha256 })
    await sending
    assert.equal(session.state, 'completed')
    assert.equal(session.cancelTransfer(), false)
    await session.close()
  }
})

test('BLE detaches after the answer and an open DataChannel; later disconnect does not interrupt a transfer', async () => {
  const { device } = installBluetooth((envelope, tx) => {
    if (envelope.type === 'session.hello') tx.notify(createSignalEnvelope('session.accepted', envelope.sessionId, {}))
    if (envelope.type === 'sdp.offer') tx.notify(createSignalEnvelope('sdp.answer', envelope.sessionId, { description: { type: 'answer', sdp: 'v=0' } }))
  })
  const session = new FileShareSession()
  await session.discoverDevice()
  assert.equal(device.gatt.connected, true)
  await until(() => session.state === 'connected' && !device.gatt.connected, undefined, 5000)
  const channel = Peer.instances[0].channel
  assert.ok(Peer.instances[0].remoteDescription)
  assert.equal(channel.readyState, 'open')
  const sending = session.sendFile(new File(['local network file'], 'lan.txt'))
  await until(() => channel.controls('file-start').length === 1)
  const meta = channel.controls('file-start')[0].metadata
  device.dispatchEvent(new Event('gattserverdisconnected'))
  await nextTurn()
  assert.equal(session.state, 'awaiting-approval')
  assert.equal(channel.readyState, 'open')
  control(channel, { kind: 'file-accepted', fileId: meta.fileId })
  await until(() => channel.controls('file-complete').length === 1)
  control(channel, { kind: 'file-received', fileId: meta.fileId, fileName: meta.fileName, size: meta.fileSize, sha256: meta.sha256 })
  await sending
  assert.equal(session.state, 'completed')
  await session.close()
  assert.equal(channel.readyState, 'closed')
  assert.equal(Peer.instances[0].connectionState, 'closed')
})
test('BLE disconnection before DataChannel opens still fails the connection setup', async () => {
  const { device } = installBluetooth(() => {})
  const session = new FileShareSession()
  const errors: Error[] = []
  session.on('error', value => errors.push(value))
  await session.discoverDevice()
  device.gatt.connected = false
  device.dispatchEvent(new Event('gattserverdisconnected'))
  assert.equal(session.state, 'error')
  assert.equal(errors.length, 1)
  assert.match(errors[0].message, /before the direct connection was ready/)
  await session.close()
})
