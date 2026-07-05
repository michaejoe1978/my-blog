const postList = document.getElementById('postList');
const postView = document.getElementById('postView');
const postContent = document.getElementById('postContent');
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');

let posts = [];

function initTheme() {
  const saved = localStorage.getItem('theme');
  if (saved === 'dark') {
    document.documentElement.classList.add('dark');
  } else if (saved === 'light') {
    document.documentElement.classList.add('light');
  }
  updateThemeIcon();
}

function toggleTheme() {
  const isDark = document.documentElement.classList.contains('dark');
  const isLight = document.documentElement.classList.contains('light');
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  document.documentElement.classList.remove('dark', 'light');

  if (isDark || (!isLight && systemDark)) {
    document.documentElement.classList.add('light');
    localStorage.setItem('theme', 'light');
  } else {
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  }
  updateThemeIcon();
}

function updateThemeIcon() {
  const isDark = document.documentElement.classList.contains('dark');
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const dark = isDark || (systemDark && !document.documentElement.classList.contains('light'));
  themeIcon.textContent = dark ? '☀️' : '🌙';
}

function parseFrontmatter(text) {
  const match = text.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { meta: {}, body: text };
  const meta = {};
  match[1].split('\n').forEach(line => {
    const idx = line.indexOf(':');
    if (idx > 0) {
      meta[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
    }
  });
  return { meta, body: match[2] };
}

function renderPostList() {
  postList.innerHTML = posts
    .sort((a, b) => b.date.localeCompare(a.date))
    .map(post => `
      <a class="post-card" href="#post=${post.file}">
        <div class="post-card__date">${post.date}</div>
        <div class="post-card__title">${post.title}</div>
        <div class="post-card__summary">${post.summary}</div>
      </a>
    `).join('');
}

async function renderPost(file) {
  try {
    const res = await fetch(`posts/${file}`);
    if (!res.ok) throw new Error('Not found');
    const text = await res.text();
    const { body } = parseFrontmatter(text);
    postContent.innerHTML = marked.parse(body);
    postList.hidden = true;
    postView.hidden = false;
  } catch {
    postContent.innerHTML = '<p>글을 불러올 수 없습니다.</p>';
    postList.hidden = true;
    postView.hidden = false;
  }
}

function showList() {
  postList.hidden = false;
  postView.hidden = true;
}

function handleRoute() {
  const hash = location.hash;
  if (hash.startsWith('#post=')) {
    const file = decodeURIComponent(hash.slice(6));
    renderPost(file);
  } else {
    showList();
  }
}

async function init() {
  initTheme();
  themeToggle.addEventListener('click', toggleTheme);
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', updateThemeIcon);

  try {
    const res = await fetch('posts.json');
    posts = await res.json();
  } catch {
    postList.innerHTML = '<p>글 목록을 불러올 수 없습니다.</p>';
    return;
  }

  renderPostList();
  handleRoute();
  window.addEventListener('hashchange', handleRoute);
}

init();
