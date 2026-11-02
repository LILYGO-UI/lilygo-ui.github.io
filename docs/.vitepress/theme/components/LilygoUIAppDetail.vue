<script setup lang="ts">
import { computed } from 'vue'
import { useData, withBase } from 'vitepress'
import { apps, appLink, type LocalizedText } from '../data/apps'

const { localeIndex, params } = useData()
const isZh = computed(() => localeIndex.value === 'zh')
const app = computed(() => apps.find(item => item.id === params.value?.app))
const catalogLink = computed(() => isZh.value ? '/zh/applications.html' : '/applications.html')
const relatedApps = computed(() => app.value
  ? apps.filter(item => item.id !== app.value?.id && item.category.en === app.value?.category.en).slice(0, 3)
  : [])

function localized(value: LocalizedText) {
  return isZh.value ? value.zh : value.en
}

const copy = computed(() => isZh.value ? {
  back: '返回应用目录',
  catalog: '应用目录',
  introduction: '应用介绍',
  features: '主要功能',
  info: '应用信息',
  author: '开发者',
  category: '分类',
  version: '目录版本快照',
  unknownVersion: '查看 Releases',
  updated: '更新时间',
  unknownUpdated: '查看仓库记录',
  source: '源码托管',
  repository: '查看源码',
  releases: '版本与下载',
  installation: '安装说明',
  releaseNote: '可用版本、安装包和设备兼容性以应用仓库说明为准。',
  feedback: '反馈与建议',
  feedbackText: '发现问题或有新的想法？前往应用仓库查看已有讨论，或提交反馈。',
  issues: '前往 Issues',
  related: '同类应用',
  details: '查看详情',
  allApps: '查看全部应用',
  missing: '未找到此应用',
  missingText: '此应用可能已移动或暂未收录。请返回目录浏览其他应用。',
  external: '在新标签页打开',
} : {
  back: 'Back to applications',
  catalog: 'Applications',
  introduction: 'About this app',
  features: 'Features',
  info: 'App information',
  author: 'Developer',
  category: 'Category',
  version: 'Catalog version snapshot',
  unknownVersion: 'See releases',
  updated: 'Updated',
  unknownUpdated: 'See repository history',
  source: 'Source hosting',
  repository: 'View source',
  releases: 'Releases & downloads',
  installation: 'Setup instructions',
  releaseNote: 'See the application repository for available releases, packages, and device compatibility.',
  feedback: 'Feedback & ideas',
  feedbackText: 'Found a problem or have an idea? Visit the application repository to browse discussions or share feedback.',
  issues: 'Open issues',
  related: 'Similar applications',
  details: 'View details',
  allApps: 'View all applications',
  missing: 'Application not found',
  missingText: 'This application may have moved or is not in the catalog yet. Return to the catalog to explore other apps.',
  external: 'Opens in a new tab',
})
</script>

<template>
  <div class="lilygo-app-detail">
    <nav class="detail-navigation" :aria-label="copy.catalog">
      <a :href="catalogLink" class="detail-back">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="m10 5-7 7 7 7M3 12h18" /></svg>
        {{ copy.back }}
      </a>
    </nav>

    <div v-if="app" class="detail-layout">
      <div class="detail-main">
        <header class="detail-identity">
          <img class="detail-app-icon" :src="withBase(app.icon)" alt="" width="94" height="94" decoding="async" />
          <div class="detail-identity-copy">
            <span class="detail-category">{{ localized(app.category) }}</span>
            <h1>{{ app.name }}</h1>
            <span class="detail-author">@{{ app.author }}</span>
          </div>
          <p>{{ localized(app.description) }}</p>
        </header>

        <section class="detail-content" aria-labelledby="app-introduction">
          <h2 id="app-introduction">{{ copy.introduction }}</h2>
          <p>{{ localized(app.overview || app.description) }}</p>
          <div v-if="app.features.length" class="detail-features">
            <h2>{{ copy.features }}</h2>
            <ul>
              <li v-for="feature in app.features" :key="feature.en">
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="m5 10 3 3 7-7" /></svg>
                <span>{{ localized(feature) }}</span>
              </li>
            </ul>
          </div>
        </section>

        <section class="detail-feedback" aria-labelledby="app-feedback">
          <div class="detail-feedback-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M20 11.5a7.5 7.5 0 0 1-7.5 7.5H8l-5 3v-6a7.5 7.5 0 0 1 5.5-12H12M17 3v6m-3-3h6" /></svg>
          </div>
          <div><h2 id="app-feedback">{{ copy.feedback }}</h2><p>{{ copy.feedbackText }}</p></div>
          <a :href="`${app.repo}/issues`" target="_blank" rel="noopener noreferrer">{{ copy.issues }} <span aria-hidden="true">↗</span><span class="detail-sr-only"> ({{ copy.external }})</span></a>
        </section>

        <section v-if="relatedApps.length" class="detail-related" aria-labelledby="app-related">
          <div class="detail-section-heading"><h2 id="app-related">{{ copy.related }}</h2><a :href="catalogLink">{{ copy.allApps }} <span aria-hidden="true">→</span></a></div>
          <div class="detail-related-grid">
            <a v-for="related in relatedApps" :key="related.id" :href="appLink(related, isZh)" class="detail-related-card">
              <img class="detail-related-icon" :src="withBase(related.icon)" alt="" width="34" height="34" loading="lazy" decoding="async" />
              <div><h3>{{ related.name }}</h3><span>{{ localized(related.category) }}</span></div>
              <span class="detail-related-arrow" aria-hidden="true">↗</span>
              <p>{{ localized(related.description) }}</p>
              <span class="detail-related-link">{{ copy.details }} <span aria-hidden="true">→</span></span>
            </a>
          </div>
        </section>
      </div>

      <aside class="detail-sidebar" :aria-label="copy.info">
        <div class="detail-info-panel">
          <h2>{{ copy.info }}</h2>
          <dl>
            <div><dt>{{ copy.author }}</dt><dd>{{ app.author }}</dd></div>
            <div><dt>{{ copy.category }}</dt><dd>{{ localized(app.category) }}</dd></div>
            <div><dt>{{ copy.version }}</dt><dd><template v-if="app.version">{{ app.version }}<span v-if="app.status" class="detail-version-status">{{ localized(app.status) }}</span></template><a v-else :href="`${app.repo}/releases`" target="_blank" rel="noopener noreferrer">{{ copy.unknownVersion }} <span aria-hidden="true">↗</span><span class="detail-sr-only"> ({{ copy.external }})</span></a></dd></div>
            <div><dt>{{ copy.updated }}</dt><dd><time v-if="app.updated" :datetime="app.updated">{{ app.updated }}</time><a v-else :href="`${app.repo}/commits`" target="_blank" rel="noopener noreferrer">{{ copy.unknownUpdated }} <span aria-hidden="true">↗</span><span class="detail-sr-only"> ({{ copy.external }})</span></a></dd></div>
            <div><dt>{{ copy.source }}</dt><dd>GitHub</dd></div>
          </dl>
          <div class="detail-actions">
            <a class="detail-action-primary" :href="app.repo" target="_blank" rel="noopener noreferrer"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="m8 7-5 5 5 5m8-10 5 5-5 5m-3-13-2 16" /></svg>{{ copy.repository }}<span aria-hidden="true">↗</span><span class="detail-sr-only"> ({{ copy.external }})</span></a>
            <a :href="`${app.repo}/releases`" target="_blank" rel="noopener noreferrer"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M12 3v12m-5-5 5 5 5-5M4 15v5h16v-5" /></svg>{{ copy.releases }}<span aria-hidden="true">↗</span><span class="detail-sr-only"> ({{ copy.external }})</span></a>
            <a :href="`${app.repo}#readme`" target="_blank" rel="noopener noreferrer"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M12 5v15M3 4h5a4 4 0 0 1 4 2 4 4 0 0 1 4-2h5v15h-5a4 4 0 0 0-4 2 4 4 0 0 0-4-2H3Z" /></svg>{{ copy.installation }}<span aria-hidden="true">↗</span><span class="detail-sr-only"> ({{ copy.external }})</span></a>
          </div>
          <p class="detail-release-note">{{ copy.releaseNote }}</p>
        </div>
      </aside>
    </div>

    <div v-else class="detail-missing">
      <h1>{{ copy.missing }}</h1>
      <p>{{ copy.missingText }}</p>
      <a :href="catalogLink">{{ copy.back }} <span aria-hidden="true">→</span></a>
    </div>
  </div>
</template>

<style scoped>
.lilygo-app-detail { --detail-ink: #172033; --detail-muted: #667085; --detail-line: rgba(23, 32, 51, .12); --detail-soft: #f6f8fb; --detail-surface: #fff; --detail-blue: #326f98; max-width: 1180px; margin: 0 auto; padding: 18px 24px 76px; color: var(--detail-ink); }
.dark .lilygo-app-detail { --detail-ink: #edf2ff; --detail-muted: #aab4c7; --detail-line: rgba(237, 242, 255, .14); --detail-soft: #1c2330; --detail-surface: #171c26; --detail-blue: #88c6ee; }
.lilygo-app-detail a { color: var(--detail-blue); text-decoration: none; }
.lilygo-app-detail a:focus-visible { outline: 3px solid var(--detail-blue); outline-offset: 5px; border-radius: 4px; }
.detail-navigation { display: flex; align-items: center; justify-content: space-between; gap: 16px; min-height: 44px; margin-bottom: 28px; padding-bottom: 16px; border-bottom: 1px solid var(--detail-line); }
.detail-back { display: inline-flex; align-items: center; gap: 10px; min-height: 28px; font-size: 13px; font-weight: 600; }
.detail-back svg { width: 18px; height: 18px; }
.detail-layout { display: grid; grid-template-columns: minmax(0, 2.2fr) minmax(280px, 1fr); align-items: start; gap: 28px; }
.detail-main { min-width: 0; }
.detail-identity { display: flex; align-items: center; flex-wrap: wrap; column-gap: 22px; padding: 12px 0 28px; }
.detail-app-icon { display: block; width: 94px; height: 94px; flex: 0 0 94px; object-fit: contain; }
.detail-identity-copy { min-width: 0; }
.detail-category { display: inline-block; padding: 3px 9px; border: 1px solid var(--detail-line); border-radius: 6px; color: var(--detail-muted); font-size: 11px; line-height: 1.5; }
.detail-identity h1 { margin: 8px 0 4px; font-size: clamp(30px, 3.8vw, 42px); font-weight: 700; letter-spacing: -.04em; line-height: 1.2; overflow-wrap: anywhere; }
.detail-author { color: var(--detail-muted); font-size: 12px; }
.detail-identity > p { flex: 0 0 100%; margin: 23px 0 0; color: var(--detail-muted); font-size: 16px; line-height: 1.75; }
.detail-content { padding: 28px; border: 1px solid var(--detail-line); border-radius: 16px; background: var(--detail-surface); }
.lilygo-app-detail h2 { margin: 0; font-size: 17px; font-weight: 650; line-height: 1.5; letter-spacing: -.01em; }
.detail-content > p { margin: 14px 0 0; color: var(--detail-muted); font-size: 14px; line-height: 1.85; }
.detail-features { margin-top: 28px; padding-top: 24px; border-top: 1px solid var(--detail-line); }
.detail-features ul { display: grid; gap: 14px; margin: 16px 0 0; padding: 0; list-style: none; }
.detail-features li { display: flex; align-items: flex-start; gap: 12px; color: var(--detail-muted); font-size: 14px; line-height: 1.7; }
.detail-features svg { width: 21px; height: 21px; flex: 0 0 21px; margin-top: 1px; border-radius: 50%; color: #27808d; background: rgba(58, 168, 175, .12); }
.dark .detail-features svg { color: #7ad3d5; }
.detail-sidebar { position: sticky; top: 88px; }
.detail-info-panel { padding: 24px; border: 1px solid var(--detail-line); border-radius: 16px; background: var(--detail-soft); }
.detail-info-panel h2 { padding-bottom: 18px; border-bottom: 1px solid var(--detail-line); }
.detail-info-panel dl { display: grid; gap: 17px; margin: 22px 0 26px; }
.detail-info-panel dl > div { display: flex; align-items: baseline; justify-content: space-between; gap: 14px; font-size: 12px; line-height: 1.6; }
.detail-info-panel dt { flex: 0 1 auto; color: var(--detail-muted); }
.detail-info-panel dd { flex: 0 1 auto; margin: 0; text-align: right; font-weight: 500; overflow-wrap: anywhere; }
.detail-info-panel dd a:hover { text-decoration: underline; }
.detail-version-status { display: block; color: var(--detail-muted); font-size: 11px; font-weight: 400; }
.detail-actions { display: grid; gap: 10px; }
.detail-actions a { display: flex; align-items: center; gap: 10px; min-height: 44px; padding: 10px 13px; border: 1px solid var(--detail-line); border-radius: 9px; color: var(--detail-ink); background: var(--detail-surface); font-size: 12px; font-weight: 600; transition: border-color .15s, background .15s; }
.detail-actions a:hover { border-color: var(--detail-blue); }
.detail-actions a.detail-action-primary { border-color: #286285; color: #fff; background: #286285; }
.detail-actions a.detail-action-primary:hover { background: #1d526f; }
.detail-actions svg { width: 18px; height: 18px; flex: 0 0 18px; }
.detail-actions a > span[aria-hidden] { margin-left: auto; }
.detail-release-note { margin: 18px 0 0; color: var(--detail-muted); font-size: 11px; line-height: 1.8; }
.detail-feedback { display: flex; align-items: flex-start; gap: 14px; margin-top: 20px; padding: 22px; border: 1px solid rgba(77, 159, 185, .25); border-radius: 14px; background: rgba(112, 220, 192, .08); }
.detail-feedback-icon { display: grid; place-items: center; flex: 0 0 34px; width: 34px; height: 34px; border-radius: 10px; color: #25869a; background: rgba(77, 159, 185, .1); }
.dark .detail-feedback-icon { color: #7ad3d5; }
.detail-feedback-icon svg { width: 22px; height: 22px; }
.detail-feedback h2 { font-size: 14px; }
.detail-feedback p { margin: 5px 0 0; color: var(--detail-muted); font-size: 12px; line-height: 1.8; }
.detail-feedback > a { flex-shrink: 0; align-self: center; font-size: 12px; font-weight: 600; }
.detail-related { margin-top: 34px; }
.detail-section-heading { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 16px; }
.detail-section-heading > a { font-size: 12px; }
.detail-related-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
.detail-related-card { display: flex; align-items: center; flex-wrap: wrap; gap: 10px; padding: 17px; border: 1px solid var(--detail-line); border-radius: 12px; background: var(--detail-soft); transition: border-color .15s; }
.detail-related-card:hover { border-color: var(--detail-blue); }
.detail-related-icon { display: block; width: 34px; height: 34px; flex: 0 0 34px; object-fit: contain; }
.detail-related-card h3 { margin: 0; color: var(--detail-ink); font-size: 13px; line-height: 1.5; }
.detail-related-card > div > span { color: var(--detail-muted); font-size: 10px; }
.detail-related-arrow { margin-left: auto; color: var(--detail-muted); }
.detail-related-card p { flex: 0 0 100%; align-self: stretch; margin: 5px 0; color: var(--detail-muted); font-size: 12px; line-height: 1.7; }
.detail-related-link { align-self: flex-end; font-size: 11px; font-weight: 600; }
.detail-missing { padding: 72px 24px; border: 1px solid var(--detail-line); border-radius: 16px; background: var(--detail-soft); text-align: center; }
.detail-missing h1 { margin: 0; font-size: 30px; line-height: 1.4; }
.detail-missing p { margin: 16px 0 24px; color: var(--detail-muted); line-height: 1.75; }
.detail-sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
@media (max-width: 1050px) { .detail-layout { gap: 22px; grid-template-columns: minmax(0, 1.8fr) minmax(270px, 1fr); } .detail-related-grid { grid-template-columns: 1fr; } .detail-related-card p { margin: 0; } .detail-feedback { flex-wrap: wrap; } .detail-feedback > div:nth-child(2) { flex: 1; } .detail-feedback > a { margin-left: 48px; } }
@media (max-width: 760px) { .lilygo-app-detail { padding: 8px 16px 56px; } .detail-navigation { margin-bottom: 20px; } .detail-layout { display: flex; flex-direction: column; gap: 24px; } .detail-main, .detail-sidebar { width: 100%; } .detail-sidebar { position: static; } .detail-identity { column-gap: 17px; padding-top: 4px; } .detail-app-icon { width: 76px; height: 76px; flex-basis: 76px; } .detail-identity-copy { flex: 1; } .detail-identity h1 { font-size: 32px; } .detail-identity > p { font-size: 14px; } .detail-content { padding: 22px; } .detail-info-panel { padding: 22px; } .detail-section-heading { align-items: baseline; } .detail-section-heading > a { font-size: 11px; } .detail-feedback { padding: 20px; } }
</style>
