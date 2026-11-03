import type { CatalogApp, LocalizedText } from '../data/apps.ts'

const registryRoot = 'https://lilygo-ui.github.io/packages/v1/root.json'

type RegistryRelease = {
  version: string
  status: 'published'
  published_at: string
  url: string
}

export type AppDetails = CatalogApp & {
  id: string
  version: string
  updated: string
  /** Exact registry timestamp when available; older callers may omit it. */
  publishedAt?: string
  releaseUrl: string
}

type RequestOptions = { fetch?: typeof fetch; signal?: AbortSignal }
type CatalogOptions = RequestOptions & { onIndex?: (apps: CatalogApp[]) => void }
export type UpdatesOptions = RequestOptions & { limit?: number }

/**
 * A release card for the project hub. The registry only stores English
 * metadata, so the Chinese fields preserve the site's local translation when
 * an application is already known and otherwise fall back to the registry
 * text. Consumers can render either locale without another registry request.
 */
export type RegistryUpdate = {
  kind: LocalizedText
  title: LocalizedText
  description: LocalizedText
  link: string
  date: string
  publishedAt: string
  version: string
  package: string
  appId: string
  app: LocalizedText
  sourceRepo: string
  icon: string
  status?: LocalizedText
}
type RegistryEntry = {
  app_id: string
  package: string
  title: string
  summary: string
  categories: string[]
  icon_url: string
  detail_url: string
}

const categories: Record<string, LocalizedText> = {
  Utilities: { en: 'Utility', zh: '工具' },
  Utility: { en: 'Utility', zh: '工具' },
  System: { en: 'System', zh: '系统' },
  Multimedia: { en: 'Media', zh: '媒体' },
  Media: { en: 'Media', zh: '媒体' },
  Graphics: { en: 'Graphics', zh: '图形' },
  Network: { en: 'Network', zh: '网络' },
  Development: { en: 'Developer', zh: '开发' },
  Developer: { en: 'Developer', zh: '开发' },
  Games: { en: 'Entertainment', zh: '娱乐' },
  Entertainment: { en: 'Entertainment', zh: '娱乐' },
  Science: { en: 'Science', zh: '科学' },
  Education: { en: 'Education', zh: '教育' },
  Office: { en: 'Office', zh: '办公' },
}

function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid registry response')
  return value as Record<string, unknown>
}

function text(value: unknown): string {
  if (typeof value !== 'string' || !value.trim()) throw new Error('Missing registry field')
  return value.trim()
}

function httpsUrl(value: unknown): string {
  const url = new URL(text(value))
  if (url.protocol !== 'https:') throw new Error('Invalid registry URL')
  return url.href
}

function registryUrl(value: unknown): string {
  const url = new URL(httpsUrl(value))
  if (url.origin !== 'https://lilygo-ui.github.io' || !url.pathname.startsWith('/packages/')) {
    throw new Error('Invalid registry endpoint')
  }
  return url.href
}

function versionParts(version: string) {
  const match = /^v?(\d+(?:\.\d+)*)(?:[-~]([\da-zA-Z.-]+))?(?:\+[\da-zA-Z.-]+)?$/.exec(version)
  if (!match) throw new Error(`Unsupported application version: ${version}`)
  return { core: match[1].split('.').map(Number), prerelease: match[2] ?? '' }
}

function compareVersions(left: string, right: string): number {
  const a = versionParts(left)
  const b = versionParts(right)
  for (let i = 0; i < Math.max(a.core.length, b.core.length); i++) {
    const difference = (a.core[i] ?? 0) - (b.core[i] ?? 0)
    if (difference) return difference
  }
  // The registry's Debian ordering puts 0.1.2-rc2 ahead of 0.1.2.
  // For application display, a final release supersedes its prereleases.
  if (!a.prerelease || !b.prerelease) return Number(!a.prerelease) - Number(!b.prerelease)
  return a.prerelease.localeCompare(b.prerelease, 'en', { numeric: true })
}

export function selectLatestRelease(value: unknown): RegistryRelease {
  if (!Array.isArray(value)) throw new Error('Missing registry releases')
  const releases = value.map(record).filter(item => item.status === 'published').map(item => {
    const version = text(item.version)
    versionParts(version)
    const publishedAt = text(item.published_at)
    if (!/^\d{4}-\d{2}-\d{2}T/.test(publishedAt) || Number.isNaN(Date.parse(publishedAt))) {
      throw new Error('Invalid release date')
    }
    return { version, status: 'published' as const, published_at: publishedAt, url: httpsUrl(item.url) }
  })
  releases.sort((a, b) => compareVersions(b.version, a.version) || Date.parse(b.published_at) - Date.parse(a.published_at))
  if (!releases.length) throw new Error('No published application release')
  return releases[0]
}

function createReader(options: RequestOptions) {
  const request = options.fetch ?? globalThis.fetch
  return async (url: string) => {
    options.signal?.throwIfAborted()
    const response = await request(url, { cache: 'no-store', signal: options.signal })
    if (!response.ok) throw new Error(`Registry request failed (${response.status})`)
    const body = await response.text()
    options.signal?.throwIfAborted()
    return body
  }
}

type Reader = ReturnType<typeof createReader>

async function fetchRegistryIndex(read: Reader): Promise<RegistryEntry[]> {
  // Always resolve the current snapshot on a new visit, even if the browser
  // still has the previous mutable root document in its HTTP cache.
  const root = record(JSON.parse(await read(`${registryRoot}?_=${Date.now()}`)))
  const indexInfo = record(root.index)
  if (root.protocol_version !== 1 || !/^[a-f0-9]{40}$/.test(text(root.snapshot_id))) {
    throw new Error('Unsupported registry root')
  }
  const indexText = await read(registryUrl(indexInfo.url))
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(indexText))
  const checksum = Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('')
  if (checksum !== indexInfo.sha256) throw new Error('Registry index checksum mismatch')
  const index = record(JSON.parse(indexText))
  if (index.protocol_version !== 1 || index.snapshot_id !== root.snapshot_id || !Array.isArray(index.apps)) {
    throw new Error('Invalid registry index')
  }
  const packages = new Set<string>()
  return index.apps.map(value => {
    const entry = record(value)
    const packageName = text(entry.package)
    if (!/^[a-z0-9][a-z0-9+.-]*$/.test(packageName) || packages.has(packageName)) {
      throw new Error('Invalid registry package')
    }
    packages.add(packageName)
    return {
      app_id: text(entry.app_id),
      package: packageName,
      title: text(entry.title),
      summary: text(entry.summary),
      categories: Array.isArray(entry.categories) ? entry.categories.map(text) : [],
      icon_url: httpsUrl(entry.icon_url),
      detail_url: registryUrl(entry.detail_url),
    }
  })
}

function packageFor(app: CatalogApp): string {
  return app.registryPackage ?? `lilygo-ui-${app.id}`
}

function seedApp(entry: RegistryEntry, fallback?: CatalogApp): CatalogApp {
  if (fallback) {
    return {
      ...fallback,
      registryPackage: entry.package,
      name: entry.title,
      description: { ...fallback.description, en: entry.summary },
    }
  }
  const category = entry.categories[0] ?? 'Other'
  return {
    id: entry.package.replace(/^lilygo-ui-/, ''),
    registryPackage: entry.package,
    name: entry.title,
    repo: '',
    author: '',
    category: categories[category] ?? { en: category, zh: category === 'Other' ? '其他' : category },
    description: { en: entry.summary, zh: entry.summary },
    overview: { en: entry.summary, zh: entry.summary },
    icon: entry.icon_url,
    features: [],
    // index.latest_version uses Debian ordering and can name an older candidate.
    // Resolve display versions from published releases in the detail documents.
  }
}

async function fetchRegistryDetails(
  entry: RegistryEntry,
  app: CatalogApp,
  read: Reader,
  options: RequestOptions,
): Promise<AppDetails> {
  const detail = record(JSON.parse(await read(entry.detail_url)))
  if (detail.protocol_version !== 1 || detail.package !== entry.package || detail.app_id !== entry.app_id) {
    throw new Error('Invalid application detail')
  }
  const release = selectLatestRelease(detail.releases)
  const authors = Array.isArray(detail.authors)
    ? detail.authors.map(record).map(author => author.name).filter(name => typeof name === 'string' && name.trim())
    : []
  options.signal?.throwIfAborted()
  return {
    ...app,
    id: app.id,
    name: text(detail.title),
    repo: httpsUrl(detail.source_repo),
    author: authors.length ? authors.join(', ') : app.author,
    description: { ...app.description, en: text(detail.summary) },
    overview: { ...(app.overview ?? app.description), en: text(detail.description) },
    version: release.version,
    // Explicit undefined clears the static candidate label for a final release.
    status: versionParts(release.version).prerelease ? { en: 'Candidate', zh: '候选版' } : undefined,
    updated: release.published_at.slice(0, 10),
    publishedAt: release.published_at,
    releaseUrl: release.url,
  }
}

function updateFromDetails(entry: RegistryEntry, details: AppDetails): RegistryUpdate {
  const version = details.version
  const date = details.updated
  const appName = details.name
  const appDescription = details.description
  const candidate = Boolean(details.status)
  return {
    kind: { en: 'Release', zh: '发布' },
    title: {
      en: `${appName} ${version} released`,
      zh: `${appName} ${version} 发布`,
    },
    description: {
      en: details.overview?.en ?? appDescription.en,
      zh: details.overview?.zh ?? appDescription.zh,
    },
    link: `https://github.com/LILYGO-UI/packages/tree/main/apps/${entry.package}/releases`,
    date,
    publishedAt: details.publishedAt ?? `${date}T00:00:00.000Z`,
    version,
    package: entry.package,
    appId: entry.app_id,
    app: { en: appName, zh: appName },
    sourceRepo: details.repo,
    icon: details.icon,
    status: candidate ? { en: 'Candidate', zh: '候选版' } : undefined,
  }
}

export async function fetchAppDetails(
  app: CatalogApp | string,
  options: RequestOptions = {},
): Promise<AppDetails> {
  const read = createReader(options)
  const entries = await fetchRegistryIndex(read)
  const packageName = typeof app === 'string' ? app : packageFor(app)
  const entry = entries.find(item => item.package === packageName)
  if (!entry) throw new Error('Application not found in registry')
  return fetchRegistryDetails(entry, seedApp(entry, typeof app === 'string' ? undefined : app), read, options)
}

export async function fetchAppCatalog(
  fallbackApps: CatalogApp[],
  options: CatalogOptions = {},
): Promise<CatalogApp[]> {
  const read = createReader(options)
  const entries = await fetchRegistryIndex(read)
  const byPackage = new Map(entries.map(entry => [entry.package, entry]))
  const items: Array<{ entry: RegistryEntry; app: CatalogApp }> = []
  for (const fallback of fallbackApps) {
    const entry = byPackage.get(packageFor(fallback))
    if (!entry) continue
    items.push({ entry, app: seedApp(entry, fallback) })
    byPackage.delete(entry.package)
  }
  for (const entry of byPackage.values()) items.push({ entry, app: seedApp(entry) })
  const result = items.map(item => item.app)
  options.signal?.throwIfAborted()
  options.onIndex?.([...result])

  let next = 0
  await Promise.all(Array.from({ length: Math.min(4, items.length) }, async () => {
    while (next < items.length) {
      options.signal?.throwIfAborted()
      const index = next++
      const { entry, app } = items[index]
      try {
        result[index] = await fetchRegistryDetails(entry, app, read, options)
      } catch (error) {
        options.signal?.throwIfAborted()
        if (error instanceof Error && error.name === 'AbortError') throw error
        // The verified index still describes a valid application. Keep its card
        // visible when one detail request fails, without inventing release data.
      }
    }
  }))
  options.signal?.throwIfAborted()
  return result
}

/**
 * Fetch the current registry snapshot and turn each application's latest
 * published release into a homepage update card. The index is verified before
 * details are requested, and detail requests are capped at four concurrent
 * fetches so opening the homepage does not create an unbounded burst.
 *
 * A failed detail document is omitted from the returned updates. This keeps a
 * single broken package from hiding fresh releases for every other app; the
 * caller can retain its static snapshot when the index itself is unavailable.
 */
export async function fetchRegistryUpdates(
  fallbackAppsOrOptions: CatalogApp[] | UpdatesOptions = [],
  maybeOptions: UpdatesOptions = {},
): Promise<RegistryUpdate[]> {
  const fallbackApps = Array.isArray(fallbackAppsOrOptions) ? fallbackAppsOrOptions : []
  const options = Array.isArray(fallbackAppsOrOptions) ? maybeOptions : fallbackAppsOrOptions
  const read = createReader(options)
  const entries = await fetchRegistryIndex(read)
  const byPackage = new Map(fallbackApps.map(app => [packageFor(app), app]))
  const updates: RegistryUpdate[] = []
  let next = 0

  await Promise.all(Array.from({ length: Math.min(4, entries.length) }, async () => {
    while (next < entries.length) {
      options.signal?.throwIfAborted()
      const index = next++
      const entry = entries[index]
      try {
        const app = seedApp(entry, byPackage.get(entry.package))
        const details = await fetchRegistryDetails(entry, app, read, options)
        updates.push(updateFromDetails(entry, details))
      } catch (error) {
        options.signal?.throwIfAborted()
        if (error instanceof Error && error.name === 'AbortError') throw error
      }
    }
  }))

  options.signal?.throwIfAborted()
  updates.sort((left, right) => Date.parse(right.publishedAt) - Date.parse(left.publishedAt)
    || compareVersions(right.version, left.version)
    || left.package.localeCompare(right.package, 'en'))
  const limit = options.limit
  if (limit === undefined) return updates
  if (!Number.isInteger(limit) || limit < 0) throw new Error('Invalid update limit')
  return updates.slice(0, limit)
}
