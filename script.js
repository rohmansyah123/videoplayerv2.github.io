document.addEventListener('DOMContentLoaded', () => {
    const adOverlay = document.getElementById('ad-overlay');
    const adLink = document.getElementById('ad-link');
    const videoPlayerContainer = document.getElementById('video-player-container');
    const myVideo = document.getElementById('myVideo');

    // Waktu tunggu sebelum tombol iklan aktif (misalnya 3 detik)
    const adDisplayDuration = 3000; 

    // URL iklan direct link Anda
    const directLinkUrl = "URL_IKLAN_DIRECT_LINK_ANDA"; // Ganti dengan URL iklan direct link Anda

    // URL video Anda
    const videoUrl = "URL_VIDEO_ANDA.mp4"; // Ganti dengan URL video Anda

    // Atur atribut src untuk video
    myVideo.src = videoUrl;

    // Menonaktifkan tombol iklan pada awalnya
    adLink.style.pointerEvents = 'none';
    adLink.style.opacity = '0.6';
    adLink.textContent = `Mohon tunggu ${adDisplayDuration / 1000} detik...`;

    setTimeout(() => {
        // Mengaktifkan tombol iklan setelah waktu tunggu
        adLink.style.pointerEvents = 'auto';
        adLink.style.opacity = '1';
        adLink.textContent = "Klik untuk Lanjutkan ke Video";
        adLink.href = directLinkUrl; // Atur href tombol iklan
    }, adDisplayDuration);

    adLink.addEventListener('click', (event) => {
        // Ini akan membuka iklan di tab baru.
        // Penting: Browser modern mungkin memblokir popup jika tidak ada interaksi pengguna yang langsung.
        // Pastikan URL iklan direct link Anda adalah URL yang valid dan dapat dibuka di tab baru.
        
        // Setelah iklan diklik, sembunyikan overlay iklan dan tampilkan video
        adOverlay.classList.add('hidden');
        videoPlayerContainer.classList.remove('hidden');
        myVideo.play(); // Putar video secara otomatis
        myVideo.muted = false; // Batalkan mute jika sebelumnya di-mute
    });

    // Opsional: Untuk pengalaman yang lebih baik, Anda bisa menambahkan logika
    // untuk memastikan iklan sudah dimuat sepenuhnya sebelum mengaktifkan tombol.
    // Namun, untuk direct link, biasanya tombol langsung aktif setelah waktu tertentu.
});
