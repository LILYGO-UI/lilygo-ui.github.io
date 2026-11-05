---
title: User documentation
description: How to use every CM0 application, including setup, controls, saved files, and troubleshooting.
show_source: false
---

# User documentation

Use these guides to operate the applications on your device. The 27 guides cover Launcher, the application projects in the CM0 workspace, and the Template example. Each guide explains preparation, actual controls, and common problems.

## First use

1. Prepare a device with a compatible LILYGO UI system and Launcher. If it is not ready, follow [Quick start](./device-quick-start) to flash an image over USB or onto a TF card.
2. Open [Settings](./guide/settings) to connect to Wi-Fi and check device settings.
3. Open [Store](./guide/store) to find and install an available application. Return to [Launcher](./guide/launcher) and select its icon.
4. Choose the matching guide below. Online services may require an account or API credentials; hardware tools require the corresponding module and drivers. Each guide states its own requirements.
5. Use [Browser file sharing](./file-share) to send files from a computer, and [Files](./guide/files) to find them on the device.
6. To control the device from a computer terminal, follow [SSH remote login](./ssh-login) to enable **Remote Login** in Settings and connect.

The Template example is a separate project and may not appear in Store or your installed image. Its guide describes its own entry point. Button names are kept as they appear in the applications, which may use English labels.

## System and everyday tools

| Application | What you can learn |
| --- | --- |
| [Launcher](./guide/launcher) | Open applications, turn pages, and use quick controls and file sharing. |
| [Store](./guide/store) | Browse, install, update, and remove applications. |
| [Settings](./guide/settings) | Configure Wi-Fi, Bluetooth, SSH remote login, general options, and keyboard vibration. |
| [Files](./guide/files) | Browse storage, manage files, and preview text. |
| [Calculator](./guide/calculator) | Calculate expressions and use the scientific layout and memory. |
| [Monitor](./guide/monitor) | Inspect device usage, network activity, and measurement history. |
| [Terminal](./guide/terminal) | Run local shell commands and use the touch keyboard. |

## Media and games

| Application | What you can learn |
| --- | --- |
| [Camera](./guide/camera) | Preview the camera, take photos, record video, and find captures. |
| [Gallery](./guide/gallery) | Browse albums, view pictures, and inspect file information. |
| [Music](./guide/music) | Add local music, manage a queue, and control playback. |
| [Radio](./guide/radio) | Search internet stations, save favorites, and set a sleep timer. |
| [YouTube](./guide/youtube) | Browse, search, and play supported public videos. |
| [NES](./guide/nes) | Import ROMs, use game controls, and save or load a game state. |

## Network and assistants

| Application | What you can learn |
| --- | --- |
| [Maps](./guide/maps) | Search addresses, move around the map, and manage cached tiles. |
| [Clash](./guide/clash) | Import a configuration, manage the proxy service, and inspect connections. |
| [LilyChat (Telegram)](./guide/telegram) | Configure credentials, sign in, and read or send text messages. |
| [PicoClaw](./guide/picoclaw) | Configure a model, chat, and manage the background gateway. |
| [Xiaozhi](./guide/xiaozhi) | Activate the assistant, use voice chat, and read captions. |

## Hardware and communication

| Application | What you can learn |
| --- | --- |
| [Cellular](./guide/cellular) | Inspect cellular status, connect mobile data, use GNSS, and read AT diagnostics. |
| [Meshtastic](./guide/meshtastic) | Connect to a node, inspect the mesh, and send messages. |
| [I2C Detector](./guide/i2c-detector) | Scan available buses and interpret I2C addresses. |
| [IMU](./guide/imu) | View motion readings and adjust display sensitivity. |
| [Sensors](./guide/sensors) | Inspect sensors and keyboard events, and record data to CSV. |
| [Serial](./guide/serial) | Configure a serial connection and send or receive ASCII/HEX data. |

## Example

| Program | What you can learn |
| --- | --- |
| [Template](./guide/template) | Operate the starter counter example. |

## Choosing the right documentation

These instructions describe the checked-in applications as reviewed on **November 3, 2026**. Published packages and installed images can differ; if a control is missing, check your app version and the corresponding guide's limitations.

Build tools and runtime libraries such as `lpm`, AppKit, the sysroot builder, and Mesa VC4 are listed in [Developer documentation](./developer-guide). For package availability and source repositories, use the [application catalog](./applications).

[Back to the documentation center](./docs)
