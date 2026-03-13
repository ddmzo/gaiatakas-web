(function () {
  const path = window.location.pathname || '/';
  if (!path.startsWith('/l/')) {
    return;
  }

  const listingId = decodeURIComponent(path.replace(/^\/l\//, '').split('/')[0] || '').trim();
  if (!listingId) {
    return;
  }

  const API_BASE = 'https://api.gaiatakas.app/api/v1';
  const APP_SCHEME_BASE = 'gaiatakas://l/';
  const APP_STORE_URL = 'https://apps.apple.com/app/id6759619938';
  const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=co.ztudio.gaiatakas';

  const state = {
    loading: true,
    item: null,
    error: '',
  };

  const messages = {
    tr: {
      badge: 'Paylasilan ilan',
      loadingTitle: 'Ilan yukleniyor',
      loadingBody: 'Paylasilan ilani aciyoruz. Biraz bekle.',
      fallbackTitle: 'GaiaTakas ilani',
      openApp: 'App\'te ac',
      appStore: 'App Store',
      playStore: 'Google Play',
      openHome: 'Ana sayfaya git',
      gift: 'Hediye',
      swap: 'Takas ilani',
      notFoundTitle: 'Ilan acilamadi',
      notFoundBody: 'Bu ilan artik aktif olmayabilir. Uygulamayi acip tekrar deneyebilirsin.',
      openAppHint: 'App yukluysa ilana dogrudan gecersin. Yuklu degilse magaza linklerini kullan.',
      installHint: 'Uygulama cihazinda yoksa asagidaki magaza linklerini kullan.',
      byGaia: 'GaiaTakas uzerinden paylasildi',
      valuePrefix: 'Deger',
      retry: 'Tekrar dene',
    },
    en: {
      badge: 'Shared listing',
      loadingTitle: 'Loading listing',
      loadingBody: 'Opening the shared listing. Please wait.',
      fallbackTitle: 'GaiaTakas listing',
      openApp: 'Open in app',
      appStore: 'App Store',
      playStore: 'Google Play',
      openHome: 'Go to home',
      gift: 'Gift',
      swap: 'Swap listing',
      notFoundTitle: 'Listing could not be opened',
      notFoundBody: 'This listing may no longer be active. Open the app and try again.',
      openAppHint: 'If the app is installed, this should take you straight to the listing.',
      installHint: 'If you do not have the app yet, install it with one of the store links below.',
      byGaia: 'Shared from GaiaTakas',
      valuePrefix: 'Value',
      retry: 'Try again',
    },
  };

  function getLang() {
    const browserLang = String((navigator.language || navigator.userLanguage || 'tr')).toLowerCase();
    return browserLang.startsWith('tr') ? 'tr' : 'en';
  }

  function t(key) {
    return messages[getLang()][key];
  }

  function formatMoney(value, currency) {
    const amount = Number(value || 0);
    if (!Number.isFinite(amount) || amount <= 0) {
      return t('gift');
    }

    const normalizedCurrency = String(currency || 'TRY').toUpperCase();
    const locale = getLang() === 'tr' ? 'tr-TR' : 'en-US';

    try {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: normalizedCurrency,
        maximumFractionDigits: 0,
      }).format(amount);
    } catch (_error) {
      return amount.toFixed(0);
    }
  }

  function ensureShell() {
    let shell = document.getElementById('share-route-shell');
    if (shell) {
      return shell;
    }

    shell = document.createElement('main');
    shell.id = 'share-route-shell';
    shell.className = 'share-route-shell';
    shell.innerHTML = [
      '<section class="share-route-card">',
      '  <div class="share-route-media">',
      '    <img id="share-route-image" class="share-route-image" alt="GaiaTakas listing" hidden />',
      '    <div id="share-route-placeholder" class="share-route-placeholder">GT</div>',
      '  </div>',
      '  <div class="share-route-copy">',
      '    <div id="share-route-badge" class="share-route-overline"></div>',
      '    <h1 id="share-route-title" class="share-route-title"></h1>',
      '    <p id="share-route-subtitle" class="share-route-subtitle"></p>',
      '    <div id="share-route-meta" class="share-route-meta"></div>',
      '    <div id="share-route-status" class="share-route-status"></div>',
      '    <div class="share-route-actions">',
      '      <a id="share-route-open-app" class="share-route-btn share-route-btn-primary" href="#"></a>',
      '      <a id="share-route-home" class="share-route-btn share-route-btn-secondary" href="/"></a>',
      '    </div>',
      '    <div class="share-route-store-row">',
      '      <a id="share-route-app-store" class="share-route-link" target="_blank" rel="noreferrer" href="#"></a>',
      '      <a id="share-route-play-store" class="share-route-link" target="_blank" rel="noreferrer" href="#"></a>',
      '    </div>',
      '    <p id="share-route-note" class="share-route-note"></p>',
      '  </div>',
      '</section>'
    ].join('');

    document.body.appendChild(shell);
    return shell;
  }

  function setRouteMode() {
    document.body.classList.add('share-route');
    ensureShell();
  }

  function renderLoading() {
    setRouteMode();
    document.title = t('loadingTitle') + ' | GaiaTakas';
    document.getElementById('share-route-badge').textContent = t('badge');
    document.getElementById('share-route-title').textContent = t('loadingTitle');
    document.getElementById('share-route-subtitle').textContent = t('loadingBody');
    document.getElementById('share-route-meta').innerHTML = '';
    document.getElementById('share-route-status').innerHTML = '<span class="share-route-spinner"></span>' + t('loadingBody');
    document.getElementById('share-route-open-app').textContent = t('openApp');
    document.getElementById('share-route-open-app').href = APP_SCHEME_BASE + encodeURIComponent(listingId);
    document.getElementById('share-route-home').textContent = t('openHome');
    document.getElementById('share-route-app-store').textContent = t('appStore');
    document.getElementById('share-route-app-store').href = APP_STORE_URL;
    document.getElementById('share-route-play-store').textContent = t('playStore');
    document.getElementById('share-route-play-store').href = PLAY_STORE_URL;
    document.getElementById('share-route-note').textContent = t('installHint');
  }

  function renderError(message) {
    setRouteMode();
    document.title = t('notFoundTitle') + ' | GaiaTakas';
    document.getElementById('share-route-badge').textContent = t('badge');
    document.getElementById('share-route-title').textContent = t('notFoundTitle');
    document.getElementById('share-route-subtitle').textContent = message || t('notFoundBody');
    document.getElementById('share-route-meta').innerHTML = '';
    document.getElementById('share-route-status').textContent = '';
    document.getElementById('share-route-open-app').textContent = t('openApp');
    document.getElementById('share-route-open-app').href = APP_SCHEME_BASE + encodeURIComponent(listingId);
    document.getElementById('share-route-home').textContent = t('openHome');
    document.getElementById('share-route-app-store').textContent = t('appStore');
    document.getElementById('share-route-app-store').href = APP_STORE_URL;
    document.getElementById('share-route-play-store').textContent = t('playStore');
    document.getElementById('share-route-play-store').href = PLAY_STORE_URL;
    document.getElementById('share-route-note').textContent = t('openAppHint');
  }

  function renderListing(item) {
    setRouteMode();
    const imageEl = document.getElementById('share-route-image');
    const placeholderEl = document.getElementById('share-route-placeholder');
    const listingMode = String(item.listingMode || 'swap').toLowerCase() === 'free' ? 'free' : 'swap';
    const isGift = listingMode === 'free' || Number(item.price || 0) === 0;
    const imageUrl = Array.isArray(item.images) && item.images.length > 0
      ? String(item.images[0] || '').trim()
      : String(item.image || '').trim();

    document.title = String(item.name || t('fallbackTitle')) + ' | GaiaTakas';
    document.getElementById('share-route-badge').textContent = t('byGaia');
    document.getElementById('share-route-title').textContent = String(item.name || t('fallbackTitle'));
    document.getElementById('share-route-subtitle').textContent = String(item.description || t('openAppHint'));

    const priceLabel = formatMoney(item.price, item.priceCurrency);
    const modeLabel = isGift ? t('gift') : t('swap');
    document.getElementById('share-route-meta').innerHTML = [
      '<span class="share-route-pill">' + t('valuePrefix') + ': ' + priceLabel + '</span>',
      '<span class="share-route-pill">' + modeLabel + '</span>'
    ].join('');

    document.getElementById('share-route-status').textContent = '';
    document.getElementById('share-route-open-app').textContent = t('openApp');
    document.getElementById('share-route-open-app').href = APP_SCHEME_BASE + encodeURIComponent(listingId);
    document.getElementById('share-route-home').textContent = t('openHome');
    document.getElementById('share-route-app-store').textContent = t('appStore');
    document.getElementById('share-route-app-store').href = APP_STORE_URL;
    document.getElementById('share-route-play-store').textContent = t('playStore');
    document.getElementById('share-route-play-store').href = PLAY_STORE_URL;
    document.getElementById('share-route-note').textContent = t('openAppHint');

    if (imageUrl) {
      imageEl.src = imageUrl;
      imageEl.hidden = false;
      placeholderEl.hidden = true;
    } else {
      imageEl.hidden = true;
      placeholderEl.hidden = false;
    }
  }

  async function loadListing() {
    renderLoading();

    try {
      const response = await fetch(API_BASE + '/listings/' + encodeURIComponent(listingId));
      const payload = await response.json();
      if (!response.ok || !payload || typeof payload !== 'object' || !payload.data) {
        throw new Error(t('notFoundBody'));
      }
      state.item = payload.data;
      state.loading = false;
      renderListing(state.item);
    } catch (error) {
      state.error = error instanceof Error ? error.message : t('notFoundBody');
      state.loading = false;
      renderError(state.error);
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    loadListing();
    const langBtn = document.getElementById('lang-toggle');
    if (langBtn) {
      langBtn.addEventListener('click', function () {
        window.setTimeout(function () {
          if (state.loading) {
            renderLoading();
            return;
          }
          if (state.item) {
            renderListing(state.item);
            return;
          }
          renderError(state.error);
        }, 0);
      });
    }
  });
})();


