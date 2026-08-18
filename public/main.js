document.addEventListener('DOMContentLoaded', function () {
  'use strict';

  var API_BASE = '/api';

  // --- 1. ROUTE GUARD (SATPAM) ---
  if (window.location.pathname.includes('/dashboard')) {
    var token = localStorage.getItem('mpk_token');
    if (!token) {
      alert('Akses Ditolak! Anda harus login.');
      window.location.href = '/portal-rahasia.html';
      return;
    }
  }

  var DEMO_MEMBERS = [
    { id: 1, nama: 'Raka Pratama', kelas: '9A', jabatan: 'Ketua MPK', komisi: 'Pengurus Inti', periode: '2026/2027', foto: '', motto: 'Berani bicara, bertanggung jawab!' },
    { id: 2, nama: 'Salsabila Putri', kelas: '9B', jabatan: 'Wakil Ketua MPK', komisi: 'Pengurus Inti', periode: '2026/2027', foto: '', motto: 'Suara siswa adalah suaraku.' },
    { id: 3, nama: 'Dian Anggraini', kelas: '9C', jabatan: 'Sekretaris 1', komisi: 'Pengurus Inti', periode: '2026/2027', foto: '', motto: 'Rapi, teliti, dan amanah.' },
    { id: 4, nama: 'Bima Nugroho', kelas: '9A', jabatan: 'Sekretaris 2', komisi: 'Pengurus Inti', periode: '2026/2027', foto: '', motto: 'Catat, sampaikan, wujudkan.' },
    { id: 5, nama: 'Nadia Ramadhani', kelas: '8B', jabatan: 'Bendahara 1', komisi: 'Pengurus Inti', periode: '2026/2027', foto: '', motto: 'Jujur dalam setiap rupiah.' },
    { id: 6, nama: 'Fikri Alfarizi', kelas: '8C', jabatan: 'Bendahara 2', komisi: 'Pengurus Inti', periode: '2026/2027', foto: '', motto: 'Terbuka dan bertanggung jawab.' },
    { id: 7, nama: 'Arif Setiawan', kelas: '8A', jabatan: 'Humas', komisi: 'Pengurus Inti', periode: '2026/2027', foto: '', motto: 'Jembatan antara siswa dan sekolah.' },
    { id: 8, nama: 'Melati Kusuma', kelas: '8B', jabatan: 'Anggota', komisi: 'Anggota', periode: '2026/2027', foto: '', motto: 'Tertib itu keren.' },
    { id: 9, nama: 'Cinta Rahmadani', kelas: '7C', jabatan: 'Anggota', komisi: 'Anggota', periode: '2026/2027', foto: '', motto: 'Sekolah bersih, hati senang.' },
    { id: 10, nama: 'Yoga Pratama', kelas: '7A', jabatan: 'Anggota', komisi: 'Anggota', periode: '2026/2027', foto: '', motto: 'Sehat itu kaya.' },
    { id: 11, nama: 'Keysha Aulia', kelas: '7B', jabatan: 'Anggota', komisi: 'Anggota', periode: '2026/2027', foto: '', motto: 'Berkarya lewat seni dan olahraga.' },
    { id: 12, nama: 'Dimas Saputra', kelas: '8C', jabatan: 'Anggota', komisi: 'Anggota', periode: '2026/2027', foto: '', motto: 'Olahraga membuatku kuat.' },
    { id: 13, nama: 'Rina Wijaya', kelas: '9C', jabatan: 'Anggota', komisi: 'Anggota', periode: '2026/2027', foto: '', motto: 'Aspirasi siswa, kewajibanku.' },
    { id: 14, nama: 'Aldi Firmansyah', kelas: '8A', jabatan: 'Anggota', komisi: 'Anggota', periode: '2026/2027', foto: '', motto: 'Sampaikan dengan berani dan sopan.' }
  ];

  var DEMO_PEMBINA = { id: 99, nama: 'Ibu Siti Rahmawati, S.Pd.', kelas: 'Guru', jabatan: 'Pembina', komisi: 'Pembina', periode: '2026/2027', foto: '', motto: 'Membina dan mengawal setiap langkah MPK.' };

  var DEMO_SOCIAL = [
    { id: 1, platform: 'instagram', nama: '@mpk.smp248jakarta', url: 'https://instagram.com/mpk.smp248jakarta', urutan: 0 },
    { id: 2, platform: 'tiktok', nama: '@mpksmp248', url: 'https://tiktok.com/@mpksmp248', urutan: 1 },
    { id: 3, platform: 'youtube', nama: 'MPK SMP Negeri 248 Jakarta', url: 'https://youtube.com/@mpksmp248jakarta', urutan: 2 }
  ];

  var DEMO_ANNOUNCEMENTS = [
    { id: 1, judul: 'Pemilihan Ketua MPK Periode 2026/2027 Dibuka', isi: 'Pendaftaran calon Ketua MPK dibuka dari tanggal 1 sampai 15 September 2026. Silakan ambil formulir di ruang OSIS atau melalui ketua kelas masing-masing.', tanggal: '2026-08-15T08:00:00Z', penting: true },
    { id: 2, judul: 'Kotak Aspirasi Digital Resmi Dibuka', isi: 'Kamu sekarang bisa menyampaikan saran, kritik, dan ide lewat halaman Aspirasi di website MPK. Semua aspirasi akan dibaca langsung oleh pengurus inti.', tanggal: '2026-08-10T08:00:00Z', penting: false },
    { id: 3, judul: 'Jadwal Bakti Sosial September 2026', isi: 'Bakti sosial akan dilaksanakan pada hari Minggu, 21 September 2026 di Panti Asuhan Harapan Bunda. Bagi yang ingin ikut, daftar ke pengurus Komisi 4.', tanggal: '2026-08-05T08:00:00Z', penting: false }
  ];

  var KOMISI_INFO = {
    'Pengurus Inti': 'Badan pengurus utama MPK',
    'Komisi 1': 'Keagamaan & Kerohanian',
    'Komisi 2': 'Disiplin & Ketertiban',
    'Komisi 3': 'Kebersihan & Kesehatan',
    'Komisi 4': 'Seni, Olahraga & Budaya',
    'Komisi 5': 'Humas & Aspirasi'
  };

  var KOMISI_ORDER = ['Pengurus Inti', 'Komisi 1', 'Komisi 2', 'Komisi 3', 'Komisi 4', 'Komisi 5'];

  var JABATAN_ORDER = ['Pembina', 'Ketua MPK', 'Wakil Ketua MPK', 'Sekretaris 1', 'Sekretaris 2', 'Bendahara 1', 'Bendahara 2', 'Humas', 'Anggota'];

  var TREE_ROWS = [
    { key: 'pembina', label: 'Pembina', icon: 'fa-chalkboard-user', pair: false },
    { key: 'ketua', label: 'Ketua MPK', icon: 'fa-crown', pair: true },
    { key: 'sekretaris', label: 'Sekretaris', icon: 'fa-pen-to-square', pair: true },
    { key: 'bendahara', label: 'Bendahara', icon: 'fa-sack-dollar', pair: true },
    { key: 'humas', label: 'Humas', icon: 'fa-bullhorn', pair: false },
    { key: 'anggota', label: 'Anggota', icon: 'fa-users', pair: false }
  ];

  var SOCIAL_PLATFORMS = {
    instagram: { icon: 'fa-brands fa-instagram', color: 'bg-gradient-to-tr from-amber-400 via-pink-500 to-purple-600' },
    tiktok: { icon: 'fa-brands fa-tiktok', color: 'bg-slate-900' },
    youtube: { icon: 'fa-brands fa-youtube', color: 'bg-red-600' },
    x: { icon: 'fa-brands fa-x-twitter', color: 'bg-slate-900' },
    twitter: { icon: 'fa-brands fa-x-twitter', color: 'bg-slate-900' },
    facebook: { icon: 'fa-brands fa-facebook', color: 'bg-blue-600' },
    whatsapp: { icon: 'fa-brands fa-whatsapp', color: 'bg-emerald-500' },
    telegram: { icon: 'fa-brands fa-telegram', color: 'bg-sky-500' },
    website: { icon: 'fa-solid fa-globe', color: 'bg-navy' },
    lainnya: { icon: 'fa-solid fa-share-nodes', color: 'bg-navy' }
  };

  function socialPlatform(platform) {
    return SOCIAL_PLATFORMS[String(platform || '').toLowerCase()] || SOCIAL_PLATFORMS.lainnya;
  }

  var AVATAR_GRADIENTS = [
    'from-navy to-blue-800',
    'from-blue-600 to-sky-500',
    'from-gold to-amber-600',
    'from-slate-600 to-slate-800',
    'from-emerald-600 to-teal-600',
    'from-fuchsia-600 to-purple-700'
  ];

  var DEMO_CAROUSEL = [
    { id: 1, image_url: 'https://picsum.photos/seed/mpk-kegiatan-1/1200/560', title: 'Rapat Pleno MPK', description: 'Pengurus inti MPK mengadakan rapat pleno untuk menyusun program kerja satu periode ke depan.' },
    { id: 2, image_url: 'https://picsum.photos/seed/mpk-kegiatan-2/1200/560', title: 'Bakti Sosial', description: 'Kegiatan bakti sosial MPK ke panti asuhan sebagai wujud kepedulian terhadap sesama.' },
    { id: 3, image_url: 'https://picsum.photos/seed/mpk-kegiatan-3/1200/560', title: 'Kotak Aspirasi Digital', description: 'Saluran aspirasi digital dibuka agar setiap suara siswa didengar oleh pengurus inti.' }
  ];

  var DEMO_ABOUT = {
    pengertian: 'Majelis Perwakilan Kelas (MPK) SMP Negeri 248 Jakarta adalah organisasi kesiswaan yang menjadi wadah aspirasi, suara, dan kreativitas seluruh siswa.',
    visi: 'Menjadi wadah aspirasi siswa yang aktif, kreatif, dan bertanggung jawab dalam mewujudkan sekolah yang nyaman, disiplin, dan berprestasi.',
    misi: 'Menampung dan menyalurkan aspirasi seluruh siswa kepada pihak sekolah.\nMengadakan kegiatan positif yang mengembangkan bakat dan kreativitas siswa.\nMembangun kerjasama yang baik antara siswa, guru, dan pihak sekolah.',
    makna_logo: 'Perisai melambangkan perlindungan terhadap hak dan aspirasi setiap siswa.\nBuku terbuka melambangkan semangat belajar dan keilmuan.\nBintang melambangkan cita-cita luhur dan kejujuran.'
  };

  var editingAnnouncementId = null;
  var editingMemberId = null;

  function getToken() {
    return localStorage.getItem('mpk_token');
  }

  function setToken(token) {
    localStorage.setItem('mpk_token', token);
  }

  function clearToken() {
    localStorage.removeItem('mpk_token');
  }

  function apiFetch(url, options) {
    options = options || {};
    var headers = Object.assign({ 'Content-Type': 'application/json' }, options.headers || {});
    if (getToken()) {
      headers['Authorization'] = 'Bearer ' + localStorage.getItem('mpk_token');
    }
    return fetch(url, Object.assign({}, options, { headers: headers }));
  }

  function escapeHtml(text) {
    if (text === null || text === undefined) return '';
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function formatTanggal(iso) {
    var d = new Date(iso);
    if (isNaN(d.getTime())) return '-';
    var bulan = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    return d.getDate() + ' ' + bulan[d.getMonth()] + ' ' + d.getFullYear();
  }

  function initials(nama) {
    if (!nama) return '?';
    var parts = nama.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }

  function komisiIndex(komisi) {
    var i = KOMISI_ORDER.indexOf(komisi);
    return i === -1 ? 0 : i;
  }

  function komisiIcon(komisi) {
    if (komisi === 'Pengurus Inti') return 'fa-users-gear';
    if (komisi === 'Komisi 1') return 'fa-hands-praying';
    if (komisi === 'Komisi 2') return 'fa-shield-halved';
    if (komisi === 'Komisi 3') return 'fa-heart-pulse';
    if (komisi === 'Komisi 4') return 'fa-palette';
    if (komisi === 'Komisi 5') return 'fa-bullhorn';
    return 'fa-users';
  }

  function setActiveNav() {
    var page = document.body.getAttribute('data-page');
    document.querySelectorAll('[data-nav]').forEach(function (link) {
      if (link.getAttribute('data-nav') === page) {
        link.classList.add('text-navy');
      }
    });
  }

  var LOGO_URL_CACHE = null;

  function loadLogoURL(cb) {
    if (LOGO_URL_CACHE !== null) {
      cb(LOGO_URL_CACHE);
      return;
    }
    try {
      fetch(API_BASE + '/settings')
        .then(function (res) { return res.ok ? res.json() : {}; })
        .then(function (s) {
          LOGO_URL_CACHE = (s && s.logo_url) ? String(s.logo_url).trim() : '';
          cb(LOGO_URL_CACHE);
        })
        .catch(function () { LOGO_URL_CACHE = ''; cb(''); });
    } catch (err) {
      LOGO_URL_CACHE = '';
      cb('');
    }
  }

  function logoFallbackHtml(size) {
    size = size || 'w-9 h-9';
    return '<div class="' + size + ' rounded-xl bg-gradient-to-br from-navy to-blue-800 text-white flex items-center justify-center shadow-md"><i class="fa-solid fa-graduation-cap"></i></div>';
  }

  function fillLogoSlot(slot, url, size) {
    size = size || 'w-9 h-9';
    if (!url) {
      slot.innerHTML = logoFallbackHtml(size);
      return;
    }
    slot.innerHTML = '<img src="' + escapeHtml(url) + '" alt="Logo MPK" data-logo-img class="' + size + ' object-contain bg-transparent drop-shadow-sm opacity-0 transition-opacity duration-300">';
    var img = slot.querySelector('[data-logo-img]');
    img.onload = function () {
      img.classList.remove('opacity-0');
    };
    img.onerror = function () {
      slot.innerHTML = logoFallbackHtml(size);
    };
  }

  function applyLogo() {
    var slots = document.querySelectorAll('[data-logo-slot]');
    if (!slots.length) return;
    loadLogoURL(function (url) {
      slots.forEach(function (slot) {
        fillLogoSlot(slot, url);
      });
    });
  }

  function showToast(message, type) {
    type = type || 'info';
    var styles = {
      success: {
        box: 'border-emerald-300 bg-emerald-50 text-emerald-800',
        icon: 'fa-circle-check text-emerald-500',
        accent: 'bg-gold'
      },
      error: {
        box: 'border-rose-300 bg-rose-50 text-rose-800',
        icon: 'fa-circle-exclamation text-rose-500',
        accent: 'bg-rose-500'
      },
      info: {
        box: 'border-navy/20 bg-white text-slate-700',
        icon: 'fa-circle-info text-navy',
        accent: 'bg-navy'
      }
    };
    var s = styles[type] || styles.info;
    var toast = document.createElement('div');
    toast.className = 'mpk-toast fixed top-4 right-4 z-[100] max-w-sm w-[calc(100%-2rem)] flex items-start gap-3 px-4 py-3 rounded-2xl border shadow-lg transition-all duration-300 opacity-0 -translate-y-2';
    toast.className += ' ' + s.box;
    toast.innerHTML = '' +
      '<span class="shrink-0 w-1.5 self-stretch rounded-full ' + s.accent + '"></span>' +
      '<i class="fa-solid ' + s.icon + ' mt-0.5 text-lg"></i>' +
      '<p class="text-sm font-semibold leading-snug flex-1">' + escapeHtml(message) + '</p>' +
      '<button type="button" class="shrink-0 text-slate-400 hover:text-slate-600 transition" aria-label="Tutup"><i class="fa-solid fa-xmark"></i></button>';
    document.body.appendChild(toast);
    toast.querySelector('button').addEventListener('click', function () {
      toast.classList.add('opacity-0', '-translate-y-2');
      window.setTimeout(function () { toast.remove(); }, 300);
    });
    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(function () {
        toast.classList.remove('opacity-0', '-translate-y-2');
      });
    });
    window.setTimeout(function () {
      toast.classList.add('opacity-0', '-translate-y-2');
      window.setTimeout(function () { toast.remove(); }, 300);
    }, 4500);
  }

  function showAdminBanner(message) {
    var type = 'info';
    var low = String(message || '').toLowerCase();
    if (low.indexOf('berhasil') !== -1) type = 'success';
    else if (low.indexOf('gagal') !== -1 || low.indexOf('wajib') !== -1 || low.indexOf('tidak') !== -1 || low.indexOf('periksa') !== -1) type = 'error';
    showToast(message, type);
    var banner = document.getElementById('adminError');
    if (banner) {
      banner.textContent = message;
      banner.classList.remove('hidden');
      window.setTimeout(function () {
        banner.classList.add('hidden');
      }, 6000);
    }
  }

  function initMobileMenu() {
    var btn = document.getElementById('mobileMenuBtn');
    var menu = document.getElementById('mobileMenu');
    if (btn && menu) {
      btn.addEventListener('click', function () {
        menu.classList.toggle('hidden');
      });
    }
  }

  function showAdminBanner(message) {
    var banner = document.getElementById('adminError');
    if (!banner) return;
    banner.textContent = message;
    banner.classList.remove('hidden');
    window.setTimeout(function () {
      banner.classList.add('hidden');
    }, 6000);
  }

  function handleUnauthorized() {
    clearToken();
    window.location.href = '/portal-rahasia.html';
  }

  function groupByKomisi(members) {
    var groups = {};
    members.forEach(function (m) {
      (groups[m.komisi] = groups[m.komisi] || []).push(m);
    });
    var ordered = [];
    KOMISI_ORDER.forEach(function (k) {
      if (groups[k]) ordered.push({ komisi: k, anggota: groups[k] });
    });
    Object.keys(groups).forEach(function (k) {
      if (KOMISI_ORDER.indexOf(k) === -1) ordered.push({ komisi: k, anggota: groups[k] });
    });
    return ordered;
  }

  // --- 2. LOGIN LOGIC ---
  var loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', function (e) {
      e.preventDefault();

      var errorBox = document.getElementById('loginError');
      var errorText = document.getElementById('loginErrorText');
      var submitBtn = document.getElementById('loginBtn');
      var username = document.getElementById('loginUsername').value.trim();
      var password = document.getElementById('loginPassword').value;
      errorBox.classList.add('hidden');

      if (!username || !password) {
        errorBox.classList.remove('hidden');
        errorText.textContent = 'Username dan password wajib diisi.';
        return;
      }

      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Memverifikasi...';

      try {
        fetch(API_BASE + '/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: username, password: password })
        })
          .then(function (res) {
            if (!res.ok) {
              return res.json().then(function (data) {
                var apiError = new Error(data.detail || 'Terjadi kesalahan pada server/database.');
                apiError.isApiError = true;
                throw apiError;
              });
            }
            return res.json();
          })
          .then(function (data) {
            localStorage.setItem('mpk_token', data.token);
            window.location.href = '/dashboard.html';
          })
          .catch(function (err) {
            var message = (err && err.isApiError)
              ? 'Login Gagal: ' + err.message
              : 'Gagal terhubung ke server. Pastikan database/API aktif.';
            alert(message);
            console.error(err);
            errorBox.classList.remove('hidden');
            errorText.textContent = message;
          })
          .finally(function () {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fa-solid fa-unlock"></i> Masuk';
          });
      } catch (err) {
        var message = 'Gagal terhubung ke server. Pastikan database/API aktif.';
        alert(message);
        console.error(err);
        errorBox.classList.remove('hidden');
        errorText.textContent = message;
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fa-solid fa-unlock"></i> Masuk';
      }
    });
  }

  // --- 3. DASHBOARD TABS LOGIC ---
  function initTabs() {
    var tabs = document.querySelectorAll('[data-tab]');
    var panels = document.querySelectorAll('[data-panel]');
    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        var target = tab.getAttribute('data-tab');
        tabs.forEach(function (t) {
          if (t === tab) {
            t.classList.add('bg-navy', 'text-white', 'shadow-md');
            t.classList.remove('text-slate-600', 'hover:bg-gold/10');
          } else {
            t.classList.remove('bg-navy', 'text-white', 'shadow-md');
            t.classList.add('text-slate-600', 'hover:bg-gold/10');
          }
        });
        panels.forEach(function (p) {
          if (p.getAttribute('data-panel') === target) {
            p.classList.remove('hidden');
          } else {
            p.classList.add('hidden');
          }
        });
      });
    });
  }

  function initDashboardPage() {
    initTabs();
    bindAdminForms();
    bindDashboardForms();
    loadAspirasiAdmin();
    loadAnnouncementsAdmin();
    loadMembersAdmin();
    loadSettingsAdmin();
    loadAboutAdmin();
    loadCarouselAdmin();
    loadSocialAdmin();
  }

  function bindAdminForms() {
    var pengumumanForm = document.getElementById('pengumumanForm');
    if (pengumumanForm) {
      pengumumanForm.addEventListener('submit', function (e) {
        e.preventDefault();
        var judul = document.getElementById('pengumumanJudul').value.trim();
        var isi = document.getElementById('pengumumanIsi').value.trim();
        var penting = document.getElementById('pengumumanPenting').checked;
        if (!judul || !isi) {
          showAdminBanner('Judul dan isi pengumuman wajib diisi.');
          return;
        }
        var payload = { judul: judul, isi: isi, penting: penting };
        var method = 'POST';
        var url = API_BASE + '/announcements';
        if (editingAnnouncementId) {
          method = 'PUT';
          url = API_BASE + '/announcements/' + editingAnnouncementId;
        }
        var btn = document.getElementById('pengumumanSubmit');
        btn.disabled = true;
        try {
          apiFetch(url, { method: method, body: JSON.stringify(payload) })
            .then(function (res) {
              if (res.status === 401) { handleUnauthorized(); return; }
              if (!res.ok) throw new Error('Gagal menyimpan pengumuman');
              return res.json();
            })
            .then(function () {
              resetPengumumanForm();
              loadAnnouncementsAdmin();
            })
            .catch(function () {
              showAdminBanner('Gagal menyimpan pengumuman. Periksa koneksi API.');
            })
            .finally(function () {
              btn.disabled = false;
            });
        } catch (err) {
          showAdminBanner('Gagal menyimpan pengumuman. Periksa koneksi API.');
          btn.disabled = false;
        }
      });

      var cancelBtn = document.getElementById('pengumumanCancel');
      if (cancelBtn) {
        cancelBtn.addEventListener('click', resetPengumumanForm);
      }
    }

    var anggotaForm = document.getElementById('anggotaForm');
    if (anggotaForm) {
      anggotaForm.addEventListener('submit', function (e) {
        e.preventDefault();
        var nama = document.getElementById('anggotaNama').value.trim();
        var kelas = document.getElementById('anggotaKelas').value.trim();
        var jabatan = document.getElementById('anggotaJabatan').value.trim();
        var komisi = document.getElementById('anggotaKomisi').value;
        var periode = document.getElementById('anggotaPeriode').value.trim();
        var foto = document.getElementById('anggotaFoto').value.trim();
        var motto = document.getElementById('anggotaMotto').value.trim();
        if (!nama || !kelas || !jabatan) {
          showAdminBanner('Nama, kelas, dan jabatan wajib diisi.');
          return;
        }
        var payload = { nama: nama, kelas: kelas, jabatan: jabatan, komisi: komisi, periode: periode || null, foto: foto || null, motto: motto || null };
        var method = 'POST';
        var url = API_BASE + '/members';
        if (editingMemberId) {
          method = 'PUT';
          url = API_BASE + '/members/' + editingMemberId;
        }
        var btn = document.getElementById('anggotaSubmit');
        btn.disabled = true;
        try {
          apiFetch(url, { method: method, body: JSON.stringify(payload) })
            .then(function (res) {
              if (res.status === 401) { handleUnauthorized(); return; }
              if (!res.ok) throw new Error('Gagal menyimpan anggota');
              return res.json();
            })
            .then(function () {
              resetAnggotaForm();
              loadMembersAdmin();
            })
            .catch(function () {
              showAdminBanner('Gagal menyimpan anggota. Periksa koneksi API.');
            })
            .finally(function () {
              btn.disabled = false;
            });
        } catch (err) {
          showAdminBanner('Gagal menyimpan anggota. Periksa koneksi API.');
          btn.disabled = false;
        }
      });

      var cancelBtn = document.getElementById('anggotaCancel');
      if (cancelBtn) {
        cancelBtn.addEventListener('click', resetAnggotaForm);
      }
    }

    var logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', function () {
        clearToken();
        window.location.href = '/portal-rahasia.html';
      });
    }
  }

  function resetPengumumanForm() {
    editingAnnouncementId = null;
    var form = document.getElementById('pengumumanForm');
    if (form) form.reset();
    var submitBtn = document.getElementById('pengumumanSubmit');
    if (submitBtn) submitBtn.innerHTML = '<i class="fa-solid fa-plus"></i> Tambah Pengumuman';
    var cancelBtn = document.getElementById('pengumumanCancel');
    if (cancelBtn) cancelBtn.classList.add('hidden');
  }

  function resetAnggotaForm() {
    editingMemberId = null;
    var form = document.getElementById('anggotaForm');
    if (form) form.reset();
    var submitBtn = document.getElementById('anggotaSubmit');
    if (submitBtn) submitBtn.innerHTML = '<i class="fa-solid fa-plus"></i> Tambah Anggota';
    var cancelBtn = document.getElementById('anggotaCancel');
    if (cancelBtn) cancelBtn.classList.add('hidden');
  }

  function loadAspirasiAdmin() {
    var container = document.getElementById('aspirasiList');
    if (!container) return;
    try {
      apiFetch(API_BASE + '/aspirasi')
        .then(function (res) {
          if (res.status === 401) { handleUnauthorized(); throw new Error('Sesi berakhir'); }
          if (!res.ok) throw new Error('Gagal memuat aspirasi');
          return res.json();
        })
        .then(function (items) {
          renderAspirasiAdmin(items, container);
        })
        .catch(function (err) {
          if (err.message !== 'Sesi berakhir') {
            showAdminBanner('Gagal memuat data aspirasi dari server.');
            container.innerHTML = '<div class="text-center text-slate-400 py-8 bg-white rounded-2xl border border-slate-200"><i class="fa-solid fa-triangle-exclamation text-3xl mb-2"></i><p>Tidak dapat menampilkan data.</p></div>';
          }
        });
    } catch (err) {
      showAdminBanner('Gagal memuat data aspirasi dari server.');
    }
  }

  function renderAspirasiAdmin(items, container) {
    var baru = 0;
    items.forEach(function (a) {
      if (a.status === 'Baru') baru++;
    });
    var badge = document.getElementById('aspirasiCount');
    if (badge) badge.textContent = String(baru);

    if (!items.length) {
      container.innerHTML = '<div class="text-center text-slate-400 py-10 bg-white rounded-2xl border border-slate-200"><i class="fa-solid fa-inbox text-4xl mb-3"></i><p>Belum ada aspirasi masuk.</p></div>';
      return;
    }

    container.innerHTML = items.map(function (a) {
      var statusColor = a.status === 'Selesai'
        ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
        : (a.status === 'Diproses'
          ? 'bg-sky-50 text-sky-600 border-sky-200'
          : 'bg-amber-50 text-amber-600 border-amber-200');
      return '' +
        '<div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">' +
          '<div class="flex flex-wrap items-start justify-between gap-3 mb-3">' +
            '<div class="flex items-center gap-3">' +
              '<div class="w-10 h-10 rounded-full bg-gradient-to-br from-navy to-blue-800 text-white flex items-center justify-center font-bold text-sm shrink-0">' + initials(a.nama) + '</div>' +
              '<div>' +
                '<p class="font-bold text-slate-900">' + escapeHtml(a.nama) + '</p>' +
                '<p class="text-xs text-slate-500"><i class="fa-solid fa-school mr-1"></i>Kelas ' + escapeHtml(a.kelas) + '</p>' +
              '</div>' +
            '</div>' +
            '<span class="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full border ' + statusColor + '"><i class="fa-solid fa-tag"></i>' + escapeHtml(a.kategori) + '</span>' +
          '</div>' +
          '<p class="text-sm text-slate-600 bg-slate-50 rounded-xl p-4 leading-relaxed">' + escapeHtml(a.pesan) + '</p>' +
          '<div class="flex flex-wrap items-center justify-between gap-3 mt-4">' +
            '<span class="text-xs text-slate-400"><i class="fa-solid fa-clock mr-1"></i>' + formatTanggal(a.dibuat_pada) + '</span>' +
            '<div class="flex items-center gap-2">' +
              '<select data-aspirasi-status="' + a.id + '" class="text-xs font-semibold border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-gold">' +
                '<option value="Baru"' + (a.status === 'Baru' ? ' selected' : '') + '>Baru</option>' +
                '<option value="Diproses"' + (a.status === 'Diproses' ? ' selected' : '') + '>Diproses</option>' +
                '<option value="Selesai"' + (a.status === 'Selesai' ? ' selected' : '') + '>Selesai</option>' +
              '</select>' +
              '<button data-aspirasi-delete="' + a.id + '" class="w-9 h-9 rounded-lg bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white transition" title="Hapus"><i class="fa-solid fa-trash-can"></i></button>' +
            '</div>' +
          '</div>' +
        '</div>';
    }).join('');

    container.querySelectorAll('[data-aspirasi-status]').forEach(function (sel) {
      sel.addEventListener('change', function () {
        updateAspirasiStatus(sel.getAttribute('data-aspirasi-status'), sel.value);
      });
    });
    container.querySelectorAll('[data-aspirasi-delete]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        deleteAspirasi(btn.getAttribute('data-aspirasi-delete'));
      });
    });
  }

  function updateAspirasiStatus(id, status) {
    try {
      apiFetch(API_BASE + '/aspirasi/' + id, {
        method: 'PATCH',
        body: JSON.stringify({ status: status })
      })
        .then(function (res) {
          if (res.status === 401) { handleUnauthorized(); return; }
          if (!res.ok) throw new Error('Gagal memperbarui status');
          return res.json();
        })
        .then(function () {
          loadAspirasiAdmin();
        })
        .catch(function () {
          showAdminBanner('Gagal memperbarui status aspirasi.');
        });
    } catch (err) {
      showAdminBanner('Gagal memperbarui status aspirasi.');
    }
  }

  function deleteAspirasi(id) {
    if (!window.confirm('Hapus aspirasi ini? Tindakan ini tidak bisa dibatalkan.')) return;
    try {
      apiFetch(API_BASE + '/aspirasi/' + id, { method: 'DELETE' })
        .then(function (res) {
          if (res.status === 401) { handleUnauthorized(); return; }
          if (!res.ok) throw new Error('Gagal menghapus');
          loadAspirasiAdmin();
        })
        .catch(function () {
          showAdminBanner('Gagal menghapus aspirasi.');
        });
    } catch (err) {
      showAdminBanner('Gagal menghapus aspirasi.');
    }
  }

  function loadAnnouncementsAdmin() {
    var container = document.getElementById('pengumumanList');
    if (!container) return;
    try {
      apiFetch(API_BASE + '/announcements')
        .then(function (res) {
          if (res.status === 401) { handleUnauthorized(); throw new Error('Sesi berakhir'); }
          if (!res.ok) throw new Error('Gagal memuat pengumuman');
          return res.json();
        })
        .then(function (items) {
          renderAnnouncementsAdmin(items, container);
        })
        .catch(function (err) {
          if (err.message !== 'Sesi berakhir') {
            showAdminBanner('Gagal memuat data pengumuman dari server.');
            container.innerHTML = '<div class="text-center text-slate-400 py-8 bg-white rounded-2xl border border-slate-200"><i class="fa-solid fa-triangle-exclamation text-3xl mb-2"></i><p>Tidak dapat menampilkan data.</p></div>';
          }
        });
    } catch (err) {
      showAdminBanner('Gagal memuat data pengumuman dari server.');
    }
  }

  function renderAnnouncementsAdmin(items, container) {
    if (!items.length) {
      container.innerHTML = '<div class="text-center text-slate-400 py-10 bg-white rounded-2xl border border-slate-200"><i class="fa-solid fa-bullhorn text-4xl mb-3"></i><p>Belum ada pengumuman.</p></div>';
      return;
    }
    container.innerHTML = items.map(function (a) {
      return '' +
        '<div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-wrap items-start justify-between gap-4">' +
          '<div class="min-w-0">' +
            '<div class="flex items-center gap-2 mb-1 flex-wrap">' +
              '<h3 class="font-bold text-slate-900">' + escapeHtml(a.judul) + '</h3>' +
              (a.penting ? '<span class="text-[10px] font-bold bg-rose-500 text-white px-2 py-0.5 rounded-full">PENTING</span>' : '') +
            '</div>' +
            '<p class="text-sm text-slate-500 line-clamp-2">' + escapeHtml(a.isi) + '</p>' +
            '<p class="text-xs text-slate-400 mt-2"><i class="fa-solid fa-calendar-days mr-1"></i>' + formatTanggal(a.tanggal) + '</p>' +
          '</div>' +
          '<div class="flex items-center gap-2">' +
            '<button data-announcement-edit="' + a.id + '" class="px-3 py-2 rounded-lg bg-gold/20 text-navy hover:bg-navy hover:text-white transition text-sm" title="Edit"><i class="fa-solid fa-pen"></i></button>' +
            '<button data-announcement-delete="' + a.id + '" class="px-3 py-2 rounded-lg bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white transition text-sm" title="Hapus"><i class="fa-solid fa-trash-can"></i></button>' +
          '</div>' +
        '</div>';
    }).join('');

    container.querySelectorAll('[data-announcement-edit]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        editAnnouncement(btn.getAttribute('data-announcement-edit'));
      });
    });
    container.querySelectorAll('[data-announcement-delete]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        deleteAnnouncement(btn.getAttribute('data-announcement-delete'));
      });
    });
  }

  function editAnnouncement(id) {
    try {
      apiFetch(API_BASE + '/announcements')
        .then(function (res) {
          return res.ok ? res.json() : [];
        })
        .then(function (items) {
          var a = null;
          items.forEach(function (x) {
            if (String(x.id) === String(id)) a = x;
          });
          if (!a) {
            showAdminBanner('Pengumuman tidak ditemukan.');
            return;
          }
          editingAnnouncementId = String(id);
          document.getElementById('pengumumanJudul').value = a.judul;
          document.getElementById('pengumumanIsi').value = a.isi;
          document.getElementById('pengumumanPenting').checked = !!a.penting;
          document.getElementById('pengumumanSubmit').innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Simpan Perubahan';
          document.getElementById('pengumumanCancel').classList.remove('hidden');
          document.getElementById('pengumumanForm').scrollIntoView({ behavior: 'smooth', block: 'center' });
        })
        .catch(function () {
          showAdminBanner('Gagal memuat data pengumuman.');
        });
    } catch (err) {
      showAdminBanner('Gagal memuat data pengumuman.');
    }
  }

  function deleteAnnouncement(id) {
    if (!window.confirm('Hapus pengumuman ini? Tindakan ini tidak bisa dibatalkan.')) return;
    try {
      apiFetch(API_BASE + '/announcements/' + id, { method: 'DELETE' })
        .then(function (res) {
          if (res.status === 401) { handleUnauthorized(); return; }
          if (!res.ok) throw new Error('Gagal menghapus');
          loadAnnouncementsAdmin();
        })
        .catch(function () {
          showAdminBanner('Gagal menghapus pengumuman.');
        });
    } catch (err) {
      showAdminBanner('Gagal menghapus pengumuman.');
    }
  }

  function loadMembersAdmin() {
    var container = document.getElementById('anggotaList');
    if (!container) return;
    try {
      apiFetch(API_BASE + '/members')
        .then(function (res) {
          if (res.status === 401) { handleUnauthorized(); throw new Error('Sesi berakhir'); }
          if (!res.ok) throw new Error('Gagal memuat anggota');
          return res.json();
        })
        .then(function (items) {
          renderMembersAdmin(items, container);
        })
        .catch(function (err) {
          if (err.message !== 'Sesi berakhir') {
            showAdminBanner('Gagal memuat data anggota dari server.');
            container.innerHTML = '<div class="col-span-full text-center text-slate-400 py-8 bg-white rounded-2xl border border-slate-200"><i class="fa-solid fa-triangle-exclamation text-3xl mb-2"></i><p>Tidak dapat menampilkan data.</p></div>';
          }
        });
    } catch (err) {
      showAdminBanner('Gagal memuat data anggota dari server.');
    }
  }

  function renderMembersAdmin(items, container) {
    if (!items.length) {
      container.innerHTML = '<div class="col-span-full text-center text-slate-400 py-10 bg-white rounded-2xl border border-slate-200"><i class="fa-solid fa-users text-4xl mb-3"></i><p>Belum ada anggota terdaftar.</p></div>';
      return;
    }
    container.innerHTML = items.map(function (m, i) {
      var g = AVATAR_GRADIENTS[i % AVATAR_GRADIENTS.length];
      return '' +
        '<div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex items-start gap-4">' +
          '<div class="w-12 h-12 rounded-full bg-gradient-to-br ' + g + ' text-white flex items-center justify-center font-bold shrink-0">' + initials(m.nama) + '</div>' +
          '<div class="min-w-0 flex-1">' +
            '<h3 class="font-bold text-slate-900 truncate">' + escapeHtml(m.nama) + '</h3>' +
            '<p class="text-xs text-navy font-semibold">' + escapeHtml(m.jabatan) + '</p>' +
            '<p class="text-xs text-slate-400 mt-1"><i class="fa-solid fa-school mr-1"></i>Kelas ' + escapeHtml(m.kelas) + ' • ' + escapeHtml(m.komisi) + '</p>' +
          '</div>' +
          '<div class="flex items-center gap-2">' +
            '<button data-member-edit="' + m.id + '" class="w-9 h-9 rounded-lg bg-gold/20 text-navy hover:bg-navy hover:text-white transition" title="Edit"><i class="fa-solid fa-pen"></i></button>' +
            '<button data-member-delete="' + m.id + '" class="w-9 h-9 rounded-lg bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white transition" title="Hapus"><i class="fa-solid fa-trash-can"></i></button>' +
          '</div>' +
        '</div>';
    }).join('');

    container.querySelectorAll('[data-member-edit]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        editMember(btn.getAttribute('data-member-edit'));
      });
    });
    container.querySelectorAll('[data-member-delete]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        deleteMember(btn.getAttribute('data-member-delete'));
      });
    });
  }

  function editMember(id) {
    try {
      apiFetch(API_BASE + '/members')
        .then(function (res) {
          return res.ok ? res.json() : [];
        })
        .then(function (items) {
          var m = null;
          items.forEach(function (x) {
            if (String(x.id) === String(id)) m = x;
          });
          if (!m) {
            showAdminBanner('Anggota tidak ditemukan.');
            return;
          }
          editingMemberId = String(id);
          document.getElementById('anggotaNama').value = m.nama;
          document.getElementById('anggotaKelas').value = m.kelas;
          document.getElementById('anggotaJabatan').value = m.jabatan;
          document.getElementById('anggotaKomisi').value = m.komisi;
          document.getElementById('anggotaPeriode').value = m.periode || '';
          document.getElementById('anggotaFoto').value = m.foto || '';
          document.getElementById('anggotaMotto').value = m.motto || '';
          document.getElementById('anggotaSubmit').innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Simpan Perubahan';
          document.getElementById('anggotaCancel').classList.remove('hidden');
          document.getElementById('anggotaForm').scrollIntoView({ behavior: 'smooth', block: 'center' });
        })
        .catch(function () {
          showAdminBanner('Gagal memuat data anggota.');
        });
    } catch (err) {
      showAdminBanner('Gagal memuat data anggota.');
    }
  }

  function deleteMember(id) {
    if (!window.confirm('Hapus anggota ini? Tindakan ini tidak bisa dibatalkan.')) return;
    try {
      apiFetch(API_BASE + '/members/' + id, { method: 'DELETE' })
        .then(function (res) {
          if (res.status === 401) { handleUnauthorized(); return; }
          if (!res.ok) throw new Error('Gagal menghapus');
          loadMembersAdmin();
        })
        .catch(function () {
          showAdminBanner('Gagal menghapus anggota.');
        });
    } catch (err) {
      showAdminBanner('Gagal menghapus anggota.');
    }
  }

  function loadCarousel() {
    var container = document.getElementById('heroCarousel');
    if (!container) return;
    try {
      fetch(API_BASE + '/carousel')
        .then(function (res) {
          if (!res.ok) throw new Error('Gagal memuat galeri');
          return res.json();
        })
        .then(function (items) {
          renderCarousel(items && items.length ? items : DEMO_CAROUSEL, container);
        })
        .catch(function () {
          renderCarousel(DEMO_CAROUSEL, container);
        });
    } catch (err) {
      renderCarousel(DEMO_CAROUSEL, container);
    }
  }

  function renderCarousel(items, container) {
    var state = { index: 0, timer: null };
    var slides = items.map(function (item, i) {
      return '' +
        '<div data-slide="' + i + '" class="' + (i === 0 ? '' : 'hidden') + '">' +
          '<div class="relative overflow-hidden rounded-t-3xl">' +
            '<img src="' + escapeHtml(item.image_url) + '" alt="' + escapeHtml(item.title) + '" class="w-full h-64 md:h-96 object-cover">' +
            '<div class="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-transparent to-transparent"></div>' +
          '</div>' +
          '<div class="bg-white border border-navy/10 border-t-0 rounded-b-3xl p-6 text-center">' +
            '<h3 class="text-xl font-black text-slate-900">' + escapeHtml(item.title) + '</h3>' +
            '<p class="mt-2 text-sm text-slate-500 max-w-2xl mx-auto">' + escapeHtml(item.description) + '</p>' +
          '</div>' +
        '</div>';
    }).join('');
    var dots = items.map(function (item, i) {
      return '<button data-dot="' + i + '" aria-label="Slide ' + (i + 1) + '" class="w-2.5 h-2.5 rounded-full transition ' + (i === 0 ? 'bg-navy w-6' : 'bg-gold/40 hover:bg-gold/60') + '"></button>';
    }).join('');
    container.innerHTML = '' +
      '<div class="relative">' +
        '<div class="relative">' + slides + '</div>' +
        '<button data-prev aria-label="Sebelumnya" class="absolute left-3 top-1/3 w-10 h-10 rounded-full bg-white/80 backdrop-blur text-navy shadow-lg flex items-center justify-center hover:bg-white transition z-10"><i class="fa-solid fa-chevron-left"></i></button>' +
        '<button data-next aria-label="Berikutnya" class="absolute right-3 top-1/3 w-10 h-10 rounded-full bg-white/80 backdrop-blur text-navy shadow-lg flex items-center justify-center hover:bg-white transition z-10"><i class="fa-solid fa-chevron-right"></i></button>' +
        '<div class="flex items-center justify-center gap-2 mt-5">' + dots + '</div>' +
      '</div>';
    var show = function (i) {
      state.index = (i + items.length) % items.length;
      container.querySelectorAll('[data-slide]').forEach(function (s) {
        s.classList.toggle('hidden', Number(s.getAttribute('data-slide')) !== state.index);
      });
      container.querySelectorAll('[data-dot]').forEach(function (d) {
        var active = Number(d.getAttribute('data-dot')) === state.index;
        d.className = 'w-2.5 h-2.5 rounded-full transition ' + (active ? 'bg-navy w-6' : 'bg-gold/40 hover:bg-gold/60');
      });
    };
    container.querySelector('[data-prev]').addEventListener('click', function () { show(state.index - 1); });
    container.querySelector('[data-next]').addEventListener('click', function () { show(state.index + 1); });
    container.querySelectorAll('[data-dot]').forEach(function (d) {
      d.addEventListener('click', function () { show(Number(d.getAttribute('data-dot'))); });
    });
    state.timer = window.setInterval(function () { show(state.index + 1); }, 5000);
  }

  function initIndexPage() {
    loadCarousel();
    var container = document.getElementById('announcementsContainer');
    if (!container) return;
    try {
      fetch(API_BASE + '/announcements')
        .then(function (res) {
          if (!res.ok) throw new Error('Gagal memuat pengumuman');
          return res.json();
        })
        .then(function (items) {
          renderAnnouncements(items, container);
        })
        .catch(function () {
          renderAnnouncements(DEMO_ANNOUNCEMENTS, container);
        });
    } catch (err) {
      renderAnnouncements(DEMO_ANNOUNCEMENTS, container);
    }
  }

  function renderAnnouncements(items, container) {
    if (!items || !items.length) {
      container.innerHTML = '<div class="col-span-full text-center py-10 text-slate-400"><i class="fa-solid fa-bullhorn text-4xl mb-3"></i><p class="font-semibold">Belum ada pengumuman</p><p class="text-sm">Pengumuman terbaru akan muncul di sini.</p></div>';
      return;
    }
    container.innerHTML = items.map(function (a) {
      return '' +
        '<article class="bg-white rounded-2xl shadow-sm border border-navy/10 p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">' +
          '<div class="flex items-center justify-between mb-3">' +
            '<span class="inline-flex items-center gap-2 text-xs font-semibold text-navy bg-gold/20 px-3 py-1.5 rounded-full"><i class="fa-solid fa-calendar-days"></i>' + formatTanggal(a.tanggal) + '</span>' +
            (a.penting ? '<span class="inline-flex items-center gap-1 text-xs font-bold text-white bg-rose-500 px-3 py-1.5 rounded-full"><i class="fa-solid fa-circle-exclamation"></i>Penting</span>' : '') +
          '</div>' +
          '<h3 class="font-extrabold text-lg text-slate-900 mb-2">' + escapeHtml(a.judul) + '</h3>' +
          '<p class="text-sm text-slate-600 leading-relaxed">' + escapeHtml(a.isi) + '</p>' +
        '</article>';
    }).join('');
  }

  var strukturIsDemo = false;

  function initStrukturPage() {
    initMemberModal();
    var container = document.getElementById('strukturContainer');
    if (!container) return;
    strukturIsDemo = false;
    try {
      fetch(API_BASE + '/members')
        .then(function (res) {
          if (!res.ok) throw new Error('Gagal memuat anggota');
          return res.json();
        })
        .then(function (members) {
          renderStruktur(members, container);
        })
        .catch(function () {
          strukturIsDemo = true;
          renderStruktur(DEMO_MEMBERS, container);
        });
    } catch (err) {
      renderStruktur(DEMO_MEMBERS, container);
    }
  }

  function classifyMember(m) {
    var j = String(m.jabatan || '').toLowerCase();
    var k = String(m.komisi || '').toLowerCase();
    if (j.indexOf('pembina') !== -1 || k === 'pembina') return 'pembina';
    if (j.indexOf('humas') !== -1 || k === 'humas') return 'humas';
    if (j.indexOf('wakil') !== -1) return 'wakil';
    if (j.indexOf('ketua') !== -1) return 'ketua';
    if (j.indexOf('sekretaris') !== -1 || j.indexOf('sekertaris') !== -1) {
      return (j.indexOf('2') !== -1 || j.indexOf(' ii') !== -1) ? 'sekretaris2' : 'sekretaris1';
    }
    if (j.indexOf('bendahara') !== -1) {
      return (j.indexOf('2') !== -1 || j.indexOf(' ii') !== -1) ? 'bendahara2' : 'bendahara1';
    }
    return 'anggota';
  }

  function buildTree(members) {
    var groups = { pembina: [], ketua: [], wakil: [], sekretaris1: [], sekretaris2: [], bendahara1: [], bendahara2: [], humas: [], anggota: [] };
    members.forEach(function (m) {
      var key = classifyMember(m);
      if (!groups[key]) key = 'anggota';
      groups[key].push(m);
    });
    var byId = function (a, b) { return a.id - b.id; };
    Object.keys(groups).forEach(function (k) { groups[k].sort(byId); });
    return groups;
  }

  function nodePhoto(m, sizeClass) {
    var g = AVATAR_GRADIENTS[komisiIndex(m.komisi) % AVATAR_GRADIENTS.length];
    return m.foto
      ? '<img src="' + escapeHtml(m.foto) + '" alt="Foto ' + escapeHtml(m.nama) + '" class="' + sizeClass + ' rounded-full object-cover border-2 border-gold/60 shadow-md">'
      : '<div class="' + sizeClass + ' rounded-full bg-gradient-to-br ' + g + ' text-white flex items-center justify-center font-black text-lg shadow-md border-2 border-gold/60">' + initials(m.nama) + '</div>';
  }

  function treeNode(m) {
    return '' +
      '<button type="button" data-member-id="' + m.id + '" class="group text-center w-40 sm:w-48 px-4 py-4 bg-white rounded-2xl border-2 border-navy/10 shadow-sm hover:shadow-xl hover:border-gold hover:-translate-y-1 transition-all duration-300 cursor-pointer">' +
        '<div class="mx-auto mb-3">' + nodePhoto(m, 'w-14 h-14') + '</div>' +
        '<h3 class="font-extrabold text-slate-900 text-sm leading-tight group-hover:text-navy transition">' + escapeHtml(m.nama) + '</h3>' +
        '<p class="text-xs font-bold text-navy mt-1">' + escapeHtml(m.jabatan) + '</p>' +
        '<p class="text-[11px] text-slate-400 font-medium mt-0.5"><i class="fa-solid fa-school mr-1"></i>Kelas ' + escapeHtml(m.kelas) + '</p>' +
        '<p class="mt-2 text-[10px] font-semibold text-slate-400 inline-flex items-center gap-1"><i class="fa-solid fa-id-card"></i>Lihat Biodata</p>' +
      '</button>';
  }

  function emptyNode(label) {
    return '' +
      '<div class="w-40 sm:w-48 px-4 py-4 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl text-center">' +
        '<div class="w-14 h-14 mx-auto mb-3 rounded-full bg-slate-100 text-slate-300 flex items-center justify-center text-lg"><i class="fa-solid fa-user-minus"></i></div>' +
        '<p class="text-xs font-bold text-slate-400">' + escapeHtml(label) + '</p>' +
        '<p class="text-[10px] text-slate-300 mt-1">Belum terisi</p>' +
      '</div>';
  }

  function treeRowHtml(members, row, gStart) {
    var nodes = '';
    var stemBelow = '';
    if (row.pair) {
      var left = members[0] || null;
      var right = members[1] || null;
      nodes = '<div class="flex items-start justify-center gap-8">' +
          (left ? treeNode(left) : emptyNode(row.label + ' 1')) +
          '<div class="self-center w-10 border-t-2 border-navy/30"></div>' +
          (right ? treeNode(right) : emptyNode(row.label + ' 2')) +
        '</div>';
      stemBelow = '<div class="flex justify-center mt-2"><div class="w-px h-8 bg-navy/30"></div></div>';
    } else if (row.key === 'anggota') {
      nodes = members.length
        ? '<div class="flex flex-wrap justify-center gap-4">' + members.map(function (m) { return treeNode(m); }).join('') + '</div>'
        : emptyNode('Anggota');
      stemBelow = '';
    } else {
      nodes = members.length
        ? '<div class="flex justify-center">' + treeNode(members[0]) + '</div>'
        : '<div class="flex justify-center">' + emptyNode(row.label) + '</div>';
      stemBelow = '<div class="flex justify-center mt-2"><div class="w-px h-8 bg-navy/30"></div></div>';
    }
    return '' +
      '<div class="flex flex-col items-center w-full">' +
        '<span class="inline-flex items-center gap-2 text-xs font-bold px-4 py-1.5 rounded-full bg-navy text-white shadow-md mb-5"><i class="fa-solid ' + row.icon + ' text-gold"></i>' + escapeHtml(row.label) + '</span>' +
        nodes +
        stemBelow +
      '</div>';
  }

  function renderStruktur(members, container) {
    var groups = buildTree(members);
    var hasAny = Object.keys(groups).some(function (k) { return groups[k].length; });
    if (!hasAny) {
      container.innerHTML = '<div class="text-center py-16 text-slate-400"><i class="fa-solid fa-users-slash text-4xl mb-3"></i><p class="font-semibold">Data anggota belum tersedia.</p></div>';
      return;
    }
    var pembina = groups.pembina;
    if (!pembina.length && strukturIsDemo) {
      pembina = [DEMO_PEMBINA];
    }
    var header = '' +
      '<div class="flex flex-col items-center mb-2">' +
        '<div class="w-16 h-16 rounded-full bg-gradient-to-br from-navy to-blue-800 text-gold flex items-center justify-center text-2xl shadow-xl shadow-navy/30 mb-2"><i class="fa-solid fa-school"></i></div>' +
        '<p class="text-lg font-black text-slate-900">MPK SMP Negeri 248 Jakarta</p>' +
        '<p class="text-xs text-slate-400 font-semibold">Struktur Organisasi</p>' +
        '<div class="w-px h-10 bg-navy/30 mt-3"></div>' +
      '</div>';
    var rows = '' +
      treeRowHtml(pembina, TREE_ROWS[0], 0) +
      '<div class="flex justify-center"><div class="w-px h-8 bg-navy/30"></div></div>' +
      treeRowHtml(groups.ketua.concat(groups.wakil), TREE_ROWS[1], 1) +
      '<div class="flex justify-center"><div class="w-px h-8 bg-navy/30"></div></div>' +
      treeRowHtml(groups.sekretaris1.concat(groups.sekretaris2), TREE_ROWS[2], 2) +
      '<div class="flex justify-center"><div class="w-px h-8 bg-navy/30"></div></div>' +
      treeRowHtml(groups.bendahara1.concat(groups.bendahara2), TREE_ROWS[3], 3) +
      '<div class="flex justify-center"><div class="w-px h-8 bg-navy/30"></div></div>' +
      treeRowHtml(groups.humas, TREE_ROWS[4], 4) +
      (groups.anggota.length ? '<div class="flex justify-center"><div class="w-px h-8 bg-navy/30"></div></div>' : '') +
      treeRowHtml(groups.anggota, TREE_ROWS[5], 5);
    container.innerHTML = '<div class="flex flex-col items-center">' + header + rows + '</div>' +
      '<p class="mt-10 text-center text-xs text-slate-400"><i class="fa-solid fa-circle-info mr-1"></i>Klik kartu anggota untuk melihat biodata dan kartu identitas digital. Privasi anggota tetap terjaga.</p>';
    container.querySelectorAll('[data-member-id]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = btn.getAttribute('data-member-id');
        members.forEach(function (m) {
          if (String(m.id) === String(id)) openMemberModal(m);
        });
      });
    });
  }

  function initMemberModal() {
    var modal = document.getElementById('memberModal');
    if (!modal) return;
    var closeBtn = modal.querySelector('[data-modal-close]');
    if (closeBtn) closeBtn.addEventListener('click', closeMemberModal);
    modal.addEventListener('click', function (e) {
      if (e.target === modal) closeMemberModal();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !modal.classList.contains('hidden')) closeMemberModal();
    });
  }

  function openMemberModal(member) {
    var modal = document.getElementById('memberModal');
    var card = document.getElementById('memberModalCard');
    if (!modal) return;
    renderIdCard(member, card);
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  function closeMemberModal() {
    var modal = document.getElementById('memberModal');
    if (!modal) return;
    modal.classList.add('hidden');
    document.body.style.overflow = '';
  }

  function initAspirasiPage() {
    var form = document.getElementById('aspirasiForm');
    var successBox = document.getElementById('aspirasiSuccess');
    var errorBox = document.getElementById('aspirasiError');
    var submitBtn = document.getElementById('aspirasiSubmit');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      errorBox.classList.add('hidden');
      var nama = document.getElementById('aspirasiNama').value.trim();
      var kelas = document.getElementById('aspirasiKelas').value.trim();
      var kategori = document.getElementById('aspirasiKategori').value;
      var pesan = document.getElementById('aspirasiPesan').value.trim();
      var anonim = document.getElementById('aspirasiAnonim').checked;

      if (!kelas || !pesan) {
        errorBox.classList.remove('hidden');
        errorBox.textContent = 'Mohon isi kelas dan pesan aspirasi kamu.';
        return;
      }

      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Mengirim...';

      var payload = {
        nama: anonim ? 'Anonim' : (nama || 'Anonim'),
        kelas: kelas,
        kategori: kategori,
        pesan: pesan
      };

      fetch(API_BASE + '/aspirasi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
        .then(function (res) {
          if (!res.ok) {
            return res.json()
              .then(function (body) {
                var detail = (body && body.detail) ? String(body.detail) : 'Gagal mengirim (HTTP ' + res.status + ')';
                throw new Error(detail);
              })
              .catch(function (err) {
                if (err instanceof Error && err.message) throw err;
                throw new Error('Gagal mengirim (HTTP ' + res.status + ')');
              });
          }
          return res.json();
        })
        .then(function () {
          form.reset();
          successBox.classList.remove('hidden');
          successBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
        })
        .catch(function (err) {
          console.error('Kirim aspirasi gagal:', err);
          errorBox.classList.remove('hidden');
          errorBox.textContent = (err && err.message) ? err.message : 'Terjadi kesalahan koneksi. Coba lagi beberapa saat.';
        })
        .finally(function () {
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Kirim Aspirasi';
        });
    });
  }

  function initTentangPage() {
    var root = document.getElementById('aboutPengertian');
    if (!root) return;
    try {
      fetch(API_BASE + '/about')
        .then(function (res) {
          if (!res.ok) throw new Error('Gagal memuat konten');
          return res.json();
        })
        .then(function (a) {
          renderAbout(a);
        })
        .catch(function () {
          renderAbout(DEMO_ABOUT);
        });
    } catch (err) {
      renderAbout(DEMO_ABOUT);
    }
  }

  function renderAbout(a) {
    var set = function (id, text) {
      var el = document.getElementById(id);
      if (el) el.textContent = text || '';
    };
    set('aboutPengertian', a.pengertian);
    set('aboutVisi', a.visi);
    set('aboutMaknaLogo', a.makna_logo);
    var misiList = document.getElementById('aboutMisi');
    if (misiList) {
      misiList.innerHTML = String(a.misi || '').split('\n').map(function (line) {
        var t = line.trim();
        if (!t) return '';
        return '<li class="flex items-start gap-3"><i class="fa-solid fa-circle-check text-emerald-500 mt-1"></i><span>' + escapeHtml(t) + '</span></li>';
      }).join('');
    }
    var logoBox = document.getElementById('aboutLogoImage');
    if (logoBox) {
      loadLogoURL(function (url) {
        if (url) {
          logoBox.innerHTML = '<img src="' + escapeHtml(url) + '" alt="Logo MPK" class="w-40 h-40 object-contain bg-transparent drop-shadow-lg mx-auto">';
        } else {
          logoBox.innerHTML = logoFallbackHtml('w-40 h-40');
        }
      });
    }
  }

  function initProfilePage() {
    var card = document.getElementById('idCard');
    var errorBox = document.getElementById('profileError');
    var params = new URLSearchParams(window.location.search);
    var id = params.get('id');
    if (!id) {
      errorBox.classList.remove('hidden');
      card.classList.add('hidden');
      return;
    }
    var render = function (members) {
      var member = null;
      members.forEach(function (m) {
        if (String(m.id) === String(id)) member = m;
      });
      if (!member) {
        errorBox.classList.remove('hidden');
        card.classList.add('hidden');
        return;
      }
      renderIdCard(member, card);
    };
    try {
      fetch(API_BASE + '/members')
        .then(function (res) {
          if (!res.ok) throw new Error('Gagal memuat anggota');
          return res.json();
        })
        .then(render)
        .catch(function () {
          render(DEMO_MEMBERS);
        });
    } catch (err) {
      render(DEMO_MEMBERS);
    }
  }

  function renderIdCard(m, card) {
    var g = AVATAR_GRADIENTS[komisiIndex(m.komisi) % AVATAR_GRADIENTS.length];
    var periode = m.periode || '2026/2027';
    var photo = m.foto
      ? '<img src="' + escapeHtml(m.foto) + '" alt="Foto ' + escapeHtml(m.nama) + '" class="w-full h-full object-cover">'
      : '<span class="text-4xl font-black text-white">' + initials(m.nama) + '</span>';
    card.innerHTML = '' +
      '<div class="bg-white rounded-3xl shadow-2xl overflow-hidden border border-navy/10 max-w-sm mx-auto">' +
        '<div class="h-32 bg-gradient-to-r from-navy via-blue-800 to-blue-900 relative">' +
          '<div class="absolute inset-x-0 bottom-0 h-1.5 bg-gold"></div>' +
          '<div class="absolute inset-0 opacity-20" style="background-image: repeating-linear-gradient(45deg, #ffffff 0, #ffffff 2px, transparent 2px, transparent 12px);"></div>' +
          '<p class="absolute top-4 left-5 text-white font-extrabold text-sm tracking-wide">MPK SMP NEGERI 248 JAKARTA</p>' +
          '<p class="absolute top-4 right-5 text-white text-xs font-semibold bg-gold text-navy rounded-full px-3 py-1 font-bold">ID: MPK-' + periode.split('/')[0] + '-' + String(m.id).padStart(3, '0') + '</p>' +
        '</div>' +
        '<div class="px-6 pb-8 -mt-14 text-center">' +
          '<div class="w-28 h-28 mx-auto rounded-2xl bg-gradient-to-br ' + g + ' flex items-center justify-center overflow-hidden border-4 border-gold shadow-lg">' + photo + '</div>' +
          '<h2 class="mt-4 text-2xl font-black text-slate-900">' + escapeHtml(m.nama) + '</h2>' +
          '<p class="text-navy font-bold">' + escapeHtml(m.jabatan) + '</p>' +
          '<div class="flex justify-center gap-2 mt-3 flex-wrap">' +
            '<span class="inline-flex items-center gap-1 text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full"><i class="fa-solid fa-school"></i>Kelas ' + escapeHtml(m.kelas) + '</span>' +
            '<span class="inline-flex items-center gap-1 text-xs font-bold text-navy bg-gold/20 px-3 py-1.5 rounded-full"><i class="fa-solid fa-calendar-check"></i>Masa Bakti ' + escapeHtml(periode) + '</span>' +
          '</div>' +
          (m.motto ? '<p class="mt-4 text-sm italic text-slate-500">"' + escapeHtml(m.motto) + '"</p>' : '') +
          '<div class="mt-6 pt-4 border-t border-dashed border-slate-200 text-xs text-slate-400">Kartu Anggota Digital MPK • Periode ' + escapeHtml(periode) + '</div>' +
        '</div>' +
      '</div>';
  }

  // --- 3.5 DASHBOARD PENGATURAN SITUS / GALERI / TENTANG / QR ---
  function loadSettingsAdmin() {
    var input = document.getElementById('logoUrl');
    if (!input) return;
    try {
      apiFetch(API_BASE + '/settings')
        .then(function (res) { return res.ok ? res.json() : {}; })
        .then(function (s) { input.value = (s && s.logo_url) || ''; })
        .catch(function () { showAdminBanner('Gagal memuat pengaturan situs.'); });
    } catch (err) {
      showAdminBanner('Gagal memuat pengaturan situs.');
    }
  }

  function saveLogoSetting() {
    var input = document.getElementById('logoUrl');
    if (!input) return;
    apiFetch(API_BASE + '/settings', {
      method: 'PUT',
      body: JSON.stringify({ key: 'logo_url', value: input.value.trim() })
    })
      .then(function (res) {
        if (res.status === 401) { handleUnauthorized(); return; }
        if (!res.ok) throw new Error('Gagal menyimpan logo');
        showAdminBanner('Logo berhasil diperbarui dan langsung dipakai di seluruh halaman.');
        applyLogo();
      })
      .catch(function () { showAdminBanner('Gagal menyimpan pengaturan logo.'); });
  }

  function loadAboutAdmin() {
    try {
      apiFetch(API_BASE + '/about')
        .then(function (res) { return res.ok ? res.json() : null; })
        .then(function (a) {
          if (!a) return;
          var set = function (id, text) {
            var el = document.getElementById(id);
            if (el) el.value = text || '';
          };
          set('aboutPengertianAdmin', a.pengertian);
          set('aboutVisiAdmin', a.visi);
          set('aboutMisiAdmin', a.misi);
          set('aboutMaknaAdmin', a.makna_logo);
        })
        .catch(function () { showAdminBanner('Gagal memuat konten Tentang MPK.'); });
    } catch (err) {
      showAdminBanner('Gagal memuat konten Tentang MPK.');
    }
  }

  function saveAboutContent() {
    var get = function (id) {
      var el = document.getElementById(id);
      return el ? el.value.trim() : '';
    };
    var payload = {
      pengertian: get('aboutPengertianAdmin'),
      visi: get('aboutVisiAdmin'),
      misi: get('aboutMisiAdmin'),
      makna_logo: get('aboutMaknaAdmin')
    };
    apiFetch(API_BASE + '/about', { method: 'PUT', body: JSON.stringify(payload) })
      .then(function (res) {
        if (res.status === 401) { handleUnauthorized(); return; }
        if (!res.ok) throw new Error('Gagal menyimpan konten');
        showAdminBanner('Konten Tentang MPK berhasil disimpan.');
      })
      .catch(function () { showAdminBanner('Gagal menyimpan konten Tentang MPK.'); });
  }

  var editingCarouselId = null;

  function loadCarouselAdmin() {
    var container = document.getElementById('carouselList');
    if (!container) return;
    try {
      apiFetch(API_BASE + '/carousel')
        .then(function (res) { return res.ok ? res.json() : []; })
        .then(function (items) {
          if (!items.length) {
            container.innerHTML = '<div class="text-center text-slate-400 py-10 bg-white rounded-2xl border border-slate-200"><i class="fa-solid fa-images text-4xl mb-3"></i><p>Belum ada gambar galeri.</p></div>';
            return;
          }
          container.innerHTML = items.map(function (item) {
            return '' +
              '<div class="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex items-center gap-4">' +
                '<img src="' + escapeHtml(item.image_url) + '" alt="' + escapeHtml(item.title) + '" class="w-20 h-14 rounded-xl object-cover shrink-0">' +
                '<div class="min-w-0 flex-1">' +
                  '<p class="font-bold text-slate-900 truncate">' + escapeHtml(item.title) + '</p>' +
                  '<p class="text-xs text-slate-400 line-clamp-2">' + escapeHtml(item.description) + '</p>' +
                  '<p class="text-[11px] text-slate-400 mt-1">Urutan: ' + Number(item.urutan || 0) + '</p>' +
                '</div>' +
                '<div class="flex items-center gap-2">' +
                  '<button data-carousel-edit="' + item.id + '" class="w-9 h-9 rounded-lg bg-gold/20 text-navy hover:bg-navy hover:text-white transition" title="Edit"><i class="fa-solid fa-pen"></i></button>' +
                  '<button data-carousel-delete="' + item.id + '" class="w-9 h-9 rounded-lg bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white transition" title="Hapus"><i class="fa-solid fa-trash-can"></i></button>' +
                '</div>' +
              '</div>';
          }).join('');
          container.querySelectorAll('[data-carousel-edit]').forEach(function (btn) {
            btn.addEventListener('click', function () { editCarouselItem(btn.getAttribute('data-carousel-edit')); });
          });
          container.querySelectorAll('[data-carousel-delete]').forEach(function (btn) {
            btn.addEventListener('click', function () { deleteCarouselItem(btn.getAttribute('data-carousel-delete')); });
          });
        })
        .catch(function () { showAdminBanner('Gagal memuat galeri.'); });
    } catch (err) {
      showAdminBanner('Gagal memuat galeri.');
    }
  }

  function saveCarouselItem() {
    var get = function (id) {
      var el = document.getElementById(id);
      return el ? el.value.trim() : '';
    };
    var payload = {
      image_url: get('carouselImageUrl'),
      title: get('carouselTitle'),
      description: get('carouselDescription'),
      urutan: Number(get('carouselUrutan')) || 0
    };
    if (!payload.image_url || !payload.title || !payload.description) {
      showAdminBanner('URL gambar, judul, dan deskripsi wajib diisi.');
      return;
    }
    var method = 'POST';
    var url = API_BASE + '/carousel';
    if (editingCarouselId) {
      method = 'PUT';
      url = API_BASE + '/carousel/' + editingCarouselId;
    }
    apiFetch(url, { method: method, body: JSON.stringify(payload) })
      .then(function (res) {
        if (res.status === 401) { handleUnauthorized(); return; }
        if (!res.ok) throw new Error('Gagal menyimpan galeri');
        resetCarouselForm();
        loadCarouselAdmin();
      })
      .catch(function () { showAdminBanner('Gagal menyimpan gambar galeri.'); });
  }

  function resetCarouselForm() {
    editingCarouselId = null;
    var form = document.getElementById('carouselForm');
    if (form) form.reset();
    var btn = document.getElementById('carouselSubmit');
    if (btn) btn.innerHTML = '<i class="fa-solid fa-plus"></i> Tambah Gambar';
  }

  function editCarouselItem(id) {
    try {
      apiFetch(API_BASE + '/carousel')
        .then(function (res) { return res.ok ? res.json() : []; })
        .then(function (items) {
          var item = null;
          items.forEach(function (x) { if (String(x.id) === String(id)) item = x; });
          if (!item) { showAdminBanner('Gambar tidak ditemukan.'); return; }
          editingCarouselId = String(id);
          document.getElementById('carouselImageUrl').value = item.image_url;
          document.getElementById('carouselTitle').value = item.title;
          document.getElementById('carouselDescription').value = item.description;
          document.getElementById('carouselUrutan').value = Number(item.urutan || 0);
          document.getElementById('carouselSubmit').innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Simpan Perubahan';
        })
        .catch(function () { showAdminBanner('Gagal memuat galeri.'); });
    } catch (err) {
      showAdminBanner('Gagal memuat galeri.');
    }
  }

  function deleteCarouselItem(id) {
    if (!window.confirm('Hapus gambar galeri ini?')) return;
    try {
      apiFetch(API_BASE + '/carousel/' + id, { method: 'DELETE' })
        .then(function (res) {
          if (res.status === 401) { handleUnauthorized(); return; }
          if (!res.ok) throw new Error('Gagal menghapus');
          loadCarouselAdmin();
        })
        .catch(function () { showAdminBanner('Gagal menghapus gambar galeri.'); });
    } catch (err) {
      showAdminBanner('Gagal menghapus gambar galeri.');
    }
  }

  function bindDashboardForms() {
    var logoForm = document.getElementById('logoForm');
    if (logoForm) {
      logoForm.addEventListener('submit', function (e) {
        e.preventDefault();
        saveLogoSetting();
      });
    }
    var aboutForm = document.getElementById('aboutForm');
    if (aboutForm) {
      aboutForm.addEventListener('submit', function (e) {
        e.preventDefault();
        saveAboutContent();
      });
    }
    var carouselForm = document.getElementById('carouselForm');
    if (carouselForm) {
      carouselForm.addEventListener('submit', function (e) {
        e.preventDefault();
        saveCarouselItem();
      });
    }
    var qrBtn = document.getElementById('qrGenerate');
    if (qrBtn) {
      qrBtn.addEventListener('click', generateQR);
    }
    var socialForm = document.getElementById('socialForm');
    if (socialForm) {
      socialForm.addEventListener('submit', function (e) {
        e.preventDefault();
        saveSocialItem();
      });
    }
  }

  function generateQR() {
    var input = document.getElementById('qrData');
    var box = document.getElementById('qrResult');
    if (!input || !box) return;
    var data = input.value.trim();
    if (!data) {
      showAdminBanner('Masukkan teks atau URL terlebih dahulu.');
      return;
    }
    box.innerHTML = '<img src="https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=' + encodeURIComponent(data) + '" alt="QR Code" class="mx-auto rounded-2xl shadow-lg border border-slate-200">' +
      '<p class="text-center text-xs text-slate-400 mt-3">Scan untuk membuka: ' + escapeHtml(data) + '</p>';
  }

  // --- 3.6 SOSIAL MEDIA ---
  function socialCard(s) {
    var meta = socialPlatform(s.platform);
    return '' +
      '<a href="' + escapeHtml(s.url) + '" target="_blank" rel="noopener noreferrer" class="group bg-white rounded-2xl border border-navy/10 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-gold transition-all duration-300 p-6 flex flex-col items-center text-center">' +
        '<div class="w-16 h-16 rounded-2xl ' + meta.color + ' text-white flex items-center justify-center text-2xl shadow-md mb-4 group-hover:scale-110 transition-transform duration-300"><i class="' + meta.icon + '"></i></div>' +
        '<h3 class="font-extrabold text-slate-900 group-hover:text-navy transition">' + escapeHtml(s.nama) + '</h3>' +
        '<p class="text-xs font-bold text-navy mt-1 uppercase tracking-wide">' + escapeHtml(s.platform) + '</p>' +
        '<p class="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-gold"><i class="fa-solid fa-arrow-up-right-from-square"></i>Kunjungi Akun</p>' +
      '</a>';
  }

  function initSocialPage() {
    var container = document.getElementById('socialGrid');
    if (!container) return;
    var render = function (items) {
      container.innerHTML = items && items.length
        ? items.map(socialCard).join('')
        : '<div class="col-span-full text-center py-10 text-slate-400"><i class="fa-solid fa-share-nodes text-4xl mb-3"></i><p class="font-semibold">Belum ada akun sosial media.</p></div>';
    };
    try {
      fetch(API_BASE + '/social')
        .then(function (res) { return res.ok ? res.json() : []; })
        .then(render)
        .catch(function () { render(DEMO_SOCIAL); });
    } catch (err) {
      render(DEMO_SOCIAL);
    }
  }

  var editingSocialId = null;

  function loadSocialAdmin() {
    var container = document.getElementById('socialList');
    if (!container) return;
    try {
      apiFetch(API_BASE + '/social')
        .then(function (res) { return res.ok ? res.json() : []; })
        .then(function (items) {
          if (!items.length) {
            container.innerHTML = '<div class="text-center text-slate-400 py-10 bg-white rounded-2xl border border-slate-200"><i class="fa-solid fa-share-nodes text-4xl mb-3"></i><p>Belum ada akun sosial media.</p></div>';
            return;
          }
          container.innerHTML = items.map(function (s) {
            var meta = socialPlatform(s.platform);
            return '' +
              '<div class="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex items-center gap-4">' +
                '<div class="w-11 h-11 shrink-0 rounded-xl ' + meta.color + ' text-white flex items-center justify-center text-lg"><i class="' + meta.icon + '"></i></div>' +
                '<div class="min-w-0 flex-1">' +
                  '<p class="font-bold text-slate-900 truncate">' + escapeHtml(s.nama) + '</p>' +
                  '<p class="text-xs text-slate-400 truncate">' + escapeHtml(s.platform) + ' • Urutan: ' + Number(s.urutan || 0) + '</p>' +
                '</div>' +
                '<div class="flex items-center gap-2">' +
                  '<button data-social-edit="' + s.id + '" class="w-9 h-9 rounded-lg bg-gold/20 text-navy hover:bg-navy hover:text-white transition" title="Edit"><i class="fa-solid fa-pen"></i></button>' +
                  '<button data-social-delete="' + s.id + '" class="w-9 h-9 rounded-lg bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white transition" title="Hapus"><i class="fa-solid fa-trash-can"></i></button>' +
                '</div>' +
              '</div>';
          }).join('');
          container.querySelectorAll('[data-social-edit]').forEach(function (btn) {
            btn.addEventListener('click', function () { editSocialItem(btn.getAttribute('data-social-edit')); });
          });
          container.querySelectorAll('[data-social-delete]').forEach(function (btn) {
            btn.addEventListener('click', function () { deleteSocialItem(btn.getAttribute('data-social-delete')); });
          });
        })
        .catch(function () { showToast('Gagal memuat sosial media.', 'error'); });
    } catch (err) {
      showToast('Gagal memuat sosial media.', 'error');
    }
  }

  function saveSocialItem() {
    var get = function (id) {
      var el = document.getElementById(id);
      return el ? el.value.trim() : '';
    };
    var payload = {
      platform: get('socialPlatform'),
      nama: get('socialNama'),
      url: get('socialUrl'),
      urutan: Number(get('socialUrutan')) || 0
    };
    if (!payload.platform || !payload.nama || !payload.url) {
      showToast('Platform, nama, dan URL wajib diisi.', 'error');
      return;
    }
    var method = 'POST';
    var url = API_BASE + '/social';
    if (editingSocialId) {
      method = 'PUT';
      url = API_BASE + '/social/' + editingSocialId;
    }
    apiFetch(url, { method: method, body: JSON.stringify(payload) })
      .then(function (res) {
        if (res.status === 401) { handleUnauthorized(); return; }
        if (!res.ok) throw new Error('Gagal menyimpan');
        resetSocialForm();
        loadSocialAdmin();
        showToast('Akun sosial media berhasil disimpan.', 'success');
      })
      .catch(function () { showToast('Gagal menyimpan akun sosial media.', 'error'); });
  }

  function resetSocialForm() {
    editingSocialId = null;
    var form = document.getElementById('socialForm');
    if (form) form.reset();
    var btn = document.getElementById('socialSubmit');
    if (btn) btn.innerHTML = '<i class="fa-solid fa-plus"></i> Tambah Akun';
  }

  function editSocialItem(id) {
    try {
      apiFetch(API_BASE + '/social')
        .then(function (res) { return res.ok ? res.json() : []; })
        .then(function (items) {
          var item = null;
          items.forEach(function (x) { if (String(x.id) === String(id)) item = x; });
          if (!item) { showToast('Akun tidak ditemukan.', 'error'); return; }
          editingSocialId = String(id);
          document.getElementById('socialPlatform').value = item.platform;
          document.getElementById('socialNama').value = item.nama;
          document.getElementById('socialUrl').value = item.url;
          document.getElementById('socialUrutan').value = Number(item.urutan || 0);
          document.getElementById('socialSubmit').innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Simpan Perubahan';
          window.scrollTo({ top: 0, behavior: 'smooth' });
        })
        .catch(function () { showToast('Gagal memuat sosial media.', 'error'); });
    } catch (err) {
      showToast('Gagal memuat sosial media.', 'error');
    }
  }

  function deleteSocialItem(id) {
    if (!window.confirm('Hapus akun sosial media ini?')) return;
    try {
      apiFetch(API_BASE + '/social/' + id, { method: 'DELETE' })
        .then(function (res) {
          if (res.status === 401) { handleUnauthorized(); return; }
          if (!res.ok) throw new Error('Gagal menghapus');
          loadSocialAdmin();
          showToast('Akun sosial media berhasil dihapus.', 'success');
        })
        .catch(function () { showToast('Gagal menghapus akun sosial media.', 'error'); });
    } catch (err) {
      showToast('Gagal menghapus akun sosial media.', 'error');
    }
  }

  // --- 4. PAGE INITIALIZATION ---
  setActiveNav();
  applyLogo();
  initMobileMenu();
  var page = document.body.getAttribute('data-page');
  if (page === 'index') initIndexPage();
  if (page === 'struktur') initStrukturPage();
  if (page === 'aspirasi') initAspirasiPage();
  if (page === 'tentang') initTentangPage();
  if (page === 'sosial') initSocialPage();
  if (page === 'profile') initProfilePage();
  if (page === 'dashboard') initDashboardPage();
});
