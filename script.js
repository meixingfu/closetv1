let currentCategory = 'all';
let searchQuery = '';

function getFavorites() {
  const fav = localStorage.getItem('closetFavorites');
  return fav ? JSON.parse(fav) : [];
}

function saveFavorites(ids) {
  localStorage.setItem('closetFavorites', JSON.stringify(ids));
}

function toggleFavorite(id) {
  let favs = getFavorites();
  if (favs.includes(id)) {
    favs = favs.filter(f => f !== id);
  } else {
    favs.push(id);
  }
  saveFavorites(favs);
  render();
}

function isFavorite(id) {
  return getFavorites().includes(id);
}

function copyText(btn, text) {
  if (!text) {
    const original = btn.dataset.label;
    btn.textContent = 'なし';
    setTimeout(() => {
      btn.innerHTML = original;
    }, 1100);
    return;
  }

  navigator.clipboard.writeText(text).then(() => {
    const original = btn.dataset.label;
    btn.textContent = '✓';
    btn.classList.add('copied');
    setTimeout(() => {
      btn.innerHTML = original;
      btn.classList.remove('copied');
    }, 1400);
  });
}

function render() {
  const grid = document.getElementById('promptGrid');
  const emptyMsg = document.getElementById('emptyMessage');
  const favs = getFavorites();
  const data = window.outfits || [];

  let filtered = data.filter(item => {
    if (currentCategory === 'favorite') {
      if (!favs.includes(item.id)) return false;
    } else if (currentCategory !== 'all') {
      if (item.category !== currentCategory) return false;
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const searchText = (
        (item.name || '') + ' ' +
        (item.description || '') + ' ' +
        (item.clothes?.[0]?.text || '') + ' ' +
        (item.composition?.[0]?.text || '') + ' ' +
        (item.background?.[0]?.text || '')
      ).toLowerCase();
      if (!searchText.includes(q)) return false;
    }
    return true;
  });

  if (filtered.length === 0) {
    grid.innerHTML = '';
    emptyMsg.style.display = 'block';
    return;
  }

  emptyMsg.style.display = 'none';

  grid.innerHTML = filtered.map(item => {
    const clothesText = item.clothes?.[0]?.text || '';
    const compositionText = item.composition?.[0]?.text || '';
    const backgroundText = item.background?.[0]?.text || '';

    const imageSrc = item.image || '';
    const imageHtml = imageSrc
      ? `<div class="card-image"><img src="${imageSrc}" alt="${item.name || ''}" loading="lazy"></div>`
      : `<div class="card-image" style="display:flex;align-items:center;justify-content:center;color:#c8a0a8;font-size:0.8rem;">No Image</div>`;

    return `
      <div class="card">
        ${imageHtml}
        <div class="card-body">
          <div class="card-header">
            <div class="card-title">${item.name || ''}</div>
            <button class="fav-btn ${isFavorite(item.id) ? 'active' : ''}" onclick="toggleFavorite('${item.id}')">
              ${isFavorite(item.id) ? '♥' : '♡'}
            </button>
          </div>
          <div class="card-desc">${item.description || ''}</div>

          <div class="copy-buttons">
            <button class="copy-btn" data-label="♡ 服" onclick="copyText(this, \`${clothesText.replace(/`/g, '\\`')}\`)">
              ♡ 服
            </button>
            <button class="copy-btn" data-label="♡ 構図" onclick="copyText(this, \`${compositionText.replace(/`/g, '\\`')}\`)">
              ♡ 構図
            </button>
            <button class="copy-btn" data-label="♡ 背景" onclick="copyText(this, \`${backgroundText.replace(/`/g, '\\`')}\`)">
              ♡ 背景
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// イベント
document.getElementById('categoryButtons').addEventListener('click', e => {
  if (!e.target.classList.contains('cat-btn')) return;
  document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
  e.target.classList.add('active');
  currentCategory = e.target.dataset.category;
  render();
});

document.getElementById('searchInput').addEventListener('input', e => {
  searchQuery = e.target.value.trim();
  render();
});

// 起動
render();
