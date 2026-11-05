import type { LocalizedText } from './apps.ts'

export type AppGuide = {
  id: string
  name: string
  sourceDirectory: string
  registryPackage?: string
}

type GuideGroup = {
  title: LocalizedText
  items: AppGuide[]
}

// Source inventory for the user guides. Runtime libraries and build tools
// belong in the developer documentation, not in the application list.
export const guideGroups: GuideGroup[] = [
  {
    title: { en: 'System and everyday tools', zh: '系统与日常工具' },
    items: [
      { id: 'launcher', name: 'Launcher', sourceDirectory: 'launcher', registryPackage: 'lilygo-ui-launcher' },
      { id: 'store', name: 'Store', sourceDirectory: 'lilygo-ui-store', registryPackage: 'lilygo-ui-store' },
      { id: 'settings', name: 'Settings', sourceDirectory: 'lilygo-ui-settings', registryPackage: 'lilygo-ui-settings' },
      { id: 'files', name: 'Files', sourceDirectory: 'lilygo-ui-files', registryPackage: 'lilygo-ui-files' },
      { id: 'calculator', name: 'Calculator', sourceDirectory: 'lilygo-ui-calculator', registryPackage: 'lilygo-ui-calculator' },
      { id: 'monitor', name: 'Monitor', sourceDirectory: 'lilygo-ui-monitor', registryPackage: 'lilygo-ui-monitor' },
      { id: 'terminal', name: 'Terminal', sourceDirectory: 'lilygo-ui-terminal', registryPackage: 'lilygo-ui-terminal' },
    ],
  },
  {
    title: { en: 'Media and games', zh: '影音与游戏' },
    items: [
      { id: 'camera', name: 'Camera', sourceDirectory: 'lilygo-ui-camera', registryPackage: 'lilygo-ui-camera' },
      { id: 'gallery', name: 'Gallery', sourceDirectory: 'lilygo-ui-gallery', registryPackage: 'lilygo-ui-gallery' },
      { id: 'music', name: 'Music', sourceDirectory: 'lilygo-ui-music', registryPackage: 'lilygo-ui-music' },
      { id: 'radio', name: 'Radio', sourceDirectory: 'lilygo-ui-radio', registryPackage: 'lilygo-ui-radio' },
      { id: 'youtube', name: 'YouTube', sourceDirectory: 'lilygo-ui-youtube', registryPackage: 'lilygo-ui-youtube' },
      { id: 'nes', name: 'NES', sourceDirectory: 'lilygo-ui-nes', registryPackage: 'lilygo-ui-nes' },
    ],
  },
  {
    title: { en: 'Network and assistants', zh: '网络与助手' },
    items: [
      { id: 'maps', name: 'Maps', sourceDirectory: 'lilygo-ui-maps', registryPackage: 'lilygo-ui-maps' },
      { id: 'clash', name: 'Clash', sourceDirectory: 'lilygo-ui-clash', registryPackage: 'lilygo-ui-clash' },
      { id: 'telegram', name: 'LilyChat (Telegram)', sourceDirectory: 'lilygo-ui-telegram', registryPackage: 'lilygo-ui-telegram' },
      { id: 'picoclaw', name: 'PicoClaw', sourceDirectory: 'lilygo-ui-picoclaw', registryPackage: 'lilygo-ui-picoclaw' },
      { id: 'xiaozhi', name: 'Xiaozhi', sourceDirectory: 'lilygo-ui-xiaozhi', registryPackage: 'lilygo-ui-xiaozhi' },
    ],
  },
  {
    title: { en: 'Hardware and communication', zh: '硬件与通信' },
    items: [
      { id: 'cellular', name: 'Cellular', sourceDirectory: 'lilygo-ui-cellular', registryPackage: 'lilygo-ui-cellular' },
      { id: 'meshtastic', name: 'Meshtastic', sourceDirectory: 'lilygo-ui-meshtastic', registryPackage: 'lilygo-ui-meshtastic' },
      { id: 'i2c-detector', name: 'I2C Detector', sourceDirectory: 'lilygo-ui-i2cdetector', registryPackage: 'lilygo-ui-i2cdetector' },
      { id: 'imu', name: 'IMU', sourceDirectory: 'lilygo-ui-imu', registryPackage: 'lilygo-ui-imu' },
      { id: 'sensors', name: 'Sensors', sourceDirectory: 'lilygo-ui-sensors', registryPackage: 'lilygo-ui-sensors' },
      { id: 'serial', name: 'Serial', sourceDirectory: 'lilygo-ui-serial', registryPackage: 'lilygo-ui-serial' },
    ],
  },
  {
    title: { en: 'Examples', zh: '示例' },
    items: [
      { id: 'template', name: 'Template', sourceDirectory: 'lilygo-ui-template', registryPackage: 'lilygo-ui-template' },
    ],
  },
]

export const appGuides = guideGroups.flatMap(group => group.items)

export function usageGuideLink(packageName: string, isZh: boolean): string | undefined {
  const guide = appGuides.find(item => item.registryPackage === packageName)
  return guide ? `${isZh ? '/zh' : ''}/guide/${guide.id}.html` : undefined
}
