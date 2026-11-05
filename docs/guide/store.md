---
title: Store User Guide
description: Browse, install, update, and remove applications, and resolve package or network errors.
---

# Store User Guide

Store browses the LILYGO UI catalog and installs, updates, or removes device
applications. System dependencies come from the device's configured APT sources.

## Before you start

- Install the complete `lilygo-ui-store` package, including its authorization policy.
- Connect to a network that can reach the catalog, package downloads, and APT sources.
- Leave enough storage for downloads, unpacking, and dependencies.
- Use packages compatible with the device architecture and AppKit version.

## Browse and install

1. Open **Store** from Launcher.
2. Filter the catalog with **All**, **Official**, or **Community**.
3. Open an application to inspect its description, author, version, size, and available screenshots.
4. Choose **Get** in the list or **Get App** on its detail page.
5. Wait for download and installation. Store verifies size, SHA-256, and package identity, then installs required system dependencies.
6. Return to Launcher and open the new icon after the home screen refreshes.

An active operation displays **Working...**. Wait for completion before retrying.
If the system requests authorization, use the device's existing authorization
method; Store does not create administrator credentials.

## Update applications

1. Open the installed-app list and locate an application marked **Update**.
2. Choose **Update**, or open its details and choose **Update App**.
3. Wait for success. Read the operation error before retrying a failed update.

Installation preserves existing system configuration files. Dependency failures
are reported instead of bypassing APT. The app catalog is not an APT source
and does not install other catalog applications as dependency packages.

### Launcher updates

An installed Launcher can be updated as a protected system component.
Store exits after handing the update to the device's independent update
service; Launcher is then upgraded and restarted.
Older images lacking the Launcher update helper need an administrator-managed
baseline upgrade first. Store does not install Launcher as a new app or remove it.

## Remove applications

Use **Delete App** on the detail page or the removal action in the installed list.
This removes the package. Check the application's guide for any personal data
you want to preserve. Store itself and Launcher are protected from removal.

In the current implementation, **Open** in the installed list opens details,
and **Open App** on the detail page does not launch the application.
Return to Launcher to run an installed app.

## Cache and permissions

Verified catalogs are cached under `$XDG_CACHE_HOME/lilygo-ui-store/registry/`,
or `$HOME/.cache/lilygo-ui-store/registry/` when the XDG cache variable is unset.
On later launches, cached entries may appear while a network refresh runs.
This does not make application downloads or dependency installation available offline.

Package installation uses the authorized helper; removal uses the system
package manager. Administrators can select a compatible HTTPS catalog mirror
with `LILYGO_UI_STORE_REGISTRY_URL`. Its URL must end in `/v1/root.json`.

## Troubleshooting

| Symptom | What to check |
| --- | --- |
| Catalog fails to load | Check network access and system time, then use **Retry**. Invalid partial catalogs are discarded. |
| **Not Compatible** / **Unavailable** | Check architecture, system, and AppKit requirements. |
| Download or verification fails | Check connectivity and free space, then retry; do not bypass checksum verification. |
| Dependencies cannot be installed | Check the configured APT sources and the dependencies named in the error. |
| Authorization fails | Check the complete package, polkit/authorization environment, and account permissions. |
| Home screen appears unchanged | Return to Launcher, wait for refresh, and check the installed version. |

[All user guides](../user-guide) · [Documentation center](../docs)
