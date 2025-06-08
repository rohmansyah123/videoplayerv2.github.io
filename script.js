document.addEventListener('DOMContentLoaded', () => {
    const adOverlay = document.getElementById('ad-overlay');
    const adLink = document.getElementById('ad-link');
    const videoPlayerSection = document.getElementById('video-player-section');
    const myVideo = document.getElementById('myVideo');
    const videoList = document.getElementById('video-list');

    // Waktu tunggu sebelum tombol iklan aktif (misalnya 3 detik)
    const adDisplayDuration = 3000;

    let directLinks = []; // Array ini akan diisi dengan direct link iklan
    let randomDirectLink = ''; // Link iklan yang akan digunakan untuk sesi ini

    let videos = [];
    let currentVideoIndex = 0;

    // Fungsi untuk memuat dan memutar video
    function loadVideo(index) {
        if (index >= 0 && index < videos.length) {
            myVideo.src = videos[index].src;
            myVideo.load();
            myVideo.play();
            myVideo.muted = false; // Batalkan mute
            currentVideoIndex = index;
            updateActiveVideoLink();
        }
    }

    // Fungsi untuk memperbarui kelas 'active-video' pada daftar
    function updateActiveVideoLink() {
        const links = videoList.querySelectorAll('a');
        links.forEach((link, idx) => {
            if (idx === currentVideoIndex) {
                link.classList.add('active-video');
            } else {
                link.classList.remove('active-video');
            }
        });
    }

    // Fungsi untuk mengisi daftar video di HTML
    function populateVideoList() {
        videoList.innerHTML = '';
        videos.forEach((video, index) => {
            const listItem = document.createElement('li');
            const link = document.createElement('a');
            link.href = "#";
            link.textContent = video.title;
            link.dataset.index = index;
            link.addEventListener('click', (e) => {
                e.preventDefault();
                loadVideo(index);
            });
            listItem.appendChild(link);
            videoList.appendChild(listItem);
        });
    }

    // --- LOGIKA PENGAMBILAN DATA VIDEO DARI JSON ---
    fetch('data/videos.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            videos = data;
            populateVideoList();

            const randomIndex = Math.floor(Math.random() * videos.length);
            loadVideo(randomIndex);
        })
        .catch(error => {
            console.error('Error fetching videos:', error);
            alert('Gagal memuat daftar video. Silakan coba lagi nanti.');
        });
    // --- AKHIR LOGIKA PENGAMBILAN DATA VIDEO ---

    // --- LOGIKA BARU PENGAMBILAN DIRECT LINK IKLAN DARI JSON ---
    fetch('data/ads.json') // Pastikan path ini benar!
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            directLinks = data;
            // Pilih satu direct link secara acak
            if (directLinks.length > 0) {
                const randomAdIndex = Math.floor(Math.random() * directLinks.length);
                randomDirectLink = directLinks[randomAdIndex];
                console.log('Direct link iklan yang dipilih:', randomDirectLink); // Untuk debugging
            } else {
                console.warn('Tidak ada direct link iklan ditemukan di ads.json.');
                // Opsional: Sembunyikan iklan jika tidak ada direct link
                adOverlay.classList.add('hidden');
                videoPlayerSection.classList.remove('hidden');
                myVideo.play();
                myVideo.muted = false;
                return; // Berhenti eksekusi jika tidak ada iklan
            }

            // Aktifkan tombol iklan setelah waktu tunggu
            adLink.style.pointerEvents = 'none';
            adLink.style.opacity = '0.6';
            adLink.textContent = `Mohon tunggu ${adDisplayDuration / 1000} detik...`;

            setTimeout(() => {
                adLink.style.pointerEvents = 'auto';
                adLink.style.opacity = '1';
                adLink.textContent = "Klik untuk Lanjutkan ke Video";
                adLink.href = randomDirectLink; // Atur href tombol dengan link acak
            }, adDisplayDuration);

        })
        .catch(error => {
            console.error('Error fetching direct links:', error);
            alert('Gagal memuat iklan. Video akan diputar tanpa iklan.');
            // Jika gagal memuat iklan, langsung tampilkan video
            adOverlay.classList.add('hidden');
            videoPlayerSection.classList.remove('hidden');
            myVideo.play();
            myVideo.muted = false;
        });
    // --- AKHIR LOGIKA PENGAMBILAN DIRECT LINK IKLAN ---

    adLink.addEventListener('click', (event) => {
        // Ini akan membuka iklan di tab baru.

        // Setelah iklan diklik, sembunyikan overlay iklan dan tampilkan bagian video
        adOverlay.classList.add('hidden');
        videoPlayerSection.classList.remove('hidden');
        myVideo.play();
        myVideo.muted = false;
    });
});
