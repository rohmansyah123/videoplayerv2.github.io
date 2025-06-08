document.addEventListener('DOMContentLoaded', () => {
    // Ambil referensi ke elemen-elemen DOM yang diperlukan
    const adOverlay = document.getElementById('ad-overlay');
    const adLink = document.getElementById('ad-link');
    const videoPlayerSection = document.getElementById('video-player-section');
    const myVideo = document.getElementById('myVideo');
    const videoList = document.getElementById('video-list');
    const inlineParallaxAdContent = document.getElementById('inline-parallax-ad-content');

    const adDisplayDuration = 3000; // Durasi tunggu iklan pre-roll dalam milidetik (3 detik)

    let directLinks = []; // Array untuk menyimpan URL direct link iklan pre-roll
    let randomDirectLink = ''; // Link iklan pre-roll yang akan digunakan

    let videos = []; // Array untuk menyimpan data video (judul dan URL)
    let currentVideoIndex = 0; // Indeks dari video yang sedang diputar di player
    let selectedVideoIndex = 0; // Indeks dari video yang dipilih pengguna, yang akan diputar setelah iklan

    // --- NEW: Variabel untuk melacak klik pertama ---
    let isFirstClickHandled = false;
    // URL direct link khusus untuk klik pertama di halaman (bisa sama dengan directLinks, atau berbeda)
    const firstClickRedirectUrl = "https://your-special-first-click-ad-link.com"; // GANTI DENGAN URL ANDA!

    // --- Definisi Fungsi Utama ---

    /**
     * Menggulir halaman ke bagian atas video player.
     */
    function scrollToVideoPlayer() {
        videoPlayerSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }

    /**
     * Memuat dan memutar video di elemen <video>.
     * @param {number} index - Indeks video dari array 'videos'.
     * @param {boolean} autoPlay - Apakah video harus diputar otomatis setelah dimuat.
     */
    function loadVideo(index, autoPlay = false) {
        if (index >= 0 && index < videos.length) {
            myVideo.src = videos[index].src;
            myVideo.load();

            if (autoPlay) {
                myVideo.muted = false;
                myVideo.play();
            } else {
                myVideo.muted = true;
                myVideo.pause();
            }

            currentVideoIndex = index;
            updateActiveVideoLink();
        }
    }

    /**
     * Menampilkan overlay iklan direct link (pre-roll).
     */
    function showAdOverlay() {
        adOverlay.classList.remove('hidden');
        myVideo.pause();
        myVideo.currentTime = 0;

        adLink.style.pointerEvents = 'none';
        adLink.style.opacity = '0.6';
        adLink.textContent = `Mohon tunggu ${adDisplayDuration / 1000} detik...`;

        if (directLinks.length > 0) {
            const randomAdIndex = Math.floor(Math.random() * directLinks.length);
            randomDirectLink = directLinks[randomAdIndex];
            console.log('Direct link iklan pre-roll yang dipilih:', randomDirectLink);
        } else {
            console.warn('Tidak ada direct link iklan pre-roll ditemukan di ads.json. Melanjutkan tanpa iklan.');
            adOverlay.classList.add('hidden');
            loadVideo(selectedVideoIndex, true);
            scrollToVideoPlayer();
            return;
        }

        setTimeout(() => {
            adLink.style.pointerEvents = 'auto';
            adLink.style.opacity = '1';
            adLink.textContent = "Klik untuk Lanjutkan ke Video";
            adLink.href = randomDirectLink;
        }, adDisplayDuration);
    }

    /**
     * Memperbarui kelas 'active-video' pada daftar video.
     */
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

    /**
     * Mengisi daftar video di HTML.
     */
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
                if (index !== currentVideoIndex) {
                    selectedVideoIndex = index;
                    loadVideo(selectedVideoIndex, false);
                    showAdOverlay();
                    scrollToVideoPlayer();
                }
            });
            listItem.appendChild(link);
            videoList.appendChild(listItem);
        });
    }

    /**
     * Menyuntikkan script iklan parallax dari penyedia.
     */
    function injectParallaxProviderAd() {
        const providerAdTargetId = 'container-2c979ea6eea470e28aecac661089d1a9';
        const providerScriptSrc = "//pl26583030.profitableratecpm.com/2c979ea6eea470e28aecac661089d1a9/invoke.js";

        const existingScript = document.getElementById('profitablerate-ad-script');
        if (existingScript) {
            existingScript.remove();
        }

        const script = document.createElement('script');
        script.id = 'profitablerate-ad-script';
        script.async = true;
        script.dataset.cfasync = false;
        script.src = providerScriptSrc;

        inlineParallaxAdContent.appendChild(script);

        const adContainerDiv = document.getElementById(providerAdTargetId);
        if (adContainerDiv) {
            adContainerDiv.innerHTML = '';
        }
    }

    // --- Pengambilan Data Asinkron dari File JSON ---

    fetch('data/videos.json')
        .then(response => {
            if (!response.ok) { throw new Error(`HTTP error! status: ${response.status}`); }
            return response.json();
        })
        .then(data => {
            videos = data;
            populateVideoList();

            const randomIndex = Math.floor(Math.random() * videos.length);
            selectedVideoIndex = randomIndex;
            loadVideo(selectedVideoIndex, false);
        })
        .catch(error => {
            console.error('Error fetching videos:', error);
            alert('Gagal memuat daftar video. Silakan coba lagi nanti.');
        });

    fetch('data/ads.json')
        .then(response => {
            if (!response.ok) { throw new Error(`HTTP error! status: ${response.status}`); }
            return response.json();
        })
        .then(data => {
            directLinks = data;
            showAdOverlay();
        })
        .catch(error => {
            console.error('Error fetching direct links:', error);
            alert('Gagal memuat iklan. Anda mungkin tidak dapat memutar video.');
            adOverlay.classList.add('hidden');
            loadVideo(selectedVideoIndex, true);
            scrollToVideoPlayer();
        });

    // --- Event Listener Global ---

    // Listener untuk klik pada tombol iklan direct link (pre-roll)
    adLink.addEventListener('click', (event) => {
        adOverlay.classList.add('hidden');
        loadVideo(selectedVideoIndex, true);
        scrollToVideoPlayer();
    });

    // --- NEW: Fungsi Penanganan Klik Pertama ---
    function handleFirstClick(event) {
        if (!isFirstClickHandled) {
            isFirstClickHandled = true; // Set flag
            // Buka link direct di tab/jendela baru
            window.open(firstClickRedirectUrl, '_blank');

            // Hapus event listener ini agar hanya terpicu sekali
            document.removeEventListener('click', handleFirstClick);
            document.removeEventListener('scroll', handleFirstClick); // Juga untuk scroll jika Anda ingin itu memicu
            document.removeEventListener('touchstart', handleFirstClick); // Untuk mobile
        }
    }

    // --- Inisialisasi Awal ---
    injectParallaxProviderAd();

    // --- NEW: Tambahkan event listener untuk klik pertama pada dokumen ---
    // Gunakan 'click', 'scroll', atau 'touchstart' untuk memastikan terpicu di berbagai situasi
    document.addEventListener('click', handleFirstClick);
    document.addEventListener('scroll', handleFirstClick); // Opsional: picu pada scroll
    document.addEventListener('touchstart', handleFirstClick); // Opsional: picu pada sentuhan (mobile)
});
