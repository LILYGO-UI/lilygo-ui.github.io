---
title: 键盘接入指南
description: LILYGO UI 应用的键盘接入、焦点导航、文本编辑、弹窗和兼容性验证。
show_source: false
---

# 键盘接入指南

本文面向基于 AppKit 和 LVGL 开发 LILYGO UI 应用的开发者，说明如何接入可拆卸 TCA8418 键盘，并让 SDL 模拟器、实体键盘和焦点导航保持一致。

**应用通过 `cm0_app_run()` 使用 `LilyGoUI::Runtime` 的默认输入组，按控件事件编写业务逻辑。** 键盘发现、事件解码、热插拔、按键重复过滤和焦点管理由 AppKit 统一处理。

本文依据 AppKit 的 [Keyboard input contract](https://github.com/LILYGO-UI/cm0-appkit/blob/main/docs/keyboard-input-contract.md) 整理。规范随 AppKit 版本演进；使用新行为前，先更新应用固定的 `third_party/cm0-appkit` 提交，再重新构建和部署应用。AppKit 与 LVGL 静态链接进应用，仅更新设备上安装的 SDK 不会改变已有应用的行为。

## 1. 明确接入边界

| 层级 | 负责的工作 |
| --- | --- |
| Linux `tca8418_keypad` 驱动 | 扫描矩阵，使用设备树 `linux,keymap`，输出 Linux `EV_KEY` 事件。 |
| AppKit | 发现设备，转换 LVGL 按键，维护输入设备和默认输入组，处理热插拔、焦点、滚动浏览和软键盘抑制。 |
| 应用 | 创建控件，处理点击、提交等业务事件，标记弹窗焦点范围和滚动浏览区域。 |

应用不得读取 TCA8418 寄存器或扫描矩阵，不得直接打开 `event*` 节点、另装 evdev 读取器，或替换 AppKit 的 LVGL 键盘补丁。诊断页可以展示 evdev 状态，但不得将它接入业务控件，形成第二条主键盘输入路径。

## 2. 最小接入示例

### 链接 Runtime

在应用的 CMake 工程中定位源 SDK，并链接公开 target。下面的 `keyboard_demo` 是示例 target 名：

```cmake
find_package(LilyGoUI CONFIG REQUIRED)

add_executable(keyboard_demo main.cpp)
target_compile_features(keyboard_demo PRIVATE cxx_std_17)
target_link_libraries(keyboard_demo PRIVATE LilyGoUI::Runtime)
```

通过项目 preset 或 `LilyGoUI_DIR` 指向应用固定的 AppKit 源码目录。完整工程、构建和打包方式见[开发指南](./development)和[快速开始](./quick-start)。

### 创建控件并处理提交

下面是一个完整的 `main.cpp`：输入框获得焦点后可以直接输入，按 Enter 触发 `LV_EVENT_READY`，示例把提交的内容显示在下方。实际应用应在这个回调中调用搜索、发送或保存等业务命令。

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
    // 在这里释放应用自行持有的业务资源。
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

普通应用无需自行创建键盘或输入组，也无需为每个控件手动注册焦点。Runtime 自动收集普通 LVGL group 控件；带 `LV_EVENT_CLICKED` 或 `LV_EVENT_SHORT_CLICKED` 回调的自定义可点击对象也会参与导航，装饰性容器不会参与。运行过程中动态创建的控件同样会被收集，隐藏或禁用的祖先节点下的整个子树会被排除。

## 3. 按键行为速查

AppKit 将导航和编辑键转换成 LVGL 的 `LV_KEY_*` 常量，将可打印键作为字符交给控件。

| 按键或场景 | 默认行为 | 应用接入要点 |
| --- | --- | --- |
| Tab / Shift+Tab | 在可见、启用的控件和已标记浏览区域之间向前 / 向后移动焦点，并将目标滚动到可见位置。 | 原生控件正在处理自己的按键时，Tab 仍可离开它。 |
| 方向键 | 按几何位置选择该方向最近的控件，优先同一行或同一列。 | 文本框、slider、dropdown、button matrix 保留原生方向键处理。 |
| Enter | 激活按钮和可点击卡片；提交活动的单行文本框，发出 `LV_EVENT_READY`。 | 将 `LV_EVENT_READY` 连接到业务提交命令。 |
| 文本和编辑键 | 获得焦点的文本框直接接收字母、数字、空格、标点及编辑键。 | 使用文本框已有能力，不再实现字符解码。 |
| Escape | 取消活动编辑器并恢复外层焦点范围；在普通控件上按下时退出应用。 | 弹窗仍应提供可聚焦的返回或取消控件。 |
| Switch | 四个方向键均用于导航；Enter 或 Space 每次按下只切换一次。 | 不要另加一套切换逻辑导致重复触发。 |
| 其他可选中控件 | Left / Right 调整，Enter 激活，Up / Down 导航。 | 按相应控件的业务事件处理状态变化。 |

字符映射采用标准 US 字母、数字、空格和标点键。Shift 用于切换字母大小写，以及数字和标点键的上档字符；Caps Lock 影响字母大小写，与 Shift 组合时反转大小写。Ctrl、Alt、Meta 和 Fn 在驱动层被消费，公开 API 尚未定义这些修饰键的契约，应用不能依赖它们实现快捷键。

应用可以为焦点控件添加业务级 `LV_EVENT_KEY` 回调；显式按键处理器保留该控件的按键处理权。因此，仅在控件确实需要特殊交互时使用它，并验证 Tab 离开和默认导航是否符合预期。

实体键盘连接期间，AppKit 会抑制软件键盘。现有软件键盘的 `READY`、`CANCEL` 回调仍然有效，应保留原有业务处理。同一提交逻辑应只选择文本框或软件键盘中的一个 `LV_EVENT_READY` 入口，避免两个对象分别发出事件时重复提交。

## 4. 弹窗和全屏页面的焦点范围

弹窗或全屏详情页覆盖其他控件时，在容器创建后调用 `<cm0/input.h>` 中的 `cm0_input_set_focus_scope()`。最前方可见的已标记范围拥有键盘导航，隐藏或删除后恢复外层范围，支持嵌套。

下面的函数可放入应用 UI 代码，并在需要打开弹窗时传入父对象。返回按钮通过点击或 Enter 关闭弹窗：

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
    lv_obj_add_flag(modal, LV_OBJ_FLAG_FLOATING); // 脱离父容器布局，作为覆盖层。
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

标记由 LVGL 对象持有，无需额外注销。每个范围都应提供可访问的取消或返回控件；焦点范围标记本身不代表 Escape 一定关闭弹窗，Escape 仍遵循前面的编辑取消 / 应用退出规则。

## 5. 长列表与只读内容的键盘浏览

对于内容超出可见区域的可滚动容器，调用 `cm0_input_set_scroll_region()`。这适用于文档、设置列表以及混合了控件和只读内容的页面。下面的函数创建一个竖向浏览区域，应用随后向它添加内容：

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

设置标记后，内容溢出时采用以下规则：

- 方向键可以进入区域，在可见控件之间导航，并逐步滚动浏览只读内容。
- 每次滚动步长不超过可见视口的四分之一，焦点不会直接跳到屏幕外的控件。
- 沿可滚动方向，先滚动内容，再将焦点移出区域；到达边界或沿不可滚动的轴导航时，可以移向相邻的可见控件。
- Tab / Shift+Tab 仍可直接进入和离开该区域。

未标记的列表保留普通导航行为：焦点可以移向屏幕外的控件，再自动滚动显示该控件。只有需要逐步浏览内容的区域才应添加此标记。

## 6. 焦点可视样式

Runtime 默认在焦点控件内部绘制 **3 px 焦点环**：外侧 2 px 深中性色，内侧 1 px 白色。它在子对象之后绘制，图片或画布不会遮挡；不改变布局，也不会像外部 outline 那样被列表或网格边界裁切。

焦点环在用户首次按键或触摸控件前隐藏，键盘不存在时也隐藏。

如需使用 LVGL 原生外部 outline，应在 Runtime 收集控件前，为该控件显式设置 `LV_STATE_FOCUS_KEY` 或 `LV_STATE_FOCUSED` 下的**本地正值 `outline_width`**，并用同一 selector 设置颜色、透明度和 padding。例如：

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

AppKit 会保留该 outline 的透明度并跳过默认内环。仅从主题继承宽度不会启用此行为；祖先容器应为 `outline_width + outline_pad` 留出空间，避免裁切。原生 outline 遵循自己的 LVGL 状态 selector，`LV_STATE_FOCUS_KEY` 可用于仅在键盘焦点状态下显示。

## 7. 游戏、终端等独占输入场景

普通应用使用默认输入组。确需临时独占键盘的游戏或终端必须完整处理接管和恢复：

1. 接管前保存当前 LVGL group，结束时恢复。
2. 脱离原输入组后忽略遗留的 key-up 事件，避免旧事件触发新界面的动作。
3. 在正常退出、取消和输入设备删除的每条路径上完成恢复。
4. 保留 AppKit 的 evdev 解码和全局 Escape / Enter 规则；接管结束后这些规则必须继续生效。

接管不是创建第二个 evdev 读取器的理由。涉及设备删除时，应结合对象生命周期处理恢复，避免继续访问已删除的输入设备。

## 8. 设备识别和状态查询

Linux 上，AppKit 只接受同时满足以下条件的事件设备：

| 检查项 | 要求 |
| --- | --- |
| `EVIOCGNAME` | 设备名称包含 `tca8418`，不区分大小写。 |
| `EV_KEY` 能力位图 | 包含 Enter、Escape、Tab、Backspace、Up、Down、Left、Right、Space，以及代表性文本键 A、Z、0、9。 |

Delete、Home、End 是可选键。随 T-DisplayCM0 提供的设备树矩阵没有这些键；如果键表提供它们，AppKit 会映射，但缺少它们不能导致整个键盘被拒绝。上述检测用于确认设备能力，并不要求键盘实现所有可解码按键。

启动发现、热插拔重连、硬件键盘状态以及软件键盘抑制使用同一个判定条件。SDL 模拟器提供兼容的主机键盘路径，不执行 Linux 设备名称检查。

如需在状态界面展示连接情况，可使用 `<cm0/input.h>` 中的查询函数：

| API | 含义 |
| --- | --- |
| `cm0_input_keyboard_present()` | 查询键盘是否可用，包含 SDL 模拟器的键盘路径。 |
| `cm0_input_hardware_keyboard_present()` | 仅 Linux 实体事件节点键盘返回 true；SDL 主机键盘返回 false。 |

这些查询用于展示状态；键盘创建、重连和软件键盘策略仍交给 Runtime。

## 9. 验证与发布

### 运行 AppKit 主机测试

安装 AppKit README 要求的 CMake、编译工具、pkg-config、SDL2、FreeType 和 LPM 后，在 **AppKit 仓库根目录**运行：

```sh
cmake --preset host-simulator
cmake --build --preset host-simulator --parallel
ctest --preset host-simulator --output-on-failure \
  -R 'lilygo-ui-(keyboard-|runtime-input-)'
```

其中 `lilygo-ui-runtime-input-*` 覆盖热插拔、按键事件、方向导航、编辑、隐藏和禁用页面、弹窗嵌套与删除、既有按键处理器、空闲时滚动稳定性，以及软键盘隔离。焦点环测试在 **320×568、568×1232、1232×568、1024×768** 下检查四边像素，包括零 padding、父容器裁切和不透明子对象遮挡的场景；原生 outline 测试还检查样式保留、无重复内环和焦点离开后的消失。

主机测试通过不代表已安装到设备，也不代表完成过实体 TCA8418 键盘测试。发布前仍应在目标设备验证插拔和按键交互。

### 检查应用内嵌的版本

兼容的应用需要内嵌以下 AppKit 内容，且应用源码不得存在第二条主 evdev 输入路径：

- `include/cm0/input.h`
- `src/input.cpp`、`src/runtime.cpp`
- 已打补丁的 evdev 键盘文件
- Runtime 输入测试
- `docs/keyboard-input-contract.md`

规范要求在提交应用的 AppKit gitlink（子模块指针）前，运行 `tools/check_appkit_compatibility.py`。

::: warning 兼容性检查脚本的版本差异
本文核对的 AppKit 提交 `f494744` 中，规范提到了该脚本，但 `tools/` 下尚未提供它。使用时请先确认所固定版本是否包含该脚本，并按该版本的使用说明核对参数和报告；脚本缺失时应向 AppKit 维护者确认，不能将文件自查或主机测试表述为该兼容性检查已通过。
:::

### 发布前检查清单

- [ ] 应用通过 `cm0_app_run()` 使用默认输入组，没有重复读取键盘设备。
- [ ] Tab / Shift+Tab、方向导航、单行输入提交及 Escape 行为符合规范。
- [ ] 自定义可点击控件可以聚焦；隐藏、禁用和动态创建控件行为正确。
- [ ] 弹窗标记了焦点范围，并提供返回控件；嵌套、隐藏和删除后焦点可恢复。
- [ ] 需要逐步浏览的溢出区域已标记，滚动边界和离开区域的行为正确。
- [ ] 焦点指示在图片、选中状态和暗色背景上清晰可见，使用原生 outline 时空间充足。
- [ ] 实机插拔后可重新输入，实体键盘连接时软件键盘被抑制；已有软键盘回调正常。
- [ ] 如有独占输入接管，退出、取消和设备删除路径均完成恢复。
- [ ] 已记录兼容性检查与主机 / 实机验证结果，并发布对应 AppKit 提交。
- [ ] 每个受影响应用仓库已固定该提交，重新构建、打包并部署应用。

## 10. 常见问题排查

| 现象 | 优先检查 |
| --- | --- |
| 实体键盘未被识别 | Linux 驱动是否提供事件设备，名称及必需能力位是否满足条件；缺少 Delete / Home / End 不应成为拒绝理由。 |
| 控件无法通过 Tab 聚焦 | 是否通过 Runtime 启动；祖先是否隐藏或禁用；自定义可点击对象是否注册点击回调。 |
| 弹窗出现后背景控件仍能聚焦 | 遮挡页面的容器是否标记了 `cm0_input_set_focus_scope()`，是否为最前方可见范围。 |
| 方向键直接跳到屏幕外内容 | 需要逐步浏览的滚动容器是否标记了 `cm0_input_set_scroll_region()`。 |
| 单行文本框按 Enter 没有执行业务 | 是否设置单行模式并注册 `LV_EVENT_READY` 回调。 |
| 焦点样式缺失或被裁切 | 是否已有键盘或触摸交互、键盘是否存在；原生 outline 是否在收集前本地设置并预留外部空间。 |
| 更新 SDK 后旧应用行为未变化 | 应用是否更新了固定的 AppKit 源码，并重新构建和部署可执行文件。 |

## 参考资料

- [AppKit 键盘兼容性规范](https://github.com/LILYGO-UI/cm0-appkit/blob/main/docs/keyboard-input-contract.md)
- [公开输入 API：`include/cm0/input.h`](https://github.com/LILYGO-UI/cm0-appkit/blob/main/include/cm0/input.h)
- [应用入口 API：`include/cm0/app.h`](https://github.com/LILYGO-UI/cm0-appkit/blob/main/include/cm0/app.h)
- [AppKit 构建说明](https://github.com/LILYGO-UI/cm0-appkit)
- [开发指南](./development) · [快速开始](./quick-start)
