export type LocalizedText = { en: string; zh: string }

export type CatalogApp = {
  id: string
  name: string
  repo: string
  category: LocalizedText
  description: LocalizedText
  icon: string
  author: string
  features: LocalizedText[]
  overview?: LocalizedText
  version?: string
  status?: LocalizedText
  updated?: string
}

// Descriptions and features follow the applications' source README files.
// Release fields are the same registry snapshot used by the project hub.
export const apps: CatalogApp[] = [
  {
    id: 'calculator', name: 'Calculator', repo: 'https://github.com/LILYGO-UI/calculator',
    category: { en: 'Utility', zh: '工具' },
    description: { en: 'A touch-friendly scientific calculator.', zh: '支持触摸操作的科学计算器。' },
    icon: '/app-icons/calculator.svg', author: 'LILYGO-UI',
    overview: { en: 'A calculator that adapts from a four-column portrait keypad to a scientific landscape layout while keeping your expression and memory.', zh: '竖屏提供四列数字键盘，横屏展开科学计算键盘，切换方向时保留表达式和记忆状态。' },
    features: [
      { en: 'Arithmetic, parentheses, percentages, and live expression previews.', zh: '支持四则运算、括号、百分比和实时表达式预览。' },
      { en: 'Powers, roots, trigonometric functions, logarithms, and factorials.', zh: '提供幂、开方、三角函数、对数和阶乘。' },
      { en: 'Constants, calculator memory, and degree or radian angle modes.', zh: '内置常数、计算记忆以及角度和弧度模式。' },
    ],
  },
  {
    id: 'files', name: 'Files', repo: 'https://github.com/LILYGO-UI/files',
    category: { en: 'System', zh: '系统' },
    description: { en: 'A file manager for browsing local storage.', zh: '浏览本地存储的文件管理器。' },
    icon: '/app-icons/files.svg', author: 'LILYGO-UI', version: '0.1.1', updated: '2026-10-12',
    overview: { en: 'Browse and organize files within a configured filesystem root, with touch and keyboard navigation and an in-app help reference.', zh: '在配置的文件系统根目录内浏览和整理文件，支持触摸与键盘导航，并提供应用内帮助。' },
    features: [
      { en: 'Switch between icon and list views, sort items, and search the current directory.', zh: '切换图标或列表视图，对项目排序并搜索当前目录。' },
      { en: 'Create folders, copy, move, rename, duplicate, delete, and compress items to ZIP.', zh: '支持新建文件夹、复制、移动、重命名、创建副本、删除和 ZIP 压缩。' },
      { en: 'Preview text files and select multiple items for batch operations.', zh: '预览文本文件，并通过多选批量处理文件。' },
    ],
  },
  {
    id: 'gallery', name: 'Gallery', repo: 'https://github.com/LILYGO-UI/gallery',
    category: { en: 'Media', zh: '媒体' },
    description: { en: 'A standalone photo browser.', zh: '独立图片浏览器。' },
    icon: '/app-icons/gallery.png', author: 'LILYGO-UI',
    overview: { en: 'Browse local camera photos, screenshots, and bundled samples in a responsive photo library with albums and full-screen viewing.', zh: '在自适应图库中浏览本地相机照片、截图和内置示例，支持相册分类和全屏查看。' },
    features: [
      { en: 'Browse Library, Camera, Screenshots, and Samples collections.', zh: '浏览图库、相机、截图和示例图片集合。' },
      { en: 'Navigate full-screen photos with swipes, previous/next controls, or a thumbnail filmstrip.', zh: '通过滑动、上一张/下一张按钮或缩略图条切换全屏图片。' },
      { en: 'Inspect filenames, dates, image sizes, sources, and storage locations.', zh: '查看文件名、日期、图片大小、来源和存储位置。' },
    ],
  },
  {
    id: 'i2c-detector', name: 'I2C Detector', repo: 'https://github.com/LILYGO-UI/i2c-detector',
    category: { en: 'Hardware', zh: '硬件' },
    description: { en: 'Scans Linux I2C buses and reports 7-bit addresses.', zh: '扫描 Linux I2C 总线并显示 7-bit 地址。' },
    icon: '/app-icons/i2c-detector.svg', author: 'LILYGO-UI',
    overview: { en: 'Discover Linux I2C adapters and inspect their scan results in a complete hexadecimal address map.', zh: '发现 Linux I2C 适配器，并通过完整的十六进制地址矩阵查看扫描结果。' },
    features: [
      { en: 'Automatically discover available I2C buses and rescan on demand.', zh: '自动发现可用 I2C 总线，并可手动重新扫描。' },
      { en: 'Switch between buses and inspect detected addresses in a 7-bit address map.', zh: '切换总线，在 7-bit 地址矩阵中查看探测到的地址。' },
      { en: 'See address counts, unavailable adapters, and per-bus scan errors.', zh: '显示地址数量、不可用适配器及各总线的扫描错误。' },
    ],
  },
  {
    id: 'imu', name: 'IMU', repo: 'https://github.com/LILYGO-UI/imu',
    category: { en: 'Hardware', zh: '硬件' },
    description: { en: 'A six-axis motion viewer.', zh: '查看六轴运动数据。' },
    icon: '/app-icons/imu.png', author: 'LILYGO-UI',
    overview: { en: 'Visualize the onboard accelerometer and gyroscope through a moving ball and live six-axis readings on T-DisplayCM0.', zh: '在 T-DisplayCM0 上通过小球运动和实时六轴读数，可视化板载加速度计与陀螺仪数据。' },
    features: [
      { en: 'A ball follows board tilt and responds to sudden acceleration.', zh: '小球随板卡倾斜移动，并对突然加速作出响应。' },
      { en: 'Read acceleration and angular velocity on all three axes.', zh: '查看三个轴的加速度与角速度。' },
      { en: 'Pause, reset, calibrate a neutral position, and adjust motion sensitivity.', zh: '支持暂停、复位、校准中立位置和调整运动灵敏度。' },
    ],
  },
  {
    id: 'nes', name: 'NES', repo: 'https://github.com/LILYGO-UI/nes',
    category: { en: 'Entertainment', zh: '娱乐' },
    description: { en: 'A game application published in the LILYGO UI registry.', zh: '已进入 LILYGO UI 注册表的游戏应用。' },
    icon: '/app-icons/nes.png', author: 'LILYGO-UI', version: '0.1.1', updated: '2026-10-09',
    overview: { en: 'Play user-provided NES ROMs with the FCEUmm emulator core, on-screen controls, and audio. Commercial game ROMs are not included.', zh: '使用 FCEUmm 模拟器核心运行用户提供的 NES ROM，支持屏幕按键和音频，不附带商业游戏 ROM。' },
    features: [
      { en: 'Browse, import, and refresh a local ROM library.', zh: '浏览、导入和刷新本地 ROM 游戏库。' },
      { en: 'Save and restore one manual game state per ROM.', zh: '为每个 ROM 保存和恢复一个手动游戏存档。' },
      { en: 'Use touch controls or customize the player-one keyboard mapping.', zh: '使用触摸按键，或自定义一号玩家的键盘映射。' },
    ],
  },
  {
    id: 'launcher', name: 'Launcher', repo: 'https://github.com/LILYGO-UI/launcher',
    category: { en: 'Platform', zh: '平台' },
    description: { en: 'Starts and organizes installed applications.', zh: '启动和管理已安装的应用。' },
    icon: '/app-icons/launcher.png', author: 'LILYGO-UI', version: '0.1.2-rc2', updated: '2026-10-13',
    status: { en: 'Candidate', zh: '候选版' },
    overview: { en: 'The application home screen for LILYGO Linux products, with automatic discovery of installed applications and quick system controls.', zh: 'LILYGO Linux 产品的应用主屏幕，自动发现已安装应用，并提供快捷系统控制。' },
    features: [
      { en: 'Installed applications appear automatically through their application manifests.', zh: '通过应用清单自动发现并展示已安装的应用。' },
      { en: 'Browse a paged application grid in portrait or landscape orientation.', zh: '以横屏或竖屏分页网格浏览应用。' },
      { en: 'Access quick controls for orientation, brightness, volume, and power.', zh: '通过快捷面板控制屏幕方向、亮度、音量和电源。' },
    ],
  },
  {
    id: 'maps', name: 'Maps', repo: 'https://github.com/LILYGO-UI/maps',
    category: { en: 'Network', zh: '网络' },
    description: { en: 'An online map viewer.', zh: '在线地图查看器。' },
    icon: '/app-icons/maps.svg', author: 'LILYGO-UI',
    overview: { en: 'Explore OpenStreetMap, search addresses, and reuse downloaded map tiles. Startup location is estimated from the public IP address.', zh: '浏览 OpenStreetMap、搜索地址并复用已下载地图瓦片，启动位置依据公网 IP 进行估算。' },
    features: [
      { en: 'Drag the map to pan and use zoom controls to explore.', zh: '拖动平移地图，并通过缩放控件浏览不同区域。' },
      { en: 'Search Chinese and English addresses with OpenStreetMap Nominatim.', zh: '通过 OpenStreetMap Nominatim 搜索中文和英文地址。' },
      { en: 'Reuse cached map tiles and inspect or clear the local cache.', zh: '复用已缓存地图瓦片，并查看或清理本地缓存。' },
    ],
  },
  {
    id: 'monitor', name: 'Monitor', repo: 'https://github.com/LILYGO-UI/monitor',
    category: { en: 'System', zh: '系统' },
    description: { en: 'A lightweight system dashboard.', zh: '轻量系统仪表盘。' },
    icon: '/app-icons/monitor.png', author: 'LILYGO-UI',
    overview: { en: 'Keep track of device health with a system dashboard that refreshes every second and provides recent measurement trends.', zh: '通过每秒刷新的系统仪表盘查看设备运行状况，并查看近期测量数据的变化趋势。' },
    features: [
      { en: 'Monitor CPU, memory, storage, temperature, and system uptime.', zh: '监测 CPU、内存、存储、温度和系统运行时间。' },
      { en: 'Inspect network interfaces, IP addresses, and live upload/download rates.', zh: '查看网络接口、IP 地址以及实时上传和下载速率。' },
      { en: 'Open a measurement card for a 60-sample trend chart and statistics.', zh: '点开测量卡片，查看最近 60 个样本的趋势图和统计数据。' },
    ],
  },
  {
    id: 'radio', name: 'Radio', repo: 'https://github.com/LILYGO-UI/radio',
    category: { en: 'Media', zh: '媒体' },
    description: { en: 'Discover and play Radio Browser stations.', zh: '发现并播放 Radio Browser 电台。' },
    icon: '/app-icons/radio.png', author: 'LILYGO-UI',
    overview: { en: 'An internet radio player for discovering stations, keeping favorites, and listening to custom HTTP or HTTPS audio streams.', zh: '用于发现电台、保存收藏和播放自定义 HTTP 或 HTTPS 音频流的网络收音机。' },
    features: [
      { en: 'Browse popular stations and search the Radio Browser directory by name.', zh: '浏览热门电台，并在 Radio Browser 目录中按名称搜索。' },
      { en: 'Save favorite stations and play custom audio stream URLs.', zh: '保存喜爱的电台，并播放自定义音频流地址。' },
      { en: 'Set a sleep timer to stop playback after a selected interval.', zh: '设置睡眠定时器，在指定时间后停止播放。' },
    ],
  },
  {
    id: 'sensors', name: 'Sensors', repo: 'https://github.com/LILYGO-UI/sensors',
    category: { en: 'Hardware', zh: '硬件' },
    description: { en: 'Native sensor and input diagnostics.', zh: '原生传感器和输入诊断工具。' },
    icon: '/app-icons/sensors.svg', author: 'LILYGO-UI',
    overview: { en: 'Inspect sensor measurements and input devices exposed by Linux drivers on T-DisplayCM0, with per-device details and recording tools.', zh: '查看 T-DisplayCM0 上由 Linux 驱动提供的传感器测量值与输入设备，提供设备详情和数据记录工具。' },
    features: [
      { en: 'Discover sensors and view live measurements, history, and statistics.', zh: '发现传感器，查看实时测量、历史记录和统计数据。' },
      { en: 'Record selected sensor channels to CSV files.', zh: '将选定传感器通道的数据记录为 CSV 文件。' },
      { en: 'Inspect TCA8418 keyboard state and recent input events.', zh: '查看 TCA8418 键盘状态及最近的输入事件。' },
    ],
  },
  {
    id: 'settings', name: 'Settings', repo: 'https://github.com/LILYGO-UI/settings',
    category: { en: 'System', zh: '系统' },
    description: { en: 'The system settings interface.', zh: '系统设置界面。' },
    icon: '/app-icons/settings.png', author: 'LILYGO-UI',
    overview: { en: 'A dedicated settings application for LILYGO Linux products, grouping device connectivity, battery, and general settings in one interface.', zh: '面向 LILYGO Linux 产品的独立设置应用，在同一界面集中展示连接、电池和通用设置。' },
    features: [
      { en: 'Open dedicated Wi-Fi, Bluetooth, Ethernet, and Battery pages.', zh: '提供独立的 Wi-Fi、蓝牙、以太网和电池页面。' },
      { en: 'Access General settings, keyboard vibration controls, and About.', zh: '访问通用设置、键盘振动控制和关于页面。' },
      { en: 'Use single-page portrait navigation or a landscape category sidebar.', zh: '竖屏采用单页导航，横屏显示分类侧栏。' },
    ],
  },
  {
    id: 'serial', name: 'Serial', repo: 'https://github.com/LILYGO-UI/serial',
    category: { en: 'Hardware', zh: '硬件' },
    description: { en: 'Serial communication tools for device development.', zh: '面向设备开发的串口工具。' },
    icon: '/app-icons/serial.png', author: 'LILYGO-UI',
    overview: { en: 'Debug USB and UART serial connections from a touch interface, with configurable connection settings and separate receive and send panels.', zh: '通过触摸界面调试 USB 和 UART 串口连接，支持连接参数配置以及独立的接收和发送面板。' },
    features: [
      { en: 'Discover serial ports and configure baud rate, data bits, parity, and flow control.', zh: '发现串口，并配置波特率、数据位、校验位和流量控制。' },
      { en: 'Inspect received data in ASCII or HEX with timestamps and byte counters.', zh: '以 ASCII 或 HEX 查看接收数据，支持时间戳和字节计数。' },
      { en: 'Send ASCII or HEX data with selectable line endings.', zh: '发送 ASCII 或 HEX 数据，并选择行结束符。' },
    ],
  },
  {
    id: 'store', name: 'Store', repo: 'https://github.com/LILYGO-UI/store',
    category: { en: 'Platform', zh: '平台' },
    description: { en: 'The application store client.', zh: '应用商店客户端。' },
    icon: '/app-icons/store.svg', author: 'LILYGO-UI', version: '0.1.2', updated: '2026-10-12',
    overview: { en: 'Browse the LILYGO UI registry and manage installed applications directly on a device through a responsive application store.', zh: '通过自适应应用商店，直接在设备上浏览 LILYGO UI 注册表并管理已安装应用。' },
    features: [
      { en: 'Browse applications and filter Official or Community sources.', zh: '浏览应用，并按官方或社区来源筛选。' },
      { en: 'View application descriptions, authors, versions, and package sizes.', zh: '查看应用描述、作者、版本和安装包大小。' },
      { en: 'Install, update, or remove applications and inspect installed packages.', zh: '安装、更新或移除应用，并查看已安装的软件包。' },
    ],
  },
  {
    id: 'template', name: 'Template', repo: 'https://github.com/LILYGO-UI/template',
    category: { en: 'Developer', zh: '开发' },
    description: { en: 'A starter project for building LILYGO UI applications.', zh: '用于开发 LILYGO UI 应用的 starter 项目。' },
    icon: '/app-icons/template.png', author: 'LILYGO-UI',
    overview: { en: 'Start a standalone application from a responsive counter example that demonstrates the LILYGO UI AppKit lifecycle, project structure, and packaging workflow.', zh: '从自适应计数器示例开始构建独立应用，学习 LILYGO UI AppKit 生命周期、项目结构和打包流程。' },
    features: [
      { en: 'A testable C++ Model/ViewModel/View example with reactive LVGL bindings.', zh: '提供可测试的 C++ Model/ViewModel/View 示例及响应式 LVGL 绑定。' },
      { en: 'Demonstrates application identity, Launcher discovery, and desktop metadata.', zh: '演示应用标识、Launcher 发现机制和桌面元数据。' },
      { en: 'Includes host simulator development and Debian packaging workflows.', zh: '包含主机模拟器开发与 Debian 软件包构建流程。' },
    ],
  },
  {
    id: 'terminal', name: 'Terminal', repo: 'https://github.com/LILYGO-UI/terminal',
    category: { en: 'Developer', zh: '开发' },
    description: { en: 'An interactive shell for LILYGO devices.', zh: '面向 LILYGO 设备的交互式终端。' },
    icon: '/app-icons/terminal.svg', author: 'LILYGO-UI',
    overview: { en: 'Run an interactive shell alongside a touch keyboard, with a persistent terminal session and layouts that adapt to screen orientation.', zh: '配合触摸键盘运行交互式 Shell，提供持续的终端会话，并适配不同屏幕方向。' },
    features: [
      { en: 'Run shell commands, pipes, and interactive programs in a PTY session.', zh: '在 PTY 会话中运行 Shell 命令、管道和交互程序。' },
      { en: 'Use a touch keyboard with letter, number, symbol, and Ctrl modes.', zh: '使用支持字母、数字、符号和 Ctrl 组合键的触摸键盘。' },
      { en: 'Clear the screen, restart the shell, and choose a saved font size.', zh: '清空屏幕、重启 Shell，并选择可保存的字号设置。' },
    ],
  },
  {
    id: 'xiaozhi', name: 'Xiaozhi', repo: 'https://github.com/LILYGO-UI/xiaozhi',
    category: { en: 'Assistant', zh: '助手' },
    description: { en: 'An assistant interface with expressions, live captions, and voice chat.', zh: '支持表情、实时字幕和语音聊天的助手界面。' },
    icon: '/app-icons/xiaozhi.svg', author: 'LILYGO-UI',
    overview: { en: 'A voice assistant client for services compatible with the XiaoZhi protocol, combining expressive animations, live captions, and conversation history.', zh: '面向兼容小智协议服务的语音助手客户端，结合表情动画、实时字幕和会话历史。' },
    features: [
      { en: 'Pair the device with a six-digit activation code.', zh: '通过六位激活码完成设备配对。' },
      { en: 'Use push-to-talk or optional continuous conversation with voice activity detection.', zh: '使用按住说话，或启用带语音活动检测的连续对话。' },
      { en: 'Read captions and session history, interrupt a reply, or start a new chat.', zh: '查看字幕和会话历史、中断回复或开始新对话。' },
    ],
  },
  {
    id: 'youtube', name: 'YouTube', repo: 'https://github.com/LILYGO-UI/youtube',
    category: { en: 'Media', zh: '媒体' },
    description: { en: 'Search and watch YouTube on supported devices.', zh: '在支持设备上搜索和观看 YouTube。' },
    icon: '/app-icons/youtube.png', author: 'LILYGO-UI',
    overview: { en: 'A native YouTube client with keyword search, a public-topic home feed, and video playback for supported public video streams.', zh: '原生 YouTube 客户端，提供关键词搜索、公开主题推荐和受支持公开视频流的播放功能。' },
    features: [
      { en: 'Browse a topic-based home feed and search videos by keyword.', zh: '浏览主题推荐列表，并按关键词搜索视频。' },
      { en: 'Control playback, seeking, ten-second skips, and volume.', zh: '控制播放、进度跳转、十秒快进或快退以及音量。' },
      { en: 'Expand the player and return to the same video result list.', zh: '展开播放器，并返回原来的视频结果列表。' },
    ],
  },
]

export function appLink(app: CatalogApp, isZh: boolean): string {
  return `${isZh ? '/zh' : ''}/applications/${app.id}.html`
}
