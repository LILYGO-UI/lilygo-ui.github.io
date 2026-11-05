---
title: Keyboard integration guide
description: Keyboard integration, focus navigation, text editing, modal views, and compatibility verification for LILYGO UI applications.
show_source: false
---

# Keyboard integration guide

This guide is for developers building LILYGO UI applications with AppKit and LVGL. It explains how to support the detachable TCA8418 keyboard while keeping physical keyboard input, the SDL simulator, and focus navigation consistent.

**Applications use the default `LilyGoUI::Runtime` input group through `cm0_app_run()` and implement business logic through widget events.** AppKit handles keyboard discovery, event decoding, hotplug, key-repeat filtering, and focus management.

This guide is based on AppKit's [Keyboard input contract](https://github.com/LILYGO-UI/cm0-appkit/blob/main/docs/keyboard-input-contract.md). The contract evolves with AppKit. Before relying on new behavior, update the application's pinned `third_party/cm0-appkit` revision, then rebuild and deploy the application. AppKit and LVGL are statically linked into each application; updating only the SDK installed on the device does not change an existing application's behavior.

## 1. Understand the integration boundary

| Layer | Responsibility |
| --- | --- |
| Linux `tca8418_keypad` driver | Scans the matrix, uses the device-tree `linux,keymap`, and emits Linux `EV_KEY` events. |
| AppKit | Discovers devices, maps LVGL keys, maintains input devices and the default input group, and handles hotplug, focus, content browsing, and software-keyboard suppression. |
| Application | Creates widgets, handles business events such as clicks and submissions, and marks modal focus scopes and scroll regions. |

Applications must not read TCA8418 registers, scan the matrix, open `event*` nodes directly, install another evdev reader, or replace AppKit's LVGL keyboard patch. A diagnostic page may display evdev state, but it must not feed that state into application controls and create a second primary keyboard input path.

## 2. Minimal integration example

### Link the Runtime

Locate the source SDK in the application's CMake project and link the public target. `keyboard_demo` below is an example target name:

```cmake
find_package(LilyGoUI CONFIG REQUIRED)

add_executable(keyboard_demo main.cpp)
target_compile_features(keyboard_demo PRIVATE cxx_std_17)
target_link_libraries(keyboard_demo PRIVATE LilyGoUI::Runtime)
```

Use a project preset or `LilyGoUI_DIR` to point to the application's pinned AppKit source directory. See the [development guide](./development) and [quick start](./quick-start) for the complete project structure, build process, and packaging workflow.

### Create widgets and handle submission

The following is a complete `main.cpp`. A focused textarea accepts text directly, and Enter emits `LV_EVENT_READY`. This example displays the submitted text below the input. In a real application, connect this callback to a business command such as search, send, or save.

```cpp
#include <cm0/app.h>
#include <lvgl.h>

static void on_submit(lv_event_t *event)
{
    auto *textarea = static_cast<lv_obj_t *>(lv_event_get_target(event));
    auto *result = static_cast<lv_obj_t *>(lv_event_get_user_data(event));
    lv_label_set_text(result, lv_textarea_get_text(textarea));
}

static void app_open(const cm0_app_context_t *context)
{
    lv_obj_set_flex_flow(context->root, LV_FLEX_FLOW_COLUMN);

    lv_obj_t *title = lv_label_create(context->root);
    lv_label_set_text(title, "Keyboard demo");

    lv_obj_t *textarea = lv_textarea_create(context->root);
    lv_obj_set_width(textarea, lv_pct(100));
    lv_textarea_set_one_line(textarea, true);
    lv_textarea_set_placeholder_text(textarea, "Type, then press Enter");

    lv_obj_t *result = lv_label_create(context->root);
    lv_obj_set_width(result, lv_pct(100));
    lv_label_set_text(result, "Waiting for input");
    lv_obj_add_event_cb(textarea, on_submit, LV_EVENT_READY, result);
}

static void app_close(void)
{
    // Release business resources owned by the application here.
}

int main(int argc, char **argv)
{
    const cm0_app_descriptor_t descriptor = {
        CM0_APP_API_VERSION,
        sizeof(cm0_app_descriptor_t),
        "keyboard-demo",
        app_open,
        app_close,
    };
    return cm0_app_run(argc, argv, &descriptor);
}
```

Ordinary applications do not need to create a keyboard or input group, or manually register every widget for focus. Runtime automatically discovers normal LVGL group widgets. Custom clickable objects with `LV_EVENT_CLICKED` or `LV_EVENT_SHORT_CLICKED` callbacks also participate in navigation; decorative containers do not. Widgets created dynamically are discovered during runtime as well. An entire subtree is excluded when an ancestor is hidden or disabled.

## 3. Key behavior reference

AppKit maps navigation and editing keys to LVGL's `LV_KEY_*` constants and delivers printable keys to controls as characters.

| Key or context | Default behavior | Integration notes |
| --- | --- | --- |
| Tab / Shift+Tab | Moves focus forward / backward through visible, enabled controls and marked browsing regions, scrolling the target into view. | Tab still leaves a native control while its own key handling is active. |
| Arrow keys | Selects the geometrically nearest control in the requested direction, preferring the same row or column. | Textareas, sliders, dropdowns, and button matrices retain their native arrow handling. |
| Enter | Activates buttons and clickable cards; submits an active one-line textarea and emits `LV_EVENT_READY`. | Connect `LV_EVENT_READY` to the application's submit command. |
| Text and editing keys | A focused textarea directly receives letters, numbers, spaces, punctuation, and editing keys. | Use the textarea's existing behavior instead of implementing character decoding. |
| Escape | Cancels an active editor and restores the enclosing focus scope; exits the application when pressed on an ordinary control. | A modal view should still provide a focusable back or cancel control. |
| Switch | All four arrows navigate; Enter or Space toggles the value once per press. | Avoid adding a second toggle handler that triggers the action twice. |
| Other checkable controls | Left / Right adjusts, Enter activates, and Up / Down navigates. | Handle state changes through the corresponding widget's business events. |

Character mapping uses standard US letter, digit, space, and punctuation keys. Shift changes letter case and selects the shifted characters on digit and punctuation keys. Caps Lock affects letter case, with Shift reversing that case. Ctrl, Alt, Meta, and Fn are consumed by the driver. The public API does not yet define a contract for these modifiers, so applications cannot rely on them for shortcuts.

Applications may add business-level `LV_EVENT_KEY` callbacks to focused controls. An explicit key handler retains ownership of that control's key handling. Use one only when the control needs custom interaction, and verify that Tab can leave the control and default navigation behaves as expected.

AppKit suppresses software keyboards while a physical keyboard is connected. Existing software-keyboard `READY` and `CANCEL` callbacks remain valid, so preserve their business logic. For a given submit action, use only one `LV_EVENT_READY` entry point: either the textarea or the software keyboard. This avoids duplicate submissions when both objects emit the event.

## 4. Focus scopes for modal and full-screen views

When a modal overlay or full-screen detail view covers other controls, call `cm0_input_set_focus_scope()` from `<cm0/input.h>` after creating its container. The visible frontmost marked scope owns keyboard navigation. Hiding or deleting it restores the enclosing scope, and nested scopes are supported.

The following function can be added to the application's UI code. Pass the parent object when opening the modal. Clicking the back button or pressing Enter on it closes the modal:

```cpp
#include <cm0/input.h>

static void close_modal(lv_event_t *event)
{
    auto *modal = static_cast<lv_obj_t *>(lv_event_get_user_data(event));
    lv_obj_delete(modal);
}

static lv_obj_t *show_modal(lv_obj_t *parent)
{
    lv_obj_t *modal = lv_obj_create(parent);
    lv_obj_add_flag(modal, LV_OBJ_FLAG_FLOATING); // Exclude from the parent layout to act as an overlay.
    lv_obj_set_size(modal, lv_pct(100), lv_pct(100));
    lv_obj_center(modal);
    cm0_input_set_focus_scope(modal);

    lv_obj_t *back = lv_button_create(modal);
    lv_obj_t *label = lv_label_create(back);
    lv_label_set_text(label, "Back");
    lv_obj_center(label);
    lv_obj_add_event_cb(back, close_modal, LV_EVENT_CLICKED, modal);
    return modal;
}
```

The LVGL object owns the marker, so no separate cleanup is required. Every scope should provide an accessible cancel or back control. Marking a focus scope does not by itself make Escape close the modal; Escape still follows the editor-cancel / application-exit rules described above.

## 5. Keyboard browsing for long lists and read-only content

Call `cm0_input_set_scroll_region()` on a scrollable container whose content extends beyond its visible area. This is useful for documents, settings lists, and pages that combine controls with read-only content. The following function creates a vertical browsing region to which the application can then add content:

```cpp
#include <cm0/input.h>

static lv_obj_t *create_browse_region(lv_obj_t *parent)
{
    lv_obj_t *region = lv_obj_create(parent);
    lv_obj_set_size(region, lv_pct(100), lv_pct(70));
    lv_obj_set_flex_flow(region, LV_FLEX_FLOW_COLUMN);
    lv_obj_add_flag(region, LV_OBJ_FLAG_SCROLLABLE);
    lv_obj_set_scroll_dir(region, LV_DIR_VER);
    cm0_input_set_scroll_region(region);
    return region;
}
```

Once the region is marked, the following rules apply when its content overflows:

- Arrow keys can enter the region, navigate its visible controls, and scroll incrementally through read-only content.
- Each scroll step is limited to a quarter of the visible viewport. Focus never jumps directly to an offscreen control.
- In a scrollable direction, content scrolls before focus leaves the region. At a scroll boundary, or along an axis the region does not scroll, focus can move to an adjacent visible control.
- Tab / Shift+Tab can still enter and leave the region directly.

Unmarked lists retain normal navigation: focus can move to an offscreen control, which is then automatically scrolled into view. Add the marker only to regions that need incremental content browsing.

## 6. Visual focus styles

By default, Runtime draws a **3 px focus ring** inside the focused control: a 2 px dark neutral outer edge and a 1 px white inner edge. It is drawn after the control's children, so images and canvases cannot cover it. It does not affect layout or suffer from clipping at list or grid boundaries as an external outline can.

The focus ring stays hidden until the user first presses a key or touches a control. It is also hidden when the keyboard is absent.

To use a native LVGL external outline, explicitly set a **positive local `outline_width`** for `LV_STATE_FOCUS_KEY` or `LV_STATE_FOCUSED` before Runtime discovers the control. Use the same selector for the color, opacity, and padding. For example:

```cpp
static void use_native_focus_outline(lv_obj_t *control)
{
    const lv_style_selector_t selector = LV_PART_MAIN | LV_STATE_FOCUS_KEY;
    lv_obj_set_style_outline_width(control, 2, selector);
    lv_obj_set_style_outline_pad(control, 2, selector);
    lv_obj_set_style_outline_color(control, lv_color_hex(0xFFFFFF), selector);
    lv_obj_set_style_outline_opa(control, LV_OPA_COVER, selector);
}
```

AppKit preserves the outline's opacity and skips its default inner ring. A width inherited from a theme alone does not enable this behavior. Ancestor containers must leave enough room for `outline_width + outline_pad` to avoid clipping. Native outlines follow their LVGL state selectors; `LV_STATE_FOCUS_KEY` can be used to show the outline only in the keyboard-focus state.

## 7. Exclusive input for games and terminals

Ordinary applications use the default input group. A game or terminal that needs to take exclusive keyboard input temporarily must handle both takeover and restoration:

1. Save the current LVGL group before taking over, and restore it afterward.
2. Ignore stale key-up events after detaching from the original input group so old events do not trigger actions in the new view.
3. Restore the group on every normal-exit, cancel, and input-device-delete path.
4. Preserve AppKit's evdev decoding and global Escape / Enter rules. These rules must remain in effect after the takeover ends.

A takeover does not justify creating a second evdev reader. When an input device is deleted, coordinate restoration with object lifetimes to avoid accessing the deleted device.

## 8. Device discovery and status queries

On Linux, AppKit accepts an event device only if it meets both conditions:

| Check | Requirement |
| --- | --- |
| `EVIOCGNAME` | The device name contains `tca8418`, case-insensitively. |
| `EV_KEY` capability bitmap | Includes Enter, Escape, Tab, Backspace, Up, Down, Left, Right, Space, and the representative text keys A, Z, 0, and 9. |

Delete, Home, and End are optional. The device-tree matrix shipped with T-DisplayCM0 does not contain these keys. AppKit maps them when a keymap provides them, but their absence must not cause the entire keyboard to be rejected. These checks validate device capabilities; they do not require the keyboard to implement every key AppKit can decode.

Startup discovery, hotplug reconnection, hardware-keyboard status, and software-keyboard suppression use the same predicate. The SDL simulator provides a compatible host-keyboard path without applying the Linux device-name check.

To display connection status in the UI, use the query functions in `<cm0/input.h>`:

| API | Meaning |
| --- | --- |
| `cm0_input_keyboard_present()` | Reports whether a keyboard is available, including the SDL simulator's keyboard path. |
| `cm0_input_hardware_keyboard_present()` | Returns true only for a physical Linux event-node keyboard; returns false for the SDL host keyboard. |

Use these queries to display status. Leave keyboard creation, reconnection, and software-keyboard policy to Runtime.

## 9. Verification and release

### Run the AppKit host tests

Install CMake, build tools, pkg-config, SDL2, FreeType, and LPM as required by the AppKit README, then run the following from the **AppKit repository root**:

```sh
cmake --preset host-simulator
cmake --build --preset host-simulator --parallel
ctest --preset host-simulator --output-on-failure \
  -R 'lilygo-ui-(keyboard-|runtime-input-)'
```

The `lilygo-ui-runtime-input-*` tests cover hotplug, key events, directional navigation, editing, hidden and disabled pages, modal nesting and deletion, existing key handlers, idle scroll stability, and software-keyboard isolation. Focus-ring tests inspect pixels along all four sides at **320×568, 568×1232, 1232×568, and 1024×768**, including zero padding, parent clipping, and opaque child objects. Native-outline tests also check style preservation, the absence of a duplicate inner ring, and disappearance when focus moves away.

Passing host tests does not imply that the application has been installed on a device or tested with a physical TCA8418 keyboard. Before release, verify hotplug and key interactions on the target device.

### Check the embedded AppKit revision

A compatible application must embed the following AppKit components, and its source code must not implement a second primary evdev input path:

- `include/cm0/input.h`
- `src/input.cpp` and `src/runtime.cpp`
- The patched evdev keyboard file
- Runtime input tests
- `docs/keyboard-input-contract.md`

The contract requires running `tools/check_appkit_compatibility.py` before committing an application's AppKit gitlink (submodule pointer).

::: warning Compatibility checker availability varies by revision
AppKit revision `f494744`, checked for this guide, mentions this script in the contract but does not provide it under `tools/`. First check whether your pinned revision includes it, then follow that revision's instructions to confirm the arguments and interpret the report. If the script is missing, check with the AppKit maintainers. Do not describe a manual file check or passing host tests as a successful run of this compatibility checker.
:::

### Pre-release checklist

- [ ] The application uses the default input group through `cm0_app_run()` and does not read the keyboard device a second time.
- [ ] Tab / Shift+Tab, arrow navigation, one-line textarea submission, and Escape behavior follow the contract.
- [ ] Custom clickable controls can receive focus; hidden, disabled, and dynamically created controls behave correctly.
- [ ] Modal views have marked focus scopes and back controls; focus is restored after nesting, hiding, and deletion.
- [ ] Overflowing regions that need incremental browsing are marked, and scrolling boundaries and exits behave correctly.
- [ ] Focus indicators remain clear over images, selected states, and dark backgrounds, with enough space for any native outlines.
- [ ] Input resumes after unplugging and reconnecting the physical keyboard. Software keyboards are suppressed while it is connected, and existing software-keyboard callbacks still work.
- [ ] Any exclusive input takeover restores the group on exit, cancellation, and input-device deletion.
- [ ] Compatibility-check results and host / hardware verification results are recorded, and the corresponding AppKit revision is published.
- [ ] Every affected application repository pins that revision, and its application is rebuilt, packaged, and deployed.

## 10. Troubleshooting

| Symptom | Check first |
| --- | --- |
| Physical keyboard is not recognized | Confirm that the Linux driver provides an event device whose name and required capability bits meet the conditions. Missing Delete / Home / End keys must not cause rejection. |
| Tab cannot focus a control | Check that the application starts through Runtime, its ancestors are neither hidden nor disabled, and a custom clickable object has a click callback. |
| Background controls still receive focus while a modal is open | Check that the container covering the page is marked with `cm0_input_set_focus_scope()` and is the visible frontmost scope. |
| Arrow keys jump directly to offscreen content | Check that a scrollable container requiring incremental browsing is marked with `cm0_input_set_scroll_region()`. |
| Enter in a one-line textarea does not trigger the business action | Check that one-line mode is enabled and an `LV_EVENT_READY` callback is registered. |
| Focus styling is missing or clipped | Check that a key or touch interaction has occurred and a keyboard is present. For native outlines, check that a local style was set before discovery and enough external space was reserved. |
| Updating the SDK does not change an existing application's behavior | Check that the application updated its pinned AppKit source and that its executable was rebuilt and deployed. |

## References

- [AppKit keyboard compatibility contract](https://github.com/LILYGO-UI/cm0-appkit/blob/main/docs/keyboard-input-contract.md)
- [Public input API: `include/cm0/input.h`](https://github.com/LILYGO-UI/cm0-appkit/blob/main/include/cm0/input.h)
- [Application entry API: `include/cm0/app.h`](https://github.com/LILYGO-UI/cm0-appkit/blob/main/include/cm0/app.h)
- [AppKit build instructions](https://github.com/LILYGO-UI/cm0-appkit)
- [Development guide](./development) · [Quick start](./quick-start)
