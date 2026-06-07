# 大连市第五中学官网 - 项目架构与数据维护规范

# System Architecture & Data Maintenance Specifications

本项目为一个单文件响应式前端页面（Single-file Responsive Webpage），采用 HTML5 标准构建，样式基于 **Tailwind CSS**，动态内容通过原生 JavaScript 进行纯前端数据驱动渲染（Data-driven Rendering），实现了基础的**数据与结构解耦**。

---

## 目录

1. [项目文件结构](https://www.google.com/search?q=%23%E4%B8%80%E9%A1%B9%E7%9B%AE%E6%96%87%E4%BB%B6%E7%BB%93%E6%9E%84)
2. [数据配置模型 (JavaScript Data Models)](https://www.google.com/search?q=%23%E4%BA%8C%E6%95%B0%E6%8D%AE%E9%85%8D%E7%BD%AE%E6%A8%A1%E5%9E%8B-javascript-data-models)
3. [DOM 静态占位与图片替换规范](https://www.google.com/search?q=%23%E4%B8%89dom-%E9%9D%99%E6%80%81%E5%8D%A0%E4%BD%8D%E4%B8%8E%E5%9B%BE%E7%89%87%E6%9B%BF%E6%8D%A2%E8%A7%84%E8%8C%83)
4. [静态内容维护 (HTML)](https://www.google.com/search?q=%23%E5%9B%9B%E9%9D%99%E6%80%81%E5%86%85%E5%AE%B9%E7%BB%B4%E6%8A%A4-html)
5. [系统边界与异常处理边界](https://www.google.com/search?q=%23%E4%BA%94%E7%B3%BB%E7%BB%9F%E8%BE%B9%E7%95%8C%E4%B8%8E%E5%BC%82%E5%B8%B8%E5%A4%84%E7%90%86%E8%BE%B9%E7%95%8C)

---

## 一、项目文件结构

生产环境推荐采用扁平化目录结构。除主 HTML 文件外，所有静态资源（校徽、横幅、风光、媒体素材）统一收拢至 `images/` 目录。

```
/ (Repository Root)
├── dalian_no5_middle_school.html    # 核心主文件 (包含 HTML/CSS/JS)
├── README.md                       # 本架构与维护文档
└── images/                         # 静态图片资源目录
    ├── logo.jpg                    # 校徽核心素材
    ├── building.jpg                # 教学楼
    ├── lab.jpg                     # 实验室
    ├── playground.jpg              # 操场
    ├── classroom.jpg               # 课堂
    ├── media-art.jpg               # 传媒艺术特殊课程展示
    ├── qrcode.jpg                  # 官方公众号二维码
    └── campus-01.jpg ~ 08.jpg      # 校园风光画廊组件（共8张）

```

---

## 二、数据配置模型 (JavaScript Data Models)

页面中的动态组件（通知公告、校园新闻、风光画廊）由 `<script>` 标签内的核心全局变量驱动。修改以下 JSON-like 数组对象即可更新视图。

### 1. 通知公告数据模型 (`noticeData`)

* **变量名**: `noticeData`
* **类型**: `Array<Object>`
* **状态表现**: 数组为 `[]` 时，DOM 自动渲染为 “暂无最新通知”。

#### 字段规范与 Schema

| 键名 (Key) | 类型 (Type) | 必填 (Required) | 描述 / 约束 | 示例值 |
| --- | --- | --- | --- | --- |
| `month` | `String` | 是 | 2位数字月份，不足前导补0 | `'06'` |
| `day` | `String` | 是 | 2位数字日期，不足前导补0 | `'01'` |
| `tag` | `String` | 否 | 标签文本。若赋值为 `'NEW'`，前端将渲染红色高亮徽章 | `'NEW'` |
| `title` | `String` | 是 | 通知主标题 | `'关于2026年暑假放假安排的通知'` |
| `desc` | `String` | 是 | 摘要或正文简述 | `'根据市教育局统一部署...'` |

---

### 2. 校园新闻数据模型 (`newsData`)

* **变量名**: `newsData`
* **类型**: `Array<Object>`
* **状态表现**: 数组为 `[]` 时，DOM 自动渲染为 “暂无校园新闻”。支持混合编排。

#### 字段规范与 Schema

| 键名 (Key) | 类型 (Type) | 必填 (Required) | 描述 / 约束 | 示例值 |
| --- | --- | --- | --- | --- |
| `type` | `String` | 是 | 枚举值：`'featured'`（大图头条模式）/ `'normal'`（列表模式） | `'featured'` |
| `date` | `String` | 是 | 发布日期，ISO 格式（`YYYY-MM-DD`） | `'2026-05-20'` |
| `tag` | `String` | 仅 `featured` 模式 | 分类标签（如：校园活动、荣誉、教研） | `'校园活动'` |
| `image` | `String` | 是 | 图片资源 URI（支持相对路径或远程 CDN） | `'./images/building.jpg'` |
| `title` | `String` | 是 | 新闻标题 | `'我校举办第十八届校园科技文化节'` |
| `desc` | `String` | 仅 `featured` 模式 | 新闻导语/摘要 | `'本届科技文化节以...为主题...'` |

---

### 3. 校园风光画廊模型 (`campusImages`)

* **变量名**: `campusImages`
* **类型**: `Array<Object>`
* **容器约束**: 建议固定保持 8 个元素以维持前端 Grid 栅格布局的视觉对称。

#### 字段规范与 Schema

| 键名 (Key) | 类型 (Type) | 必填 (Required) | 描述 / 约束 | 示例值 |
| --- | --- | --- | --- | --- |
| `src` | `String` | 是 | 图片资源路径。留空 `''` 时将触发占位兜底样式 | `'./images/campus-01.jpg'` |
| `caption` | `String` | 是 | 图片下方显示的悬浮字幕/标题 | `'现代化教学楼'` |

---

## 三、DOM 静态占位与图片替换规范

项目初期或未完全填充素材时，DOM 树中使用 `.img-placeholder` 类名进行容器占位。生产上线前，需将占位 `div` 节点替换为标准的 `img` 媒体节点，并继承原有 Tailwind 布局类。

### 1. 全局校徽 (Logo) 锚点

全页面共存在 **5 处** 核心校徽节点，定位标记为 `` 或通过搜索关键字 `[校徽]` 定位：

1. **Header Meta**: 浏览器标签图标（`<link rel="icon">`）
2. **Preloader**: 页面首屏加载动画中心
3. **Navbar**: 导航栏左侧 Brand 标识
4. **Motto Section**: “和雅教育”校训展示区背景/装饰
5. **Footer**: 页脚版权声明区

### 2. 节点替换模板

```html
<div class="img-placeholder w-full h-full text-xs">[请替换]<br>教学楼照片</div>

<img src="./images/building.jpg" alt="大连五中教学楼" class="w-full h-full object-cover">

```

> **注意**: 替换时必须保留 `w-full h-full` 等高宽控制类，并引入 `object-cover` 确保多比例图片自适应填充不拉伸。

---

## 四、静态内容维护 (HTML)

部分变更频率极低（按学期/学年更新）的内容未进行 JS 解耦，直接硬编码于 HTML 语义标签中。

### 1. 校历模块 (Academic Calendar)

* **定位特征**: 搜索关键字 `校历安排` 或进入 `<section id="calendar">`。
* **维护逻辑**: 采用时间轴组件架构，每次变更直接替换对应 `div` 内部的文字节点。
* **标准 DOM 结构结构片断**:

```html
<div class="flex items-start gap-4 p-4 bg-slate-50 rounded-xl">
    <div class="flex-shrink-0 w-14 text-center">
        <p class="text-xs text-slate-500">9月</p>
        <p class="text-lg font-bold text-school-dark">1日</p>
    </div>
    <div>
        <p class="font-bold text-slate-800">秋季学期开学</p>
        <p class="text-xs text-slate-500 mt-1">全体学生报到注册，正式上课</p>
    </div>
</div>

```

---

## 五、系统边界与异常处理边界

1. **缓存击穿 (Cache Control)**: 静态 HTML 架构在客户端浏览器中易产生强缓存。若内容更新未及时生效，需向客户端抛出 `Ctrl + F5`（硬刷新）指令。
2. **语法容错 (Syntax Integrity)**: JS 数组内各 `Object` 元素间必须以逗号 `,` 分隔，但**尾部元素后严禁尾随逗号**，避免低版本浏览器引擎解析异常。
3. **数据边界兜底**: 项目中动态渲染函数均包含对 `Array.length === 0` 的边界条件判断。当无数据源时，前端将优雅降级展示“暂无内容”的 Empty State 提示，不会引发 DOM 挂载崩溃。
