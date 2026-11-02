---
title: FAQ
show_source: false
---

# FAQ

## Is LILYGO UI a hardware board?

No. LILYGO UI is an open software platform for LILYGO devices. Hardware specifications and board-level documentation belong to the corresponding LILYGO product page.

## Which device is supported today?

The upstream organization README lists **T-DisplayCM0** as supported. It lists **T-DisplayK230** as not yet supported. Check the organization README and the individual repository before assuming that an application runs on a different product.

## Does CM0BspBuilder create a complete device image?

No. The [CM0BspBuilder README](https://github.com/LILYGO-UI/CM0BspBuilder) describes it as an application sysroot and toolchain builder. It does not build the bootloader, kernel, device tree, kernel modules, or a complete bootable image.

## Can I test an application without a CM0 device?

The AppKit and template provide a host profile using SDL2, so UI and interaction can be exercised on a desktop. Hardware-specific behavior still needs validation on the target device.

## Where are applications registered?

The [packages repository](https://github.com/LILYGO-UI/packages) is the reviewed source of truth for the application registry. GitHub Releases hold Debian artifacts, and generated GitHub Pages data serves the read-only AppStore protocol.

## Where should I report a build or runtime issue?

Open the issue in the repository that owns the failing component: `cm0-appkit` for shared SDK behavior, `launcher` for discovery and navigation, `lpm` for project workflow, `CM0BspBuilder` for sysroot/toolchain generation, or the individual application repository for app-specific behavior.
