---
title: T-Display-CM0 硬件
show_source: false
---

# T-Display-CM0 硬件

LILYGO UI 的首个产品 profile 面向 [T-Display-CM0](https://github.com/Xinyuan-LilyGO/T-Display-CM0)。该硬件项目基于 CM0_Lite carrier board，是 Linux 智能终端开发项目；板卡文件、Raspberry Pi OS 部署资源、驱动、设备树 overlay 和首次启动脚本请以上游仓库为准。

## 硬件概览

| 部分 | 上游资料描述 |
| --- | --- |
| 显示屏 | 568 × 1232 AMOLED，MIPI DSI |
| 触摸 | GT9895，I2C |
| 音频 | ES8388/ES8389，I2S |
| 运动 | QMI8658C IMU，I2C |
| 无线电 | LR2021 LoRa，SPI |
| 电源 | BQ25890/BQ25896 和 BQ27220 电池管理器件 |
| 扩展 | 上游仓库描述了可选 camera、audio、LoRa、battery、keyboard、GNSS、LTE-M 和温湿度功能 |

Launcher 当前文档中的逻辑竖屏画布为 568 × 1232，状态栏为 96 px。硬件版本和可选模块会影响应用可用的外设，使用具体外设前请核对板卡仓库。

## 官方系统部署

板卡仓库提供独立的 Raspberry Pi OS 部署流程，需要 T-Display-CM0、TF 卡和读卡器、USB-C 数据线、Windows、Rufus，以及仓库指定的 Raspberry Pi OS 32-bit 镜像。部署包复制到镜像 boot 分区后，由首次启动脚本安装驱动、overlay、服务和应用。

这个流程负责安装板卡操作系统和硬件支持，与使用 AppKit 构建 LILYGO UI 应用是两件事。硬件仓库当前记录的是 32-bit armhf 镜像，而 LILYGO-UI 软件仓库记录的是 AArch64 应用流程；在上游明确兼容关系前，请将它们视为两套独立文档。镜像版本、脚本名称、默认凭据和首次启动注意事项请以最新的 [T-Display-CM0 README](https://github.com/Xinyuan-LilyGO/T-Display-CM0) 为准。首次部署期间不要断电。

## 板卡资料

- [T-Display-CM0 源码和部署项目](https://github.com/Xinyuan-LilyGO/T-Display-CM0)
- [Raspberry Pi OS 镜像下载说明](https://github.com/Xinyuan-LilyGO/T-Display-CM0/blob/main/deploy/rasp_img/README_en)
- [用户手册](https://github.com/Xinyuan-LilyGO/T-Display-CM0/blob/main/deploy/T-Display-CM0(SKU%EF%BC%9A)%E4%BD%BF%E7%94%A8%E8%AF%B4%E6%98%8E%E4%B9%A6_V1.0.pdf)
- [规格书](https://github.com/Xinyuan-LilyGO/T-Display-CM0/blob/main/datasheet/CM0+cm0-KIT%E4%B8%AD%E6%96%87%E8%A7%84%E6%A0%BC%E4%B9%A6.pdf)
- [原理图](https://github.com/Xinyuan-LilyGO/T-Display-CM0/blob/main/schematic/T-DIsplay-CM0-V0.3-20260818.pdf)
