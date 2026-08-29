/**
 * Invitation Controller - Frontend Interactivity, Full Dynamic Theme Rendering,
 * Particles Engine Linkage, Google Calendar, ScrollSpy & Unified State Sync
 */

document.addEventListener('DOMContentLoaded', () => {
  let appData = DataStore.get();
  let bgAudio = null;
  let isAudioPlaying = false;
  let countdownInterval = null;
  let autoScrollInterval = null;
  let isAutoScrolling = false;
  let activeLightboxIndex = 0;
  let selectedSticker = 'assets/stickers/sticker001.gif';
  let selectedPresence = 'hadir';

  // Read URL query parameters robustly (?to=...&kategori=...&sesi=...&meja=...)
  const guestParams = parseGuestUrlParams(appData);

  /* ===================================================================
     GUEST MODE DETECTION
     When the URL contains ?to= (a personalized guest link), we lock the
     page into "guest-mode": all admin controls, the settings button, the
     gear icon, and the entire unified editor drawer are hidden so guests
     cannot accidentally or intentionally modify the invitation.
     Supports both standard (?to=Name) and hash-based (#?to=Name) URLs.
     =================================================================== */
  (function detectGuestMode() {
    const urlParams = new URLSearchParams(window.location.search);
    let hasGuestParam = urlParams.has('to') && urlParams.get('to').trim() !== '';

    // Also check hash-based param: index.html#?to=Name
    if (!hasGuestParam && window.location.hash.includes('?')) {
      const hashQuery = window.location.hash.split('?')[1];
      const hashParams = new URLSearchParams(hashQuery);
      hasGuestParam = hashParams.has('to') && hashParams.get('to').trim() !== '';
    }

    if (hasGuestParam) {
      document.body.classList.add('guest-mode');
      // Extra: prevent keyboard shortcut hacks from opening drawer
      window.__GUEST_MODE__ = true;
    }
  })();

  // Loading page removal helper - GUARANTEED
  function removeLoadingScreen() {
    const loader = document.getElementById('loadingpage');
    if (loader) {
      loader.classList.add('loaded');
      setTimeout(() => {
        if (loader) {
          loader.style.display = 'none';
          loader.style.opacity = '0';
          loader.style.visibility = 'hidden';
          loader.style.pointerEvents = 'none';
        }
      }, 600);
    }
  }

  // Remove loading screen immediately or after short delay
  setTimeout(removeLoadingScreen, 400);
  window.addEventListener('load', removeLoadingScreen);

  // Initialize Falling Particles Engine safely
  try {
    if (window.ParticlesEngine) {
      const canvasEl = document.getElementById('particle-canvas');
      const pConf = (appData.appearance && appData.appearance.particles) ? appData.appearance.particles : { type: 'flowers' };
      const primaryColor = (appData.appearance && appData.appearance.primaryColor) ? appData.appearance.primaryColor : '#d4af37';
      window.ParticlesEngine.init(canvasEl, pConf, primaryColor);
    }
  } catch (pErr) {
    console.warn('ParticlesEngine init skipped:', pErr);
  }

  // Apply initial theme appearance & render all data safely
  try {
    applyAppearanceStyles(appData);
    renderInvitationData(appData, guestParams);
    initStickerPicker();
    initAudio(appData);
    startCountdown(appData.event.countdownDate);
    initLightbox(appData);
    initScrollSpy();
    initCalendarButton(appData);
  } catch (initErr) {
    console.error('Initialization error:', initErr);
  } finally {
    removeLoadingScreen();
  }

  /* ===================================================================
     REAL-TIME SYNC LISTENERS (CustomEvent, Cross-Tab Storage, PostMessage)
     =================================================================== */
  function handleDataUpdate(newData) {
    if (!newData) return;
    appData = newData;
    applyAppearanceStyles(appData);
    renderInvitationData(appData, guestParams);
    startCountdown(appData.event.countdownDate);
    initLightbox(appData);
    initAudio(appData);
    initCalendarButton(appData);

    // Update Particles Engine Live
    if (window.ParticlesEngine && appData.appearance) {
      window.ParticlesEngine.updateConfig(
        appData.appearance.particles || { type: appData.appearance.fallingParticles || 'flowers' },
        appData.appearance.primaryColor || '#d4af37'
      );
    }
  }

  // Initialize dynamic theme & check remote data
  if (typeof DataStore.loadRemoteData === 'function') {
    DataStore.loadRemoteData().then(latestData => {
      if (latestData) handleDataUpdate(latestData);
    }).catch(() => {});
  }

  // 1. Same-window / Local event
  window.addEventListener('invitationDataUpdated', (e) => {
    handleDataUpdate(e.detail);
  });

  // 2. Cross-tab storage event (When admin is open in another tab/window)
  window.addEventListener('storage', (e) => {
    if ((e.key === 'wedding_invitation_irsyad_adisty_data' || e.key === 'wedding_invitation_tema20_data') && e.newValue) {
      try {
        const parsed = JSON.parse(e.newValue);
        handleDataUpdate(parsed);
      } catch (err) {
        console.error('Error parsing cross-tab storage data', err);
      }
    }
  });

  // 3. PostMessage event (When loaded inside Admin Simulator iframe, parent or popup window)
  window.addEventListener('message', (e) => {
    if (e.data && e.data.type === 'invitationDataUpdated' && e.data.data) {
      handleDataUpdate(e.data.data);
    }
  });

  // 4. BroadcastChannel for instant real-time sync across all tabs/windows
  if (typeof BroadcastChannel !== 'undefined') {
    try {
      const syncBc = new BroadcastChannel('wedding_invitation_sync_channel');
      syncBc.onmessage = (e) => {
        if (e.data && e.data.type === 'invitationDataUpdated' && e.data.data) {
          handleDataUpdate(e.data.data);
        }
      };
    } catch(bcErr) {}
  }

  // Open Invitation Button Click
  const btnOpen = document.getElementById('btn-open-inv');
  const coverOverlay = document.getElementById('cover-overlay');
  if (btnOpen && coverOverlay) {
    btnOpen.addEventListener('click', () => {
      coverOverlay.classList.add('opened');
      if (bgAudio && appData.media && appData.media.audio && appData.media.audio.autoplay) {
        playAudio();
      }
      triggerEntranceAnimations();
    });
  }

  // Audio Toggle Click
  const btnMusic = document.getElementById('btn-music-toggle');
  if (btnMusic) {
    btnMusic.addEventListener('click', () => {
      if (isAudioPlaying) {
        pauseAudio();
      } else {
        playAudio();
      }
    });
  }

  // Auto Scroll Toggle Click
  const btnAutoScroll = document.getElementById('btn-auto-scroll');
  if (btnAutoScroll) {
    btnAutoScroll.addEventListener('click', () => {
      toggleAutoScroll(btnAutoScroll);
    });
  }

  // Back to Top Click
  const btnToTop = document.getElementById('btn-to-top');
  if (btnToTop) {
    btnToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Presence Buttons
  const presenceBtns = document.querySelectorAll('.presence-btn');
  presenceBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      presenceBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedPresence = btn.dataset.status;
    });
  });

  // RSVP Form Submit
  const rsvpForm = document.getElementById('rsvp-form');
  if (rsvpForm) {
    rsvpForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const nameInput = document.getElementById('input-guest-name');
      const paxInput = document.getElementById('input-pax');
      const messageInput = document.getElementById('input-wishes');

      if (!nameInput.value.trim() || !messageInput.value.trim()) {
        showToast('Mohon lengkapi nama dan ucapan Anda.');
        return;
      }

      DataStore.addWish({
        name: nameInput.value.trim(),
        status: selectedPresence,
        pax: paxInput ? parseInt(paxInput.value) : 1,
        message: messageInput.value.trim(),
        sticker: selectedSticker
      });

      messageInput.value = '';
      showToast('Terima kasih atas ucapan & doanya! ❤️');
      renderWishesList(DataStore.get().wishes);
    });
  }

  // Physical Gift Address Copy Button
  const btnCopyPhys = document.getElementById('btn-copy-phys-address');
  if (btnCopyPhys) {
    btnCopyPhys.addEventListener('click', () => {
      const p = appData.gift && appData.gift.physicalGift ? appData.gift.physicalGift : null;
      if (p) {
        const fullAddr = `${p.recipientName}\n${p.address}\nTelp: ${p.phone}`;
        navigator.clipboard.writeText(fullAddr).then(() => {
          showToast('Alamat pengiriman kado fisik berhasil disalin!');
        });
      }
    });
  }

  /* ===================================================================
     URL PARSER HELPER (Supports ?to=..., &sesi=..., &meja=..., &kategori=...)
     =================================================================== */
  function parseGuestUrlParams(data) {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      let rawTo = urlParams.get('to') || '';
      
      if (!rawTo && window.location.hash.includes('?')) {
        const hashQuery = window.location.hash.split('?')[1];
        const hashParams = new URLSearchParams(hashQuery);
        rawTo = hashParams.get('to') || '';
      }

      const guestName = rawTo.trim() ? decodeURIComponent(rawTo.replace(/\+/g, ' ')) : (data.general.defaultGuestName || 'Penerima Undangan');
      const category = urlParams.get('kategori') || urlParams.get('cat') || '';
      const session = urlParams.get('sesi') || '';
      const table = urlParams.get('meja') || '';

      return {
        name: guestName,
        category: category,
        session: session,
        table: table
      };
    } catch (e) {
      console.warn('Error parsing guest URL params', e);
      return {
        name: (data && data.general && data.general.defaultGuestName) ? data.general.defaultGuestName : 'Penerima Undangan',
        category: '',
        session: '',
        table: ''
      };
    }
  }

  /* ===================================================================
     RENDER FUNCTIONS
     =================================================================== */
  function renderInvitationData(data, guest) {
    if (!data) return;

    // Page Title
    document.title = data.general.siteTitle || 'Undangan Pernikahan';

    // 1. Cover Section
    const coverGuestEl = document.getElementById('cover-guest-name');
    if (coverGuestEl) coverGuestEl.textContent = guest.name;
    const coverDearEl = document.getElementById('cover-dear-prefix');
    if (coverDearEl) coverDearEl.textContent = data.general.coverToPrefix || 'Dear';
    const coverImgEl = document.getElementById('cover-modal-img') || document.getElementById('cover-image');
    if (coverImgEl) coverImgEl.src = data.media.coverImage || 'assets/images/hero-couple-1.jpg';
    const coverCoupleName = document.getElementById('cover-couple-name');
    if (coverCoupleName) coverCoupleName.textContent = data.general.coupleNameShort;

    // Badges on Cover (VIP / Sesi / Meja)
    const coverMetaEl = document.getElementById('cover-guest-meta');
    if (coverMetaEl) {
      let metaHtml = '';
      if (guest.category) metaHtml += `<span class="badge-guest-tag"><i class="fas fa-crown"></i> ${escapeHtml(guest.category)}</span>`;
      if (guest.session) metaHtml += `<span class="badge-guest-tag"><i class="fas fa-clock"></i> ${escapeHtml(guest.session)}</span>`;
      if (guest.table) metaHtml += `<span class="badge-guest-tag"><i class="fas fa-chair"></i> ${escapeHtml(guest.table)}</span>`;
      coverMetaEl.innerHTML = metaHtml;
    }

    // Toggle Section Visibility
    toggleSection('section-home', data.sections ? data.sections.hero : true);
    toggleSection('section-story', data.sections ? data.sections.story : true);
    toggleSection('section-event', data.sections ? data.sections.events : true);
    toggleSection('section-streaming', data.sections ? (data.sections.streaming && data.streaming && data.streaming.enabled) : true);
    toggleSection('section-dresscode', data.sections ? data.sections.dresscode : true);
    toggleSection('section-gallery', data.sections ? data.sections.gallery : true);
    toggleSection('section-gift', data.sections ? data.sections.gift : true);
    toggleSection('section-turut-mengundang', data.sections ? (data.sections.turutMengundang && data.turutMengundang && data.turutMengundang.enabled) : true);
    toggleSection('section-prokes', data.sections ? (data.sections.prokes && data.prokes && data.prokes.enabled) : true);
    toggleSection('section-wishes', data.sections ? data.sections.wishes : true);

    // 2. Couple Info & Avatars
    const groomNameEl = document.getElementById('groom-name');
    if (groomNameEl) groomNameEl.textContent = data.general.groom.fullName;
    const groomHeaderName = document.getElementById('groom-header-name');
    if (groomHeaderName) groomHeaderName.textContent = data.general.groom.fullName || data.general.groom.nickname || 'Irsyad';
    const groomParentsEl = document.getElementById('groom-parents');
    if (groomParentsEl) groomParentsEl.textContent = data.general.groom.parents;
    const groomAboutEl = document.getElementById('groom-about');
    if (groomAboutEl) {
      groomAboutEl.textContent = data.general.groom.about || '';
      groomAboutEl.style.display = data.general.groom.about ? 'block' : 'none';
    }
    const groomAvatarEl = document.getElementById('groom-avatar');
    if (groomAvatarEl) {
      groomAvatarEl.src = data.general.groom.photo || data.media.heroCouple1 || 'assets/images/hero-couple-1.jpg';
    }
    const groomInstaEl = document.getElementById('groom-insta');
    if (groomInstaEl && data.general.groom.instagram) {
      groomInstaEl.href = data.general.groom.instagram;
      groomInstaEl.textContent = '@' + data.general.groom.nickname.toLowerCase();
    }

    const brideNameEl = document.getElementById('bride-name');
    if (brideNameEl) brideNameEl.textContent = data.general.bride.fullName;
    const brideHeaderName = document.getElementById('bride-header-name');
    if (brideHeaderName) brideHeaderName.textContent = data.general.bride.fullName || data.general.bride.nickname || 'Adisty';
    const brideParentsEl = document.getElementById('bride-parents');
    if (brideParentsEl) brideParentsEl.textContent = data.general.bride.parents;
    const brideAboutEl = document.getElementById('bride-about');
    if (brideAboutEl) {
      brideAboutEl.textContent = data.general.bride.about || '';
      brideAboutEl.style.display = data.general.bride.about ? 'block' : 'none';
    }
    const brideAvatarEl = document.getElementById('bride-avatar');
    if (brideAvatarEl) {
      brideAvatarEl.src = data.general.bride.photo || data.media.heroCouple2 || 'assets/images/hero-couple-2.jpg';
    }
    const brideInstaEl = document.getElementById('bride-insta');
    if (brideInstaEl && data.general.bride.instagram) {
      brideInstaEl.href = data.general.bride.instagram;
      brideInstaEl.textContent = '@' + data.general.bride.nickname.toLowerCase();
    }

    // Quotes
    const quoteTextEl = document.getElementById('quote-text');
    if (quoteTextEl) quoteTextEl.textContent = `“${data.general.quote.replace(/^[“"”]+|[“"”]+$/g, '')}”`;
    const quoteSourceEl = document.getElementById('quote-source');
    if (quoteSourceEl) quoteSourceEl.textContent = data.general.quoteSource;

    // Hero Images
    const heroMainEl = document.getElementById('hero-main-img');
    if (heroMainEl && data.media.heroMain) heroMainEl.src = data.media.heroMain;
    const heroC1 = document.getElementById('hero-c1');
    if (heroC1 && data.media.heroCouple1) heroC1.src = data.media.heroCouple1;
    const heroC3 = document.getElementById('hero-c3');
    if (heroC3) heroC3.src = data.media.heroCouple3 || data.general.groom.photo || 'assets/images/hero-couple-1.jpg';
    const heroC2 = document.getElementById('hero-c2');
    if (heroC2) heroC2.src = data.media.heroCouple2 || data.general.bride.photo || 'assets/images/hero-couple-2.jpg';
    const heroC4 = document.getElementById('hero-c4');
    if (heroC4 && data.media.heroCouple4) heroC4.src = data.media.heroCouple4;

    // 3. Love Story / Timeline
    const storyTitleEl = document.getElementById('story-title');
    if (storyTitleEl && data.story) storyTitleEl.textContent = data.story.title || 'Our Love Story';
    const storySubEl = document.getElementById('story-subtitle');
    if (storySubEl && data.story) storySubEl.textContent = data.story.subtitle || '';
    const timelineContainer = document.getElementById('story-timeline-container');
    if (timelineContainer && data.story && data.story.timeline) {
      timelineContainer.innerHTML = data.story.timeline.map(item => `
        <div class="timeline-item">
          <div class="timeline-dot"></div>
          <div class="timeline-card">
            <div class="timeline-date"><i class="far fa-calendar-check"></i> ${escapeHtml(item.date)}</div>
            <div class="timeline-title">${escapeHtml(item.title)}</div>
            <div class="timeline-desc">${escapeHtml(item.story)}</div>
            ${item.image ? `<img src="${item.image}" alt="${escapeHtml(item.title)}" class="timeline-img">` : ''}
          </div>
        </div>
      `).join('');
    }

    // 4. Events (Akad & Resepsi) & Tray Summary Note
    const akadSessionTitle = document.getElementById('akad-session-title');
    if (akadSessionTitle && data.event.akad.title) akadSessionTitle.textContent = data.event.akad.title;
    const trayAkadTitle = document.getElementById('tray-akad-title');
    if (trayAkadTitle && data.event.akad.title) trayAkadTitle.textContent = data.event.akad.title.toUpperCase();

    const akadDateEl = document.getElementById('akad-date');
    if (akadDateEl) akadDateEl.textContent = data.event.akad.date;
    const weddingDateBadge = document.getElementById('wedding-date-badge');
    if (weddingDateBadge && data.event.akad.date) weddingDateBadge.textContent = data.event.akad.date.toUpperCase();

    const akadTimeEl = document.getElementById('akad-time');
    if (akadTimeEl) akadTimeEl.textContent = data.event.akad.time;
    const trayAkadTime = document.getElementById('tray-akad-time');
    if (trayAkadTime && data.event.akad.time) trayAkadTime.textContent = data.event.akad.time;

    const akadVenueEl = document.getElementById('akad-venue');
    if (akadVenueEl) akadVenueEl.textContent = data.event.akad.venue;
    const akadAddressEl = document.getElementById('akad-address');
    if (akadAddressEl) akadAddressEl.textContent = data.event.akad.address;
    const akadGmapsEl = document.getElementById('akad-gmaps-link');
    if (akadGmapsEl && data.event.akad.mapsUrl) akadGmapsEl.href = data.event.akad.mapsUrl;

    const resepsiSessionTitle = document.getElementById('resepsi-session-title');
    if (resepsiSessionTitle && data.event.resepsi.title) resepsiSessionTitle.textContent = data.event.resepsi.title;
    const trayResepsiTitle = document.getElementById('tray-resepsi-title');
    if (trayResepsiTitle && data.event.resepsi.title) trayResepsiTitle.textContent = data.event.resepsi.title.toUpperCase();

    const resepsiDateEl = document.getElementById('resepsi-date');
    if (resepsiDateEl) resepsiDateEl.textContent = data.event.resepsi.date;
    const resepsiTimeEl = document.getElementById('resepsi-time');
    if (resepsiTimeEl) resepsiTimeEl.textContent = data.event.resepsi.time;
    const trayResepsiTime = document.getElementById('tray-resepsi-time');
    if (trayResepsiTime && data.event.resepsi.time) trayResepsiTime.textContent = data.event.resepsi.time;

    const resepsiVenueEl = document.getElementById('resepsi-venue');
    if (resepsiVenueEl) resepsiVenueEl.textContent = data.event.resepsi.venue;
    const resepsiAddressEl = document.getElementById('resepsi-address');
    if (resepsiAddressEl) resepsiAddressEl.textContent = data.event.resepsi.address;
    const resepsiGmapsEl = document.getElementById('resepsi-gmaps-link');
    if (resepsiGmapsEl && data.event.resepsi.mapsUrl) resepsiGmapsEl.href = data.event.resepsi.mapsUrl;

    // 5. Live Streaming
    if (data.streaming && data.streaming.enabled) {
      const streamTitle = document.getElementById('streaming-title-el');
      if (streamTitle) streamTitle.textContent = data.streaming.title || 'Live Streaming';
      const streamSub = document.getElementById('streaming-subtitle-el');
      if (streamSub) streamSub.textContent = data.streaming.subtitle || 'Virtual Wedding';
      const streamDesc = document.getElementById('streaming-description');
      if (streamDesc) streamDesc.textContent = data.streaming.description || '';
      const streamBtn = document.getElementById('streaming-btn-link');
      if (streamBtn) {
        streamBtn.href = data.streaming.youtubeUrl || '#';
        streamBtn.innerHTML = `<i class="fab fa-youtube"></i> ${data.streaming.buttonText || 'Tonton Live Streaming'}`;
      }
      const streamIframe = document.getElementById('streaming-iframe');
      if (streamIframe) {
        streamIframe.src = resolveYouTubeEmbed(data.streaming.embedUrl || data.streaming.youtubeUrl);
      }
    }

    // 6. Sticky Backgrounds
    const stickyLocEl = document.getElementById('sticky-card-location');
    if (stickyLocEl && data.media.bgLocation) {
      stickyLocEl.style.backgroundImage = `url('${data.media.bgLocation}')`;
    }
    const stickyDressEl = document.getElementById('sticky-card-dresscode');
    if (stickyDressEl && data.media.bgDresscode) {
      stickyDressEl.style.backgroundImage = `url('${data.media.bgDresscode}')`;
    }
    const stickyGiftEl = document.getElementById('sticky-card-gift');
    if (stickyGiftEl && data.media.bgGift) {
      stickyGiftEl.style.backgroundImage = `url('${data.media.bgGift}')`;
    }

    // 7. Dress Code
    const dressDescEl = document.getElementById('dresscode-description');
    if (dressDescEl) dressDescEl.textContent = data.dresscode.description;
    const dressPaletteEl = document.getElementById('dresscode-palette');
    if (dressPaletteEl && data.dresscode.colors) {
      dressPaletteEl.innerHTML = data.dresscode.colors.map(c => `
        <div class="color-swatch-item" onclick="showToast('Palet: ${c.name} (${c.hex})')">
          <div class="color-circle" style="background-color: ${c.hex};"></div>
          <div class="color-name">${c.name}</div>
        </div>
      `).join('');
    }

    // 8. Gallery
    const galleryGridEl = document.getElementById('gallery-grid');
    if (galleryGridEl && data.media.gallery) {
      galleryGridEl.innerHTML = data.media.gallery.map((item, idx) => `
        <div class="gallery-grid-item" data-index="${idx}">
          <img src="${item.url}" alt="${item.caption || 'Foto Galeri'}" loading="lazy">
        </div>
      `).join('');

      galleryGridEl.querySelectorAll('.gallery-grid-item').forEach(el => {
        el.addEventListener('click', () => {
          openLightbox(parseInt(el.dataset.index), data.media.gallery);
        });
      });
    }

    // 9. Turut Mengundang
    if (data.turutMengundang && data.turutMengundang.enabled) {
      const turutTitle = document.getElementById('turut-mengundang-title');
      if (turutTitle) turutTitle.textContent = data.turutMengundang.title || 'Turut Mengundang';
      const familyListEl = document.getElementById('turut-mengundang-list');
      if (familyListEl && data.turutMengundang.families) {
        familyListEl.innerHTML = data.turutMengundang.families.map(fam => `
          <div class="family-pill"><i class="fas fa-user-friends" style="color:var(--primary-color); margin-right:6px;"></i> ${escapeHtml(fam)}</div>
        `).join('');
      }
    }

    // 10. Protokol Kesehatan
    if (data.prokes && data.prokes.enabled) {
      const prokesSub = document.getElementById('prokes-subtitle');
      if (prokesSub && data.prokes.subtitle) prokesSub.textContent = data.prokes.subtitle;
      const prokesGrid = document.getElementById('prokes-grid');
      if (prokesGrid && data.prokes.items) {
        prokesGrid.innerHTML = data.prokes.items.map(item => `
          <div class="prokes-item">
            <div class="prokes-icon"><i class="${item.icon || 'fas fa-shield-virus'}"></i></div>
            <div class="prokes-text">${escapeHtml(item.text)}</div>
          </div>
        `).join('');
      }
    }

    // 11. Digital Gift / Bank Cards
    const bankListEl = document.getElementById('bank-accounts-list');
    if (bankListEl && data.gift.banks) {
      bankListEl.innerHTML = data.gift.banks.map(bank => `
        <div class="gift-card-box">
          <div class="bank-logo-row">
            <div class="bank-name"><i class="${bank.icon || 'fas fa-credit-card'}"></i> ${bank.bankName}</div>
          </div>
          <div class="bank-account-number" id="acc-${bank.id}">${bank.accountNumber}</div>
          <div class="bank-account-holder">A.N : ${bank.accountHolder}</div>
          <button type="button" class="btn-copy-account" data-account="${bank.accountNumber}">
            <i class="far fa-copy"></i> Salin Nomor Rekening
          </button>
        </div>
      `).join('');

      bankListEl.querySelectorAll('.btn-copy-account').forEach(btn => {
        btn.addEventListener('click', () => {
          const acc = btn.dataset.account;
          navigator.clipboard.writeText(acc).then(() => {
            showToast(`Nomor rekening ${acc} berhasil disalin!`);
          }).catch(() => {
            showToast('Gagal menyalin rekening.');
          });
        });
      });
    }

    // Physical Gift
    const physGiftBox = document.getElementById('physical-gift-box');
    if (physGiftBox && data.gift.physicalGift) {
      physGiftBox.style.display = data.gift.physicalGift.enabled ? 'block' : 'none';
      const physName = document.getElementById('phys-recipient-name');
      const physAddr = document.getElementById('phys-recipient-address');
      const physPhone = document.getElementById('phys-recipient-phone');
      if (physName) physName.textContent = data.gift.physicalGift.recipientName;
      if (physAddr) physAddr.textContent = data.gift.physicalGift.address;
      if (physPhone) physPhone.textContent = `Telp/WA: ${data.gift.physicalGift.phone}`;
    }

    // 12. Wishes
    renderWishesList(data.wishes || []);

    // 13. Brand Watermark
    const brandNameEl = document.getElementById('brand-name-text');
    if (brandNameEl) brandNameEl.textContent = data.general.brandName || 'Irsyad & Adisty';
    const hostNameEl = document.getElementById('host-name');
    if (hostNameEl) hostNameEl.textContent = data.general.coupleNameShort || data.general.brandName || 'Irsyad & Adisty';
    const brandLinkEl = document.getElementById('brand-link');
    if (brandLinkEl) {
      if (data.general.brandUrl) {
        brandLinkEl.href = data.general.brandUrl;
      } else {
        brandLinkEl.removeAttribute('href');
        brandLinkEl.style.textDecoration = 'none';
        brandLinkEl.style.color = 'inherit';
      }
    }

    // Prefill name in RSVP if provided
    const inputGuest = document.getElementById('input-guest-name');
    if (inputGuest && guest.name && guest.name !== 'Penerima Undangan') {
      inputGuest.value = guest.name;
    }
  }

  function resolveYouTubeEmbed(url) {
    if (!url) return '';
    if (url.includes('embed/')) return url;
    if (url.includes('watch?v=')) {
      const id = url.split('watch?v=')[1].split('&')[0];
      return `https://www.youtube.com/embed/${id}`;
    }
    if (url.includes('youtu.be/')) {
      const id = url.split('youtu.be/')[1].split('?')[0];
      return `https://www.youtube.com/embed/${id}`;
    }
    return url;
  }

  function toggleSection(sectionId, isVisible) {
    const sec = document.getElementById(sectionId);
    if (sec) {
      sec.style.display = isVisible ? 'block' : 'none';
    }
  }

  function renderWishesList(wishes) {
    const feedEl = document.getElementById('wishes-feed');
    if (!feedEl) return;

    if (!wishes || wishes.length === 0) {
      feedEl.innerHTML = '<p style="text-align:center;color:#888;padding:20px;">Belum ada ucapan. Jadilah yang pertama memberikan doa!</p>';
      return;
    }

    feedEl.innerHTML = wishes.map(w => {
      let badgeClass = 'badge-hadir';
      let badgeText = 'Hadir';
      if (w.status === 'tidak') {
        badgeClass = 'badge-tidak';
        badgeText = 'Tidak Hadir';
      } else if (w.status === 'ragu') {
        badgeClass = 'badge-ragu';
        badgeText = 'Masih Ragu';
      }

      return `
        <div class="wish-card" id="wish-card-${w.id}">
          <div class="wish-card-header">
            <div>
              <span class="wish-author">${escapeHtml(w.name)}</span>
              <span class="wish-presence-badge ${badgeClass}">${badgeText} (${w.pax || 1} orang)</span>
            </div>
            <span class="wish-time">${w.createdAt || ''}</span>
          </div>
          <div class="wish-content-row">
            ${w.sticker ? `<img src="${w.sticker}" alt="Sticker" class="wish-sticker">` : ''}
            <div class="wish-message">${escapeHtml(w.message)}</div>
          </div>
          <div class="wish-footer">
            <button type="button" class="btn-like-wish" onclick="handleLikeWish('${w.id}')">
              <i class="fas fa-heart"></i> <span id="like-count-${w.id}">${w.likes || 0}</span> Suka
            </button>
          </div>
          ${w.reply ? `
            <div class="wish-reply-box">
              <div class="wish-reply-title"><i class="fas fa-reply"></i> Balasan Mempelai:</div>
              <div>${escapeHtml(w.reply)}</div>
            </div>
          ` : ''}
        </div>
      `;
    }).join('');
  }

  window.handleLikeWish = function(wishId) {
    const newLikes = DataStore.likeWish(wishId);
    const countEl = document.getElementById(`like-count-${wishId}`);
    if (countEl) countEl.textContent = newLikes;
  };

  /* ===================================================================
     GOOGLE CALENDAR INTEGRATION
     =================================================================== */
  function initCalendarButton(data) {
    const btnCal = document.getElementById('btn-save-calendar');
    if (!btnCal || !data.event) return;

    btnCal.onclick = () => {
      try {
        const startIso = data.event.countdownDate ? data.event.countdownDate.replace(/-|:|\./g, '') : '20270518T080000';
        const title = encodeURIComponent(data.event.calendarTitle || `Pernikahan ${data.general.coupleNameShort}`);
        const details = encodeURIComponent(data.event.calendarDesc || `Menghadiri pernikahan ${data.general.coupleNameShort}`);
        const loc = encodeURIComponent(data.event.calendarLocation || (data.event.akad ? data.event.akad.venue : 'Bandung'));
        
        const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startIso}/${startIso}&details=${details}&location=${loc}`;
        window.open(gcalUrl, '_blank');
      } catch (err) {
        showToast('Gagal membuat link kalender.');
      }
    };
  }

  /* ===================================================================
     STICKER PICKER
     =================================================================== */
  function initStickerPicker() {
    const previewBox = document.getElementById('sticker-picker-toggle');
    const drawer = document.getElementById('sticker-drawer');
    const previewImg = document.getElementById('selected-sticker-preview');

    if (!previewBox || !drawer) return;

    const stickersList = [];
    for (let i = 1; i <= 34; i++) {
      const numStr = String(i).padStart(3, '0');
      let ext = '.gif';
      if ([5, 6, 10, 22].includes(i)) ext = '.png';
      if (i === 11) ext = '.jpg';
      stickersList.push(`assets/stickers/sticker${numStr}${ext}`);
    }

    drawer.innerHTML = stickersList.map(stk => `
      <img src="${stk}" alt="Sticker" class="sticker-opt-item" data-src="${stk}">
    `).join('');

    previewBox.addEventListener('click', () => {
      drawer.classList.toggle('open');
    });

    drawer.querySelectorAll('.sticker-opt-item').forEach(img => {
      img.addEventListener('click', () => {
        selectedSticker = img.dataset.src;
        if (previewImg) previewImg.src = selectedSticker;
        drawer.classList.remove('open');
      });
    });
  }

  /* ===================================================================
     AUDIO CONTROLLER (Plays User's Audio with Fallback)
     =================================================================== */
  function initAudio(data) {
    if (bgAudio) {
      bgAudio.pause();
      bgAudio = null;
      isAudioPlaying = false;
    }

    if (data && data.media && data.media.audio && data.media.audio.url) {
      bgAudio = new Audio(data.media.audio.url);
      bgAudio.loop = true;
      bgAudio.onerror = () => {
        if (data.media.audio.onlineFallbackUrl && bgAudio.src !== data.media.audio.onlineFallbackUrl) {
          bgAudio.src = data.media.audio.onlineFallbackUrl;
        }
      };
    }
  }

  function playAudio() {
    if (!bgAudio) return;
    bgAudio.play().then(() => {
      isAudioPlaying = true;
      const btn = document.getElementById('btn-music-toggle');
      if (btn) {
        btn.classList.add('music-spinning');
        btn.innerHTML = '<i class="fas fa-compact-disc"></i>';
      }
    }).catch(e => console.log('Audio autoplay policy note:', e));
  }

  function pauseAudio() {
    if (!bgAudio) return;
    bgAudio.pause();
    isAudioPlaying = false;
    const btn = document.getElementById('btn-music-toggle');
    if (btn) {
      btn.classList.remove('music-spinning');
      btn.innerHTML = '<i class="fas fa-volume-mute"></i>';
    }
  }

  /* ===================================================================
     COUNTDOWN TIMER
     =================================================================== */
  function startCountdown(targetDateStr) {
    if (countdownInterval) clearInterval(countdownInterval);

    const targetDate = new Date(targetDateStr).getTime();
    const daysEl = document.getElementById('cd-days');
    const hoursEl = document.getElementById('cd-hours');
    const minutesEl = document.getElementById('cd-minutes');
    const secondsEl = document.getElementById('cd-seconds');

    function update() {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance < 0) {
        if (daysEl) daysEl.textContent = '00';
        if (hoursEl) hoursEl.textContent = '00';
        if (minutesEl) minutesEl.textContent = '00';
        if (secondsEl) secondsEl.textContent = '00';
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      if (daysEl) daysEl.textContent = String(days).padStart(2, '0');
      if (hoursEl) hoursEl.textContent = String(hours).padStart(2, '0');
      if (minutesEl) minutesEl.textContent = String(minutes).padStart(2, '0');
      if (secondsEl) secondsEl.textContent = String(seconds).padStart(2, '0');
    }

    update();
    countdownInterval = setInterval(update, 1000);
  }

  /* ===================================================================
     LIGHTBOX / SLIDER MODAL WITH TOUCH SWIPE & KEYBOARD SUPPORT
     =================================================================== */
  let currentGalleryList = [];
  let touchStartX = 0;
  let touchStartY = 0;
  let touchEndX = 0;
  let touchEndY = 0;
  let lightboxInitialized = false;

  function initLightbox(data) {
    const modal = document.getElementById('lightbox-modal');
    const closeBtn = document.getElementById('lightbox-close');
    const prevBtn = document.getElementById('lightbox-prev');
    const nextBtn = document.getElementById('lightbox-next');

    if (!modal) return;

    if (data && data.media && data.media.gallery) {
      currentGalleryList = data.media.gallery;
    }

    if (lightboxInitialized) return;
    lightboxInitialized = true;

    if (closeBtn) closeBtn.onclick = () => closeLightbox();
    modal.onclick = (e) => {
      if (e.target === modal || e.target.classList.contains('lightbox-modal')) {
        closeLightbox();
      }
    };

    if (prevBtn) {
      prevBtn.onclick = (e) => {
        e.stopPropagation();
        slideLightboxPrev();
      };
    }

    if (nextBtn) {
      nextBtn.onclick = (e) => {
        e.stopPropagation();
        slideLightboxNext();
      };
    }

    // Keyboard navigation (Left, Right, Escape)
    document.addEventListener('keydown', (e) => {
      if (!modal.classList.contains('active')) return;
      if (e.key === 'ArrowLeft') {
        slideLightboxPrev();
      } else if (e.key === 'ArrowRight') {
        slideLightboxNext();
      } else if (e.key === 'Escape') {
        closeLightbox();
      }
    });

    // Touch Swipe Navigation for Mobile Phones & Tablets
    modal.addEventListener('touchstart', (e) => {
      if (e.touches && e.touches.length === 1) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      }
    }, { passive: true });

    modal.addEventListener('touchend', (e) => {
      if (e.changedTouches && e.changedTouches.length === 1) {
        touchEndX = e.changedTouches[0].clientX;
        touchEndY = e.changedTouches[0].clientY;
        handleSwipeGesture();
      }
    }, { passive: true });
  }

  function handleSwipeGesture() {
    const diffX = touchEndX - touchStartX;
    const diffY = touchEndY - touchStartY;
    const minSwipeDistance = 35;

    // Dominant horizontal swipe check
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > minSwipeDistance) {
      if (diffX > 0) {
        // Swiped Right -> Previous photo
        slideLightboxPrev();
      } else {
        // Swiped Left -> Next photo
        slideLightboxNext();
      }
    }
  }

  function slideLightboxPrev() {
    if (!currentGalleryList || currentGalleryList.length === 0) return;
    activeLightboxIndex = (activeLightboxIndex - 1 + currentGalleryList.length) % currentGalleryList.length;
    updateLightboxImage(currentGalleryList, 'left');
  }

  function slideLightboxNext() {
    if (!currentGalleryList || currentGalleryList.length === 0) return;
    activeLightboxIndex = (activeLightboxIndex + 1) % currentGalleryList.length;
    updateLightboxImage(currentGalleryList, 'right');
  }

  function openLightbox(index, gallery) {
    const modal = document.getElementById('lightbox-modal');
    if (!modal) return;
    if (gallery && gallery.length > 0) {
      currentGalleryList = gallery;
    }
    if (!currentGalleryList || currentGalleryList.length === 0) return;

    activeLightboxIndex = index;
    updateLightboxImage(currentGalleryList, 'none');
    modal.classList.add('active');
  }

  function closeLightbox() {
    const modal = document.getElementById('lightbox-modal');
    if (modal) modal.classList.remove('active');
  }

  function updateLightboxImage(gallery, direction = 'none') {
    const imgEl = document.getElementById('lightbox-img');
    const captionEl = document.getElementById('lightbox-caption');
    const counterEl = document.getElementById('lightbox-counter');
    const item = gallery[activeLightboxIndex];
    if (!item || !imgEl) return;

    imgEl.className = 'lightbox-img';
    if (direction === 'left') {
      imgEl.classList.add('slide-in-left');
    } else if (direction === 'right') {
      imgEl.classList.add('slide-in-right');
    }

    imgEl.src = item.url;
    if (captionEl) captionEl.textContent = item.caption || `Foto Galeri ${activeLightboxIndex + 1}`;
    if (counterEl) counterEl.textContent = `${activeLightboxIndex + 1} / ${gallery.length}`;
  }

  /* ===================================================================
     SCROLLSPY ON BOTTOM NAVIGATION
     =================================================================== */
  function initScrollSpy() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.bottom-nav-link');

    window.addEventListener('scroll', () => {
      let current = '';
      const scrollPos = window.scrollY + 200;

      sections.forEach(section => {
        const top = section.offsetTop;
        const height = section.offsetHeight;
        if (scrollPos >= top && scrollPos < top + height) {
          current = section.getAttribute('id');
        }
      });

      navLinks.forEach(link => {
        link.classList.remove('active');
        if (current && link.getAttribute('href') === `#${current}`) {
          link.classList.add('active');
        }
      });
    });
  }

  /* ===================================================================
     AUTO SCROLL CONTROLLER
     =================================================================== */
  function toggleAutoScroll(btn) {
    if (isAutoScrolling) {
      clearInterval(autoScrollInterval);
      isAutoScrolling = false;
      btn.classList.remove('active');
      btn.style.color = 'var(--secondary-color)';
    } else {
      isAutoScrolling = true;
      btn.classList.add('active');
      btn.style.color = 'var(--primary-color)';

      autoScrollInterval = setInterval(() => {
        if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 10) {
          clearInterval(autoScrollInterval);
          isAutoScrolling = false;
          btn.classList.remove('active');
          btn.style.color = 'var(--secondary-color)';
        } else {
          window.scrollBy({ top: 3, behavior: 'smooth' });
        }
      }, 50);
    }
  }

  /* ===================================================================
     DYNAMIC THEME & CUSTOM CSS INJECTION
     =================================================================== */
  function applyAppearanceStyles(data) {
    if (!data || !data.appearance) return;
    const ap = data.appearance;

    const root = document.documentElement;
    if (ap.primaryColor) {
      root.style.setProperty('--primary-color', ap.primaryColor);
      root.style.setProperty('--primary-hover', adjustBrightness(ap.primaryColor, -20));
    }
    if (ap.secondaryColor) root.style.setProperty('--secondary-color', ap.secondaryColor);
    if (ap.accentColor) root.style.setProperty('--accent-gold', ap.accentColor);
    if (ap.bgBase) root.style.setProperty('--bg-base', ap.bgBase);
    if (ap.cardBg) root.style.setProperty('--card-bg', ap.cardBg);
    if (ap.titleFont) root.style.setProperty('--font-title', ap.titleFont);
    if (ap.headingFont) root.style.setProperty('--font-heading', ap.headingFont);
    if (ap.bodyFont) root.style.setProperty('--font-body', ap.bodyFont);
    if (ap.scriptFont) root.style.setProperty('--font-script', ap.scriptFont);

    // Dynamic background update
    const infuwr = document.getElementById('infuwr');
    if (infuwr) {
      infuwr.style.background = `radial-gradient(circle at center, ${ap.cardBg || 'rgba(20,20,20,0.85)'} 0%, ${ap.bgBase || '#0a0a0a'} 100%)`;
    }

    // Inject Custom CSS
    let customStyleTag = document.getElementById('injected-custom-css');
    if (!customStyleTag) {
      customStyleTag = document.createElement('style');
      customStyleTag.id = 'injected-custom-css';
      document.head.appendChild(customStyleTag);
    }
    customStyleTag.textContent = ap.customCss || '';

    // Execute Custom JS safely
    if (ap.customJs && ap.customJs.trim()) {
      try {
        const runCustomJs = new Function(ap.customJs);
        runCustomJs();
      } catch (err) {
        console.warn('Custom JS execution notice:', err);
      }
    }
  }

  function adjustBrightness(hex, percent) {
    try {
      let num = parseInt(hex.replace('#', ''), 16);
      let r = (num >> 16) + percent;
      let g = ((num >> 8) & 0x00FF) + percent;
      let b = (num & 0x0000FF) + percent;
      r = Math.min(255, Math.max(0, r));
      g = Math.min(255, Math.max(0, g));
      b = Math.min(255, Math.max(0, b));
      return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
    } catch(e) {
      return hex;
    }
  }

  function triggerEntranceAnimations() {
    const animatedElements = document.querySelectorAll('.do-animate');
    animatedElements.forEach(el => {
      el.classList.add('visible');
    });
  }

  function showToast(message) {
    let toast = document.getElementById('toast-notice');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toast-notice';
      toast.className = 'toast-notice';
      document.body.appendChild(toast);
    }
    toast.innerHTML = `<i class="fas fa-info-circle"></i> ${message}`;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3200);
  }

  window.showToast = showToast;

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
