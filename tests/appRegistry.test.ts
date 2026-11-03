import assert from 'node:assert/strict'
import { createHash, webcrypto } from 'node:crypto'
import test from 'node:test'
import type { CatalogApp } from '../docs/.vitepress/theme/data/apps.ts'
import { fetchAppDetails, fetchRegistryUpdates, selectLatestRelease } from '../docs/.vitepress/theme/lib/appRegistry.ts'

if (!globalThis.crypto?.subtle) Object.defineProperty(globalThis, 'crypto', { value: webcrypto, configurable: true })

const registryOrigin = 'https://lilygo-ui.github.io'
const rootUrl = `${registryOrigin}/packages/v1/root.json`
const snapshotId = 'a'.repeat(40)
const indexUrl = `${registryOrigin}/packages/v1/snapshots/${snapshotId}/index.json`
const releaseUrl = 'https://github.com/LILYGO-UI/packages/releases/download/apt-pool-lilygo-ui-launcher/lilygo-ui-launcher_0.1.2_arm64.deb'
const launcher: CatalogApp = {
  id: 'launcher', name: 'Launcher', repo: 'https://github.com/LILYGO-UI/launcher',
  category: { en: 'Platform', zh: '平台' },
  description: { en: 'Starts applications.', zh: '启动应用。' },
  icon: '/app-icons/launcher.png', author: 'LILYGO-UI', features: [],
  version: '0.1.2-rc2', updated: '2026-10-13', status: { en: 'Candidate', zh: '候选版' },
}

function release(version: string, overrides: Record<string, unknown> = {}) {
  return {
    version, status: 'published', architecture: 'arm64',
    published_at: '2026-10-30T17:55:48+08:00', url: releaseUrl,
    ...overrides,
  }
}

function registryFixture(packageName = 'lilygo-ui-launcher') {
  const detailUrl = `${registryOrigin}/packages/v1/snapshots/${snapshotId}/apps/${packageName}.json`
  const entry = {
    app_id: 'cc.lilygo.ui.Launcher', package: packageName, title: 'Launcher',
    summary: 'Starts and organizes installed applications.', categories: ['System'],
    icon_url: `${registryOrigin}/packages/assets/launcher.png`,
    latest_version: '0.1.2-rc2', detail_url: detailUrl,
  }
  const index = {
    protocol_version: 1, snapshot_id: snapshotId,
    generated_at: '2026-11-03T02:00:00Z', apps: [entry],
  }
  const detail = {
    protocol_version: 1, app_id: entry.app_id, package: packageName,
    title: entry.title, summary: entry.summary, description: 'The application home screen.',
    authors: [{ name: 'LILYGO', github: 'LILYGO' }], categories: entry.categories,
    source_repo: launcher.repo, homepage: launcher.repo, icon_url: entry.icon_url,
    screenshots: [], permissions: [],
    releases: [
      release('0.1.2-rc2', { published_at: '2026-10-13T17:16:51+08:00' }),
      release('0.1.2'),
    ],
  }
  const indexText = JSON.stringify(index)
  const root = {
    protocol_version: 1, snapshot_id: snapshotId,
    generated_at: '2026-11-03T02:00:00Z',
    index: { url: indexUrl, sha256: createHash('sha256').update(indexText).digest('hex') },
  }
  const responses = new Map([
    [rootUrl, JSON.stringify(root)],
    [indexUrl, indexText],
    [detailUrl, JSON.stringify(detail)],
  ])
  const calls: Array<{ url: URL; init?: RequestInit }> = []
  const fetchMock: typeof fetch = async (input, init) => {
    const url = new URL(input instanceof Request ? input.url : input.toString())
    calls.push({ url, init })
    const key = `${url.origin}${url.pathname}`
    assert.ok(responses.has(key), `Unexpected registry request: ${url}`)
    return new Response(responses.get(key), { status: 200, headers: { 'content-type': 'application/json' } })
  }
  return { root, index, detail, detailUrl, responses, calls, fetchMock }
}

test('the stable release supersedes its candidate even when the candidate appears first', () => {
  const releases = [release('0.1.2-rc2'), release('0.1.2')]
  assert.equal(selectLatestRelease(releases).version, '0.1.2')
  assert.deepEqual(releases.map(value => value.version), ['0.1.2-rc2', '0.1.2'])
})

test('version ordering compares numeric patch and candidate components', () => {
  assert.equal(selectLatestRelease([release('0.1.9'), release('0.1.10')]).version, '0.1.10')
  assert.equal(selectLatestRelease([release('0.1.2-rc2'), release('0.1.2-rc10')]).version, '0.1.2-rc10')
})

test('withdrawn releases cannot replace the latest published version', () => {
  const latest = selectLatestRelease([
    release('0.2.0', { status: 'yanked' }),
    release('0.3.0', { status: 'revoked' }),
    release('0.1.2'),
  ])
  assert.equal(latest.version, '0.1.2')
  assert.equal(latest.status, 'published')
})

test('a registry without valid published releases rejects instead of claiming a fresh version', () => {
  for (const releases of [undefined, null, {}, [], [release('0.1.2', { status: 'yanked' })], [release('0.1.2', { status: 'revoked' })]]) {
    assert.throws(() => selectLatestRelease(releases))
  }
})

test('app details follow the verified registry snapshot and replace the stale candidate metadata', async () => {
  const fixture = registryFixture()
  const details = await fetchAppDetails(launcher, { fetch: fixture.fetchMock })
  assert.equal(details.id, 'launcher')
  assert.equal(details.version, '0.1.2')
  assert.equal(details.updated, '2026-10-30')
  assert.equal(details.releaseUrl, releaseUrl)
  assert.ok(Object.hasOwn(details, 'status'), 'the fresh result must explicitly clear the snapshot candidate status')
  assert.equal({ ...launcher, ...details }.status, undefined)
  assert.deepEqual(fixture.calls.map(({ url }) => `${url.origin}${url.pathname}`), [rootUrl, indexUrl, fixture.detailUrl])
})

test('homepage updates use the latest published release and exact publication timestamp', async () => {
  const fixture = registryFixture()
  const updates = await fetchRegistryUpdates([launcher], { fetch: fixture.fetchMock, limit: 4 })
  assert.equal(updates.length, 1)
  assert.deepEqual(updates[0], {
    kind: { en: 'Release', zh: '发布' },
    title: { en: 'Launcher 0.1.2 released', zh: 'Launcher 0.1.2 发布' },
    description: {
      en: 'The application home screen.',
      zh: '启动应用。',
    },
    link: 'https://github.com/LILYGO-UI/packages/tree/main/apps/lilygo-ui-launcher/releases',
    date: '2026-10-30',
    publishedAt: '2026-10-30T17:55:48+08:00',
    version: '0.1.2',
    package: 'lilygo-ui-launcher',
    appId: 'cc.lilygo.ui.Launcher',
    app: { en: 'Launcher', zh: 'Launcher' },
    sourceRepo: launcher.repo,
    icon: launcher.icon,
    status: undefined,
  })
})

test('each app detail refresh requests the root and all registry documents without cache', async () => {
  const fixture = registryFixture()
  await fetchAppDetails(launcher, { fetch: fixture.fetchMock })
  await fetchAppDetails(launcher, { fetch: fixture.fetchMock })
  const roots = fixture.calls.filter(({ url }) => url.pathname.endsWith('/root.json'))
  assert.equal(roots.length, 2)
  for (const { url } of roots) assert.match(url.searchParams.get('_') ?? '', /^\d+$/)
  assert.equal(fixture.calls.length, 6)
  for (const { init } of fixture.calls) assert.equal(init?.cache, 'no-store')
})

test('an explicit registry package mapping finds applications whose catalog id differs', async () => {
  const fixture = registryFixture('lilygo-ui-i2cdetector')
  const app: CatalogApp = { ...launcher, id: 'i2c-detector', registryPackage: 'lilygo-ui-i2cdetector' }
  const details = await fetchAppDetails(app, { fetch: fixture.fetchMock })
  assert.equal(details.id, 'i2c-detector')
  assert.equal(details.version, '0.1.2')
  assert.equal(fixture.calls.at(-1)?.url.pathname, new URL(fixture.detailUrl).pathname)
})

test('HTTP failures reject so the caller can retain the local snapshot', async () => {
  const fetchMock: typeof fetch = async () => new Response('Unavailable', { status: 503 })
  await assert.rejects(fetchAppDetails(launcher, { fetch: fetchMock }))
})

test('a changed index body fails its root checksum before fetching application details', async () => {
  const fixture = registryFixture()
  fixture.responses.set(indexUrl, JSON.stringify({ ...fixture.index, generated_at: '2026-11-04T02:00:00Z' }))
  await assert.rejects(fetchAppDetails(launcher, { fetch: fixture.fetchMock }))
  assert.equal(fixture.calls.length, 2)
})

test('the caller abort signal is passed to every registry request', async () => {
  const fixture = registryFixture()
  const controller = new AbortController()
  await fetchAppDetails(launcher, { fetch: fixture.fetchMock, signal: controller.signal })
  assert.equal(fixture.calls.length, 3)
  for (const { init } of fixture.calls) assert.equal(init?.signal, controller.signal)
})

test('an aborted request rejects instead of applying stale results', async () => {
  const controller = new AbortController()
  controller.abort()
  const fetchMock: typeof fetch = async (_input, init) => {
    assert.equal(init?.signal, controller.signal)
    init?.signal?.throwIfAborted()
    assert.fail('an aborted signal should stop the request')
  }
  await assert.rejects(fetchAppDetails(launcher, { fetch: fetchMock, signal: controller.signal }), { name: 'AbortError' })
})
