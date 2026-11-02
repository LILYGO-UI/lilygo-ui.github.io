import { defineConfig } from 'vitepress'

const sharedNav = [
  { text: 'Project hub', link: '/' },
  { text: 'Applications', link: '/applications.html' },
  { text: 'Documentation', link: '/docs.html' },
  { text: 'File sharing', link: '/file-share.html' },
]

const sharedSidebar = [
  { text: 'Project hub', link: '/' },
  { text: 'Applications', link: '/applications.html' },
  { text: 'Documentation center', link: '/docs.html' },
  { text: 'Quick start', link: '/quick-start.html' },
  { text: 'Development guide', link: '/development.html' },
  { text: 'T-Display-CM0 hardware', link: '/hardware.html' },
  { text: 'FAQ', link: '/faq.html' },
  { text: 'Browser file sharing', link: '/file-share.html' },
]

const zhNav = [
  { text: '项目中心', link: '/zh/' },
  { text: '应用目录', link: '/zh/applications.html' },
  { text: '文档中心', link: '/zh/docs.html' },
  { text: '文件共享', link: '/zh/file-share.html' },
]

const zhSidebar = [
  { text: '项目中心', link: '/zh/' },
  { text: '应用目录', link: '/zh/applications.html' },
  { text: '文档中心', link: '/zh/docs.html' },
  { text: '快速开始', link: '/zh/quick-start.html' },
  { text: '开发指南', link: '/zh/development.html' },
  { text: 'T-Display-CM0 硬件', link: '/zh/hardware.html' },
  { text: '常见问题', link: '/zh/faq.html' },
  { text: '浏览器文件共享', link: '/zh/file-share.html' },
]

export default defineConfig({
  title: 'LILYGO UI',
  description: 'LILYGO UI project hub, application catalog, and developer documentation.',
  lang: 'en-US',
  cleanUrls: false,
  locales: {
    root: { label: 'English', lang: 'en' },
    zh: {
      label: '简体中文',
      lang: 'zh-CN',
      themeConfig: {
        nav: zhNav,
        sidebar: { '/zh/': zhSidebar },
      },
    },
  },
  themeConfig: {
    nav: sharedNav,
    sidebar: {
      '/': sharedSidebar,
    },
    search: { provider: 'local' },
    outline: { level: [2, 3] },
  },
})
