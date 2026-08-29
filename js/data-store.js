/**
 * DataStore - Comprehensive state management for Editable Wedding Invitation
 * Supports complete theme customization, sections visibility, guest database,
 * love story, streaming, guest links, persistent LocalStorage, & JSON export/import.
 */

const STORAGE_KEY = 'wedding_invitation_irsyad_adisty_data';
const CURRENT_DATA_VERSION = '2026.08.29.v3';

const DEFAULT_INVITATION_DATA = {
  dataVersion: CURRENT_DATA_VERSION,
  general: {
    siteTitle: "The Wedding of Irsyad & Adisty",
    coupleNameShort: "Irsyad & Adisty",
    groom: {
      fullName: "Muhammad Irsyad",
      nickname: "Irsyad",
      parents: "Putra dari Bpk. Mulyadi (Alm) & Ibu Nonoy Suryani",
      photo: "assets/images/hero-couple-1.jpg",
      instagram: "https://instagram.com",
      about: "The handsome groom who found his true soulmate."
    },
    bride: {
      fullName: "Adisty",
      nickname: "Adisty",
      parents: "Putri dari Bpk. & Ibu",
      photo: "assets/images/hero-couple-2.jpg",
      instagram: "https://instagram.com",
      about: "The lovely bride who completes this beautiful journey."
    },
    quote: "And of His signs is that He created for you from yourselves mates that you may find tranquility in them; and He placed between you affection and mercy. Indeed in that are signs for a people who give thought",
    quoteSource: "QS. Ar-Rum : 21",
    coverVersion: 1,
    coverToPrefix: "Dear",
    defaultGuestName: "Penerima Undangan",
    brandName: "Irsyad & Adisty",
    brandUrl: "",
    adminPin: "1234"
  },
  sections: {
    hero: true,
    couple: true,
    story: true,
    events: true,
    streaming: true,
    countdown: true,
    dresscode: true,
    gallery: true,
    gift: true,
    turutMengundang: true,
    prokes: true,
    wishes: true,
    footer: true
  },
  event: {
    countdownDate: "2027-05-18T08:00:00",
    calendarTitle: "Pernikahan Irsyad & Adisty",
    calendarDesc: "Menghadiri pernikahan Irsyad & Adisty di The Trans Luxury Hotel Bandung",
    calendarLocation: "The Trans Luxury Hotel, Jl. Gatot Subroto No.289, Bandung",
    akad: {
      title: "Akad Nikah",
      date: "Selasa, 18 Mei 2027",
      time: "08:00 - 10:00 WIB",
      venue: "The Trans Luxury Hotel",
      address: "📍 Jl. Gatot Subroto No.289, Cibangkong, Kec. Batununggal, Kota Bandung, Jawa Barat 40273",
      mapsUrl: "https://maps.google.com/?q=The+Trans+Luxury+Hotel+Bandung"
    },
    resepsi: {
      title: "Resepsi Pernikahan",
      date: "Selasa, 18 Mei 2027",
      time: "11:00 - 14:00 WIB",
      venue: "The Trans Luxury Hotel (Grand Ballroom)",
      address: "📍 Jl. Gatot Subroto No.289, Cibangkong, Kec. Batununggal, Kota Bandung, Jawa Barat 40273",
      mapsUrl: "https://maps.google.com/?q=The+Trans+Luxury+Hotel+Bandung"
    }
  },
  story: {
    title: "Our Love Story",
    subtitle: "Bagaimana Kisah Kami Dimulai",
    timeline: [
      {
        id: "s1",
        date: "12 Januari 2022",
        title: "Pertama Bertemu",
        story: "Pertama kali kami saling menyapa dalam sebuah pertemuan tak terduga di Bandung. Percakapan singkat yang meninggalkan kesan mendalam bagi kami berdua.",
        image: "assets/images/gallery-1.jpg"
      },
      {
        id: "s2",
        date: "15 Juni 2024",
        title: "Menyatakan Komitmen",
        story: "Setelah dua tahun saling mengenal, berbagi cerita suka dan duka, kami memutuskan untuk berkomitmen melangkah bersama ke jenjang yang lebih serius.",
        image: "assets/images/gallery-2.jpg"
      },
      {
        id: "s3",
        date: "20 Desember 2026",
        title: "Lamaran (Engagement Day)",
        story: "Di hadapan kedua keluarga besar, sebuah cincin tersemat sebagai ikrar pertunangan suci yang mempertemukan dua hati dan dua keluarga.",
        image: "assets/images/gallery-3.jpg"
      },
      {
        id: "s4",
        date: "18 Mei 2027",
        title: "Hari Bahagia Pernikahan",
        story: "Insya Allah, ikrar suci akad nikah akan mengikat kami dalam pernikahan yang abadi, sakinah, mawaddah, dan warahmah.",
        image: "assets/images/gallery-4.jpg"
      }
    ]
  },
  streaming: {
    enabled: true,
    title: "Live Streaming",
    subtitle: "Virtual Wedding Celebration",
    description: "Bagi keluarga dan sahabat yang belum dapat hadir secara langsung, Anda dapat tetap menyaksikan siaran langsung pernikahan kami secara daring.",
    youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    buttonText: "Tonton Live Streaming"
  },
  turutMengundang: {
    enabled: true,
    title: "Turut Mengundang",
    families: [
      "Keluarga Besar Bpk. Lord Montague (Bandung)",
      "Keluarga Besar Bpk. Lord Capulet (Jakarta)",
      "Keluarga Besar H. Sastro (Surabaya)",
      "Keluarga Besar Bani Abdullah (Yogyakarta)"
    ]
  },
  prokes: {
    enabled: true,
    title: "Protokol Kesehatan",
    subtitle: "Demi kenyamanan dan keselamatan bersama, para tamu undangan dihimbau untuk mematuhi protokol kesehatan:",
    items: [
      { icon: "fas fa-head-side-mask", text: "Menggunakan Masker" },
      { icon: "fas fa-hands-wash", text: "Mencuci Tangan / Hand Sanitizer" },
      { icon: "fas fa-people-arrows", text: "Menjaga Jarak Fisik" },
      { icon: "fas fa-temperature-high", text: "Pengecekan Suhu Tubuh" }
    ]
  },
  media: {
    coverImage: "assets/images/hero-couple-1.jpg",
    heroMain: "assets/images/hero-main.jpg",
    heroCouple1: "assets/images/hero-couple-1.jpg",
    heroCouple2: "assets/images/hero-couple-2.jpg",
    heroCouple3: "assets/images/hero-couple-1.jpg",
    heroCouple4: "assets/images/hero-couple-4.jpg",
    bgLocation: "assets/images/bg-location.png",
    bgDresscode: "assets/images/bg-dresscode.jpg",
    bgGift: "assets/images/bg-gift.png",
    gallery: [
      { id: "g1", url: "assets/images/gallery-1.jpg", caption: "Sweet Memories" },
      { id: "g2", url: "assets/images/gallery-2.jpg", caption: "Forever in Love" },
      { id: "g3", url: "assets/images/gallery-3.jpg", caption: "Journey of Two" },
      { id: "g4", url: "assets/images/gallery-4.jpg", caption: "A Beautiful Promise" },
      { id: "g5", url: "assets/images/gallery-5.jpg", caption: "Side by Side" },
      { id: "g6", url: "assets/images/gallery-6.jpg", caption: "Growing Together" }
    ],
    audio: {
      url: "assets/audio/wedding-song.mp3",
      onlineFallbackUrl: "https://www.image2url.com/r2/default/audio/1786971055013-6eee6170-7697-412d-8137-6ad2eb6548f6.mp3",
      title: "Wedding Romantic Instrumental",
      autoplay: true
    }
  },
  dresscode: {
    title: "Dress Code",
    description: "We kindly encourage our guests to wear your best & comfiest outfit.",
    colors: [
      { name: "Earth Dark", hex: "#2c2825" },
      { name: "Espresso", hex: "#4a3b32" },
      { name: "Warm Taupe", hex: "#8c7a6b" },
      { name: "Champagne Cream", hex: "#e8dfd8" },
      { name: "Soft Ivory", hex: "#f5f2eb" }
    ]
  },
  gift: {
    title: "Wedding Gift",
    description: "Your presence on our big day means the world for us, and we truly appreciate you being part of our special moment. With all due respect, should you wish to send a gift, you may use the bank account below.",
    banks: [
      {
        id: "b1",
        bankName: "Bank Mandiri",
        accountNumber: "12312312890",
        accountHolder: "Irsyad & Adisty",
        icon: "fas fa-university"
      },
      {
        id: "b2",
        bankName: "DANA / GoPay / ShopeePay",
        accountNumber: "085712345678",
        accountHolder: "Irsyad & Adisty",
        icon: "fas fa-wallet"
      }
    ],
    physicalGift: {
      enabled: true,
      recipientName: "Irsyad & Adisty",
      address: "Jl. Gatot Subroto No.289, Cibangkong, Batununggal, Kota Bandung, Jawa Barat 40273",
      phone: "085712345678"
    }
  },
  appearance: {
    themePreset: "luxury-gold",
    primaryColor: "#d4af37",
    secondaryColor: "#f3f0eb",
    accentColor: "#e5c158",
    bgBase: "#0a0a0a",
    cardBg: "rgba(20, 20, 20, 0.85)",
    textColor: "#f3f0eb",
    titleFont: "'Playfair Display', serif",
    headingFont: "'Alata', sans-serif",
    bodyFont: "'DM Sans', sans-serif",
    scriptFont: "'Alex Brush', cursive",
    customCss: "",
    customJs: "",
    fallingParticles: "flowers",
    particles: {
      enabled: true,
      type: "flowers", // "flowers", "leaves", "snow", "stars", "hearts", "confetti", "none"
      speed: "medium", // "slow", "medium", "fast"
      density: "medium", // "low", "medium", "high"
      size: "medium", // "small", "medium", "large"
      colorMode: "auto", // "auto", "gold", "pink", "white", "custom"
      customColor: "#d4af37",
      windSway: "gentle" // "gentle", "moderate", "dynamic"
    }
  },
  guestList: [
    {
      id: "gst_1",
      name: "Bapak Joko & Keluarga",
      category: "VIP",
      session: "Sesi 1 (Akad & Resepsi)",
      table: "Meja VIP 01",
      phone: "081234567890",
      createdAt: "2026-05-18"
    },
    {
      id: "gst_2",
      name: "Anisa Putri",
      category: "Teman",
      session: "Sesi 2 (Resepsi)",
      table: "Meja 05",
      phone: "081298765432",
      createdAt: "2026-05-18"
    },
    {
      id: "gst_3",
      name: "Dimas & Rara",
      category: "Keluarga",
      session: "Sesi 1 (Akad & Resepsi)",
      table: "Meja Keluarga",
      phone: "085711223344",
      createdAt: "2026-05-18"
    }
  ],
  wishes: [
    {
      id: "w1",
      name: "Budi Santoso & Keluarga",
      status: "hadir",
      pax: 2,
      message: "Selamat menempuh hidup baru! Semoga menjadi keluarga yang sakinah, mawaddah, warahmah selalu.",
      sticker: "assets/stickers/sticker001.gif",
      createdAt: "2026-05-18 10:20",
      likes: 5,
      reply: "Terima kasih banyak atas doa dan kehadirannya Kak Budi sekeluarga! ❤️"
    },
    {
      id: "w2",
      name: "Anisa Putri",
      status: "hadir",
      pax: 1,
      message: "Happy Wedding Irsyad & Adisty! So happy for both of you! Langgeng sampai kakek nenek yaa ✨",
      sticker: "assets/stickers/sticker004.gif",
      createdAt: "2026-05-18 11:45",
      likes: 3,
      reply: ""
    },
    {
      id: "w3",
      name: "Dimas & Rara",
      status: "ragu",
      pax: 2,
      message: "Barakallahu lakum wa baraka alaikum. Semoga acaranya lancar tanpa halangan!",
      sticker: "assets/stickers/sticker007.gif",
      createdAt: "2026-05-18 14:10",
      likes: 2,
      reply: ""
    }
  ]
};

const DataStore = {
  /**
   * Get current stored data merged with default schema
   */
  get() {
    try {
      let stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        // Clean legacy key if any
        localStorage.removeItem('wedding_invitation_tema20_data');
        this.save(DEFAULT_INVITATION_DATA);
        return JSON.parse(JSON.stringify(DEFAULT_INVITATION_DATA));
      }
      const parsed = JSON.parse(stored);

      // Check only if it has old 'Romeo' dummy data from previous templates
      const isOldRomeo = (parsed.general && parsed.general.groom && parsed.general.groom.fullName === 'Romeo') ||
                         (parsed.general && parsed.general.brandName && parsed.general.brandName.includes('jsambac'));

      if (isOldRomeo) {
        localStorage.removeItem('wedding_invitation_tema20_data');
        const fresh = JSON.parse(JSON.stringify(DEFAULT_INVITATION_DATA));
        this.save(fresh);
        return fresh;
      }

      // Deep merge with defaults to avoid missing properties if schema upgraded (user saved data takes priority)
      const merged = this._deepMerge(JSON.parse(JSON.stringify(DEFAULT_INVITATION_DATA)), parsed);

      // Ensure particles object exists
      if (!merged.appearance.particles) {
        merged.appearance.particles = Object.assign({}, DEFAULT_INVITATION_DATA.appearance.particles, {
          type: merged.appearance.fallingParticles || 'flowers'
        });
      }

      // Auto-upgrade legacy cover.jpg if still referring to old dummy template cover
      if (merged.media && (!merged.media.coverImage || merged.media.coverImage === 'assets/images/cover.jpg')) {
        merged.media.coverImage = DEFAULT_INVITATION_DATA.media.coverImage;
      }

      return merged;
    } catch (e) {
      console.error('Error loading DataStore, using defaults', e);
      return JSON.parse(JSON.stringify(DEFAULT_INVITATION_DATA));
    }
  },

  /**
   * Save data to local storage and broadcast change across ALL channels:
   * 1. LocalStorage
   * 2. CustomEvent (same window)
   * 3. BroadcastChannel (all open tabs & windows on same browser)
   * 4. postMessage (child iframes, parent window, opener window)
   */
  save(data) {
    try {
      if (!data.lastModified) data.lastModified = Date.now();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      
      // 1. Same-window CustomEvent
      window.dispatchEvent(new CustomEvent('invitationDataUpdated', { detail: data }));
      
      // 2. BroadcastChannel for instant multi-tab sync
      if (typeof BroadcastChannel !== 'undefined') {
        try {
          const bc = new BroadcastChannel('wedding_invitation_sync_channel');
          bc.postMessage({ type: 'invitationDataUpdated', data: data });
          bc.close();
        } catch (bcErr) {
          // ignore
        }
      }

      // 3. Broadcast to all iframes (e.g. simulator iframe inside admin)
      const iframes = document.querySelectorAll('iframe');
      iframes.forEach(iframe => {
        try {
          if (iframe.contentWindow) {
            iframe.contentWindow.postMessage({ type: 'invitationDataUpdated', data: data }, '*');
          }
        } catch(err) {}
      });

      // 4. Broadcast to parent / opener window if admin opened in popup/tab
      try {
        if (window.parent && window.parent !== window) {
          window.parent.postMessage({ type: 'invitationDataUpdated', data: data }, '*');
        }
        if (window.opener && !window.opener.closed) {
          window.opener.postMessage({ type: 'invitationDataUpdated', data: data }, '*');
        }
      } catch(winErr) {}

      // 5. Cloud Sync push to /api/sync
      this.syncToCloud(data);

      return true;
    } catch (e) {
      console.error('Error saving DataStore', e);
      return false;
    }
  },

  /**
   * Push data payload asynchronously to cloud sync API
   */
  async syncToCloud(data) {
    try {
      await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    } catch (err) {
      // Offline / local fallback
    }
  },

  /**
   * Load remote data from /api/sync or data.json (for guests on any phone / device)
   */
  async loadRemoteData() {
    // 1. Try /api/sync first
    try {
      const apiRes = await fetch('/api/sync?v=' + Date.now(), { cache: 'no-store' });
      if (apiRes.ok) {
        const cloudResult = await apiRes.json();
        if (cloudResult && cloudResult.data && cloudResult.data.general) {
          const cloudData = cloudResult.data;
          const localData = this.get();
          // If cloud data is newer or local is default, apply cloud data!
          if (!localData.lastModified || (cloudData.lastModified && cloudData.lastModified >= localData.lastModified)) {
            const merged = this._deepMerge(JSON.parse(JSON.stringify(DEFAULT_INVITATION_DATA)), cloudData);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
            window.dispatchEvent(new CustomEvent('invitationDataUpdated', { detail: merged }));
            return merged;
          }
        }
      }
    } catch (apiErr) {}

    // 2. Fallback to data.json
    try {
      const response = await fetch('data.json?v=' + Date.now(), { cache: 'no-store' });
      if (response.ok) {
        const remoteData = await response.json();
        if (remoteData && remoteData.general) {
          const localStored = localStorage.getItem(STORAGE_KEY);
          // Only populate if local storage is not yet set
          if (!localStored) {
            const merged = this._deepMerge(JSON.parse(JSON.stringify(DEFAULT_INVITATION_DATA)), remoteData);
            this.save(merged);
            return merged;
          }
        }
      }
    } catch (err) {
      // Offline or local file fallback
    }
    return this.get();
  },

  /**
   * Reset data to default (Irsyad & Adisty)
   */
  resetDefault() {
    const data = JSON.parse(JSON.stringify(DEFAULT_INVITATION_DATA));
    this.save(data);
    return data;
  },

  /**
   * Export all data as a downloadable JSON file
   */
  exportJSON() {
    const data = this.get();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `undangan-irsyad-adisty-config-${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  },

  /**
   * Export exact data.json file ready to be saved into project root for permanent server publishing
   */
  exportDataJSON() {
    const data = this.get();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "data.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  },

  /**
   * Import data from JSON object or string
   */
  importJSON(jsonString) {
    try {
      const parsed = typeof jsonString === 'string' ? JSON.parse(jsonString) : jsonString;
      if (!parsed.general || !parsed.event) {
        throw new Error('Format file JSON konfigurasi tidak valid.');
      }
      this.save(parsed);
      return { success: true, data: parsed };
    } catch (e) {
      return { success: false, error: e.message };
    }
  },

  /**
   * Add or update a guest in database
   */
  saveGuest(guest) {
    const data = this.get();
    if (!data.guestList) data.guestList = [];
    
    if (guest.id) {
      const idx = data.guestList.findIndex(g => g.id === guest.id);
      if (idx >= 0) {
        data.guestList[idx] = Object.assign(data.guestList[idx], guest);
      } else {
        data.guestList.push(guest);
      }
    } else {
      guest.id = 'gst_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);
      guest.createdAt = this._formatCurrentDate().slice(0, 10);
      data.guestList.push(guest);
    }
    this.save(data);
    return guest;
  },

  /**
   * Delete a guest
   */
  deleteGuest(guestId) {
    const data = this.get();
    if (data.guestList) {
      data.guestList = data.guestList.filter(g => g.id !== guestId);
      this.save(data);
    }
  },

  /**
   * Add a new guest wish / RSVP
   */
  addWish(wish) {
    const data = this.get();
    const newWish = {
      id: 'w_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      name: wish.name || 'Tamu Undangan',
      status: wish.status || 'hadir',
      pax: parseInt(wish.pax) || 1,
      message: wish.message || '',
      sticker: wish.sticker || 'assets/stickers/sticker001.gif',
      createdAt: this._formatCurrentDate(),
      likes: 0,
      reply: ''
    };
    if (!data.wishes) data.wishes = [];
    data.wishes.unshift(newWish);
    this.save(data);
    return newWish;
  },

  /**
   * Delete a wish by ID
   */
  deleteWish(wishId) {
    const data = this.get();
    if (data.wishes) {
      data.wishes = data.wishes.filter(w => w.id !== wishId);
      this.save(data);
    }
  },

  /**
   * Like a wish by ID
   */
  likeWish(wishId) {
    const data = this.get();
    if (data.wishes) {
      const item = data.wishes.find(w => w.id === wishId);
      if (item) {
        item.likes = (item.likes || 0) + 1;
        this.save(data);
        return item.likes;
      }
    }
    return 0;
  },

  /**
   * Admin reply to a wish
   */
  replyWish(wishId, replyText) {
    const data = this.get();
    if (data.wishes) {
      const item = data.wishes.find(w => w.id === wishId);
      if (item) {
        item.reply = replyText;
        this.save(data);
        return true;
      }
    }
    return false;
  },

  /**
   * Helper to deep merge objects
   */
  _deepMerge(target, source) {
    for (const key of Object.keys(source)) {
      if (source[key] instanceof Object && !Array.isArray(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} });
        this._deepMerge(target[key], source[key]);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
    return target;
  },

  /**
   * Format current date nicely
   */
  _formatCurrentDate() {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const hh = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
  }
};

// Expose globally
window.DataStore = DataStore;
