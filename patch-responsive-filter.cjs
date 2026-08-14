const fs = require('fs');
const p = 'app/pages/products.vue';
let s = fs.readFileSync(p, 'utf8');

if (!s.includes('class="mobile-filter-toggle"')) {
  s = s.replace(
    '<section class="products-shell">',
    `<section class="products-shell">
      <button
        type="button"
        class="mobile-filter-toggle"
        :class="{ active: isFilterOpen }"
        @click="isFilterOpen = !isFilterOpen"
        :aria-expanded="isFilterOpen"
      >
        <span class="mobile-filter-toggle-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24"><path d="M4 7h16M7 12h10M10 17h4"/></svg>
        </span>
        <span>{{ isFilterOpen ? '收合篩選' : '篩選商品' }}</span>
        <span class="mobile-filter-toggle-arrow">{{ isFilterOpen ? '−' : '+' }}</span>
      </button>`
  );
  s = s.replace(
    '<aside class="filter-panel">',
    '<aside class="filter-panel" :class="{ \'is-open\': isFilterOpen }">'
  );
}

if (!s.includes('const isFilterOpen = ref(false)')) {
  s = s.replace(
    'const isCartAnimating = ref(false)',
    'const isCartAnimating = ref(false)\nconst isFilterOpen = ref(false)'
  );
}

const marker = '/* ===== Responsive Filter Panel ===== */';
if (!s.includes(marker)) {
  const css = `

${marker}
/* 功能：中尺寸保留側邊篩選，小尺寸改為可展開的篩選面板。 */
.products-page .mobile-filter-toggle {
  display: none;
}

@media (max-width: 1180px) and (min-width: 821px) {
  .products-page .products-shell {
    grid-template-columns: 190px minmax(0, 1fr) !important;
  }

  .products-page .filter-panel {
    display: grid !important;
  }

  .products-page .filter-block {
    padding: 16px 14px !important;
  }

  .products-page .filter-option {
    font-size: 13px !important;
  }
}

@media (max-width: 820px) {
  .products-page .products-shell {
    grid-template-columns: 1fr !important;
  }

  .products-page .mobile-filter-toggle {
    display: flex !important;
    width: 100%;
    min-height: 50px;
    padding: 0 16px;
    align-items: center;
    gap: 10px;
    color: #233f4d;
    background: #fff;
    border: 1px solid #dfe6e7;
    border-radius: 12px;
    box-shadow: 0 5px 16px rgba(31, 61, 72, .04);
    font-size: 14px;
    font-weight: 800;
    cursor: pointer;
  }

  .products-page .mobile-filter-toggle.active {
    border-color: #d7bfd2;
    background: #fdf9fc;
  }

  .products-page .mobile-filter-toggle-icon {
    display: grid;
    width: 24px;
    height: 24px;
    color: #8b347f;
    place-items: center;
  }

  .products-page .mobile-filter-toggle-icon svg {
    width: 22px;
    height: 22px;
    fill: none;
    stroke: currentColor;
    stroke-width: 1.8;
    stroke-linecap: round;
  }

  .products-page .mobile-filter-toggle-arrow {
    margin-left: auto;
    color: #8b347f;
    font-size: 20px;
    line-height: 1;
  }

  .products-page .filter-panel {
    display: none !important;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px !important;
    padding: 2px 0 8px;
  }

  .products-page .filter-panel.is-open {
    display: grid !important;
  }

  .products-page .filter-block {
    min-width: 0;
    margin: 0 !important;
    padding: 16px !important;
  }

  .products-page .clear-filter-btn {
    grid-column: 1 / -1;
    width: 100%;
  }
}

@media (max-width: 560px) {
  .products-page .filter-panel {
    grid-template-columns: 1fr;
  }

  .products-page .clear-filter-btn {
    grid-column: auto;
  }

  .products-page .filter-option {
    min-height: 38px !important;
    font-size: 14px !important;
  }
}
`;
  const i = s.lastIndexOf('</style>');
  s = s.slice(0, i) + css + s.slice(i);
}

fs.writeFileSync(p, s, 'utf8');
console.log('responsive filter restored');
