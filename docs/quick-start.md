---
title: Development quick start
show_source: false
---

# Development quick start

This guide explains the development workflow described by the upstream LILYGO-UI repositories. It is intended for application developers and contributors. To write a system image to your device, start with [Quick start: USB and TF card flashing](./device-quick-start).

## 1. Install the host tools

The [lpm README](https://github.com/LILYGO-UI/lpm) lists the current requirements:

- Python 3.11 or newer
- CMake 3.21 or newer
- Git
- A C/C++ compiler and the host dependencies required by SDL2
- `dpkg-deb` when creating Debian packages
- SSH and SCP when deploying to a device

The exact versions and installation steps can change. Follow the upstream README for the current setup instructions before starting a project. A documented installation option is:

```sh
python3 -m pip install "git+https://github.com/LILYGO-UI/lpm.git"
lpm --version
```

The upstream README also recommends installing `lpm` as a `uv` tool when that matches your Python workflow.

## 2. Create or inspect an application

Use the [template repository](https://github.com/LILYGO-UI/template) as the reference project. It is a complete independent application and demonstrates:

1. a responsive LVGL interface;
2. C++ MVVM-style separation between UI and application state;
3. launcher discovery through application metadata; and
4. Debian packaging for installation on the target.

The [lpm CLI](https://github.com/LILYGO-UI/lpm) is the standard project manager. Its documented workflow covers initializing from the template, configuring a host build, cross-compiling for AArch64, packaging, and deploying over SSH. For example, an empty directory can be initialized with:

```sh
mkdir weather-station
cd weather-station
lpm init
```

The upstream README also documents `lpm start` for the host simulator, `lpm test --report build/test-results.xml` for tests, `lpm pack --output dist` for a Debian package, and `lpm deploy --host cm0.local --user pi` for SSH deployment. Use the current README for options and target names.

## 3. Run a host build

The AppKit supports a desktop host profile backed by SDL2. This lets you validate layout and interaction before deploying to a CM0 device. The normal flow is:

1. initialize or clone an application project;
2. configure it with CMake using the host profile;
3. build and run the SDL2 host executable; and
4. iterate on the LVGL UI and application state.

Use the commands in the [AppKit README](https://github.com/LILYGO-UI/cm0-appkit) and the [template README](https://github.com/LILYGO-UI/template) for the current command names and options.

## 4. Prepare a CM0 target build

The LILYGO-UI development repositories document an AArch64 Linux target workflow. The [CM0BspBuilder](https://github.com/LILYGO-UI/CM0BspBuilder) project creates a reusable application sysroot and the matching CMake toolchain from released Raspberry Pi OS ZIP or raw IMG inputs. It also manages development-package overlays, versioned archives, checksums, and manifests.

Ensure that the target system, sysroot, and compiler toolchain use matching architectures and compatible versions. For the system image and flashing steps, see [Quick start](./device-quick-start).

The builder is an application-build dependency. Its README explicitly states that it is not a bootloader, kernel, device-tree, module, or complete device-image builder.

## 5. Package and deploy

After the target build, use the packaging and deployment workflow documented by [lpm](https://github.com/LILYGO-UI/lpm). It can create Debian packages and copy them to a device over SSH/SCP. Keep the target's operating system and credentials under your normal device administration process.

## Hardware setup

Check board specifications and interfaces in the official [T-Display-CM0 Wiki (Chinese)](https://wiki.lilygo.cc/zh/products/t-display-series/t-display-cm0/). To install the LILYGO UI system image, follow [Quick start: USB and TF card flashing](./device-quick-start).

## Where to go next

- Review the [application catalog](./applications) to find a nearby example.
- Read the [development guide](./development) for AppKit targets, manifests, and runtime boundaries.
- Check [FAQ](./faq) before opening an issue about hardware support or system images.
