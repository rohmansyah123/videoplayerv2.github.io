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
    let randomDirectLink = ''; // URL direct link iklan pre-roll yang akan digunakan

    let videos = []; // Array untuk menyimpan data video (judul dan URL)
    let currentVideoIndex = 0; // Indeks dari video yang sedang diputar di player
    let selectedVideoIndex = 0; // Indeks dari video yang dipilih pengguna, yang akan diputar setelah iklan

    // --- Definisi Fungsi Utama ---

    /**
     * Menggulir halaman ke bagian atas video player.
     */
    function scrollToVideoPlayer() {
        // Menggulir ke #video-player-section untuk memastikan video player terlihat
        videoPlayerSection.scrollIntoView({
            behavior: 'smooth', // Efek gulir yang halus
            block: 'start'      // Menggulir hingga elemen berada di awal viewport
        });
    }

    /**
     * Memuat dan memutar video di elemen <video>.
     * @param {number} index - Indeks video dari array 'videos'.
     * @param {boolean} autoPlay - Apakah video harus diputar otomatis setelah dimuat.
     */
    function loadVideo(index, autoPlay = false) {
        if (index >= 0 && index < videos.length) {
            myVideo.src = videos[index].src; // Setel URL video
            myVideo.load(); // Muat ulang video

            // Penting: Atur muted berdasarkan autoPlay untuk mematuhi kebijakan browser
            if (autoPlay) {
                myVideo.muted = false; // Batalkan mute jika diputar otomatis
                myVideo.play(); // Putar video
            } else {
                myVideo.muted = true; // Tetap muted jika belum diputar otomatis
                myVideo.pause(); // Jeda video
            }

            currentVideoIndex = index; // Perbarui indeks video yang sedang aktif diputar
            updateActiveVideoLink(); // Update highlight pada daftar video
        }
    }

    /**
     * Menampilkan overlay iklan direct link (pre-roll).
     * Kini hanya fokus pada tampilan overlay, karena video player selalu terlihat.
     */
    function showAdOverlay() {
        adOverlay.classList.remove('hidden'); // Tampilkan overlay iklan
        myVideo.pause(); // Jeda video yang sedang diputar di player
        myVideo.currentTime = 0; // Reset waktu video ke awal (opsional)

        adLink.style.pointerEvents = 'none'; // Membuat tombol tidak dapat diklik
        adLink.style.opacity = '0.6'; // Memberi efek visual nonaktif
        adLink.textContent = `Mohon tunggu ${adDisplayDuration / 1000} detik...`;

        // Pilih URL direct link iklan pre-roll secara acak
        if (directLinks.length > 0) {
            const randomAdIndex = Math.floor(Math.random() * directLinks.length);
            randomDirectLink = directLinks[randomAdIndex];
            console.log('Direct link iklan pre-roll yang dipilih:', randomDirectLink);
        } else {
            console.warn('Tidak ada direct link iklan pre-roll ditemukan di ads.json. Melanjutkan tanpa iklan.');
            // Jika tidak ada iklan, sembunyikan overlay dan langsung putar video
            adOverlay.classList.add('hidden');
            loadVideo(selectedVideoIndex, true); // Langsung putar video
            scrollToVideoPlayer(); // Gulir ke video player
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
                    loadVideo(selectedVideoIndex, false); // Muat video baru, tapi JANGAN putar otomatis dulu
                    showAdOverlay(); // Panggil fungsi untuk menampilkan iklan pre-roll
                    scrollToVideoPlayer(); // Gulir ke video player untuk fokus
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

        inlineParallaxAdContent.appendChild(script); // Tambahkan script ke dalam placeholder kita

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
            if (!response.ok) { throw new Error(`HTTP error! status: ${response.status}`); }
            return response.json();
        })
        .then(data => {
            videos = data; // Simpan data video
            populateVideoList(); // Isi daftar video di UI

            // Pilih indeks video secara acak untuk video utama yang akan ditampilkan pertama kali
            const randomIndex = Math.floor(Math.random() * videos.length);
            selectedVideoIndex = randomIndex; // Video ini akan dimuat ke player
            loadVideo(selectedVideoIndex, false); // Muat video tapi JANGAN putar otomatis di awal
        })
        .catch(error => {
            console.error('Error fetching videos:', error);
            alert('Gagal memuat daftar video. Silakan coba lagi nanti.');
        });

    // Mengambil daftar direct link iklan pre-roll dari 'data/ads.json'
    fetch('data/ads.json')
        .then(response => {
            if (!response.ok) { throw new Error(`HTTP error! status: ${response.status}`); }
            return response.json();
        })
        .then(data => {
            directLinks = data;
            showAdOverlay(); // Tampilkan iklan pre-roll pertama kali setelah data iklan siap
        })
        .catch(error => {
            console.error('Error fetching direct links:', error);
            alert('Gagal memuat iklan. Anda mungkin tidak dapat memutar video.');
            // Jika gagal memuat iklan, sembunyikan overlay iklan
            adOverlay.classList.add('hidden');
            // Pastikan video tetap bisa diputar jika iklan gagal total
            loadVideo(selectedVideoIndex, true); // Putar video utama jika iklan tidak ada
            scrollToVideoPlayer();
        });

    // --- Event Listener Global ---

    // Listener untuk klik pada tombol iklan direct link (pre-roll)
    adLink.addEventListener('click', (event) => {
        adOverlay.classList.add('hidden'); // Sembunyikan overlay iklan
        loadVideo(selectedVideoIndex, true); // Putar video yang terakhir dipilih/disiapkan
        scrollToVideoPlayer(); // Gulir ke video player
    });

    // --- Inisialisasi Awal ---
    // Panggil fungsi untuk menyuntikkan script iklan parallax dari penyedia saat DOM siap.
    injectParallaxProviderAd();
});
