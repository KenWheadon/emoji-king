// Load config from game-config.js
const allIcons = GAME_ICONS;
const postTemplates = GAME_MESSAGES;

// Game State
const gameState = {
    score: 0,
    streak: 0,
    bestStreak: 0,
    postsSeen: 0,
    perfectIcons: 0,    // +5 points
    correctIcons: 0,    // +2 points
    neutralIcons: 0,    // 0 points
    wrongIcons: 0,      // -3 points
    horribleIcons: 0,   // -6 points
    timeoutIcons: 0,    // -2 points (timeout)
    isPlaying: false,
    currentPost: null,
    currentIconChoices: [],
    postStartTime: 0,
    gameStartTime: 0,
    gameDuration: 0,
    timerInterval: null,
    postTimerInterval: null,
    postTimeRemaining: 0
};

// DOM Elements - initialized after screens load
const elements = {};

// Screen Management
function showScreen(screen) {
    if (!screen) {
        console.error('Cannot show null screen');
        return;
    }

    // Hide all screens
    if (elements.startScreen) elements.startScreen.classList.add('hidden');
    if (elements.gameScreen) elements.gameScreen.classList.add('hidden');
    if (elements.winScreen) elements.winScreen.classList.add('hidden');

    // Show requested screen
    screen.classList.remove('hidden');
}

function showModal() {
    elements.howToPlayModal.classList.remove('hidden');
}

function hideModal() {
    elements.howToPlayModal.classList.add('hidden');
}

// Timer Functions
function startTimer() {
    gameState.gameStartTime = Date.now();
    gameState.timerInterval = setInterval(updateTimer, 1000);
}

function stopTimer() {
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
        gameState.timerInterval = null;
    }
    gameState.gameDuration = Date.now() - gameState.gameStartTime;
}

function updateTimer() {
    const elapsed = Math.floor((Date.now() - gameState.gameStartTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    elements.timer.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function formatTime(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// Post Timer Functions
function startPostTimer() {
    stopPostTimer(); // Clear any existing timer

    gameState.postTimeRemaining = GAME_SCORING.postTimeLimit;
    elements.postTimer.classList.remove('hidden');
    updatePostTimerUI();

    gameState.postTimerInterval = setInterval(() => {
        gameState.postTimeRemaining -= 100; // Update every 100ms

        if (gameState.postTimeRemaining <= 0) {
            handlePostTimeout();
        } else {
            updatePostTimerUI();
        }
    }, 100);
}

function stopPostTimer() {
    if (gameState.postTimerInterval) {
        clearInterval(gameState.postTimerInterval);
        gameState.postTimerInterval = null;
    }
    if (elements.postTimer) {
        elements.postTimer.classList.add('hidden');
    }
}

function updatePostTimerUI() {
    if (!elements.postTimerFill || !elements.postTimerText) return;

    const percentage = (gameState.postTimeRemaining / GAME_SCORING.postTimeLimit) * 100;
    const seconds = (gameState.postTimeRemaining / 1000).toFixed(1);

    elements.postTimerFill.style.width = percentage + '%';
    elements.postTimerText.textContent = seconds + 's';

    // Update styling based on time remaining
    if (percentage <= 20) {
        elements.postTimerFill.classList.add('critical');
        elements.postTimerFill.classList.remove('warning');
        elements.postTimerText.classList.add('critical');
        elements.postTimerText.classList.remove('warning');
    } else if (percentage <= 40) {
        elements.postTimerFill.classList.add('warning');
        elements.postTimerFill.classList.remove('critical');
        elements.postTimerText.classList.add('warning');
        elements.postTimerText.classList.remove('critical');
    } else {
        elements.postTimerFill.classList.remove('warning', 'critical');
        elements.postTimerText.classList.remove('warning', 'critical');
    }
}

function handlePostTimeout() {
    stopPostTimer();

    if (!gameState.isPlaying || !gameState.currentPost) return;

    const post = gameState.currentPost;

    // Apply timeout penalty
    gameState.score += GAME_SCORING.timeoutPenalty;
    gameState.timeoutIcons++;
    gameState.streak = 0; // Break streak on timeout

    // Add timeout class to post for shake animation
    post.element.classList.add('timeout');

    // Show feedback
    showFeedback(`Time's Up! ${GAME_SCORING.timeoutPenalty}`, false);

    // Trigger screen shake
    triggerScreenShake();

    updateUI();

    // Check if score went too negative (game over)
    // For now, just continue to next post
    setTimeout(() => {
        showNextPost();
    }, 800);
}

// Utility Functions
function getRandomPost() {
    return postTemplates[Math.floor(Math.random() * postTemplates.length)];
}

function getIconById(id) {
    return allIcons.find(icon => icon.id === id);
}

function getRandomIcons(count, exclude = []) {
    const available = allIcons.filter(icon => !exclude.includes(icon.id));
    const shuffled = [...available].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
}

function updateUI() {
    elements.score.textContent = gameState.score;
    elements.streak.textContent = gameState.streak;

    const multiplier = getMultiplier();
    if (multiplier > 1) {
        elements.multiplier.classList.remove('hidden');
        elements.multiplierValue.textContent = multiplier;
    } else {
        elements.multiplier.classList.add('hidden');
    }
}

function getMultiplier() {
    if (gameState.streak >= 10) return GAME_SCORING.streak10Multiplier;
    if (gameState.streak >= 5) return GAME_SCORING.streak5Multiplier;
    return 1;
}

function getTimeBonus() {
    const elapsed = Date.now() - gameState.postStartTime;
    if (elapsed < 1000) return GAME_SCORING.fastBonus;
    if (elapsed < 2000) return GAME_SCORING.quickBonus;
    return 0;
}

function showFeedback(text, isPositive) {
    elements.feedback.textContent = text;
    elements.feedback.className = 'feedback';
    if (isPositive) {
        elements.feedback.classList.add('positive');
    } else {
        elements.feedback.classList.add('negative');
    }

    setTimeout(() => {
        elements.feedback.classList.add('hidden');
    }, 1000);
}

function triggerScreenShake() {
    const container = document.getElementById('game-container');
    container.classList.add('shake');

    setTimeout(() => {
        container.classList.remove('shake');
    }, 500);
}

function createParticleEffect(x, y, count = 15) {
    const container = document.getElementById('game-container');
    const particles = ['✨', '⭐', '💫', '✦', '+'];

    for (let i = 0; i < count; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';

        // Random particle type
        const particleType = particles[Math.floor(Math.random() * particles.length)];
        particle.textContent = particleType;

        // Add class based on particle type
        if (particleType === '⭐' || particleType === '💫') {
            particle.classList.add('star');
        } else if (particleType === '✨' || particleType === '✦') {
            particle.classList.add('sparkle');
        } else {
            particle.classList.add('plus');
        }

        // Random position around the click point
        const angle = (Math.PI * 2 * i) / count;
        const distance = 50 + Math.random() * 100;
        const tx = Math.cos(angle) * distance;
        const ty = Math.sin(angle) * distance - Math.random() * 50; // Slight upward bias

        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        particle.style.setProperty('--tx', tx + 'px');
        particle.style.setProperty('--ty', ty + 'px');

        container.appendChild(particle);

        // Remove particle after animation
        setTimeout(() => {
            particle.remove();
        }, 1000);
    }
}

// Post Creation
function createPost(postData) {
    const post = document.createElement('div');
    post.className = 'post active';

    const text = document.createElement('div');
    text.className = 'post-text';
    text.textContent = postData.text;

    post.appendChild(text);
    elements.feed.appendChild(post);

    // Remove active class from previous posts
    const posts = elements.feed.querySelectorAll('.post');
    posts.forEach((p) => {
        if (p !== post) {
            p.classList.remove('active');
        }
    });

    // Scroll to bottom to show the new post
    const feedContainer = document.getElementById('feed-container');
    if (feedContainer) {
        feedContainer.scrollTop = feedContainer.scrollHeight;
    }

    return post;
}

function updateReactionBar(iconChoices) {
    elements.reactionBar.innerHTML = '';

    iconChoices.forEach((icon, index) => {
        const btn = document.createElement('button');
        btn.className = 'emoji-btn';
        btn.dataset.iconId = icon.id;
        btn.dataset.key = (index + 1).toString();

        const img = document.createElement('img');
        img.src = `images/${icon.file}`;
        img.alt = icon.name;
        img.className = 'emoji-img';

        const hint = document.createElement('span');
        hint.className = 'key-hint';
        hint.textContent = index + 1;

        btn.appendChild(img);
        btn.appendChild(hint);

        btn.addEventListener('click', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = rect.left + rect.width / 2;
            const y = rect.top + rect.height / 2;
            handleReaction(icon.id, x, y);
        });

        elements.reactionBar.appendChild(btn);
    });
}

function showNextPost() {
    const postData = getRandomPost();

    // Create icon choices: mix of all 5 categories
    // Typically include 1-2 perfect/correct, and a mix of neutral/wrong/horrible
    const perfectCount = Math.random() > 0.7 ? 1 : 0; // 30% chance for 1 perfect
    const perfectIcons = (postData.perfectIcons || [])
        .sort(() => Math.random() - 0.5)
        .slice(0, perfectCount)
        .map(id => getIconById(id))
        .filter(icon => icon);

    const correctCount = Math.random() > 0.5 ? 1 : 2;
    const correctIcons = (postData.correctIcons || [])
        .sort(() => Math.random() - 0.5)
        .slice(0, correctCount)
        .map(id => getIconById(id))
        .filter(icon => icon);

    const neutralCount = Math.floor(Math.random() * 2); // 0-1 neutral
    const neutralIcons = (postData.neutralIcons || [])
        .sort(() => Math.random() - 0.5)
        .slice(0, neutralCount)
        .map(id => getIconById(id))
        .filter(icon => icon);

    const remainingSlots = 6 - perfectCount - correctCount - neutralCount;
    const wrongCount = Math.floor(remainingSlots / 2);
    const horribleCount = remainingSlots - wrongCount;

    const wrongIcons = (postData.wrongIcons || [])
        .sort(() => Math.random() - 0.5)
        .slice(0, wrongCount)
        .map(id => getIconById(id))
        .filter(icon => icon);

    const horribleIcons = (postData.horribleIcons || [])
        .sort(() => Math.random() - 0.5)
        .slice(0, horribleCount)
        .map(id => getIconById(id))
        .filter(icon => icon);

    let iconChoices = [...perfectIcons, ...correctIcons, ...neutralIcons, ...wrongIcons, ...horribleIcons];

    // If we don't have 6 yet, fill with random
    if (iconChoices.length < 6) {
        const existingIds = iconChoices.map(i => i.id);
        const additionalIcons = getRandomIcons(6 - iconChoices.length, existingIds);
        iconChoices = [...iconChoices, ...additionalIcons];
    }

    // Shuffle
    iconChoices = iconChoices.sort(() => Math.random() - 0.5);

    gameState.currentPost = {
        data: postData,
        element: createPost(postData)
    };
    gameState.currentIconChoices = iconChoices;
    gameState.postStartTime = Date.now();
    gameState.postsSeen++;

    updateReactionBar(iconChoices);

    // Start the countdown timer for this post
    startPostTimer();
}

// Reaction Handling
function handleReaction(iconId, x, y) {
    if (!gameState.isPlaying || !gameState.currentPost) return;

    // Stop the post timer since player responded
    stopPostTimer();

    const post = gameState.currentPost;
    const postData = post.data;

    // Determine score and track icon category
    let score = 0;
    let categoryName = '';

    if (postData.perfectIcons && postData.perfectIcons.includes(iconId)) {
        score = GAME_SCORING.perfectPoints;
        gameState.perfectIcons++;
        categoryName = 'perfect';
    } else if (postData.correctIcons && postData.correctIcons.includes(iconId)) {
        score = GAME_SCORING.correctPoints;
        gameState.correctIcons++;
        categoryName = 'correct';
    } else if (postData.neutralIcons && postData.neutralIcons.includes(iconId)) {
        score = GAME_SCORING.neutralPoints;
        gameState.neutralIcons++;
        categoryName = 'neutral';
    } else if (postData.wrongIcons && postData.wrongIcons.includes(iconId)) {
        score = GAME_SCORING.wrongPoints;
        gameState.wrongIcons++;
        categoryName = 'wrong';
    } else if (postData.horribleIcons && postData.horribleIcons.includes(iconId)) {
        score = GAME_SCORING.horriblePoints;
        gameState.horribleIcons++;
        categoryName = 'horrible';
    } else {
        // Fallback for icons not in any category
        score = GAME_SCORING.wrongPoints;
        gameState.wrongIcons++;
        categoryName = 'wrong';
    }

    const timeBonus = getTimeBonus();
    const multiplier = getMultiplier();

    let totalPoints = score;
    if (score > 0) {
        totalPoints = (score + timeBonus) * multiplier;
    }

    gameState.score += totalPoints;

    // Update streak - any positive score counts for streak
    if (score > 0) {
        gameState.streak++;
        if (gameState.streak > gameState.bestStreak) {
            gameState.bestStreak = gameState.streak;
        }
    } else {
        gameState.streak = 0;
    }

    // Visual feedback - show icon image
    const reactionSpan = document.createElement('span');
    reactionSpan.className = 'post-reaction';

    const icon = getIconById(iconId);
    if (icon) {
        const img = document.createElement('img');
        img.src = `images/${icon.file}`;
        img.alt = icon.name;
        reactionSpan.appendChild(img);
    }

    post.element.appendChild(reactionSpan);

    // Show feedback based on category with visual effects
    if (categoryName === 'perfect') {
        post.element.classList.add('correct');
        let feedbackText = `Perfect! +${totalPoints}`;
        if (timeBonus > 0) feedbackText += ` ⚡`;
        if (multiplier > 1) feedbackText += ` ×${multiplier}`;
        showFeedback(feedbackText, true);
        // Trigger particle effect for perfect
        if (x !== undefined && y !== undefined) {
            createParticleEffect(x, y, 20);
        }
    } else if (categoryName === 'correct') {
        post.element.classList.add('correct');
        let feedbackText = `Nice! +${totalPoints}`;
        if (timeBonus > 0) feedbackText += ` ⚡`;
        if (multiplier > 1) feedbackText += ` ×${multiplier}`;
        showFeedback(feedbackText, true);
        // Trigger particle effect for correct
        if (x !== undefined && y !== undefined) {
            createParticleEffect(x, y, 12);
        }
    } else if (categoryName === 'neutral') {
        showFeedback('Not quite', false);
    } else if (categoryName === 'wrong') {
        post.element.classList.add('incorrect');
        showFeedback(`Bad ${totalPoints}`, false);
        // Trigger screen shake for wrong
        triggerScreenShake();
    } else if (categoryName === 'horrible') {
        post.element.classList.add('incorrect');
        showFeedback(`Terrible ${totalPoints}`, false);
        // Trigger stronger screen shake for horrible
        triggerScreenShake();
    }

    updateUI();

    // Check win condition
    if (gameState.score >= GAME_SCORING.targetScore) {
        endGame(true);
        return;
    }

    // Show next post
    setTimeout(() => {
        showNextPost();
    }, 600);
}

// Game Flow
function startGame() {
    // Stop any existing timers first
    if (gameState.timerInterval) {
        stopTimer();
    }
    stopPostTimer();

    // Reset game state
    gameState.score = 0;
    gameState.streak = 0;
    gameState.bestStreak = 0;
    gameState.postsSeen = 0;
    gameState.perfectIcons = 0;
    gameState.correctIcons = 0;
    gameState.neutralIcons = 0;
    gameState.wrongIcons = 0;
    gameState.horribleIcons = 0;
    gameState.timeoutIcons = 0;
    gameState.isPlaying = true;
    gameState.currentPost = null;

    // Clear feed
    elements.feed.innerHTML = '';

    // Show game screen
    showScreen(elements.gameScreen);

    // Start timer
    startTimer();

    // Update UI
    updateUI();

    // Show first post
    showNextPost();
}

function endGame(won) {
    gameState.isPlaying = false;
    stopTimer();
    stopPostTimer();

    // Update win screen
    elements.finalScore.textContent = gameState.score;
    elements.finalTime.textContent = formatTime(gameState.gameDuration);
    elements.postsSeen.textContent = gameState.postsSeen;
    elements.bestStreak.textContent = gameState.bestStreak;

    // Display icon category statistics
    if (elements.perfectIconsDisplay) {
        elements.perfectIconsDisplay.textContent = gameState.perfectIcons;
    }
    if (elements.correctIconsDisplay) {
        elements.correctIconsDisplay.textContent = gameState.correctIcons;
    }
    if (elements.neutralIconsDisplay) {
        elements.neutralIconsDisplay.textContent = gameState.neutralIcons;
    }
    if (elements.wrongIconsDisplay) {
        elements.wrongIconsDisplay.textContent = gameState.wrongIcons;
    }
    if (elements.horribleIconsDisplay) {
        elements.horribleIconsDisplay.textContent = gameState.horribleIcons;
    }

    // Update title and message based on performance
    if (won) {
        if (gameState.bestStreak >= 15) {
            elements.winTitle.textContent = '🔥 LEGENDARY!';
            elements.winMessage.textContent = 'You are an icon master!';
        } else if (gameState.bestStreak >= 10) {
            elements.winTitle.textContent = '⭐ SUPERSTAR!';
            elements.winMessage.textContent = 'Amazing icon matching skills!';
        } else {
            elements.winTitle.textContent = '🏆 WINNER!';
            elements.winMessage.textContent = 'You reached the target score!';
        }
    }

    // Show win screen
    showScreen(elements.winScreen);
}

function backToMenu() {
    // Stop timers if running
    if (gameState.timerInterval) {
        stopTimer();
    }
    stopPostTimer();

    // Reset game state
    gameState.isPlaying = false;

    // Show start screen
    showScreen(elements.startScreen);
}

// Input Handling
function setupControls() {
    // Start button
    elements.startBtn.addEventListener('click', startGame);

    // How to play button
    elements.howToPlayBtn.addEventListener('click', showModal);

    // Modal close buttons
    elements.closeModal.addEventListener('click', hideModal);
    elements.closeModalBtn.addEventListener('click', hideModal);

    // Modal backdrop click - safely attach listener
    const modalBackdrop = elements.howToPlayModal?.querySelector('.modal-backdrop');
    if (modalBackdrop) {
        modalBackdrop.addEventListener('click', hideModal);
    }

    // Win screen buttons
    elements.playAgainBtn.addEventListener('click', startGame);
    elements.backToMenuBtn.addEventListener('click', backToMenu);

    // Keyboard controls for game
    document.addEventListener('keydown', (e) => {
        if (!gameState.isPlaying) return;

        const key = e.key;
        if (key >= '1' && key <= '6') {
            const index = parseInt(key) - 1;
            if (gameState.currentIconChoices[index]) {
                // Use center of screen for keyboard input
                const centerX = window.innerWidth / 2;
                const centerY = window.innerHeight / 2;
                handleReaction(gameState.currentIconChoices[index].id, centerX, centerY);
            }
        }
    });
}

// Initialize
async function init() {
    // Wait for screens to load
    let retries = 0;
    const maxRetries = 50; // 5 seconds max wait

    while (!ScreenLoader.isReady() && retries < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 100));
        retries++;
    }

    if (!ScreenLoader.isReady()) {
        console.error('Failed to load all screens in time');
        return;
    }

    // Re-get elements after screens are loaded
    elements.startScreen = document.getElementById('start-screen');
    elements.gameScreen = document.getElementById('game-screen');
    elements.winScreen = document.getElementById('win-screen');
    elements.howToPlayModal = document.getElementById('how-to-play-modal');
    elements.startBtn = document.getElementById('start-btn');
    elements.howToPlayBtn = document.getElementById('how-to-play-btn');
    elements.totalIcons = document.getElementById('total-icons');
    elements.totalMessages = document.getElementById('total-messages');
    elements.closeModal = document.getElementById('close-modal');
    elements.closeModalBtn = document.getElementById('close-modal-btn');
    elements.feed = document.getElementById('feed');
    elements.score = document.getElementById('score');
    elements.streak = document.getElementById('streak');
    elements.timer = document.getElementById('timer');
    elements.target = document.getElementById('target');
    elements.multiplier = document.getElementById('multiplier');
    elements.multiplierValue = document.getElementById('multiplier-value');
    elements.feedback = document.getElementById('feedback');
    elements.reactionBar = document.getElementById('reaction-bar');
    elements.winTitle = document.getElementById('win-title');
    elements.winMessage = document.getElementById('win-message');
    elements.finalScore = document.getElementById('final-score');
    elements.finalTime = document.getElementById('final-time');
    elements.postsSeen = document.getElementById('posts-seen');
    elements.bestStreak = document.getElementById('best-streak');
    elements.perfectIconsDisplay = document.getElementById('perfect-icons');
    elements.correctIconsDisplay = document.getElementById('correct-icons');
    elements.neutralIconsDisplay = document.getElementById('neutral-icons');
    elements.wrongIconsDisplay = document.getElementById('wrong-icons');
    elements.horribleIconsDisplay = document.getElementById('horrible-icons');
    elements.playAgainBtn = document.getElementById('play-again-btn');
    elements.backToMenuBtn = document.getElementById('back-to-menu-btn');
    elements.postTimer = document.getElementById('post-timer');
    elements.postTimerFill = document.getElementById('post-timer-fill');
    elements.postTimerText = document.getElementById('post-timer-text');

    // Set config values
    if (elements.target) {
        elements.target.textContent = GAME_SCORING.targetScore;
    }

    if (elements.totalIcons) {
        elements.totalIcons.textContent = `${allIcons.length}`;
    }

    if (elements.totalMessages) {
        elements.totalMessages.textContent = `${postTemplates.length}`;
    }

    // Setup controls
    setupControls();

    // Show start screen
    showScreen(elements.startScreen);

    console.log('🎮 Game initialized successfully!');
}

// Wait for DOM and then initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
