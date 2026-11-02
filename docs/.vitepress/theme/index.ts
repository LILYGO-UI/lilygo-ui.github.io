import DefaultTheme from 'vitepress/theme'
import LilygoUIHub from './components/LilygoUIHub.vue'
import LilygoUIAppCatalog from './components/LilygoUIAppCatalog.vue'
import LilygoUIAppDetail from './components/LilygoUIAppDetail.vue'
import LilygoUIFileShare from './components/LilygoUIFileShare.vue'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }: { app: any }) {
    app.component('LilygoUIHub', LilygoUIHub)
    app.component('LilygoUIAppCatalog', LilygoUIAppCatalog)
    app.component('LilygoUIAppDetail', LilygoUIAppDetail)
    app.component('LilygoUIFileShare', LilygoUIFileShare)
  },
}
