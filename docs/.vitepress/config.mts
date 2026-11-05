import { defineConfig } from 'vitepress'
import { guideGroups } from './theme/data/guides'

const sharedNav = [
  { text: 'Project hub', link: '/' },
  { text: 'Applications', link: '/applications.html' },
  { text: 'Documentation', link: '/docs.html' },
  { text: 'File sharing', link: '/file-share.html' },
]

function documentationSidebar(isZh: boolean) {
  const prefix = isZh ? '/zh' : ''
  const page = (en: string, zh: string, path: string) => ({
    text: isZh ? zh : en,
    link: `${prefix}/${path}.html`,
  })
  return [
    page('Documentation center', '文档中心', 'docs'),
    {
      ...page('Quick start', '快速开始', 'device-quick-start'),
      items: [
        {
          text: isZh ? '下载系统镜像' : 'Download system image',
          link: `${prefix}/device-quick-start.html#download-image`,
        },
        {
          text: isZh ? 'USB 烧录镜像' : 'Flash over USB',
          link: `${prefix}/device-quick-start.html#usb-flashing`,
        },
        {
          text: isZh ? 'TF 卡烧录镜像' : 'Flash a TF card',
          link: `${prefix}/device-quick-start.html#tf-flashing`,
        },
        {
          text: isZh ? 'Imager 图文步骤（共用）' : 'Shared Imager walkthrough',
          link: `${prefix}/device-quick-start.html#imager-flashing`,
        },
      ],
    },
    {
      ...page('Developer documentation', '开发文档', 'developer-guide'),
      items: [
        page('Development quick start', '开发快速开始', 'quick-start'),
        page('Development guide', '开发指南', 'development'),
        page('Keyboard integration', '键盘接入指南', 'keyboard-input'),
        {
          text: isZh ? '硬件资料（官方 Wiki）' : 'Hardware reference (Chinese Wiki)',
          link: 'https://wiki.lilygo.cc/zh/products/t-display-series/t-display-cm0/',
        },
        page('FAQ', '常见问题', 'faq'),
      ],
    },
    {
      ...page('User documentation', '使用文档', 'user-guide'),
      items: [
        page('Getting started and all apps', '使用入门与全部应用', 'user-guide'),
        page('Browser file sharing', '浏览器文件共享', 'file-share'),
        page('SSH remote login', 'SSH 远程登录', 'ssh-login'),
        ...guideGroups.map(group => ({
          text: isZh ? group.title.zh : group.title.en,
          collapsed: true,
          items: group.items.map(guide => ({ text: guide.name, link: `${prefix}/guide/${guide.id}.html` })),
        })),
      ],
    },
  ]
}

const sharedSidebar = documentationSidebar(false)

const zhNav = [
  { text: '项目中心', link: '/zh/' },
  { text: '应用目录', link: '/zh/applications.html' },
  { text: '文档中心', link: '/zh/docs.html' },
  { text: '文件共享', link: '/zh/file-share.html' },
]

const zhSidebar = documentationSidebar(true)

export default defineConfig({
  title: 'LILYGO UI',
  description: 'LILYGO UI project hub, application catalog, device quick start, developer documentation, and application user guides.',
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
