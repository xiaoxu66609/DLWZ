# <table><tr><td bgcolor=yellow>添加 Node 后端服务器</td></tr></table> 

- 增加 admin 页面用于上传和发布内容


D5-JADC3-HS系统发布页(Dalian 5 th school-Joint All-Domain Command, Control and Campus system for High School)
 
 大连市第五中学高中联合全域指挥、控制与校园系统
# 大连市第五中学官网 - 项目架构与数据维护规范

# System Architecture & Data Maintenance Specifications

本项目为一个单文件响应式前端页面（Single-file Responsive Webpage），采用 HTML5 标准构建，样式基于 **Tailwind CSS**，动态内容通过原生 JavaScript 进行纯前端数据驱动渲染（Data-driven Rendering），实现了基础的**数据与结构解耦**。

---

## 目录

1. [项目文件结构建议](https://www.google.com/search?q=%23%E4%B8%80%E9%A1%B9%E7%9B%AE%E6%96%87%E4%BB%B6%E7%BB%93%E6%9E%84%E5%BB%BA%E8%AE%AE)
2. [数据配置模型与 Schema (JavaScript Data Models)](https://www.google.com/search?q=%23%E4%BA%8C%E6%95%B0%E6%8D%AE%E9%85%8D%E7%BD%AE%E6%A8%A1%E5%9E%8B%E4%B8%8E-schema-javascript-data-models)
3. [图片位置总览与替换规范](https://www.google.com/search?q=%23%E4%B8%89%E5%9B%BE%E7%89%87%E4%BD%8D%E7%BD%AE%E6%80%BB%E8%A7%88%E4%B8%8E%E6%9B%BF%E6%8D%A2%E8%A7%84%E8%8C%83)
4. [静态内容维护规范 (HTML)](https://www.google.com/search?q=%23%E5%9B%9B%E9%9D%99%E6%80%81%E5%86%85%E5%AE%B9%E7%BB%B4%E6%8A%A4%E8%A7%84%E8%8C%83-html)
5. [常见问题（Q&A）与安全边界](https://www.google.com/search?q=%23%E4%BA%94%E5%B8%B8%E8%A7%81%E9%97%AE%E9%A2%98qa%E4%B8%8E%E5%AE%89%E5%85%A8%E8%BE%B9%E7%95%8C)

---

## 一、项目文件结构建议

生产环境及仓库推荐采用以下扁平化目录结构。除主 HTML 文件外，所有静态资源统一收拢至 `images/` 目录。

```
/ (Repository Root)
├── dalian_no5_middle_school.html    # 核心主文件 (包含 HTML/CSS/JS)
├── README.md                       # 本架构与维护文档
└── images/                         # 静态图片资源目录
    ├── logo.jpg                    # 校徽核心素材
    ├── building.jpg                # 教学楼照片
    ├── lab.jpg                     # 实验室照片
    ├── playground.jpg              # 操场照片
    ├── classroom.jpg               # 课堂照片
    ├── media-art.jpg               # 传媒艺术课程展示图
    ├── qrcode.jpg                  # 官方公众号二维码
    └── campus-01.jpg ~ campus-08.jpg # 校园风光画廊组件（固定共8张）

```

---

## 二、数据配置模型与 Schema (JavaScript Data Models)

页面中的动态组件（通知公告、校园新闻、风光画廊）由 `<script>` 标签内的数据配置区（由 `══════` 分隔线标识）的核心全局变量驱动。

### 1. 通知公告数据模型 (`noticeData`)

* **变量名**: `noticeData`
* **类型**: `Array<Object>`
* **状态表现**: 数组为空（`[]`）时，页面自动触发降级机制，显示 **"暂无最新通知"**。

#### 字段规范 (Schema)

| 字段 (Key) | 类型 (Type) | 必填 (Required) | 说明 / 约束 | 示例值 |
| --- | --- | --- | --- | --- |
| `month` | `String` | 是 | 月份（固定2位数字，不足前导补0） | `'06'` |
| `day` | `String` | 是 | 日期（固定2位数字，不足前导补0） | `'01'` |
| `tag` | `String` | 否 | 标签。若赋值为 `'NEW'`，将渲染显示红色高亮标签 | `'NEW'` |
| `title` | `String` | 是 | 通知公告标题 | `'关于2026年暑假放假安排的通知'` |
| `desc` | `String` | 是 | 摘要描述文本 | `'根据市教育局统一部署...'` |

#### 混合编排示例

```javascript
const noticeData = [
    // 示例 A: 带有 "NEW" 红色标签的通知
    { month: '06', day: '01', tag: 'NEW', title: '关于2026年暑假放假安排的通知', desc: '根据市教育局统一部署...' },
    
    // 示例 B: 没有标签的普通通知
    { month: '05', day: '28', title: '2026级高一新生报到须知', desc: '欢迎加入大连五中大家庭...' }
];

```

---

### 2. 校园新闻数据模型 (`newsData`)

* **变量名**: `newsData`
* **类型**: `Array<Object>`
* **状态表现**: 数组为空（`[]`）时，页面自动触发降级机制，显示 **"暂无校园新闻"**。

#### 字段规范 (Schema)

| 字段 (Key) | 类型 (Type) | 必填 (Required) | 说明 / 约束 |
| --- | --- | --- | --- |
| `type` | `String` | 是 | 新闻模式枚举：`'featured'`（带大图的重要新闻）/ `'normal'`（普通列表新闻） |
| `date` | `String` | 是 | 发布日期，统一格式为 `YYYY-MM-DD` |
| `tag` | `String` | 仅 `featured` 必填 | 分类标签，如 `'校园活动'`、`'荣誉'` 等 |
| `image` | `String` | 是 | 图片资源路径。若留空 `''`，会触发页面占位提示 |
| `title` | `String` | 是 | 新闻标题 |
| `desc` | `String` | 仅 `featured` 必填 | 新闻摘要文本描述 |

#### 混合编排示例

```javascript
const newsData = [
    // 格式 A: 带大图的新闻（重要新闻）
    { type: 'featured', date: '2026-05-20', tag: '校园活动', image: 'https://你的图片地址', title: '我校举办第十八届校园科技文化节', desc: '本届科技文化节以...为主题...' },
    
    // 格式 B: 普通列表新闻（次要新闻）
    { type: 'normal', date: '2026-05-15', image: 'https://你的图片地址', title: '高三年级举行成人礼暨高考誓师大会' }
];

```

---

### 3. 校园风光图片模型 (`campusImages`)

* **变量名**: `campusImages`
* **类型**: `Array<Object>`
* **数据规范**: 把 `src: ''` 改成对应图片路径。支持本地路径（如 `./images/photo.jpg`）及网络绝对路径（如 `https://example.com/photo.jpg`）。

#### 示例

```javascript
const campusImages = [
    { src: './images/building.jpg', caption: '现代化教学楼' },
    { src: '', caption: '综合实验楼' } // 留空时会触发前端灰色虚线框占位提示
];

```

---

## 三、图片位置总览与替换规范

### 1. 全局图片资源静态分布表

| 目标位置 | 数量约束 | 对应业务说明与字段 |
| --- | --- | --- |
| **校徽 (Logo)** | 5 处 | 分布于：浏览器标签图标、加载动画、导航栏、校训区、页脚 |
| **英雄区 (Hero Section)** | 3 张 | 首页大轮播组件的背景图 |
| **学校概况** | 4 张 | 包含：教学楼、实验室、操场、课堂照片 |
| **教育教学** | 1 张 | 传媒艺术课程展示图 |
| **校园风光** | 8 张 | 校园风光画廊组件（对应 `campusImages` 数组） |
| **新闻配图** | 按需 | 新闻数据（`newsData`）里的 `image` 字段 |

### 2. 占位块替换方法（“看到占位块就替换”）

页面未完全填充素材时，所有待替换区域会渲染一个灰色虚线框，并标注 `[请替换] xxx照片`。可以通过搜索 HTML 注释 `` 或占位文本进行替换：

#### 规范 A：替换校徽（将占位 `div` 转换为 `img` 标签）

* **5 处精准定位**：
1. 浏览器标签图标（文件最顶部 `<link rel="icon">`）
2. 加载动画（页面加载时的校徽）
3. 导航栏 Logo
4. 校训展示区（和雅教育 section）
5. 页脚


* **代码代码转换规范**：

```html
<div class="img-placeholder w-10 h-10 ...">[校徽]</div>

<img src="./images/logo.jpg" alt="大连市第五中学校徽" class="w-10 h-10 ...">

```

#### 规范 B：替换其他区域图片（学校概况、教育教学、英雄区等占位块）

```html
<div class="img-placeholder w-full h-full">[请替换]<br>教学楼照片</div>

<img src="./images/building.jpg" alt="教学楼" class="w-full h-full object-cover">

```

---

## 四、静态内容维护规范 (HTML)

部分变更频率极低的内容硬编码于 HTML 语义标签中。修改时需定位至具体 Section。

### 1. 校历安排模块 (Academic Calendar)

* **定位特征**: 搜索关键字 `校历安排` 找到对应 section。
* **业务逻辑**: 每个学期为一个卡片，内含多个时间节点。直接修改日期和事件文字节点。
* **标准 HTML 结构**：

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

## 五、常见问题（Q&A）与安全边界

### 1. 常见问题排查 (Q&A)

* **Q1：改了数组后页面没变化？**
* 确认已保存 HTML 文件。
* 浏览器可能存在缓存，请使用 `Ctrl + F5` 快捷键强制清除缓存并刷新。


* **Q2：图片显示裂图/空白？**
* 检查图片路径（`src`）是否完全正确。
* 本地图片建议严格统一放置在网站同级目录内的 `images/` 目录下（如 `./images/photo.jpg`）。


* **Q3：想删除一条新闻/通知？**
* 在对应的 `newsData` 或 `noticeData` 数组中删掉对应的整行 `{...}` 对象即可。
* **注意语法**：注意保留数组元素间的逗号分隔，且最后一行不要留随尾逗号（Trailing Comma）。


* **Q4：想临时隐藏某个板块？**
* 将对应的数据数组直接赋值为空数组 `[]`，页面机制会自动渲染出“暂无内容”的兜底状态。


* **Q5：不会改代码怎么办？**
* 使用记事本或纯文本编辑器（如 VS Code）打开 HTML 文件。
* 使用 `Ctrl + F` 搜索对应的变量（如 `noticeData`、`campusImages`），**只修改引号内的文字内容，严禁改动任何符号**。



### 2. 开发与安全提示（防止破页）

* **热备份机制**: 在执行任何代码级修改前，必须先将原文件复制备份一份。
* **符号完整性**: 只能修改引号 `""` 或 `''` 内的文本内容以及 `src` 后面的路径。**严禁删除、触碰或遗漏花括号 `{}`、方括号 `[]` 以及逗号 `,**`。
* **沙箱测试**: 如果对新添加的数据条目不确定，应先复制已有的一行完整代码进行修改和本地效果测试。
