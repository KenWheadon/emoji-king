// Screen Loader - Loads HTML screens and preloads images
const ScreenLoader = {
    screens: {
        loading: 'loading-screen.html',
        start: 'start-screen.html',
        game: 'game-screen.html',
        win: 'win-screen.html',
        howToPlay: 'how-to-play.html'
    },

    loaded: {},
    container: null,
    imagesLoaded: 0,
    totalImages: 0,

    async init() {
        this.container = document.getElementById('game-container');

        // Load loading screen first
        await this.loadScreen('loading', this.screens.loading);
        this.showLoadingScreen();

        // Load all other screens
        const success = await this.loadAll();
        if (!success) {
            console.error('Failed to load screens - cannot continue');
            this.updateProgress(0, 1, 'Error loading screens!');
            return; // Stop initialization
        }

        // Preload all images
        await this.preloadImages();

        // Hide loading screen after everything is ready
        this.hideLoadingScreen();
    },

    showLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.remove('hidden');
        }
    },

    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            // Fade out animation
            setTimeout(() => {
                loadingScreen.classList.add('hidden');
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

            // Use dynamic count instead of hardcoded 4
            this.updateProgress(0, screenKeys.length, 'Loading screens...');

            let loadedCount = 0;

            for (const key of screenKeys) {
                await this.loadScreen(key, this.screens[key]);
                loadedCount++;
                this.updateProgress(loadedCount, screenKeys.length, `Loading ${key} screen...`);
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

        // Also preload game logo
        imagePaths.push('images/game-logo.png');

        this.totalImages = imagePaths.length;
        this.imagesLoaded = 0;

        this.updateProgress(0, this.totalImages, 'Loading icons...');

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
        return new Promise((resolve, reject) => {
            const img = new Image();

            img.onload = () => {
                this.imagesLoaded++;
                this.updateProgress(
                    this.imagesLoaded,
                    this.totalImages,
                    `Loading icons... (${this.imagesLoaded}/${this.totalImages})`
                );
                resolve(img);
            };

            img.onerror = () => {
                console.warn(`Failed to load image: ${src}`);
                this.imagesLoaded++;
                this.updateProgress(
                    this.imagesLoaded,
                    this.totalImages,
                    `Loading icons... (${this.imagesLoaded}/${this.totalImages})`
                );
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
