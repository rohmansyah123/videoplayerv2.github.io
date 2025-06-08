document.addEventListener('DOMContentLoaded', () => {
    const adOverlay = document.getElementById('ad-overlay');
    const adLink = document.getElementById('ad-link');
    const videoPlayerSection = document.getElementById('video-player-section');
    const myVideo = document.getElementById('myVideo');
    const videoList = document.getElementById('video-list');

    const adDisplayDuration = 3000; // Waktu tunggu sebelum tombol iklan aktif (3 detik)

    let directLinks = []; // Array untuk menyimpan direct link iklan
    let randomDirectLink = ''; // Link iklan yang akan digunakan untuk sesi ini

    let videos = []; // Array untuk menyimpan data video
    let currentVideoIndex = 0; // Indeks video yang sedang diputar di player
    let selectedVideoIndex = 0; // Indeks video yang dipilih user dari daftar (akan diputar setelah iklan)

    // --- Fungsi Utama ---

    // Memuat dan memutar video di player
    function loadVideo(index) {
        if (index >= 0 && index < videos.length) {
            myVideo.src = videos[index].src;
            myVideo.load();
            myVideo.play();
            myVideo.muted = false; // Batalkan mute
            currentVideoIndex = index; // Perbarui indeks video yang sedang aktif
            updateActiveVideoLink(); // Perbarui highlight di daftar video
        }
    }

    // Menampilkan overlay iklan
    function showAdOverlay() {
        adOverlay.classList.remove('hidden');
        videoPlayerSection.classList.add('hidden'); // Sembunyikan player & daftar saat iklan muncul
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

        // Aktifkan tombol iklan setelah waktu tunggu
        setTimeout(() => {
            adLink.style.pointerEvents = 'auto';
            adLink.style.opacity = '1';
            adLink.textContent = "Klik untuk Lanjutkan ke Video";
            adLink.href = randomDirectLink; // Setel href tombol dengan link acak
        }, adDisplayDuration);
    }

    // Memperbarui kelas 'active-video' pada daftar video
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

    // Mengisi daftar video di HTML dari data yang diambil
    function populateVideoList() {
        videoList.innerHTML = ''; // Bersihkan daftar yang mungkin sudah ada
        videos.forEach((video, index) => {
            const listItem = document.createElement('li');
            const link = document.createElement('a');
            link.href = "#"; // Mencegah navigasi halaman
            link.textContent = video.title;
            link.dataset.index = index; // Menyimpan indeks video
            link.addEventListener('click', (e) => {
                e.preventDefault(); // Mencegah tindakan default link
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

    // --- Pengambilan Data Asinkron ---

    // Mengambil daftar video dari file JSON
    fetch('data/videos.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            videos = data; // Simpan data video yang diambil
            populateVideoList(); // Isi daftar video di UI

            // Pilih indeks video secara acak untuk video utama pertama kali
            const randomIndex = Math.floor(Math.random() * videos.length);
            selectedVideoIndex = randomIndex; // Setel video awal yang akan diputar setelah iklan pertama
        })
        .catch(error => {
            console.error('Error fetching videos:', error);
            alert('Gagal memuat daftar video. Silakan coba lagi nanti.');
            // Jika gagal memuat video, mungkin perlu penanganan khusus
        });

    // Mengambil daftar direct link iklan dari file JSON
    fetch('data/ads.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            directLinks = data;
            showAdOverlay(); // Panggil showAdOverlay untuk iklan pertama kali
        })
        .catch(error => {
            console.error('Error fetching direct links:', error);
            alert('Gagal memuat iklan. Video akan diputar tanpa iklan.');
            // Jika gagal memuat iklan, langsung tampilkan video pertama yang sudah disiapkan
            adOverlay.classList.add('hidden');
            videoPlayerSection.classList.remove('hidden');
            loadVideo(selectedVideoIndex); // Putar video yang dipilih (yaitu video awal acak)
        });

    // --- Event Listener ---

    // Listener untuk tombol iklan
    adLink.addEventListener('click', (event) => {
        // Ini akan membuka iklan di tab baru.
        // Pastikan URL iklan direct link Anda valid dan dapat dibuka di tab baru.

        // Setelah iklan diklik, sembunyikan overlay iklan dan tampilkan bagian video
        adOverlay.classList.add('hidden');
        videoPlayerSection.classList.remove('hidden');
        loadVideo(selectedVideoIndex); // Putar video yang terakhir dipilih/disiapkan
    });
});
