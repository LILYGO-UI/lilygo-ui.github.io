import assert from 'node:assert/strict'
import { createHash, webcrypto } from 'node:crypto'
import test from 'node:test'
import { appLink, apps, type CatalogApp } from '../docs/.vitepress/theme/data/apps.ts'
import { fetchAppCatalog, fetchAppDetails } from '../docs/.vitepress/theme/lib/appRegistry.ts'

if (!globalThis.crypto?.subtle) Object.defineProperty(globalThis, 'crypto', { value: webcrypto, configurable: true })

const origin = 'https://lilygo-ui.github.io'
const rootUrl = `${origin}/packages/v1/root.json`
const snapshotId = 'b'.repeat(40)
const indexUrl = `${origin}/packages/v1/snapshots/${snapshotId}/index.json`
const launcher = apps.find(app => app.id === 'launcher')!
const i2cDetector = apps.find(app => app.id === 'i2c-detector')!

function registryFixture() {
  function entry(packageName: string, title: string, appId: string, version: string) {
    return {
      app_id: appId, package: packageName, title,
      summary: `${title} application from the registry.`, categories: ['Utility'],
      icon_url: `${origin}/packages/assets/icons/${packageName}.png`,
      latest_version: version,
      detail_url: `${origin}/packages/v1/snapshots/${snapshotId}/apps/${appId}.json`,
    }
  }
  const entries = [
    entry('lilygo-ui-meshtastic', 'Meshtastic', 'cc.lilygo.ui.Meshtastic', '0.2.1'),
    entry('lilygo-ui-i2cdetector', 'I2C Detector', 'cc.lilygo.ui.I2CDetector', '0.1.3'),
    entry('lilygo-ui-launcher', 'Launcher', 'cc.lilygo.ui.Launcher', '0.1.2-rc2'),
  ]
  const index = {
    protocol_version: 1, snapshot_id: snapshotId,
    generated_at: '2026-11-03T02:00:00Z', apps: entries,
  }
  const details = entries.map(item => ({
    protocol_version: 1, app_id: item.app_id, package: item.package,
    title: item.title, summary: item.summary, description: `${item.title} full registry description.`,
    authors: [{ name: 'LILYGO', github: 'LILYGO' }], categories: item.categories,
    source_repo: `https://github.com/LILYGO-UI/${item.package.slice('lilygo-ui-'.length)}`,
    homepage: `https://github.com/LILYGO-UI/${item.package.slice('lilygo-ui-'.length)}`,
    icon_url: item.icon_url, screenshots: [], permissions: [],
    releases: [{
      version: item.package === 'lilygo-ui-launcher' ? '0.1.2' : item.latest_version,
      status: 'published', architecture: 'arm64', published_at: '2026-11-02T17:55:48+08:00',
      url: `https://github.com/LILYGO-UI/packages/releases/download/apt-pool-${item.package}/${item.package}.deb`,
    }],
  }))
  const responses = new Map<string, { body: string; status: number }>()
  function setResponse(url: string, value: unknown, status = 200) {
    responses.set(url, { body: JSON.stringify(value), status })
  }
  function updateIndex() {
    const indexText = JSON.stringify(index)
    setResponse(rootUrl, {
      protocol_version: 1, snapshot_id: snapshotId, generated_at: index.generated_at,
      index: { url: indexUrl, sha256: createHash('sha256').update(indexText).digest('hex') },
    })
    responses.set(indexUrl, { body: indexText, status: 200 })
  }
  updateIndex()
  for (let i = 0; i < entries.length; i++) setResponse(entries[i].detail_url, details[i])
  const calls: Array<{ url: URL; init?: RequestInit }> = []
  const fetchMock: typeof fetch = async (input, init) => {
    const url = new URL(input instanceof Request ? input.url : input.toString())
    calls.push({ url, init })
    init?.signal?.throwIfAborted()
    const key = `${url.origin}${url.pathname}`
    const response = responses.get(key)
    assert.ok(response, `Unexpected registry request: ${url}`)
    return new Response(response.body, { status: response.status, headers: { 'content-type': 'application/json' } })
  }
  return { entries, details, index, responses, setResponse, updateIndex, calls, fetchMock }
}

test('the live catalog includes Meshtastic without a hardcoded application entry', async () => {
  const fixture = registryFixture()
  const result = await fetchAppCatalog([launcher, i2cDetector], { fetch: fixture.fetchMock })
  const meshtastic = result.find(app => app.registryPackage === 'lilygo-ui-meshtastic')
  assert.ok(meshtastic)
  assert.equal(meshtastic.name, 'Meshtastic')
  assert.equal(meshtastic.version, '0.2.1')
  assert.equal(meshtastic.author, 'LILYGO')
  assert.equal(meshtastic.repo, 'https://github.com/LILYGO-UI/meshtastic')
  assert.equal(meshtastic.icon, fixture.entries[0].icon_url)
  assert.deepEqual(meshtastic.description, { en: fixture.entries[0].summary, zh: fixture.entries[0].summary })
  assert.equal(result.length, fixture.entries.length)
  assert.equal(fixture.calls.filter(call => call.url.pathname.endsWith('/root.json')).length, 1)
  assert.equal(fixture.calls.filter(call => call.url.pathname.endsWith('/index.json')).length, 1)
  assert.equal(fixture.calls.length, 2 + fixture.entries.length)
})

test('catalog refresh preserves local translations, features, icons, and existing application order', async () => {
  const fixture = registryFixture()
  const localSnapshot = structuredClone([launcher, i2cDetector])
  const result = await fetchAppCatalog(localSnapshot, { fetch: fixture.fetchMock })
  assert.deepEqual(result.slice(0, 2).map(app => app.id), ['launcher', 'i2c-detector'])
  const refreshed = result.find(app => app.id === 'launcher')!
  assert.equal(refreshed.description.en, fixture.entries[2].summary)
  assert.equal(refreshed.description.zh, launcher.description.zh)
  assert.equal(refreshed.overview?.zh, launcher.overview?.zh)
  assert.deepEqual(refreshed.features, launcher.features)
  assert.deepEqual(refreshed.category, launcher.category)
  assert.equal(refreshed.icon, launcher.icon)
  assert.equal(refreshed.version, '0.1.2')
  assert.equal(refreshed.status, undefined)
  assert.deepEqual(localSnapshot, [launcher, i2cDetector], 'refresh must not mutate the fallback snapshot')
})

test('explicit package mappings merge I2C Detector once instead of adding a second card', async () => {
  const fixture = registryFixture()
  const result = await fetchAppCatalog([i2cDetector], { fetch: fixture.fetchMock })
  const matches = result.filter(app => app.registryPackage === 'lilygo-ui-i2cdetector')
  assert.equal(matches.length, 1)
  assert.equal(matches[0].id, 'i2c-detector')
  assert.equal(matches[0].version, '0.1.3')
  assert.equal(result.length, fixture.entries.length)
})

test('the registry determines catalog membership, including removing absent snapshot applications', async () => {
  const fixture = registryFixture()
  const retired: CatalogApp = { ...launcher, id: 'retired', name: 'Retired', registryPackage: 'lilygo-ui-retired' }
  const result = await fetchAppCatalog([launcher, retired], { fetch: fixture.fetchMock })
  assert.equal(result.some(app => app.id === 'retired'), false)
  assert.equal(result.length, fixture.entries.length)
})

test('a failed application detail keeps its new registry card and the other applications fresh', async () => {
  const fixture = registryFixture()
  fixture.setResponse(fixture.entries[0].detail_url, { error: 'Unavailable' }, 503)
  const result = await fetchAppCatalog([launcher], { fetch: fixture.fetchMock })
  const meshtastic = result.find(app => app.registryPackage === 'lilygo-ui-meshtastic')
  assert.ok(meshtastic, 'an unavailable detail must not remove a newly discovered application')
  assert.equal(meshtastic.name, 'Meshtastic')
  assert.equal(meshtastic.version, undefined, 'index ordering alone cannot establish the latest application release')
  assert.equal(meshtastic.description.en, fixture.entries[0].summary)
  assert.equal(meshtastic.icon, fixture.entries[0].icon_url)
  assert.equal(result.find(app => app.id === 'launcher')?.version, '0.1.2')
  assert.equal(result.length, fixture.entries.length)
})

test('the complete registry index is available before application details finish loading', async () => {
  const fixture = registryFixture()
  let indexedApps: CatalogApp[] | undefined
  await fetchAppCatalog([launcher], {
    fetch: fixture.fetchMock,
    onIndex: value => {
      assert.equal(fixture.calls.length, 2, 'discovery must not wait for every application detail')
      indexedApps = structuredClone(value)
    },
  })
  assert.ok(indexedApps)
  assert.equal(indexedApps.length, fixture.entries.length)
  assert.ok(indexedApps.some(app => app.registryPackage === 'lilygo-ui-meshtastic'))
})

test('a new catalog visit fetches the current root, index, and details without browser cache', async () => {
  const fixture = registryFixture()
  await fetchAppCatalog([launcher], { fetch: fixture.fetchMock })
  await fetchAppCatalog([launcher], { fetch: fixture.fetchMock })
  const roots = fixture.calls.filter(call => call.url.pathname.endsWith('/root.json'))
  assert.equal(roots.length, 2)
  for (const { url } of roots) assert.match(url.searchParams.get('_') ?? '', /^\d+$/)
  assert.equal(fixture.calls.length, (2 + fixture.entries.length) * 2)
  for (const { init } of fixture.calls) assert.equal(init?.cache, 'no-store')
})

test('catalog refresh rejects a changed index before using its applications', async () => {
  const fixture = registryFixture()
  fixture.setResponse(indexUrl, { ...fixture.index, generated_at: '2026-11-04T02:00:00Z' })
  await assert.rejects(fetchAppCatalog([launcher], { fetch: fixture.fetchMock }))
  assert.equal(fixture.calls.length, 2)
})

test('a failed catalog root rejects so the caller can retain its local snapshot', async () => {
  const fixture = registryFixture()
  fixture.setResponse(rootUrl, { error: 'Unavailable' }, 503)
  await assert.rejects(fetchAppCatalog([launcher], { fetch: fixture.fetchMock }))
  assert.equal(fixture.calls.length, 1)
})

test('catalog requests carry the abort signal and an abort rejects the complete refresh', async () => {
  const fixture = registryFixture()
  const controller = new AbortController()
  await fetchAppCatalog([launcher], { fetch: fixture.fetchMock, signal: controller.signal })
  for (const { init } of fixture.calls) assert.equal(init?.signal, controller.signal)
  controller.abort()
  await assert.rejects(fetchAppCatalog([launcher], { fetch: fixture.fetchMock, signal: controller.signal }), { name: 'AbortError' })
})

test('abort during detail loading does not publish a partially refreshed catalog', async () => {
  const fixture = registryFixture()
  const controller = new AbortController()
  const fetchMock: typeof fetch = async (input, init) => {
    const url = new URL(input instanceof Request ? input.url : input.toString())
    if (url.pathname.includes('/apps/')) controller.abort()
    return fixture.fetchMock(input, init)
  }
  await assert.rejects(fetchAppCatalog([launcher], { fetch: fetchMock, signal: controller.signal }), { name: 'AbortError' })
})

test('an application added after the site build can load details directly by registry package', async () => {
  const fixture = registryFixture()
  const result = await fetchAppDetails('lilygo-ui-meshtastic', { fetch: fixture.fetchMock })
  assert.equal(result.registryPackage, 'lilygo-ui-meshtastic')
  assert.equal(result.name, 'Meshtastic')
  assert.equal(result.version, '0.2.1')
  assert.equal(result.description?.zh, fixture.entries[0].summary)
  assert.equal(result.releaseUrl, fixture.details[0].releases[0].url)
})

test('new applications use the generic detail page while existing applications keep their routes', async () => {
  const fixture = registryFixture()
  const result = await fetchAppCatalog([launcher, i2cDetector], { fetch: fixture.fetchMock })
  const meshtastic = result.find(app => app.registryPackage === 'lilygo-ui-meshtastic')!
  assert.equal(appLink(meshtastic, true), '/zh/applications/detail.html?package=lilygo-ui-meshtastic')
  assert.equal(appLink(meshtastic, false), '/applications/detail.html?package=lilygo-ui-meshtastic')
  assert.equal(appLink(result.find(app => app.id === 'launcher')!, true), '/zh/applications/launcher.html')
  assert.equal(appLink(result.find(app => app.id === 'i2c-detector')!, false), '/applications/i2c-detector.html')
})
