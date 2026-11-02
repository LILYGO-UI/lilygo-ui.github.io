---
title: T-Display-CM0 hardware
show_source: false
---

# T-Display-CM0 hardware

LILYGO UI's first product profile targets the [T-Display-CM0](https://github.com/Xinyuan-LilyGO/T-Display-CM0), a Linux smart-terminal development project based on the CM0_Lite carrier board. The hardware repository is the authority for board files, Raspberry Pi OS deployment resources, drivers, device-tree overlays, and first-boot scripts.

## Hardware overview

| Area | Upstream description |
| --- | --- |
| Display | 568 × 1232 AMOLED panel using MIPI DSI |
| Touch | GT9895 touch controller over I2C |
| Audio | ES8388/ES8389 audio codec over I2S |
| Motion | QMI8658C IMU over I2C |
| Radio | LR2021 LoRa device over SPI |
| Power | BQ25890/BQ25896 and BQ27220 battery-management devices |
| Expansion | Optional camera, audio, LoRa, battery, keyboard, GNSS, LTE-M, and temperature/humidity features are described in the hardware repository |

The launcher repository currently documents a logical portrait canvas of 568 × 1232 and a 96 px status bar. Hardware revisions and optional modules can change the behavior available to an application, so check the board repository before depending on a peripheral.

## Official system deployment

The board repository documents a separate Raspberry Pi OS deployment flow. It requires a T-Display-CM0, a TF card and reader, a USB-C data cable, Windows, Rufus, and the Raspberry Pi OS 32-bit image specified by that repository. The deployment package is copied to the image's boot partition, then a first-boot script installs drivers, overlays, services, and applications.

This process installs the board's operating system and hardware support. It is separate from building a LILYGO UI application with AppKit. The hardware repository currently documents a 32-bit armhf image, while the LILYGO-UI software repositories document an AArch64 application workflow; treat them as separate upstream documents until compatibility is explicitly confirmed. Follow the current [T-Display-CM0 README](https://github.com/Xinyuan-LilyGO/T-Display-CM0) for the exact image version, script names, default credentials, and first-boot warnings. Do not power off the board while the first deployment is in progress.

## Board resources

- [T-Display-CM0 source and deployment project](https://github.com/Xinyuan-LilyGO/T-Display-CM0)
- [Raspberry Pi OS image download information](https://github.com/Xinyuan-LilyGO/T-Display-CM0/blob/main/deploy/rasp_img/README_en)
- [User manual](https://github.com/Xinyuan-LilyGO/T-Display-CM0/blob/main/deploy/T-Display-CM0(SKU%EF%BC%9A)%E4%BD%BF%E7%94%A8%E8%AF%B4%E6%98%8E%E4%B9%A6_V1.0.pdf)
- [Datasheet](https://github.com/Xinyuan-LilyGO/T-Display-CM0/blob/main/datasheet/CM0+cm0-KIT%E4%B8%AD%E6%96%87%E8%A7%84%E6%A0%BC%E4%B9%A6.pdf)
- [Schematic](https://github.com/Xinyuan-LilyGO/T-Display-CM0/blob/main/schematic/T-DIsplay-CM0-V0.3-20260818.pdf)
