# LILYGO UI Project Hub

Standalone VitePress project center for LILYGO UI. It contains:

- a project home page with recent registry releases and featured applications;
- an app-store style application catalog with search, category filters, sorting, and pagination;
- individual application pages with features, version snapshots, source links, and installation resources;
- a documentation center with device quick start, developer documentation, and application user guides;
- English and Simplified Chinese pages.
- a browser file-sharing page that discovers a Linux device with Web Bluetooth and establishes a direct WebRTC DataChannel session.

## Development

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
npm run preview
```

The site is designed to be published as `LILYGO-UI/lilygo-ui.github.io` on GitHub Pages. If the repository name or domain changes, update the links in the documentation repository bridge pages.

## Application catalog

Curated application metadata is shared by the home page, catalog, and detail pages in `docs/.vitepress/theme/data/apps.ts`. The catalog also discovers all applications in the live `packages` registry; add a static entry when an application needs local translations, feature copy, or a dedicated detail URL.

The application catalog requests the current `packages` registry root on every visit, verifies its index checksum, and discovers all published application entries, including applications added after this site was built. The homepage latest updates section uses the same registry snapshot and shows the newest published release for each application. Existing local entries keep their translations, feature lists, and icons; registry-only entries use a generic detail route until curated copy is added. Each application detail page also requests the current registry snapshot when it opens. The page selects the highest published application version from the release list (a final `0.1.2` supersedes `0.1.2-rc2`), ignoring yanked and revoked releases. Version, publication date, author, source URL, and package download come from that record. English descriptions also refresh from the registry; the curated Chinese translations and feature lists remain local. Failed or timed-out requests retain the labeled static snapshot. Set `registryPackage` when the package name differs from `lilygo-ui-<id>`. The catalog keeps search, category, sort, page size, and page in the URL so links and browser Back preserve the current view.

Application icons are copied from each app's source into `docs/public/app-icons/` and referenced by the `icon` field in the shared catalog. Use the original SVG when available, otherwise the source PNG; do not replace them with text symbols or recolor them. `docs/public/app-icons/SOURCES.md` records the source asset and commit for each icon. Update the copy and source record together when upstream artwork changes.

## Documentation

The documentation center (`docs/docs.md` and `docs/zh/docs.md`) has three entry
points: `device-quick-start.md` for system image flashing over USB or onto a TF
card, `developer-guide.md` for development, and `user-guide.md` for device usage.
The device quick start and its `usb-flashing`, `tf-flashing`, and `imager-flashing`
anchors are shared by the English and Simplified Chinese sidebar structure.
Flashing screenshots live in `docs/public/flashing/`, with their provenance in
`SOURCES.md`. Existing development, quick-start, FAQ, and keyboard pages keep
their URLs; `quick-start.md` remains the development quick start. Hardware
references link directly to the official
[T-Display-CM0 Wiki](https://wiki.lilygo.cc/zh/products/t-display-series/t-display-cm0/)
for specifications, pinouts, schematics, and datasheets. User guides live in
`docs/guide/` and `docs/zh/guide/`.

The user-guide inventory covers 27 application and example projects in the
sibling CM0 workspace. It includes Launcher, the `lilygo-ui-*` applications,
and Template. The Mesa VC4 runtime and supporting SDK,
build, registry, kernel, and image projects are classified in the developer
documentation. Instructions were checked against local README files and UI
code on November 3, 2026; features of an installed release may differ.

`docs/.vitepress/theme/data/guides.ts` records the source directory, route, and
registry package for each guide. It supplies the bilingual sidebar and the
**User guide** link on application detail pages, including registry-only apps.
When adding an application, update that inventory, both `user-guide.md`
indexes, and both language versions of its guide. Describe user actions,
prerequisites, saved data, and limitations from the app's UI implementation;
keep build instructions in developer documentation. Verify with `npm run check`.

Real device screenshots are shared by both languages under
`docs/public/screenshots/`. Use the `DeviceScreenshot` component with localized
`alt` and `caption` text and the image's actual `width` and `height`.
`docs/public/screenshots/SOURCES.md` records capture dates, installed versions,
orientation adjustments, and any redaction. See `scripts/README.md` to capture
an active application over SSH with `scripts/capture-drm.py`.

## Browser file sharing

The `/file-share.html` and `/zh/file-share.html` pages connect to the LILYGO
Launcher's File sharing panel. Both devices must be on the same local network.
Serve the page over HTTPS (or localhost for development), use a browser with
Web Bluetooth support, open File sharing on the device, and select it in the
browser. Bluetooth discovery and the direct local-network connection start
automatically after selection. Before each file is sent, the device displays
its name and size: select **Receive file** to approve that file or **Decline**
to reject it. File contents are sent only after approval. Reopen the device
panel after the sharing session ends or Bluetooth setup fails.

Bluetooth GATT carries discovery and WebRTC SDP/ICE negotiation. File contents
travel over an ordered, encrypted WebRTC DataChannel on the local network.
Once the complete answer has been consumed and the DataChannel opens, the
browser disconnects GATT and continues over the network alone. A later Bluetooth
disconnect does not cancel file transfers; a disconnect before the DataChannel
opens fails the setup. This avoids Bluetooth/Wi-Fi radio contention during bulk
transfers. Closing the sharing session closes WebRTC even when GATT is detached.
There is no WSS address to configure, and no STUN or TURN service is used. Guest
Wi-Fi, client isolation, firewalls, or unreachable local candidates can prevent
the direct path; the page reports a connection failure instead of using a relay.

The device must expose these protocol UUIDs and advertise the service:

- Service: `fde6eb6b-0d5f-49c1-b7ae-296288a7ab0b`
- Browser writes: `fde6eb6c-0d5f-49c1-b7ae-296288a7ab0b` (with response when available)
- Device notifications/read: `fde6eb6d-0d5f-49c1-b7ae-296288a7ab0b`

Notifications are subscribed before sending `session.hello`. Each GATT value
contains at most 20 bytes: flags (START = 1, END = 2), one reserved zero byte,
a two-byte big-endian sequence starting at zero, and up to 16 payload bytes.
Frames reconstruct one UTF-8 `SignalEnvelope` JSON message, capped at 65,536
bytes with a 15-second inter-frame timeout. Messages and characteristic writes
are serialized. `session.accepted` starts the offer automatically. Both peers
wait for ICE gathering before exchanging complete SDP. A signaling error ends
the connection attempt; the browser does not retry a failed write using a
different mode because the device may already have received that frame.

The DataChannel protocol in `docs/.vitepress/theme/lib/fileShare.ts` is:

1. Sender announces `file-start` metadata (`sessionId`, `fileId`, `fileName`,
   `fileSize`, `chunkSize`, lowercase SHA-256). The device sends `file-pending`
   with the same file ID, name, and size while the user decides. The sender
   waits for `file-accepted`; every file needs a fresh device approval and
   the receiver creates no destination file before approval.
2. Binary messages contain a four-byte big-endian sequence followed by file
   bytes. Default payload size is 16 KiB minus the four-byte header and is
   further limited by the peer's negotiated maximum message size.
3. The receiver sends `file-progress` with `fileId`, `chunks`, and
   `receivedBytes` every 32 chunks. The sender waits for this credit before
   sending the next window, bounding outstanding writes to slow storage.
4. The sender sends `file-complete` with `fileId` and `chunks`. The receiver
   requires exact byte and chunk counts and a matching SHA-256, then confirms
   with `file-received` (`fileId`, `fileName`, `size`, `sha256`). Device success
   means the file was committed to the signed-in user's Downloads directory.
5. `file-error` (`fileId`, `message`) or `file-cancel` (`fileId`) aborts that
   transfer. The device acknowledges cancellation with `file-cancelled`
   (`fileId`); a delayed acknowledgement never changes a newer transfer.
   Cancellation is available while awaiting approval and during transmission,
   before `file-complete`; while awaiting final
   verification the receiver may already have committed the file.
   Closing the connection rejects pending operations and clears
   partial state. One transfer is active at a time; the browser limit is 512 MiB.

The browser also verifies incoming files before offering a download, but this
page does not provide a device-side file picker. Received files remain in
browser memory until the user downloads them or leaves the page.

Run `npm test` (Node 22.6 or later) for protocol, GATT handshake, backpressure,
acknowledgement, cancellation, timeout, and integrity tests. `npm run check`
runs those tests and builds the complete VitePress site.
