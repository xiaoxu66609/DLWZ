const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { DatabaseSync } = require('node:sqlite');

const ROOT_DIR = __dirname;
const DATA_DIR = path.join(ROOT_DIR, 'data');
const UPLOAD_DIR = path.join(ROOT_DIR, 'uploads', 'images');
const DB_PATH = path.join(DATA_DIR, 'site.db');
const HOST = process.env.HOST || '127.0.0.1';
const PORT = Number(process.env.PORT || 3000);
const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const USE_SECURE_COOKIE = process.env.PUBLIC_HTTPS === '1' || process.env.PUBLIC_HTTPS === 'true';
const SESSION_SECRET = process.env.SESSION_SECRET || (IS_PRODUCTION ? '' : 'local-development-session-secret');
const MAX_BODY_SIZE = 10 * 1024 * 1024;
const MAX_IMAGE_SIZE = 8 * 1024 * 1024;
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
};

const IMAGE_EXTENSIONS = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
};

const DEFAULT_CONTENT = {
  notices: [
    { month: '06', day: '07', tag: 'NEW', title: '2026年初中招生简章已上线', desc: '初中招生简章页面已开放，可查看招生范围、报名流程、咨询方式等信息。', sortOrder: 10, published: 1 },
    { month: '06', day: '07', tag: '', title: '请关注学校官方通知获取最新校历信息', desc: '校历安排以市教育局最终通知为准，节假日安排按国家及大连市相关规定执行。', sortOrder: 20, published: 1 },
    { month: '06', day: '07', tag: '', title: '2025年校园升级改造焕新工程全面启动', desc: '学校持续完善校园环境与教学空间，推进现代化校园建设。', sortOrder: 30, published: 1 },
  ],
  news: [
    { type: 'featured', date: '2025', tag: '校园建设', image: './images/新教学楼外景.jpg', title: '2025年校园升级改造焕新工程全面启动', desc: '学校持续完善校园环境与教学空间，推进现代化校园建设，为师生提供更优质的学习与成长环境。', sortOrder: 10, published: 1 },
    { type: 'normal', date: '2024-10', tag: '', image: './images/宣传海报.jpg', title: '我校获评辽宁省特色普通高中', desc: '', sortOrder: 20, published: 1 },
    { type: 'normal', date: '2024', tag: '', image: './images/校园活动.JPG', title: '和雅教育特色课程与校园活动持续开展', desc: '', sortOrder: 30, published: 1 },
    { type: 'normal', date: '2024', tag: '', image: './images/毕业典礼.jpg', title: '桃李芬芳毕业季，五中学子奔赴新征程', desc: '', sortOrder: 40, published: 1 },
  ],
  campusImages: [
    { src: './images/新教学楼外景.jpg', caption: '新教学楼外景', sortOrder: 10, published: 1 },
    { src: './images/新教学楼内景.jpg', caption: '新教学楼内景', sortOrder: 20, published: 1 },
    { src: './images/鸟瞰全景.jpg', caption: '校园鸟瞰全景', sortOrder: 30, published: 1 },
    { src: './images/教室照片.jpg', caption: '和雅多功能教室', sortOrder: 40, published: 1 },
    { src: './images/校园活动.JPG', caption: '阳光大课间', sortOrder: 50, published: 1 },
    { src: './images/毕业典礼.jpg', caption: '桃李芬芳毕业季', sortOrder: 60, published: 1 },
    { src: './images/新楼正门内景.jpg', caption: '新楼正门内景', sortOrder: 70, published: 1 },
    { src: './images/宣传海报.jpg', caption: '校园宣传海报', sortOrder: 80, published: 1 },
    { src: './images/体育馆报告厅外景.jpg', caption: '体育馆报告厅外景', sortOrder: 90, published: 1 },
    { src: './images/足球文化.jpg', caption: '特色足球文化', sortOrder: 100, published: 1 },
    { src: './images/传媒艺术.jpg', caption: '传媒艺术课程', sortOrder: 110, published: 1 },
    { src: './images/2023,2024级学生.jpg', caption: '五中学子风采', sortOrder: 120, published: 1 },
  ],
};

if (IS_PRODUCTION && !SESSION_SECRET) {
  console.error('Missing SESSION_SECRET in production.');
  process.exit(1);
}

ensureDir(DATA_DIR);
ensureDir(UPLOAD_DIR);

const db = new DatabaseSync(DB_PATH);
db.exec('PRAGMA journal_mode = WAL');
db.exec('PRAGMA foreign_keys = ON');
initDatabase();
seedDefaultContent();
ensureAdminUser();

const server = http.createServer((req, res) => {
  handleRequest(req, res).catch((error) => {
    console.error(error);
    sendJson(res, error.status || 500, { error: error.message || '服务器内部错误' });
  });
});

server.listen(PORT, HOST, () => {
  console.log(`DLWZ server listening at http://${HOST}:${PORT}`);
});

async function handleRequest(req, res) {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = decodeURIComponent(url.pathname);

  if (req.method === 'GET' && pathname === '/api/content') {
    return sendJson(res, 200, getPublicContent());
  }

  if (pathname.startsWith('/api/admin/')) {
    return handleAdminApi(req, res, pathname);
  }

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return sendJson(res, 405, { error: '不支持的请求方法' });
  }

  return serveStatic(req, res, pathname);
}

async function handleAdminApi(req, res, pathname) {
  if (req.method === 'POST' && pathname === '/api/admin/login') {
    const body = await readJsonBody(req);
    return login(req, res, body);
  }

  const session = getSession(req);
  if (!session) {
    return sendJson(res, 401, { error: '请先登录' });
  }

  if (req.method === 'POST' && pathname === '/api/admin/logout') {
    db.prepare('DELETE FROM sessions WHERE id = ?').run(session.id);
    setSessionCookie(res, '', 0);
    return sendJson(res, 200, { ok: true });
  }

  if (req.method === 'GET' && pathname === '/api/admin/me') {
    return sendJson(res, 200, { username: session.username });
  }

  if (req.method === 'POST' && pathname === '/api/admin/upload') {
    return uploadImage(req, res);
  }

  const match = pathname.match(/^\/api\/admin\/(notices|news|campus-images)(?:\/(\d+))?$/);
  if (!match) {
    return sendJson(res, 404, { error: '接口不存在' });
  }

  const resource = match[1];
  const id = match[2] ? Number(match[2]) : null;
  const config = getResourceConfig(resource);

  if (req.method === 'GET' && !id) {
    return sendJson(res, 200, listItems(config, false));
  }

  if (req.method === 'POST' && !id) {
    const body = await readJsonBody(req);
    const item = createItem(config, body);
    return sendJson(res, 201, item);
  }

  if (req.method === 'PUT' && id) {
    const body = await readJsonBody(req);
    const item = updateItem(config, id, body);
    if (!item) return sendJson(res, 404, { error: '内容不存在' });
    return sendJson(res, 200, item);
  }

  if (req.method === 'DELETE' && id) {
    const result = db.prepare(`DELETE FROM ${config.table} WHERE id = ?`).run(id);
    if (!result.changes) return sendJson(res, 404, { error: '内容不存在' });
    return sendJson(res, 200, { ok: true });
  }

  return sendJson(res, 405, { error: '不支持的请求方法' });
}

function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      password_salt TEXT NOT NULL,
      password_iterations INTEGER NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL,
      expires_at INTEGER NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS notices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      month TEXT NOT NULL,
      day TEXT NOT NULL,
      tag TEXT NOT NULL DEFAULT '',
      title TEXT NOT NULL,
      desc TEXT NOT NULL DEFAULT '',
      sort_order INTEGER NOT NULL DEFAULT 0,
      published INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS news (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL DEFAULT 'normal',
      date TEXT NOT NULL,
      tag TEXT NOT NULL DEFAULT '',
      image TEXT NOT NULL DEFAULT '',
      title TEXT NOT NULL,
      desc TEXT NOT NULL DEFAULT '',
      sort_order INTEGER NOT NULL DEFAULT 0,
      published INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS campus_images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      src TEXT NOT NULL,
      caption TEXT NOT NULL DEFAULT '',
      sort_order INTEGER NOT NULL DEFAULT 0,
      published INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  db.prepare('DELETE FROM sessions WHERE expires_at < ?').run(Date.now());
}

function seedDefaultContent() {
  if (db.prepare('SELECT COUNT(*) AS count FROM notices').get().count === 0) {
    const stmt = db.prepare('INSERT INTO notices (month, day, tag, title, desc, sort_order, published) VALUES (?, ?, ?, ?, ?, ?, ?)');
    for (const item of DEFAULT_CONTENT.notices) {
      stmt.run(item.month, item.day, item.tag || '', item.title, item.desc || '', item.sortOrder, item.published ? 1 : 0);
    }
  }

  if (db.prepare('SELECT COUNT(*) AS count FROM news').get().count === 0) {
    const stmt = db.prepare('INSERT INTO news (type, date, tag, image, title, desc, sort_order, published) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    for (const item of DEFAULT_CONTENT.news) {
      stmt.run(item.type, item.date, item.tag || '', item.image || '', item.title, item.desc || '', item.sortOrder, item.published ? 1 : 0);
    }
  }

  if (db.prepare('SELECT COUNT(*) AS count FROM campus_images').get().count === 0) {
    const stmt = db.prepare('INSERT INTO campus_images (src, caption, sort_order, published) VALUES (?, ?, ?, ?)');
    for (const item of DEFAULT_CONTENT.campusImages) {
      stmt.run(item.src, item.caption || '', item.sortOrder, item.published ? 1 : 0);
    }
  }
}

function ensureAdminUser() {
  const existing = db.prepare('SELECT COUNT(*) AS count FROM users').get().count;
  if (existing > 0) return;

  const username = process.env.ADMIN_USER;
  const password = process.env.ADMIN_PASSWORD;
  if (!username || !password) {
    console.error('No admin user exists. Set ADMIN_USER and ADMIN_PASSWORD before first start.');
    process.exit(1);
  }

  const passwordData = hashPassword(password);
  db.prepare(`
    INSERT INTO users (username, password_hash, password_salt, password_iterations)
    VALUES (?, ?, ?, ?)
  `).run(username, passwordData.hash, passwordData.salt, passwordData.iterations);
}

function getPublicContent() {
  return {
    notices: listItems(getResourceConfig('notices'), true),
    news: listItems(getResourceConfig('news'), true),
    campusImages: listItems(getResourceConfig('campus-images'), true),
  };
}

function getResourceConfig(resource) {
  if (resource === 'notices') {
    return {
      table: 'notices',
      publicFields: ['id', 'month', 'day', 'tag', 'title', 'desc', 'sortOrder', 'published'],
      select: 'id, month, day, tag, title, desc, sort_order AS sortOrder, published',
      validate: validateNotice,
      insertSql: 'INSERT INTO notices (month, day, tag, title, desc, sort_order, published) VALUES (?, ?, ?, ?, ?, ?, ?)',
      updateSql: 'UPDATE notices SET month = ?, day = ?, tag = ?, title = ?, desc = ?, sort_order = ?, published = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      values: (item) => [item.month, item.day, item.tag, item.title, item.desc, item.sortOrder, item.published],
    };
  }

  if (resource === 'news') {
    return {
      table: 'news',
      publicFields: ['id', 'type', 'date', 'tag', 'image', 'title', 'desc', 'sortOrder', 'published'],
      select: 'id, type, date, tag, image, title, desc, sort_order AS sortOrder, published',
      validate: validateNews,
      insertSql: 'INSERT INTO news (type, date, tag, image, title, desc, sort_order, published) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      updateSql: 'UPDATE news SET type = ?, date = ?, tag = ?, image = ?, title = ?, desc = ?, sort_order = ?, published = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      values: (item) => [item.type, item.date, item.tag, item.image, item.title, item.desc, item.sortOrder, item.published],
    };
  }

  return {
    table: 'campus_images',
    publicFields: ['id', 'src', 'caption', 'sortOrder', 'published'],
    select: 'id, src, caption, sort_order AS sortOrder, published',
    validate: validateCampusImage,
    insertSql: 'INSERT INTO campus_images (src, caption, sort_order, published) VALUES (?, ?, ?, ?)',
    updateSql: 'UPDATE campus_images SET src = ?, caption = ?, sort_order = ?, published = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    values: (item) => [item.src, item.caption, item.sortOrder, item.published],
  };
}

function listItems(config, publishedOnly) {
  const where = publishedOnly ? 'WHERE published = 1' : '';
  return db.prepare(`
    SELECT ${config.select}
    FROM ${config.table}
    ${where}
    ORDER BY sort_order ASC, id DESC
  `).all().map(normalizeDbItem);
}

function createItem(config, body) {
  const item = config.validate(body);
  const result = db.prepare(config.insertSql).run(...config.values(item));
  return db.prepare(`SELECT ${config.select} FROM ${config.table} WHERE id = ?`).get(result.lastInsertRowid);
}

function updateItem(config, id, body) {
  const existing = db.prepare(`SELECT id FROM ${config.table} WHERE id = ?`).get(id);
  if (!existing) return null;

  const item = config.validate(body);
  db.prepare(config.updateSql).run(...config.values(item), id);
  return db.prepare(`SELECT ${config.select} FROM ${config.table} WHERE id = ?`).get(id);
}

function validateNotice(body) {
  return {
    month: cleanRequired(body.month, 8, '月份不能为空'),
    day: cleanRequired(body.day, 8, '日期不能为空'),
    tag: cleanOptional(body.tag, 20),
    title: cleanRequired(body.title, 120, '标题不能为空'),
    desc: cleanOptional(body.desc, 500),
    sortOrder: toInteger(body.sortOrder),
    published: toPublished(body.published),
  };
}

function validateNews(body) {
  const type = cleanOptional(body.type, 20) || 'normal';
  if (type !== 'featured' && type !== 'normal') {
    throw httpError(400, '新闻类型无效');
  }
  return {
    type,
    date: cleanRequired(body.date, 30, '日期不能为空'),
    tag: cleanOptional(body.tag, 30),
    image: cleanOptional(body.image, 300),
    title: cleanRequired(body.title, 160, '标题不能为空'),
    desc: cleanOptional(body.desc, 800),
    sortOrder: toInteger(body.sortOrder),
    published: toPublished(body.published),
  };
}

function validateCampusImage(body) {
  return {
    src: cleanRequired(body.src, 300, '图片地址不能为空'),
    caption: cleanOptional(body.caption, 120),
    sortOrder: toInteger(body.sortOrder),
    published: toPublished(body.published),
  };
}

function normalizeDbItem(item) {
  return {
    ...item,
    sortOrder: Number(item.sortOrder || 0),
    published: item.published ? 1 : 0,
  };
}

async function login(req, res, body) {
  const username = cleanOptional(body.username, 80);
  const password = typeof body.password === 'string' ? body.password : '';
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  if (!user || !verifyPassword(password, user)) {
    return sendJson(res, 401, { error: '账号或密码错误' });
  }

  const sessionId = crypto.randomBytes(32).toString('hex');
  const expiresAt = Date.now() + SESSION_TTL_MS;
  db.prepare('INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)').run(sessionId, user.id, expiresAt);
  setSessionCookie(res, signSessionId(sessionId), SESSION_TTL_MS);
  return sendJson(res, 200, { username: user.username });
}

function getSession(req) {
  const rawCookie = parseCookies(req.headers.cookie || '').dlwz_session;
  const sessionId = unsignSessionId(rawCookie);
  if (!sessionId) return null;

  const session = db.prepare(`
    SELECT sessions.id, sessions.expires_at AS expiresAt, users.username
    FROM sessions
    JOIN users ON users.id = sessions.user_id
    WHERE sessions.id = ?
  `).get(sessionId);

  if (!session) return null;
  if (session.expiresAt < Date.now()) {
    db.prepare('DELETE FROM sessions WHERE id = ?').run(sessionId);
    return null;
  }
  return session;
}

function signSessionId(sessionId) {
  const signature = crypto.createHmac('sha256', SESSION_SECRET).update(sessionId).digest('base64url');
  return `${sessionId}.${signature}`;
}

function unsignSessionId(value) {
  if (!value || typeof value !== 'string' || !value.includes('.')) return null;
  const [sessionId, signature] = value.split('.');
  const expected = signSessionId(sessionId).split('.')[1];
  if (!safeEqual(signature, expected)) return null;
  return sessionId;
}

function setSessionCookie(res, value, maxAgeMs) {
  const parts = [
    `dlwz_session=${value}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${Math.floor(maxAgeMs / 1000)}`,
  ];
  if (USE_SECURE_COOKIE) parts.push('Secure');
  res.setHeader('Set-Cookie', parts.join('; '));
}

async function uploadImage(req, res) {
  const contentType = req.headers['content-type'] || '';
  const body = await readRawBody(req, MAX_IMAGE_SIZE + 1024 * 1024);
  const file = parseMultipartImage(body, contentType);
  if (!file) return sendJson(res, 400, { error: '请选择图片文件' });
  if (file.data.length > MAX_IMAGE_SIZE) return sendJson(res, 413, { error: '图片不能超过 8MB' });

  const ext = IMAGE_EXTENSIONS[file.contentType];
  if (!ext) return sendJson(res, 400, { error: '只支持 jpg、png、webp、gif 图片' });

  const name = `${new Date().toISOString().slice(0, 10)}-${crypto.randomBytes(8).toString('hex')}${ext}`;
  const targetPath = path.join(UPLOAD_DIR, name);
  fs.writeFileSync(targetPath, file.data);
  return sendJson(res, 201, { url: `/uploads/images/${name}` });
}

function parseMultipartImage(buffer, contentType) {
  const boundaryMatch = contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/i);
  if (!boundaryMatch) return null;

  const boundary = `--${boundaryMatch[1] || boundaryMatch[2]}`;
  const bodyText = buffer.toString('latin1');
  const parts = bodyText.split(boundary);

  for (const part of parts) {
    if (!part.includes('Content-Disposition') || !part.includes('name="image"')) continue;
    const separator = '\r\n\r\n';
    const headerEnd = part.indexOf(separator);
    if (headerEnd < 0) continue;

    const headers = part.slice(0, headerEnd);
    const typeMatch = headers.match(/Content-Type:\s*([^\r\n]+)/i);
    let content = part.slice(headerEnd + separator.length);
    if (content.endsWith('\r\n')) content = content.slice(0, -2);
    if (content.endsWith('--')) content = content.slice(0, -2);

    return {
      contentType: typeMatch ? typeMatch[1].trim().toLowerCase() : '',
      data: Buffer.from(content, 'latin1'),
    };
  }
  return null;
}

function serveStatic(req, res, pathname) {
  if (
    pathname.startsWith('/data/') ||
    pathname === '/data' ||
    pathname === '/server.js' ||
    pathname === '/package.json' ||
    pathname === '/package-lock.json' ||
    pathname.includes('/.git') ||
    pathname.includes('/.codex') ||
    pathname.includes('/.agents')
  ) {
    return sendText(res, 404, 'Not Found');
  }

  let safePath = pathname;
  if (safePath === '/') safePath = '/index.html';
  if (safePath === '/admin') {
    res.statusCode = 301;
    res.setHeader('Location', '/admin/');
    return res.end();
  }
  if (safePath.endsWith('/')) safePath += 'index.html';

  const filePath = path.resolve(ROOT_DIR, `.${safePath}`);
  if (!filePath.startsWith(ROOT_DIR)) {
    return sendText(res, 403, 'Forbidden');
  }

  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    return sendText(res, 404, 'Not Found');
  }

  const ext = path.extname(filePath).toLowerCase();
  res.statusCode = 200;
  res.setHeader('Content-Type', MIME_TYPES[ext] || 'application/octet-stream');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (req.method === 'HEAD') return res.end();
  fs.createReadStream(filePath).pipe(res);
}

function readJsonBody(req) {
  return readRawBody(req, MAX_BODY_SIZE).then((buffer) => {
    if (!buffer.length) return {};
    try {
      return JSON.parse(buffer.toString('utf8'));
    } catch (error) {
      throw httpError(400, 'JSON 格式无效');
    }
  });
}

function readRawBody(req, limit) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > limit) {
        reject(httpError(413, '请求内容过大'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const iterations = 210000;
  const hash = crypto.pbkdf2Sync(password, salt, iterations, 32, 'sha256').toString('hex');
  return { salt, iterations, hash };
}

function verifyPassword(password, user) {
  const hash = crypto.pbkdf2Sync(password, user.password_salt, user.password_iterations, 32, 'sha256').toString('hex');
  return safeEqual(hash, user.password_hash);
}

function safeEqual(a, b) {
  if (!a || !b) return false;
  const left = Buffer.from(String(a));
  const right = Buffer.from(String(b));
  if (left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
}

function parseCookies(header) {
  const cookies = {};
  for (const part of header.split(';')) {
    const index = part.indexOf('=');
    if (index < 0) continue;
    const key = part.slice(0, index).trim();
    const value = part.slice(index + 1).trim();
    cookies[key] = value;
  }
  return cookies;
}

function cleanRequired(value, maxLength, message) {
  const text = cleanOptional(value, maxLength);
  if (!text) throw httpError(400, message);
  return text;
}

function cleanOptional(value, maxLength) {
  const text = typeof value === 'string' || typeof value === 'number' ? String(value).trim() : '';
  return text.slice(0, maxLength);
}

function toInteger(value) {
  const number = Number.parseInt(value, 10);
  return Number.isFinite(number) ? number : 0;
}

function toPublished(value) {
  return value === false || value === 0 || value === '0' ? 0 : 1;
}

function sendJson(res, status, data) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.end(JSON.stringify(data));
}

function sendText(res, status, text) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.end(text);
}

function httpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

process.on('uncaughtException', (error) => {
  console.error(error);
});

process.on('unhandledRejection', (error) => {
  console.error(error);
});
