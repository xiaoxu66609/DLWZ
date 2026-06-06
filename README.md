# 大连市第五中学官网 - 萌新维护指南

> 你好！这份文档会手把手教你更新网站内容，完全不需要懂编程。

---

## 一、如何更新新闻和通知

打开 `dalian_no5_middle_school.html` 文件，找到 `<script>` 标签里的**数据配置区**（有 `══════` 分隔线的地方）。

### 1. 添加通知公告

找到 `noticeData` 数组，复制下面的格式添加一行：

```javascript
const noticeData = [
    // 有 "NEW" 红色标签的通知：
    { month: '06', day: '01', tag: 'NEW', title: '关于2026年暑假放假安排的通知', desc: '根据市教育局统一部署...' },
    
    // 没有标签的普通通知：
    { month: '05', day: '28', title: '2026级高一新生报到须知', desc: '欢迎加入大连五中大家庭...' },
];
```

| 字段 | 说明 | 示例 |
|------|------|------|
| `month` | 月份（2位数字） | `'06'` |
| `day` | 日期（2位数字） | `'01'` |
| `tag` | 标签，可选。写 `NEW` 会显示红色标签 | `'NEW'` |
| `title` | 通知标题 | `'关于...的通知'` |
| `desc` | 摘要描述 | `'根据市教育局...'` |

**操作步骤：**
1. 复制数组里已有的示例行
2. 改日期、标题、摘要
3. 保存文件，刷新网页即可看到

> 如果数组是空的（`[]`），页面会显示"暂无最新通知"

---

### 2. 添加校园新闻

找到 `newsData` 数组，有两种格式：

**A. 带大图的新闻（重要新闻）**
```javascript
{ type: 'featured', date: '2026-05-20', tag: '校园活动', image: 'https://你的图片地址', title: '我校举办第十八届校园科技文化节', desc: '本届科技文化节以...为主题...' }
```

**B. 普通列表新闻（次要新闻）**
```javascript
{ type: 'normal', date: '2026-05-15', image: 'https://你的图片地址', title: '高三年级举行成人礼暨高考誓师大会' }
```

| 字段 | 说明 |
|------|------|
| `type` | `'featured'` 大图模式 / `'normal'` 列表模式 |
| `date` | 发布日期，格式 `YYYY-MM-DD` |
| `tag` | 分类标签，如 `'校园活动'`、`'荣誉'` |
| `image` | 图片地址。如果留空 `''`，会显示占位提示 |
| `title` | 新闻标题 |
| `desc` | 摘要（只有 `featured` 需要） |

> 如果数组是空的（`[]`），页面会显示"暂无校园新闻"

---

## 二、如何更换图片

### 图片位置总览

| 位置 | 数量 | 说明 |
|------|------|------|
| **校徽** | 5处 | 导航栏、加载动画、校训区、页脚、浏览器标签图标 |
| **英雄区轮播背景** | 3张 | 首页大轮播的3张背景图 |
| **学校概况** | 4张 | 教学楼、实验室、操场、课堂 |
| **教育教学** | 1张 | 传媒艺术课程展示图 |
| **校园风光** | 8张 | 校园风光画廊 |
| **新闻配图** | 按需 | 新闻数据里的 `image` 字段 |

### 方法：看到占位块就替换

打开网页预览，所有需要替换图片的地方都会显示一个**灰色虚线框**，上面写着 `[请替换] xxx照片`。

#### 1. 替换校徽

找到这5处占位块（搜索 `[校徽]` 或看 HTML 注释 `<!-- 请替换为本地校徽图片 -->`）：

```html
<!-- 方法：把占位 div 换成 img 标签 -->
<!-- 替换前： -->
<div class="img-placeholder w-10 h-10 ...">[校徽]</div>

<!-- 替换后： -->
<img src="./images/logo.jpg" alt="大连市第五中学校徽" class="w-10 h-10 ...">
```

**5处校徽位置：**
1. 浏览器标签图标（文件最顶部 `<link rel="icon">`）
2. 加载动画（页面加载时的校徽）
3. 导航栏 Logo
4. 校训展示区（和雅教育section）
5. 页脚

#### 2. 替换校园风光图片

找到 `campusImages` 数组：

```javascript
const campusImages = [
    { src: '', caption: '现代化教学楼' },
    { src: '', caption: '综合实验楼' },
    // ...
];
```

把 `src: ''` 改成你的图片地址：

```javascript
{ src: './images/building.jpg', caption: '现代化教学楼' },
```

**支持格式：**
- 本地图片：`./images/photo.jpg`
- 网络图片：`https://example.com/photo.jpg`

#### 3. 替换其他图片

对于学校概况、教育教学、英雄区的图片，找到对应的占位块，把 `div.img-placeholder` 替换为 `img` 标签即可。

**示例：**
```html
<!-- 替换前 -->
<div class="img-placeholder w-full h-full">[请替换]<br>教学楼照片</div>

<!-- 替换后 -->
<img src="./images/building.jpg" alt="教学楼" class="w-full h-full object-cover">
```

---

## 三、如何修改校历安排

校历内容直接写在 HTML 里，搜索 `校历安排` 找到对应 section。

每个学期是一个卡片，里面有多个时间节点。找到对应的日期和事件文字，直接修改即可。

**示例：**
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

## 四、常见问题

### Q1：改了数组后页面没变化？
- 确认保存了文件
- 按 `Ctrl+F5` 强制刷新浏览器（清除缓存）

### Q2：图片显示裂图/空白？
- 检查图片路径是否正确
- 本地图片建议放在网站文件夹内的 `images/` 目录下
- 路径写法：`./images/photo.jpg`（同级目录下的images文件夹）

### Q3：想删除一条新闻/通知？
- 在数组里删掉对应的那一行即可
- 注意保留逗号分隔，最后一行不要逗号

### Q4：想临时隐藏某个板块？
- 在数组里留空 `[]`，页面会自动显示"暂无内容"

### Q5：不会改代码怎么办？
- 用记事本或 VS Code 打开 HTML 文件
- 按 `Ctrl+F` 搜索关键词（如 `noticeData`、`campusImages`）
- 只改引号里的文字，不要碰其他符号

---

## 五、文件结构建议

推荐把图片统一放在 `images` 文件夹里：

```
D:\5中官网\
├── dalian_no5_middle_school.html   ← 主文件
├── images\
│   ├── logo.jpg                     ← 校徽
│   ├── building.jpg                 ← 教学楼
│   ├── lab.jpg                      ← 实验室
│   ├── playground.jpg               ← 操场
│   ├── classroom.jpg                ← 课堂
│   ├── media-art.jpg                ← 传媒艺术课程
│   ├── campus-01.jpg ~ campus-08.jpg ← 校园风光8张
│   └── qrcode.jpg                   ← 公众号二维码
└── README.md                        ← 本文件
```

---

## 六、安全提示

- 改之前先备份一份原文件
- 只改引号 `""` 里的内容和 `src` 后面的地址
- 不要删除 `{}` `[]` `,` 这些符号
- 如果不确定，先复制一行做测试

---

**祝你维护顺利！有问题随时问。**
