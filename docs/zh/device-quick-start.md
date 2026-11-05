---
title: 快速开始
description: 使用 USB 或 TF 卡读卡器为 T-Display-CM0 烧录 LILYGO UI 系统镜像，并完成首次启动。
show_source: false
---

# 快速开始

按以下顺序为 **T-Display-CM0** 烧录系统镜像：**下载镜像 → 选择 USB 或 TF 卡连接 → 使用 Raspberry Pi Imager 写入 → 启动设备**。

| 方式 | 连接方法 | 所需工具 |
| --- | --- | --- |
| [USB 烧录镜像](#usb-flashing) | TF 卡留在设备中，通过 USB 将存储暴露给电脑 | USB 数据线、`rpiboot`、Raspberry Pi Imager |
| [TF 卡烧录镜像](#tf-flashing) | 取出 TF 卡，通过读卡器连接电脑 | TF 卡读卡器、Raspberry Pi Imager |

T-Display-CM0 使用 TF / microSD 卡作为系统存储，CM0 Lite 无板载 eMMC。任选一种连接方式，准备完成后都进入下方的[共用 Imager 写入步骤](#imager-flashing)。

## 下载系统镜像 {#download-image}

本教程使用下面这份 **T-Display-CM0 系统镜像**，USB 和 TF 卡两种烧录方式共用同一个文件。

**[下载 T-Display-CM0 系统镜像（ZIP）](https://github.com/LILYGO-UI/pi-gen/releases/download/2026-11-03-raspios-trixie-arm64-t-display-cm0/image_2026-11-03-t-displaycm0-lite.zip)**

文件名：`image_2026-11-03-t-displaycm0-lite.zip`。

下载完成后，直接在 Raspberry Pi Imager 的**使用自定义镜像（Use custom）**中选择这个 ZIP 文件，**无需手动解压**。下面的操作截图使用的也是这份镜像。

## 烧录前准备

- **系统镜像**：先下载[上方提供的系统镜像](#download-image)，并确认 ZIP 文件已完整保存到电脑。
- **TF 卡**：容量应满足解压后的镜像大小要求，并留出安装应用和保存文件的空间。
- **烧录软件**：在电脑上安装 [Raspberry Pi Imager](https://www.raspberrypi.com/software/)。USB 和读卡器两种方式均使用它写入镜像。
- **供电与连接**：准备稳定的 5 V 电源；USB 烧录需使用支持数据传输的线缆，并连接设备用于 USB 烧录的 Type-C 接口。

::: warning 写入会清除目标卡的数据
先备份需要保留的文件。开始写入前核对目标存储设备的名称和容量，避免选中电脑硬盘或其他移动存储设备。写入与校验期间保持供电和连接稳定。
:::

::: tip 使用本教程提供的完整镜像
上方镜像已集成 LILYGO UI 和板级支持。完成写入与校验后即可按下文启动设备，无需手动复制 `bootfs` 部署资源或运行额外的首次启动脚本。
:::

## USB 烧录镜像 {#usb-flashing}

**USB 方式需要先运行 `rpiboot`。** 将 TF 卡留在设备中，通过 USB 数据线让电脑识别这张系统卡，然后继续共用的 Imager 写入步骤。

### 准备 rpiboot

按照 [Raspberry Pi usbboot 官方说明](https://github.com/raspberrypi/usbboot)为电脑安装或编译 `rpiboot`，并准备配套的 `mass-storage-gadget` 启动文件。下面的命令在 `usbboot` 目录中执行；各操作系统的依赖和驱动安装方式请参阅该仓库的对应章节。

### 进入 USB 烧录模式

1. 确认 TF 卡已插入设备。将设备关机，等待约 **10 秒**。
2. 用支持数据传输的 USB 数据线连接电脑和设备的 Type-C 接口，请按板上接口标识选择接口。
3. 按住 **BOOT** 按键不松开，同时按住 **POWER** 按键约 **1 秒**。
4. 在电脑终端运行：

   ```bash
   sudo ./rpiboot -d mass-storage-gadget
   ```

5. 等待约 **5 秒**，直到电脑识别到设备提供的 **USB 大容量存储设备（USB mass-storage device）**。

<DeviceScreenshot
  src="/flashing/usb-rpiboot.png"
  alt="USB 专属步骤：终端运行 sudo ./rpiboot -d mass-storage-gadget，并输出启动文件加载日志"
  caption="仅 USB 方式需要：在电脑上运行 rpiboot。图中展示启动文件的加载过程。"
  :width="1170"
  :height="742"
/>

电脑识别到存储设备后，继续[使用 Raspberry Pi Imager 写入](#imager-flashing)。

## TF 卡烧录镜像 {#tf-flashing}

将 TF 卡取出并连接读卡器，即可在电脑上使用 Raspberry Pi Imager 写入镜像。

1. 将 T-Display-CM0 关机，取出 TF 卡。
2. 将 TF 卡放入读卡器，再把读卡器连接到电脑。
3. 确认电脑识别到 TF 卡，继续下方的[共用 Imager 写入步骤](#imager-flashing)。**此方式不需要运行 `rpiboot`，也不需要按 BOOT。**

## 使用 Raspberry Pi Imager 写入（两种方式共用） {#imager-flashing}

完成 USB 或读卡器连接后，按下面六步操作。截图为 **macOS 上的 Raspberry Pi Imager v2.0.10 中文界面**；其他版本的布局或按钮名称可能略有不同。截图中的镜像与[上方下载入口](#download-image)一致；存储设备名称和容量为示例，请以实际连接的 TF 卡为准。

### 1. 设备选择 No filtering

打开 Raspberry Pi Imager，在“设备”列表底部选择 **No filtering**，点击**下一步**。

<DeviceScreenshot
  src="/flashing/imager-device.png"
  alt="Raspberry Pi Imager 设备选择页，选中 No filtering 并显示下一步按钮"
  caption="第 1 步：选择 No filtering，进入操作系统选择。"
  :width="1360"
  :height="956"
/>

### 2. 选择自定义镜像

在“操作系统”列表底部点击**使用自定义镜像（Use custom）**，选择[前面下载的镜像](#download-image) `image_2026-11-03-t-displaycm0-lite.zip`。直接选择 ZIP 文件即可，无需手动解压。

<DeviceScreenshot
  src="/flashing/imager-image.png"
  alt="Raspberry Pi Imager 操作系统选择页，选中使用自定义镜像"
  caption="第 2 步：选择使用自定义镜像，并打开本地系统镜像文件。"
  :width="1360"
  :height="956"
/>

### 3. 选择目标存储设备

选择要写入的 TF 卡，核对**名称和容量**，保留“排除系统驱动器”勾选，再点击**下一步**。

| 连接方式 | 应选择的存储设备 |
| --- | --- |
| USB | 运行 `rpiboot` 后出现的设备存储。截图中为 `mmcblk0 Media`，容量 `29.1 GB`。 |
| TF 读卡器 | 读卡器中的 TF 卡，名称可能显示为读卡器型号或 SD 卡名称。 |

<DeviceScreenshot
  src="/flashing/imager-storage.png"
  alt="Raspberry Pi Imager 存储选择页，示例选中容量为 29.1 GB 的 mmcblk0 Media，排除系统驱动器已勾选"
  caption="第 3 步：核对目标卡的名称与容量。TF 读卡器方式的设备名称可能不同。"
  :width="1360"
  :height="956"
/>

如出现“自定义设置”，按镜像配套说明处理；没有额外要求时跳过，保留镜像预设。

### 4. 核对摘要并写入

在“写入”页面确认**操作系统镜像**为 `image_2026-11-03-t-displaycm0-lite.zip`，并再次核对**目标存储设备**。确认无误后点击**写入**；若出现清除数据的确认提示，再次核对目标卡后确认。

<DeviceScreenshot
  src="/flashing/imager-review.png"
  alt="Raspberry Pi Imager 写入前摘要，显示 No filtering、T-Display-CM0 镜像 ZIP 文件和 mmcblk0 Media 目标存储"
  caption="第 4 步：核对镜像文件和目标存储设备，再开始写入。"
  :width="1360"
  :height="956"
/>

### 5. 等待写入和校验完成

保持 USB 或读卡器连接及设备供电稳定，等待写入结束后继续完成校验。下图显示“正在校验……84%”，此时还不能移除设备，**请等待校验完成，不要点击“跳过验证”**。

<DeviceScreenshot
  src="/flashing/imager-verify.png"
  alt="Raspberry Pi Imager 正在校验已写入的数据，进度为 84%"
  caption="第 5 步：等待写入后的校验完成。"
  :width="1360"
  :height="956"
/>

### 6. 写入完成并安全移除

看到 **写入完成！** 后，检查界面是否提示“存储设备已自动弹出”。若已弹出，可安全移除；若未自动弹出，请先在电脑上安全弹出。

<DeviceScreenshot
  src="/flashing/imager-complete.png"
  alt="Raspberry Pi Imager 显示写入完成，提示存储设备已自动弹出，可以安全移除"
  caption="第 6 步：确认写入完成且存储设备已弹出，再断开连接。"
  :width="1360"
  :height="956"
/>

- **USB 方式**：将 T-Display-CM0 关机，断开用于烧录的 USB 连接，TF 卡保留在设备中。
- **TF 读卡器方式**：从读卡器取出 TF 卡，插回关机状态的 T-Display-CM0。

完成后继续[首次启动](#first-boot)。完整 LILYGO UI 镜像无需再手动复制部署资源；如果电脑提示格式化无法识别的分区，请取消。

## 首次启动 {#first-boot}

1. 确认 TF 卡已插好，且 **BOOT** 按键已松开、未处于按下状态。
2. 接入稳定的 **5 V 电源**，按住 **POWER** 约 **1 秒**开机。
3. 等待系统完成首次初始化，期间保持供电。若镜像提供首次设置向导，按屏幕提示完成地区、账号和网络设置；若已有预设账号，按该镜像的说明登录。
4. 进入 [Launcher 启动器](./guide/launcher)后，打开 [Settings 系统设置](./guide/settings)连接 Wi-Fi，再到 [Store 应用商店](./guide/store)安装应用。

## 常见问题

| 现象 | 检查方法 |
| --- | --- |
| USB 烧录时电脑没有识别到存储设备 | 检查 TF 卡是否插好、USB 线是否支持数据传输、接口是否正确；关机等待约 10 秒后重新执行 BOOT + POWER 步骤，并查看 `rpiboot` 输出。 |
| `rpiboot` 提示找不到程序或启动目录 | 确认已完成安装或编译，并在包含 `rpiboot` 与 `mass-storage-gadget` 的目录中运行，或按安装位置调整路径。 |
| Imager 写入或校验失败 | 检查 TF 卡容量、读卡器或 USB 连接、供电和镜像文件完整性；必要时更换卡或线缆后重试。 |
| 烧录完成后不能正常启动 | 确认使用[本页提供的系统镜像](#download-image)、写入与校验成功、TF 卡插好且 BOOT 已松开，并检查 5 V 供电。 |

[进入使用文档](./user-guide) · [进入开发文档](./developer-guide) · [返回文档中心](./docs)
