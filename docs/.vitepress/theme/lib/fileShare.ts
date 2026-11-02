export type FileShareState = 'idle' | 'discovering' | 'signaling' | 'connecting' | 'connected' | 'transferring' | 'awaiting-approval' | 'verifying' | 'completed' | 'error'

export const FILE_SHARE_SERVICE_UUID = 'fde6eb6b-0d5f-49c1-b7ae-296288a7ab0b'
export const FILE_SHARE_RX_UUID = 'fde6eb6c-0d5f-49c1-b7ae-296288a7ab0b'
export const FILE_SHARE_TX_UUID = 'fde6eb6d-0d5f-49c1-b7ae-296288a7ab0b'
export const BLE_MESSAGE_LIMIT = 65536
export const BLE_FRAME_TIMEOUT = 15000
export const GATT_OPERATION_TIMEOUT = 120000
/** Maximum time to wait for Chrome to finish a Web Bluetooth disconnect. */
export const GATT_TEARDOWN_TIMEOUT = 1000
// A short gap avoids an ATT write burst being rejected while BlueZ is
// rebuilding a peripheral connection after the device has been restarted.
export const GATT_FRAME_INTERVAL = 10
const GATT_WRITE_RETRIES = 3
const DEFAULT_CHUNK_SIZE = 16 * 1024 - 4
const DEFAULT_MAX_FILE_SIZE = 512 * 1024 * 1024
const SIGNAL_TYPES = new Set(['session.hello', 'session.accepted', 'sdp.offer', 'sdp.answer', 'ice.candidate', 'session.close', 'session.error'])

export interface FileShareConfig {
  sessionId?: string
  chunkSize?: number
  highWaterMark?: number
  lowWaterMark?: number
  maxFileSize?: number
  gattTimeoutMs?: number
  approvalTimeoutMs?: number
  transferTimeoutMs?: number
}
export interface DeviceInfo { id: string; name?: string }
export type SignalMessageType = 'session.hello' | 'session.accepted' | 'sdp.offer' | 'sdp.answer' | 'ice.candidate' | 'session.close' | 'session.error'
export interface SignalEnvelope<T = unknown> { type: SignalMessageType; sessionId: string; requestId?: string; deviceId?: string; protocolVersion: 1; payload: T }
export interface CandidatePairInfo { kind: 'direct' | 'relay' | 'unknown'; protocol?: string; localType?: string; remoteType?: string; currentRoundTripTime?: number }
export interface FileTransferMetadata { sessionId: string; fileId: string; fileName: string; fileSize: number; chunkSize: number; sha256: string }
export interface TransferProgress { direction: 'send' | 'receive'; fileId: string; fileName: string; totalBytes: number; transferredBytes: number }
export interface ReceivedFile { fileId: string; fileName: string; size: number; sha256: string; blob: Blob }
interface FileShareEvents { state: FileShareState; device: DeviceInfo; signal: SignalEnvelope; candidatePair: CandidatePairInfo; fileStart: FileTransferMetadata; fileProgress: TransferProgress; fileComplete: ReceivedFile; error: Error }
type EventName = keyof FileShareEvents
type Handler<K extends EventName> = (value: FileShareEvents[K]) => void
interface BluetoothCharacteristic extends EventTarget {
  value?: DataView
  properties?: { write: boolean; writeWithoutResponse: boolean }
  writeValueWithResponse?(value: BufferSource): Promise<void>
  writeValueWithoutResponse?(value: BufferSource): Promise<void>
  /** Kept for older Web Bluetooth implementations. */
  writeValue?(value: BufferSource): Promise<void>
  startNotifications(): Promise<BluetoothCharacteristic>
  stopNotifications(): Promise<BluetoothCharacteristic>
}
interface BluetoothDevice extends EventTarget {
  id: string
  name?: string
  gatt?: { connected: boolean; connect(): Promise<{ getPrimaryService(uuid: string): Promise<{ getCharacteristic(uuid: string): Promise<BluetoothCharacteristic> }> }>; disconnect(): void }
}
type BluetoothNavigator = Navigator & { bluetooth?: {
  requestDevice(options: Record<string, unknown>): Promise<BluetoothDevice>
  getDevices?(): Promise<BluetoothDevice[]>
} }
interface IncomingFile { metadata: FileTransferMetadata; chunks: ArrayBuffer[]; receivedBytes: number; nextSeq: number; timer?: ReturnType<typeof setTimeout> }
interface Deferred<T> { promise: Promise<T>; resolve(value: T): void; reject(reason: Error): void }
interface OutgoingFile { metadata: FileTransferMetadata; abort: AbortController; accepted: Deferred<void>; received: Deferred<void>; sentChunks: number; creditChunks: number; creditTarget: number; credit: Deferred<void>; phase: 'awaiting-approval' | 'sending' | 'finishing' }

function deferred<T>(): Deferred<T> {
  let resolve!: (value: T) => void
  let reject!: (reason: Error) => void
  const promise = new Promise<T>((yes, no) => { resolve = yes; reject = no })
  // An acknowledgement may fail before the sender reaches its corresponding await.
  void promise.catch(() => {})
  return { promise, resolve, reject }
}
function cancelled(): Error { return new DOMException('Transfer cancelled.', 'AbortError') }
function asError(error: unknown): Error { return error instanceof Error ? error : new Error(String(error)) }
function isRecord(value: unknown): value is Record<string, unknown> { return Boolean(value) && typeof value === 'object' && !Array.isArray(value) }

export function createSignalEnvelope<T>(type: SignalMessageType, sessionId: string, payload: T, options: Partial<Pick<SignalEnvelope, 'requestId' | 'deviceId'>> = {}): SignalEnvelope<T> {
  return { type, sessionId, protocolVersion: 1, payload, ...options }
}
export function parseSignalEnvelope(value: unknown): SignalEnvelope {
  if (!isRecord(value) || typeof value.type !== 'string' || !SIGNAL_TYPES.has(value.type) || typeof value.sessionId !== 'string' || !value.sessionId || value.sessionId.length > 128 || value.protocolVersion !== 1 || !isRecord(value.payload)) throw new Error('Unsupported Bluetooth signaling message.')
  return value as unknown as SignalEnvelope
}
export function encodeBleSignal(envelope: SignalEnvelope): Uint8Array[] {
  const bytes = new TextEncoder().encode(JSON.stringify(envelope))
  if (bytes.length > BLE_MESSAGE_LIMIT) throw new Error('Bluetooth signaling message exceeds 64 KiB.')
  const frames: Uint8Array[] = []
  for (let offset = 0, seq = 0; offset < bytes.length; offset += 16, seq += 1) {
    const payload = bytes.subarray(offset, offset + 16)
    const frame = new Uint8Array(payload.length + 4)
    frame[0] = (offset === 0 ? 1 : 0) | (offset + payload.length === bytes.length ? 2 : 0)
    new DataView(frame.buffer).setUint16(2, seq)
    frame.set(payload, 4)
    frames.push(frame)
  }
  return frames
}
/** One bounded UTF-8 JSON envelope, split across 20-byte GATT values. */
export class BleSignalDecoder {
  private parts: Uint8Array[] = []
  private size = 0
  private nextSequence = 0
  private lastFrameAt = 0
  get pending(): boolean { return this.parts.length > 0 }
  reset(): void { this.parts = []; this.size = 0; this.nextSequence = 0; this.lastFrameAt = 0 }
  push(value: DataView | Uint8Array, now = Date.now()): SignalEnvelope | null {
    try {
      const frame = new Uint8Array(value.buffer, value.byteOffset, value.byteLength)
      if (frame.length < 5 || frame.length > 20 || frame[1] !== 0 || (frame[0] & ~3) !== 0) throw new Error('Malformed Bluetooth signaling frame.')
      if (this.pending && now - this.lastFrameAt > BLE_FRAME_TIMEOUT) throw new Error('Bluetooth signaling frame timed out.')
      const seq = new DataView(frame.buffer, frame.byteOffset, frame.byteLength).getUint16(2)
      const start = Boolean(frame[0] & 1)
      if (start ? this.pending || seq !== 0 : !this.pending) throw new Error('Unexpected Bluetooth signaling message boundary.')
      if (seq !== this.nextSequence) throw new Error('Bluetooth signaling frames are out of order.')
      this.size += frame.length - 4
      if (this.size > BLE_MESSAGE_LIMIT) throw new Error('Bluetooth signaling message exceeds 64 KiB.')
      this.parts.push(frame.slice(4))
      this.nextSequence += 1
      this.lastFrameAt = now
      if (!(frame[0] & 2)) return null
      const bytes = new Uint8Array(this.size)
      let offset = 0
      for (const part of this.parts) { bytes.set(part, offset); offset += part.length }
      this.reset()
      return parseSignalEnvelope(JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes)))
    } catch (error) { this.reset(); throw error }
  }
}
export async function sha256(data: ArrayBuffer | ArrayBufferView | Blob): Promise<string> {
  const buffer = data instanceof Blob ? await data.arrayBuffer() : data instanceof ArrayBuffer ? data : new Uint8Array(data.buffer, data.byteOffset, data.byteLength).slice().buffer
  const digest = await crypto.subtle.digest('SHA-256', buffer)
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('')
}
function waitWithTimeout<T>(promise: Promise<T>, milliseconds: number, message: string, signal?: AbortSignal): Promise<T> {
  return new Promise((resolve, reject) => {
    const abort = () => { clean(); reject(asError(signal?.reason || cancelled())) }
    const timer = setTimeout(() => { clean(); reject(new Error(message)) }, milliseconds)
    const clean = () => { clearTimeout(timer); signal?.removeEventListener('abort', abort) }
    signal?.addEventListener('abort', abort, { once: true })
    if (signal?.aborted) { abort(); return }
    promise.then(value => { clean(); resolve(value) }, error => { clean(); reject(error) })
  })
}
async function runGattOperation<T>(name: string, operation: () => Promise<T>): Promise<T> {
  try {
    return await operation()
  } catch (error) {
    const normalized = asError(error)
    throw new Error(`Bluetooth ${name} failed: ${normalized.message}`)
  }
}
function wait(milliseconds: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}
function gattTimeoutMessage(stage: string, deviceName?: string): string {
  const target = deviceName?.toLowerCase().startsWith('lilygo_') ? ` to ${deviceName}` : ''
  if (stage === 'GATT connection') {
    return `Bluetooth GATT connection${target} timed out before service discovery. The device was visible, but the Bluetooth link did not complete. Retry from the browser; if it repeats, close and reopen File sharing and check for another active Bluetooth connection.`
  }
  return `Bluetooth ${stage} timed out${target}. Retry from the browser; if it repeats, close and reopen File sharing.`
}

interface BluetoothLifecycle {
  pendingConnect?: Promise<unknown>
  teardown?: Promise<void>
  closing?: Promise<void>
  blocked?: boolean
}

// Chrome/macOS can retain a Web Bluetooth connect promise after the page has
// timed out. Key this by the origin-scoped device id rather than the JS wrapper;
// a later chooser call may return a new BluetoothDevice object for the same
// physical device.
const bluetoothLifecycles = new Map<string, BluetoothLifecycle>()

function bluetoothLifecycle(device: BluetoothDevice): BluetoothLifecycle {
  const existing = bluetoothLifecycles.get(device.id)
  if (existing) return existing
  const created: BluetoothLifecycle = {}
  bluetoothLifecycles.set(device.id, created)
  return created
}

async function teardownBluetooth(device: BluetoothDevice): Promise<void> {
  const lifecycle = bluetoothLifecycle(device)
  if (lifecycle.teardown) return lifecycle.teardown
  lifecycle.teardown = (async () => {
    const pendingConnect = lifecycle.pendingConnect
    const wasConnected = Boolean(device.gatt?.connected)
    if (!wasConnected && !pendingConnect) return
    let disconnected = false
    let resolveDisconnected!: () => void
    const disconnectedEvent = new Promise<void>(resolve => { resolveDisconnected = resolve })
    const onDisconnected = () => { disconnected = true; resolveDisconnected() }
    device.addEventListener('gattserverdisconnected', onDisconnected)
    try {
      try { device.gatt?.disconnect() } catch { /* Chrome may throw while a connect is pending. */ }
      try {
        await waitWithTimeout(disconnectedEvent, GATT_TEARDOWN_TIMEOUT, 'Bluetooth teardown timed out.')
      } catch {
        // A browser can complete the disconnect without dispatching the event.
        // Mark the device blocked when a pending connect remains unresolved so
        // the next attempt gets an actionable refresh error instead of racing it.
        if (lifecycle.pendingConnect && !disconnected) lifecycle.blocked = true
      }
      // The disconnect event may arrive before Chrome settles the original
      // connect() promise. Give its rejection one microtask to run, then
      // refuse a second connect if the stale promise is still pending.
      await Promise.resolve()
      if (lifecycle.pendingConnect) lifecycle.blocked = true
    } finally {
      device.removeEventListener('gattserverdisconnected', onDisconnected)
      lifecycle.teardown = undefined
    }
  })()
  try { await lifecycle.teardown } finally { lifecycle.teardown = undefined }
}

async function prepareBluetoothDevice(device: BluetoothDevice): Promise<void> {
  const lifecycle = bluetoothLifecycle(device)
  if (lifecycle.blocked) throw new Error('Chrome did not release the previous Bluetooth connection. Refresh this page and try again.')
  if (lifecycle.closing) await lifecycle.closing
  if (lifecycle.teardown) await lifecycle.teardown
  if (lifecycle.blocked) throw new Error('Chrome did not release the previous Bluetooth connection. Refresh this page and try again.')
  if (device.gatt?.connected || lifecycle.pendingConnect) await teardownBluetooth(device)
  if (lifecycle.blocked) throw new Error('Chrome did not release the previous Bluetooth connection. Refresh this page and try again.')
}
function transientGattWrite(error: unknown): boolean {
  const message = asError(error).message.toLowerCase()
  return message.includes('unknown reason') || message.includes('operation failed') ||
    message.includes('not connected') || message.includes('networkerror')
}
async function writeGattValue(characteristic: BluetoothCharacteristic, value: BufferSource): Promise<void> {
  const withResponse = characteristic.properties?.write ?? true
  const withoutResponse = characteristic.properties?.writeWithoutResponse ?? true
  // Browser methods describe the API; properties describe this characteristic.
  if (withResponse && characteristic.writeValueWithResponse) return characteristic.writeValueWithResponse(value)
  if (withoutResponse && characteristic.writeValueWithoutResponse) return characteristic.writeValueWithoutResponse(value)
  if ((withResponse || withoutResponse) && characteristic.writeValue) return characteristic.writeValue(value)
  throw new Error('This browser cannot write to the Bluetooth signaling characteristic.')
}

export class FileShareSession {
  readonly sessionId: string
  private readonly config: Required<FileShareConfig>
  private readonly listeners = new Map<EventName, Set<Handler<EventName>>>()
  private bluetoothDevice: BluetoothDevice | null = null
  private bluetoothTeardown: Promise<void> | null = null
  private rx: BluetoothCharacteristic | null = null
  private tx: BluetoothCharacteristic | null = null
  private readonly decoder = new BleSignalDecoder()
  private frameTimer?: ReturnType<typeof setTimeout>
  private connectionTimer?: ReturnType<typeof setTimeout>
  private signalSendQueue: Promise<void> = Promise.resolve()
  private signalReceiveQueue: Promise<void> = Promise.resolve()
  private dataReceiveQueue: Promise<void> = Promise.resolve()
  private peer: RTCPeerConnection | null = null
  private channel: RTCDataChannel | null = null
  private incomingFile: IncomingFile | null = null
  private outgoingFile: OutgoingFile | null = null
  private latestCandidatePair: CandidatePairInfo | null = null
  private pendingCandidates: RTCIceCandidateInit[] = []
  private remoteAnswerSet = false
  private offerRequested = false
  private offerSent = false
  private stateValue: FileShareState = 'idle'
  private generation = 0
  private lifecycle = new AbortController()
  constructor(config: FileShareConfig = {}) {
    this.sessionId = config.sessionId || crypto.randomUUID()
    this.config = { sessionId: this.sessionId, chunkSize: DEFAULT_CHUNK_SIZE, highWaterMark: 256 * 1024, lowWaterMark: 64 * 1024, maxFileSize: DEFAULT_MAX_FILE_SIZE, gattTimeoutMs: GATT_OPERATION_TIMEOUT, approvalTimeoutMs: 50000, transferTimeoutMs: 30000, ...config }
    if (!Number.isSafeInteger(this.config.chunkSize) || this.config.chunkSize < 1 || !Number.isSafeInteger(this.config.maxFileSize) || this.config.maxFileSize < 0 || this.config.maxFileSize > DEFAULT_MAX_FILE_SIZE || this.config.lowWaterMark < 0 || this.config.highWaterMark <= this.config.lowWaterMark || !Number.isFinite(this.config.approvalTimeoutMs) || this.config.approvalTimeoutMs < 1 || this.config.transferTimeoutMs < 1) throw new Error('Invalid file-sharing limits.')
    this.config.chunkSize = Math.min(this.config.chunkSize, DEFAULT_CHUNK_SIZE)
    if (!Number.isFinite(this.config.gattTimeoutMs) || this.config.gattTimeoutMs < 1) throw new Error('Invalid Bluetooth timeout.')
  }
  get state(): FileShareState { return this.stateValue }
  get transferActive(): boolean { return Boolean(this.incomingFile || this.outgoingFile) }
  getSelectedCandidatePair(): CandidatePairInfo | null { return this.latestCandidatePair }
  on<K extends EventName>(event: K, handler: Handler<K>): () => void {
    const handlers = this.listeners.get(event) || new Set()
    handlers.add(handler as Handler<EventName>); this.listeners.set(event, handlers)
    return () => { handlers.delete(handler as Handler<EventName>) }
  }
  private emit<K extends EventName>(event: K, value: FileShareEvents[K]): void { this.listeners.get(event)?.forEach(handler => (handler as Handler<K>)(value)) }
  private setState(value: FileShareState): void { this.stateValue = value; this.emit('state', value) }
  private reportError(error: unknown): void { this.emit('error', asError(error)) }
  private fail(error: unknown): void { const normalized = asError(error); this.cleanup(normalized); this.setState('error'); this.reportError(normalized) }
  private readonly onGattDisconnected = () => {
    if (this.channel?.readyState === 'open') { this.releaseBluetooth(); return }
    this.fail(new Error('Bluetooth disconnected before the direct connection was ready. Reopen File sharing on the device, then reconnect.'))
  }
  private releaseBluetooth(): void {
    // GATT is only the connection bootstrap. Releasing the radio after SDP
    // exchange avoids competing with the Wi-Fi file transfer on shared radios.
    clearTimeout(this.frameTimer)
    this.decoder.reset()
    this.tx?.removeEventListener('characteristicvaluechanged', this.onNotification)
    const device = this.bluetoothDevice
    device?.removeEventListener('gattserverdisconnected', this.onGattDisconnected)
    this.rx = null; this.tx = null; this.bluetoothDevice = null
    // Web Bluetooth can leave connect() pending while gatt.connected is still
    // false. Disconnect unconditionally and keep the per-device teardown
    // barrier alive so a later session cannot race this one.
    if (device) {
      const teardown = teardownBluetooth(device)
      this.bluetoothTeardown = teardown
      void teardown.finally(() => {
        if (this.bluetoothTeardown === teardown) this.bluetoothTeardown = null
      }).catch(() => {})
    }
  }
  private releaseBluetoothWhenReady(): void {
    if (this.remoteAnswerSet && this.channel?.readyState === 'open') this.releaseBluetooth()
  }
  private readonly onNotification = (event: Event) => {
    try {
      const value = (event.target as unknown as BluetoothCharacteristic).value
      if (!value) throw new Error('Empty Bluetooth notification.')
      const envelope = this.decoder.push(value)
      clearTimeout(this.frameTimer)
      if (this.decoder.pending) this.frameTimer = setTimeout(() => this.fail(new Error('Bluetooth signaling frame timed out.')), BLE_FRAME_TIMEOUT)
      if (!envelope) return
      const generation = this.generation
      this.signalReceiveQueue = this.signalReceiveQueue.then(async () => { if (generation === this.generation) await this.handleSignal(envelope) }).catch(error => { if (generation === this.generation) this.fail(error) })
    } catch (error) { this.fail(error) }
  }
  async discoverDevice(): Promise<DeviceInfo> {
    const bluetooth = (typeof navigator !== 'undefined' ? navigator : undefined) as BluetoothNavigator | undefined
    if (!bluetooth?.bluetooth) throw new Error('Web Bluetooth is unavailable. Use a supported browser over HTTPS or localhost.')
    await this.cleanup(cancelled())
    const generation = this.generation
    this.setState('discovering')
    try {
      /* The service UUID is in the primary advertisement while LocalName is
       * in scan response data. Filter on the UUID so controllers that do not
       * expose scan-response names to Web Bluetooth can still discover the
       * device; validate the name after the chooser returns. */
      const device = await bluetooth.bluetooth.requestDevice({
        filters: [{ services: [FILE_SHARE_SERVICE_UUID] }],
        optionalServices: [FILE_SHARE_SERVICE_UUID],
      })
      if (generation !== this.generation) throw cancelled()
      if (!device.gatt) throw new Error('This device does not provide a Bluetooth GATT connection.')
      // A prior FileShareSession may still be finishing a disconnect, or a
      // timed-out connect may still be pending in Chrome. Wait for that
      // per-device barrier before starting another connect.
      await prepareBluetoothDevice(device)
      this.bluetoothDevice = device
      device.addEventListener('gattserverdisconnected', this.onGattDisconnected)
      const gattStep = <T>(stage: string, operation: () => Promise<T>): Promise<T> => waitWithTimeout(
        runGattOperation(stage, operation).then(value => {
          if (generation !== this.generation) {
            if (this.bluetoothDevice !== device) device.gatt?.disconnect()
            throw cancelled()
          }
          return value
        }), this.config.gattTimeoutMs, gattTimeoutMessage(stage, device.name), this.lifecycle.signal)
      const lifecycle = bluetoothLifecycle(device)
      const connectPromise = device.gatt!.connect()
      lifecycle.pendingConnect = connectPromise
      connectPromise.finally(() => {
        if (lifecycle.pendingConnect === connectPromise) lifecycle.pendingConnect = undefined
      }).catch(() => {})
      const server = await gattStep('GATT connection', () => connectPromise)
      const service = await gattStep('service discovery', () => server.getPrimaryService(FILE_SHARE_SERVICE_UUID))
      const rx = await gattStep('RX characteristic discovery', () => service.getCharacteristic(FILE_SHARE_RX_UUID))
      const tx = await gattStep('TX characteristic discovery', () => service.getCharacteristic(FILE_SHARE_TX_UUID))
      if (generation !== this.generation) { device.gatt.disconnect(); throw cancelled() }
      this.rx = rx; this.tx = tx
      tx.addEventListener('characteristicvaluechanged', this.onNotification)
      await gattStep('notification setup', () => tx.startNotifications())
      if (generation !== this.generation) throw cancelled()
      const info = { id: device.id, name: device.name }
      this.emit('device', info)
      this.offerRequested = true
      this.setState('signaling')
      this.connectionTimer = setTimeout(() => this.fail(new Error('The device did not start a direct connection. Reopen File sharing on the device and try again.')), 30000)
      await this.sendSignal('session.hello', {})
      return info
    } catch (error) { if (generation === this.generation) this.fail(error); throw error }
  }
  private sendSignal<T>(type: SignalMessageType, payload: T): Promise<void> {
    const envelope = createSignalEnvelope(type, this.sessionId, payload)
    const frames = encodeBleSignal(envelope)
    const rx = this.rx
    const generation = this.generation
    const operation = this.signalSendQueue.then(async () => {
      if (!rx || generation !== this.generation || !this.bluetoothDevice?.gatt?.connected) throw new Error('The Bluetooth signaling connection is closed.')
      this.emit('signal', envelope)
      for (const [index, frame] of frames.entries()) {
        if (generation !== this.generation) throw cancelled()
        if (index > 0) await wait(GATT_FRAME_INTERVAL)
        let lastError: unknown
        for (let attempt = 0; attempt < GATT_WRITE_RETRIES; attempt += 1) {
          try {
            await waitWithTimeout(runGattOperation(`signaling write ${index + 1}/${frames.length}`, () => writeGattValue(rx, frame)), BLE_FRAME_TIMEOUT, 'Bluetooth signaling write timed out.', this.lifecycle.signal)
            lastError = undefined
            break
          } catch (error) {
            lastError = error
            if (!transientGattWrite(error) || attempt + 1 === GATT_WRITE_RETRIES) throw error
            await wait(20 * (attempt + 1))
            if (generation !== this.generation) throw cancelled()
          }
        }
        if (lastError) throw lastError
      }
    })
    this.signalSendQueue = operation.catch(() => {})
    return operation
  }
  private async gatherIce(peer: RTCPeerConnection): Promise<void> {
    if (peer.iceGatheringState === 'complete') return
    let onChange!: () => void
    const done = new Promise<void>(resolve => { onChange = () => { if (peer.iceGatheringState === 'complete') resolve() }; peer.addEventListener('icegatheringstatechange', onChange); onChange() })
    try { await waitWithTimeout(done, 10000, 'Local network address discovery timed out.', this.lifecycle.signal) }
    finally { peer.removeEventListener('icegatheringstatechange', onChange) }
  }
  private async negotiateOffer(): Promise<void> {
    if (!this.offerRequested || this.offerSent) return
    this.offerSent = true
    this.ensurePeer()
    const peer = this.peer!
    const generation = this.generation
    clearTimeout(this.connectionTimer)
    this.connectionTimer = setTimeout(() => this.fail(new Error('Direct connection timed out. Put both devices on the same local network and check Wi-Fi client isolation.')), 45000)
    this.setState('connecting')
    await peer.setLocalDescription(await peer.createOffer())
    await this.gatherIce(peer)
    if (generation === this.generation) await this.sendSignal('sdp.offer', { description: peer.localDescription })
  }
  async handleSignal(envelope: SignalEnvelope): Promise<void> {
    if (envelope.sessionId !== this.sessionId) return
    switch (envelope.type) {
      case 'session.accepted': await this.negotiateOffer(); break
      case 'sdp.answer': {
        if (!this.peer || !this.offerSent) throw new Error('Unexpected WebRTC answer before negotiation.')
        const payload = envelope.payload as { description?: RTCSessionDescriptionInit }
        const description = payload.description
        if (!description || description.type !== 'answer' || typeof description.sdp !== 'string') throw new Error('Invalid WebRTC answer.')
        await this.peer.setRemoteDescription(description)
        for (const candidate of this.pendingCandidates.splice(0)) await this.peer.addIceCandidate(candidate)
        this.remoteAnswerSet = true
        this.releaseBluetoothWhenReady()
        break
      }
      case 'ice.candidate': {
        if (!this.offerSent || !this.peer) throw new Error('Unexpected network candidate before negotiation.')
        const candidate = (envelope.payload as { candidate?: RTCIceCandidateInit }).candidate
        if (candidate) {
          if (typeof candidate.candidate !== 'string' || /\btyp relay\b/.test(candidate.candidate)) throw new Error('Relay candidates are not allowed for local file sharing.')
          if (this.peer.remoteDescription) await this.peer.addIceCandidate(candidate)
          else this.pendingCandidates.push(candidate)
        }
        break
      }
      case 'session.error': {
        const payload = envelope.payload as { message?: string }
        throw new Error(String(payload.message || 'The device rejected the connection.'))
      }
      case 'session.close': this.cleanup(new Error('The device closed the session.')); this.setState('idle'); break
      default: throw new Error('Unexpected Bluetooth signaling message.')
    }
  }
  private ensurePeer(): void {
    if (this.peer) return
    if (typeof RTCPeerConnection === 'undefined') throw new Error('WebRTC is unavailable in this browser.')
    const peer = new RTCPeerConnection({ iceServers: [] })
    this.peer = peer
    peer.addEventListener('connectionstatechange', () => {
      if (this.peer !== peer) return
      if (peer.connectionState === 'failed' || peer.connectionState === 'disconnected' || peer.connectionState === 'closed') this.fail(new Error('The direct connection was lost. Reconnect while both devices are on the same local network.'))
    })
    peer.addEventListener('iceconnectionstatechange', () => { if (this.peer === peer && peer.iceConnectionState === 'failed') this.fail(new Error('No local network path was found. Check that both devices share a network without client isolation.')) })
    this.bindChannel(peer.createDataChannel('file-share', { ordered: true }))
  }
  private bindChannel(channel: RTCDataChannel): void {
    this.channel = channel
    channel.binaryType = 'arraybuffer'
    channel.bufferedAmountLowThreshold = this.config.lowWaterMark
    channel.addEventListener('open', () => {
      if (this.channel !== channel) return
      clearTimeout(this.connectionTimer)
      this.setState('connected')
      this.releaseBluetoothWhenReady()
      void this.updateCandidatePair().catch(error => this.reportError(error))
    })
    channel.addEventListener('message', event => {
      const generation = this.generation
      this.dataReceiveQueue = this.dataReceiveQueue.then(async () => { if (generation === this.generation) await this.handleData(event.data) }).catch(error => {
        if (generation !== this.generation) return
        if (this.incomingFile) this.rejectIncoming(asError(error))
        else this.fail(error)
      })
    })
    channel.addEventListener('error', () => { if (this.channel === channel) this.fail(new Error('The file data channel failed.')) })
    channel.addEventListener('close', () => { if (this.channel === channel) { this.cleanup(new Error('The direct connection was closed.')); this.setState('idle') } })
  }
  private async updateCandidatePair(): Promise<void> {
    const peer = this.peer
    if (!peer) return
    const stats = await peer.getStats()
    if (this.peer !== peer) return
    let selected: RTCIceCandidatePairStats | undefined
    stats.forEach(report => {
      if (report.type === 'transport' && report.selectedCandidatePairId) selected = stats.get(report.selectedCandidatePairId) as RTCIceCandidatePairStats
    })
    if (!selected) stats.forEach(report => { if (report.type === 'candidate-pair' && (report.selected || (report.state === 'succeeded' && report.nominated))) selected = report as RTCIceCandidatePairStats })
    if (!selected) return
    const local = stats.get(selected.localCandidateId) as RTCIceCandidateStats | undefined
    const remote = stats.get(selected.remoteCandidateId) as RTCIceCandidateStats | undefined
    const kind: CandidatePairInfo['kind'] = local?.candidateType === 'relay' || remote?.candidateType === 'relay' ? 'relay' : local || remote ? 'direct' : 'unknown'
    this.latestCandidatePair = { kind, protocol: local?.protocol || remote?.protocol, localType: local?.candidateType, remoteType: remote?.candidateType, currentRoundTripTime: selected.currentRoundTripTime }
    this.emit('candidatePair', this.latestCandidatePair)
    if (kind === 'relay') this.fail(new Error('A relay path is not allowed for local file sharing.'))
  }
  private sendControl(value: Record<string, unknown>): void {
    if (!this.channel || this.channel.readyState !== 'open') throw new Error('The direct data channel is not connected.')
    this.channel.send(JSON.stringify(value))
  }
  private sendControlIfOpen(value: Record<string, unknown>): void { if (this.channel?.readyState === 'open') { try { this.sendControl(value) } catch { /* A concurrent close will reject the active transfer. */ } } }
  private progress(metadata: FileTransferMetadata, direction: TransferProgress['direction'], transferredBytes: number): void { this.emit('fileProgress', { direction, fileId: metadata.fileId, fileName: metadata.fileName, totalBytes: metadata.fileSize, transferredBytes }) }
  async sendFile(file: File): Promise<void> {
    const channel = this.channel
    if (!channel || channel.readyState !== 'open') throw new Error('The direct data channel is not connected.')
    if (this.transferActive) throw new Error('Wait for the current transfer to finish or cancel it.')
    if (file.size > this.config.maxFileSize) throw new Error(`This file exceeds the ${Math.round(this.config.maxFileSize / 1024 / 1024)} MiB browser limit.`)
    const remoteLimit = this.peer?.sctp?.maxMessageSize
    const chunkSize = Math.min(this.config.chunkSize, remoteLimit && Number.isFinite(remoteLimit) ? remoteLimit - 4 : this.config.chunkSize)
    if (chunkSize < 1) throw new Error('The device cannot accept file data messages.')
    const metadata: FileTransferMetadata = { sessionId: this.sessionId, fileId: crypto.randomUUID(), fileName: file.name, fileSize: file.size, chunkSize, sha256: '' }
    const outgoing: OutgoingFile = { metadata, abort: new AbortController(), accepted: deferred<void>(), received: deferred<void>(), sentChunks: 0, creditChunks: 0, creditTarget: 0, credit: deferred<void>(), phase: 'awaiting-approval' }
    this.outgoingFile = outgoing
    this.setState('transferring'); this.progress(metadata, 'send', 0)
    try {
      metadata.sha256 = await sha256(file)
      outgoing.abort.signal.throwIfAborted()
      this.validateMetadata(metadata)
      this.sendControl({ kind: 'file-start', metadata })
      this.emit('fileStart', metadata)
      this.setState('awaiting-approval')
      await waitWithTimeout(outgoing.accepted.promise, this.config.approvalTimeoutMs, 'The device did not confirm this file in time.', outgoing.abort.signal)
      this.setState('transferring')
      outgoing.phase = 'sending'
      let seq = 0
      for (let offset = 0; offset < file.size; offset += chunkSize) {
        outgoing.abort.signal.throwIfAborted()
        const chunk = new Uint8Array(await file.slice(offset, offset + chunkSize).arrayBuffer())
        const packet = new Uint8Array(chunk.length + 4)
        new DataView(packet.buffer).setUint32(0, seq)
        packet.set(chunk, 4)
        await this.waitForBuffer(channel, outgoing.abort.signal)
        outgoing.abort.signal.throwIfAborted()
        outgoing.sentChunks = seq + 1
        channel.send(packet.buffer)
        this.progress(metadata, 'send', offset + chunk.length)
        seq += 1
        if (seq % 32 === 0 && offset + chunk.length < file.size && outgoing.creditChunks < seq) {
          outgoing.creditTarget = seq
          outgoing.credit = deferred<void>()
          await waitWithTimeout(outgoing.credit.promise, this.config.transferTimeoutMs, 'The device stopped acknowledging file data.', outgoing.abort.signal)
        }
      }
      await this.waitForBuffer(channel, outgoing.abort.signal)
      outgoing.abort.signal.throwIfAborted()
      outgoing.phase = 'finishing'
      this.sendControl({ kind: 'file-complete', fileId: metadata.fileId, chunks: seq })
      this.setState('verifying')
      await waitWithTimeout(outgoing.received.promise, this.config.transferTimeoutMs, 'The device did not confirm that the file was saved.', outgoing.abort.signal)
      outgoing.abort.signal.throwIfAborted()
      if (this.outgoingFile === outgoing && this.channel === channel) this.setState('completed')
    } catch (error) {
      // A cancelled hash/read can finish after another transfer or session starts.
      // cancelTransfer already notified the peer; stale work must not send again.
      if (this.outgoingFile === outgoing && this.channel === channel) {
        this.sendControlIfOpen({ kind: 'file-cancel', fileId: metadata.fileId })
        if (channel.readyState === 'open') this.setState('connected')
      }
      throw error
    } finally { if (this.outgoingFile === outgoing) this.outgoingFile = null }
  }
  private waitForBuffer(channel: RTCDataChannel, signal: AbortSignal): Promise<void> {
    if (signal.aborted) return Promise.reject(signal.reason)
    if (channel.readyState !== 'open') return Promise.reject(new Error('The direct data channel is closed.'))
    if (channel.bufferedAmount <= this.config.highWaterMark) return Promise.resolve()
    return new Promise((resolve, reject) => {
      const clean = () => { clearTimeout(timer); channel.removeEventListener('bufferedamountlow', onLow); channel.removeEventListener('close', onClose); channel.removeEventListener('error', onClose); signal.removeEventListener('abort', onAbort) }
      const onLow = () => { clean(); resolve() }
      const onClose = () => { clean(); reject(new Error('The direct data channel closed during transfer.')) }
      const onAbort = () => { clean(); reject(signal.reason) }
      const timer = setTimeout(() => { clean(); reject(new Error('The file transfer stalled.')) }, this.config.transferTimeoutMs)
      channel.addEventListener('bufferedamountlow', onLow)
      channel.addEventListener('close', onClose, { once: true })
      channel.addEventListener('error', onClose, { once: true })
      signal.addEventListener('abort', onAbort, { once: true })
      if (signal.aborted) onAbort()
      else if (channel.readyState !== 'open') onClose()
      else if (channel.bufferedAmount <= this.config.lowWaterMark) onLow()
    })
  }
  private validateMetadata(value: unknown): asserts value is FileTransferMetadata {
    if (!isRecord(value) || value.sessionId !== this.sessionId || typeof value.fileId !== 'string' || !value.fileId || value.fileId.length > 128 || typeof value.fileName !== 'string' || !value.fileName || value.fileName === '.' || value.fileName === '..' || /[\\/\x00-\x1f\x7f]/.test(value.fileName) || new TextEncoder().encode(value.fileName).length > 255 || !Number.isSafeInteger(value.fileSize) || Number(value.fileSize) < 0 || Number(value.fileSize) > this.config.maxFileSize || !Number.isSafeInteger(value.chunkSize) || Number(value.chunkSize) < 1 || Number(value.chunkSize) > 1024 * 1024 || typeof value.sha256 !== 'string' || !/^[a-f0-9]{64}$/.test(value.sha256)) throw new Error('Invalid file metadata or file exceeds the browser limit.')
  }
  private armIncomingTimeout(incoming: IncomingFile): void {
    clearTimeout(incoming.timer)
    incoming.timer = setTimeout(() => { if (this.incomingFile === incoming) this.rejectIncoming(new Error('The incoming file transfer timed out.')) }, this.config.transferTimeoutMs)
  }
  private rejectIncoming(error: Error): void {
    if (this.incomingFile) {
      this.sendControlIfOpen({ kind: 'file-error', fileId: this.incomingFile.metadata.fileId, message: error.message })
      clearTimeout(this.incomingFile.timer); this.incomingFile = null
    }
    if (this.channel?.readyState === 'open') this.setState('connected')
    this.reportError(error)
  }
  private async handleData(data: unknown): Promise<void> {
    if (typeof data === 'string') {
      if (data.length > 8192) throw new Error('File control message exceeds its limit.')
      const message: unknown = JSON.parse(data)
      if (!isRecord(message) || typeof message.kind !== 'string') throw new Error('Invalid file control message.')
      const outgoing = this.outgoingFile
      if (message.kind === 'file-pending') {
        if (outgoing && message.fileId === outgoing.metadata.fileId) {
          if (message.fileName !== outgoing.metadata.fileName || message.fileSize !== outgoing.metadata.fileSize) {
            outgoing.abort.abort(new Error('The device confirmation does not match this file.'))
          } else if (outgoing.phase === 'awaiting-approval') {
            this.setState('awaiting-approval')
          }
        }
        return
      }
      if (message.kind === 'file-accepted') {
        if (outgoing && message.fileId === outgoing.metadata.fileId && outgoing.phase === 'awaiting-approval') outgoing.accepted.resolve()
        return
      }
      if (message.kind === 'file-progress') {
        if (outgoing && message.fileId === outgoing.metadata.fileId) {
          const chunks = Number(message.chunks)
          if (typeof message.chunks !== 'number' || !Number.isSafeInteger(chunks) || chunks < outgoing.creditChunks || chunks > outgoing.sentChunks || message.receivedBytes !== Math.min(chunks * outgoing.metadata.chunkSize, outgoing.metadata.fileSize)) {
            outgoing.abort.abort(new Error('The device returned invalid transfer progress.'))
          } else {
            outgoing.creditChunks = chunks
            if (chunks >= outgoing.creditTarget) outgoing.credit.resolve()
          }
        }
        return
      }
      if (message.kind === 'file-received') {
        if (outgoing && message.fileId === outgoing.metadata.fileId) {
          if (outgoing.phase !== 'finishing' || message.size !== outgoing.metadata.fileSize || message.sha256 !== outgoing.metadata.sha256) outgoing.received.reject(new Error('The device returned an invalid file verification result.'))
          else outgoing.received.resolve()
        }
        return
      }
      if (message.kind === 'file-error') {
        if (outgoing && message.fileId === outgoing.metadata.fileId) { const error = new Error(String(message.message || 'The device rejected the file.')); outgoing.abort.abort(error); outgoing.accepted.reject(error); outgoing.received.reject(error) }
        return
      }
      if (message.kind === 'file-cancelled') {
        // This acknowledges a previous file-cancel. It can arrive after a new
        // transfer starts, so it never changes the current transfer or state.
        if (typeof message.fileId !== 'string' || !message.fileId || message.fileId.length > 128) throw new Error('Invalid file cancellation acknowledgement.')
        return
      }
      if (message.kind === 'file-cancel') {
        if (outgoing && message.fileId === outgoing.metadata.fileId) outgoing.abort.abort(cancelled())
        if (this.incomingFile && message.fileId === this.incomingFile.metadata.fileId) { clearTimeout(this.incomingFile.timer); this.incomingFile = null; this.setState('connected') }
        return
      }
      if (message.kind === 'file-start') {
        const fileId = isRecord(message.metadata) && typeof message.metadata.fileId === 'string' ? message.metadata.fileId : ''
        try {
          if (this.transferActive) throw new Error('Another file transfer is already active.')
          this.validateMetadata(message.metadata)
        } catch (error) { this.sendControlIfOpen({ kind: 'file-error', fileId, message: asError(error).message }); this.reportError(error); return }
        const incoming: IncomingFile = { metadata: message.metadata, chunks: [], receivedBytes: 0, nextSeq: 0 }
        this.incomingFile = incoming
        this.armIncomingTimeout(incoming)
        this.setState('transferring'); this.emit('fileStart', incoming.metadata); this.progress(incoming.metadata, 'receive', 0)
        this.sendControl({ kind: 'file-accepted', fileId: incoming.metadata.fileId })
        return
      }
      if (message.kind === 'file-complete') {
        const incoming = this.incomingFile
        if (!incoming || message.fileId !== incoming.metadata.fileId) throw new Error('Unexpected file completion message.')
        if (message.chunks !== incoming.nextSeq || incoming.receivedBytes !== incoming.metadata.fileSize) throw new Error('The received file is incomplete or has an invalid chunk count.')
        clearTimeout(incoming.timer)
        this.setState('verifying')
        const blob = new Blob(incoming.chunks)
        const digest = await sha256(blob)
        if (this.incomingFile !== incoming) return
        if (digest !== incoming.metadata.sha256) throw new Error('The received file failed SHA-256 verification.')
        this.sendControl({ kind: 'file-received', fileId: incoming.metadata.fileId, fileName: incoming.metadata.fileName, size: blob.size, sha256: digest })
        this.incomingFile = null
        this.emit('fileComplete', { fileId: incoming.metadata.fileId, fileName: incoming.metadata.fileName, size: blob.size, sha256: digest, blob })
        this.setState('completed')
        return
      }
      throw new Error('Unknown file control message.')
    }
    const incoming = this.incomingFile
    if (!incoming) throw new Error('File data arrived without an accepted transfer.')
    const packet = data instanceof ArrayBuffer ? data : data instanceof Blob ? await data.arrayBuffer() : ArrayBuffer.isView(data) ? new Uint8Array(data.buffer, data.byteOffset, data.byteLength).slice().buffer : null
    if (this.incomingFile !== incoming) return
    if (!packet || packet.byteLength <= 4) throw new Error('Invalid file data frame.')
    const seq = new DataView(packet).getUint32(0)
    const expectedLength = Math.min(incoming.metadata.chunkSize, incoming.metadata.fileSize - incoming.receivedBytes)
    if (seq !== incoming.nextSeq || packet.byteLength - 4 !== expectedLength) throw new Error('The received file chunks have an invalid order or size.')
    incoming.chunks.push(packet.slice(4)); incoming.receivedBytes += packet.byteLength - 4; incoming.nextSeq += 1
    this.armIncomingTimeout(incoming)
    this.progress(incoming.metadata, 'receive', incoming.receivedBytes)
    if (incoming.nextSeq % 32 === 0) this.sendControl({ kind: 'file-progress', fileId: incoming.metadata.fileId, chunks: incoming.nextSeq, receivedBytes: incoming.receivedBytes })
  }
  cancelTransfer(): boolean {
    const outgoing = this.outgoingFile
    // Once file-complete has been sent, the receiver may already have committed
    // the file. Keep awaiting its result rather than claiming it was cancelled.
    if (outgoing?.phase === 'finishing' || this.stateValue === 'verifying') return false
    if (!outgoing && !this.incomingFile) return false
    if (outgoing) { this.sendControlIfOpen({ kind: 'file-cancel', fileId: outgoing.metadata.fileId }); outgoing.abort.abort(cancelled()); this.outgoingFile = null }
    if (this.incomingFile) { this.sendControlIfOpen({ kind: 'file-cancel', fileId: this.incomingFile.metadata.fileId }); clearTimeout(this.incomingFile.timer); this.incomingFile = null }
      if (this.channel?.readyState === 'open') this.setState('connected')
    return true
  }
  private async cleanup(reason: Error): Promise<void> {
    this.generation += 1
    this.lifecycle.abort(reason); this.lifecycle = new AbortController()
    clearTimeout(this.frameTimer); clearTimeout(this.connectionTimer)
    if (this.incomingFile) clearTimeout(this.incomingFile.timer)
    this.incomingFile = null
    if (this.outgoingFile) { this.outgoingFile.abort.abort(reason); this.outgoingFile.accepted.reject(reason); this.outgoingFile.received.reject(reason); this.outgoingFile = null }
    const channel = this.channel; this.channel = null; channel?.close()
    const peer = this.peer; this.peer = null; peer?.close()
    const bluetoothDevice = this.bluetoothDevice
    this.releaseBluetooth()
    this.decoder.reset(); this.pendingCandidates = []; this.remoteAnswerSet = false; this.offerRequested = false; this.offerSent = false; this.latestCandidatePair = null
    this.signalSendQueue = Promise.resolve(); this.signalReceiveQueue = Promise.resolve(); this.dataReceiveQueue = Promise.resolve()
    if (bluetoothDevice) await teardownBluetooth(bluetoothDevice)
    if (this.bluetoothTeardown) await this.bluetoothTeardown
  }
  async close(): Promise<void> {
    this.cancelTransfer()
    const device = this.bluetoothDevice
    const lifecycle = device ? bluetoothLifecycle(device) : undefined
    let resolveClosing: (() => void) | undefined
    const closing = lifecycle ? new Promise<void>(resolve => { resolveClosing = resolve }) : undefined
    if (lifecycle && closing) lifecycle.closing = closing
    try {
      if (this.rx && device?.gatt?.connected) {
        try { await waitWithTimeout(this.sendSignal('session.close', {}), 2000, 'Disconnecting Bluetooth timed out.') } catch { /* Local cleanup must not depend on the peer. */ }
      }
      await this.cleanup(cancelled()); this.setState('idle')
    } finally {
      resolveClosing?.()
    if (lifecycle && lifecycle.closing === closing) lifecycle.closing = undefined
    }
  }
}
