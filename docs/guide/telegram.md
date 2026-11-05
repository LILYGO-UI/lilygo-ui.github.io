---
title: LilyChat Telegram User Guide
description: Sign in to Telegram, browse chats, send text, view media, and manage account settings.
---

# LilyChat Telegram User Guide

LilyChat is an unofficial Telegram client using Telegram API and TDLib. It is not
affiliated with or endorsed by Telegram and does not implement every Telegram feature.

## Before you start and sign in

Use **LilyChat** (package `lilygo-ui-telegram`). Real mode needs network, Telegram API
ID/API hash, and TDLib. The local Demo is only a UI preview. Choose QR or phone login;
the phone flow can ask for an email code or two-step password. QR login is confirmed on
an already signed-in Telegram device. After login, **Chats** is the main page.

### Provide the application credentials

There is no API ID/hash editor in the app. A device package may already contain
application credentials; otherwise set the following variables in the environment
that starts LilyChat, then restart the app:

| Variable | Value |
| --- | --- |
| `TELEGRAM_DEMO` | `0` to select the real TDLib backend. |
| `TELEGRAM_API_ID` | Your Telegram application API ID, as a positive integer. |
| `TELEGRAM_API_HASH` | The matching Telegram application API hash. |
| `LILYGO_UI_TDJSON_LIBRARY` | Optional absolute path to `libtdjson.so` or `libtdjson.dylib` if the installed library is not found. |

Use the API ID and hash assigned to your Telegram application, not a phone number,
login code, or bot token. Nonempty runtime values override credentials compiled into
the package. For Launcher launches, the device administrator must supply them in the
application's launch environment; changing another terminal's environment does not
change an already-running app or Launcher. Keep the API hash private.

## Chats, contacts, and messages

**Chats** browses conversations and loads older messages. Search covers cached chat names
and last-message previews. **Contacts** searches loaded contacts, adds contacts by phone,
and opens private chats. The client sends plain text, downloads JPEG/PNG photos, and on
Linux plays downloaded Ogg Opus voice messages. Open a user, group, or channel for its profile;
**Settings** includes **Saved Messages**. Drafts stay while switching chats and tabs.

## Account and storage

In **Settings**, edit name, username, and bio; configure private/group/channel notifications;
open **Privacy and Security**, **Devices**, and **Storage Usage**. **Clear Media Cache** removes
local media only. Default data is `$HOME/.local/share/lilygo-ui-telegram/`, or under
`$XDG_DATA_HOME/lilygo-ui-telegram/`: `database/`, `files/`, and `ui-preferences.json`.
Only one process may use one database directory.

## Current limits

Video, animation, ordinary audio, file previews, recording or sending voice/photos/files,
registration, Premium purchase, editing/replying/forwarding, server search, calls, secret
chats, group administration, proxy settings, push notifications, and account deletion are
not available. Local chat search covers up to 100 cached chats; contact search up to 500
loaded contacts. A conversation holds up to 80 messages; photos are limited to three and
6 MiB total. Drafts are cleared on logout or exit.

| Symptom | Check |
| --- | --- |
| Code never arrives | Network, phone/email, two-step prompts, and system time. |
| Photo placeholder | Auto-download, network, disk, and JPEG/PNG decoding. |
| Voice will not play | ALSA, libopusfile, output device, and permissions. |
| Old chat is not found | Search is local cache only, not server search. |
| Need account deletion | Use an official Telegram client or web page. |

A single check mark on an outgoing message does not mean the recipient has read it.
Media downloads use local storage and can be removed by **Clear Media Cache** without
removing cloud messages. When storage is full, text may continue to work while media fails.

[All user guides](../user-guide) · [Documentation center](../docs)
