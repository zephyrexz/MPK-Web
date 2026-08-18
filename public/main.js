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
    { id: 1, nama: 'Raka Pratama', kelas: '9A', jabatan: 'Ketua MPK', komisi: 'Pengurus Inti', foto: '', motto: 'Berani bicara, bertanggung jawab!' },
    { id: 2, nama: 'Salsabila Putri', kelas: '9B', jabatan: 'Wakil Ketua', komisi: 'Pengurus Inti', foto: '', motto: 'Suara siswa adalah suaraku.' },
    { id: 3, nama: 'Dian Anggraini', kelas: '9C', jabatan: 'Sekretaris', komisi: 'Pengurus Inti', foto: '', motto: 'Rapi, teliti, dan amanah.' },
    { id: 4, nama: 'Bima Nugroho', kelas: '9A', jabatan: 'Bendahara', komisi: 'Pengurus Inti', foto: '', motto: 'Jujur dalam setiap rupiah.' },
    { id: 5, nama: 'Nadia Ramadhani', kelas: '8B', jabatan: 'Anggota', komisi: 'Komisi 1', foto: '', motto: 'Iman, ilmu, dan amal.' },
    { id: 6, nama: 'Fikri Alfarizi', kelas: '8C', jabatan: 'Anggota', komisi: 'Komisi 1', foto: '', motto: 'Rajin ibadah, rajin belajar.' },
    { id: 7, nama: 'Arif Setiawan', kelas: '8A', jabatan: 'Anggota', komisi: 'Komisi 2', foto: '', motto: 'Disiplin dimulai dari diri sendiri.' },
    { id: 8, nama: 'Melati Kusuma', kelas: '8B', jabatan: 'Anggota', komisi: 'Komisi 2', foto: '', motto: 'Tertib itu keren.' },
    { id: 9, nama: 'Cinta Rahmadani', kelas: '7C', jabatan: 'Anggota', komisi: 'Komisi 3', foto: '', motto: 'Sekolah bersih, hati senang.' },
    { id: 10, nama: 'Yoga Pratama', kelas: '7A', jabatan: 'Anggota', komisi: 'Komisi 3', foto: '', motto: 'Sehat itu kaya.' },
    { id: 11, nama: 'Keysha Aulia', kelas: '7B', jabatan: 'Anggota', komisi: 'Komisi 4', foto: '', motto: 'Berkarya lewat seni dan olahraga.' },
    { id: 12, nama: 'Dimas Saputra', kelas: '8C', jabatan: 'Anggota', komisi: 'Komisi 4', foto: '', motto: 'Olahraga membuatku kuat.' },
    { id: 13, nama: 'Rina Wijaya', kelas: '9C', jabatan: 'Anggota', komisi: 'Komisi 5', foto: '', motto: 'Aspirasi siswa, kewajibanku.' },
    { id: 14, nama: 'Aldi Firmansyah', kelas: '8A', jabatan: 'Anggota', komisi: 'Komisi 5', foto: '', motto: 'Sampaikan dengan berani dan sopan.' }
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

  var AVATAR_GRADIENTS = [
    'from-indigo-500 to-purple-500',
    'from-sky-500 to-blue-600',
    'from-emerald-500 to-teal-600',
    'from-rose-500 to-pink-600',
    'from-amber-500 to-orange-600',
    'from-fuchsia-500 to-purple-600'
  ];

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
        link.classList.add('text-indigo-600');
      }
    });
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
            t.classList.add('bg-indigo-600', 'text-white', 'shadow-md');
            t.classList.remove('text-slate-600', 'hover:bg-indigo-50');
          } else {
            t.classList.remove('bg-indigo-600', 'text-white', 'shadow-md');
            t.classList.add('text-slate-600', 'hover:bg-indigo-50');
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
    loadAspirasiAdmin();
    loadAnnouncementsAdmin();
    loadMembersAdmin();
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
        var foto = document.getElementById('anggotaFoto').value.trim();
        var motto = document.getElementById('anggotaMotto').value.trim();
        if (!nama || !kelas || !jabatan) {
          showAdminBanner('Nama, kelas, dan jabatan wajib diisi.');
          return;
        }
        var payload = { nama: nama, kelas: kelas, jabatan: jabatan, komisi: komisi, foto: foto || null, motto: motto || null };
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
              '<div class="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-sm shrink-0">' + initials(a.nama) + '</div>' +
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
              '<select data-aspirasi-status="' + a.id + '" class="text-xs font-semibold border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400">' +
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
            '<button data-announcement-edit="' + a.id + '" class="px-3 py-2 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white transition text-sm" title="Edit"><i class="fa-solid fa-pen"></i></button>' +
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
            '<p class="text-xs text-indigo-600 font-semibold">' + escapeHtml(m.jabatan) + '</p>' +
            '<p class="text-xs text-slate-400 mt-1"><i class="fa-solid fa-school mr-1"></i>Kelas ' + escapeHtml(m.kelas) + ' • ' + escapeHtml(m.komisi) + '</p>' +
          '</div>' +
          '<div class="flex items-center gap-2">' +
            '<button data-member-edit="' + m.id + '" class="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white transition" title="Edit"><i class="fa-solid fa-pen"></i></button>' +
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

  function initIndexPage() {
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
        '<article class="bg-white rounded-2xl shadow-sm border border-indigo-100 p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">' +
          '<div class="flex items-center justify-between mb-3">' +
            '<span class="inline-flex items-center gap-2 text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full"><i class="fa-solid fa-calendar-days"></i>' + formatTanggal(a.tanggal) + '</span>' +
            (a.penting ? '<span class="inline-flex items-center gap-1 text-xs font-bold text-white bg-rose-500 px-3 py-1.5 rounded-full"><i class="fa-solid fa-circle-exclamation"></i>Penting</span>' : '') +
          '</div>' +
          '<h3 class="font-extrabold text-lg text-slate-900 mb-2">' + escapeHtml(a.judul) + '</h3>' +
          '<p class="text-sm text-slate-600 leading-relaxed">' + escapeHtml(a.isi) + '</p>' +
        '</article>';
    }).join('');
  }

  function initStrukturPage() {
    var container = document.getElementById('strukturContainer');
    if (!container) return;
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
          renderStruktur(DEMO_MEMBERS, container);
        });
    } catch (err) {
      renderStruktur(DEMO_MEMBERS, container);
    }
  }

  function renderStruktur(members, container) {
    var groups = groupByKomisi(members);
    if (!groups.length) {
      container.innerHTML = '<div class="text-center py-16 text-slate-400"><i class="fa-solid fa-users-slash text-4xl mb-3"></i><p class="font-semibold">Data anggota belum tersedia.</p></div>';
      return;
    }
    container.innerHTML = groups.map(function (group, gi) {
      var desc = KOMISI_INFO[group.komisi] || '';
      var cards = group.anggota.map(function (m, mi) {
        var g = AVATAR_GRADIENTS[(gi + mi) % AVATAR_GRADIENTS.length];
        return '' +
          '<a href="/profile.html?id=' + m.id + '" class="group bg-white rounded-2xl border border-indigo-100 shadow-sm p-5 hover:shadow-xl hover:-translate-y-1 hover:border-indigo-300 transition-all duration-300 block">' +
            '<div class="flex items-center gap-4">' +
              '<div class="w-14 h-14 rounded-full bg-gradient-to-br ' + g + ' text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-md group-hover:scale-110 transition-transform">' + initials(m.nama) + '</div>' +
              '<div class="min-w-0">' +
                '<h3 class="font-extrabold text-slate-900 truncate">' + escapeHtml(m.nama) + '</h3>' +
                '<p class="text-indigo-600 text-sm font-semibold">' + escapeHtml(m.jabatan) + '</p>' +
                '<p class="text-xs text-slate-400 font-medium"><i class="fa-solid fa-school mr-1"></i>Kelas ' + escapeHtml(m.kelas) + '</p>' +
              '</div>' +
            '</div>' +
            (m.motto ? '<p class="mt-3 text-xs italic text-slate-500 border-t border-slate-100 pt-3">"' + escapeHtml(m.motto) + '"</p>' : '') +
          '</a>';
      }).join('');
      return '' +
        '<section class="mb-12">' +
          '<div class="flex items-center gap-3 mb-6">' +
            '<div class="w-11 h-11 rounded-xl bg-gradient-to-br ' + AVATAR_GRADIENTS[gi % AVATAR_GRADIENTS.length] + ' text-white flex items-center justify-center shadow-lg"><i class="fa-solid ' + komisiIcon(group.komisi) + '"></i></div>' +
            '<div>' +
              '<h2 class="text-xl font-black text-slate-900">' + escapeHtml(group.komisi) + '</h2>' +
              (desc ? '<p class="text-sm text-slate-500">' + escapeHtml(desc) + '</p>' : '') +
            '</div>' +
            '<span class="ml-auto text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">' + group.anggota.length + ' Anggota</span>' +
          '</div>' +
          '<div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">' + cards + '</div>' +
        '</section>';
    }).join('');
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

      try {
        fetch(API_BASE + '/aspirasi', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
          .then(function (res) {
            if (!res.ok) throw new Error('Gagal mengirim');
            return res.json();
          })
          .then(function () {
            form.reset();
            successBox.classList.remove('hidden');
            successBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
          })
          .catch(function () {
            errorBox.classList.remove('hidden');
            errorBox.textContent = 'Terjadi kesalahan koneksi. Coba lagi beberapa saat.';
          })
          .finally(function () {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Kirim Aspirasi';
          });
      } catch (err) {
        errorBox.classList.remove('hidden');
        errorBox.textContent = 'Terjadi kesalahan. Coba lagi.';
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Kirim Aspirasi';
      }
    });
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
    var photo = m.foto
      ? '<img src="' + escapeHtml(m.foto) + '" alt="Foto ' + escapeHtml(m.nama) + '" class="w-full h-full object-cover">'
      : '<span class="text-4xl font-black text-white">' + initials(m.nama) + '</span>';
    card.innerHTML = '' +
      '<div class="bg-white rounded-3xl shadow-2xl overflow-hidden border border-indigo-100 max-w-sm mx-auto">' +
        '<div class="h-32 bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-600 relative">' +
          '<div class="absolute inset-0 opacity-20" style="background-image: repeating-linear-gradient(45deg, #ffffff 0, #ffffff 2px, transparent 2px, transparent 12px);"></div>' +
          '<p class="absolute top-4 left-5 text-white font-extrabold text-sm tracking-wide">MPK SMPN 1 NUSANTARA</p>' +
          '<p class="absolute top-4 right-5 text-white text-xs font-semibold bg-white/20 rounded-full px-3 py-1">ID: MPK-2026-' + String(m.id).padStart(3, '0') + '</p>' +
        '</div>' +
        '<div class="px-6 pb-8 -mt-14 text-center">' +
          '<div class="w-28 h-28 mx-auto rounded-2xl bg-gradient-to-br ' + g + ' flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">' + photo + '</div>' +
          '<h2 class="mt-4 text-2xl font-black text-slate-900">' + escapeHtml(m.nama) + '</h2>' +
          '<p class="text-indigo-600 font-bold">' + escapeHtml(m.jabatan) + '</p>' +
          '<div class="flex justify-center gap-2 mt-3 flex-wrap">' +
            '<span class="inline-flex items-center gap-1 text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full"><i class="fa-solid fa-school"></i>Kelas ' + escapeHtml(m.kelas) + '</span>' +
            '<span class="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full"><i class="fa-solid fa-users"></i>' + escapeHtml(m.komisi) + '</span>' +
          '</div>' +
          (m.motto ? '<p class="mt-4 text-sm italic text-slate-500">"' + escapeHtml(m.motto) + '"</p>' : '') +
          '<div class="mt-6 pt-4 border-t border-dashed border-slate-200 text-xs text-slate-400">Kartu Anggota Digital MPK • Periode 2026/2027</div>' +
        '</div>' +
      '</div>';
  }

  // --- 4. PAGE INITIALIZATION ---
  setActiveNav();
  var page = document.body.getAttribute('data-page');
  if (page === 'index') initIndexPage();
  if (page === 'struktur') initStrukturPage();
  if (page === 'aspirasi') initAspirasiPage();
  if (page === 'profile') initProfilePage();
  if (page === 'dashboard') initDashboardPage();
});
