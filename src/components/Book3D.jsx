import { useState, useRef, useCallback, useEffect } from 'react';

/* ─────────────────────────────────────────
   BOOK3D — flip animé en CSS pur
   Technique : on toggle une class CSS sur un élément DOM réel
   via useRef pour éviter tout re-render React pendant l'animation.
   C'est la seule façon de garantir que backface-visibility fonctionne.
───────────────────────────────────────── */

const ITEMS_PER_SPREAD = 4; // produits par demi-page

/* ── Styles injectés une seule fois ── */
const BOOK_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;0,800;1,500;1,600&family=Inter:wght@300;400;500;600&display=swap');

/* ── Variables ── */
:root {
  --terra:    #C4622D;
  --terra2:   #D4724A;
  --terra3:   #E8936A;
  --cream:    #F5EFE0;
  --cream2:   #EDE5CF;
  --cream3:   #E0D4BA;
  --ink:      #2A1A0E;
  --ink2:     #1A1008;
  --dark:     #0D0C0B;
  --dark2:    #161412;
  --dark3:    #1F1C19;
}

/* ── COUVERTURE ── */
.cover-scene {
  position: fixed; inset: 0; z-index: 200;
  display: flex; align-items: center; justify-content: center;
  background: radial-gradient(ellipse at 30% 20%, #1C1208 0%, #0D0C0B 70%);
  perspective: 1200px;
}
.cover-book {
  width: min(75vw, 300px);
  height: min(72vh, 430px);
  position: relative;
  transform-origin: left center;
  transform-style: preserve-3d;
  cursor: pointer;
  animation: coverFloat 5s ease-in-out infinite;
  filter: drop-shadow(0 40px 60px rgba(0,0,0,0.9));
  transition: filter 0.3s;
}
.cover-book:hover {
  filter: drop-shadow(0 40px 60px rgba(0,0,0,0.9)) drop-shadow(0 0 40px rgba(196,98,45,0.25));
}
@keyframes coverFloat {
  0%, 100% { transform: translateY(0) rotateY(-3deg); }
  50%       { transform: translateY(-8px) rotateY(-1deg); }
}
.cover-book.is-opening {
  animation: coverOpen 0.85s cubic-bezier(0.7, 0, 0.2, 1) forwards !important;
}
@keyframes coverOpen {
  0%   { transform: translateY(0) rotateY(-3deg); }
  40%  { transform: translateY(-10px) rotateY(-95deg); }
  100% { transform: translateY(-5px) rotateY(-130deg) translateZ(20px); opacity: 0; }
}
.cover-front {
  position: absolute; inset: 0;
  border-radius: 4px 14px 14px 4px;
  background: linear-gradient(155deg, #1E1309 0%, #2D1A0A 50%, #160E06 100%);
  border: 1px solid rgba(196,98,45,0.4);
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 8% 7%; gap: 10px;
  overflow: hidden;
}
.cover-spine {
  position: absolute; left: 0; top: 0; bottom: 0; width: 22px;
  background: linear-gradient(to right, #060403, #1A1005, #060403);
  border-radius: 4px 0 0 4px;
  border-right: 1px solid rgba(196,98,45,0.2);
}
.cover-pages {
  position: absolute; right: -7px; top: 4px; bottom: 4px; width: 7px;
  background: repeating-linear-gradient(
    to bottom,
    var(--cream) 0, var(--cream) 2px,
    var(--cream3) 2px, var(--cream3) 4px
  );
  border-radius: 0 2px 2px 0;
  box-shadow: 3px 0 10px rgba(0,0,0,0.4);
}
.cover-line-top {
  position: absolute; top: 18px; left: 30px; right: 14px; height: 1px;
  background: linear-gradient(to right, rgba(196,98,45,0.55), transparent);
}
.cover-line-bot {
  position: absolute; bottom: 18px; left: 30px; right: 14px; height: 1px;
  background: linear-gradient(to right, rgba(196,98,45,0.4), transparent);
}
.cover-texture {
  position: absolute; inset: 0; pointer-events: none;
  background-image: repeating-linear-gradient(
    42deg, transparent, transparent 20px,
    rgba(196,98,45,0.012) 20px, rgba(196,98,45,0.012) 21px
  );
}
.cover-logo-circle {
  width: min(20vw, 78px); height: min(20vw, 78px);
  border-radius: 50%;
  background: radial-gradient(circle at 38% 32%, #D4724A, #8B3A18 60%, #C4622D);
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 0 30px rgba(196,98,45,0.4), inset 0 1px 0 rgba(255,255,255,0.08);
  position: relative; flex-shrink: 0;
}
.cover-logo-ring {
  position: absolute; inset: -10px;
  border: 1px solid rgba(196,98,45,0.25); border-radius: 50%;
}
.cover-logo-text {
  font-family: 'Playfair Display', serif;
  font-size: min(5.5vw, 21px); font-weight: 500; font-style: italic;
  color: rgba(250,240,224,0.95);
  letter-spacing: -0.3px;
}
.cover-title {
  font-family: 'Playfair Display', serif;
  font-size: min(8.5vw, 32px); font-weight: 800;
  letter-spacing: 5px; text-transform: uppercase;
  margin: 0; text-align: center; line-height: 1;
  background: linear-gradient(90deg, #C4622D 0%, #E8936A 30%, #FDF0E8 50%, #E8936A 70%, #C4622D 100%);
  background-size: 300% auto;
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  animation: shimmer 5s linear infinite;
}
@keyframes shimmer {
  from { background-position: -300% center; }
  to   { background-position:  300% center; }
}
.cover-divider {
  display: flex; align-items: center; gap: 7px; width: 70%;
}
.cover-divider-line {
  flex: 1; height: 1px;
}
.cover-divider-line.l { background: linear-gradient(to right, transparent, rgba(196,98,45,0.4)); }
.cover-divider-line.r { background: linear-gradient(to left,  transparent, rgba(196,98,45,0.4)); }
.cover-diamond { color: rgba(196,98,45,0.5); font-size: 8px; letter-spacing: 2px; }
.cover-sub {
  font-family: 'Playfair Display', serif;
  font-size: min(3.5vw, 10.5px); font-style: italic;
  color: rgba(232,147,106,0.5); letter-spacing: 2.5px;
  text-transform: uppercase; margin: 0; text-align: center;
}
.cover-cta {
  position: absolute; bottom: 8%;
  padding: 5px 18px; border-radius: 20px;
  border: 1px solid rgba(196,98,45,0.35);
  background: rgba(196,98,45,0.06);
  font-family: 'Inter', sans-serif;
  font-size: min(3vw, 10px); letter-spacing: 2px;
  color: rgba(232,147,106,0.65); text-transform: uppercase;
  white-space: nowrap;
  animation: ctaFadeIn 0.8s ease 0.8s both;
}
@keyframes ctaFadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ────────────────────────────────────────
   LIVRE — wrapper principal
──────────────────────────────────────── */
.book-scene {
  width: 100%;
  display: flex; flex-direction: column; align-items: center; gap: 22px;
}
.book-wrapper {
  width: 100%; max-width: 860px;
  perspective: 2500px;
  user-select: none; -webkit-user-select: none;
}
.book-inner {
  display: flex;
  height: clamp(360px, 55vh, 560px);
  position: relative;
  border-radius: 6px 16px 16px 6px;
  box-shadow:
    0 40px 100px rgba(0,0,0,0.9),
    0 12px 30px rgba(0,0,0,0.6),
    inset 0 1px 0 rgba(255,255,255,0.03);
  transform-style: preserve-3d;
  overflow: visible;
}

/* ── Ombre sous le livre ── */
.book-shadow {
  position: absolute; bottom: -16px; left: 5%; right: 5%; height: 16px;
  background: radial-gradient(ellipse, rgba(0,0,0,0.55), transparent 70%);
  filter: blur(8px); z-index: -1;
}

/* ── Reliure ── */
.book-spine {
  position: absolute; left: 50%; top: 0; bottom: 0; width: 14px;
  transform: translateX(-50%);
  background: linear-gradient(to right, #0A0704, #3A1A08, #0A0704);
  z-index: 30; box-shadow: 0 0 24px rgba(0,0,0,0.8);
}

/* ── Tranche pages ── */
.book-page-edge {
  position: absolute; right: -8px; top: 3px; bottom: 3px; width: 8px;
  background: repeating-linear-gradient(
    to bottom, var(--cream) 0, var(--cream) 2px, var(--cream3) 2px, var(--cream3) 4px
  );
  border-radius: 0 2px 2px 0;
  box-shadow: 4px 0 10px rgba(0,0,0,0.35);
}

/* ── Pages statiques ── */
.book-page {
  flex: 1; overflow: hidden;
  position: relative;
}
.book-page.left  { border-radius: 6px 0 0 6px; }
.book-page.right { border-radius: 0 10px 10px 0; }
.book-page.hidden { opacity: 0; }

/* Contenu d'une page */
.page-paper {
  width: 100%; height: 100%;
  display: flex; flex-direction: column;
  padding: clamp(10px, 2vh, 20px) clamp(8px, 1.5vw, 16px);
  overflow: hidden;
  position: relative;
}
.page-paper.left  { background: linear-gradient(to left,  #E0D4BA, #F5EFE0); }
.page-paper.right { background: linear-gradient(to right, #E0D4BA, #F5EFE0); }

/* Ombres intérieures pour relief */
.page-paper.left  { box-shadow: inset -8px 0 20px rgba(0,0,0,0.12); }
.page-paper.right { box-shadow: inset  8px 0 20px rgba(0,0,0,0.12); }

/* Lignes papier */
.page-paper::after {
  content: '';
  position: absolute; inset: 0; pointer-events: none;
  background-image: repeating-linear-gradient(
    transparent, transparent 27px,
    rgba(42,26,14,0.055) 27px, rgba(42,26,14,0.055) 28px
  );
  background-position-y: 55px;
}

.page-header {
  display: flex; align-items: center; gap: 8px;
  margin-bottom: 4px; padding-bottom: 8px;
  border-bottom: 1.5px solid rgba(196,98,45,0.2);
  flex-shrink: 0; position: relative; z-index: 1;
}
.page-cat-emoji { font-size: clamp(13px, 2vw, 17px); }
.page-cat-name {
  font-family: 'Playfair Display', serif;
  font-size: clamp(12px, 2vw, 16px); font-weight: 700;
  color: #C4622D; letter-spacing: 0.3px;
}
.page-divider {
  display: flex; align-items: center; gap: 6px; margin: 4px 0 6px;
  flex-shrink: 0; position: relative; z-index: 1;
}
.page-divider-line { flex: 1; height: 1px; }
.page-divider-line.l { background: linear-gradient(to right, transparent, rgba(196,98,45,0.3)); }
.page-divider-line.r { background: linear-gradient(to left,  transparent, rgba(196,98,45,0.3)); }
.page-divider-dot { color: rgba(196,98,45,0.4); font-size: 7px; }

.page-items { flex: 1; overflow: hidden; position: relative; z-index: 1; }

.page-item {
  display: flex; gap: 7px; align-items: center;
  padding: clamp(5px, 1vh, 9px) 0;
  border-bottom: 1px solid rgba(42,26,14,0.12);
  transition: background 0.2s;
  border-radius: 4px;
}
.page-item:hover { background: rgba(196,98,45,0.06); }

.item-img {
  width: clamp(38px, 6vw, 52px); height: clamp(38px, 6vw, 52px);
  border-radius: 7px; overflow: hidden; flex-shrink: 0;
  background: rgba(42,26,14,0.1);
  display: flex; align-items: center; justify-content: center;
  border: 1px solid rgba(196,98,45,0.15);
}
.item-img img { width: 100%; height: 100%; object-fit: cover; }
.item-img .item-emoji { font-size: 20px; }

.item-info { flex: 1; min-width: 0; }
.item-name {
  font-family: 'Playfair Display', serif;
  font-size: clamp(11px, 1.5vw, 13px); font-weight: 700;
  color: #1A1008; line-height: 1.3; margin-bottom: 1px;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.item-desc {
  font-family: 'Inter', sans-serif;
  font-size: clamp(9px, 1.1vw, 11px); color: #7A5A3A;
  line-height: 1.3; font-style: italic;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.item-price {
  font-family: 'Playfair Display', serif;
  font-size: clamp(13px, 1.8vw, 15px); font-weight: 700;
  color: #C4622D;
}
.item-price sup { font-size: 0.6em; font-weight: 400; }

.item-controls { display: flex; flex-direction: column; align-items: center; gap: 4px; flex-shrink: 0; }
.qty-row { display: flex; align-items: center; gap: 4px; }
.qty-btn {
  width: clamp(20px, 3vw, 24px); height: clamp(20px, 3vw, 24px);
  border-radius: 50%; border: 1.5px solid #C4622D;
  background: transparent; color: #C4622D;
  font-size: 14px; font-weight: 700;
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  transition: all 0.15s; touch-action: manipulation;
}
.qty-btn.plus {
  background: linear-gradient(135deg, #C4622D, #D4724A);
  border-color: transparent; color: white;
  box-shadow: 0 2px 8px rgba(196,98,45,0.35);
}
.qty-btn:hover { transform: scale(1.1); }
.qty-val {
  font-size: 12px; font-weight: 700; color: #1A1008; min-width: 14px; text-align: center;
}
.add-btn {
  background: linear-gradient(135deg, #C4622D, #D4724A);
  color: white; border: none; border-radius: 5px;
  padding: 2px 7px; font-size: 9px; font-weight: 700;
  cursor: pointer; white-space: nowrap; touch-action: manipulation;
  box-shadow: 0 2px 6px rgba(196,98,45,0.4);
  transition: opacity 0.15s;
}
.add-btn:hover { opacity: 0.85; }

.page-number {
  font-family: 'Playfair Display', serif;
  font-size: 9px; color: rgba(42,26,14,0.3); font-style: italic;
  margin-top: 4px; position: relative; z-index: 1;
}
.page-number.l { text-align: left; }
.page-number.r { text-align: right; }

/* ──────────────────────────────────────
   LA PAGE QUI TOURNE — 3D flip réel
   Clé : on pose la classe .is-flipping
   sur le .book-flip-page via JS direct
────────────────────────────────────── */
.book-flip-page {
  position: absolute; top: 0; bottom: 0;
  transform-style: preserve-3d;
  z-index: 20;
  pointer-events: none;
}
.book-flip-page.dir-next {
  left: 50%; right: 0;
  transform-origin: left center;
}
.book-flip-page.dir-prev {
  left: 0; right: 50%;
  transform-origin: right center;
}
/* Quand on lance l'animation */
.book-flip-page.is-flipping.dir-next {
  animation: flipNext 0.7s cubic-bezier(0.645, 0.045, 0.355, 1.000) forwards;
}
.book-flip-page.is-flipping.dir-prev {
  animation: flipPrev 0.7s cubic-bezier(0.645, 0.045, 0.355, 1.000) forwards;
}
@keyframes flipNext {
  from { transform: rotateY(0deg); }
  to   { transform: rotateY(-180deg); }
}
@keyframes flipPrev {
  from { transform: rotateY(0deg); }
  to   { transform: rotateY(180deg); }
}

.flip-face {
  position: absolute; inset: 0;
  backface-visibility: hidden; -webkit-backface-visibility: hidden;
  overflow: hidden;
}
.flip-face.back {
  transform: rotateY(180deg) scaleX(-1);
}

/* ── NAVIGATION ── */
.book-nav {
  display: flex; align-items: center; gap: 18px;
}
.nav-arrow {
  width: 46px; height: 46px; border-radius: 50%;
  border: none; cursor: pointer; font-size: 22px;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.2s; touch-action: manipulation; outline: none;
}
.nav-arrow.active {
  background: linear-gradient(135deg, #C4622D, #D4724A);
  color: white;
  box-shadow: 0 5px 18px rgba(196,98,45,0.45);
}
.nav-arrow.active:hover { transform: scale(1.08); }
.nav-arrow.inactive {
  background: rgba(255,255,255,0.04); color: rgba(255,255,255,0.12); cursor: not-allowed;
}
.nav-dots { display: flex; gap: 7px; }
.nav-dot {
  height: 7px; border-radius: 4px;
  background: rgba(196,98,45,0.2);
  cursor: pointer; transition: all 0.3s;
}
.nav-dot.active { width: 24px; background: #C4622D; }
.nav-dot.inactive { width: 7px; }
.nav-hint {
  font-family: 'Playfair Display', serif;
  font-size: 11px; font-style: italic;
  color: rgba(196,98,45,0.3); text-align: center;
}

/* ── MOBILE : 1 page ── */
.mobile-page-wrap {
  width: 100%;
  min-height: calc(100dvh - 190px);
  border-radius: 12px;
  position: relative; overflow: hidden;
  box-shadow: 0 20px 50px rgba(0,0,0,0.7), 5px 0 0 #CEC0A0, 9px 0 0 #BEB090;
}
.mobile-page-paper {
  width: 100%; height: 100%; min-height: inherit;
  background: linear-gradient(135deg, #F5EFE0, #EDE5CF);
  padding: 16px 14px 12px;
  display: flex; flex-direction: column;
  position: relative; overflow: hidden;
}
.mobile-page-paper::after {
  content: ''; position: absolute; inset: 0; pointer-events: none;
  background-image: repeating-linear-gradient(
    transparent, transparent 25px,
    rgba(42,26,14,0.055) 25px, rgba(42,26,14,0.055) 26px
  );
  background-position-y: 44px;
}

/* ── HEADER ── */
.menu-header {
  height: 60px;
  background: rgba(13,12,11,0.93);
  backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(196,98,45,0.12);
  position: sticky; top: 0; z-index: 100;
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 18px;
}
.header-brand { display: flex; flex-direction: column; }
.header-name {
  font-family: 'Playfair Display', serif;
  font-size: 22px; font-weight: 600; font-style: italic;
  color: #F0EBE3; line-height: 1; letter-spacing: 0.5px;
}
.header-tagline {
  font-family: 'Inter', sans-serif;
  font-size: 7.5px; font-weight: 600;
  color: rgba(196,98,45,0.6); letter-spacing: 2.5px;
  text-transform: uppercase; margin-top: 1px;
}
.header-actions { display: flex; align-items: center; gap: 8px; }
.hbtn {
  display: flex; align-items: center; gap: 5px;
  padding: 7px 12px; border-radius: 20px;
  border: 1px solid rgba(196,98,45,0.3);
  background: rgba(196,98,45,0.06);
  color: rgba(232,147,106,0.8);
  font-family: 'Inter', sans-serif; font-size: 11.5px; font-weight: 600;
  cursor: pointer; transition: all 0.2s; outline: none; white-space: nowrap;
  touch-action: manipulation;
}
.hbtn:hover, .hbtn:active { background: rgba(196,98,45,0.14); border-color: rgba(196,98,45,0.55); color: #F0EBE3; }
.hbtn.cart-full {
  background: linear-gradient(135deg, #C4622D, #D4724A);
  border-color: transparent; color: white;
  box-shadow: 0 3px 14px rgba(196,98,45,0.4);
}
.cart-badge {
  background: rgba(255,255,255,0.25); border-radius: 50%;
  width: 18px; height: 18px;
  display: flex; align-items: center; justify-content: center;
  font-size: 9px; font-weight: 800;
}
.hbtn.icon-only { padding: 7px 9px; }

/* ── TOAST ── */
.toast-bar {
  position: fixed; bottom: 26px; left: 50%; transform: translateX(-50%);
  background: rgba(20,18,16,0.97);
  border: 1px solid rgba(196,98,45,0.45);
  color: #F0EBE3; padding: 11px 22px; border-radius: 40px;
  font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 500;
  z-index: 9999; white-space: nowrap; pointer-events: none;
  box-shadow: 0 8px 28px rgba(0,0,0,0.55);
  animation: toastIn 0.35s cubic-bezier(0.34,1.56,0.64,1);
}
@keyframes toastIn {
  from { opacity: 0; transform: translateX(-50%) translateY(14px); }
  to   { opacity: 1; transform: translateX(-50%) translateY(0); }
}

/* ── PANIER bottom-sheet ── */
.panier-overlay {
  position: fixed; inset: 0; z-index: 500;
  background: rgba(0,0,0,0.88);
  backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
  display: flex; align-items: flex-end; justify-content: center;
}
.panier-sheet {
  background: #161412; border-top: 1px solid rgba(196,98,45,0.18);
  border-radius: 22px 22px 0 0;
  width: 100%; max-width: 520px; max-height: 92dvh;
  display: flex; flex-direction: column;
  animation: sheetUp 0.4s cubic-bezier(0.34,1.56,0.64,1);
  overflow: hidden;
}
@keyframes sheetUp {
  from { transform: translateY(100%); opacity: 0; }
  to   { transform: translateY(0);    opacity: 1; }
}
.panier-handle { height: 18px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; padding: 12px 0 0; }
.panier-handle div { width: 36px; height: 4px; border-radius: 2px; background: rgba(196,98,45,0.2); }
.panier-head {
  display: flex; justify-content: space-between; align-items: center;
  padding: 10px 20px 12px;
  border-bottom: 1px solid rgba(196,98,45,0.1);
  flex-shrink: 0;
}
.panier-title { font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 600; color: #F0EBE3; }
.panier-count { font-family: 'Inter', sans-serif; font-size: 11px; color: rgba(196,98,45,0.5); margin-top: 1px; }
.close-btn {
  width: 32px; height: 32px; border-radius: 50%;
  border: 1px solid rgba(196,98,45,0.2); background: rgba(196,98,45,0.06);
  color: rgba(240,235,227,0.45); font-size: 15px; cursor: pointer;
  display: flex; align-items: center; justify-content: center; outline: none;
  touch-action: manipulation;
}
.panier-body { flex: 1; overflow-y: auto; padding: 14px 20px; }
.panier-empty { text-align: center; padding: 50px 0; color: rgba(240,235,227,0.18); }
.panier-empty p { font-family: 'Playfair Display', serif; font-size: 15px; font-style: italic; }
.panier-item {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.05);
}
.p-item-info { flex: 1; min-width: 0; }
.p-item-name { font-family: 'Playfair Display', serif; font-size: 14px; font-weight: 600; color: #F0EBE3; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.p-item-price { font-family: 'Playfair Display', serif; font-size: 12px; color: #C4622D; }
.p-item-sub { font-family: 'Playfair Display', serif; font-size: 13px; font-weight: 700; color: #F0EBE3; min-width: 52px; text-align: right; }
.p-item-del { background: none; border: none; color: rgba(255,100,100,0.4); cursor: pointer; font-size: 14px; padding: 0 2px; outline: none; touch-action: manipulation; }
.qty-btn-p {
  width: 27px; height: 27px; border-radius: 50%;
  border: 1px solid rgba(196,98,45,0.3); background: transparent; color: #E8936A;
  font-size: 14px; font-weight: 700; cursor: pointer;
  display: flex; align-items: center; justify-content: center; outline: none; touch-action: manipulation;
}
.qty-btn-p.plus { background: linear-gradient(135deg,#C4622D,#D4724A); border: none; color: white; box-shadow: 0 2px 6px rgba(196,98,45,0.3); }
.panier-total-row {
  display: flex; justify-content: space-between; align-items: center;
  padding: 12px 0; border-top: 1px solid rgba(196,98,45,0.2); margin-top: 2px;
}
.panier-total-label { font-family: 'Playfair Display', serif; font-size: 15px; font-weight: 600; color: rgba(240,235,227,0.6); }
.panier-total-val   { font-family: 'Playfair Display', serif; font-size: 21px; font-weight: 700; color: #C4622D; }
.p-label { font-family: 'Inter', sans-serif; font-size: 9px; font-weight: 700; color: rgba(196,98,45,0.6); letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 5px; display: block; }
.p-input {
  width: 100%; padding: 11px 14px;
  background: rgba(255,255,255,0.04); border: 1px solid rgba(196,98,45,0.2);
  border-radius: 9px; color: #F0EBE3;
  font-family: 'Inter', sans-serif; font-size: 13px;
  outline: none; transition: border 0.2s; resize: vertical; box-sizing: border-box;
}
.p-input:focus { border-color: #C4622D; background: rgba(196,98,45,0.04); }
.p-input::placeholder { color: rgba(240,235,227,0.18); }
.panier-foot { padding: 12px 20px 22px; border-top: 1px solid rgba(196,98,45,0.08); flex-shrink: 0; }
.order-btn {
  width: 100%; padding: 14px;
  background: linear-gradient(135deg, #C4622D, #D4724A);
  border: none; border-radius: 13px;
  color: #FAF7F2; font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 700;
  cursor: pointer; outline: none; letter-spacing: 0.5px;
  box-shadow: 0 6px 20px rgba(196,98,45,0.4);
  transition: transform 0.15s, opacity 0.15s; touch-action: manipulation;
}
.order-btn:hover { transform: translateY(-1px); }
.order-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

/* ── STAMP ── */
.stamp-overlay {
  position: absolute; inset: 0; z-index: 50;
  background: rgba(10,9,8,0.65);
  display: flex; align-items: center; justify-content: center;
}
.stamp-box {
  border: 5px solid #C4622D; border-radius: 8px;
  padding: 22px 30px;
  display: flex; flex-direction: column; align-items: center; gap: 7px;
  background: rgba(13,12,11,0.88);
  transform: rotate(-7deg);
  animation: stampIn 0.45s cubic-bezier(0.34,1.56,0.64,1);
}
@keyframes stampIn {
  from { opacity: 0; transform: rotate(-7deg) scale(0.25); }
  to   { opacity: 1; transform: rotate(-7deg) scale(1); }
}
.stamp-icon { font-size: 38px; }
.stamp-text { font-family: 'Playfair Display', serif; font-size: 17px; font-weight: 700; color: #C4622D; letter-spacing: 2px; text-transform: uppercase; }

/* ── MODAL APPEL SERVEUR ── */
.modal-overlay {
  position: fixed; inset: 0; z-index: 500;
  background: rgba(0,0,0,0.88);
  backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px);
  display: flex; align-items: center; justify-content: center; padding: 20px;
}
.modal-box {
  background: #1A1815; border: 1px solid rgba(196,98,45,0.22);
  border-radius: 18px; padding: 30px 26px; width: 100%; max-width: 400px;
  box-shadow: 0 28px 60px rgba(0,0,0,0.8);
  animation: modalIn 0.3s cubic-bezier(0.34,1.56,0.64,1);
}
@keyframes modalIn {
  from { opacity: 0; transform: scale(0.88) translateY(16px); }
  to   { opacity: 1; transform: scale(1)    translateY(0); }
}
.modal-icon { text-align: center; font-size: 42px; margin-bottom: 8px; }
.modal-title { font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 600; color: #F0EBE3; text-align: center; margin-bottom: 3px; }
.modal-sub   { font-family: 'Inter', sans-serif; font-size: 11px; color: rgba(196,98,45,0.55); text-align: center; letter-spacing: 1px; margin-bottom: 20px; }
.modal-btn-p {
  width: 100%; padding: 13px;
  background: linear-gradient(135deg, #C4622D, #D4724A);
  border: none; border-radius: 11px; color: #FAF7F2;
  font-family: 'Inter', sans-serif; font-size: 13.5px; font-weight: 700;
  cursor: pointer; outline: none; margin-bottom: 8px;
  box-shadow: 0 5px 16px rgba(196,98,45,0.38);
  transition: transform 0.15s; touch-action: manipulation;
}
.modal-btn-p:hover { transform: translateY(-1px); }
.modal-btn-p:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
.modal-btn-s {
  width: 100%; padding: 12px; background: transparent;
  border: 1px solid rgba(196,98,45,0.22); border-radius: 11px;
  color: rgba(232,147,106,0.65);
  font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 600;
  cursor: pointer; outline: none; transition: all 0.2s; touch-action: manipulation;
}
.modal-btn-s:hover { background: rgba(196,98,45,0.07); border-color: rgba(196,98,45,0.4); }
.err-msg { color: #ff7675; font-size: 11.5px; margin: 6px 0; }

/* ── LOADING ── */
.loading-wrap { display: flex; flex-direction: column; align-items: center; gap: 16px; padding: 100px 0; }
.loading-spinner {
  width: 34px; height: 34px;
  border: 3px solid rgba(196,98,45,0.1);
  border-top-color: #C4622D; border-radius: 50%;
  animation: spin 0.85s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
.loading-text { font-family: 'Playfair Display', serif; font-size: 15px; font-style: italic; color: rgba(240,235,227,0.3); }
`;

/* ─── Injecter les styles une seule fois ─── */
let stylesInjected = false;
function injectStyles() {
  if (stylesInjected) return;
  const style = document.createElement('style');
  style.textContent = BOOK_CSS;
  document.head.appendChild(style);
  stylesInjected = true;
}

/* ─── ProduitCard ─── */
function ProduitCard({ produit, onAdd, isMobile }) {
  const [qty, setQty] = useState(0);
  const handleAdd = () => {
    if (!qty) return;
    onAdd({ ...produit, prix_unit: produit.prix, quantite: qty });
    setQty(0);
  };
  return (
    <div className="page-item">
      <div className="item-img">
        {produit.image_url
          ? <img src={produit.image_url} alt={produit.nom} />
          : <span className="item-emoji">🍽️</span>}
      </div>
      <div className="item-info">
        <div className="item-name">{produit.nom}</div>
        {produit.description && !isMobile && (
          <div className="item-desc">
            {produit.description.length > 44 ? produit.description.slice(0,44)+'…' : produit.description}
          </div>
        )}
        <div className="item-price">
          {Number(produit.prix).toFixed(2)}<sup> $</sup>
        </div>
      </div>
      <div className="item-controls">
        <div className="qty-row">
          <button className="qty-btn" onClick={() => setQty(q => Math.max(0,q-1))}>−</button>
          <span className="qty-val">{qty}</span>
          <button className="qty-btn plus" onClick={() => setQty(q => q+1)}>+</button>
        </div>
        {qty > 0 && <button className="add-btn" onClick={handleAdd}>✓ Ajouter</button>}
      </div>
    </div>
  );
}

/* ─── PageContent ─── */
function PageContent({ page, pageNum, totalPages, onAdd, side, isMobile }) {
  if (!page) return (
    <div className={`page-paper ${side}`} style={{ alignItems:'center', justifyContent:'center' }}>
      <span style={{ color:'rgba(42,26,14,0.12)', fontSize:40 }}>✦</span>
    </div>
  );
  return (
    <div className={`page-paper ${side}`}>
      {page.categorie && (
        <div className="page-header">
          <span className="page-cat-emoji">{page.categorie.emoji || '🍽️'}</span>
          <span className="page-cat-name">{page.categorie.nom}</span>
        </div>
      )}
      <div className="page-divider">
        <div className="page-divider-line l" />
        <span className="page-divider-dot">✦</span>
        <div className="page-divider-line r" />
      </div>
      <div className="page-items">
        {page.produits.map(p => (
          <ProduitCard key={p.id} produit={p} onAdd={onAdd} isMobile={isMobile} />
        ))}
      </div>
      <div className={`page-number ${side[0]}`}>{pageNum} / {totalPages}</div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   Book3D principal
   L'animation flip est déclenchée via className
   directement sur l'élément DOM (useRef),
   PAS via setState — pour éviter tout re-render.
═══════════════════════════════════════════════ */
export default function Book3D({ pages, onAdd, lang, isMobile }) {
  useEffect(() => { injectStyles(); }, []);

  const [spread, setSpread] = useState(0);
  // nextSpread et flipDir sont des refs pour éviter re-render pendant l'animation
  const flippingRef  = useRef(false);
  const spreadRef    = useRef(0);
  const flipPageRef  = useRef(null); // ref sur le DOM node .book-flip-page

  // Ce state sert juste à forcer le re-render APRÈS le flip (pour changer les pages visibles)
  const [displaySpread, setDisplaySpread] = useState(0);
  const [flipState, setFlipState] = useState(null); // { dir, fromPage, toPage, nextSpread }

  const totalSpreads = isMobile ? pages.length : Math.ceil(pages.length / 2);

  const flip = useCallback((dir) => {
    if (flippingRef.current) return;
    const current = spreadRef.current;
    if (dir === 'next' && current >= totalSpreads - 1) return;
    if (dir === 'prev' && current <= 0) return;

    const next = dir === 'next' ? current + 1 : current - 1;
    flippingRef.current = true;

    // Pages qui participent au flip
    const fromPage = dir === 'next' ? pages[current*2+1]  : pages[current*2];
    const toPage   = dir === 'next' ? pages[next*2]       : pages[next*2+1];

    // Préparer l'état du flip (rend la page animée visible)
    setFlipState({ dir, fromPage, toPage, nextSpread: next, currentSpread: current });

    // Laisser React rendre la page flip, puis déclencher l'animation CSS
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const el = flipPageRef.current;
        if (el) {
          el.classList.add('is-flipping');
        }
        // Fin de l'animation : on change le spread affiché
        setTimeout(() => {
          spreadRef.current = next;
          setDisplaySpread(next);
          setFlipState(null);
          flippingRef.current = false;
          if (el) el.classList.remove('is-flipping');
        }, 720);
      });
    });
  }, [pages, totalSpreads, isMobile]);

  // Swipe tactile
  const touchStart = useRef(null);
  const onTouchStart = e => { touchStart.current = e.touches[0].clientX; };
  const onTouchEnd   = e => {
    if (touchStart.current === null) return;
    const d = touchStart.current - e.changedTouches[0].clientX;
    if (Math.abs(d) > 45) flip(d > 0 ? 'next' : 'prev');
    touchStart.current = null;
  };

  if (!pages || !pages.length) return (
    <div className="loading-wrap">
      <div style={{ fontSize:44 }}>📖</div>
      <p className="loading-text">{lang==='en' ? 'No items available' : 'Aucun plat disponible'}</p>
    </div>
  );

  const s = displaySpread;

  /* ── MOBILE : une page ── */
  if (isMobile) {
    const page = pages[s];
    return (
      <div className="book-scene">
        <div className="mobile-page-wrap" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
          <div className="mobile-page-paper">
            {page?.categorie && (
              <div className="page-header">
                <span className="page-cat-emoji">{page.categorie.emoji||'🍽️'}</span>
                <span className="page-cat-name">{page.categorie.nom}</span>
              </div>
            )}
            <div className="page-divider">
              <div className="page-divider-line l"/><span className="page-divider-dot">✦</span><div className="page-divider-line r"/>
            </div>
            <div className="page-items" style={{ flex:1 }}>
              {page?.produits.map(p => <ProduitCard key={p.id} produit={p} onAdd={onAdd} isMobile />)}
            </div>
            <div className="page-number r">{s+1} / {pages.length}</div>
          </div>
        </div>
        <div className="book-nav">
          <button className={`nav-arrow ${s<=0?'inactive':'active'}`} onClick={() => flip('prev')} disabled={s<=0}>‹</button>
          <div className="nav-dots">
            {Array.from({length: Math.min(pages.length,7)}).map((_,i) => {
              const idx = pages.length<=7 ? i : Math.round(i*(pages.length-1)/6);
              const active = pages.length<=7 ? i===s : Math.round(s*6/(pages.length-1))===i;
              return <div key={i} className={`nav-dot ${active?'active':'inactive'}`} />;
            })}
          </div>
          <button className={`nav-arrow ${s>=pages.length-1?'inactive':'active'}`} onClick={() => flip('next')} disabled={s>=pages.length-1}>›</button>
        </div>
      </div>
    );
  }

  /* ── DESKTOP : double page + flip 3D ── */
  const leftPage  = pages[s*2]   || null;
  const rightPage = pages[s*2+1] || null;

  // Pages du spread suivant (visibles derrière la page qui tourne)
  const nextSpreadVal = flipState?.nextSpread ?? s;
  const nextLeft  = pages[nextSpreadVal*2]   || null;
  const nextRight = pages[nextSpreadVal*2+1] || null;

  // La page statique qu'on cache pendant le flip (opacity 0)
  const hideLeft  = !!flipState && flipState.dir === 'prev';
  const hideRight = !!flipState && flipState.dir === 'next';

  return (
    <div className="book-scene">
      <div className="book-wrapper" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        <div className="book-inner">

          {/* Reliure */}
          <div className="book-spine" />

          {/* Page gauche statique */}
          <div className={`book-page left ${hideLeft ? 'hidden' : ''}`}>
            <PageContent page={leftPage} pageNum={s*2+1} totalPages={pages.length} onAdd={onAdd} side="left" isMobile={false} />
          </div>

          {/* Page droite statique */}
          <div className={`book-page right ${hideRight ? 'hidden' : ''}`}>
            <PageContent page={rightPage} pageNum={s*2+2} totalPages={pages.length} onAdd={onAdd} side="right" isMobile={false} />
          </div>

          {/* Pages du spread SUIVANT derrière la page qui tourne */}
          {flipState && (
            <>
              {flipState.dir === 'next' && nextLeft && (
                <div style={{ position:'absolute', left:0, top:0, bottom:0, width:'50%', overflow:'hidden', borderRadius:'6px 0 0 6px', zIndex:5 }}>
                  <PageContent page={nextLeft} pageNum={nextSpreadVal*2+1} totalPages={pages.length} onAdd={onAdd} side="left" isMobile={false} />
                </div>
              )}
              {flipState.dir === 'prev' && nextRight && (
                <div style={{ position:'absolute', right:0, top:0, bottom:0, width:'50%', overflow:'hidden', borderRadius:'0 10px 10px 0', zIndex:5 }}>
                  <PageContent page={nextRight} pageNum={nextSpreadVal*2+2} totalPages={pages.length} onAdd={onAdd} side="right" isMobile={false} />
                </div>
              )}
            </>
          )}

          {/* LA PAGE QUI TOURNE — montée uniquement pendant le flip */}
          {flipState && (
            <div
              ref={flipPageRef}
              className={`book-flip-page dir-${flipState.dir}`}
            >
              {/* Face avant */}
              <div className="flip-face">
                <PageContent
                  page={flipState.fromPage}
                  pageNum={flipState.dir==='next' ? flipState.currentSpread*2+2 : flipState.currentSpread*2+1}
                  totalPages={pages.length} onAdd={onAdd}
                  side={flipState.dir==='next' ? 'right' : 'left'}
                  isMobile={false}
                />
              </div>
              {/* Face arrière */}
              <div className="flip-face back">
                <PageContent
                  page={flipState.toPage}
                  pageNum={flipState.dir==='next' ? flipState.nextSpread*2+1 : flipState.nextSpread*2+2}
                  totalPages={pages.length} onAdd={onAdd}
                  side={flipState.dir==='next' ? 'left' : 'right'}
                  isMobile={false}
                />
              </div>
            </div>
          )}

          {/* Tranche pages */}
          <div className="book-page-edge" />
          {/* Ombre */}
          <div className="book-shadow" />
        </div>
      </div>

      {/* Navigation */}
      <div className="book-nav">
        <button className={`nav-arrow ${s<=0?'inactive':'active'}`} onClick={() => flip('prev')} disabled={s<=0}>‹</button>
        <div className="nav-dots">
          {Array.from({length: totalSpreads}).map((_,i) => (
            <div key={i} className={`nav-dot ${i===s?'active':'inactive'}`} onClick={() => { if (!flippingRef.current) { spreadRef.current=i; setDisplaySpread(i); }}} />
          ))}
        </div>
        <button className={`nav-arrow ${s>=totalSpreads-1?'inactive':'active'}`} onClick={() => flip('next')} disabled={s>=totalSpreads-1}>›</button>
      </div>
      <p className="nav-hint">← Glissez ou utilisez les flèches →</p>
    </div>
  );
}
