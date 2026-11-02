<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useData } from 'vitepress'
import { FileShareSession, type CandidatePairInfo, type DeviceInfo, type FileShareState, type ReceivedFile, type TransferProgress } from '../lib/fileShare'

const { lang } = useData()
const isZh = computed(() => lang.value.startsWith('zh'))
const copy = computed(() => isZh.value ? {
  title: '浏览器直连文件共享', kicker: 'LILYGO UI / 文件共享',
  intro: '选择附近的 LILYGO 设备后自动建立蓝牙和局域网直连。每次发送前，设备都会显示文件信息并要求确认。无需填写信令服务器地址。',
  support: '运行环境', secure: '安全上下文', secureYes: 'HTTPS 或 localhost', secureNo: '需要 HTTPS 或 localhost',
  bluetooth: 'Web Bluetooth', bluetoothYes: '浏览器支持', bluetoothNo: '当前浏览器不可用',
  noSupport: '请使用支持 Web Bluetooth 的浏览器，例如桌面版 Chrome 或 Edge，并允许蓝牙访问。',
  network: '开始前，请让电脑和设备连接到同一局域网，并在设备的快捷控制中打开“文件共享”。访客 Wi-Fi 或客户端隔离可能阻止直连。',
  discover: '连接附近设备', discovering: '正在连接…', connecting: '正在建立直连…', disconnect: '断开连接',
  noDevice: '请先打开设备上的文件共享，然后连接附近设备。', selectedDevice: '正在建立加密直连', pairedDevice: '局域网直连已建立',
  chooseFile: '选择文件发送', cancel: '取消传输', transfer: '传输进度', ready: '直连建立后即可发送文件',
  sent: '已传输，等待设备确认', received: '已接收', completed: '接收端已完成校验', verifying: '等待接收端完成校验和保存…',
  awaitingApproval: '已发送文件信息，等待设备确认；确认前不会发送文件内容。',
  transferHint: '文件最大 512 MiB，分块传输并校验 SHA-256。设备确认成功后文件保存在当前登录用户的 Downloads 目录。',
  receivedFile: '收到文件', download: '下载到本机', noReceived: '尚未收到文件',
  path: '实际数据路径', pathPending: '建立直连后显示实际选中的网络路径', direct: '局域网直连', relay: '中继不可用', unknown: '待确认', protocol: '协议', candidate: '地址类型',
  directOnly: '蓝牙只负责发现和快速协商，直连建立后会自动断开；文件通过局域网传输。本页不使用 WSS、STUN 或 TURN 服务。',
  security: '逐文件确认', securityText: '设备会在每次发送前显示文件名和大小。只有在设备上点按 Receive file 后浏览器才发送内容；Decline 会拒绝文件。',
  error: '需要处理的问题', clear: '关闭提示',
  states: { idle: '未连接', discovering: '连接蓝牙', signaling: '蓝牙协商', connecting: '建立直连', connected: '直连已建立', transferring: '传输中', 'awaiting-approval': '等待设备确认', verifying: '等待接收确认', completed: '传输完成', error: '连接失败' },
} : {
  title: 'Browser direct file sharing', kicker: 'LILYGO UI / FILE SHARING',
  intro: 'Select a nearby LILYGO device to connect automatically over Bluetooth and your local network. The device confirms each file before any file contents are sent.',
  support: 'Runtime checks', secure: 'Secure context', secureYes: 'HTTPS or localhost', secureNo: 'HTTPS or localhost is required',
  bluetooth: 'Web Bluetooth', bluetoothYes: 'Supported', bluetoothNo: 'Unavailable in this browser',
  noSupport: 'Use a browser that supports Web Bluetooth, such as desktop Chrome or Edge, and allow Bluetooth access.',
  network: 'Connect your computer and device to the same local network. Open File sharing in the device’s Quick controls. Guest Wi-Fi or client isolation can prevent a direct connection.',
  discover: 'Connect nearby device', discovering: 'Connecting…', connecting: 'Establishing direct path…', disconnect: 'Disconnect',
  noDevice: 'Open File sharing on the device, then connect to it over Bluetooth.', selectedDevice: 'Establishing secure direct path', pairedDevice: 'Direct local path ready',
  chooseFile: 'Choose a file to send', cancel: 'Cancel transfer', transfer: 'Transfer progress', ready: 'Connect directly to start sending files',
  sent: 'Transferred; awaiting confirmation', received: 'Received', completed: 'Receiver verification complete', verifying: 'Waiting for receiver verification and save…',
  awaitingApproval: 'File details sent. Waiting for device approval; no file contents have been sent.',
  transferHint: 'Files up to 512 MiB are transferred in chunks and verified with SHA-256. Success means the device saved the file in the signed-in user’s Downloads directory.',
  receivedFile: 'Received file', download: 'Download to this computer', noReceived: 'No received file yet',
  path: 'Selected data path', pathPending: 'The selected network path appears after connection', direct: 'Local direct path', relay: 'Relay unavailable', unknown: 'Pending', protocol: 'Protocol', candidate: 'Address types',
  directOnly: 'Bluetooth handles discovery and connection setup, then disconnects automatically; files travel over the local network. This page uses no WSS, STUN, or TURN service.',
  security: 'Per-file confirmation', securityText: 'The device displays each file name and size before transfer. The browser sends contents only after you select Receive file on the device; Decline rejects it.',
  error: 'Action needed', clear: 'Dismiss',
  states: { idle: 'Not connected', discovering: 'Connecting Bluetooth', signaling: 'Bluetooth negotiation', connecting: 'Connecting directly', connected: 'Direct path ready', transferring: 'Transferring', 'awaiting-approval': 'Awaiting device approval', verifying: 'Awaiting receipt', completed: 'Transfer complete', error: 'Connection failed' },
})

const state = ref<FileShareState>('idle')
const device = ref<DeviceInfo | null>(null)
const pair = ref<CandidatePairInfo | null>(null)
const progress = ref<TransferProgress | null>(null)
const receivedFile = ref<ReceivedFile | null>(null)
const errorMessage = ref('')
const statusMessage = ref('')
const secureContext = ref(false)
const bluetoothAvailable = ref(false)
const disconnecting = ref(false)
let session: FileShareSession | null = null
const unsubscribe: Array<() => void> = []
const stateLabel = computed(() => copy.value.states[state.value])
const pathLabel = computed(() => pair.value?.kind === 'direct' ? copy.value.direct : pair.value?.kind === 'relay' ? copy.value.relay : copy.value.unknown)
const percent = computed(() => progress.value?.totalBytes ? Math.min(100, Math.round(progress.value.transferredBytes / progress.value.totalBytes * 100)) : state.value === 'completed' ? 100 : 0)
const hasDirectConnection = computed(() => ['connected', 'awaiting-approval', 'transferring', 'verifying', 'completed'].includes(state.value))
const canSend = computed(() => (state.value === 'connected' || state.value === 'completed') && !disconnecting.value)
const canCancelTransfer = computed(() => ['awaiting-approval', 'transferring'].includes(state.value))
const canDiscover = computed(() => secureContext.value && bluetoothAvailable.value && ['idle', 'error'].includes(state.value) && !disconnecting.value)

function createSession() {
  const current = new FileShareSession()
  unsubscribe.push(current.on('state', value => {
    state.value = value
    if (['connected', 'transferring', 'completed'].includes(value)) statusMessage.value = ''
    if (value === 'idle' || value === 'error') { device.value = null; pair.value = null }
  }))
  unsubscribe.push(current.on('candidatePair', value => { pair.value = value }))
  unsubscribe.push(current.on('fileProgress', value => { progress.value = value }))
  unsubscribe.push(current.on('fileStart', value => {
    statusMessage.value = isZh.value
      ? `等待设备确认：${value.fileName}（${value.fileSize.toLocaleString()} 字节）`
      : `Waiting for device approval: ${value.fileName} (${value.fileSize.toLocaleString()} bytes)`
  }))
  unsubscribe.push(current.on('fileComplete', value => { receivedFile.value = value }))
  unsubscribe.push(current.on('error', value => { errorMessage.value = value.message; statusMessage.value = '' }))
  unsubscribe.push(current.on('device', value => { device.value = value }))
  session = current
  return current
}
async function discover() {
  errorMessage.value = ''; statusMessage.value = ''; progress.value = null; pair.value = null
  unsubscribe.splice(0).forEach(stop => stop())
  if (session) await session.close()
  try {
    const current = createSession()
    await current.discoverDevice()
    if (session === current && ['signaling', 'connecting'].includes(current.state))
      statusMessage.value = isZh.value ? '正在自动协商局域网直连…' : 'Negotiating a direct local connection…'
  } catch (error) { errorMessage.value = error instanceof Error ? error.message : String(error); state.value = 'error' }
}
async function disconnect() {
  disconnecting.value = true
  try { await session?.close() }
  finally { disconnecting.value = false; device.value = null; pair.value = null; state.value = 'idle'; statusMessage.value = ''; progress.value = null }
}
async function sendFile(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file || !session) return
  errorMessage.value = ''; statusMessage.value = ''
  try { await session.sendFile(file) }
  catch (error) { if (!(error instanceof Error && error.name === 'AbortError')) errorMessage.value = error instanceof Error ? error.message : String(error) }
}
function cancelTransfer() {
  if (!session?.cancelTransfer()) return
  progress.value = null
  statusMessage.value = isZh.value ? '传输已取消，可以选择其他文件。' : 'Transfer cancelled. You can choose another file.'
}
function downloadReceived() {
  if (!receivedFile.value) return
  const url = URL.createObjectURL(receivedFile.value.blob)
  const anchor = document.createElement('a')
  anchor.href = url; anchor.download = receivedFile.value.fileName; anchor.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
onMounted(() => { secureContext.value = window.isSecureContext; bluetoothAvailable.value = Boolean((navigator as Navigator & { bluetooth?: unknown }).bluetooth) })
onBeforeUnmount(() => { unsubscribe.splice(0).forEach(stop => stop()); void session?.close() })
</script>

<template>
  <div class="file-share">
    <header class="file-share-hero">
      <span class="file-share-kicker"><span aria-hidden="true"></span>{{ copy.kicker }}</span>
      <h1>{{ copy.title }}</h1><p>{{ copy.intro }}</p>
      <div class="file-share-hero-tags"><span>Bluetooth discovery</span><span>Device approval</span><span>Local network</span></div>
    </header>
    <div class="file-share-layout">
      <main class="file-share-main">
        <section class="file-share-panel setup-panel" aria-labelledby="setup-title">
          <div class="panel-heading"><div><span class="panel-step">01</span><h2 id="setup-title">{{ copy.support }}</h2></div><span class="state-pill" :class="`state-${state}`">{{ stateLabel }}</span></div>
          <div class="runtime-grid">
            <div class="runtime-item"><span>{{ copy.secure }}</span><strong :class="{ good: secureContext }">{{ secureContext ? copy.secureYes : copy.secureNo }}</strong></div>
            <div class="runtime-item"><span>{{ copy.bluetooth }}</span><strong :class="{ good: bluetoothAvailable }">{{ bluetoothAvailable ? copy.bluetoothYes : copy.bluetoothNo }}</strong></div>
          </div>
          <p class="inline-note">{{ copy.network }}</p>
          <p v-if="!bluetoothAvailable" class="inline-note warning">{{ copy.noSupport }}</p>
        </section>
        <section class="file-share-panel" aria-labelledby="connection-title">
          <div class="panel-heading"><div><span class="panel-step">02</span><h2 id="connection-title">{{ isZh ? '连接设备' : 'Connect your device' }}</h2></div></div>
          <div class="action-row">
            <button class="button primary" :disabled="!canDiscover" @click="discover">{{ state === 'discovering' ? copy.discovering : copy.discover }}</button>
            <button v-if="device || state === 'discovering'" class="button secondary" :disabled="disconnecting" @click="disconnect">{{ copy.disconnect }}</button>
          </div>
          <div v-if="device" class="device-card"><span class="device-mark" aria-hidden="true">⌁</span><div><strong>{{ device.name || 'LILYGO' }}</strong><span>{{ hasDirectConnection ? copy.pairedDevice : copy.selectedDevice }}</span></div><span class="device-check" aria-hidden="true">✓</span></div>
          <p v-else class="inline-note">{{ copy.noDevice }}</p>
          <p v-if="statusMessage" class="inline-note success" aria-live="polite">{{ statusMessage }}</p>
        </section>
        <section class="file-share-panel" aria-labelledby="transfer-title">
          <div class="panel-heading"><div><span class="panel-step">03</span><h2 id="transfer-title">{{ copy.transfer }}</h2></div><label class="button file-button" :class="{ disabled: !canSend }"><input type="file" :disabled="!canSend" @change="sendFile" />{{ copy.chooseFile }}</label></div>
          <div v-if="progress" class="progress-card"><div class="progress-topline"><strong>{{ progress.fileName }}</strong><span>{{ percent }}%</span></div><div class="progress-track"><span :style="{ width: `${percent}%` }"></span></div><div class="progress-meta"><span>{{ progress.transferredBytes.toLocaleString() }} / {{ progress.totalBytes.toLocaleString() }} bytes</span><span>{{ state === 'completed' ? copy.completed : progress.direction === 'send' ? copy.sent : copy.received }}</span></div></div>
          <p v-else class="empty-transfer">{{ copy.ready }}</p>
          <p v-if="state === 'verifying'" class="inline-note" role="status">{{ copy.verifying }}</p>
          <p v-if="state === 'awaiting-approval'" class="inline-note warning" role="status">{{ copy.awaitingApproval }}</p>
          <button v-if="canCancelTransfer" class="text-button" @click="cancelTransfer">{{ copy.cancel }}</button>
          <p class="transfer-hint">{{ copy.transferHint }}</p>
          <div v-if="receivedFile" class="received-card"><div><span>{{ copy.receivedFile }}</span><strong>{{ receivedFile.fileName }}</strong><small>{{ receivedFile.size.toLocaleString() }} bytes · SHA-256 {{ receivedFile.sha256.slice(0, 12) }}…</small></div><button class="text-button" @click="downloadReceived">{{ copy.download }} ↓</button></div>
          <p v-else class="received-empty">{{ copy.noReceived }}</p>
        </section>
        <section v-if="errorMessage" class="file-share-error" role="alert"><strong>{{ copy.error }}</strong><p>{{ errorMessage }}</p><button class="text-button" @click="errorMessage = ''">{{ copy.clear }}</button></section>
      </main>
      <aside class="file-share-side">
        <section class="file-share-panel path-panel" aria-labelledby="path-title"><div class="panel-heading"><div><span class="panel-step">LAN</span><h2 id="path-title">{{ copy.path }}</h2></div><span class="path-badge" :class="`path-${pair?.kind || 'unknown'}`">{{ pathLabel }}</span></div><div v-if="pair" class="path-details"><div><span>{{ copy.protocol }}</span><strong>{{ pair.protocol || 'UDP' }}</strong></div><div><span>{{ copy.candidate }}</span><strong>{{ pair.localType || '—' }} ↔ {{ pair.remoteType || '—' }}</strong></div><div><span>RTT</span><strong>{{ pair.currentRoundTripTime != null ? `${Math.round(pair.currentRoundTripTime * 1000)} ms` : '—' }}</strong></div></div><p v-else class="path-pending">{{ copy.pathPending }}</p><p class="direct-note">{{ copy.directOnly }}</p></section>
        <section class="file-share-panel security-panel"><h2>{{ copy.security }}</h2><p>{{ copy.securityText }}</p></section>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.file-share { --share-ink: #172b3d; --share-muted: #6a7b8b; --share-line: #dce5eb; --share-soft: #f5f9fb; --share-surface: #fff; --share-accent: #20778c; --share-accent-soft: #e9f5f5; max-width: 1180px; margin: 0 auto; padding: 18px 24px 76px; color: var(--share-ink); }
.dark .file-share { --share-ink: #e8eff7; --share-muted: #a2b2c1; --share-line: #30404e; --share-soft: #1b2530; --share-surface: #151c24; --share-accent: #7ed4dc; --share-accent-soft: #203b40; }
.file-share a { color: inherit; text-decoration: none; }.file-share button,.file-share input { font: inherit; }.file-share :is(a,button,input):focus-visible { outline: 3px solid var(--share-accent); outline-offset: 3px; }
.file-share-hero { margin: 25px 0 28px; padding: 34px clamp(24px, 5vw, 52px); border-radius: 20px; color: #f7fcff; background: radial-gradient(circle at 85% 15%, rgba(114, 224, 232, .26), transparent 38%), linear-gradient(128deg, #12202e, #194c62 66%, #236f78); }.file-share-kicker { display: inline-flex; align-items: center; gap: 8px; color: #a7eef0; font-size: 11px; font-weight: 700; letter-spacing: .15em; }.file-share-kicker > span { width: 7px; height: 7px; border-radius: 50%; background: #7ef0c0; box-shadow: 0 0 0 5px rgba(126, 240, 192, .12); }.file-share-hero h1 { margin: 14px 0 12px; color: #fff; font-size: clamp(30px, 4vw, 46px); line-height: 1.18; letter-spacing: -.04em; }.file-share-hero p { max-width: 790px; margin: 0; color: rgba(247, 252, 255, .78); font-size: 15px; line-height: 1.8; }.file-share-hero-tags { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 22px; }.file-share-hero-tags span { padding: 5px 9px; border: 1px solid rgba(173, 244, 244, .3); border-radius: 999px; color: #c3f6f6; font-size: 11px; }
.file-share-layout { display: grid; grid-template-columns: minmax(0, 1.5fr) minmax(280px, .8fr); gap: 18px; align-items: start; }.file-share-main,.file-share-side { display: grid; gap: 18px; }.file-share-side { position: sticky; top: 88px; }.file-share-panel { padding: 23px; border: 1px solid var(--share-line); border-radius: 15px; background: var(--share-surface); }.panel-heading { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; }.panel-heading > div { display: flex; align-items: center; gap: 11px; }.panel-heading h2,.security-panel h2 { margin: 0; font-size: 16px; line-height: 1.45; letter-spacing: -.01em; }.panel-step { display: inline-grid; place-items: center; min-width: 32px; height: 24px; padding: 0 6px; border-radius: 6px; color: var(--share-accent); background: var(--share-accent-soft); font-size: 10px; font-weight: 750; letter-spacing: .08em; }.state-pill,.path-badge { display: inline-flex; align-items: center; min-height: 24px; padding: 3px 9px; border-radius: 999px; color: var(--share-muted); background: var(--share-soft); font-size: 10px; font-weight: 650; white-space: nowrap; }.state-connected,.state-completed { color: #16704d; background: #e5f6ee; }.state-transferring,.state-verifying,.state-connecting,.state-signaling,.state-awaiting-approval { color: #8d5a0c; background: #fff4db; }.state-error { color: #aa3c3c; background: #ffebeb; }.dark .state-connected,.dark .state-completed { color: #78e3ad; background: #1c3e30; }.dark .state-error { color: #ffaaaa; background: #4a2727; }
.runtime-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; margin-top: 20px; }.runtime-item { display: grid; gap: 6px; padding: 13px; border: 1px solid var(--share-line); border-radius: 10px; background: var(--share-soft); }.runtime-item span,.field > span,.path-details span,.received-card span { color: var(--share-muted); font-size: 11px; }.runtime-item strong { font-size: 12px; font-weight: 600; line-height: 1.5; }.runtime-item strong.good { color: var(--share-accent); }.inline-note,.empty-transfer,.received-empty,.path-pending { margin: 16px 0 0; color: var(--share-muted); font-size: 12px; line-height: 1.7; }.inline-note.warning { color: #8d5a0c; }.inline-note.success { color: #168052; }
.field-grid { display: grid; gap: 12px; margin-top: 21px; }.field { display: grid; gap: 7px; }.field input { min-height: 42px; padding: 8px 11px; border: 1px solid var(--share-line); border-radius: 8px; outline: 0; color: var(--share-ink); background: var(--share-soft); font-size: 13px; }.field input:focus { border-color: var(--share-accent); box-shadow: 0 0 0 2px var(--share-accent-soft); }.action-row { display: flex; flex-wrap: wrap; gap: 9px; margin-top: 17px; }.button { display: inline-flex; align-items: center; justify-content: center; min-height: 40px; padding: 8px 14px; border: 1px solid var(--share-line); border-radius: 8px; cursor: pointer; font-size: 12px; font-weight: 650; }.button.primary { border-color: #206b7c; color: #fff; background: #206b7c; }.button.primary:hover { background: #185867; }.button.secondary { color: var(--share-accent); background: var(--share-accent-soft); }.button:disabled,.button.disabled { opacity: .45; cursor: not-allowed; }.file-button input { position: absolute; width: 1px; height: 1px; opacity: 0; pointer-events: none; }.device-card { display: flex; align-items: center; gap: 12px; margin-top: 18px; padding: 13px; border: 1px solid rgba(39, 142, 153, .35); border-radius: 10px; background: var(--share-accent-soft); }.device-mark { display: grid; place-items: center; width: 31px; height: 31px; border-radius: 8px; color: var(--share-accent); background: var(--share-surface); font-size: 20px; }.device-card > div { min-width: 0; flex: 1; }.device-card strong,.device-card span { display: block; overflow-wrap: anywhere; }.device-card strong { font-size: 13px; }.device-card div span { margin-top: 2px; color: var(--share-muted); font-size: 11px; }.device-check { color: #168052; font-weight: 700; }
.progress-card { margin-top: 20px; padding: 16px; border: 1px solid var(--share-line); border-radius: 10px; background: var(--share-soft); }.progress-topline,.progress-meta { display: flex; justify-content: space-between; gap: 12px; }.progress-topline { font-size: 13px; }.progress-topline span { color: var(--share-accent); font-variant-numeric: tabular-nums; }.progress-track { height: 8px; margin: 13px 0 9px; overflow: hidden; border-radius: 999px; background: var(--share-line); }.progress-track span { display: block; height: 100%; border-radius: inherit; background: linear-gradient(90deg, #37a9a8, #70d6be); transition: width .18s ease; }.progress-meta { color: var(--share-muted); font-size: 10px; }.transfer-hint { margin: 15px 0 0; color: var(--share-muted); font-size: 11px; line-height: 1.7; }.received-card { display: flex; align-items: center; justify-content: space-between; gap: 14px; margin-top: 17px; padding-top: 16px; border-top: 1px solid var(--share-line); }.received-card > div { min-width: 0; }.received-card strong,.received-card small { display: block; overflow-wrap: anywhere; }.received-card strong { margin-top: 3px; font-size: 13px; }.received-card small { margin-top: 4px; color: var(--share-muted); font-size: 10px; }.text-button { padding: 0; border: 0; color: var(--share-accent); background: transparent; cursor: pointer; font-size: 11px; font-weight: 650; white-space: nowrap; }.text-button:hover { text-decoration: underline; }
.path-badge { color: var(--share-muted); }.path-direct { color: #16704d; background: #e5f6ee; }.path-relay { color: #8d5a0c; background: #fff4db; }.dark .path-direct { color: #78e3ad; background: #1c3e30; }.path-details { display: grid; gap: 12px; margin-top: 21px; }.path-details > div { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; }.path-details strong { max-width: 60%; font-size: 12px; font-weight: 600; text-align: right; overflow-wrap: anywhere; }.direct-note { margin: 20px 0 0; padding-top: 16px; border-top: 1px solid var(--share-line); color: var(--share-muted); font-size: 11px; line-height: 1.8; }.security-panel { background: var(--share-soft); }.security-panel p { margin: 11px 0 0; color: var(--share-muted); font-size: 12px; line-height: 1.8; }.file-share-error { padding: 16px 18px; border: 1px solid #e7bcbc; border-radius: 11px; color: #8d3535; background: #fff3f3; }.dark .file-share-error { border-color: #704040; color: #ffb8b8; background: #3a2424; }.file-share-error strong { font-size: 12px; }.file-share-error p { margin: 5px 0 10px; font-size: 12px; line-height: 1.7; }
@media (max-width: 850px) { .file-share-layout { grid-template-columns: 1fr; }.file-share-side { position: static; }.path-panel { order: -1; } }
@media (max-width: 560px) { .file-share { padding: 14px 17px 52px; }.file-share-hero { padding: 27px 22px; }.file-share-panel { padding: 18px; }.runtime-grid { grid-template-columns: 1fr; }.panel-heading { display: block; }.state-pill,.path-badge { margin-top: 11px; }.received-card { align-items: flex-start; flex-direction: column; }.file-button { margin-top: 11px; } }
@media (prefers-reduced-motion: reduce) { .progress-track span { transition: none; } }
</style>
