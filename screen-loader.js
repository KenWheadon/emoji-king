// Screen Loader - Loads HTML screens and preloads images
const ScreenLoader = {
    screens: {
        loading: 'loading-screen.html',
        start: 'start-screen.html',
        game: 'game-screen.html',
        win: 'win-screen.html',
        loss: 'loss-screen.html',
        howToPlay: 'how-to-play.html'
    },

    loaded: {},
    container: null,
    imagesLoaded: 0,
    totalImages: 0,
    loadingComplete: false,
    loadingBarInterval: null,
    preloadedImages: [], // Store references to preloaded images

    async init() {
        this.container = document.getElementById('game-container');

        // Load loading screen first
        await this.loadScreen('loading', this.screens.loading);
        this.showLoadingScreen();

        // Start fake loading bar animation
        this.startFakeLoadingBar();

        // Load all other screens in background
        const loadPromise = this.loadAll();

        // Preload all images in background
        const imagePromise = loadPromise.then(success => {
            if (!success) {
                console.error('Failed to load screens - cannot continue');
                return false;
            }
            return this.preloadImages();
        });

        // Wait for minimum 2 seconds AND all loading to complete
        await Promise.all([
            new Promise(resolve => setTimeout(resolve, 2000)),
            imagePromise
        ]);

        console.log('Loading complete after minimum display time');

        // Hide loading screen after everything is ready
        this.hideLoadingScreen();

        // Mark loading as complete
        this.loadingComplete = true;
    },

    startFakeLoadingBar() {
        const progressFill = document.getElementById('progress-fill');
        const progressPercentage = document.getElementById('progress-percentage');
        const loadingStatus = document.getElementById('loading-status');

        if (!progressFill) return;

        let progress = 0;
        const duration = 2000; // 2 seconds
        const intervalTime = 50; // Update every 50ms
        const increment = (100 / duration) * intervalTime;

        // Store interval reference for cleanup
        this.loadingBarInterval = setInterval(() => {
            progress += increment;
            if (progress >= 100) {
                progress = 100;
                if (this.loadingBarInterval) {
                    clearInterval(this.loadingBarInterval);
                    this.loadingBarInterval = null;
                }
            }

            progressFill.style.width = `${progress}%`;
            if (progressPercentage) {
                progressPercentage.textContent = `${Math.floor(progress)}%`;
            }
            if (loadingStatus && progress < 100) {
                const messages = ['Loading assets...', 'Preparing game...', 'Almost ready...'];
                const messageIndex = Math.floor((progress / 100) * messages.length);
                loadingStatus.textContent = messages[Math.min(messageIndex, messages.length - 1)];
            }
        }, intervalTime);
    },

    showLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.remove('hidden');
            loadingScreen.classList.add('loading-active');
        }
    },

    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.remove('loading-active');
            // Fade out animation
            setTimeout(() => {
                loadingScreen.classList.add('hidden');
                // Clean up interval if it's still running
                if (this.loadingBarInterval) {
                    clearInterval(this.loadingBarInterval);
                    this.loadingBarInterval = null;
                }
            }, 500);
        }
    },

    updateProgress(loaded, total, status) {
        const progressFill = document.getElementById('progress-fill');
        const progressPercentage = document.getElementById('progress-percentage');
        const progressCount = document.getElementById('progress-count');
        const loadingStatus = document.getElementById('loading-status');

        if (progressFill) {
            const percent = total > 0 ? Math.round((loaded / total) * 100) : 0;
            progressFill.style.width = `${percent}%`;

            if (progressPercentage) {
                progressPercentage.textContent = `${percent}%`;
            }

            if (progressCount) {
                progressCount.textContent = `${loaded} / ${total}`;
            }

            if (loadingStatus && status) {
                loadingStatus.textContent = status;
            }
        }
    },

    async loadAll() {
        try {
            // Load screens (excluding loading screen as it's already loaded)
            const screenKeys = Object.keys(this.screens).filter(key => key !== 'loading');

            for (const key of screenKeys) {
                await this.loadScreen(key, this.screens[key]);
            }

            console.log('✅ All screens loaded successfully');
            return true;
        } catch (error) {
            console.error('❌ Error loading screens:', error);
            return false;
        }
    },

    async loadScreen(key, filename) {
        try {
            const response = await fetch(filename);
            if (!response.ok) {
                throw new Error(`Failed to load ${filename}: ${response.statusText}`);
            }

            const html = await response.text();
            this.loaded[key] = html;

            // Insert the HTML into the container
            this.container.insertAdjacentHTML('beforeend', html);

            console.log(`✓ Loaded: ${filename}`);
        } catch (error) {
            console.error(`✗ Failed to load ${filename}:`, error);
            throw error;
        }
    },

    async preloadImages() {
        // Get all icons from config
        if (typeof GAME_ICONS === 'undefined') {
            console.warn('GAME_ICONS not found, skipping image preload');
            return;
        }

        const imagePaths = GAME_ICONS.map(icon => `images/${icon.file}`);

        // Also preload game logo and company logo
        imagePaths.push('images/game-logo.png');
        imagePaths.push('images/company-logo.png');

        this.totalImages = imagePaths.length;
        this.imagesLoaded = 0;

        // Preload all images
        const promises = imagePaths.map(path => this.loadImage(path));

        try {
            await Promise.all(promises);
            console.log(`✅ All ${this.totalImages} images preloaded`);
        } catch (error) {
            console.error('❌ Error preloading images:', error);
        }
    },

    loadImage(src) {
        return new Promise((resolve) => {
            const img = new Image();

            img.onload = () => {
                this.imagesLoaded++;
                // Store reference to preloaded image
                this.preloadedImages.push(img);
                resolve(img);
            };

            img.onerror = () => {
                console.warn(`Failed to load image: ${src}`);
                this.imagesLoaded++;
                resolve(null); // Don't reject, just continue
            };

            img.src = src;
        });
    },

    // Helper to check if all screens are loaded
    isReady() {
        const requiredScreens = Object.keys(this.screens).filter(key => key !== 'loading');
        return requiredScreens.every(key => this.loaded[key]);
    }
};

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ScreenLoader.init());
} else {
    ScreenLoader.init();
}
