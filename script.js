document.addEventListener('DOMContentLoaded', () => {
    const adOverlay = document.getElementById('ad-overlay');
    const adLink = document.getElementById('ad-link');
    const videoPlayerSection = document.getElementById('video-player-section');
    const myVideo = document.getElementById('myVideo');
    const videoList = document.getElementById('video-list');

    // Waktu tunggu sebelum tombol iklan aktif (misalnya 3 detik)
    const adDisplayDuration = 3000;

    let directLinks = [];
    let randomDirectLink = '';

    let videos = [];
    let currentVideoIndex = 0; // Indeks video yang sedang atau akan diputar
    let selectedVideoIndex = 0; // Indeks video yang dipilih user dari daftar

    // Fungsi untuk memuat dan memutar video
    function loadVideo(index) {
        if (index >= 0 && index < videos.length) {
            myVideo.src = videos[index].src;
            myVideo.load();
            myVideo.play();
            myVideo.muted = false; // Batalkan mute
            currentVideoIndex = index; // Setel video yang sedang diputar
            updateActiveVideoLink();
        }
    }

    // Fungsi untuk menampilkan overlay iklan
    function showAdOverlay() {
        adOverlay.classList.remove('hidden');
        videoPlayerSection.classList.add('hidden'); // Sembunyikan player saat iklan muncul
        myVideo.pause(); // Jeda video yang sedang diputar
        myVideo.currentTime = 0; // Reset waktu video ke awal (opsional)

        // Reset dan aktifkan tombol iklan
        adLink.style.pointerEvents = 'none';
        adLink.style.opacity = '0.6';
        adLink.textContent = `Mohon tunggu ${adDisplayDuration / 1000} detik...`;

        // Pilih direct link iklan secara acak
        if (directLinks.length > 0) {
            const randomAdIndex = Math.floor(Math.random() * directLinks.length);
            randomDirectLink = directLinks[randomAdIndex];
            console.log('Direct link iklan yang dipilih:', randomDirectLink);
        } else {
            console.warn('Tidak ada direct link iklan ditemukan di ads.json. Melanjutkan tanpa iklan.');
            // Jika tidak ada iklan, langsung lanjutkan ke video
            adOverlay.classList.add('hidden');
            videoPlayerSection.classList.remove('hidden');
            loadVideo(selectedVideoIndex); // Putar video yang dipilih
            return;
        }

        setTimeout(() => {
            adLink.style.pointerEvents = 'auto';
            adLink.style.opacity = '1';
            adLink.textContent = "Klik untuk Lanjutkan ke Video";
            adLink.href = randomDirectLink;
        }, adDisplayDuration);
    }

    // Fungsi untuk memperbarui kelas 'active-video' pada daftar
    function updateActiveVideoLink() {
        const links = videoList.querySelectorAll('a');
        links.forEach((link, idx) => {
            if (idx === currentVideoIndex) { // Gunakan currentVideoIndex untuk video yang aktif
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
                // Jika video yang dipilih berbeda dari yang sedang diputar
                if (index !== currentVideoIndex) {
                    selectedVideoIndex = index; // Simpan indeks video yang dipilih user
                    showAdOverlay(); // Tampilkan iklan lagi
                }
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

            // Pilih indeks video secara acak untuk video utama pertama kali
            const randomIndex = Math.floor(Math.random() * videos.length);
            selectedVideoIndex = randomIndex; // Setel video awal yang akan diputar setelah iklan pertama
        })
        .catch(error => {
            console.error('Error fetching videos:', error);
            alert('Gagal memuat daftar video. Silakan coba lagi nanti.');
            // Jika gagal memuat video, mungkin perlu penanganan khusus atau tampilkan pesan kosong
        });
    // --- AKHIR LOGIKA PENGAMBILAN DATA VIDEO ---

    // --- LOGIKA PENGAMBILAN DIRECT LINK IKLAN DARI JSON ---
    fetch('data/ads.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            directLinks = data;
            // Panggil showAdOverlay untuk iklan pertama kali
            showAdOverlay();
        })
        .catch(error => {
            console.error('Error fetching direct links:', error);
            alert('Gagal memuat iklan. Video akan diputar tanpa iklan.');
            // Jika gagal memuat iklan, langsung tampilkan video pertama
            adOverlay.classList.add('hidden');
            videoPlayerSection.classList.remove('hidden');
            loadVideo(selectedVideoIndex); // Putar video yang dipilih (yaitu video awal acak)
        });
    // --- AKHIR LOGIKA PENGAMBILAN DIRECT LINK IKLAN ---

    // Listener untuk tombol iklan
    adLink.addEventListener('click', (event) => {
        // Ini akan membuka iklan di tab baru.

        // Setelah iklan diklik, sembunyikan overlay iklan dan tampilkan bagian video
        adOverlay.classList.add('hidden');
        videoPlayerSection.classList.remove('hidden');
        loadVideo(selectedVideoIndex); // Putar video yang terakhir dipilih/disiapkan
    });
});
