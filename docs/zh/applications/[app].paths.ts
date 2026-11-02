import { apps } from '../../.vitepress/theme/data/apps'

export default {
  paths() {
    return apps.map(app => ({
      params: { app: app.id },
      content: `---
title: ${JSON.stringify(`${app.name} 应用详情`)}
description: ${JSON.stringify(app.description.zh)}
layout: page
sidebar: false
aside: false
show_source: false
---`,
    }))
  },
}
