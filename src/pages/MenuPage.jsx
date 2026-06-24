// MenuPage.jsx — coquille React qui charge le menu HTML pur
import { useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { createCommande, appelServeur } from '../lib/supabase';

const SUPABASE_URL  = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY;

export default function MenuPage() {
  const mountedRef = useRef(false);

  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;

    const sb = createClient(SUPABASE_URL, SUPABASE_ANON);

    Promise.all([
      sb.from('categories').select('*').eq('actif', true).order('ordre'),
      sb.from('produits').select('*').eq('disponible', true).order('ordre'),
    ]).then(([{ data: cats }, { data: prods }]) => {
      initMenu(cats || [], prods || [], createCommande, appelServeur);
    });
  }, []);

  return <div id="malamu-root" style={{ position:'fixed', inset:0, zIndex:0 }} />;
}

/* ═══════════════════════════════════════════════════════════
   MENU MALAMU — VANILLA JS
═══════════════════════════════════════════════════════════ */
function initMenu(categories, produits, createCommande, appelServeur) {
  const root = document.getElementById('malamu-root');
  if (!root) return;

  const ITEMS_PER_PAGE = 4;
  let cart = [];
  let lang = 'fr';
  let coverDismissed = false;

  const T = {
    fr: {
      title:'Malamu', sub:'Resto · Bar · Expériences',
      cartBtn:'Commande', bell:'Appeler',
      tableQ:'Numéro de table', tablePh:'Table 5, Bar, Terrasse…',
      send:'Appeler le serveur', cancel:'Annuler',
      bellOk:'Le serveur arrive !', errTable:'Indiquez votre table.',
      vide:'Votre panier est vide', total:'Total',
      tableLabel:'Table *', demLabel:'Demandes',
      demPh:'Allergies, sans sel…', commander:'Passer la commande',
      cmdOk:'Commande envoyée', swipe:'Glissez pour tourner les pages',
      add:'Ajouter', empty:'Aucun plat disponible',
      openMenu:'Découvrir le menu', tagline:'Kinshasa · Gombe',
    },
    en: {
      title:'Malamu', sub:'Resto · Bar · Experiences',
      cartBtn:'Order', bell:'Call',
      tableQ:'Table number', tablePh:'Table 5, Bar, Terrace…',
      send:'Call waiter', cancel:'Cancel',
      bellOk:'Waiter on the way!', errTable:'Enter your table.',
      vide:'Your cart is empty', total:'Total',
      tableLabel:'Table *', demLabel:'Special requests',
      demPh:'Allergies, no salt…', commander:'Place order',
      cmdOk:'Order sent', swipe:'Swipe to turn pages',
      add:'Add', empty:'No items available',
      openMenu:'Discover the menu', tagline:'Kinshasa · Gombe',
    },
  };

  // ─── PAGES ───────────────────────────────────────────────
  function buildPages() {
    const pages = [];
    categories.forEach(cat => {
      const cp = produits.filter(p => p.categorie_id === cat.id);
      if (!cp.length) return;
      for (let i = 0; i < cp.length; i += ITEMS_PER_PAGE)
        pages.push({ cat, items: cp.slice(i, i + ITEMS_PER_PAGE) });
    });
    const sans = produits.filter(p => !p.categorie_id);
    for (let i = 0; i < sans.length; i += ITEMS_PER_PAGE)
      pages.push({ cat: { nom:'Autres', emoji:'🍽️' }, items: sans.slice(i, i + ITEMS_PER_PAGE) });
    return pages;
  }

  // ─── TOAST ───────────────────────────────────────────────
  function toast(msg) {
    let t = document.getElementById('m-toast');
    if (!t) { t = document.createElement('div'); t.id = 'm-toast'; root.appendChild(t); }
    t.textContent = msg; t.className = 'm-toast show';
    clearTimeout(t._tid);
    t._tid = setTimeout(() => t.className = 'm-toast', 3000);
  }

  // ─── CART ────────────────────────────────────────────────
  function cartTotal() { return cart.reduce((s, i) => s + i.prix * i.qty, 0); }
  function cartCount() { return cart.reduce((s, i) => s + i.qty, 0); }

  function addToCart(prod) {
    const i = cart.findIndex(x => x.id === prod.id);
    if (i >= 0) cart[i].qty += 1;
    else cart.push({ id: prod.id, nom: prod.nom, prix: prod.prix, qty: 1 });
    updateCartBtn();
    toast(`✓  ${prod.nom}`);
  }

  function updateCartBtn() {
    const btn = document.getElementById('m-cart-btn');
    if (!btn) return;
    const n = cartCount();
    const L = T[lang];
    btn.className = 'm-hbtn' + (n > 0 ? ' active' : '');
    btn.innerHTML = n > 0
      ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg> ${L.cartBtn} <span class="m-badge">${n}</span>`
      : `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg> ${L.cartBtn}`;
  }

  // ─── PANIER SHEET ────────────────────────────────────────
  function openCart() {
    let ol = document.getElementById('m-cart-overlay');
    if (ol) ol.remove();
    const L = T[lang];
    const overlay = document.createElement('div');
    overlay.className = 'm-overlay'; overlay.id = 'm-cart-overlay';

    let tableVal = '', demVal = '';

    function renderSheet() {
      const n = cartCount(); const tot = cartTotal();
      overlay.innerHTML = `
      <div class="m-sheet" onclick="event.stopPropagation()">
        <div class="m-sheet-handle"><div></div></div>
        <div class="m-sheet-head">
          <div>
            <div class="m-sheet-title">${L.cartBtn}</div>
            ${n > 0 ? `<div class="m-sheet-count">${n} article${n>1?'s':''}</div>` : ''}
          </div>
          <button class="m-close-btn" id="m-close-cart">✕</button>
        </div>
        <div class="m-sheet-body">
          ${cart.length === 0
            ? `<div class="m-empty"><div style="font-size:46px;margin-bottom:12px;opacity:.3">○</div><p>${L.vide}</p></div>`
            : `${cart.map((item, idx) => `
              <div class="m-cart-item">
                <div class="m-ci-info">
                  <div class="m-ci-name">${item.nom}</div>
                  <div class="m-ci-price">${item.prix.toFixed(2)} $</div>
                </div>
                <div class="m-ci-ctrl">
                  <button class="m-qbtn" data-ci="${idx}" data-d="-1">−</button>
                  <span class="m-qval">${item.qty}</span>
                  <button class="m-qbtn plus" data-ci="${idx}" data-d="1">+</button>
                </div>
                <div class="m-ci-sub">${(item.prix*item.qty).toFixed(2)} $</div>
                <button class="m-del-btn" data-ci="${idx}">✕</button>
              </div>`).join('')}
            <div class="m-total-row">
              <span class="m-total-label">${L.total}</span>
              <span class="m-total-val">${tot.toFixed(2)} $</span>
            </div>
            <div class="m-form">
              <label class="m-flabel">${L.tableLabel}</label>
              <input class="m-finput" id="m-ptable" value="${tableVal}" placeholder="${L.tablePh}" />
              <label class="m-flabel" style="margin-top:12px">${L.demLabel}</label>
              <textarea class="m-finput" id="m-pdem" rows="2" style="resize:vertical;min-height:56px">${demVal}</textarea>
              <div id="m-perr" class="m-err"></div>
            </div>`}
        </div>
        ${cart.length > 0 ? `
        <div class="m-sheet-foot">
          <button class="m-order-btn" id="m-order-btn">${L.commander}</button>
        </div>` : ''}
      </div>`;

      overlay.querySelector('#m-close-cart').onclick = () => overlay.remove();
      overlay.onclick = () => overlay.remove();
      overlay.querySelector('.m-sheet').onclick = e => e.stopPropagation();

      overlay.querySelectorAll('.m-qbtn').forEach(btn => {
        btn.onclick = () => {
          const idx = +btn.dataset.ci, d = +btn.dataset.d;
          cart[idx].qty += d;
          if (cart[idx].qty <= 0) cart.splice(idx, 1);
          updateCartBtn(); renderSheet();
        };
      });
      overlay.querySelectorAll('.m-del-btn').forEach(btn => {
        btn.onclick = () => { cart.splice(+btn.dataset.ci, 1); updateCartBtn(); renderSheet(); };
      });
      if (cart.length > 0) {
        overlay.querySelector('#m-ptable').addEventListener('input', e => tableVal = e.target.value);
        overlay.querySelector('#m-pdem').addEventListener('input', e => demVal = e.target.value);
        overlay.querySelector('#m-order-btn').onclick = async () => {
          tableVal = overlay.querySelector('#m-ptable').value;
          const errEl = overlay.querySelector('#m-perr');
          if (!tableVal.trim()) { errEl.textContent = '⚠ ' + L.errTable; return; }
          const btn = overlay.querySelector('#m-order-btn');
          btn.disabled = true; btn.textContent = '…';
          const items = cart.map(i => ({ id: i.id, nom: i.nom, prix_unit: i.prix, quantite: i.qty }));
          const { error } = await createCommande(tableVal.trim(), items, demVal.trim());
          if (error) { errEl.textContent = '⚠ ' + error.message; btn.disabled=false; btn.textContent=L.commander; return; }
          const stamp = document.createElement('div');
          stamp.className = 'm-stamp-overlay';
          stamp.innerHTML = `<div class="m-stamp-box"><div class="m-stamp-text">${L.cmdOk}</div></div>`;
          overlay.querySelector('.m-sheet').appendChild(stamp);
          setTimeout(() => { cart = []; updateCartBtn(); overlay.remove(); toast(L.cmdOk); }, 1500);
        };
      }
    }
    renderSheet();
    root.appendChild(overlay);
  }

  // ─── BELL MODAL ──────────────────────────────────────────
  function openBell() {
    let ol = document.getElementById('m-bell-ol');
    if (ol) ol.remove();
    const L = T[lang];
    const overlay = document.createElement('div');
    overlay.className = 'm-overlay modal'; overlay.id = 'm-bell-ol';
    overlay.innerHTML = `
      <div class="m-modal" onclick="event.stopPropagation()">
        <div class="m-modal-icon">◎</div>
        <div class="m-modal-title">${L.tableQ}</div>
        <div class="m-modal-sub">MALAMU · KINSHASA</div>
        <input class="m-finput" id="m-bell-table" placeholder="${L.tablePh}" autofocus />
        <div id="m-bell-err" class="m-err"></div>
        <button class="m-order-btn" id="m-bell-send" style="margin-top:14px">${L.send}</button>
        <button class="m-cancel-btn" id="m-bell-cancel">${L.cancel}</button>
      </div>`;
    overlay.onclick = () => overlay.remove();
    overlay.querySelector('#m-bell-cancel').onclick = () => overlay.remove();
    overlay.querySelector('#m-bell-send').onclick = async () => {
      const tbl = overlay.querySelector('#m-bell-table').value.trim();
      const errEl = overlay.querySelector('#m-bell-err');
      if (!tbl) { errEl.textContent = '⚠ ' + L.errTable; return; }
      const btn = overlay.querySelector('#m-bell-send');
      btn.disabled = true; btn.textContent = '…';
      const { error } = await appelServeur(tbl);
      if (error) { errEl.textContent = '⚠ ' + error.message; btn.disabled=false; btn.textContent=L.send; return; }
      const stamp = document.createElement('div');
      stamp.className = 'm-stamp-overlay';
      stamp.innerHTML = `<div class="m-stamp-box"><div class="m-stamp-text">${L.bellOk}</div></div>`;
      overlay.querySelector('.m-modal').appendChild(stamp);
      setTimeout(() => { overlay.remove(); toast(L.bellOk); }, 1400);
    };
    root.appendChild(overlay);
  }

  // ─── COVER PAGE ──────────────────────────────────────────
  function showCover(onOpen) {
    const L = T[lang];
    const cover = document.createElement('div');
    cover.id = 'm-cover-screen';
    cover.innerHTML = `
      <div class="m-cover-bg"></div>
      <div class="m-cover-content">
        <div class="m-cover-ornament">✦ ✦ ✦</div>
        <div class="m-cover-brand">Malamu</div>
        <div class="m-cover-divider"></div>
        <div class="m-cover-tagline">${L.tagline}</div>
        <div class="m-cover-sub">${L.sub}</div>
        <button class="m-cover-btn" id="m-cover-open">
          <span>${L.openMenu}</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </button>
        <div class="m-cover-footer">Kinshasa · Gombe</div>
      </div>
      <div class="m-cover-book-hint">
        <div class="m-cover-book">
          <div class="m-cover-book-left"></div>
          <div class="m-cover-book-right"></div>
          <div class="m-cover-book-spine"></div>
        </div>
      </div>`;
    root.appendChild(cover);
    // Animate in
    requestAnimationFrame(() => { cover.classList.add('visible'); });

    cover.querySelector('#m-cover-open').onclick = () => {
      cover.classList.add('closing');
      setTimeout(() => { cover.remove(); coverDismissed = true; onOpen(); }, 600);
    };
  }

  // ─── BOOK ────────────────────────────────────────────────
  function buildBook(pages) {
    const isMobile = window.innerWidth < 768;
    const totalSpreads = isMobile ? pages.length : Math.ceil(pages.length / 2);
    let spread = 0;
    let isFlipping = false;

    function pageHTML(page, side, pageNum, totalPgs) {
      if (!page) return `
        <div class="m-page-paper ${side}">
          <div class="m-page-ornament">✦</div>
        </div>`;

      const isMob = window.innerWidth < 768;
      return `
        <div class="m-page-paper ${side}">
          <div class="m-page-header">
            <div class="m-page-header-inner">
              <span class="m-cat-name">${page.cat.nom}</span>
            </div>
            <div class="m-page-header-rule"></div>
          </div>
          <div class="m-page-items">
            ${page.items.map(p => `
              <div class="m-item" data-id="${p.id}">
                <div class="m-item-body">
                  <div class="m-item-left">
                    ${p.image_url
                      ? `<div class="m-item-img"><img src="${p.image_url}" alt="${p.nom}" loading="lazy" /></div>`
                      : ''}
                    <div class="m-item-info">
                      <div class="m-item-name">${p.nom}</div>
                      ${p.description ? `<div class="m-item-desc">${isMob ? '' : (p.description.length>52 ? p.description.slice(0,52)+'…' : p.description)}</div>` : ''}
                    </div>
                  </div>
                  <div class="m-item-right">
                    <div class="m-item-price">${Number(p.prix).toLocaleString('fr-FR')} <sup>$</sup></div>
                    <div class="m-qty-ctrl">
                      <button class="m-qb minus" data-id="${p.id}" data-d="-1">−</button>
                      <span class="m-qv" id="qv-${p.id}">0</span>
                      <button class="m-qb plus" data-id="${p.id}" data-d="1">+</button>
                    </div>
                    <button class="m-add-btn" id="add-${p.id}" data-id="${p.id}" data-nom="${p.nom}" data-prix="${p.prix}" style="display:none">${T[lang].add}</button>
                  </div>
                </div>
              </div>`).join('')}
          </div>
          <div class="m-page-footer">
            <div class="m-page-footer-rule"></div>
            <span class="m-page-num">${pageNum} / ${totalPgs}</span>
          </div>
        </div>`;
    }

    function render() {
      const L = T[lang];
      const isMob = window.innerWidth < 768;
      const leftPage  = isMob ? null : (pages[spread*2]   || null);
      const rightPage = isMob ? null : (pages[spread*2+1] || null);
      const mobPage   = isMob ? (pages[spread] || null)   : null;

      root.innerHTML = `
      <div id="m-app">
        <header class="m-header">
          <div class="m-brand">
            <div class="m-brand-name">${L.title}</div>
            <div class="m-brand-sub">${L.tagline}</div>
          </div>
          <div class="m-header-actions">
            <button class="m-hbtn m-lang" id="m-lang-btn">${lang==='fr'?'EN':'FR'}</button>
            <button class="m-hbtn" id="m-bell-btn">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            </button>
            <button class="m-hbtn${cartCount()>0?' active':''}" id="m-cart-btn">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
              ${L.cartBtn}${cartCount()>0?` <span class="m-badge">${cartCount()}</span>`:''}
            </button>
          </div>
        </header>

        <main class="m-main">
          ${pages.length === 0
            ? `<div class="m-empty-state"><div class="m-empty-icon">○</div><p>${L.empty}</p></div>`
            : isMob
            ? `<div class="m-book-wrap" id="m-book-wrap">
                <div class="m-mob-page" id="m-mob-page">
                  ${pageHTML(mobPage, 'right', spread+1, pages.length)}
                </div>
              </div>
              <div class="m-nav" id="m-nav">
                <button class="m-nav-btn${spread<=0?' off':''}" id="m-prev">‹</button>
                <div class="m-dots">
                  ${Array.from({length:Math.min(pages.length,8)}).map((_,i) => {
                    const a = pages.length<=8 ? i===spread : Math.round(i*(pages.length-1)/7)===spread;
                    return `<div class="m-dot${a?' on':''}"></div>`;
                  }).join('')}
                </div>
                <button class="m-nav-btn${spread>=pages.length-1?' off':''}" id="m-next">›</button>
              </div>`
            : `<div class="m-book-scene">
                <div class="m-book-wrap" id="m-book-wrap">
                  <div class="m-book" id="m-book">
                    <div class="m-spine"></div>
                    <div class="m-static-page left" id="m-left">
                      ${pageHTML(leftPage, 'left', spread*2+1, pages.length)}
                    </div>
                    <div class="m-static-page right" id="m-right">
                      ${pageHTML(rightPage, 'right', spread*2+2, pages.length)}
                    </div>
                    <div class="m-edge"></div>
                  </div>
                </div>
                <div class="m-nav" id="m-nav">
                  <button class="m-nav-btn${spread<=0?' off':''}" id="m-prev">‹</button>
                  <div class="m-dots">
                    ${Array.from({length:totalSpreads}).map((_,i)=>`<div class="m-dot${i===spread?' on':''}"></div>`).join('')}
                  </div>
                  <button class="m-nav-btn${spread>=totalSpreads-1?' off':''}" id="m-next">›</button>
                </div>
                <p class="m-hint">${L.swipe}</p>
              </div>`
          }
        </main>
      </div>`;

      // Animate book in on first render
      requestAnimationFrame(() => {
        const app = document.getElementById('m-app');
        if (app) { app.style.opacity = '0'; app.style.transform = 'translateY(8px)'; }
        requestAnimationFrame(() => {
          if (app) { app.style.transition = 'opacity 0.5s ease, transform 0.5s ease'; app.style.opacity = '1'; app.style.transform = 'translateY(0)'; }
        });
      });

      attachEvents();
    }

    function attachEvents() {
      document.getElementById('m-lang-btn')?.addEventListener('click', () => {
        lang = lang === 'fr' ? 'en' : 'fr'; render();
      });
      document.getElementById('m-cart-btn')?.addEventListener('click', openCart);
      document.getElementById('m-bell-btn')?.addEventListener('click', openBell);
      document.getElementById('m-prev')?.addEventListener('click', () => flip('prev'));
      document.getElementById('m-next')?.addEventListener('click', () => flip('next'));

      root.querySelectorAll('.m-qb').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.dataset.id, d = +btn.dataset.d;
          const qvEl = document.getElementById('qv-'+id);
          if (!qvEl) return;
          let q = parseInt(qvEl.textContent) + d;
          if (q < 0) q = 0;
          qvEl.textContent = q;
          const addBtn = document.getElementById('add-'+id);
          if (addBtn) addBtn.style.display = q > 0 ? 'block' : 'none';
          // visual feedback on + button
          if (d > 0) { btn.classList.add('bump'); setTimeout(()=>btn.classList.remove('bump'),200); }
        });
      });

      root.querySelectorAll('.m-add-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.dataset.id;
          const q = parseInt(document.getElementById('qv-'+id)?.textContent || '0');
          if (!q) return;
          const prod = produits.find(p => String(p.id) === String(id));
          if (!prod) return;
          for (let i=0; i<q; i++) addToCart(prod);
          document.getElementById('qv-'+id).textContent = '0';
          btn.style.display = 'none';
        });
      });

      // Swipe
      let tx = null;
      const wrap = document.getElementById('m-book-wrap') || document.getElementById('m-book');
      if (wrap) {
        wrap.addEventListener('touchstart', e => { tx = e.touches[0].clientX; }, {passive:true});
        wrap.addEventListener('touchend', e => {
          if (tx === null) return;
          const d = tx - e.changedTouches[0].clientX;
          if (Math.abs(d) > 50) flip(d > 0 ? 'next' : 'prev');
          tx = null;
        });
      }
    }

    // ─── FLIP 3D ─────────────────────────────────────────────
    function flip(dir) {
      if (isFlipping) return;
      if (dir === 'next' && spread >= totalSpreads - 1) return;
      if (dir === 'prev' && spread <= 0) return;

      const isMob = window.innerWidth < 768;
      const next = dir === 'next' ? spread + 1 : spread - 1;

      if (isMob) {
        const page = document.getElementById('m-mob-page');
        if (!page) { spread = next; render(); return; }
        page.style.transition = 'opacity 0.22s ease, transform 0.22s ease';
        page.style.opacity = '0';
        page.style.transform = dir === 'next' ? 'translateX(-24px)' : 'translateX(24px)';
        setTimeout(() => { spread = next; render(); }, 240);
        return;
      }

      // Desktop 3D flip
      isFlipping = true;
      const book = document.getElementById('m-book');
      if (!book) { spread = next; render(); isFlipping = false; return; }

      const leftEl  = document.getElementById('m-left');
      const rightEl = document.getElementById('m-right');
      const nextLeft  = pages[next*2]   || null;
      const nextRight = pages[next*2+1] || null;

      if (dir === 'next') {
        leftEl.innerHTML  = pageHTML(nextLeft,  'left',  next*2+1, pages.length);
      } else {
        rightEl.innerHTML = pageHTML(nextRight, 'right', next*2+2, pages.length);
      }

      const flipPage = document.createElement('div');
      flipPage.className = `m-flip dir-${dir}`;
      flipPage.id = 'm-flip-page';

      const front = document.createElement('div');
      front.className = 'm-flip-face front';
      const back = document.createElement('div');
      back.className = 'm-flip-face back';

      if (dir === 'next') {
        const curRight = pages[spread*2+1] || null;
        front.innerHTML = pageHTML(curRight, 'right', spread*2+2, pages.length);
        back.innerHTML  = pageHTML(nextLeft, 'left', next*2+1, pages.length);
        rightEl.style.visibility = 'hidden';
      } else {
        const curLeft = pages[spread*2] || null;
        front.innerHTML = pageHTML(curLeft, 'left', spread*2+1, pages.length);
        back.innerHTML  = pageHTML(nextRight, 'right', next*2+2, pages.length);
        leftEl.style.visibility = 'hidden';
      }

      flipPage.appendChild(front);
      flipPage.appendChild(back);
      book.appendChild(flipPage);

      flipPage.getBoundingClientRect();
      flipPage.classList.add('go');

      flipPage.addEventListener('animationend', () => {
        spread = next;
        isFlipping = false;
        render();
      }, { once: true });
    }

    render();
  }

  // ─── CSS ─────────────────────────────────────────────────
  const style = document.createElement('style');
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600&family=Jost:wght@300;400;500;600&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    html, body { height: 100%; overflow: hidden; background: #F5EFE0; }

    #malamu-root {
      position: fixed; inset: 0; overflow: hidden; background: #F5EFE0;
    }

    /* ════════════════════════════════════════
       COVER SCREEN
    ════════════════════════════════════════ */
    #m-cover-screen {
      position: absolute; inset: 0; z-index: 200;
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      background: #F5EFE0;
      opacity: 0; transition: opacity 0.5s ease;
    }
    #m-cover-screen.visible { opacity: 1; }
    #m-cover-screen.closing {
      opacity: 0; transform: scale(0.97);
      transition: opacity 0.6s ease, transform 0.6s ease;
    }

    .m-cover-bg {
      position: absolute; inset: 0;
      background-image:
        radial-gradient(ellipse 60% 40% at 50% 0%, rgba(196,98,45,0.07) 0%, transparent 70%),
        radial-gradient(ellipse 40% 60% at 100% 100%, rgba(196,98,45,0.05) 0%, transparent 70%);
      pointer-events: none;
    }

    .m-cover-content {
      position: relative; z-index: 1;
      display: flex; flex-direction: column;
      align-items: center; text-align: center;
      padding: 40px 32px; gap: 0;
    }

    .m-cover-ornament {
      font-family: 'Cormorant Garamond', serif;
      font-size: 11px; letter-spacing: 8px; color: rgba(196,98,45,0.4);
      margin-bottom: 24px;
    }

    .m-cover-brand {
      font-family: 'Cormorant Garamond', serif;
      font-size: clamp(52px, 14vw, 88px);
      font-weight: 300; font-style: italic;
      color: #0F0F0E; line-height: 1;
      letter-spacing: -1px;
    }

    .m-cover-divider {
      width: 40px; height: 1px;
      background: rgba(196,98,45,0.4);
      margin: 18px auto;
    }

    .m-cover-tagline {
      font-family: 'Jost', sans-serif;
      font-size: 10px; font-weight: 500;
      letter-spacing: 4px; text-transform: uppercase;
      color: rgba(196,98,45,0.7); margin-bottom: 6px;
    }

    .m-cover-sub {
      font-family: 'Cormorant Garamond', serif;
      font-size: 14px; font-style: italic;
      color: rgba(15,15,14,0.35); margin-bottom: 36px;
    }

    .m-cover-btn {
      display: flex; align-items: center; gap: 10px;
      padding: 14px 32px;
      background: #0F0F0E; color: #F5EFE0;
      border: none; border-radius: 2px;
      font-family: 'Jost', sans-serif;
      font-size: 11px; font-weight: 500;
      letter-spacing: 2px; text-transform: uppercase;
      cursor: pointer; outline: none;
      transition: background 0.2s, transform 0.15s;
    }
    .m-cover-btn:hover { background: #C4622D; transform: translateY(-1px); }
    .m-cover-btn:active { transform: translateY(0); }

    .m-cover-footer {
      position: absolute; bottom: 24px; left: 0; right: 0;
      text-align: center;
      font-family: 'Jost', sans-serif;
      font-size: 9px; font-weight: 500;
      letter-spacing: 3px; text-transform: uppercase;
      color: rgba(15,15,14,0.2);
    }

    /* Petit livre décoratif sur la cover */
    .m-cover-book-hint {
      position: absolute; bottom: 56px; right: 28px;
      opacity: 0.12; pointer-events: none;
    }
    .m-cover-book {
      width: 32px; height: 42px; position: relative;
      display: flex;
    }
    .m-cover-book-left {
      flex: 1; background: #C4622D; border-radius: 2px 0 0 2px;
    }
    .m-cover-book-right {
      flex: 1; background: #0F0F0E; border-radius: 0 2px 2px 0;
    }
    .m-cover-book-spine {
      position: absolute; left: 50%; top: 0; bottom: 0; width: 3px;
      transform: translateX(-50%);
      background: #1a0f06;
    }

    /* ════════════════════════════════════════
       APP SHELL
    ════════════════════════════════════════ */
    #m-app {
      position: absolute; inset: 0; overflow: hidden;
      display: flex; flex-direction: column;
      background: #F5EFE0; color: #0F0F0E;
      font-family: 'Jost', sans-serif;
    }

    /* ── HEADER ── */
    .m-header {
      height: 56px; flex-shrink: 0;
      background: #F5EFE0;
      border-bottom: 1px solid rgba(15,15,14,0.08);
      display: flex; align-items: center; justify-content: space-between;
      padding: 0 20px; z-index: 50;
    }

    .m-brand-name {
      font-family: 'Cormorant Garamond', serif;
      font-size: 24px; font-weight: 400; font-style: italic;
      color: #0F0F0E; letter-spacing: 0.3px; line-height: 1;
    }
    .m-brand-sub {
      font-size: 8px; font-weight: 500; letter-spacing: 2.5px;
      text-transform: uppercase; color: rgba(196,98,45,0.6);
      margin-top: 2px;
    }

    .m-header-actions { display: flex; align-items: center; gap: 6px; }

    .m-hbtn {
      display: flex; align-items: center; gap: 5px;
      padding: 7px 12px; border-radius: 2px;
      border: 1px solid rgba(15,15,14,0.15);
      background: transparent; color: #0F0F0E;
      font-family: 'Jost', sans-serif; font-size: 10px; font-weight: 500;
      letter-spacing: 1px; text-transform: uppercase;
      cursor: pointer; outline: none; white-space: nowrap;
      touch-action: manipulation; transition: all 0.18s;
    }
    .m-hbtn:hover { background: #0F0F0E; color: #F5EFE0; border-color: #0F0F0E; }
    .m-hbtn.active { background: #C4622D; border-color: #C4622D; color: #fff; }

    .m-badge {
      background: #fff; color: #C4622D;
      border-radius: 50%; width: 15px; height: 15px;
      display: flex; align-items: center; justify-content: center;
      font-size: 9px; font-weight: 700; line-height: 1;
    }

    /* ── MAIN ── */
    .m-main {
      flex: 1; overflow: hidden;
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      padding: 16px 16px 10px;
    }

    /* ── BOOK SCENE ── */
    .m-book-scene { width: 100%; display: flex; flex-direction: column; align-items: center; }
    .m-book-wrap  { width: 100%; max-width: 860px; perspective: 2400px; }

    .m-book {
      display: flex; position: relative;
      height: clamp(300px, 52vh, 540px);
      border-radius: 3px 10px 10px 3px;
      box-shadow:
        0 1px 3px rgba(0,0,0,0.06),
        0 6px 20px rgba(0,0,0,0.09),
        0 20px 56px rgba(0,0,0,0.13);
      transform-style: preserve-3d;
    }

    .m-spine {
      position: absolute; left: 50%; top: 0; bottom: 0; width: 10px;
      transform: translateX(-50%);
      background: linear-gradient(to right, #1c0f07, #3a1e0e, #1c0f07);
      z-index: 25;
      box-shadow: 0 0 10px rgba(0,0,0,0.25);
    }

    .m-edge {
      position: absolute; right: -5px; top: 3px; bottom: 3px; width: 5px;
      background: repeating-linear-gradient(
        to bottom,
        #F5EFE0 0, #F5EFE0 1.5px,
        #D9CCBA 1.5px, #D9CCBA 3px
      );
      border-radius: 0 2px 2px 0;
      box-shadow: 2px 0 6px rgba(0,0,0,0.12);
    }

    .m-static-page { flex: 1; overflow: hidden; position: relative; }
    .m-static-page.left  { border-radius: 3px 0 0 3px; }
    .m-static-page.right { border-radius: 0 8px 8px 0; }

    /* ── PAGE PAPER ── */
    .m-page-paper {
      width: 100%; height: 100%;
      display: flex; flex-direction: column;
      padding: clamp(14px, 2.8vh, 26px) clamp(12px, 2.2vw, 24px);
      overflow: hidden; position: relative;
      gap: 0;
    }
    .m-page-paper.left {
      background: linear-gradient(to left, #EAE0CA, #F5EFE0);
      box-shadow: inset -5px 0 16px rgba(0,0,0,0.06);
    }
    .m-page-paper.right {
      background: linear-gradient(to right, #EAE0CA, #F5EFE0);
      box-shadow: inset 5px 0 16px rgba(0,0,0,0.06);
    }
    /* Texture lignes papier */
    .m-page-paper::before {
      content: ''; position: absolute; inset: 0; pointer-events: none; z-index: 0;
      background-image: repeating-linear-gradient(
        transparent, transparent 31px,
        rgba(15,15,14,0.03) 31px, rgba(15,15,14,0.03) 32px
      );
      background-position-y: 70px;
    }

    .m-page-ornament {
      flex: 1; display: flex; align-items: center; justify-content: center;
      font-family: 'Cormorant Garamond', serif;
      font-size: 22px; color: rgba(15,15,14,0.06);
      position: relative; z-index: 1;
    }

    /* ── PAGE HEADER ── */
    .m-page-header {
      flex-shrink: 0; margin-bottom: clamp(8px, 1.4vh, 14px);
      position: relative; z-index: 1;
    }
    .m-page-header-inner {
      display: flex; align-items: baseline; gap: 8px;
      margin-bottom: 7px;
    }
    .m-cat-name {
      font-family: 'Cormorant Garamond', serif;
      font-size: clamp(15px, 2.2vw, 20px); font-weight: 500;
      color: #0F0F0E; letter-spacing: 0.2px;
    }
    .m-page-header-rule {
      height: 1px;
      background: linear-gradient(to right, rgba(196,98,45,0.5), rgba(196,98,45,0.1), transparent);
    }

    /* ── PAGE ITEMS ── */
    .m-page-items { flex: 1; overflow: hidden; position: relative; z-index: 1; display: flex; flex-direction: column; gap: clamp(2px, 0.8vh, 8px); }

    .m-item {
      padding: clamp(7px, 1.3vh, 12px) 0;
      border-bottom: 1px solid rgba(15,15,14,0.06);
    }
    .m-item:last-child { border-bottom: none; }

    .m-item-body {
      display: flex; align-items: center;
      gap: clamp(6px, 1vw, 12px); justify-content: space-between;
    }

    .m-item-left {
      display: flex; align-items: center;
      gap: clamp(6px, 1vw, 10px); flex: 1; min-width: 0;
    }

    .m-item-img {
      width: clamp(34px, 4.5vw, 46px); height: clamp(34px, 4.5vw, 46px);
      border-radius: 4px; overflow: hidden; flex-shrink: 0;
      background: rgba(15,15,14,0.05);
      border: 1px solid rgba(15,15,14,0.07);
    }
    .m-item-img img { width: 100%; height: 100%; object-fit: cover; }

    .m-item-info { flex: 1; min-width: 0; }
    .m-item-name {
      font-family: 'Cormorant Garamond', serif;
      font-size: clamp(12px, 1.6vw, 16px); font-weight: 600;
      color: #0F0F0E; line-height: 1.2;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .m-item-desc {
      font-size: clamp(8px, 0.85vw, 10px); color: rgba(15,15,14,0.38);
      font-style: italic; line-height: 1.3; margin-top: 2px;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }

    .m-item-right {
      display: flex; flex-direction: column;
      align-items: flex-end; gap: 4px; flex-shrink: 0;
    }
    .m-item-price {
      font-family: 'Cormorant Garamond', serif;
      font-size: clamp(13px, 1.8vw, 17px); font-weight: 700; color: #C4622D;
      line-height: 1;
    }
    .m-item-price sup { font-size: 0.55em; font-weight: 400; opacity: 0.7; }

    .m-qty-ctrl { display: flex; align-items: center; gap: 5px; }
    .m-qb {
      width: clamp(20px, 2.6vw, 26px); height: clamp(20px, 2.6vw, 26px);
      border-radius: 50%; border: 1.5px solid rgba(15,15,14,0.2);
      background: transparent; color: #0F0F0E;
      font-size: 14px; font-weight: 500;
      cursor: pointer; display: flex; align-items: center; justify-content: center;
      touch-action: manipulation; outline: none;
      transition: all 0.15s;
    }
    .m-qb.plus {
      background: #C4622D; border-color: #C4622D; color: #fff;
      box-shadow: 0 2px 5px rgba(196,98,45,0.25);
    }
    .m-qb.bump { transform: scale(1.2); }
    .m-qv {
      font-size: 11px; font-weight: 600; color: #0F0F0E;
      min-width: 14px; text-align: center;
    }
    .m-add-btn {
      background: #0F0F0E; color: #F5EFE0;
      border: none; border-radius: 2px;
      padding: 4px 9px; font-family: 'Jost', sans-serif;
      font-size: 9px; font-weight: 500;
      letter-spacing: 0.5px; text-transform: uppercase;
      cursor: pointer; touch-action: manipulation; outline: none;
      transition: background 0.15s;
    }
    .m-add-btn:hover { background: #C4622D; }

    /* ── PAGE FOOTER ── */
    .m-page-footer {
      flex-shrink: 0; margin-top: clamp(6px, 1vh, 12px);
      position: relative; z-index: 1;
    }
    .m-page-footer-rule {
      height: 1px; margin-bottom: 5px;
      background: linear-gradient(to right, rgba(15,15,14,0.06), transparent);
    }
    .m-page-num {
      font-family: 'Cormorant Garamond', serif;
      font-size: 9px; font-style: italic;
      color: rgba(15,15,14,0.2); display: block; text-align: right;
    }

    /* ── MOBILE PAGE ── */
    .m-mob-page {
      width: 100%; min-height: calc(100dvh - 170px);
      border-radius: 8px; overflow: hidden;
      box-shadow:
        0 2px 4px rgba(0,0,0,0.05),
        0 8px 20px rgba(0,0,0,0.09),
        5px 0 0 #C9BBA6, 9px 0 0 #B9AB96;
    }
    .m-mob-page .m-page-paper { min-height: inherit; }

    /* ── NAV ── */
    .m-nav { display: flex; align-items: center; gap: 16px; margin-top: 14px; }
    .m-nav-btn {
      width: 40px; height: 40px; border-radius: 50%;
      border: 1.5px solid rgba(15,15,14,0.2);
      background: transparent; color: rgba(15,15,14,0.6);
      font-size: 20px; line-height: 1;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; outline: none; touch-action: manipulation;
      transition: all 0.18s;
    }
    .m-nav-btn:hover { border-color: #0F0F0E; color: #0F0F0E; background: rgba(15,15,14,0.04); }
    .m-nav-btn.off { border-color: rgba(15,15,14,0.08); color: rgba(15,15,14,0.12); cursor: not-allowed; }
    .m-nav-btn.off:hover { background: transparent; border-color: rgba(15,15,14,0.08); color: rgba(15,15,14,0.12); }

    .m-dots { display: flex; gap: 5px; align-items: center; }
    .m-dot { height: 5px; border-radius: 3px; background: rgba(15,15,14,0.12); transition: all 0.3s; width: 5px; }
    .m-dot.on { width: 20px; background: #C4622D; }

    .m-hint {
      font-family: 'Cormorant Garamond', serif;
      font-size: 10px; font-style: italic;
      color: rgba(15,15,14,0.2); margin-top: 6px;
    }

    .m-empty-state {
      text-align: center; color: rgba(15,15,14,0.2);
    }
    .m-empty-icon { font-size: 36px; margin-bottom: 12px; opacity: 0.3; }
    .m-empty-state p {
      font-family: 'Cormorant Garamond', serif;
      font-size: 18px; font-style: italic;
    }

    /* ─────────────────────────────
       FLIP 3D
    ───────────────────────────── */
    .m-flip {
      position: absolute; top: 0; bottom: 0;
      transform-style: preserve-3d;
      z-index: 20; pointer-events: none;
    }
    .m-flip.dir-next { left: 50%; right: 0; transform-origin: left center; }
    .m-flip.dir-prev { left: 0; right: 50%; transform-origin: right center; }

    .m-flip.dir-next.go { animation: mFlipNext 0.85s cubic-bezier(0.23,1,0.32,1) forwards; }
    .m-flip.dir-prev.go { animation: mFlipPrev 0.85s cubic-bezier(0.23,1,0.32,1) forwards; }

    @keyframes mFlipNext {
      0%   { transform: rotateY(0deg);    filter: brightness(1); }
      25%  { transform: rotateY(-52deg);  filter: brightness(0.83); }
      60%  { transform: rotateY(-128deg); filter: brightness(0.88); }
      100% { transform: rotateY(-180deg); filter: brightness(1); }
    }
    @keyframes mFlipPrev {
      0%   { transform: rotateY(0deg);   filter: brightness(1); }
      25%  { transform: rotateY(52deg);  filter: brightness(0.83); }
      60%  { transform: rotateY(128deg); filter: brightness(0.88); }
      100% { transform: rotateY(180deg); filter: brightness(1); }
    }

    .m-flip-face {
      position: absolute; inset: 0;
      backface-visibility: hidden; -webkit-backface-visibility: hidden;
      overflow: hidden;
    }
    .m-flip-face.back { transform: rotateY(180deg) scaleX(-1); }

    /* ── TOAST ── */
    .m-toast {
      position: fixed; bottom: 28px; left: 50%;
      transform: translateX(-50%) translateY(10px);
      background: #0F0F0E; color: #F5EFE0;
      padding: 10px 22px; border-radius: 2px;
      font-family: 'Jost', sans-serif; font-size: 11px; font-weight: 500;
      letter-spacing: 0.5px;
      z-index: 9999; pointer-events: none; opacity: 0;
      box-shadow: 0 4px 16px rgba(0,0,0,0.18);
      transition: opacity 0.25s, transform 0.25s;
    }
    .m-toast.show { opacity: 1; transform: translateX(-50%) translateY(0); }

    /* ── OVERLAY / SHEET ── */
    .m-overlay {
      position: fixed; inset: 0; z-index: 500;
      background: rgba(15,15,14,0.55);
      backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
      display: flex; align-items: flex-end; justify-content: center;
    }
    .m-overlay.modal { align-items: center; padding: 20px; }

    .m-sheet {
      background: #F5EFE0;
      border-top: 1px solid rgba(15,15,14,0.08);
      border-radius: 14px 14px 0 0;
      width: 100%; max-width: 480px; max-height: 92dvh;
      display: flex; flex-direction: column; overflow: hidden;
      animation: sheetUp 0.3s cubic-bezier(0.34,1.56,0.64,1);
    }
    @keyframes sheetUp { from{transform:translateY(100%)} to{transform:translateY(0)} }

    .m-sheet-handle { padding: 12px 0 0; display: flex; justify-content: center; flex-shrink: 0; }
    .m-sheet-handle div { width: 28px; height: 3px; border-radius: 2px; background: rgba(15,15,14,0.12); }

    .m-sheet-head {
      display: flex; justify-content: space-between; align-items: center;
      padding: 10px 20px 14px;
      border-bottom: 1px solid rgba(15,15,14,0.07); flex-shrink: 0;
    }
    .m-sheet-title {
      font-family: 'Cormorant Garamond', serif;
      font-size: 22px; font-weight: 500; color: #0F0F0E; font-style: italic;
    }
    .m-sheet-count {
      font-size: 10px; color: rgba(15,15,14,0.35);
      margin-top: 1px; letter-spacing: 0.5px;
    }
    .m-close-btn {
      width: 28px; height: 28px; border-radius: 50%;
      border: 1px solid rgba(15,15,14,0.12);
      background: transparent; color: rgba(15,15,14,0.35);
      font-size: 12px; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      outline: none;
    }

    .m-sheet-body { flex: 1; overflow-y: auto; padding: 14px 20px; }
    .m-sheet-foot { padding: 12px 20px 28px; border-top: 1px solid rgba(15,15,14,0.05); flex-shrink: 0; }

    .m-empty { text-align: center; padding: 48px 0; color: rgba(15,15,14,0.2); }
    .m-empty p { font-family: 'Cormorant Garamond', serif; font-size: 15px; font-style: italic; }

    .m-cart-item {
      display: flex; align-items: center; gap: 10px;
      padding: 12px 0; border-bottom: 1px solid rgba(15,15,14,0.05);
    }
    .m-ci-info { flex: 1; min-width: 0; }
    .m-ci-name {
      font-family: 'Cormorant Garamond', serif;
      font-size: 15px; font-weight: 600; color: #0F0F0E;
    }
    .m-ci-price { font-size: 10px; color: rgba(15,15,14,0.35); margin-top: 1px; }
    .m-ci-ctrl { display: flex; align-items: center; gap: 6px; }
    .m-ci-sub {
      font-family: 'Cormorant Garamond', serif;
      font-size: 14px; font-weight: 700; color: #0F0F0E;
      min-width: 54px; text-align: right;
    }
    .m-del-btn {
      background: none; border: none; color: rgba(15,15,14,0.2);
      cursor: pointer; font-size: 11px; padding: 0 2px; outline: none;
      transition: color 0.15s;
    }
    .m-del-btn:hover { color: #C4622D; }
    .m-qbtn {
      width: 26px; height: 26px; border-radius: 50%;
      border: 1px solid rgba(15,15,14,0.18);
      background: transparent; color: #0F0F0E;
      font-size: 14px; font-weight: 600;
      cursor: pointer; display: flex; align-items: center; justify-content: center;
      outline: none; touch-action: manipulation;
    }
    .m-qbtn.plus { background: #0F0F0E; border-color: #0F0F0E; color: #F5EFE0; }
    .m-qval { font-size: 12px; font-weight: 600; color: #0F0F0E; min-width: 16px; text-align: center; }

    .m-total-row {
      display: flex; justify-content: space-between; align-items: center;
      padding: 16px 0; border-top: 1px solid rgba(15,15,14,0.1); margin-top: 6px;
    }
    .m-total-label {
      font-size: 10px; font-weight: 500;
      letter-spacing: 2px; text-transform: uppercase; color: rgba(15,15,14,0.4);
    }
    .m-total-val {
      font-family: 'Cormorant Garamond', serif;
      font-size: 26px; font-weight: 700; color: #C4622D;
    }

    .m-form { margin-top: 16px; display: flex; flex-direction: column; gap: 6px; }
    .m-flabel {
      font-size: 9px; font-weight: 600;
      color: rgba(15,15,14,0.35); letter-spacing: 1.5px; text-transform: uppercase;
    }
    .m-finput {
      width: 100%; padding: 10px 12px;
      background: rgba(255,255,255,0.7); border: 1px solid rgba(15,15,14,0.12);
      border-radius: 2px; color: #0F0F0E;
      font-family: 'Jost', sans-serif; font-size: 13px;
      outline: none; transition: border 0.18s; box-sizing: border-box;
    }
    .m-finput:focus { border-color: #C4622D; background: #fff; }
    .m-finput::placeholder { color: rgba(15,15,14,0.22); }
    .m-err { color: #C4622D; font-size: 11px; min-height: 16px; margin-top: 2px; }

    .m-order-btn {
      width: 100%; padding: 14px;
      background: #0F0F0E; border: none; border-radius: 2px;
      color: #F5EFE0; font-family: 'Jost', sans-serif;
      font-size: 11px; font-weight: 600;
      letter-spacing: 2px; text-transform: uppercase;
      cursor: pointer; outline: none;
      transition: background 0.18s; touch-action: manipulation;
    }
    .m-order-btn:hover { background: #C4622D; }
    .m-order-btn:disabled { opacity: 0.35; cursor: not-allowed; }

    .m-cancel-btn {
      width: 100%; padding: 11px;
      background: transparent; border: 1px solid rgba(15,15,14,0.12);
      border-radius: 2px; color: rgba(15,15,14,0.4);
      font-family: 'Jost', sans-serif; font-size: 10px; font-weight: 500;
      letter-spacing: 1px; text-transform: uppercase;
      cursor: pointer; outline: none; margin-top: 8px;
    }

    .m-modal {
      background: #F5EFE0; border: 1px solid rgba(15,15,14,0.08);
      border-radius: 8px; padding: 28px 24px;
      width: 100%; max-width: 360px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.2);
      animation: modalIn 0.3s cubic-bezier(0.34,1.56,0.64,1);
      position: relative;
    }
    @keyframes modalIn { from{opacity:0;transform:scale(0.92)} to{opacity:1;transform:scale(1)} }
    .m-modal-icon {
      text-align: center; font-size: 28px; color: rgba(15,15,14,0.2);
      margin-bottom: 10px; font-family: 'Cormorant Garamond', serif;
    }
    .m-modal-title {
      font-family: 'Cormorant Garamond', serif;
      font-size: 22px; font-weight: 500; color: #0F0F0E;
      text-align: center; margin-bottom: 4px;
    }
    .m-modal-sub {
      font-size: 9px; font-weight: 500; letter-spacing: 2px;
      text-transform: uppercase; color: rgba(196,98,45,0.5);
      text-align: center; margin-bottom: 18px;
    }

    /* ── STAMP ── */
    .m-stamp-overlay {
      position: absolute; inset: 0; z-index: 60;
      background: rgba(245,239,224,0.85);
      display: flex; align-items: center; justify-content: center;
      border-radius: inherit;
    }
    .m-stamp-box {
      border: 3px solid #C4622D; border-radius: 3px;
      padding: 14px 24px;
      display: flex; align-items: center; justify-content: center;
      background: #F5EFE0; transform: rotate(-5deg);
      animation: stampIn 0.35s cubic-bezier(0.34,1.56,0.64,1);
    }
    @keyframes stampIn {
      from{opacity:0;transform:rotate(-5deg) scale(0.2)}
      to{opacity:1;transform:rotate(-5deg) scale(1)}
    }
    .m-stamp-text {
      font-family: 'Cormorant Garamond', serif;
      font-size: 15px; font-weight: 700; color: #C4622D;
      letter-spacing: 3px; text-transform: uppercase;
    }
  `;
  document.head.appendChild(style);

  // ─── LANCEMENT ───────────────────────────────────────────
  const pages = buildPages();

  showCover(() => {
    buildBook(pages);
  });
}
