document.addEventListener('DOMContentLoaded', () => {
    // Ambil referensi ke elemen-elemen DOM yang diperlukan
    const adOverlay = document.getElementById('ad-overlay');
    const adLink = document.getElementById('ad-link');
    const videoPlayerSection = document.getElementById('video-player-section');
    const myVideo = document.getElementById('myVideo');
    const videoList = document.getElementById('video-list');
    const inlineParallaxAdContent = document.getElementById('inline-parallax-ad-content'); // Placeholder untuk iklan parallax inline

    const adDisplayDuration = 3000; // Durasi tunggu iklan pre-roll dalam milidetik (3 detik)

    let directLinks = []; // Array untuk menyimpan URL direct link iklan pre-roll
    let randomDirectLink = ''; // URL direct link iklan pre-roll yang akan digunakan saat ini

    let videos = []; // Array untuk menyimpan data video (judul dan URL)
    let currentVideoIndex = 0; // Indeks dari video yang sedang diputar di player
    let selectedVideoIndex = 0; // Indeks dari video yang dipilih pengguna, yang akan diputar setelah iklan

    // --- Definisi Fungsi Utama ---

    /**
     * Memuat dan memutar video di elemen <video>.
     * @param {number} index - Indeks video dari array 'videos'.
     */
    function loadVideo(index) {
        if (index >= 0 && index < videos.length) {
            myVideo.src = videos[index].src; // Setel URL video
            myVideo.load(); // Muat ulang video
            myVideo.play(); // Putar video secara otomatis
            myVideo.muted = false; // Batalkan mute agar suara terdengar
            currentVideoIndex = index; // Perbarui indeks video yang sedang aktif diputar
            updateActiveVideoLink(); // Update highlight pada daftar video
        }
    }

    /**
     * Menampilkan overlay iklan direct link (pre-roll) dan menyiapkan tombol direct link.
     */
    function showAdOverlay() {
        adOverlay.classList.remove('hidden'); // Tampilkan overlay iklan
        videoPlayerSection.classList.add('hidden'); // Sembunyikan bagian player & daftar video
        myVideo.pause(); // Jeda video yang sedang diputar
        myVideo.currentTime = 0; // Reset waktu video ke awal (opsional, bisa dihapus)

        // Nonaktifkan tombol iklan sementara dan tampilkan hitungan mundur
        adLink.style.pointerEvents = 'none';
        adLink.style.opacity = '0.6';
        adLink.textContent = `Mohon tunggu ${adDisplayDuration / 1000} detik...`;

        // Pilih URL direct link iklan pre-roll secara acak dari array 'directLinks'
        if (directLinks.length > 0) {
            const randomAdIndex = Math.floor(Math.random() * directLinks.length);
            randomDirectLink = directLinks[randomAdIndex];
            console.log('Direct link iklan pre-roll yang dipilih:', randomDirectLink);
        } else {
            console.warn('Tidak ada direct link iklan pre-roll ditemukan di ads.json. Melanjutkan tanpa iklan.');
            // Jika tidak ada iklan yang tersedia, langsung lanjutkan ke video tanpa menampilkan overlay iklan
            adOverlay.classList.add('hidden');
            videoPlayerSection.classList.remove('hidden');
            loadVideo(selectedVideoIndex); // Putar video yang sudah dipilih
            return; // Hentikan eksekusi fungsi
        }

        // Aktifkan tombol iklan setelah durasi tunggu yang ditentukan
        setTimeout(() => {
            adLink.style.pointerEvents = 'auto'; // Aktifkan klik tombol
            adLink.style.opacity = '1'; // Kembalikan opacity
            adLink.textContent = "Klik untuk Lanjutkan ke Video"; // Ubah teks tombol
            adLink.href = randomDirectLink; // Setel URL direct link acak pada tombol
        }, adDisplayDuration);
    }

    /**
     * Memperbarui kelas 'active-video' pada daftar video untuk menyorot video yang sedang diputar.
     */
    function updateActiveVideoLink() {
        const links = videoList.querySelectorAll('a');
        links.forEach((link, idx) => {
            if (idx === currentVideoIndex) {
                link.classList.add('active-video'); // Tambahkan kelas 'active-video'
            } else {
                link.classList.remove('active-video'); // Hapus kelas 'active-video'
            }
        });
    }

    /**
     * Mengisi daftar video di HTML dari data yang diambil dari `videos.json`.
     */
    function populateVideoList() {
        videoList.innerHTML = ''; // Kosongkan daftar video yang mungkin sudah ada
        videos.forEach((video, index) => {
            const listItem = document.createElement('li');
            const link = document.createElement('a');
            link.href = "#"; // Mencegah navigasi halaman saat diklik
            link.textContent = video.title; // Setel teks link dengan judul video
            link.dataset.index = index; // Simpan indeks video sebagai atribut data

            // Tambahkan event listener untuk setiap link video
            link.addEventListener('click', (e) => {
                e.preventDefault(); // Mencegah tindakan default link
                // Jika video yang dipilih berbeda dari yang sedang diputar, tampilkan iklan lagi
                if (index !== currentVideoIndex) {
                    selectedVideoIndex = index; // Simpan indeks video yang dipilih pengguna
                    showAdOverlay(); // Panggil fungsi untuk menampilkan iklan pre-roll
                }
            });
            listItem.appendChild(link);
            videoList.appendChild(listItem);
        });
    }

    /**
     * Menyuntikkan script iklan parallax dari penyedia iklan ke dalam placeholder HTML.
     */
    function injectParallaxProviderAd() {
        // ID div target dari penyedia iklan (pastikan ini ada di index.html)
        const providerAdTargetId = 'container-2c979ea6eea470e28aecac661089d1a9';
        const providerScriptSrc = "//pl26583030.profitableratecpm.com/2c979ea6eea470e28aecac661089d1a9/invoke.js";

        // Hapus script yang mungkin sudah ada untuk mencegah duplikasi atau masalah loading
        const existingScript = document.getElementById('profitablerate-ad-script');
        if (existingScript) {
            existingScript.remove();
        }

        // Buat elemen script baru secara dinamis
        const script = document.createElement('script');
        script.id = 'profitablerate-ad-script'; // Beri ID unik agar mudah dihapus/dicek
        script.async = true; // Muat script secara asynchronous
        script.dataset.cfasync = false; // Atribut data-cfasync
        script.src = providerScriptSrc; // Setel URL sumber script

        // Masukkan script ke dalam placeholder iklan parallax inline
        inlineParallaxAdContent.appendChild(script);

        // Opsional: Kosongkan div target iklan penyedia jika ada konten lama
        const adContainerDiv = document.getElementById(providerAdTargetId);
        if (adContainerDiv) {
            adContainerDiv.innerHTML = '';
        }
    }

    // --- Pengambilan Data Asinkron dari File JSON ---

    // Mengambil daftar video dari 'data/videos.json'
    fetch('data/videos.json')
        .then(response => {
            // Periksa apakah respons HTTP berhasil
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json(); // Parse respons sebagai JSON
        })
        .then(data => {
            videos = data; // Simpan data video yang diambil
            populateVideoList(); // Isi daftar video di UI

            // Pilih indeks video secara acak untuk video utama yang akan diputar pertama kali
            const randomIndex = Math.floor(Math.random() * videos.length);
            selectedVideoIndex = randomIndex; // Setel video awal yang akan diputar setelah iklan pre-roll pertama
        })
        .catch(error => {
            console.error('Error fetching videos:', error);
            alert('Gagal memuat daftar video. Silakan coba lagi nanti.');
            // Anda bisa menambahkan UI fallback jika gagal memuat video
        });

    // Mengambil daftar direct link iklan pre-roll dari 'data/ads.json'
    fetch('data/ads.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            directLinks = data; // Simpan data direct link iklan
            showAdOverlay(); // Tampilkan iklan pre-roll pertama kali setelah data iklan siap
        })
        .catch(error => {
            console.error('Error fetching direct links:', error);
            alert('Gagal memuat iklan. Video akan diputar tanpa iklan.');
            // Jika gagal memuat iklan, sembunyikan overlay iklan dan langsung tampilkan video
            adOverlay.classList.add('hidden');
            videoPlayerSection.classList.remove('hidden');
            loadVideo(selectedVideoIndex); // Putar video yang sudah dipilih
        });

    // --- Event Listener Global ---

    // Listener untuk klik pada tombol iklan direct link (pre-roll)
    adLink.addEventListener('click', (event) => {
        // Mengklik tombol ini akan membuka iklan di tab/jendela baru.
        // Perilaku ini normal untuk direct link iklan.

        // Setelah iklan diklik, sembunyikan overlay iklan dan tampilkan bagian video
        adOverlay.classList.add('hidden');
        videoPlayerSection.classList.remove('hidden');
        loadVideo(selectedVideoIndex); // Putar video yang terakhir dipilih/disiapkan
    });

    // --- Inisialisasi Awal ---

    // Panggil fungsi untuk menyuntikkan script iklan parallax dari penyedia saat DOM siap.
    // Iklan ini akan dimuat dan disiapkan di latar belakang, siap tampil ketika video-player-section terlihat.
    injectParallaxProviderAd();
});
               
