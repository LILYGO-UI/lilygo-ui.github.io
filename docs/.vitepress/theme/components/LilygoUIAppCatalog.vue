<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useData, withBase } from 'vitepress'
import { apps as fallbackApps, appLink } from '../data/apps'
import { fetchAppCatalog } from '../lib/appRegistry'

const { localeIndex } = useData()
const isZh = computed(() => localeIndex.value === 'zh')
const apps = ref(fallbackApps)
const catalogStatus = ref<'idle' | 'loading' | 'success' | 'error'>('idle')
let requestController: AbortController | null = null
let requestSequence = 0
const query = ref('')
const selectedCategory = ref('all')
const sortBy = ref('featured')
const filtersOpen = ref(false)
const pageSize = ref(12)
const page = ref(1)
let ready = false

const copy = computed(() => isZh.value ? {
  title: '应用目录', intro: '发现适合你的 LILYGO UI 应用。探索工具、媒体与硬件应用，点击卡片了解功能和安装信息。',
  search: '搜索应用、功能或分类', filters: '筛选', category: '应用分类', all: '全部应用',
  sort: '排序', featured: '推荐顺序', name: '名称 A–Z', results: '个应用', details: '查看详情',
  clear: '清除筛选', empty: '没有找到匹配的应用', emptyHint: '试试其他关键词，或清除分类筛选。',
  perPage: '每页', previous: '上一页', next: '下一页', pagination: '目录分页',
  registry: '应用注册表',
  registryText: '查阅 packages 注册表，了解应用发布记录和可用安装包。',
  browseRegistry: '查看注册表', snapshot: '已发布版本',
  loading: '正在获取最新应用列表…', refreshed: '应用列表已更新', refreshFailed: '更新失败，显示已加载的应用列表',
} : {
  title: 'Application catalog', intro: 'Find your next LILYGO UI app. Explore tools, media, and hardware applications, then open a card for features and installation details.',
  search: 'Search apps, features, or categories', filters: 'Filters', category: 'Categories', all: 'All apps',
  sort: 'Sort', featured: 'Featured order', name: 'Name A–Z', results: 'apps', details: 'View details',
  clear: 'Clear filters', empty: 'No matching applications', emptyHint: 'Try another search, or clear the category filter.',
  perPage: 'Per page', previous: 'Previous', next: 'Next', pagination: 'Catalog pagination',
  registry: 'Application registry',
  registryText: 'Explore the packages registry for application releases and available packages.',
  browseRegistry: 'Open registry', snapshot: 'Published version',
  loading: 'Refreshing applications…', refreshed: 'Application list updated', refreshFailed: 'Update failed; showing the loaded applications',
})

const categories = computed(() => [
  { value: 'all', label: copy.value.all, count: apps.value.length },
  ...Array.from(new Map(apps.value.map(app => [app.category.en, app.category])).values()).map(category => ({
    value: category.en,
    label: isZh.value ? category.zh : category.en,
    count: apps.value.filter(app => app.category.en === category.en).length,
  })),
])
const activeCategory = computed(() => categories.value.find(category => category.value === selectedCategory.value))
const hasFilters = computed(() => Boolean(query.value.trim()) || selectedCategory.value !== 'all')
const filteredApps = computed(() => {
  const q = query.value.trim().toLowerCase()
  const result = apps.value.filter(app => {
    const matchesQuery = !q || [app.name, app.author, app.category.en, app.category.zh, app.description.en, app.description.zh,
      app.overview?.en ?? '', app.overview?.zh ?? '', ...app.features.flatMap(feature => [feature.en, feature.zh])]
      .some(value => value.toLowerCase().includes(q))
    return matchesQuery && (selectedCategory.value === 'all' || app.category.en === selectedCategory.value)
  })
  return sortBy.value === 'name' ? [...result].sort((a, b) => a.name.localeCompare(b.name)) : result
})
const pageCount = computed(() => Math.max(1, Math.ceil(filteredApps.value.length / pageSize.value)))
const visibleApps = computed(() => filteredApps.value.slice((page.value - 1) * pageSize.value, page.value * pageSize.value))
const resultRange = computed(() => {
  const first = (page.value - 1) * pageSize.value + 1
  const last = Math.min(page.value * pageSize.value, filteredApps.value.length)
  return `${first}–${last} / ${filteredApps.value.length}`
})

function clearFilters() {
  query.value = ''
  selectedCategory.value = 'all'
}

// Keep directory controls in the URL so browser Back and shared links retain them.
function syncUrl() {
  if (!ready) return
  const url = new URL(window.location.href)
  const values = { q: query.value, category: selectedCategory.value === 'all' ? '' : selectedCategory.value,
    sort: sortBy.value === 'featured' ? '' : sortBy.value, size: pageSize.value === 12 ? '' : String(pageSize.value),
    page: page.value === 1 ? '' : String(page.value) }
  for (const [key, value] of Object.entries(values)) {
    if (value) url.searchParams.set(key, value)
    else url.searchParams.delete(key)
  }
  window.history.replaceState(window.history.state, '', url)
}

watch([query, selectedCategory, sortBy, pageSize], () => {
  if (!ready) return
  page.value = 1
  syncUrl()
}, { flush: 'sync' })
watch(page, syncUrl, { flush: 'sync' })

onMounted(() => {
  const params = new URLSearchParams(window.location.search)
  query.value = params.get('q') ?? ''
  const category = params.get('category')
  if (category) selectedCategory.value = category
  if (params.get('sort') === 'name') sortBy.value = 'name'
  const size = Number(params.get('size'))
  if ([6, 12, 24].includes(size)) pageSize.value = size
  const requestedPage = Number(params.get('page'))
  if (Number.isInteger(requestedPage) && requestedPage > 0) page.value = requestedPage
  filtersOpen.value = selectedCategory.value !== 'all'
  ready = true
  void refreshCatalog()
  window.addEventListener('pageshow', handlePageShow)
})
async function refreshCatalog() {
  const sequence = ++requestSequence
  requestController?.abort()
  const controller = new AbortController()
  requestController = controller
  catalogStatus.value = 'loading'
  const timeout = setTimeout(() => controller.abort(), 30_000)
  try {
    const updated = await fetchAppCatalog(fallbackApps, {
      signal: controller.signal,
      onIndex: indexApps => {
        if (sequence !== requestSequence) return
        apps.value = indexApps
        page.value = Math.min(page.value, pageCount.value)
      },
    })
    if (sequence !== requestSequence) return
    apps.value = updated
    catalogStatus.value = 'success'
  } catch {
    if (sequence === requestSequence) catalogStatus.value = 'error'
  } finally {
    clearTimeout(timeout)
    if (sequence === requestSequence) page.value = Math.min(page.value, pageCount.value)
    if (requestController === controller) requestController = null
  }
}

function handlePageShow(event: PageTransitionEvent) {
  if (event.persisted) void refreshCatalog()
}

onBeforeUnmount(() => {
  ++requestSequence
  requestController?.abort()
  window.removeEventListener('pageshow', handlePageShow)
})
</script>

<template>
  <div class="lilygo-catalog">
    <header class="catalog-header">
      <span class="catalog-kicker"><span aria-hidden="true"></span>LILYGO UI / APP STORE</span>
      <h1>{{ copy.title }}</h1>
      <p>{{ copy.intro }}</p>
    </header>

    <p v-if="catalogStatus !== 'idle'" class="catalog-status" aria-live="polite">
      {{ catalogStatus === 'loading' ? copy.loading : catalogStatus === 'success' ? copy.refreshed : copy.refreshFailed }}
    </p>

    <div class="catalog-search-row">
      <label class="catalog-search">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><circle cx="10.8" cy="10.8" r="7.3" /><path d="m16 16 4.6 4.6" /></svg>
        <input v-model="query" type="search" :placeholder="copy.search" :aria-label="copy.search" autocomplete="off" />
      </label>
      <button class="catalog-filter-toggle" :class="{ active: filtersOpen }" :aria-expanded="filtersOpen" aria-controls="catalog-filters" @click="filtersOpen = !filtersOpen">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M4 7h16M4 17h16" /><circle cx="9" cy="7" r="2.5" /><circle cx="15" cy="17" r="2.5" /></svg>
        {{ copy.filters }}<span v-if="selectedCategory !== 'all'" class="filter-dot" aria-hidden="true"></span>
      </button>
    </div>
    <div v-show="filtersOpen" id="catalog-filters" class="catalog-filters">
      <div class="filter-heading"><span>{{ copy.category }}</span><button v-if="hasFilters" @click="clearFilters">{{ copy.clear }}</button></div>
      <div class="category-options" :aria-label="copy.category" role="group">
        <button v-for="category in categories" :key="category.value" :aria-pressed="selectedCategory === category.value" :class="{ selected: selectedCategory === category.value }" @click="selectedCategory = category.value">
          {{ category.label }}<span>{{ category.count }}</span>
        </button>
      </div>
    </div>

    <div class="catalog-toolbar">
      <div class="catalog-results" aria-live="polite" aria-atomic="true"><strong>{{ filteredApps.length }}</strong> {{ copy.results }}<span v-if="selectedCategory !== 'all'" class="selected-label">{{ activeCategory?.label }}</span></div>
      <label class="catalog-sort"><span>{{ copy.sort }}</span><select v-model="sortBy"><option value="featured">{{ copy.featured }}</option><option value="name">{{ copy.name }}</option></select></label>
    </div>

    <div v-if="visibleApps.length" class="catalog-grid">
      <a v-for="app in visibleApps" :key="app.id" class="catalog-card" :href="appLink(app, isZh)" :aria-label="`${app.name} — ${copy.details}`">
        <div class="catalog-card-head">
          <img class="catalog-app-icon" :src="withBase(app.icon)" alt="" width="48" height="48" loading="lazy" decoding="async" />
          <div class="catalog-identity"><h2>{{ app.name }}</h2><span v-if="app.author">@{{ app.author }}</span></div>
          <span class="catalog-card-arrow" aria-hidden="true">↗</span>
        </div>
        <p>{{ isZh ? app.description.zh : app.description.en }}</p>
        <div class="catalog-tags"><span class="catalog-category">{{ isZh ? app.category.zh : app.category.en }}</span><span v-if="app.version" class="catalog-version" :title="copy.snapshot">v{{ app.version }}</span></div>
        <div class="catalog-card-footer"><span>{{ copy.details }}</span><span aria-hidden="true">→</span></div>
      </a>
    </div>
    <div v-else class="catalog-empty">
      <span class="empty-icon" aria-hidden="true">⌕</span><h2>{{ copy.empty }}</h2><p>{{ copy.emptyHint }}</p><button @click="clearFilters">{{ copy.clear }}</button>
    </div>

    <nav v-if="filteredApps.length" class="catalog-pagination" :aria-label="copy.pagination">
      <label>{{ copy.perPage }}<select v-model.number="pageSize"><option :value="6">6</option><option :value="12">12</option><option :value="24">24</option></select></label>
      <span class="catalog-range">{{ resultRange }}</span>
      <div class="page-controls">
        <button :disabled="page === 1" :aria-label="copy.previous" @click="page--">←</button>
        <button v-for="number in pageCount" :key="number" :aria-label="isZh ? `第 ${number} 页` : `Page ${number}`" :aria-current="page === number ? 'page' : undefined" @click="page = number">{{ number }}</button>
        <button :disabled="page === pageCount" :aria-label="copy.next" @click="page++">→</button>
      </div>
    </nav>

    <aside class="catalog-registry"><div><h2>{{ copy.registry }}</h2><p>{{ copy.registryText }}</p></div><a href="https://github.com/LILYGO-UI/packages" target="_blank" rel="noopener noreferrer">{{ copy.browseRegistry }} <span aria-hidden="true">↗</span></a></aside>
  </div>
</template>

<style scoped>
.lilygo-catalog { --catalog-ink: #172b3d; --catalog-muted: #667789; --catalog-line: #dfe6ec; --catalog-soft: #f6f9fb; --catalog-accent: #26758a; --catalog-tint: #eaf5f6; max-width: 1180px; margin: 0 auto; padding: 24px 24px 76px; color: var(--catalog-ink); }
.dark .lilygo-catalog { --catalog-ink: #e8eff7; --catalog-muted: #a0afbf; --catalog-line: #303e4c; --catalog-soft: #1c2530; --catalog-accent: #7cc8d9; --catalog-tint: #213840; }
.lilygo-catalog a { text-decoration: none; }
.lilygo-catalog button, .lilygo-catalog select, .lilygo-catalog input { font: inherit; }
.lilygo-catalog button, .lilygo-catalog select { cursor: pointer; }
.lilygo-catalog :is(a, button, select, input):focus-visible { outline: 3px solid var(--catalog-accent); outline-offset: 4px; }
.catalog-header { padding: 37px 0 30px; }
.catalog-kicker { display: inline-flex; align-items: center; gap: 8px; color: var(--catalog-accent); font-size: 11px; font-weight: 700; letter-spacing: .14em; }
.catalog-kicker > span { width: 6px; height: 6px; border-radius: 50%; background: var(--catalog-accent); }
.catalog-header h1 { margin: 13px 0 15px; font-size: clamp(32px, 4.3vw, 46px); font-weight: 750; line-height: 1.2; letter-spacing: -.035em; }
.catalog-header p { max-width: 730px; margin: 0; color: var(--catalog-muted); font-size: 15px; line-height: 1.8; }
.catalog-status { margin: -12px 0 20px; color: var(--catalog-muted); font-size: 12px; }
.catalog-search-row { display: flex; gap: 12px; }
.catalog-search { display: flex; align-items: center; flex: 1; min-width: 0; gap: 12px; padding: 0 16px; border: 1px solid var(--catalog-line); border-radius: 10px; background: var(--catalog-soft); color: var(--catalog-muted); }
.catalog-search:focus-within { border-color: var(--catalog-accent); box-shadow: 0 0 0 2px var(--catalog-tint); }
.catalog-search svg, .catalog-filter-toggle svg { flex-shrink: 0; width: 18px; height: 18px; }
.catalog-search input { width: 100%; min-width: 0; min-height: 48px; border: 0; outline: 0 !important; background: transparent; color: var(--catalog-ink); font-size: 14px; }
.catalog-search input::placeholder { color: var(--catalog-muted); }
.catalog-filter-toggle { display: flex; align-items: center; gap: 9px; padding: 0 18px; border: 1px solid var(--catalog-line); border-radius: 10px; color: var(--catalog-ink); background: var(--catalog-soft); font-size: 13px !important; font-weight: 600 !important; }
.catalog-filter-toggle.active { border-color: var(--catalog-accent); color: var(--catalog-accent); background: var(--catalog-tint); }
.catalog-filter-toggle svg circle { fill: var(--catalog-soft); }
.filter-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--catalog-accent); }
.catalog-filters { margin-top: 12px; padding: 20px; border: 1px solid var(--catalog-line); border-radius: 10px; }
.filter-heading { display: flex; justify-content: space-between; margin-bottom: 12px; color: var(--catalog-muted); font-size: 12px; }
.filter-heading button { color: var(--catalog-accent); }
.category-options { display: flex; flex-wrap: wrap; gap: 8px; }
.category-options button { display: inline-flex; align-items: center; gap: 10px; min-height: 36px; padding: 5px 12px; border: 1px solid var(--catalog-line); border-radius: 7px; color: var(--catalog-muted); font-size: 12px; }
.category-options button span { opacity: .65; font-size: 11px; }
.category-options button.selected { border-color: var(--catalog-accent); color: var(--catalog-accent); background: var(--catalog-tint); }
.catalog-toolbar { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin: 28px 0 16px; }
.catalog-results { display: flex; align-items: center; gap: 5px; color: var(--catalog-muted); font-size: 14px; }
.catalog-results strong { color: var(--catalog-ink); font-size: 20px; font-weight: 650; }
.selected-label { margin-left: 8px; padding: 2px 7px; border-radius: 4px; color: var(--catalog-accent); background: var(--catalog-tint); font-size: 11px; }
.catalog-sort { display: flex; align-items: center; gap: 10px; color: var(--catalog-muted); font-size: 12px; }
.catalog-sort select, .catalog-pagination select { min-height: 36px; padding: 4px 28px 4px 10px; border: 1px solid var(--catalog-line); border-radius: 7px; color: var(--catalog-ink); background-color: var(--catalog-soft); }
.catalog-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; }
.catalog-card { display: flex; min-width: 0; flex-direction: column; padding: 22px 22px 0; border: 1px solid var(--catalog-line); border-radius: 12px; color: var(--catalog-ink); background: var(--catalog-soft); transition: border-color .18s, box-shadow .18s, transform .18s; }
.catalog-card:hover { border-color: var(--catalog-accent); box-shadow: 0 6px 20px rgba(32, 74, 109, .07); transform: translateY(-2px); }
.catalog-card-head { display: flex; align-items: center; gap: 13px; }
.catalog-app-icon { display: block; flex: 0 0 48px; width: 48px; height: 48px; object-fit: contain; }
.catalog-identity { flex: 1; min-width: 0; }
.catalog-card h2 { margin: 0 0 4px; font-size: 17px; line-height: 1.35; font-weight: 650; }
.catalog-identity > span { color: var(--catalog-muted); font-size: 11px; }
.catalog-card-arrow { align-self: flex-start; color: var(--catalog-muted); font-size: 18px; }
.catalog-card p { flex: 1; min-height: 44px; margin: 18px 0 16px; color: var(--catalog-muted); font-size: 13px; line-height: 1.7; }
.catalog-tags { display: flex; align-items: center; flex-wrap: wrap; gap: 7px; margin-bottom: 20px; }
.catalog-category, .catalog-version { padding: 2px 7px; border: 1px solid var(--catalog-line); border-radius: 4px; font-size: 10px; line-height: 1.6; }
.catalog-category { color: var(--catalog-accent); background: var(--catalog-tint); border-color: transparent; }
.catalog-version { color: var(--catalog-muted); font-variant-numeric: tabular-nums; }
.catalog-card-footer { display: flex; justify-content: space-between; padding: 12px 0; border-top: 1px solid var(--catalog-line); color: var(--catalog-accent); font-size: 11px; font-weight: 600; }
.catalog-card-footer > span:last-child { font-size: 17px; font-weight: 400; }
.catalog-empty { padding: 55px 20px; border: 1px dashed var(--catalog-line); border-radius: 12px; text-align: center; }
.empty-icon { display: block; color: var(--catalog-muted); font-size: 38px; }
.catalog-empty h2 { margin: 10px 0; font-size: 20px; font-weight: 600; }
.catalog-empty p { color: var(--catalog-muted); font-size: 14px; }
.catalog-empty button { margin-top: 20px; padding: 9px 18px; border: 1px solid var(--catalog-line); border-radius: 7px; color: var(--catalog-accent); }
.catalog-pagination { display: flex; align-items: center; gap: 18px; margin-top: 24px; color: var(--catalog-muted); font-size: 12px; }
.catalog-pagination label { display: flex; align-items: center; gap: 8px; }
.page-controls { display: flex; gap: 5px; margin-left: auto; }
.page-controls button { min-width: 36px; height: 36px; padding: 4px 10px; border: 1px solid var(--catalog-line); border-radius: 7px; color: var(--catalog-ink); }
.page-controls button[aria-current='page'] { border-color: var(--catalog-accent); color: var(--catalog-accent); background: var(--catalog-tint); }
.page-controls button:disabled { opacity: .3; cursor: default; }
.catalog-registry { display: flex; align-items: center; justify-content: space-between; gap: 20px; margin-top: 48px; padding: 24px 26px; border: 1px solid var(--catalog-line); border-radius: 12px; }
.catalog-registry h2 { margin: 0 0 6px; font-size: 15px; font-weight: 650; }
.catalog-registry p { margin: 0; color: var(--catalog-muted); font-size: 12px; line-height: 1.7; }
.catalog-registry a { flex-shrink: 0; color: var(--catalog-accent); font-size: 12px; font-weight: 600; }
@media (max-width: 960px) { .catalog-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 600px) { .lilygo-catalog { padding: 18px 20px 50px; } .catalog-header { padding: 27px 0 25px; } .catalog-header p { font-size: 14px; } .catalog-search { gap: 8px; padding: 0 12px; } .catalog-search input { font-size: 12px; } .catalog-filter-toggle { gap: 6px; padding: 0 12px; } .catalog-grid { grid-template-columns: 1fr; } .catalog-toolbar { margin-top: 22px; } .catalog-sort > span { display: none; } .catalog-card { padding: 20px 20px 0; } .catalog-card p { min-height: auto; } .catalog-pagination { flex-wrap: wrap; gap: 12px; } .catalog-range { margin-left: auto; } .page-controls { width: 100%; justify-content: flex-end; } .catalog-registry { align-items: flex-start; flex-direction: column; padding: 20px; } }
@media (prefers-reduced-motion: reduce) { .catalog-card { transition: none; } .catalog-card:hover { transform: none; } }
</style>
