---
title: Quick start
description: Flash a LILYGO UI system image to T-Display-CM0 through USB or a TF card reader, then complete the first boot.
show_source: false
---

# Quick start

Flash a system image to **T-Display-CM0** in this order: **Download the image → Connect through USB or a TF card reader → Write with Raspberry Pi Imager → Start the device**.

| Method | Connection | Required tools |
| --- | --- | --- |
| [Flash through USB](#usb-flashing) | Leave the TF card in the device and expose its storage to the computer over USB | USB data cable, `rpiboot`, Raspberry Pi Imager |
| [Flash a TF card](#tf-flashing) | Remove the TF card and connect it to the computer through a card reader | TF card reader, Raspberry Pi Imager |

T-Display-CM0 uses a TF / microSD card for system storage; CM0 Lite has no onboard eMMC. Choose either connection method, then follow the [shared Imager steps](#imager-flashing) below.

## Download the system image {#download-image}

Use the **T-Display-CM0 system image** below for this tutorial. Both USB and TF card flashing use the same file.

**[Download the T-Display-CM0 system image (ZIP)](https://github.com/LILYGO-UI/pi-gen/releases/download/2026-11-03-raspios-trixie-arm64-t-display-cm0/image_2026-11-03-t-displaycm0-lite.zip)**

Filename: `image_2026-11-03-t-displaycm0-lite.zip`.

After downloading, select this ZIP file directly with **Use custom** in Raspberry Pi Imager. **You do not need to extract it.** The screenshots below use this same image.

## Before flashing

- **System image:** Download the [system image provided above](#download-image) and make sure the ZIP file is fully saved on your computer.
- **TF card:** Use a card large enough for the extracted image, with additional space for applications and saved files.
- **Flashing software:** Install [Raspberry Pi Imager](https://www.raspberrypi.com/software/) on your computer. Both the USB and card-reader methods use it to write the image.
- **Power and connection:** Prepare a stable 5 V power supply. For USB flashing, use a cable that supports data transfer and connect it to the device's Type-C port used for USB flashing.

::: warning Writing the image erases the target card
Back up any files you want to keep. Before writing, check the target storage device's name and capacity to avoid selecting your computer's drive or another removable device. Keep the power and connection stable during writing and verification.
:::

::: tip Use the complete image provided for this tutorial
The image above includes LILYGO UI and board support. After writing and verification, follow the startup instructions below. You do not need to manually copy `bootfs` deployment resources or run an additional first-boot script.
:::

## Flash through USB {#usb-flashing}

**USB flashing requires running `rpiboot` first.** Leave the TF card in the device and connect a USB data cable so the computer can access the system card, then continue to the shared Imager steps.

### Prepare rpiboot

Follow the [official Raspberry Pi usbboot instructions](https://github.com/raspberrypi/usbboot) to install or build `rpiboot` for your computer, and prepare the accompanying `mass-storage-gadget` boot files. Run the command below from the `usbboot` directory. See the relevant sections of that repository for your operating system's dependencies and driver installation instructions.

### Enter USB flashing mode

1. Make sure the TF card is inserted. Shut down the device and wait about **10 seconds**.
2. Connect the computer to a Type-C port on the device with a USB data cable that supports data transfer; follow the port markings on the board.
3. Hold **BOOT** and, while keeping it pressed, hold **POWER** for about **1 second**.
4. Run the following command in your computer's terminal:

   ```bash
   sudo ./rpiboot -d mass-storage-gadget
   ```

5. Wait about **5 seconds**, until the computer detects the device's **USB mass-storage device**.

<DeviceScreenshot
  src="/flashing/usb-rpiboot.png"
  alt="USB-only step: the terminal runs sudo ./rpiboot -d mass-storage-gadget and shows the boot files loading"
  caption="Required only for USB flashing: run rpiboot on the computer. The screenshot shows the boot files loading."
  :width="1170"
  :height="742"
/>

Once the computer detects the storage device, continue to [Write with Raspberry Pi Imager](#imager-flashing).

## Flash a TF card {#tf-flashing}

Remove the TF card and connect it through a card reader to write the image with Raspberry Pi Imager on your computer.

1. Shut down T-Display-CM0 and remove the TF card.
2. Insert the TF card into the card reader, then connect the reader to your computer.
3. Make sure the computer detects the TF card, then follow the [shared Imager steps](#imager-flashing) below. **This method does not require running `rpiboot` or pressing BOOT.**

## Write with Raspberry Pi Imager (both methods) {#imager-flashing}

After connecting through USB or a card reader, follow these six steps. The screenshots show **Raspberry Pi Imager v2.0.10 on macOS with the interface set to Chinese**; layouts and button labels may differ slightly in other versions. The image in the screenshots matches the [download above](#download-image). Storage device names and capacities are examples; check the TF card you connected.

### 1. Select No filtering

Open Raspberry Pi Imager, select **No filtering** at the bottom of the device list, then click **Next**.

<DeviceScreenshot
  src="/flashing/imager-device.png"
  alt="Raspberry Pi Imager device selection with No filtering selected and the Next button visible"
  caption="Step 1: Select No filtering to continue to operating system selection."
  :width="1360"
  :height="956"
/>

### 2. Select a custom image

At the bottom of the operating system list, click **Use custom** and select the [image you downloaded above](#download-image): `image_2026-11-03-t-displaycm0-lite.zip`. Select the ZIP file directly; no extraction is required.

<DeviceScreenshot
  src="/flashing/imager-image.png"
  alt="Raspberry Pi Imager operating system selection with Use custom selected"
  caption="Step 2: Select Use custom and open the local system image file."
  :width="1360"
  :height="956"
/>

### 3. Select the target storage device

Select the TF card you want to write to and check its **name and capacity**. Keep **Exclude system drives** selected, then click **Next**.

| Connection method | Storage device to select |
| --- | --- |
| USB | The device storage that appears after running `rpiboot`. In the screenshot, it is `mmcblk0 Media` with a capacity of `29.1 GB`. |
| TF card reader | The TF card in the reader. It may appear under the card reader model or the SD card name. |

<DeviceScreenshot
  src="/flashing/imager-storage.png"
  alt="Raspberry Pi Imager storage selection with the example 29.1 GB mmcblk0 Media device selected and Exclude system drives checked"
  caption="Step 3: Check the target card's name and capacity. The name may differ when using a TF card reader."
  :width="1360"
  :height="956"
/>

If customization options appear, follow the instructions supplied with the image. If there are no additional requirements, skip them to preserve the image's defaults.

### 4. Review the summary and write

On the write screen, confirm that the **operating system image** is `image_2026-11-03-t-displaycm0-lite.zip` and check the **target storage device** again. Click **Write** once they are correct. If a prompt asks you to confirm erasing data, check the target card again before confirming.

<DeviceScreenshot
  src="/flashing/imager-review.png"
  alt="Raspberry Pi Imager summary before writing, showing No filtering, the T-Display-CM0 image ZIP file, and mmcblk0 Media as the target storage"
  caption="Step 4: Check the image file and target storage device, then start writing."
  :width="1360"
  :height="956"
/>

### 5. Wait for writing and verification

Keep the USB or card reader connection and device power stable. Wait for writing to finish, then let verification complete. The screenshot below shows verification at **84%**, so it is not yet safe to remove the device. **Wait for verification to finish; do not click Skip verification.**

<DeviceScreenshot
  src="/flashing/imager-verify.png"
  alt="Raspberry Pi Imager verifying the written data with progress at 84%"
  caption="Step 5: Wait for verification of the written image to finish."
  :width="1360"
  :height="956"
/>

### 6. Finish and safely remove the storage

When the completion screen appears, check whether it says the storage device has been automatically ejected. If so, you can safely remove it. Otherwise, safely eject it from your computer first.

<DeviceScreenshot
  src="/flashing/imager-complete.png"
  alt="Raspberry Pi Imager completion screen confirming the storage device was automatically ejected and can be safely removed"
  caption="Step 6: Confirm writing is complete and the storage device has been ejected before disconnecting it."
  :width="1360"
  :height="956"
/>

- **USB:** Shut down T-Display-CM0 and disconnect the USB connection used for flashing. Leave the TF card in the device.
- **TF card reader:** Remove the TF card from the reader and insert it into the powered-off T-Display-CM0.

Continue to [First boot](#first-boot). A complete LILYGO UI image does not require manually copying deployment resources afterward. If your computer asks to format an unrecognized partition, cancel the prompt.

## First boot {#first-boot}

1. Make sure the TF card is inserted and **BOOT** is released.
2. Connect a stable **5 V power supply**, then hold **POWER** for about **1 second** to turn on the device.
3. Wait for the initial system setup to finish and keep the power connected. If the image includes a setup wizard, follow the on-screen instructions for region, account, and network settings. If an account is already configured, sign in as described in the image's instructions.
4. Once [Launcher](./guide/launcher) opens, use [Settings](./guide/settings) to connect to Wi-Fi, then open [Store](./guide/store) to install applications.

## Troubleshooting

| Symptom | What to check |
| --- | --- |
| The computer does not detect storage during USB flashing | Check that the TF card is inserted, the USB cable supports data transfer, and the correct port is connected. Shut down, wait about 10 seconds, repeat the BOOT + POWER sequence, and check the `rpiboot` output. |
| `rpiboot` reports that the program or boot directory cannot be found | Make sure installation or compilation is complete. Run it from the directory containing `rpiboot` and `mass-storage-gadget`, or adjust the paths to match their installed locations. |
| Imager fails to write or verify the image | Check the TF card's capacity, the card reader or USB connection, power, and the image file's integrity. If necessary, try another card or cable. |
| The device does not start correctly after flashing | Make sure you used the [system image provided on this page](#download-image), writing and verification succeeded, the TF card is inserted, and BOOT is released. Also check the 5 V power supply. |

[User documentation](./user-guide) · [Developer documentation](./developer-guide) · [Documentation center](./docs)
