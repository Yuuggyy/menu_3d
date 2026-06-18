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

    // ── Fetch data ──
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
   MENU COMPLET EN VANILLA JS
   Seule dépendance : le DOM node #malamu-root
═══════════════════════════════════════════════════════════ */
function initMenu(categories, produits, createCommande, appelServeur) {
  const root = document.getElementById('malamu-root');
  if (!root) return;

  const ITEMS_PER_PAGE = 4;
  let cart = [];
  let lang = 'fr';

  const T = {
    fr: { title:'Malamu', sub:'Resto · Bar · Expériences', loading:'Chargement…', cartBtn:'Commande',
          bell:'Appeler', tableQ:'Numéro de table', tablePh:'Table 5, Bar, Terrasse…',
          send:'Appeler le serveur', cancel:'Annuler', bellOk:'🔔 Le serveur arrive !', errTable:'Indiquez votre table.',
          vide:'Votre panier est vide', total:'Total', tableLabel:'Table *', demLabel:'Demandes',
          demPh:'Allergies, sans sel…', commander:'Passer la commande', cmdOk:'✅ Commande envoyée !',
          swipe:'Glissez ou utilisez les flèches', add:'Ajouter', empty:'Aucun plat disponible' },
    en: { title:'Malamu', sub:'Resto · Bar · Experiences', loading:'Loading…', cartBtn:'Order',
          bell:'Call', tableQ:'Table number', tablePh:'Table 5, Bar, Terrace…',
          send:'Call waiter', cancel:'Cancel', bellOk:'🔔 Waiter on the way!', errTable:'Enter your table.',
          vide:'Your cart is empty', total:'Total', tableLabel:'Table *', demLabel:'Special requests',
          demPh:'Allergies, no salt…', commander:'Place order', cmdOk:'✅ Order sent!',
          swipe:'Swipe or use the arrows', add:'Add', empty:'No items available' },
  };

  // ── Construire les pages ──
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

  // ── Toast ──
  function toast(msg) {
    let t = document.getElementById('m-toast');
    if (!t) { t = document.createElement('div'); t.id = 'm-toast'; root.appendChild(t); }
    t.textContent = msg; t.className = 'm-toast show';
    clearTimeout(t._tid);
    t._tid = setTimeout(() => t.className = 'm-toast', 3200);
  }

  // ── Cart total ──
  function cartTotal() { return cart.reduce((s, i) => s + i.prix * i.qty, 0); }
  function cartCount() { return cart.reduce((s, i) => s + i.qty, 0); }

  function addToCart(prod) {
    const i = cart.findIndex(x => x.id === prod.id);
    if (i >= 0) cart[i].qty += 1;
    else cart.push({ id: prod.id, nom: prod.nom, prix: prod.prix, qty: 1 });
    updateCartBtn();
    toast(`✓ ${prod.nom}`);
  }

  function updateCartBtn() {
    const btn = document.getElementById('m-cart-btn');
    if (!btn) return;
    const n = cartCount();
    const L = T[lang];
    btn.className = 'm-hbtn' + (n > 0 ? ' active' : '');
    btn.innerHTML = `🛒 ${L.cartBtn}${n > 0 ? ` <span class="m-badge">${n}</span>` : ''}`;
  }

  // ── Panier sheet ──
  function openCart() {
    let sheet = document.getElementById('m-cart-sheet');
    if (sheet) sheet.remove();
    const L = T[lang];
    const overlay = document.createElement('div');
    overlay.className = 'm-overlay'; overlay.id = 'm-cart-overlay';

    let tableVal = '', demVal = '';

    function renderSheet() {
      const n = cartCount(); const tot = cartTotal();
      overlay.innerHTML = `
      <div class="m-sheet" id="m-cart-sheet" onclick="event.stopPropagation()">
        <div class="m-sheet-handle"><div></div></div>
        <div class="m-sheet-head">
          <div>
            <div class="m-sheet-title">🛒 ${L.cartBtn}</div>
            ${n > 0 ? `<div class="m-sheet-count">${n} article${n>1?'s':''}</div>` : ''}
          </div>
          <button class="m-close-btn" id="m-close-cart">✕</button>
        </div>
        <div class="m-sheet-body">
          ${cart.length === 0
            ? `<div class="m-empty"><div style="font-size:46px;margin-bottom:10px">🛒</div><p>${L.vide}</p></div>`
            : `
            ${cart.map((item, idx) => `
              <div class="m-cart-item">
                <div class="m-ci-info">
                  <div class="m-ci-name">${item.nom}</div>
                  <div class="m-ci-price">${item.prix.toFixed(2)} $</div>
                </div>
                <button class="m-qbtn" data-ci="${idx}" data-d="-1">−</button>
                <span class="m-qval">${item.qty}</span>
                <button class="m-qbtn plus" data-ci="${idx}" data-d="1">+</button>
                <div class="m-ci-sub">${(item.prix*item.qty).toFixed(2)} $</div>
                <button class="m-del-btn" data-ci="${idx}">🗑</button>
              </div>
            `).join('')}
            <div class="m-total-row">
              <span class="m-total-label">${L.total}</span>
              <span class="m-total-val">${tot.toFixed(2)} $</span>
            </div>
            <div class="m-form">
              <label class="m-flabel">${L.tableLabel}</label>
              <input class="m-finput" id="m-ptable" value="${tableVal}" placeholder="${L.tablePh}" />
              <label class="m-flabel" style="margin-top:10px">${L.demLabel}</label>
              <textarea class="m-finput" id="m-pdem" rows="2" style="resize:vertical;min-height:54px">${demVal}</textarea>
              <div id="m-perr" class="m-err"></div>
            </div>
          `}
        </div>
        ${cart.length > 0 ? `
        <div class="m-sheet-foot">
          <button class="m-order-btn" id="m-order-btn">✅ ${L.commander}</button>
        </div>` : ''}
      </div>`;

      // Events
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
          if (error) { errEl.textContent = '⚠ ' + error.message; btn.disabled=false; btn.textContent='✅ '+L.commander; return; }
          // Stamp
          const stamp = document.createElement('div');
          stamp.className = 'm-stamp-overlay';
          stamp.innerHTML = `<div class="m-stamp-box"><div style="font-size:38px">✅</div><div class="m-stamp-text">Envoyée</div></div>`;
          overlay.querySelector('.m-sheet').appendChild(stamp);
          setTimeout(() => { cart = []; updateCartBtn(); overlay.remove(); toast(L.cmdOk); }, 1400);
        };
      }
    }
    renderSheet();
    root.appendChild(overlay);
  }

  // ── Modal appel serveur ──
  function openBell() {
    let ol = document.getElementById('m-bell-ol');
    if (ol) ol.remove();
    const L = T[lang];
    const overlay = document.createElement('div');
    overlay.className = 'm-overlay modal'; overlay.id = 'm-bell-ol';
    overlay.innerHTML = `
      <div class="m-modal" onclick="event.stopPropagation()">
        <div style="text-align:center;font-size:42px;margin-bottom:8px">🔔</div>
        <div class="m-modal-title">${L.tableQ}</div>
        <div class="m-modal-sub">MALAMU · KINSHASA</div>
        <input class="m-finput" id="m-bell-table" placeholder="${L.tablePh}" autofocus />
        <div id="m-bell-err" class="m-err"></div>
        <button class="m-order-btn" id="m-bell-send" style="margin-top:12px">🔔 ${L.send}</button>
        <button class="m-cancel-btn" id="m-bell-cancel">${L.cancel}</button>
      </div>`;
    overlay.onclick = () => overlay.remove();
    overlay.querySelector('#m-bell-cancel').onclick = () => overlay.remove();
    overlay.querySelector('#m-bell-send').onclick = async () => {
      const tbl = overlay.querySelector('#m-bell-table').value.trim();
      const errEl = overlay.querySelector('#m-bell-err');
      if (!tbl) { errEl.textContent = '⚠ ' + L.errTable; return; }
      const btn = overlay.querySelector('#m-bell-send');
      btn.disabled=true; btn.textContent='…';
      await appelServeur(tbl);
      overlay.remove(); toast(L.bellOk);
    };
    root.appendChild(overlay);
    setTimeout(() => overlay.querySelector('#m-bell-table').focus(), 100);
  }

  // ══════════════════════════════════════════════════════
  //  LIVRE 3D — flip vanilla JS
  //  Technique : on crée la page animée dans le DOM,
  //  on toggle la class CSS, on écoute animationend
  // ══════════════════════════════════════════════════════
  function buildBook(pages) {
    const isMobile = window.innerWidth < 768;
    const totalSpreads = isMobile ? pages.length : Math.ceil(pages.length / 2);
    let spread = 0;
    let isFlipping = false;

    function pageHTML(page, side, pageNum, totalPgs) {
      if (!page) return `<div class="m-page-paper ${side}"><span class="m-ornament">✦</span></div>`;
      return `
        <div class="m-page-paper ${side}">
          <div class="m-page-header">
            <span class="m-cat-emoji">${page.cat.emoji || '🍽️'}</span>
            <span class="m-cat-name">${page.cat.nom}</span>
          </div>
          <div class="m-divider"><div class="m-dline l"></div><span class="m-ddot">✦</span><div class="m-dline r"></div></div>
          <div class="m-page-items">
            ${page.items.map(p => `
              <div class="m-item">
                <div class="m-item-img">
                  ${p.image_url
                    ? `<img src="${p.image_url}" alt="${p.nom}" loading="lazy" />`
                    : `<span>🍽️</span>`}
                </div>
                <div class="m-item-info">
                  <div class="m-item-name">${p.nom}</div>
                  ${p.description && !isMobile ? `<div class="m-item-desc">${p.description.length>44?p.description.slice(0,44)+'…':p.description}</div>` : ''}
                  <div class="m-item-price">${Number(p.prix).toFixed(2)}<sup> $</sup></div>
                </div>
                <div class="m-item-ctrl">
                  <div class="m-qty-row">
                    <button class="m-qb" data-id="${p.id}" data-d="-1">−</button>
                    <span class="m-qv" id="qv-${p.id}">0</span>
                    <button class="m-qb plus" data-id="${p.id}" data-d="1">+</button>
                  </div>
                  <button class="m-add-btn" id="add-${p.id}" data-id="${p.id}" data-nom="${p.nom}" data-prix="${p.prix}" style="display:none">+ ${T[lang].add}</button>
                </div>
              </div>
            `).join('')}
          </div>
          <div class="m-page-num ${side[0]}">${pageNum} / ${totalPgs}</div>
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
        <!-- HEADER -->
        <header class="m-header">
          <div class="m-brand">
            <div class="m-brand-name">${L.title}</div>
            <div class="m-brand-sub">${L.sub}</div>
          </div>
          <div class="m-header-actions">
            <button class="m-hbtn m-lang" id="m-lang-btn">${lang==='fr'?'🇬🇧 EN':'🇫🇷 FR'}</button>
            <button class="m-hbtn m-bell-btn" id="m-bell-btn">🔔</button>
            <button class="m-hbtn${cartCount()>0?' active':''}" id="m-cart-btn">
              🛒 ${L.cartBtn}${cartCount()>0?` <span class="m-badge">${cartCount()}</span>`:''}
            </button>
          </div>
        </header>

        <!-- LIVRE -->
        <main class="m-main">
          ${pages.length === 0
            ? `<div class="m-empty-state"><div style="font-size:44px;margin-bottom:12px">📖</div><p>${L.empty}</p></div>`
            : isMob
            ? `<!-- MOBILE : 1 page -->
              <div class="m-book-wrap" id="m-book-wrap">
                <div class="m-mob-page" id="m-mob-page">
                  ${pageHTML(mobPage, 'right', spread+1, pages.length)}
                </div>
              </div>
              <div class="m-nav" id="m-nav">
                <button class="m-nav-btn${spread<=0?' off':''}" id="m-prev">‹</button>
                <div class="m-dots">
                  ${Array.from({length:Math.min(pages.length,8)}).map((_,i)=>{
                    const a = pages.length<=8 ? i===spread : Math.round(i*(pages.length-1)/7)===spread;
                    return `<div class="m-dot${a?' on':''}"></div>`;
                  }).join('')}
                </div>
                <button class="m-nav-btn${spread>=pages.length-1?' off':''}" id="m-next">›</button>
              </div>`
            : `<!-- DESKTOP : double page -->
              <div class="m-book-scene">
                <div class="m-book-wrap" id="m-book-wrap">
                  <div class="m-book" id="m-book">
                    <div class="m-spine"></div>
                    <!-- Page gauche statique -->
                    <div class="m-static-page left" id="m-left">
                      ${pageHTML(leftPage, 'left', spread*2+1, pages.length)}
                    </div>
                    <!-- Page droite statique -->
                    <div class="m-static-page right" id="m-right">
                      ${pageHTML(rightPage, 'right', spread*2+2, pages.length)}
                    </div>
                    <!-- Tranche pages -->
                    <div class="m-edge"></div>
                    <!-- Page qui tourne (injectée dynamiquement par JS) -->
                  </div>
                </div>
              </div>
              <div class="m-nav" id="m-nav">
                <button class="m-nav-btn${spread<=0?' off':''}" id="m-prev">‹</button>
                <div class="m-dots">
                  ${Array.from({length:totalSpreads}).map((_,i)=>`<div class="m-dot${i===spread?' on':''}"></div>`).join('')}
                </div>
                <button class="m-nav-btn${spread>=totalSpreads-1?' off':''}" id="m-next">›</button>
              </div>
              <p class="m-hint">${L.swipe}</p>`
          }
        </main>
      </div>`;

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

      // Qty buttons
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

    // ── LE FLIP ──
    function flip(dir) {
      if (isFlipping) return;
      if (dir === 'next' && spread >= totalSpreads - 1) return;
      if (dir === 'prev' && spread <= 0) return;

      const isMob = window.innerWidth < 768;
      const next = dir === 'next' ? spread + 1 : spread - 1;

      if (isMob) {
        // Mobile : slide simple
        const page = document.getElementById('m-mob-page');
        if (!page) { spread = next; render(); return; }
        page.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
        page.style.opacity = '0';
        page.style.transform = dir === 'next' ? 'translateX(-30px)' : 'translateX(30px)';
        setTimeout(() => { spread = next; render(); }, 260);
        return;
      }

      // Desktop : vrai flip 3D livre
      isFlipping = true;
      const book = document.getElementById('m-book');
      if (!book) { spread = next; render(); isFlipping = false; return; }

      const leftEl  = document.getElementById('m-left');
      const rightEl = document.getElementById('m-right');

      // Pages du prochain spread (derrière)
      const nextLeft  = pages[next*2]   || null;
      const nextRight = pages[next*2+1] || null;

      // Préparer les pages derrière AVANT le flip
      if (dir === 'next') {
        // On va voir le nouveau spread : left = nextLeft, right = nextRight
        // La page droite actuelle pivote vers la gauche
        // Derrière elle : nextLeft (nouvelle page gauche)
        // La page gauche devient nextLeft à la fin
        leftEl.innerHTML  = pageHTML(nextLeft,  'left',  next*2+1, pages.length);
        // rightEl reste visible jusqu'au flip
      } else {
        // La page gauche actuelle pivote vers la droite
        // Derrière elle : nextRight
        rightEl.innerHTML = pageHTML(nextRight, 'right', next*2+2, pages.length);
      }

      // Créer la page qui tourne
      const flipPage = document.createElement('div');
      flipPage.className = `m-flip dir-${dir}`;
      flipPage.id = 'm-flip-page';

      // Face avant = page qui part
      const front = document.createElement('div');
      front.className = 'm-flip-face front';

      // Face arrière = page qui arrive (vue en miroir)
      const back = document.createElement('div');
      back.className = 'm-flip-face back';

      if (dir === 'next') {
        // Avant = page droite actuelle (celle qui "part")
        const curRight = pages[spread*2+1] || null;
        front.innerHTML = pageHTML(curRight, 'right', spread*2+2, pages.length);
        // Arrière = nouvelle page gauche
        back.innerHTML  = pageHTML(nextLeft, 'left', next*2+1, pages.length);
        // Cacher la page droite statique (elle est maintenant sur la flip page)
        rightEl.style.visibility = 'hidden';
      } else {
        // Avant = page gauche actuelle (celle qui "part")
        const curLeft = pages[spread*2] || null;
        front.innerHTML = pageHTML(curLeft, 'left', spread*2+1, pages.length);
        // Arrière = nouvelle page droite
        back.innerHTML  = pageHTML(nextRight, 'right', next*2+2, pages.length);
        // Cacher la page gauche statique
        leftEl.style.visibility = 'hidden';
      }

      flipPage.appendChild(front);
      flipPage.appendChild(back);
      book.appendChild(flipPage);

      // Attacher les qty events sur la flip page
      // (pas nécessaire ici, on re-render à la fin)

      // Forcer un reflow pour que la transition CSS parte du bon état
      flipPage.getBoundingClientRect();

      // Lancer l'animation
      flipPage.classList.add('go');

      // Fin de l'animation
      flipPage.addEventListener('animationend', () => {
        spread = next;
        isFlipping = false;
        render();
      }, { once: true });
    }

    render();
  }

  // ── CSS global injecté ──
  const style = document.createElement('style');
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;0,700;0,800;1,500&family=Inter:wght@300;400;500;600;700&display=swap');

    #malamu-root, #m-app { position:fixed; inset:0; overflow:hidden; }
    #m-app { display:flex; flex-direction:column; background:#0D0C0B; color:#F0EBE3; font-family:'Inter',sans-serif; }

    /* ── HEADER ── */
    .m-header {
      height:60px; flex-shrink:0;
      background:rgba(13,12,11,0.96);
      backdrop-filter:blur(20px); -webkit-backdrop-filter:blur(20px);
      border-bottom:1px solid rgba(196,98,45,0.15);
      display:flex; align-items:center; justify-content:space-between;
      padding:0 18px; z-index:50;
    }
    .m-brand-name {
      font-family:'Playfair Display',serif; font-size:22px; font-weight:600; font-style:italic;
      color:#F0EBE3; line-height:1; letter-spacing:0.5px;
    }
    .m-brand-sub {
      font-family:'Inter',sans-serif; font-size:7.5px; font-weight:600;
      color:rgba(196,98,45,0.6); letter-spacing:2.5px; text-transform:uppercase; margin-top:2px;
    }
    .m-header-actions { display:flex; align-items:center; gap:8px; }
    .m-hbtn {
      display:flex; align-items:center; gap:5px;
      padding:7px 13px; border-radius:20px;
      border:1px solid rgba(196,98,45,0.3); background:rgba(196,98,45,0.06);
      color:rgba(232,147,106,0.85); font-family:'Inter',sans-serif; font-size:12px; font-weight:600;
      cursor:pointer; outline:none; white-space:nowrap; touch-action:manipulation;
      transition:all 0.2s;
    }
    .m-hbtn:hover,.m-hbtn:active { background:rgba(196,98,45,0.14); border-color:rgba(196,98,45,0.5); color:#F0EBE3; }
    .m-hbtn.active { background:linear-gradient(135deg,#C4622D,#D4724A); border-color:transparent; color:#fff; box-shadow:0 3px 14px rgba(196,98,45,0.4); }
    .m-badge { background:rgba(255,255,255,0.25); border-radius:50%; width:18px; height:18px; display:flex; align-items:center; justify-content:center; font-size:9px; font-weight:800; }

    /* ── MAIN ── */
    .m-main { flex:1; overflow:hidden; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:20px 16px 16px; }

    /* ── LIVRE SCENE ── */
    .m-book-scene { width:100%; display:flex; flex-direction:column; align-items:center; }
    .m-book-wrap { width:100%; max-width:860px; perspective:2200px; }
    .m-book {
      display:flex; position:relative;
      height:clamp(340px,52vh,540px);
      border-radius:5px 14px 14px 5px;
      box-shadow:0 40px 100px rgba(0,0,0,0.9), 0 10px 28px rgba(0,0,0,0.6);
      transform-style:preserve-3d;
    }

    /* Reliure */
    .m-spine {
      position:absolute; left:50%; top:0; bottom:0; width:14px;
      transform:translateX(-50%);
      background:linear-gradient(to right,#080503,#3A1A08,#080503);
      z-index:25; box-shadow:0 0 20px rgba(0,0,0,0.7);
    }

    /* Tranche */
    .m-edge {
      position:absolute; right:-7px; top:3px; bottom:3px; width:7px;
      background:repeating-linear-gradient(to bottom,#F5EFE0 0,#F5EFE0 2px,#DDD0B8 2px,#DDD0B8 4px);
      border-radius:0 2px 2px 0; box-shadow:4px 0 10px rgba(0,0,0,0.35);
    }

    /* Pages statiques */
    .m-static-page { flex:1; overflow:hidden; position:relative; }
    .m-static-page.left  { border-radius:5px 0 0 5px; }
    .m-static-page.right { border-radius:0 10px 10px 0; }

    /* ─── PAGE PAPER ─── */
    .m-page-paper {
      width:100%; height:100%; display:flex; flex-direction:column;
      padding:clamp(10px,2vh,20px) clamp(8px,1.5vw,16px);
      overflow:hidden; position:relative;
    }
    .m-page-paper.left  { background:linear-gradient(to left,#DACEBC,#F5EFE0); box-shadow:inset -8px 0 22px rgba(0,0,0,0.13); }
    .m-page-paper.right { background:linear-gradient(to right,#DACEBC,#F5EFE0); box-shadow:inset 8px 0 22px rgba(0,0,0,0.13); }
    .m-page-paper::after {
      content:''; position:absolute; inset:0; pointer-events:none;
      background-image:repeating-linear-gradient(transparent,transparent 27px,rgba(42,26,14,0.055) 27px,rgba(42,26,14,0.055) 28px);
      background-position-y:54px;
    }

    .m-page-header { display:flex; align-items:center; gap:7px; margin-bottom:3px; padding-bottom:7px; border-bottom:1.5px solid rgba(196,98,45,0.2); flex-shrink:0; position:relative; z-index:1; }
    .m-cat-emoji { font-size:clamp(12px,2vw,16px); }
    .m-cat-name  { font-family:'Playfair Display',serif; font-size:clamp(11px,1.8vw,15px); font-weight:700; color:#C4622D; }

    .m-divider { display:flex; align-items:center; gap:6px; margin:3px 0 5px; flex-shrink:0; position:relative; z-index:1; }
    .m-dline { flex:1; height:1px; }
    .m-dline.l { background:linear-gradient(to right,transparent,rgba(196,98,45,0.3)); }
    .m-dline.r { background:linear-gradient(to left,transparent,rgba(196,98,45,0.3)); }
    .m-ddot { color:rgba(196,98,45,0.4); font-size:7px; }

    .m-page-items { flex:1; overflow:hidden; position:relative; z-index:1; }
    .m-ornament { color:rgba(42,26,14,0.1); font-size:40px; }

    .m-item { display:flex; gap:7px; align-items:center; padding:clamp(5px,1vh,9px) 2px; border-bottom:1px solid rgba(42,26,14,0.1); }
    .m-item-img { width:clamp(36px,5.5vw,50px); height:clamp(36px,5.5vw,50px); border-radius:7px; overflow:hidden; flex-shrink:0; background:rgba(42,26,14,0.08); display:flex; align-items:center; justify-content:center; border:1px solid rgba(196,98,45,0.12); }
    .m-item-img img { width:100%; height:100%; object-fit:cover; }
    .m-item-img span { font-size:18px; }
    .m-item-info { flex:1; min-width:0; }
    .m-item-name  { font-family:'Playfair Display',serif; font-size:clamp(10px,1.4vw,13px); font-weight:700; color:#1A1008; line-height:1.3; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .m-item-desc  { font-family:'Inter',sans-serif; font-size:clamp(8px,1vw,10px); color:#7A5A3A; line-height:1.3; font-style:italic; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .m-item-price { font-family:'Playfair Display',serif; font-size:clamp(12px,1.7vw,15px); font-weight:700; color:#C4622D; }
    .m-item-price sup { font-size:0.6em; font-weight:400; }

    .m-item-ctrl { display:flex; flex-direction:column; align-items:center; gap:3px; flex-shrink:0; }
    .m-qty-row { display:flex; align-items:center; gap:4px; }
    .m-qb { width:clamp(20px,3vw,24px); height:clamp(20px,3vw,24px); border-radius:50%; border:1.5px solid #C4622D; background:transparent; color:#C4622D; font-size:14px; font-weight:700; cursor:pointer; display:flex; align-items:center; justify-content:center; touch-action:manipulation; outline:none; transition:transform 0.12s; }
    .m-qb.plus { background:linear-gradient(135deg,#C4622D,#D4724A); border:none; color:#fff; box-shadow:0 2px 8px rgba(196,98,45,0.35); }
    .m-qb:hover { transform:scale(1.1); }
    .m-qv { font-size:11px; font-weight:700; color:#1A1008; min-width:14px; text-align:center; }
    .m-add-btn { background:linear-gradient(135deg,#C4622D,#D4724A); color:#fff; border:none; border-radius:5px; padding:2px 7px; font-size:9px; font-weight:700; cursor:pointer; white-space:nowrap; touch-action:manipulation; box-shadow:0 2px 6px rgba(196,98,45,0.4); outline:none; }

    .m-page-num { font-family:'Playfair Display',serif; font-size:9px; color:rgba(42,26,14,0.28); font-style:italic; margin-top:4px; position:relative; z-index:1; }
    .m-page-num.l { text-align:left; }
    .m-page-num.r { text-align:right; }

    /* ─────────────────────────────────────────
       LA PAGE QUI TOURNE — flip 3D vrai livre
       0.85s, cubic-bezier physique
    ───────────────────────────────────────── */
    .m-flip {
      position:absolute; top:0; bottom:0;
      transform-style:preserve-3d;
      z-index:20; pointer-events:none;
    }
    .m-flip.dir-next { left:50%; right:0; transform-origin:left center; }
    .m-flip.dir-prev { left:0; right:50%; transform-origin:right center; }

    .m-flip.dir-next.go { animation:mFlipNext 0.85s cubic-bezier(0.23,1,0.32,1) forwards; }
    .m-flip.dir-prev.go { animation:mFlipPrev 0.85s cubic-bezier(0.23,1,0.32,1) forwards; }

    @keyframes mFlipNext {
      0%   { transform:rotateY(0deg);     box-shadow: 0 0 0 rgba(0,0,0,0); }
      30%  { transform:rotateY(-60deg);   box-shadow:-20px 0 40px rgba(0,0,0,0.4); }
      70%  { transform:rotateY(-140deg);  box-shadow:-8px 0 20px rgba(0,0,0,0.25); }
      100% { transform:rotateY(-180deg);  box-shadow: 0 0 0 rgba(0,0,0,0); }
    }
    @keyframes mFlipPrev {
      0%   { transform:rotateY(0deg);    box-shadow:0 0 0 rgba(0,0,0,0); }
      30%  { transform:rotateY(60deg);   box-shadow:20px 0 40px rgba(0,0,0,0.4); }
      70%  { transform:rotateY(140deg);  box-shadow:8px 0 20px rgba(0,0,0,0.25); }
      100% { transform:rotateY(180deg);  box-shadow:0 0 0 rgba(0,0,0,0); }
    }

    .m-flip-face {
      position:absolute; inset:0;
      backface-visibility:hidden; -webkit-backface-visibility:hidden;
      overflow:hidden;
    }
    .m-flip-face.back { transform:rotateY(180deg) scaleX(-1); }

    /* ── MOBILE PAGE ── */
    .m-mob-page {
      width:100%; min-height:calc(100dvh - 200px);
      border-radius:12px; overflow:hidden;
      box-shadow:0 20px 50px rgba(0,0,0,0.7), 5px 0 0 #C8BAA0, 9px 0 0 #B8AA90;
    }
    .m-mob-page .m-page-paper { min-height:inherit; }

    /* ── NAV ── */
    .m-nav { display:flex; align-items:center; gap:16px; margin-top:16px; }
    .m-nav-btn {
      width:46px; height:46px; border-radius:50%; border:none; font-size:22px;
      background:linear-gradient(135deg,#C4622D,#D4724A); color:#fff;
      display:flex; align-items:center; justify-content:center;
      cursor:pointer; outline:none; touch-action:manipulation;
      box-shadow:0 5px 18px rgba(196,98,45,0.45); transition:transform 0.2s;
    }
    .m-nav-btn:hover { transform:scale(1.08); }
    .m-nav-btn.off { background:rgba(255,255,255,0.05); color:rgba(255,255,255,0.12); cursor:not-allowed; box-shadow:none; transform:none; }
    .m-dots { display:flex; gap:7px; align-items:center; }
    .m-dot { height:7px; border-radius:4px; background:rgba(196,98,45,0.2); transition:all 0.3s; width:7px; cursor:pointer; }
    .m-dot.on { width:24px; background:#C4622D; }
    .m-hint { font-family:'Playfair Display',serif; font-size:11px; font-style:italic; color:rgba(196,98,45,0.3); margin-top:8px; }
    .m-empty-state { text-align:center; color:rgba(240,235,227,0.25); font-family:'Playfair Display',serif; font-size:16px; font-style:italic; }

    /* ── TOAST ── */
    .m-toast {
      position:fixed; bottom:28px; left:50%; transform:translateX(-50%) translateY(20px);
      background:rgba(18,16,14,0.97); border:1px solid rgba(196,98,45,0.4);
      color:#F0EBE3; padding:11px 22px; border-radius:40px;
      font-family:'Inter',sans-serif; font-size:13px; font-weight:500;
      z-index:9999; pointer-events:none; opacity:0;
      box-shadow:0 8px 28px rgba(0,0,0,0.55); white-space:nowrap;
      transition:opacity 0.3s, transform 0.3s;
    }
    .m-toast.show { opacity:1; transform:translateX(-50%) translateY(0); }

    /* ── OVERLAY / SHEET / MODAL ── */
    .m-overlay {
      position:fixed; inset:0; z-index:500;
      background:rgba(0,0,0,0.88);
      backdrop-filter:blur(16px); -webkit-backdrop-filter:blur(16px);
      display:flex; align-items:flex-end; justify-content:center;
    }
    .m-sheet {
      background:#161412; border-top:1px solid rgba(196,98,45,0.18);
      border-radius:22px 22px 0 0; width:100%; max-width:520px; max-height:92dvh;
      display:flex; flex-direction:column; overflow:hidden;
      animation:sheetUp 0.38s cubic-bezier(0.34,1.56,0.64,1);
    }
    @keyframes sheetUp { from{transform:translateY(100%);opacity:0} to{transform:translateY(0);opacity:1} }
    .m-sheet-handle { padding:12px 0 0; display:flex; justify-content:center; flex-shrink:0; }
    .m-sheet-handle div { width:36px; height:4px; border-radius:2px; background:rgba(196,98,45,0.2); }
    .m-sheet-head { display:flex; justify-content:space-between; align-items:center; padding:8px 20px 12px; border-bottom:1px solid rgba(196,98,45,0.1); flex-shrink:0; }
    .m-sheet-title { font-family:'Playfair Display',serif; font-size:20px; font-weight:600; color:#F0EBE3; }
    .m-sheet-count { font-family:'Inter',sans-serif; font-size:11px; color:rgba(196,98,45,0.5); margin-top:1px; }
    .m-close-btn { width:32px; height:32px; border-radius:50%; border:1px solid rgba(196,98,45,0.2); background:rgba(196,98,45,0.06); color:rgba(240,235,227,0.45); font-size:15px; cursor:pointer; display:flex; align-items:center; justify-content:center; outline:none; touch-action:manipulation; }
    .m-sheet-body { flex:1; overflow-y:auto; padding:14px 20px; }
    .m-sheet-foot { padding:12px 20px 24px; border-top:1px solid rgba(196,98,45,0.08); flex-shrink:0; }
    .m-empty { text-align:center; padding:50px 0; color:rgba(240,235,227,0.18); }
    .m-empty p { font-family:'Playfair Display',serif; font-size:15px; font-style:italic; }

    .m-cart-item { display:flex; align-items:center; gap:9px; padding:10px 0; border-bottom:1px solid rgba(255,255,255,0.05); }
    .m-ci-info { flex:1; min-width:0; }
    .m-ci-name { font-family:'Playfair Display',serif; font-size:14px; font-weight:600; color:#F0EBE3; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .m-ci-price { font-family:'Playfair Display',serif; font-size:12px; color:#C4622D; }
    .m-ci-sub { font-family:'Playfair Display',serif; font-size:13px; font-weight:700; color:#F0EBE3; min-width:52px; text-align:right; }
    .m-del-btn { background:none; border:none; color:rgba(255,100,100,0.4); cursor:pointer; font-size:14px; padding:0 2px; outline:none; touch-action:manipulation; }
    .m-qbtn { width:27px; height:27px; border-radius:50%; border:1px solid rgba(196,98,45,0.3); background:transparent; color:#E8936A; font-size:14px; font-weight:700; cursor:pointer; display:flex; align-items:center; justify-content:center; outline:none; touch-action:manipulation; }
    .m-qbtn.plus { background:linear-gradient(135deg,#C4622D,#D4724A); border:none; color:#fff; box-shadow:0 2px 6px rgba(196,98,45,0.3); }

    .m-total-row { display:flex; justify-content:space-between; align-items:center; padding:12px 0; border-top:1px solid rgba(196,98,45,0.2); margin-top:2px; }
    .m-total-label { font-family:'Playfair Display',serif; font-size:15px; font-weight:600; color:rgba(240,235,227,0.6); }
    .m-total-val   { font-family:'Playfair Display',serif; font-size:21px; font-weight:700; color:#C4622D; }

    .m-form { margin-top:14px; display:flex; flex-direction:column; gap:10px; }
    .m-flabel { font-family:'Inter',sans-serif; font-size:9px; font-weight:700; color:rgba(196,98,45,0.6); letter-spacing:1.5px; text-transform:uppercase; }
    .m-finput { width:100%; padding:11px 14px; background:rgba(255,255,255,0.04); border:1px solid rgba(196,98,45,0.2); border-radius:9px; color:#F0EBE3; font-family:'Inter',sans-serif; font-size:13px; outline:none; transition:border 0.2s; box-sizing:border-box; }
    .m-finput:focus { border-color:#C4622D; }
    .m-finput::placeholder { color:rgba(240,235,227,0.18); }
    .m-err { color:#ff7675; font-size:11.5px; }

    .m-order-btn { width:100%; padding:14px; background:linear-gradient(135deg,#C4622D,#D4724A); border:none; border-radius:13px; color:#FAF7F2; font-family:'Inter',sans-serif; font-size:14px; font-weight:700; cursor:pointer; outline:none; box-shadow:0 5px 18px rgba(196,98,45,0.4); transition:transform 0.15s; touch-action:manipulation; }
    .m-order-btn:hover { transform:translateY(-1px); }
    .m-order-btn:disabled { opacity:0.5; cursor:not-allowed; transform:none; }
    .m-cancel-btn { width:100%; padding:12px; background:transparent; border:1px solid rgba(196,98,45,0.22); border-radius:11px; color:rgba(232,147,106,0.65); font-family:'Inter',sans-serif; font-size:13px; font-weight:600; cursor:pointer; outline:none; margin-top:8px; transition:all 0.2s; touch-action:manipulation; }
    .m-cancel-btn:hover { background:rgba(196,98,45,0.07); }

    /* Stamp */
    .m-stamp-overlay { position:absolute; inset:0; z-index:60; background:rgba(10,9,8,0.6); display:flex; align-items:center; justify-content:center; }
    .m-stamp-box { border:5px solid #C4622D; border-radius:8px; padding:22px 30px; display:flex; flex-direction:column; align-items:center; gap:7px; background:rgba(13,12,11,0.9); transform:rotate(-7deg); animation:stampIn 0.45s cubic-bezier(0.34,1.56,0.64,1); }
    @keyframes stampIn { from{opacity:0;transform:rotate(-7deg) scale(0.2)} to{opacity:1;transform:rotate(-7deg) scale(1)} }
    .m-stamp-text { font-family:'Playfair Display',serif; font-size:17px; font-weight:700; color:#C4622D; letter-spacing:2px; text-transform:uppercase; }

    /* Modal */
    .m-overlay.modal { align-items:center; padding:20px; }
    .m-modal { background:#1A1815; border:1px solid rgba(196,98,45,0.22); border-radius:18px; padding:28px 24px; width:100%; max-width:400px; box-shadow:0 28px 60px rgba(0,0,0,0.8); animation:modalIn 0.3s cubic-bezier(0.34,1.56,0.64,1); }
    @keyframes modalIn { from{opacity:0;transform:scale(0.88) translateY(16px)} to{opacity:1;transform:scale(1) translateY(0)} }
    .m-modal-title { font-family:'Playfair Display',serif; font-size:20px; font-weight:600; color:#F0EBE3; text-align:center; margin-bottom:3px; }
    .m-modal-sub   { font-family:'Inter',sans-serif; font-size:10px; color:rgba(196,98,45,0.55); text-align:center; letter-spacing:1px; margin-bottom:18px; }
  `;
  document.head.appendChild(style);

  const pages = buildPages();
  buildBook(pages);
}
