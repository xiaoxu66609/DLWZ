(function () {
  const resources = {
    notices: {
      title: '通知公告',
      endpoint: '/api/admin/notices',
      empty: '暂无通知公告',
      fields: [
        { name: 'month', label: '月份', type: 'text', required: true, placeholder: '06', half: true },
        { name: 'day', label: '日期', type: 'text', required: true, placeholder: '07', half: true },
        { name: 'tag', label: '标签', type: 'text', placeholder: 'NEW' },
        { name: 'title', label: '标题', type: 'text', required: true },
        { name: 'desc', label: '摘要', type: 'textarea' },
      ],
      summary(item) {
        return `${item.month || '--'}月${item.day || '--'}日`;
      },
    },
    news: {
      title: '校园新闻',
      endpoint: '/api/admin/news',
      empty: '暂无校园新闻',
      fields: [
        { name: 'type', label: '类型', type: 'select', options: [['featured', '重点新闻'], ['normal', '普通新闻']], required: true, half: true },
        { name: 'date', label: '日期', type: 'text', required: true, placeholder: '2026-06-08', half: true },
        { name: 'tag', label: '分类标签', type: 'text', placeholder: '校园活动' },
        { name: 'image', label: '图片地址', type: 'image' },
        { name: 'title', label: '标题', type: 'text', required: true },
        { name: 'desc', label: '摘要', type: 'textarea' },
      ],
      summary(item) {
        return `${item.date || '--'} · ${item.type === 'featured' ? '重点新闻' : '普通新闻'}`;
      },
      imageField: 'image',
    },
    'campus-images': {
      title: '校园风光',
      endpoint: '/api/admin/campus-images',
      empty: '暂无校园图片',
      fields: [
        { name: 'src', label: '图片地址', type: 'image', required: true },
        { name: 'caption', label: '图片说明', type: 'text', required: true },
      ],
      summary(item) {
        return item.src || '--';
      },
      imageField: 'src',
    },
  };

  const state = {
    user: null,
    active: 'notices',
    items: {
      notices: [],
      news: [],
      'campus-images': [],
    },
    editing: null,
  };

  const loginView = document.getElementById('login-view');
  const adminView = document.getElementById('admin-view');
  const loginForm = document.getElementById('login-form');
  const loginMessage = document.getElementById('login-message');
  const accountName = document.getElementById('account-name');
  const logoutButton = document.getElementById('logout-button');
  const contentForm = document.getElementById('content-form');
  const formTitle = document.getElementById('form-title');
  const listTitle = document.getElementById('list-title');
  const contentList = document.getElementById('content-list');
  const formMessage = document.getElementById('form-message');
  const resetFormButton = document.getElementById('reset-form');
  const refreshButton = document.getElementById('refresh-button');

  document.querySelectorAll('[data-tab]').forEach((button) => {
    button.addEventListener('click', () => setActive(button.dataset.tab));
  });

  loginForm.addEventListener('submit', handleLogin);
  logoutButton.addEventListener('click', handleLogout);
  resetFormButton.addEventListener('click', () => resetEditor());
  refreshButton.addEventListener('click', () => loadResource(state.active));
  contentForm.addEventListener('submit', handleSave);

  init();

  async function init() {
    try {
      const me = await api('/api/admin/me');
      state.user = me.username;
      showAdmin();
      await loadAll();
    } catch (error) {
      showLogin();
    }
  }

  async function handleLogin(event) {
    event.preventDefault();
    setMessage(loginMessage, '');
    const form = new FormData(loginForm);
    try {
      const result = await api('/api/admin/login', {
        method: 'POST',
        body: {
          username: form.get('username'),
          password: form.get('password'),
        },
      });
      state.user = result.username;
      loginForm.reset();
      showAdmin();
      await loadAll();
    } catch (error) {
      setMessage(loginMessage, error.message || '登录失败', 'error');
    }
  }

  async function handleLogout() {
    await api('/api/admin/logout', { method: 'POST', body: {} }).catch(() => {});
    state.user = null;
    showLogin();
  }

  async function loadAll() {
    for (const key of Object.keys(resources)) {
      await loadResource(key);
    }
    setActive(state.active);
  }

  async function loadResource(key) {
    try {
      state.items[key] = await api(resources[key].endpoint);
      if (key === state.active) renderList();
    } catch (error) {
      setMessage(formMessage, error.message || '加载失败', 'error');
    }
  }

  function setActive(key) {
    state.active = key;
    state.editing = null;
    document.querySelectorAll('[data-tab]').forEach((button) => {
      button.classList.toggle('active', button.dataset.tab === key);
    });
    resetEditor();
    renderList();
  }

  function showLogin() {
    adminView.hidden = true;
    loginView.hidden = false;
  }

  function showAdmin() {
    loginView.hidden = true;
    adminView.hidden = false;
    accountName.textContent = state.user || '';
  }

  function resetEditor() {
    state.editing = null;
    renderForm();
    setMessage(formMessage, '');
  }

  function renderForm(item) {
    const config = resources[state.active];
    const current = item || {};
    formTitle.textContent = `${item ? '编辑' : '新增'}${config.title}`;

    const rows = [];
    for (let i = 0; i < config.fields.length; i += 1) {
      const field = config.fields[i];
      if (field.half && config.fields[i + 1] && config.fields[i + 1].half) {
        rows.push(`<div class="two">${renderField(field, current)}${renderField(config.fields[i + 1], current)}</div>`);
        i += 1;
      } else {
        rows.push(renderField(field, current));
      }
    }

    rows.push(`
      <div class="two">
        <label>
          <span>排序</span>
          <input name="sortOrder" type="number" value="${escapeAttr(current.sortOrder ?? 0)}">
        </label>
        <label class="checkbox-row">
          <input name="published" type="checkbox" ${current.published === 0 ? '' : 'checked'}>
          <span>发布显示</span>
        </label>
      </div>
      <div class="form-actions">
        <button type="submit" class="primary">${item ? '保存修改' : '新增内容'}</button>
        <button type="button" class="ghost" data-reset>清空</button>
      </div>
    `);

    contentForm.innerHTML = rows.join('');
    contentForm.querySelector('[data-reset]').addEventListener('click', () => resetEditor());
    bindUploadControls();
  }

  function renderField(field, current) {
    const value = current[field.name] ?? '';
    const required = field.required ? 'required' : '';

    if (field.type === 'textarea') {
      return `
        <label>
          <span>${escapeHtml(field.label)}</span>
          <textarea name="${field.name}" ${required}>${escapeHtml(value)}</textarea>
        </label>
      `;
    }

    if (field.type === 'select') {
      return `
        <label>
          <span>${escapeHtml(field.label)}</span>
          <select name="${field.name}" ${required}>
            ${field.options.map(([optionValue, label]) => `<option value="${escapeAttr(optionValue)}" ${value === optionValue ? 'selected' : ''}>${escapeHtml(label)}</option>`).join('')}
          </select>
        </label>
      `;
    }

    if (field.type === 'image') {
      return `
        <label>
          <span>${escapeHtml(field.label)}</span>
          <input name="${field.name}" value="${escapeAttr(value)}" ${required} placeholder="/uploads/images/photo.jpg">
        </label>
        <div class="upload-row" data-image-field="${field.name}">
          <input type="file" accept="image/jpeg,image/png,image/webp,image/gif">
          <button type="button" class="success">上传图片</button>
        </div>
        ${value ? `<img class="preview" src="${escapeAttr(value)}" alt="图片预览">` : ''}
      `;
    }

    return `
      <label>
        <span>${escapeHtml(field.label)}</span>
        <input name="${field.name}" value="${escapeAttr(value)}" ${required} placeholder="${escapeAttr(field.placeholder || '')}">
      </label>
    `;
  }

  function bindUploadControls() {
    contentForm.querySelectorAll('[data-image-field]').forEach((row) => {
      const fileInput = row.querySelector('input[type="file"]');
      const button = row.querySelector('button');
      const fieldName = row.dataset.imageField;
      button.addEventListener('click', async () => {
        if (!fileInput.files || !fileInput.files[0]) {
          setMessage(formMessage, '请先选择图片', 'error');
          return;
        }
        const data = new FormData();
        data.append('image', fileInput.files[0]);
        button.disabled = true;
        button.textContent = '上传中';
        try {
          const result = await api('/api/admin/upload', { method: 'POST', formData: data });
          contentForm.elements[fieldName].value = result.url;
          updatePreview(row, result.url);
          setMessage(formMessage, '图片上传成功', 'ok');
        } catch (error) {
          setMessage(formMessage, error.message || '上传失败', 'error');
        } finally {
          button.disabled = false;
          button.textContent = '上传图片';
        }
      });
    });
  }

  function updatePreview(row, src) {
    const existing = contentForm.querySelector('.preview');
    if (existing) existing.remove();
    const image = document.createElement('img');
    image.className = 'preview';
    image.src = src;
    image.alt = '图片预览';
    row.insertAdjacentElement('afterend', image);
  }

  function renderList() {
    const config = resources[state.active];
    const items = state.items[state.active] || [];
    listTitle.textContent = `${config.title}列表`;

    if (!items.length) {
      contentList.innerHTML = `<p class="muted">${config.empty}</p>`;
      return;
    }

    contentList.innerHTML = items.map((item) => `
      <article class="item">
        ${renderThumb(item, config)}
        <div>
          <p class="item-title">${escapeHtml(getItemTitle(item, config))}</p>
          <div class="meta">
            <span>${escapeHtml(config.summary(item))}</span>
            <span>排序 ${escapeHtml(item.sortOrder ?? 0)}</span>
            <span class="badge ${item.published ? '' : 'off'}">${item.published ? '已发布' : '未发布'}</span>
            ${item.tag ? `<span class="badge">${escapeHtml(item.tag)}</span>` : ''}
          </div>
        </div>
        <div class="item-actions">
          <button type="button" class="ghost" data-edit="${item.id}">编辑</button>
          <button type="button" class="danger" data-delete="${item.id}">删除</button>
        </div>
      </article>
    `).join('');

    contentList.querySelectorAll('[data-edit]').forEach((button) => {
      button.addEventListener('click', () => editItem(Number(button.dataset.edit)));
    });
    contentList.querySelectorAll('[data-delete]').forEach((button) => {
      button.addEventListener('click', () => deleteItem(Number(button.dataset.delete)));
    });
  }

  function renderThumb(item, config) {
    const imageField = config.imageField;
    if (!imageField) {
      return '<div class="thumb placeholder-thumb">公告</div>';
    }
    const src = item[imageField];
    if (!src) return '<div class="thumb placeholder-thumb">无图片</div>';
    return `<img class="thumb" src="${escapeAttr(src)}" alt="">`;
  }

  function getItemTitle(item, config) {
    if (state.active === 'campus-images') return item.caption || item.src || '未命名图片';
    return item.title || config.empty;
  }

  function editItem(id) {
    const item = (state.items[state.active] || []).find((entry) => entry.id === id);
    if (!item) return;
    state.editing = id;
    renderForm(item);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function deleteItem(id) {
    if (!confirm('确定删除这条内容吗？')) return;
    const config = resources[state.active];
    try {
      await api(`${config.endpoint}/${id}`, { method: 'DELETE' });
      setMessage(formMessage, '已删除', 'ok');
      await loadResource(state.active);
      if (state.editing === id) resetEditor();
    } catch (error) {
      setMessage(formMessage, error.message || '删除失败', 'error');
    }
  }

  async function handleSave(event) {
    event.preventDefault();
    const config = resources[state.active];
    const data = collectFormData();
    const url = state.editing ? `${config.endpoint}/${state.editing}` : config.endpoint;
    const method = state.editing ? 'PUT' : 'POST';

    try {
      await api(url, { method, body: data });
      setMessage(formMessage, state.editing ? '修改已保存' : '内容已新增', 'ok');
      await loadResource(state.active);
      resetEditor();
    } catch (error) {
      setMessage(formMessage, error.message || '保存失败', 'error');
    }
  }

  function collectFormData() {
    const data = {};
    const form = new FormData(contentForm);
    for (const [key, value] of form.entries()) {
      data[key] = value;
    }
    data.published = contentForm.elements.published.checked ? 1 : 0;
    return data;
  }

  async function api(url, options) {
    const init = options || {};
    const fetchOptions = {
      method: init.method || 'GET',
      headers: {},
      credentials: 'same-origin',
    };

    if (init.formData) {
      fetchOptions.body = init.formData;
    } else if (init.body !== undefined) {
      fetchOptions.headers['Content-Type'] = 'application/json';
      fetchOptions.body = JSON.stringify(init.body);
    }

    const response = await fetch(url, fetchOptions);
    const text = await response.text();
    let data = {};
    if (text) {
      try {
        data = JSON.parse(text);
      } catch (error) {
        data = {};
      }
    }

    if (!response.ok) {
      throw new Error(data.error || `请求失败：${response.status}`);
    }
    return data;
  }

  function setMessage(node, text, type) {
    node.textContent = text || '';
    node.classList.remove('error', 'ok');
    if (type) node.classList.add(type);
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, (char) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    })[char]);
  }

  function escapeAttr(value) {
    return escapeHtml(value).replace(/`/g, '&#96;');
  }
})();
