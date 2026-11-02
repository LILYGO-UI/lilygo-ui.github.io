import { apps } from '../.vitepress/theme/data/apps'

export default {
  paths() {
    return apps.map(app => ({
      params: { app: app.id },
      content: `---
title: ${JSON.stringify(app.name)}
description: ${JSON.stringify(app.description.en)}
layout: page
sidebar: false
aside: false
show_source: false
---`,
    }))
  },
}
