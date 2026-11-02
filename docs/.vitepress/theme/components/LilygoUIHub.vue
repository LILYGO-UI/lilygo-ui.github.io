<script setup lang="ts">
import { computed } from 'vue'
import { useData, withBase } from 'vitepress'
import { appLink, apps as catalogApps } from '../data/apps'

type Update = {
  kind: string
  title: string
  description: string
  link: string
  date: string
}

const { localeIndex } = useData()
const isZh = computed(() => localeIndex.value === 'zh')

const copy = computed(() => isZh.value ? {
  eyebrow: 'LILYGO UI',
  title: '了解新动态，发现好应用',
  intro: '关注 LILYGO UI 的项目进展，探索值得一试的设备应用。',
  updates: '最新动态',
  updatesIntro: '近期版本与项目进展 · 注册表快照更新于 2026 年 10 月 14 日',
  featured: '精选推荐',
  featuredIntro: '从日常工具到语音助手，发现设备的更多可能。',
  details: '了解应用',
} : {
  eyebrow: 'LILYGO UI',
  title: 'Fresh updates. Apps to explore.',
  intro: 'Follow the progress of LILYGO UI and discover apps to try on your device.',
  updates: 'Latest updates',
  updatesIntro: 'Recent releases and project news · Registry snapshot: October 14, 2026',
  featured: 'Featured apps',
  featuredIntro: 'From everyday tools to a voice assistant, explore more ways to use your device.',
  details: 'Explore app',
})

const updates = computed<Update[]>(() => isZh.value ? [
  { kind: '发布', date: '2026-10-13', title: 'Launcher 0.1.2-rc2 发布', description: 'packages 注册表记录了 Launcher 的 arm64 候选版本，适合关注平台启动器开发进度。', link: 'https://github.com/LILYGO-UI/packages/commit/b48b580ed8074688af667b2c8768d92f450f21aa' },
  { kind: '发布', date: '2026-10-12', title: 'Store 0.1.2 发布', description: '应用商店客户端更新到 0.1.2，发布详情和构件以 packages 注册表为准。', link: 'https://github.com/LILYGO-UI/packages/commit/38d7ff1391415dd5bc3f3cc6ea2337ee5eea9235' },
  { kind: '发布', date: '2026-10-12', title: 'Files 0.1.1 发布', description: '文件管理器更新到 0.1.1，应用源码和版本信息可从官方仓库继续查看。', link: 'https://github.com/LILYGO-UI/packages/commit/12ccf81c27afa87ddd3c8bb3b57d192fe51b10e3' },
  { kind: '发布', date: '2026-10-09', title: 'NES 0.1.1 发布', description: 'NES 应用进入注册表发布列表，展示 LILYGO UI 应用目录正在扩展。', link: 'https://github.com/LILYGO-UI/packages/commit/50a7007e92e9301f35239f0ccd31aed7715e9351' },
] : [
  { kind: 'Release', date: '2026-10-13', title: 'Launcher 0.1.2-rc2 released', description: 'The packages registry records an arm64 candidate release for Launcher, the platform application launcher.', link: 'https://github.com/LILYGO-UI/packages/commit/b48b580ed8074688af667b2c8768d92f450f21aa' },
  { kind: 'Release', date: '2026-10-12', title: 'Store 0.1.2 released', description: 'The application store client moved to 0.1.2; see the packages registry for release details and artifacts.', link: 'https://github.com/LILYGO-UI/packages/commit/38d7ff1391415dd5bc3f3cc6ea2337ee5eea9235' },
  { kind: 'Release', date: '2026-10-12', title: 'Files 0.1.1 released', description: 'The file manager moved to 0.1.1; use its source repository for implementation and installation details.', link: 'https://github.com/LILYGO-UI/packages/commit/12ccf81c27afa87ddd3c8bb3b57d192fe51b10e3' },
  { kind: 'Release', date: '2026-10-09', title: 'NES 0.1.1 released', description: 'NES entered the published registry list, showing the LILYGO UI application catalog continuing to expand.', link: 'https://github.com/LILYGO-UI/packages/commit/50a7007e92e9301f35239f0ccd31aed7715e9351' },
])

const featuredAppIds = new Set(['files', 'radio', 'store', 'xiaozhi'])
const featuredApps = catalogApps.filter(app => featuredAppIds.has(app.id))
</script>

<template>
  <div class="lilygo-hub">
    <header class="lilygo-hub-hero">
      <div class="hub-eyebrow"><span class="hub-pulse" aria-hidden="true"></span>{{ copy.eyebrow }}</div>
      <h1>{{ copy.title }}</h1>
      <p>{{ copy.intro }}</p>
    </header>

    <section class="hub-section" aria-labelledby="hub-updates-title">
      <div class="hub-section-heading">
        <h2 id="hub-updates-title">{{ copy.updates }}</h2>
        <p>{{ copy.updatesIntro }}</p>
      </div>
      <div class="hub-update-grid">
        <a v-for="update in updates" :key="update.link" class="hub-update-card" :href="update.link" target="_blank" rel="noopener noreferrer">
          <div class="hub-card-meta"><span>{{ update.kind }}</span><time :datetime="update.date">{{ update.date }}</time></div>
          <h3>{{ update.title }}</h3>
          <p>{{ update.description }}</p>
          <span class="hub-arrow" aria-hidden="true">↗</span>
        </a>
      </div>
    </section>

    <section class="hub-section" aria-labelledby="hub-featured-title">
      <div class="hub-section-heading">
        <h2 id="hub-featured-title">{{ copy.featured }}</h2>
        <p>{{ copy.featuredIntro }}</p>
      </div>
      <div class="hub-app-grid">
        <a v-for="app in featuredApps" :key="app.id" class="hub-app-card" :href="withBase(appLink(app, isZh))">
          <img class="hub-app-icon" :src="withBase(app.icon)" alt="" width="56" height="56" loading="lazy" decoding="async" />
          <div class="hub-app-card-body">
            <div class="hub-app-topline"><h3>{{ app.name }}</h3><span>{{ isZh ? app.category.zh : app.category.en }}</span></div>
            <p>{{ isZh ? app.description.zh : app.description.en }}</p>
            <span class="hub-app-details">{{ copy.details }} <span aria-hidden="true">→</span></span>
          </div>
        </a>
      </div>
    </section>
  </div>
</template>

<style scoped>
.lilygo-hub {
  --hub-ink: #172033;
  --hub-muted: #667085;
  --hub-line: rgba(23, 32, 51, .12);
  --hub-soft: #f6f8fb;
  --hub-accent: #3475a4;
  max-width: 1240px;
  margin: 0 auto;
  padding: 20px 24px 64px;
  color: var(--hub-ink);
}
.dark .lilygo-hub {
  --hub-ink: #edf2ff;
  --hub-muted: #aab4c7;
  --hub-line: rgba(237, 242, 255, .16);
  --hub-soft: #1c2330;
  --hub-accent: #8bc4ec;
}
.lilygo-hub a { color: inherit; text-decoration: none; }
.lilygo-hub a:focus-visible { outline: 2px solid var(--hub-accent); outline-offset: 4px; }
.lilygo-hub-hero {
  padding: clamp(28px, 4vw, 48px);
  border-radius: 24px;
  color: #f8fbff;
  background: radial-gradient(circle at 85% 20%, rgba(111, 202, 255, .2), transparent 40%), linear-gradient(128deg, #101927 0%, #162f58 58%, #285d87 100%);
}
.hub-eyebrow { display: flex; align-items: center; gap: 9px; color: #9fdcff; font-size: 12px; font-weight: 700; letter-spacing: .16em; }
.hub-pulse { width: 8px; height: 8px; border-radius: 50%; background: #74e6b0; box-shadow: 0 0 0 5px rgba(116, 230, 176, .14); }
.lilygo-hub h1 { margin: 16px 0 12px; color: #fff; font-size: clamp(1.85rem, 4vw, 3rem); line-height: 1.2; letter-spacing: -.035em; text-wrap: balance; }
.lilygo-hub-hero > p { max-width: 720px; margin: 0; color: rgba(248, 251, 255, .78); font-size: 16px; line-height: 1.7; }
.hub-section { margin-top: 44px; }
.hub-section-heading { display: flex; align-items: baseline; justify-content: space-between; gap: 24px; margin-bottom: 20px; }
.lilygo-hub h2 { flex-shrink: 0; margin: 0; font-size: clamp(1.4rem, 2.5vw, 1.8rem); line-height: 1.3; letter-spacing: -.025em; }
.hub-section-heading p { max-width: 580px; margin: 0; color: var(--hub-muted); font-size: 13px; line-height: 1.7; text-align: right; }
.hub-update-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; }
.hub-update-card { position: relative; padding: 22px 22px 40px; border: 1px solid var(--hub-line); border-radius: 16px; background: var(--hub-soft); transition: transform .2s, border-color .2s, box-shadow .2s; }
.hub-update-card:hover, .hub-app-card:hover { border-color: rgba(70, 146, 194, .55); box-shadow: 0 12px 28px rgba(32, 74, 109, .11); transform: translateY(-3px); }
.hub-card-meta { display: flex; justify-content: space-between; gap: 12px; color: var(--hub-accent); font-size: 11px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; }
.hub-card-meta time { color: var(--hub-muted); font-weight: 500; letter-spacing: 0; }
.hub-update-card h3 { margin: 22px 0 10px; font-size: 17px; line-height: 1.4; }
.hub-update-card p { margin: 0; color: var(--hub-muted); font-size: 13px; line-height: 1.65; }
.hub-arrow { position: absolute; right: 22px; bottom: 14px; color: var(--hub-accent); font-size: 18px; }
.hub-app-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
.hub-app-card { display: flex; padding: 24px; gap: 18px; border: 1px solid var(--hub-line); border-radius: 16px; background: var(--hub-soft); transition: transform .2s, border-color .2s, box-shadow .2s; }
.hub-app-icon { display: block; flex: 0 0 56px; width: 56px; height: 56px; object-fit: contain; }
.hub-app-card-body { flex: 1; min-width: 0; }
.hub-app-topline { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.hub-app-topline h3 { margin: 0; font-size: 17px; line-height: 1.4; }
.hub-app-topline span { color: var(--hub-muted); font-size: 11px; }
.hub-app-card p { margin: 8px 0 14px; color: var(--hub-muted); font-size: 13px; line-height: 1.65; }
.hub-app-details { color: var(--hub-accent); font-size: 12px; font-weight: 600; }
@media (max-width: 1050px) {
  .hub-update-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 760px) {
  .lilygo-hub { padding: 8px 16px 48px; }
  .lilygo-hub-hero { padding: 28px 24px; border-radius: 20px; }
  .hub-section { margin-top: 32px; }
  .hub-section-heading { display: block; }
  .hub-section-heading p { margin-top: 8px; text-align: left; }
  .hub-update-grid, .hub-app-grid { grid-template-columns: 1fr; }
  .hub-app-card { padding: 20px; gap: 16px; }
}
@media (prefers-reduced-motion: reduce) {
  .hub-update-card, .hub-app-card { transition: none; }
  .hub-update-card:hover, .hub-app-card:hover { transform: none; }
}
</style>
