/* ===== TRANSISI ANTAR HALAMAN =====
   Urutan menu: Beranda -> Layanan -> Laporan -> FAQ -> Buat Pengaduan
   Pindah ke menu yang lebih kanan  => halaman lama geser ke kiri, halaman baru masuk dari kanan.
   Pindah ke menu yang lebih kiri   => kebalikannya.
   Cukup panggil file ini di <head> semua halaman. */
(function () {
  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var DURASI_KELUAR = 320; // ms, samakan dengan CSS (.leave-*)

  // Urutan halaman (angka kecil = lebih kiri di menu)
  function urutan(url) {
    var file = url.pathname.split('/').pop() || 'index.html';
    if (file === 'pengaduan.html') return 4;
    if (file === 'laporan.html')   return 2;
    if (url.hash === '#layanan')   return 1;
    if (url.hash === '#terbaru')   return 2;
    if (url.hash === '#faq')       return 3;
    return 0; // beranda
  }

  // ---------- 1) ANIMASI MASUK (jalan segera, sebelum halaman tergambar) ----------
  if (!reduce) {
    var arah = null;
    try { arah = sessionStorage.getItem('arahHalaman'); sessionStorage.removeItem('arahHalaman'); } catch (e) {}
    root.classList.add(arah === 'prev' ? 'enter-prev' : arah === 'next' ? 'enter-next' : 'enter-fade');
    setTimeout(function () {
      root.classList.remove('enter-next', 'enter-prev', 'enter-fade');
    }, 900);
  }

  // Tombol Back/Forward browser (halaman diambil dari cache): pastikan tidak tertinggal pudar
  window.addEventListener('pageshow', function (e) {
    if (e.persisted) root.classList.remove('leave-next', 'leave-prev', 'enter-next', 'enter-prev', 'enter-fade');
  });

  // ---------- 2) ANIMASI KELUAR (saat klik link) ----------
  if (reduce) return;

  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a) return;

    // biarkan perilaku normal untuk: klik tengah/ctrl/shift, tab baru, download, link non-http
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (a.target && a.target !== '_self') return;
    if (a.hasAttribute('download')) return;

    var tujuan = new URL(a.href, location.href);
    if (tujuan.origin !== location.origin) return;                         // link keluar situs
    if (tujuan.pathname === location.pathname) return;                     // masih di halaman yang sama (scroll #layanan dll)

    e.preventDefault();

    var dari = urutan(new URL(location.href));
    var ke   = urutan(tujuan);
    var dir  = ke >= dari ? 'next' : 'prev';

    try { sessionStorage.setItem('arahHalaman', dir); } catch (err) {}
    root.classList.add('leave-' + dir);
    setTimeout(function () { location.href = tujuan.href; }, DURASI_KELUAR);
  });
})();
