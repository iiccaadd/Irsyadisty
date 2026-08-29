/**
 * Admin Panel Controller & Unified In-Page Studio
 * Handles All Form Bindings, Real-Time WYSIWYG Sync, Particle Animation Engine Controls,
 * Guest Database, Openable WA Generator, and Unified Drawer Controls.
 */

document.addEventListener('DOMContentLoaded', () => {
  // -----------------------------------------------------------------------
  // GUEST MODE GUARD
  // If the page was opened via a guest-specific link (?to=NAME), admin.js
  // must NOT initialise any admin UI. The body already has class 'guest-mode'
  // added by invitation.js. We bail out entirely so there is nothing to
  // accidentally trigger or inject into the DOM.
  // Also handles hash-based URLs (#?to=Name).
  // -----------------------------------------------------------------------
  const _urlParams = new URLSearchParams(window.location.search);
  let _isGuestMode = _urlParams.has('to') && _urlParams.get('to').trim() !== '';
  if (!_isGuestMode && window.location.hash.includes('?')) {
    const _hashParams = new URLSearchParams(window.location.hash.split('?')[1]);
    _isGuestMode = _hashParams.has('to') && _hashParams.get('to').trim() !== '';
  }
  // Also check class set by invitation.js (belt-and-suspenders)
  if (!_isGuestMode) {
    _isGuestMode = document.body.classList.contains('guest-mode');
  }
  if (_isGuestMode) return; // ← full early exit; admin stays invisible

  let appData = DataStore.get();
  let adminAudioPlayer = null;
  const unifiedDrawer = document.getElementById('unified-admin-drawer');
  const iframePreview = document.getElementById('preview-iframe');

  // Initialize UI & Populate All Forms
  initAdminAuth();
  initTabs();
  initUnifiedDrawer();
  initDeviceSwitcher();
  populateFormFields(appData);
  renderThemePresets();
  renderSectionToggles(appData);
  renderStoryManager(appData);
  renderGalleryManager(appData);
  renderDresscodeManager(appData);
  renderBankManager(appData);
  renderTurutMengundangManager(appData);
  renderProkesManager(appData);
  renderGuestDatabase(appData);
  renderWishesManager(appData);
  updateDashboardStats(appData);
  initWhatsAppGenerator(appData);
  initBackupRestore();
  initRealtimeLiveSync();
  initAdminAudioTester();
  initParticleControls(appData);

  // Save All Buttons
  document.querySelectorAll('#btn-save-all').forEach(btn => {
    btn.addEventListener('click', () => {
      saveAllFormData(true);
    });
  });

  // Refresh Preview Iframe Button (for standalone admin.html)
  const btnRefreshPreview = document.getElementById('btn-refresh-preview');
  if (btnRefreshPreview && iframePreview) {
    btnRefreshPreview.addEventListener('click', () => {
      iframePreview.src = iframePreview.src;
    });
  }

  /* ===================================================================
     0. ADMIN AUTHENTICATION & LOGIN PROTECTION
     Credentials:
     - Username: irsyadisty
     - Password: 11nov2026
     =================================================================== */
  const AUTH_STORAGE_KEY = 'wedding_admin_auth_session';
  const VALID_USER = 'irsyadisty';
  const VALID_PASS = '11nov2026';

  function isUserAuthenticated() {
    return sessionStorage.getItem(AUTH_STORAGE_KEY) === 'authenticated_irsyadisty';
  }

  function initAdminAuth() {
    const authOverlay = document.getElementById('admin-auth-overlay');
    const loginForm = document.getElementById('admin-login-form');
    const userInput = document.getElementById('admin-auth-user');
    const passInput = document.getElementById('admin-auth-pass');
    const errorBox = document.getElementById('admin-auth-error');
    const togglePassBtn = document.getElementById('btn-toggle-pass');
    const cancelAuthBtn = document.getElementById('btn-auth-cancel');
    const logoutBtns = document.querySelectorAll('.btn-logout');
    const isStandaloneAdmin = document.body.classList.contains('admin-page');

    // Initial state check
    if (isStandaloneAdmin) {
      if (isUserAuthenticated()) {
        if (authOverlay) authOverlay.classList.add('auth-hidden');
      } else {
        if (authOverlay) authOverlay.classList.remove('auth-hidden');
        if (userInput) userInput.focus();
      }
    } else {
      if (authOverlay) authOverlay.classList.add('auth-hidden');
    }

    // Toggle Password Visibility
    if (togglePassBtn && passInput) {
      togglePassBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const isPass = passInput.type === 'password';
        passInput.type = isPass ? 'text' : 'password';
        togglePassBtn.innerHTML = isPass ? '<i class="fas fa-eye-slash"></i>' : '<i class="fas fa-eye"></i>';
      });
    }

    // Cancel / Close Auth Modal (for in-page guest view)
    if (cancelAuthBtn && authOverlay) {
      cancelAuthBtn.addEventListener('click', () => {
        authOverlay.classList.add('auth-hidden');
        if (errorBox) errorBox.style.display = 'none';
        if (loginForm) loginForm.reset();
      });
    }

    // Form Submission
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const userVal = (userInput ? userInput.value : '').trim();
        const passVal = passInput ? passInput.value : '';

        if (userVal.toLowerCase() === VALID_USER && passVal === VALID_PASS) {
          // Success
          sessionStorage.setItem(AUTH_STORAGE_KEY, 'authenticated_irsyadisty');
          if (authOverlay) authOverlay.classList.add('auth-hidden');
          if (errorBox) errorBox.style.display = 'none';
          showAdminToast('Login berhasil! Selamat datang Admin Irsyad & Adisty.');
          loginForm.reset();

          // If inside index.html drawer, open it
          if (!isStandaloneAdmin && unifiedDrawer) {
            unifiedDrawer.classList.add('open');
          }
        } else {
          // Failed
          if (errorBox) {
            errorBox.textContent = 'Username atau Password salah! Silakan coba lagi.';
            errorBox.style.display = 'block';
          }
          const card = authOverlay ? authOverlay.querySelector('.admin-auth-card') : null;
          if (card) {
            card.classList.remove('shake-error');
            void card.offsetWidth;
            card.classList.add('shake-error');
          }
          if (passInput) {
            passInput.value = '';
            passInput.focus();
          }
        }
      });
    }

    // Logout Handlers
    logoutBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        sessionStorage.removeItem(AUTH_STORAGE_KEY);
        showAdminToast('Anda telah berhasil keluar (Logout).');

        if (isStandaloneAdmin) {
          if (authOverlay) {
            authOverlay.classList.remove('auth-hidden');
            if (userInput) userInput.focus();
          }
        } else {
          if (unifiedDrawer) unifiedDrawer.classList.remove('open');
        }
      });
    });
  }

  /* ===================================================================
     1. UNIFIED IN-PAGE DRAWER TOGGLE (PORTAL & PENGATURAN JADI SATU)
     =================================================================== */
  function initUnifiedDrawer() {
    const btnOpenTop = document.getElementById('btn-unified-admin-open');
    const btnOpenGear = document.getElementById('btn-admin-gear');
    const btnClose = document.getElementById('btn-close-unified-drawer');
    const authOverlay = document.getElementById('admin-auth-overlay');

    function triggerDrawerOpen() {
      if (isUserAuthenticated()) {
        if (unifiedDrawer) {
          unifiedDrawer.classList.add('open');
          showAdminToast('Mode Editor Aktif! Perubahan langsung terlihat seketika.');
        }
      } else {
        if (authOverlay) {
          authOverlay.classList.remove('auth-hidden');
          const userInput = document.getElementById('admin-auth-user');
          if (userInput) userInput.focus();
        }
      }
    }

    function closeDrawer() {
      if (unifiedDrawer) {
        unifiedDrawer.classList.remove('open');
        showAdminToast('Kembali ke Mode Tampilan Tamu.');
      }
    }

    if (btnOpenTop) btnOpenTop.onclick = triggerDrawerOpen;
    if (btnOpenGear) btnOpenGear.onclick = triggerDrawerOpen;
    if (btnClose) btnClose.onclick = closeDrawer;

    // Auto open if #admin hash or ?mode=admin AND already authenticated
    if (window.location.hash === '#admin' || window.location.search.includes('mode=admin')) {
      if (isUserAuthenticated()) {
        setTimeout(triggerDrawerOpen, 300);
      }
    }
  }

  /* ===================================================================
     2. TAB NAVIGATION
     =================================================================== */
  function initTabs() {
    const menuLinks = document.querySelectorAll('.sidebar-menu-link, .unified-nav-link');
    const tabPanes = document.querySelectorAll('.tab-pane');
    const pageHeading = document.getElementById('page-heading');

    menuLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetTab = link.dataset.tab;

        menuLinks.forEach(l => {
          if (l.dataset.tab === targetTab) l.classList.add('active');
          else l.classList.remove('active');
        });

        tabPanes.forEach(p => p.classList.remove('active'));

        const activePanes = document.querySelectorAll(`#tab-${targetTab}`);
        activePanes.forEach(p => p.classList.add('active'));

        if (pageHeading) {
          const spanText = link.querySelector('span');
          if (spanText) pageHeading.textContent = spanText.textContent;
        }
      });
    });
  }

  /* ===================================================================
     3. DEVICE SIMULATOR SWITCHER (For Standalone Admin)
     =================================================================== */
  function initDeviceSwitcher() {
    const frame = document.getElementById('simulator-frame');
    const devBtns = document.querySelectorAll('.device-btn');

    devBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        devBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const mode = btn.dataset.device;

        if (frame) {
          frame.className = `simulator-frame ${mode}`;
        }
      });
    });
  }

  /* ===================================================================
     4. PARTICLES ENGINE CONTROLS
     =================================================================== */
  function initParticleControls(data) {
    const p = (data.appearance && data.appearance.particles) ? data.appearance.particles : {
      enabled: true,
      type: 'flowers',
      speed: 'medium',
      density: 'medium',
      size: 'medium',
      colorMode: 'auto',
      customColor: '#d4af37',
      windSway: 'gentle'
    };

    const enableEl = document.getElementById('particle-enable');
    if (enableEl) enableEl.checked = (p.enabled !== false && p.type !== 'none');

    setVal('particle-type', p.type || 'flowers');
    setVal('particle-speed', p.speed || 'medium');
    setVal('particle-density', p.density || 'medium');
    setVal('particle-size', p.size || 'medium');
    setVal('particle-color-mode', p.colorMode || 'auto');
    setVal('particle-custom-color', p.customColor || '#d4af37');
    setVal('particle-wind-sway', p.windSway || 'gentle');

    const colorModeEl = document.getElementById('particle-color-mode');
    const customColorGroup = document.getElementById('particle-custom-color-group');
    if (colorModeEl && customColorGroup) {
      function checkColorMode() {
        customColorGroup.style.display = (colorModeEl.value === 'custom') ? 'block' : 'none';
      }
      colorModeEl.addEventListener('change', checkColorMode);
      checkColorMode();
    }

    const particleInputs = [
      'particle-enable', 'particle-type', 'particle-speed', 'particle-density',
      'particle-size', 'particle-color-mode', 'particle-custom-color', 'particle-wind-sway'
    ];

    particleInputs.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('change', () => {
          saveAllFormData(false);
          if (window.ParticlesEngine) {
            const curData = DataStore.get();
            window.ParticlesEngine.updateConfig(curData.appearance.particles, curData.appearance.primaryColor);
          }
        });
      }
    });
  }

  /* ===================================================================
     5. POPULATE FORM FIELDS FROM DATASTORE
     =================================================================== */
  function populateFormFields(data) {
    // General
    setVal('site-title', data.general.siteTitle);
    setVal('couple-name-short', data.general.coupleNameShort);
    setVal('cover-to-prefix', data.general.coverToPrefix);
    setVal('default-guest-name', data.general.defaultGuestName);
    setVal('brand-name', data.general.brandName);
    setVal('brand-url', data.general.brandUrl);
    setVal('quote-text', data.general.quote);
    setVal('quote-text-admin', data.general.quote);
    setVal('quote-source', data.general.quoteSource);
    setVal('quote-source-admin', data.general.quoteSource);

    // Groom
    bindImageField('groom-photo', data.general.groom.photo || data.media.heroCouple1);
    setVal('groom-fullname', data.general.groom.fullName);
    setVal('groom-nickname', data.general.groom.nickname);
    setVal('groom-parents', data.general.groom.parents);
    setVal('groom-instagram', data.general.groom.instagram);
    setVal('groom-about', data.general.groom.about);

    // Bride
    bindImageField('bride-photo', data.general.bride.photo || data.media.heroCouple2);
    setVal('bride-fullname', data.general.bride.fullName);
    setVal('bride-nickname', data.general.bride.nickname);
    setVal('bride-parents', data.general.bride.parents);
    setVal('bride-instagram', data.general.bride.instagram);
    setVal('bride-about', data.general.bride.about);

    // Events
    setVal('countdown-date', data.event.countdownDate);
    
    // Akad
    setVal('akad-title', data.event.akad.title);
    setVal('akad-date', data.event.akad.date);
    setVal('akad-date-admin', data.event.akad.date);
    setVal('akad-time', data.event.akad.time);
    setVal('akad-time-admin', data.event.akad.time);
    setVal('akad-venue', data.event.akad.venue);
    setVal('akad-venue-admin', data.event.akad.venue);
    setVal('akad-address', data.event.akad.address);
    setVal('akad-address-admin', data.event.akad.address);
    setVal('akad-maps', data.event.akad.mapsUrl);

    // Resepsi
    setVal('resepsi-title', data.event.resepsi.title);
    setVal('resepsi-date', data.event.resepsi.date);
    setVal('resepsi-date-admin', data.event.resepsi.date);
    setVal('resepsi-time', data.event.resepsi.time);
    setVal('resepsi-time-admin', data.event.resepsi.time);
    setVal('resepsi-venue', data.event.resepsi.venue);
    setVal('resepsi-venue-admin', data.event.resepsi.venue);
    setVal('resepsi-address', data.event.resepsi.address);
    setVal('resepsi-address-admin', data.event.resepsi.address);
    setVal('resepsi-maps', data.event.resepsi.mapsUrl);

    // Streaming
    if (data.streaming) {
      const streamEnable = document.getElementById('streaming-enable');
      if (streamEnable) streamEnable.checked = !!data.streaming.enabled;
      setVal('streaming-title', data.streaming.title);
      setVal('streaming-subtitle', data.streaming.subtitle);
      setVal('streaming-desc', data.streaming.description);
      setVal('streaming-yt-url', data.streaming.youtubeUrl);
      setVal('streaming-embed-url', data.streaming.embedUrl);
      setVal('streaming-btn-text', data.streaming.buttonText);
    }

    // Media fields & previews
    bindImageField('cover-image', data.media.coverImage);
    bindImageField('cover-image-admin', data.media.coverImage);
    bindImageField('hero-main-image', data.media.heroMain);
    bindImageField('hero-couple-1', data.media.heroCouple1);
    bindImageField('hero-couple-2', data.media.heroCouple2);
    bindImageField('hero-couple-3', data.media.heroCouple3);
    bindImageField('hero-couple-4', data.media.heroCouple4);
    bindImageField('bg-location', data.media.bgLocation);
    bindImageField('bg-dresscode', data.media.bgDresscode);
    bindImageField('bg-gift', data.media.bgGift);

    // Audio
    setVal('audio-url', data.media.audio ? data.media.audio.url : 'assets/audio/wedding-song.mp3');
    setVal('audio-title', data.media.audio ? data.media.audio.title : 'Wedding Romantic Instrumental');
    const audioAutoplayEl = document.getElementById('audio-autoplay');
    if (audioAutoplayEl) audioAutoplayEl.checked = !!(data.media.audio && data.media.audio.autoplay);

    // Audio file uploader
    const audioFileInput = document.getElementById('audio-file');
    if (audioFileInput) {
      audioFileInput.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (re) => {
            setVal('audio-url', re.target.result);
            saveAllFormData(false);
            showAdminToast('File audio berhasil dimuat!');
          };
          reader.readAsDataURL(file);
        }
      };
    }

    // Dresscode
    setVal('dresscode-desc', data.dresscode.description);

    // Physical gift
    if (data.gift.physicalGift) {
      const physEnable = document.getElementById('phys-gift-enable');
      if (physEnable) physEnable.checked = !!data.gift.physicalGift.enabled;
      setVal('phys-recipient-name', data.gift.physicalGift.recipientName);
      setVal('phys-recipient-name-admin', data.gift.physicalGift.recipientName);
      setVal('phys-address', data.gift.physicalGift.address);
      setVal('phys-address-admin', data.gift.physicalGift.address);
      setVal('phys-phone', data.gift.physicalGift.phone);
    }

    // Story Title & Subtitle
    if (data.story) {
      setVal('story-section-title', data.story.title || 'Our Love Story');
      setVal('story-section-subtitle', data.story.subtitle || 'Bagaimana Kisah Kami Dimulai');
    }

    // Appearance / Theme
    if (data.appearance) {
      setVal('theme-primary-color', data.appearance.primaryColor || '#d4af37');
      setVal('theme-secondary-color', data.appearance.secondaryColor || '#f3f0eb');
      setVal('theme-accent-color', data.appearance.accentColor || '#e5c158');
      setVal('theme-bg-base', data.appearance.bgBase || '#0a0a0a');
      setVal('theme-card-bg', data.appearance.cardBg || 'rgba(20, 20, 20, 0.85)');
      setVal('theme-font-title', data.appearance.titleFont || "'Playfair Display', serif");
      setVal('theme-font-heading', data.appearance.headingFont || "'Alata', sans-serif");
      setVal('theme-font-body', data.appearance.bodyFont || "'DM Sans', sans-serif");
      setVal('theme-font-script', data.appearance.scriptFont || "'Alex Brush', cursive");
      setVal('custom-css-code', data.appearance.customCss || '');
      setVal('custom-js-code', data.appearance.customJs || '');
    }
  }

  function setVal(id, val) {
    const els = document.querySelectorAll(`#${id}`);
    els.forEach(el => {
      if (val !== undefined) el.value = val;
    });
  }

  function getVal(id, fallbackVal = '') {
    const el = document.getElementById(id) || document.getElementById(id + '-admin');
    if (!el) return fallbackVal;
    const v = el.value !== undefined ? el.value.trim() : '';
    return v !== '' ? v : fallbackVal;
  }

  function bindImageField(fieldId, initialUrl) {
    const urlInputs = document.querySelectorAll(`#${fieldId}`);
    const fileInputs = document.querySelectorAll(`#${fieldId}-file`);
    const previews = document.querySelectorAll(`#${fieldId}-preview`);

    urlInputs.forEach(urlInput => {
      urlInput.value = initialUrl || '';
      urlInput.addEventListener('input', () => {
        previews.forEach(p => p.src = urlInput.value);
        saveAllFormData(false);
      });
    });

    previews.forEach(p => {
      if (initialUrl) p.src = initialUrl;
    });

    fileInputs.forEach(fileInput => {
      fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (re) => {
            const base64Url = re.target.result;
            urlInputs.forEach(ui => ui.value = base64Url);
            previews.forEach(p => p.src = base64Url);
            saveAllFormData(false);
          };
          reader.readAsDataURL(file);
        }
      });
    });
  }

  /* ===================================================================
     6. REAL-TIME LIVE SYNC LISTENERS
     =================================================================== */
  function initRealtimeLiveSync() {
    const liveInputs = [
      'theme-primary-color', 'theme-secondary-color', 'theme-accent-color', 'theme-bg-base',
      'theme-font-title', 'theme-font-heading', 'theme-font-body', 'theme-font-script',
      'custom-css-code', 'site-title', 'couple-name-short', 'cover-to-prefix', 'default-guest-name',
      'groom-fullname', 'groom-nickname', 'groom-parents', 'groom-instagram', 'groom-about',
      'bride-fullname', 'bride-nickname', 'bride-parents', 'bride-instagram', 'bride-about',
      'quote-text', 'quote-text-admin', 'quote-source', 'quote-source-admin', 'countdown-date',
      'akad-title', 'akad-date', 'akad-date-admin', 'akad-time', 'akad-time-admin', 'akad-venue', 'akad-venue-admin', 'akad-address', 'akad-address-admin', 'akad-maps',
      'resepsi-title', 'resepsi-date', 'resepsi-date-admin', 'resepsi-time', 'resepsi-time-admin', 'resepsi-venue', 'resepsi-venue-admin', 'resepsi-address', 'resepsi-address-admin', 'resepsi-maps',
      'streaming-title', 'streaming-subtitle', 'streaming-desc', 'streaming-yt-url', 'streaming-embed-url', 'streaming-btn-text',
      'audio-url', 'audio-title', 'dresscode-desc', 'phys-recipient-name', 'phys-recipient-name-admin', 'phys-address', 'phys-address-admin', 'phys-phone',
      'story-section-title', 'story-section-subtitle', 'brand-name', 'brand-url'
    ];

    liveInputs.forEach(id => {
      const els = document.querySelectorAll(`#${id}`);
      els.forEach(el => {
        el.addEventListener('input', () => saveAllFormData(false));
        el.addEventListener('change', () => saveAllFormData(false));
      });
    });

    const liveCheckboxes = ['streaming-enable', 'audio-autoplay', 'phys-gift-enable'];
    liveCheckboxes.forEach(id => {
      const els = document.querySelectorAll(`#${id}`);
      els.forEach(el => {
        el.addEventListener('change', () => saveAllFormData(false));
      });
    });
  }

  /* ===================================================================
     7. AUDIO PREVIEW IN ADMIN
     =================================================================== */
  function initAdminAudioTester() {
    const btnTests = document.querySelectorAll('#btn-admin-preview-audio');

    btnTests.forEach(btnTest => {
      btnTest.onclick = () => {
        const url = getVal('audio-url') || 'assets/audio/wedding-song.mp3';
        if (!adminAudioPlayer) {
          adminAudioPlayer = new Audio(url);
        } else if (adminAudioPlayer.src !== url) {
          adminAudioPlayer.pause();
          adminAudioPlayer = new Audio(url);
        }

        if (adminAudioPlayer.paused) {
          adminAudioPlayer.play().then(() => {
            btnTests.forEach(b => {
              b.innerHTML = '<i class="fas fa-pause"></i> Hentikan Lagu';
              b.classList.add('btn-primary');
            });
          }).catch(err => {
            showAdminToast('Tidak dapat memutar audio: ' + err.message);
          });
        } else {
          adminAudioPlayer.pause();
          btnTests.forEach(b => {
            b.innerHTML = '<i class="fas fa-play"></i> Tes Lagu';
            b.classList.remove('btn-primary');
          });
        }
      };
    });
  }

  /* ===================================================================
     8. THEME PRESETS & SECTION TOGGLES
     =================================================================== */
  function renderThemePresets() {
    const presets = [
      { id: "luxury-gold", name: "Luxury Gold", primary: "#d4af37", secondary: "#f3f0eb", bg: "#0a0a0a", card: "rgba(20, 20, 20, 0.85)" },
      { id: "rose-gold", name: "Rose Gold", primary: "#e8a598", secondary: "#fff0ed", bg: "#140d12", card: "rgba(30, 16, 24, 0.85)" },
      { id: "emerald-luxury", name: "Emerald", primary: "#2ecc71", secondary: "#e8f8f0", bg: "#06170f", card: "rgba(10, 32, 22, 0.85)" },
      { id: "royal-navy", name: "Royal Navy", primary: "#60a5fa", secondary: "#eef4ff", bg: "#080e1e", card: "rgba(14, 24, 48, 0.85)" },
      { id: "earthy-terracotta", name: "Terracotta", primary: "#d97706", secondary: "#fef3c7", bg: "#1c120c", card: "rgba(38, 24, 16, 0.85)" },
      { id: "dark-silver", name: "Silver", primary: "#cbd5e1", secondary: "#ffffff", bg: "#0f172a", card: "rgba(30, 41, 59, 0.85)" }
    ];

    const presetContainers = document.querySelectorAll('#theme-presets-grid');
    presetContainers.forEach(container => {
      container.innerHTML = presets.map(p => `
        <div class="preset-card" style="background:#141720; border:1px solid #2c3242; border-radius:8px; padding:8px 10px; cursor:pointer; display:flex; align-items:center; gap:8px; transition:all 0.2s;" onclick="applyThemePreset('${p.id}')">
          <div style="width:24px; height:24px; border-radius:50%; background:${p.primary}; border:2px solid ${p.secondary}; flex-shrink:0;"></div>
          <div>
            <div style="font-weight:bold; font-size:11px; color:#fff;">${p.name}</div>
          </div>
        </div>
      `).join('');
    });
  }

  window.applyThemePreset = function(presetId) {
    const presetMap = {
      "luxury-gold": { primary: "#d4af37", secondary: "#f3f0eb", accent: "#e5c158", bg: "#0a0a0a", card: "rgba(20, 20, 20, 0.85)" },
      "rose-gold": { primary: "#e8a598", secondary: "#fff0ed", accent: "#fbcfe8", bg: "#140d12", card: "rgba(30, 16, 24, 0.85)" },
      "emerald-luxury": { primary: "#2ecc71", secondary: "#e8f8f0", accent: "#a7f3d0", bg: "#06170f", card: "rgba(10, 32, 22, 0.85)" },
      "royal-navy": { primary: "#60a5fa", secondary: "#eef4ff", accent: "#93c5fd", bg: "#080e1e", card: "rgba(14, 24, 48, 0.85)" },
      "earthy-terracotta": { primary: "#d97706", secondary: "#fef3c7", accent: "#fde68a", bg: "#1c120c", card: "rgba(38, 24, 16, 0.85)" },
      "dark-silver": { primary: "#cbd5e1", secondary: "#ffffff", accent: "#94a3b8", bg: "#0f172a", card: "rgba(30, 41, 59, 0.85)" }
    };

    const p = presetMap[presetId];
    if (p) {
      setVal('theme-primary-color', p.primary);
      setVal('theme-secondary-color', p.secondary);
      setVal('theme-accent-color', p.accent);
      setVal('theme-bg-base', p.bg);
      setVal('theme-card-bg', p.card);
      saveAllFormData(false);
      showAdminToast(`Tema ${presetId} diterapkan seketika! ✨`);
    }
  };

  function renderSectionToggles(data) {
    const secLists = document.querySelectorAll('#section-toggles-list');
    const sectionsMeta = [
      { key: "hero", label: "Cover & Hero Utama" },
      { key: "couple", label: "Profil Mempelai & Quote" },
      { key: "story", label: "Our Love Story" },
      { key: "events", label: "Waktu & Lokasi Acara" },
      { key: "streaming", label: "Live Streaming (Virtual)" },
      { key: "countdown", label: "Hitung Mundur Acara" },
      { key: "dresscode", label: "Panduan Dress Code" },
      { key: "gallery", label: "Galeri Foto & Lightbox" },
      { key: "turutMengundang", label: "Turut Mengundang" },
      { key: "gift", label: "Wedding Gift (Amplop)" },
      { key: "prokes", label: "Protokol Kesehatan" },
      { key: "wishes", label: "Buku Tamu & RSVP" }
    ];

    const currentSecs = data.sections || {};

    secLists.forEach(container => {
      container.innerHTML = sectionsMeta.map(s => {
        const isChecked = currentSecs[s.key] !== false;
        return `
          <div style="display:flex; justify-content:space-between; align-items:center; padding:8px 10px; background:#141720; border-radius:6px; border:1px solid #2c3242; margin-bottom:6px;">
            <span style="font-weight:600; font-size:12px; color:#fff;">${s.label}</span>
            <input type="checkbox" id="sec-toggle-${s.key}" ${isChecked ? 'checked' : ''} style="width:16px; height:16px; cursor:pointer;" onchange="updateSectionToggle('${s.key}', this.checked)">
          </div>
        `;
      }).join('');
    });
  }

  window.updateSectionToggle = function(key, val) {
    const curData = DataStore.get();
    if (!curData.sections) curData.sections = {};
    curData.sections[key] = val;
    DataStore.save(curData);
    showAdminToast(`Bagian ${key} ${val ? 'diaktifkan' : 'disembunyikan'}.`);
  };

  /* ===================================================================
     9. LOVE STORY / TIMELINE MANAGER
     =================================================================== */
  function renderStoryManager(data) {
    const lists = document.querySelectorAll('#story-milestones-list');
    const timeline = (data.story && data.story.timeline) ? data.story.timeline : [];

    lists.forEach(list => {
      list.innerHTML = timeline.map((item, idx) => `
        <div class="admin-card" style="background:#141720; margin-bottom:10px; padding:10px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
            <span style="font-weight:bold; color:var(--admin-primary); font-size:12px;">#${idx + 1}: ${item.title}</span>
            <button type="button" class="admin-btn btn-danger btn-sm" onclick="deleteStoryMilestone('${item.id}')" style="padding:2px 8px; font-size:10px;"><i class="fas fa-trash"></i></button>
          </div>
          <div class="form-group-admin" style="margin-bottom:6px;">
            <input type="text" class="form-input-admin" value="${item.date}" oninput="updateStoryField('${item.id}', 'date', this.value)" placeholder="Tanggal">
          </div>
          <div class="form-group-admin" style="margin-bottom:6px;">
            <input type="text" class="form-input-admin" value="${item.title}" oninput="updateStoryField('${item.id}', 'title', this.value)" placeholder="Judul">
          </div>
          <div class="form-group-admin" style="margin-bottom:6px;">
            <textarea class="form-textarea-admin" rows="2" oninput="updateStoryField('${item.id}', 'story', this.value)" placeholder="Isi Cerita">${item.story}</textarea>
          </div>
          <div class="form-group-admin" style="margin-bottom:0;">
            <input type="text" class="form-input-admin" value="${item.image || ''}" oninput="updateStoryField('${item.id}', 'image', this.value)" placeholder="URL Foto Momen">
          </div>
        </div>
      `).join('');
    });

    document.querySelectorAll('#btn-add-story-milestone').forEach(btn => {
      btn.onclick = () => {
        const curData = DataStore.get();
        if (!curData.story) curData.story = { title: 'Our Love Story', subtitle: 'Kisah Kami', timeline: [] };
        if (!curData.story.timeline) curData.story.timeline = [];

        curData.story.timeline.push({
          id: 's_' + Date.now(),
          date: 'Tanggal Baru',
          title: 'Momen Spesial',
          story: 'Tuliskan kisah indah perjalanan cinta Anda di sini...',
          image: 'assets/images/gallery-1.jpg'
        });

        DataStore.save(curData);
        renderStoryManager(curData);
        showAdminToast('Momen cerita baru ditambahkan.');
      };
    });
  }

  window.updateStoryField = function(id, field, val) {
    const curData = DataStore.get();
    const item = curData.story.timeline.find(s => s.id === id);
    if (item) {
      item[field] = val;
      DataStore.save(curData);
    }
  };

  window.deleteStoryMilestone = function(id) {
    if (!confirm('Hapus momen cerita ini?')) return;
    const curData = DataStore.get();
    curData.story.timeline = curData.story.timeline.filter(s => s.id !== id);
    DataStore.save(curData);
    renderStoryManager(curData);
    showAdminToast('Momen cerita dihapus.');
  };

  /* ===================================================================
     10. TURUT MENGUNDANG & PROKES MANAGERS
     =================================================================== */
  function renderTurutMengundangManager(data) {
    const containers = document.querySelectorAll('#turut-mengundang-manager-list');
    const list = (data.turutMengundang && data.turutMengundang.families) ? data.turutMengundang.families : [];

    containers.forEach(container => {
      container.innerHTML = list.map((fam, idx) => `
        <div style="display:flex; align-items:center; gap:6px; margin-bottom:6px;">
          <input type="text" class="form-input-admin" style="flex:1;" value="${fam}" oninput="updateTurutMengundang(${idx}, this.value)">
          <button type="button" class="admin-btn btn-danger btn-sm" onclick="deleteTurutMengundang(${idx})"><i class="fas fa-trash"></i></button>
        </div>
      `).join('');
    });

    document.querySelectorAll('#btn-add-turut-mengundang').forEach(btn => {
      btn.onclick = () => {
        const curData = DataStore.get();
        if (!curData.turutMengundang) curData.turutMengundang = { enabled: true, title: 'Turut Mengundang', families: [] };
        curData.turutMengundang.families.push('Keluarga Besar Bpk/Ibu...');
        DataStore.save(curData);
        renderTurutMengundangManager(curData);
      };
    });
  }

  window.updateTurutMengundang = function(idx, val) {
    const curData = DataStore.get();
    curData.turutMengundang.families[idx] = val;
    DataStore.save(curData);
  };

  window.deleteTurutMengundang = function(idx) {
    const curData = DataStore.get();
    curData.turutMengundang.families.splice(idx, 1);
    DataStore.save(curData);
    renderTurutMengundangManager(curData);
  };

  function renderProkesManager(data) {
    const containers = document.querySelectorAll('#prokes-manager-list');
    const list = (data.prokes && data.prokes.items) ? data.prokes.items : [];

    containers.forEach(container => {
      container.innerHTML = list.map((item, idx) => `
        <div style="display:flex; align-items:center; gap:6px; margin-bottom:6px; background:#141720; padding:6px; border-radius:6px;">
          <input type="text" class="form-input-admin" style="width:110px;" value="${item.icon}" oninput="updateProkesField(${idx}, 'icon', this.value)" placeholder="Ikon FA">
          <input type="text" class="form-input-admin" style="flex:1;" value="${item.text}" oninput="updateProkesField(${idx}, 'text', this.value)">
          <button type="button" class="admin-btn btn-danger btn-sm" onclick="deleteProkes(${idx})"><i class="fas fa-trash"></i></button>
        </div>
      `).join('');
    });

    document.querySelectorAll('#btn-add-prokes').forEach(btn => {
      btn.onclick = () => {
        const curData = DataStore.get();
        if (!curData.prokes) curData.prokes = { enabled: true, items: [] };
        curData.prokes.items.push({ icon: 'fas fa-check-circle', text: 'Protokol Kesehatan Baru' });
        DataStore.save(curData);
        renderProkesManager(curData);
      };
    });
  }

  window.updateProkesField = function(idx, field, val) {
    const curData = DataStore.get();
    curData.prokes.items[idx][field] = val;
    DataStore.save(curData);
  };

  window.deleteProkes = function(idx) {
    const curData = DataStore.get();
    curData.prokes.items.splice(idx, 1);
    DataStore.save(curData);
    renderProkesManager(curData);
  };

  /* ===================================================================
     11. GUEST DATABASE & INSTANT OPENABLE LINKS
     =================================================================== */
  function renderGuestDatabase(data) {
    const tableBodies = document.querySelectorAll('#guest-database-body');
    const guests = data.guestList || [];

    tableBodies.forEach(tableBody => {
      if (guests.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding:14px; color:#888;">Belum ada data tamu tersimpan.</td></tr>`;
        return;
      }

      const baseUrl = getBaseInvitationUrl();

      tableBody.innerHTML = guests.map((g, idx) => {
        const link = buildGuestUrl(baseUrl, g.name, g.category, g.session, g.table);
        const waMsg = buildWaMessage(data, g.name, link, g.category, g.session, g.table);
        const waUrl = g.phone ? `https://api.whatsapp.com/send?phone=${cleanPhone(g.phone)}&text=${encodeURIComponent(waMsg)}` : `https://api.whatsapp.com/send?text=${encodeURIComponent(waMsg)}`;

        return `
          <tr>
            <td>${idx + 1}</td>
            <td>
              <strong>${escapeHtml(g.name)}</strong>
              <div style="font-size:10px; color:#888;">${escapeHtml(g.category || 'Umum')} &bull; ${escapeHtml(g.session || 'Sesi 1')}</div>
            </td>
            <td>
              <div style="display:flex; gap:4px; flex-wrap:wrap;">
                <a href="${link}" target="_blank" class="admin-btn btn-primary btn-sm" style="padding:3px 8px; font-size:11px;" title="Buka Undangan Tamu Ini">
                  <i class="fas fa-external-link-alt"></i> Buka
                </a>
                <button type="button" class="admin-btn btn-secondary btn-sm" style="padding:3px 8px; font-size:11px;" onclick="copyTextToClipboard('${link}', 'Link undangan disalin!')">
                  <i class="far fa-copy"></i>
                </button>
                <a href="${waUrl}" target="_blank" class="admin-btn btn-success btn-sm" style="padding:3px 8px; font-size:11px;">
                  <i class="fab fa-whatsapp"></i> WA
                </a>
              </div>
            </td>
            <td>
              <button type="button" class="admin-btn btn-danger btn-sm" style="padding:3px 8px; font-size:11px;" onclick="deleteGuestEntry('${g.id}')">
                <i class="fas fa-trash"></i>
              </button>
            </td>
          </tr>
        `;
      }).join('');
    });

    document.querySelectorAll('#btn-add-new-guest').forEach(btn => {
      btn.onclick = () => {
        const name = getVal('new-guest-name');
        if (!name) {
          alert('Mohon masukkan nama tamu.');
          return;
        }

        const newGuest = {
          name: name,
          category: getVal('new-guest-category') || 'Umum',
          session: getVal('new-guest-session') || 'Sesi 1 (Akad & Resepsi)',
          table: getVal('new-guest-table') || '',
          phone: getVal('new-guest-phone') || ''
        };

        DataStore.saveGuest(newGuest);
        const curData = DataStore.get();
        renderGuestDatabase(curData);
        updateDashboardStats(curData);

        setVal('new-guest-name', '');
        setVal('new-guest-table', '');
        setVal('new-guest-phone', '');
        showAdminToast(`Tamu ${name} berhasil ditambahkan dan link siap dibuka!`);
      };
    });
  }

  window.deleteGuestEntry = function(id) {
    if (!confirm('Hapus data tamu ini?')) return;
    DataStore.deleteGuest(id);
    const curData = DataStore.get();
    renderGuestDatabase(curData);
    updateDashboardStats(curData);
    showAdminToast('Data tamu dihapus.');
  };

  function getBaseInvitationUrl() {
    let base = window.location.href;
    if (base.includes('admin.html')) {
      base = base.replace('admin.html', 'index.html');
    } else if (base.endsWith('/')) {
      base = base + 'index.html';
    } else if (!base.includes('index.html')) {
      base = base.substring(0, base.lastIndexOf('/') + 1) + 'index.html';
    }
    return base.split('?')[0].split('#')[0];
  }

  function buildGuestUrl(baseUrl, name, category, session, table) {
    const params = new URLSearchParams();
    if (name) params.set('to', name);
    if (category && category !== 'Umum') params.set('kategori', category);
    if (session) params.set('sesi', session);
    if (table) params.set('meja', table);
    return `${baseUrl}?${params.toString()}`;
  }

  function buildWaMessage(data, guestName, link, category, session, table) {
    const couple = data.general.coupleNameShort || 'Irsyad & Adisty';
    return `Kepada Yth.
Bapak/Ibu/Saudara/i: *${guestName}*
${category ? `(${category})` : ''}

Tanpa mengurangi rasa hormat, perkenankan kami mengundang Anda untuk menghadiri acara pernikahan kami:

*${couple}*

${session ? `🗓 Waktu Acara: ${session}` : ''}
${table ? `🪑 Tempat Duduk: ${table}` : ''}

Berikut tautan undangan digital resmi Anda:
${link}

Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan untuk hadir dan memberikan doa restu.

Terima kasih.`;
  }

  function cleanPhone(phone) {
    let p = phone.replace(/[^0-9]/g, '');
    if (p.startsWith('0')) p = '62' + p.substring(1);
    return p;
  }

  /* ===================================================================
     12. BULK WHATSAPP GENERATOR
     =================================================================== */
  function initWhatsAppGenerator(data) {
    const inputBulks = document.querySelectorAll('#wa-bulk-guests');
    const btnGenerates = document.querySelectorAll('#btn-generate-wa-links');
    const resultContainers = document.querySelectorAll('#wa-links-results');

    const defaultTemplate = `Kepada Yth.
Bapak/Ibu/Saudara/i: *[NAMA_TAMU]*

Tanpa mengurangi rasa hormat, perkenankan kami mengundang Anda untuk menghadiri acara pernikahan kami:

*${data.general.coupleNameShort || 'Irsyad & Adisty'}*

Berikut tautan undangan digital Anda:
${getBaseInvitationUrl()}?to=[NAMA_TAMU]

Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan untuk hadir dan memberikan doa restu.

Terima kasih.`;

    btnGenerates.forEach(btn => {
      btn.onclick = () => {
        let rawBulk = '';
        inputBulks.forEach(i => {
          if (i.value.trim()) rawBulk = i.value.trim();
        });

        if (!rawBulk) {
          alert('Mohon masukkan daftar nama tamu (1 nama per baris).');
          return;
        }

        const names = rawBulk.split('\n').map(n => n.trim()).filter(n => n.length > 0);
        const baseUrl = getBaseInvitationUrl();

        const curData = DataStore.get();
        names.forEach(name => {
          if (!curData.guestList.some(g => g.name === name)) {
            curData.guestList.push({
              id: 'gst_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
              name: name,
              category: 'Umum',
              session: 'Sesi 1 (Akad & Resepsi)',
              table: '',
              phone: '',
              createdAt: new Date().toISOString().slice(0, 10)
            });
          }
        });
        DataStore.save(curData);
        renderGuestDatabase(curData);
        updateDashboardStats(curData);

        resultContainers.forEach(container => {
          container.innerHTML = names.map((name, idx) => {
            const link = buildGuestUrl(baseUrl, name);
            const msg = defaultTemplate
              .replace(/\[NAMA_TAMU\]/g, name)
              .replace(/\[LINK_UNDANGAN\]/g, link);
            const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;

            return `
              <div style="background:#141720; border:1px solid #2c3242; border-radius:6px; padding:8px; margin-bottom:6px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                  <span style="font-weight:bold; color:var(--admin-text-main); font-size:12px;">${idx + 1}. ${escapeHtml(name)}</span>
                  <div style="display:flex; gap:4px;">
                    <a href="${link}" target="_blank" class="admin-btn btn-primary btn-sm" style="padding:2px 6px; font-size:10px;">Buka</a>
                    <button type="button" class="admin-btn btn-secondary btn-sm" style="padding:2px 6px; font-size:10px;" onclick="copyTextToClipboard('${link}', 'Link disalin!')">Salin</button>
                    <a href="${waUrl}" target="_blank" class="admin-btn btn-success btn-sm" style="padding:2px 6px; font-size:10px;">WA</a>
                  </div>
                </div>
              </div>
            `;
          }).join('');
        });

        showAdminToast(`${names.length} link tamu berhasil di-generate & disimpan!`);
      };
    });
  }

  /* ===================================================================
     13. GALLERY & OTHER MANAGERS
     =================================================================== */
  function renderGalleryManager(data) {
    const grids = document.querySelectorAll('#gallery-manager-grid');

    grids.forEach(grid => {
      grid.innerHTML = (data.media.gallery || []).map(item => `
        <div class="gallery-item-card" data-id="${item.id}">
          <img src="${item.url}" alt="${item.caption || ''}">
          <button type="button" class="btn-del-img" onclick="deleteGalleryItem('${item.id}')">
            <i class="fas fa-trash"></i>
          </button>
          <div class="card-body">
            <input type="text" class="form-input-admin" style="font-size:10px; padding:3px 6px;" value="${item.caption || ''}" placeholder="Caption" oninput="updateGalleryCaption('${item.id}', this.value)">
          </div>
        </div>
      `).join('');
    });

    document.querySelectorAll('#new-gallery-photo-file').forEach(photoFileInput => {
      photoFileInput.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (re) => {
            document.querySelectorAll('#new-gallery-photo-url').forEach(u => u.value = re.target.result);
          };
          reader.readAsDataURL(file);
        }
      };
    });

    document.querySelectorAll('#btn-add-gallery-photo').forEach(btnAddPhoto => {
      btnAddPhoto.onclick = () => {
        const url = getVal('new-gallery-photo-url');
        const caption = getVal('new-gallery-photo-caption');
        if (!url) {
          alert('Mohon masukkan URL foto atau pilih file gambar.');
          return;
        }

        const curData = DataStore.get();
        if (!curData.media.gallery) curData.media.gallery = [];
        curData.media.gallery.push({
          id: 'g_' + Date.now(),
          url: url,
          caption: caption || `Foto ${curData.media.gallery.length + 1}`
        });

        DataStore.save(curData);
        renderGalleryManager(curData);
        setVal('new-gallery-photo-url', '');
        setVal('new-gallery-photo-caption', '');
        showAdminToast('Foto ditambahkan ke galeri.');
      };
    });
  }

  window.deleteGalleryItem = function(id) {
    if (!confirm('Hapus foto ini?')) return;
    const curData = DataStore.get();
    curData.media.gallery = curData.media.gallery.filter(g => g.id !== id);
    DataStore.save(curData);
    renderGalleryManager(curData);
    showAdminToast('Foto dihapus.');
  };

  window.updateGalleryCaption = function(id, newCaption) {
    const curData = DataStore.get();
    const item = curData.media.gallery.find(g => g.id === id);
    if (item) {
      item.caption = newCaption;
      DataStore.save(curData);
    }
  };

  function renderDresscodeManager(data) {
    const lists = document.querySelectorAll('#dresscode-colors-list');

    lists.forEach(list => {
      list.innerHTML = (data.dresscode.colors || []).map((c, idx) => `
        <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px; background:#141720; padding:6px 10px; border-radius:6px;">
          <input type="color" value="${c.hex}" style="width:28px; height:28px; border:none; border-radius:4px; cursor:pointer;" onchange="updateDressColorHex(${idx}, this.value)">
          <input type="text" class="form-input-admin" style="flex:1;" value="${c.name}" oninput="updateDressColorName(${idx}, this.value)" placeholder="Nama Warna">
          <button type="button" class="admin-btn btn-danger btn-sm" onclick="deleteDressColor(${idx})">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      `).join('');
    });

    document.querySelectorAll('#btn-add-dress-color').forEach(btnAddColor => {
      btnAddColor.onclick = () => {
        const curData = DataStore.get();
        if (!curData.dresscode.colors) curData.dresscode.colors = [];
        curData.dresscode.colors.push({ name: 'Warna Baru', hex: '#d4af37' });
        DataStore.save(curData);
        renderDresscodeManager(curData);
      };
    });
  }

  window.updateDressColorHex = function(idx, hex) {
    const curData = DataStore.get();
    if (curData.dresscode.colors[idx]) {
      curData.dresscode.colors[idx].hex = hex;
      DataStore.save(curData);
    }
  };

  window.updateDressColorName = function(idx, name) {
    const curData = DataStore.get();
    if (curData.dresscode.colors[idx]) {
      curData.dresscode.colors[idx].name = name;
      DataStore.save(curData);
    }
  };

  window.deleteDressColor = function(idx) {
    const curData = DataStore.get();
    curData.dresscode.colors.splice(idx, 1);
    DataStore.save(curData);
    renderDresscodeManager(curData);
  };

  function renderBankManager(data) {
    const lists = document.querySelectorAll('#banks-manager-list');

    lists.forEach(list => {
      list.innerHTML = (data.gift.banks || []).map(b => `
        <div class="admin-card" style="margin-bottom:8px; padding:10px; background:#141720;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
            <span style="font-weight:bold; color:var(--admin-primary); font-size:12px;"><i class="${b.icon || 'fas fa-university'}"></i> ${b.bankName}</span>
            <button type="button" class="admin-btn btn-danger btn-sm" onclick="deleteBank('${b.id}')" style="padding:2px 6px; font-size:10px;"><i class="fas fa-trash"></i></button>
          </div>
          <div class="form-group-admin" style="margin-bottom:6px;">
            <input type="text" class="form-input-admin" value="${b.bankName}" oninput="updateBankField('${b.id}', 'bankName', this.value)" placeholder="Nama Bank">
          </div>
          <div class="form-group-admin" style="margin-bottom:6px;">
            <input type="text" class="form-input-admin" value="${b.accountNumber}" oninput="updateBankField('${b.id}', 'accountNumber', this.value)" placeholder="No Rekening">
          </div>
          <div class="form-group-admin" style="margin-bottom:0;">
            <input type="text" class="form-input-admin" value="${b.accountHolder}" oninput="updateBankField('${b.id}', 'accountHolder', this.value)" placeholder="A.N">
          </div>
        </div>
      `).join('');
    });

    document.querySelectorAll('#btn-add-bank').forEach(btnAddBank => {
      btnAddBank.onclick = () => {
        const curData = DataStore.get();
        if (!curData.gift.banks) curData.gift.banks = [];
        curData.gift.banks.push({
          id: 'b_' + Date.now(),
          bankName: 'BCA / Mandiri / E-Wallet',
          accountNumber: '1234567890',
          accountHolder: curData.general.coupleNameShort || 'Irsyad & Adisty',
          icon: 'fas fa-credit-card'
        });
        DataStore.save(curData);
        renderBankManager(curData);
        showAdminToast('Rekening baru ditambahkan.');
      };
    });
  }

  window.updateBankField = function(id, field, val) {
    const curData = DataStore.get();
    const bank = curData.gift.banks.find(b => b.id === id);
    if (bank) {
      bank[field] = val;
      DataStore.save(curData);
    }
  };

  window.deleteBank = function(id) {
    if (!confirm('Hapus rekening ini?')) return;
    const curData = DataStore.get();
    curData.gift.banks = curData.gift.banks.filter(b => b.id !== id);
    DataStore.save(curData);
    renderBankManager(curData);
    showAdminToast('Rekening dihapus.');
  };

  /* ===================================================================
     14. WISHES & RSVP MODERATION
     =================================================================== */
  function renderWishesManager(data) {
    const tableBodies = document.querySelectorAll('#wishes-table-body');
    const wishes = data.wishes || [];

    tableBodies.forEach(tableBody => {
      if (wishes.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding:14px; color:#888;">Belum ada ucapan tamu.</td></tr>`;
        return;
      }

      tableBody.innerHTML = wishes.map((w, idx) => {
        let badge = '<span style="color:#10b981; font-weight:600;">Hadir</span>';
        if (w.status === 'tidak') badge = '<span style="color:#ef4444; font-weight:600;">Tidak</span>';
        if (w.status === 'ragu') badge = '<span style="color:#f59e0b; font-weight:600;">Ragu</span>';

        return `
          <tr>
            <td><strong>${escapeHtml(w.name)}</strong></td>
            <td>${badge} (${w.pax || 1} pax)</td>
            <td style="font-size:11px;">
              ${escapeHtml(w.message)}
              ${w.reply ? `<div style="color:var(--admin-primary); margin-top:2px;">Balasan: "${escapeHtml(w.reply)}"</div>` : ''}
            </td>
            <td>
              <div style="display:flex; gap:4px;">
                <button type="button" class="admin-btn btn-secondary btn-sm" style="padding:2px 6px; font-size:10px;" onclick="promptReplyWish('${w.id}')" title="Balas">
                  <i class="fas fa-reply"></i>
                </button>
                <button type="button" class="admin-btn btn-danger btn-sm" style="padding:2px 6px; font-size:10px;" onclick="deleteAdminWish('${w.id}')" title="Hapus">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </td>
          </tr>
        `;
      }).join('');
    });

    document.querySelectorAll('#btn-export-wishes-csv').forEach(btnExportCSV => {
      btnExportCSV.onclick = () => {
        exportWishesToCSV(wishes);
      };
    });
  }

  window.promptReplyWish = function(id) {
    const curData = DataStore.get();
    const item = curData.wishes.find(w => w.id === id);
    if (!item) return;

    const currentReply = item.reply || '';
    const newReply = prompt(`Balas ucapan dari ${item.name}:`, currentReply);
    if (newReply !== null) {
      DataStore.replyWish(id, newReply.trim());
      renderWishesManager(DataStore.get());
      showAdminToast('Balasan ucapan berhasil disimpan!');
    }
  };

  window.deleteAdminWish = function(id) {
    if (!confirm('Hapus ucapan ini?')) return;
    DataStore.deleteWish(id);
    const curData = DataStore.get();
    renderWishesManager(curData);
    updateDashboardStats(curData);
    showAdminToast('Ucapan berhasil dihapus.');
  };

  function exportWishesToCSV(wishes) {
    let csv = "No,Nama Tamu,Status Kehadiran,Jumlah Pax,Ucapan & Doa,Waktu,Balasan\n";
    wishes.forEach((w, idx) => {
      const name = `"${(w.name || '').replace(/"/g, '""')}"`;
      const status = w.status || 'hadir';
      const pax = w.pax || 1;
      const msg = `"${(w.message || '').replace(/"/g, '""')}"`;
      const time = w.createdAt || '';
      const reply = `"${(w.reply || '').replace(/"/g, '""')}"`;
      csv += `${idx + 1},${name},${status},${pax},${msg},${time},${reply}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `rekap-kehadiran-undangan-${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function updateDashboardStats(data) {
    const wishes = data.wishes || [];
    const guests = data.guestList || [];
    let hadir = 0;
    let tidak = 0;
    let ragu = 0;
    let totalPax = 0;

    wishes.forEach(w => {
      const p = parseInt(w.pax) || 1;
      if (w.status === 'hadir') {
        hadir++;
        totalPax += p;
      } else if (w.status === 'tidak') {
        tidak++;
      } else {
        ragu++;
      }
    });

    document.querySelectorAll('#stat-total-wishes').forEach(el => el.textContent = wishes.length);
    document.querySelectorAll('#stat-hadir').forEach(el => el.textContent = `${hadir} (${ragu} ragu)`);
    document.querySelectorAll('#stat-tidak').forEach(el => el.textContent = tidak);
    document.querySelectorAll('#stat-total-pax').forEach(el => el.textContent = totalPax);
    document.querySelectorAll('#stat-total-guests').forEach(el => el.textContent = guests.length);
  }

  /* ===================================================================
     15. SAVE ALL FORM DATA (TOTAL REAL-TIME SYNC)
     =================================================================== */
  function saveAllFormData(notifyUser = true) {
    const data = DataStore.get();

    // General
    data.general.siteTitle = getVal('site-title', data.general.siteTitle);
    data.general.coupleNameShort = getVal('couple-name-short', data.general.coupleNameShort);
    data.general.coverToPrefix = getVal('cover-to-prefix', data.general.coverToPrefix);
    data.general.defaultGuestName = getVal('default-guest-name', data.general.defaultGuestName);
    data.general.brandName = getVal('brand-name', data.general.brandName);
    data.general.brandUrl = getVal('brand-url', data.general.brandUrl);
    data.general.quote = getVal('quote-text', data.general.quote);
    data.general.quoteSource = getVal('quote-source', data.general.quoteSource);

    // Groom
    data.general.groom.photo = getVal('groom-photo', data.general.groom.photo);
    data.general.groom.fullName = getVal('groom-fullname', data.general.groom.fullName);
    data.general.groom.nickname = getVal('groom-nickname', data.general.groom.nickname);
    data.general.groom.parents = getVal('groom-parents', data.general.groom.parents);
    data.general.groom.instagram = getVal('groom-instagram', data.general.groom.instagram);
    data.general.groom.about = getVal('groom-about', data.general.groom.about);

    // Bride
    data.general.bride.photo = getVal('bride-photo', data.general.bride.photo);
    data.general.bride.fullName = getVal('bride-fullname', data.general.bride.fullName);
    data.general.bride.nickname = getVal('bride-nickname', data.general.bride.nickname);
    data.general.bride.parents = getVal('bride-parents', data.general.bride.parents);
    data.general.bride.instagram = getVal('bride-instagram', data.general.bride.instagram);
    data.general.bride.about = getVal('bride-about', data.general.bride.about);

    // Event & Countdown
    data.event.countdownDate = getVal('countdown-date', data.event.countdownDate);

    // Akad
    data.event.akad.title = getVal('akad-title', data.event.akad.title);
    data.event.akad.date = getVal('akad-date', data.event.akad.date);
    data.event.akad.time = getVal('akad-time', data.event.akad.time);
    data.event.akad.venue = getVal('akad-venue', data.event.akad.venue);
    data.event.akad.address = getVal('akad-address', data.event.akad.address);
    data.event.akad.mapsUrl = getVal('akad-maps', data.event.akad.mapsUrl);

    // Resepsi
    data.event.resepsi.title = getVal('resepsi-title', data.event.resepsi.title);
    data.event.resepsi.date = getVal('resepsi-date', data.event.resepsi.date);
    data.event.resepsi.time = getVal('resepsi-time', data.event.resepsi.time);
    data.event.resepsi.venue = getVal('resepsi-venue', data.event.resepsi.venue);
    data.event.resepsi.address = getVal('resepsi-address', data.event.resepsi.address);
    data.event.resepsi.mapsUrl = getVal('resepsi-maps', data.event.resepsi.mapsUrl);

    // Story
    if (!data.story) data.story = {};
    data.story.title = getVal('story-section-title', data.story.title || 'Our Love Story');
    data.story.subtitle = getVal('story-section-subtitle', data.story.subtitle || 'Bagaimana Kisah Kami Dimulai');

    // Streaming
    if (!data.streaming) data.streaming = {};
    const streamEnable = document.getElementById('streaming-enable');
    if (streamEnable) data.streaming.enabled = streamEnable.checked;
    data.streaming.title = getVal('streaming-title', data.streaming.title);
    data.streaming.subtitle = getVal('streaming-subtitle', data.streaming.subtitle);
    data.streaming.description = getVal('streaming-desc', data.streaming.description);
    data.streaming.youtubeUrl = getVal('streaming-yt-url', data.streaming.youtubeUrl);
    data.streaming.embedUrl = getVal('streaming-embed-url', data.streaming.embedUrl);
    data.streaming.buttonText = getVal('streaming-btn-text', data.streaming.buttonText);

    // Media
    data.media.coverImage = getVal('cover-image', data.media.coverImage);
    data.media.heroMain = getVal('hero-main-image', data.media.heroMain);
    data.media.heroCouple1 = getVal('hero-couple-1', data.media.heroCouple1);
    data.media.heroCouple2 = getVal('hero-couple-2', data.media.heroCouple2);
    data.media.heroCouple3 = getVal('hero-couple-3', data.media.heroCouple3);
    data.media.heroCouple4 = getVal('hero-couple-4', data.media.heroCouple4);
    data.media.bgLocation = getVal('bg-location', data.media.bgLocation);
    data.media.bgDresscode = getVal('bg-dresscode', data.media.bgDresscode);
    data.media.bgGift = getVal('bg-gift', data.media.bgGift);

    // Audio
    if (!data.media.audio) data.media.audio = {};
    data.media.audio.url = getVal('audio-url', data.media.audio.url || 'assets/audio/wedding-song.mp3');
    data.media.audio.title = getVal('audio-title', data.media.audio.title || 'Wedding Romantic Instrumental');
    const audioAutoplayEl = document.getElementById('audio-autoplay');
    if (audioAutoplayEl) data.media.audio.autoplay = audioAutoplayEl.checked;

    // Dresscode
    data.dresscode.description = getVal('dresscode-desc', data.dresscode.description);

    // Physical gift
    const physEnable = document.getElementById('phys-gift-enable');
    if (!data.gift.physicalGift) data.gift.physicalGift = {};
    if (physEnable) data.gift.physicalGift.enabled = physEnable.checked;
    data.gift.physicalGift.recipientName = getVal('phys-recipient-name', data.gift.physicalGift.recipientName);
    data.gift.physicalGift.address = getVal('phys-address', data.gift.physicalGift.address);
    data.gift.physicalGift.phone = getVal('phys-phone', data.gift.physicalGift.phone);

    // Appearance
    if (!data.appearance) data.appearance = {};
    data.appearance.primaryColor = getVal('theme-primary-color', data.appearance.primaryColor);
    data.appearance.secondaryColor = getVal('theme-secondary-color', data.appearance.secondaryColor);
    data.appearance.accentColor = getVal('theme-accent-color', data.appearance.accentColor);
    data.appearance.bgBase = getVal('theme-bg-base', data.appearance.bgBase);
    data.appearance.cardBg = getVal('theme-card-bg', data.appearance.cardBg);
    data.appearance.titleFont = getVal('theme-font-title', data.appearance.titleFont);
    data.appearance.headingFont = getVal('theme-font-heading', data.appearance.headingFont);
    data.appearance.bodyFont = getVal('theme-font-body', data.appearance.bodyFont);
    data.appearance.scriptFont = getVal('theme-font-script', data.appearance.scriptFont);
    data.appearance.customCss = getVal('custom-css-code', data.appearance.customCss);
    data.appearance.customJs = getVal('custom-js-code', data.appearance.customJs);

    // Particles Engine Config
    if (!data.appearance.particles) data.appearance.particles = {};
    const particleEnable = document.getElementById('particle-enable');
    const pType = getVal('particle-type', data.appearance.particles.type || 'flowers');
    data.appearance.particles.enabled = particleEnable ? particleEnable.checked : true;
    data.appearance.particles.type = (particleEnable && !particleEnable.checked) ? 'none' : pType;
    data.appearance.particles.speed = getVal('particle-speed', 'medium');
    data.appearance.particles.density = getVal('particle-density', 'medium');
    data.appearance.particles.size = getVal('particle-size', 'medium');
    data.appearance.particles.colorMode = getVal('particle-color-mode', 'auto');
    data.appearance.particles.customColor = getVal('particle-custom-color', '#d4af37');
    data.appearance.particles.windSway = getVal('particle-wind-sway', 'gentle');
    data.appearance.fallingParticles = data.appearance.particles.type;

    DataStore.save(data);
    
    if (notifyUser) {
      showAdminToast('Seluruh konfigurasi tema & data berhasil disimpan & disinkronkan ke tampilan tamu! 🎉');
    }
  }

  /* ===================================================================
     16. BACKUP & RESTORE / PUBLISH SYNC
     =================================================================== */
  function initBackupRestore() {
    document.querySelectorAll('#btn-export-json').forEach(btn => {
      btn.onclick = () => {
        DataStore.exportJSON();
        showAdminToast('File backup JSON berhasil diunduh!');
      };
    });

    document.querySelectorAll('#btn-export-data-json').forEach(btn => {
      btn.onclick = () => {
        DataStore.exportDataJSON();
        showAdminToast('File data.json siap publikasi berhasil diunduh! 🎉');
      };
    });

    document.querySelectorAll('#btn-copy-json').forEach(btn => {
      btn.onclick = () => {
        const jsonStr = JSON.stringify(DataStore.get(), null, 2);
        navigator.clipboard.writeText(jsonStr).then(() => {
          showAdminToast('Data JSON berhasil disalin ke clipboard! 📋');
        });
      };
    });

    document.querySelectorAll('#file-import-json').forEach(input => {
      input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
          const res = DataStore.importJSON(event.target.result);
          if (res.success) {
            alert('Konfigurasi berhasil diimpor! Halaman akan dimuat ulang.');
            window.location.reload();
          } else {
            alert('Gagal mengimpor JSON: ' + res.error);
          }
        };
        reader.readAsText(file);
      };
    });

    document.querySelectorAll('#btn-reset-default').forEach(btn => {
      btn.onclick = () => {
        if (confirm('PERINGATAN: Apakah Anda yakin ingin mereset seluruh data kembali ke kondisi pengaturan awal?')) {
          DataStore.resetDefault();
          alert('Data berhasil direset ke pengaturan awal! Halaman akan dimuat ulang.');
          window.location.reload();
        }
      };
    });
  }

  /* ===================================================================
     HELPERS & UTILITIES
     =================================================================== */
  function showAdminToast(msg) {
    let toast = document.getElementById('admin-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'admin-toast';
      toast.style.cssText = `
        position: fixed;
        bottom: 24px;
        right: 24px;
        background: #1e222d;
        color: #fff;
        border: 1px solid var(--admin-primary);
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.7);
        z-index: 999999;
        font-size: 13px;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 8px;
        transition: transform 0.3s ease, opacity 0.3s ease;
      `;
      document.body.appendChild(toast);
    }
    toast.innerHTML = `<i class="fas fa-check-circle" style="color:var(--admin-primary)"></i> ${msg}`;
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(20px)';
    }, 3000);
  }

  window.copyTextToClipboard = function(text, successMsg) {
    navigator.clipboard.writeText(text).then(() => {
      showAdminToast(successMsg || 'Berhasil disalin ke clipboard!');
    }).catch(() => {
      showAdminToast('Gagal menyalin text.');
    });
  };

  function escapeHtml(text) {
    if (!text) return '';
    return text.replace(/[&<>"']/g, function(m) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
      }[m];
    });
  }
});
