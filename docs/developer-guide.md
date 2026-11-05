---
title: Developer documentation
description: Development setup, AppKit integration, input handling, packaging, and deployment.
show_source: false
---

# Developer documentation

These guides cover building and maintaining LILYGO UI applications. For operating an installed application, see [User documentation](./user-guide).

## Recommended reading order

1. [Development quick start](./quick-start): install the tools, create a project, and run it on a host.
2. [Development guide](./development): understand AppKit, application manifests, runtime integration, and release responsibilities.
3. [Keyboard integration](./keyboard-input): connect controls to focus navigation, text input, and modal views.
4. [T-Display-CM0 hardware (Chinese Wiki)](https://wiki.lilygo.cc/zh/products/t-display-series/t-display-cm0/): check board specifications and interfaces. Follow [Quick start](./device-quick-start) to flash the system image.
5. [FAQ](./faq): clarify supported devices, sysroot boundaries, and where to report issues.

## Find an application example

Use the [application catalog](./applications) to find source repositories. The [Template guide](./guide/template) describes the starter application's counter UI; the [development quick start](./quick-start) explains how to create your own project from it.

The [application user guides](./user-guide) document the behavior to check on a device, including hardware requirements, saved data, and feature limitations.

## Supporting projects in the CM0 workspace

These projects provide development tools, runtime dependencies, or system images. They are separate from the applications opened in Launcher.

| Project directory | Responsibility | Start here |
| --- | --- | --- |
| `lpm` | Project creation, host builds, tests, packaging, and deployment | [Development quick start](./quick-start) |
| `lilygo-cm0-appkit` | Shared UI and runtime services | [Development guide](./development), [Keyboard integration](./keyboard-input) |
| `CM0BspBuilder` | Application sysroot and cross-compilation toolchain | [Development quick start](./quick-start#_4-prepare-a-cm0-target-build) |
| `packages` | Application and runtime package registry | [Development guide](./development#build-and-release-path) |
| `lilygo-ui-mesa-vc4` | Private Mesa VC4 runtime libraries; no Launcher UI | Its repository README and `docs/build.md` |
| `linux`, `lilygo-linux-dtoverlays` | Kernel, hardware drivers, and device-tree overlays | [T-Display-CM0 hardware (Chinese Wiki)](https://wiki.lilygo.cc/zh/products/t-display-series/t-display-cm0/) and the relevant repository documentation |
| `pi-gen`, `rpi-image-gen`, `usbboot` | System image generation and device provisioning tools | [System image flashing](./device-quick-start) and each tool's README |

[Back to the documentation center](./docs)
