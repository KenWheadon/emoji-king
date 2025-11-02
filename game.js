// Load config from game-config.js
const allIcons = GAME_ICONS;
const postTemplates = GAME_MESSAGES;

// Audio Manager
const AudioManager = {
  sounds: {},
  bgMusic: null,
  muted: false,
  musicMuted: false,

  init() {
    // Preload all audio files
    this.sounds = {
      buttonClick: new Audio("audio/button-click.mp3"),
      buttonHover: new Audio("audio/button-hover.mp3"),
      click: new Audio("audio/click.mp3"),
      collected: new Audio("audio/collected.mp3"),
      hit: new Audio("audio/hit.mp3"),
      levelComplete: new Audio("audio/level-complete.mp3"),
      match: new Audio("audio/match.mp3"),
      mismatch: new Audio("audio/mismatch.mp3"),
      particleBurst: new Audio("audio/particle-burst.mp3"),
      pointsGained: new Audio("audio/points-gained.mp3"),
      screenShake: new Audio("audio/screen-shake.mp3"),
      timeWarning: new Audio("audio/time-warning.mp3"),
    };

    // Set up background music
    this.bgMusic = new Audio("audio/dark-cute-neon-revolt.mp3");
    this.bgMusic.loop = true;
    this.bgMusic.volume = 0.6; // Lower volume for background music

    // Set volume levels for all sounds
    Object.values(this.sounds).forEach((sound) => {
      sound.volume = 0.5;
    });

    // Check for saved mute preferences
    const savedMute = localStorage.getItem("audioMuted");
    if (savedMute === "true") {
      this.muted = true;
    }

    const savedMusicMute = localStorage.getItem("musicMuted");
    if (savedMusicMute === "true") {
      this.musicMuted = true;
    }
  },

  play(soundName) {
    if (this.muted) return;

    const sound = this.sounds[soundName];
    if (sound) {
      // Clone and play to allow overlapping sounds
      const soundClone = sound.cloneNode();
      soundClone.volume = sound.volume;
      soundClone.play().catch((err) => {
        // Silently handle autoplay restrictions
        console.log("Audio playback prevented:", err);
      });
    }
  },

  playMusic() {
    if (this.musicMuted || !this.bgMusic) return;

    this.bgMusic.play().catch((err) => {
      console.log("Music playback prevented:", err);
    });
  },

  pauseMusic() {
    if (this.bgMusic) {
      this.bgMusic.pause();
    }
  },

  stopMusic() {
    if (this.bgMusic) {
      this.bgMusic.pause();
      this.bgMusic.currentTime = 0;
    }
  },

  toggleMute() {
    this.muted = !this.muted;
    localStorage.setItem("audioMuted", this.muted);
    return this.muted;
  },

  toggleMusic() {
    this.musicMuted = !this.musicMuted;
    localStorage.setItem("musicMuted", this.musicMuted);

    if (this.musicMuted) {
      this.pauseMusic();
    } else {
      this.playMusic();
    }

    return this.musicMuted;
  },

  toggleAll() {
    // Toggle both muted and musicMuted to the same state
    const newState = !this.muted; // Use muted as the primary state
    this.muted = newState;
    this.musicMuted = newState;
    localStorage.setItem("audioMuted", this.muted);
    localStorage.setItem("musicMuted", this.musicMuted);

    if (this.musicMuted) {
      this.pauseMusic();
    } else {
      this.playMusic();
    }

    return this.muted;
  },

  setVolume(soundName, volume) {
    if (this.sounds[soundName]) {
      this.sounds[soundName].volume = Math.max(0, Math.min(1, volume));
    }
  },

  setMusicVolume(volume) {
    if (this.bgMusic) {
      this.bgMusic.volume = Math.max(0, Math.min(1, volume));
    }
  },
};

// Game State
const gameState = {
  score: 0,
  streak: 0,
  bestStreak: 0,
  postsSeen: 0,
  perfectIcons: 0, // +5 points
  correctIcons: 0, // +2 points
  neutralIcons: 0, // 0 points
  wrongIcons: 0, // -3 points
  horribleIcons: 0, // -6 points
  timeoutIcons: 0, // -2 points (timeout)
  isPlaying: false,
  currentPost: null,
  currentIconChoices: [],
  postStartTime: 0,
  gameStartTime: 0,
  gameDuration: 0,
  timerInterval: null,
  postTimerInterval: null,
  postTimeRemaining: 0,
  messageQueue: [], // Shuffled queue of messages to ensure no repeats until all shown
  eventListeners: [], // Track event listeners for cleanup
  keydownHandler: null, // Store keydown handler reference
};

// DOM Elements - initialized after screens load
const elements = {};

// Screen Management
function showScreen(screen) {
  if (!screen) {
    console.error("Cannot show null screen");
    return;
  }

  // Hide all screens
  if (elements.startScreen) elements.startScreen.classList.add("hidden");
  if (elements.gameScreen) elements.gameScreen.classList.add("hidden");
  if (elements.winScreen) elements.winScreen.classList.add("hidden");
  if (elements.lossScreen) elements.lossScreen.classList.add("hidden");

  // Show requested screen and enable animations
  screen.classList.remove("hidden");
  screen.classList.remove("no-animate");
}

function showModal() {
  elements.howToPlayModal.classList.remove("hidden");
}

function hideModal() {
  elements.howToPlayModal.classList.add("hidden");
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
  elements.timer.textContent = `${minutes}:${seconds
    .toString()
    .padStart(2, "0")}`;
}

function formatTime(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

// Get dynamic post time limit based on score
function getPostTimeLimit() {
  if (gameState.score < 26) {
    return 10000; // 10 seconds for under 25 points
  } else if (gameState.score < 51) {
    return 8000; // 8 seconds for 26-50 points
  } else if (gameState.score < 76) {
    return 6000; // 6 seconds for 51-75 points
  } else {
    return 5000; // 5 seconds for 76+ points
  }
}

// Post Timer Functions
function startPostTimer() {
  stopPostTimer(); // Clear any existing timer

  gameState.postTimeRemaining = getPostTimeLimit();
  elements.postTimer.classList.remove("hidden");
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
    elements.postTimer.classList.add("hidden");
  }
}

function updatePostTimerUI() {
  if (!elements.postTimerFill || !elements.postTimerText) return;

  const maxTime = getPostTimeLimit();
  const percentage = (gameState.postTimeRemaining / maxTime) * 100;
  const seconds = (gameState.postTimeRemaining / 1000).toFixed(1);

  elements.postTimerFill.style.width = percentage + "%";
  elements.postTimerText.textContent = seconds + "s";

  // Update styling based on time remaining
  if (percentage <= 20) {
    elements.postTimerFill.classList.add("critical");
    elements.postTimerFill.classList.remove("warning");
    elements.postTimerText.classList.add("critical");
    elements.postTimerText.classList.remove("warning");
    // Play warning sound when entering critical zone (only once)
    if (!gameState.criticalSoundPlayed) {
      AudioManager.play("timeWarning");
      gameState.criticalSoundPlayed = true;
    }
  } else if (percentage <= 40) {
    elements.postTimerFill.classList.add("warning");
    elements.postTimerFill.classList.remove("critical");
    elements.postTimerText.classList.add("warning");
    elements.postTimerText.classList.remove("critical");
  } else {
    elements.postTimerFill.classList.remove("warning,critical");
    elements.postTimerText.classList.remove("warning,critical");
  }
}

function handlePostTimeout() {
  stopPostTimer();

  if (!gameState.isPlaying || !gameState.currentPost) return;

  // Check if this post was already handled (reaction was clicked)
  if (gameState.currentPost.handled) return;
  gameState.currentPost.handled = true;

  const post = gameState.currentPost;

  // Apply timeout penalty
  gameState.score += GAME_SCORING.timeoutPenalty;
  gameState.timeoutIcons++;
  gameState.streak = 0; // Break streak on timeout

  // Add timeout class to post for shake animation
  post.element.classList.add("timeout");

  // Play mismatch sound for timeout
  AudioManager.play("mismatch");

  // Show feedback
  showFeedback(`Time's Up! ${GAME_SCORING.timeoutPenalty}`, false);

  // Trigger screen shake
  triggerScreenShake();

  updateUI();

  // Check if score went too negative (game over)
  if (gameState.score <= GAME_SCORING.targetScoreLose) {
    endGame(false);
    return;
  }

  setTimeout(() => {
    showNextPost();
  }, 800);
}

// Utility Functions
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function getRandomPost() {
  // If queue is empty, refill with a shuffled copy of all messages
  if (gameState.messageQueue.length === 0) {
    gameState.messageQueue = shuffleArray(postTemplates);
  }

  // Pop the next message from the queue
  return gameState.messageQueue.shift();
}

function getIconById(id) {
  return allIcons.find((icon) => icon.id === id);
}

function getRandomIcons(count, exclude = []) {
  const available = allIcons.filter((icon) => !exclude.includes(icon.id));
  const shuffled = [...available].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function updateUI() {
  elements.score.textContent = gameState.score;
  elements.streak.textContent = gameState.streak;

  const multiplier = getMultiplier();
  if (multiplier > 1) {
    elements.multiplier.classList.remove("hidden");
    elements.multiplierValue.textContent = multiplier;
  } else {
    elements.multiplier.classList.add("hidden");
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
  const gameScreen = document.getElementById("game-screen");
  if (!gameScreen) return;

  // Create a new feedback element for each message
  const feedback = document.createElement("div");
  feedback.className = "feedback";
  feedback.textContent = text;

  if (isPositive) {
    feedback.classList.add("positive");
  } else {
    feedback.classList.add("negative");
  }

  // Find all existing feedback elements and move them up
  const existingFeedbacks = gameScreen.querySelectorAll(".feedback");
  existingFeedbacks.forEach((existing) => {
    const currentOffset = parseInt(existing.dataset.offset || "0");
    const newOffset = currentOffset + 1;
    existing.dataset.offset = newOffset;
    existing.style.transform = `translate(-50%, calc(-50% - ${
      newOffset * 80
    }px))`;
  });

  // Set initial offset for new feedback
  feedback.dataset.offset = "0";
  feedback.style.transform = "translate(-50%, -50%)";

  // Add to DOM
  gameScreen.appendChild(feedback);

  // Remove after animation completes
  setTimeout(() => {
    feedback.remove();
  }, 1000);
}

function triggerScreenShake() {
  const container = document.getElementById("game-container");
  container.classList.add("shake");

  // Play screen shake sound
  AudioManager.play("screenShake");

  setTimeout(() => {
    container.classList.remove("shake");
  }, 500);
}

function triggerScreenPulse() {
  const container = document.getElementById("game-container");
  container.classList.add("pulse");

  setTimeout(() => {
    container.classList.remove("pulse");
  }, 400);
}

function createParticleEffect(x, y, count = 15) {
  const container = document.getElementById("game-container");
  const particles = ["✨,⭐,💫,✦,+"];

  // Play particle burst sound
  AudioManager.play("particleBurst");

  // Get container position to convert viewport coordinates to container-relative coordinates
  const containerRect = container.getBoundingClientRect();
  const relativeX = x - containerRect.left - 20;
  const relativeY = y - containerRect.top - 54;

  for (let i = 0; i < count; i++) {
    const particle = document.createElement("div");
    particle.className = "particle";

    // Random particle type
    const particleType =
      particles[Math.floor(Math.random() * particles.length)];
    particle.textContent = particleType;

    // Add class based on particle type
    if (particleType === "⭐" || particleType === "💫") {
      particle.classList.add("star");
    } else if (particleType === "✨" || particleType === "✦") {
      particle.classList.add("sparkle");
    } else {
      particle.classList.add("plus");
    }

    // Random position around the click point
    const angle = (Math.PI * 2 * i) / count;
    const distance = 50 + Math.random() * 100;
    const tx = Math.cos(angle) * distance;
    const ty = Math.sin(angle) * distance - Math.random() * 50; // Slight upward bias

    particle.style.left = relativeX + "px";
    particle.style.top = relativeY + "px";
    particle.style.setProperty("--tx", tx + "px");
    particle.style.setProperty("--ty", ty + "px");

    container.appendChild(particle);

    // Remove particle after animation
    setTimeout(() => {
      particle.remove();
    }, 1000);
  }
}

// Post Creation
function createPost(postData) {
  const post = document.createElement("div");
  post.className = "post active";

  const text = document.createElement("div");
  text.className = "post-text";
  text.textContent = postData.text;

  post.appendChild(text);
  elements.feed.appendChild(post);

  // Remove active class from previous posts
  const posts = elements.feed.querySelectorAll(".post");
  posts.forEach((p) => {
    if (p !== post) {
      p.classList.remove("active");
    }
  });

  // Scroll to bottom to show the new post
  const feedContainer = document.getElementById("feed-container");
  if (feedContainer) {
    feedContainer.scrollTop = feedContainer.scrollHeight;
  }

  return post;
}

function updateReactionBar(iconChoices) {
  // Clear existing content and event listeners
  elements.reactionBar.innerHTML = "";

  iconChoices.forEach((icon, index) => {
    const btn = document.createElement("button");
    btn.className = "emoji-btn";
    btn.dataset.iconId = icon.id;
    btn.dataset.key = (index + 1).toString();

    const img = document.createElement("img");
    img.src = `images/${icon.file}`;
    img.alt = icon.name;
    img.className = "emoji-img";

    const hint = document.createElement("span");
    hint.className = "key-hint";
    hint.textContent = index + 1;

    btn.appendChild(img);
    btn.appendChild(hint);

    // Add hover sound
    btn.addEventListener("mouseenter", () => {
      AudioManager.play("buttonHover");
    });

    // Create named handler for cleanup
    const clickHandler = () => {
      const rect = btn.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      handleReaction(icon.id, x, y);
    };

    btn.addEventListener("click", clickHandler);

    elements.reactionBar.appendChild(btn);
  });
}

function showNextPost() {
  // Clean up old posts to prevent DOM accumulation
  cleanupOldPosts();

  // Reset critical sound flag for new post
  gameState.criticalSoundPlayed = false;

  const postData = getRandomPost();

  // Create icon choices: mix of all 5 categories
  // Typically include 1-2 perfect/correct, and a mix of neutral/wrong/horrible
  const perfectCount = Math.random() > 0.7 ? 1 : 0; // 30% chance for 1 perfect
  const perfectIcons = (postData.perfectIcons || [])
    .sort(() => Math.random() - 0.5)
    .slice(0, perfectCount)
    .map((id) => getIconById(id))
    .filter((icon) => icon);

  const correctCount = Math.random() > 0.5 ? 1 : 2;
  const correctIcons = (postData.correctIcons || [])
    .sort(() => Math.random() - 0.5)
    .slice(0, correctCount)
    .map((id) => getIconById(id))
    .filter((icon) => icon);

  const neutralCount = Math.floor(Math.random() * 2); // 0-1 neutral
  const neutralIcons = (postData.neutralIcons || [])
    .sort(() => Math.random() - 0.5)
    .slice(0, neutralCount)
    .map((id) => getIconById(id))
    .filter((icon) => icon);

  const remainingSlots = 6 - perfectCount - correctCount - neutralCount;
  const wrongCount = Math.floor(remainingSlots / 2);
  const horribleCount = remainingSlots - wrongCount;

  const wrongIcons = (postData.wrongIcons || [])
    .sort(() => Math.random() - 0.5)
    .slice(0, wrongCount)
    .map((id) => getIconById(id))
    .filter((icon) => icon);

  const horribleIcons = (postData.horribleIcons || [])
    .sort(() => Math.random() - 0.5)
    .slice(0, horribleCount)
    .map((id) => getIconById(id))
    .filter((icon) => icon);

  let iconChoices = [
    ...perfectIcons,
    ...correctIcons,
    ...neutralIcons,
    ...wrongIcons,
    ...horribleIcons,
  ];

  // If we don't have 6 yet, fill with random
  if (iconChoices.length < 6) {
    const existingIds = iconChoices.map((i) => i.id);
    const additionalIcons = getRandomIcons(6 - iconChoices.length, existingIds);
    iconChoices = [...iconChoices, ...additionalIcons];
  }

  // Shuffle using proper Fisher-Yates algorithm
  iconChoices = shuffleArray(iconChoices);

  gameState.currentPost = {
    data: postData,
    element: createPost(postData),
    handled: false,
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

  // Mark that we've handled this post to prevent timeout from firing
  if (gameState.currentPost.handled) return;
  gameState.currentPost.handled = true;

  // Stop the post timer since player responded
  stopPostTimer();

  const post = gameState.currentPost;
  const postData = post.data;

  // Determine score and track icon category
  let score = 0;
  let categoryName = "";

  if (postData.perfectIcons && postData.perfectIcons.includes(iconId)) {
    score = GAME_SCORING.perfectPoints;
    gameState.perfectIcons++;
    categoryName = "perfect";
  } else if (postData.correctIcons && postData.correctIcons.includes(iconId)) {
    score = GAME_SCORING.correctPoints;
    gameState.correctIcons++;
    categoryName = "correct";
  } else if (postData.neutralIcons && postData.neutralIcons.includes(iconId)) {
    score = GAME_SCORING.neutralPoints;
    gameState.neutralIcons++;
    categoryName = "neutral";
  } else if (postData.wrongIcons && postData.wrongIcons.includes(iconId)) {
    score = GAME_SCORING.wrongPoints;
    gameState.wrongIcons++;
    categoryName = "wrong";
  } else if (
    postData.horribleIcons &&
    postData.horribleIcons.includes(iconId)
  ) {
    score = GAME_SCORING.horriblePoints;
    gameState.horribleIcons++;
    categoryName = "horrible";
  } else {
    // Fallback for icons not in any category
    score = GAME_SCORING.wrongPoints;
    gameState.wrongIcons++;
    categoryName = "wrong";
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
  const reactionSpan = document.createElement("span");
  reactionSpan.className = "post-reaction";

  const icon = getIconById(iconId);
  if (icon) {
    const img = document.createElement("img");
    img.src = `images/${icon.file}`;
    img.alt = icon.name;
    reactionSpan.appendChild(img);
  }

  post.element.appendChild(reactionSpan);

  // Show feedback based on category with visual effects
  if (categoryName === "perfect") {
    post.element.classList.add("correct");
    let feedbackText = `Perfect! +${totalPoints}`;
    if (timeBonus > 0) feedbackText += ` ⚡`;
    if (multiplier > 1) feedbackText += ` ×${multiplier}`;
    showFeedback(feedbackText, true);
    // Play match sound and points gained for perfect
    AudioManager.play("match");
    AudioManager.play("pointsGained");
    // Trigger particle effect and screen pulse for perfect
    if (x !== undefined && y !== undefined) {
      createParticleEffect(x, y, 20);
    }
    triggerScreenPulse();
  } else if (categoryName === "correct") {
    post.element.classList.add("correct");
    let feedbackText = `Nice! +${totalPoints}`;
    if (timeBonus > 0) feedbackText += ` ⚡`;
    if (multiplier > 1) feedbackText += ` ×${multiplier}`;
    showFeedback(feedbackText, true);
    // Play collected sound for correct
    AudioManager.play("collected");
    // Trigger particle effect and screen pulse for correct
    if (x !== undefined && y !== undefined) {
      createParticleEffect(x, y, 12);
    }
    triggerScreenPulse();
  } else if (categoryName === "neutral") {
    showFeedback("Not quite", false);
    // Play click sound for neutral
    AudioManager.play("click");
  } else if (categoryName === "wrong") {
    post.element.classList.add("incorrect");
    showFeedback(`Bad ${totalPoints}`, false);
    // Play hit sound for wrong
    AudioManager.play("hit");
    // Trigger screen shake for wrong
    triggerScreenShake();
  } else if (categoryName === "horrible") {
    post.element.classList.add("incorrect");
    showFeedback(`Terrible ${totalPoints}`, false);
    // Play mismatch sound for horrible
    AudioManager.play("mismatch");
    // Trigger stronger screen shake for horrible
    triggerScreenShake();
  }

  updateUI();

  // Check win condition
  if (gameState.score >= GAME_SCORING.targetScore) {
    endGame(true);
    return;
  }

  // Check loss condition
  if (gameState.score <= GAME_SCORING.targetScoreLose) {
    endGame(false);
    return;
  }

  // Show next post
  setTimeout(() => {
    showNextPost();
  }, 600);
}

// Clean up old posts from feed to prevent DOM accumulation
function cleanupOldPosts() {
  const posts = elements.feed.querySelectorAll(".post");
  // Keep only the last 10 posts to prevent memory issues
  if (posts.length > 10) {
    const postsToRemove = Array.from(posts).slice(0, posts.length - 10);
    postsToRemove.forEach((post) => post.remove());
  }
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
  gameState.messageQueue = []; // Reset message queue for fresh shuffle
  gameState.criticalSoundPlayed = false;

  // Clear feed
  elements.feed.innerHTML = "";

  // Start background music
  AudioManager.playMusic();

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

  if (won) {
    // Play level complete sound
    AudioManager.play("levelComplete");

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

    // Update title, message, and icon based on performance
    const winIconImg = document.querySelector(".win-icon-img");
    if (gameState.bestStreak >= 15) {
      elements.winTitle.textContent = "LEGENDARY!";
      elements.winMessage.textContent = "You are an icon master!";
      if (winIconImg) {
        winIconImg.src = "images/icon-fire3.png";
        winIconImg.alt = "Fire";
      }
    } else if (gameState.bestStreak >= 10) {
      elements.winTitle.textContent = "SUPERSTAR!";
      elements.winMessage.textContent = "Amazing icon matching skills!";
      if (winIconImg) {
        winIconImg.src = "images/icon-star.png";
        winIconImg.alt = "Star";
      }
    } else {
      elements.winTitle.textContent = "WINNER!";
      elements.winMessage.textContent = "You reached the target score!";
      if (winIconImg) {
        winIconImg.src = "images/icon-trophy.png";
        winIconImg.alt = "Trophy";
      }
    }

    // Show win screen
    showScreen(elements.winScreen);
  } else {
    // Play mismatch sound for loss
    AudioManager.play("mismatch");

    // Update loss screen
    elements.lossFinalScore.textContent = gameState.score;
    elements.lossFinalTime.textContent = formatTime(gameState.gameDuration);
    elements.lossPostsSeen.textContent = gameState.postsSeen;
    elements.lossBestStreak.textContent = gameState.bestStreak;

    // Show loss screen
    showScreen(elements.lossScreen);
  }
}

function backToMenu() {
  // Stop timers if running
  if (gameState.timerInterval) {
    stopTimer();
  }
  stopPostTimer();

  // Pause background music when returning to menu
  AudioManager.pauseMusic();

  // Reset game state
  gameState.isPlaying = false;

  // Show start screen
  showScreen(elements.startScreen);
}

// Add hover and click sounds to all buttons
function addButtonSounds() {
  // Get all buttons with these classes
  const buttons = document.querySelectorAll(
    ".big-btn, .mute-btn, .emoji-btn, .modal-close"
  );

  buttons.forEach((button) => {
    // Add hover sound
    button.addEventListener("mouseenter", () => {
      AudioManager.play("buttonHover");
    });

    // Add click sound (for non-game buttons)
    if (!button.classList.contains("emoji-btn")) {
      button.addEventListener("click", () => {
        AudioManager.play("buttonClick");
        // Try to play music if not already playing
        if (
          AudioManager.bgMusic &&
          AudioManager.bgMusic.paused &&
          !AudioManager.musicMuted
        ) {
          AudioManager.playMusic();
        }
      });
    }
  });
}

// Input Handling
function setupControls() {
  // Add hover and click sounds to all buttons
  addButtonSounds();

  // Start button
  elements.startBtn.addEventListener("click", startGame);

  // How to play button
  elements.howToPlayBtn.addEventListener("click", () => {
    showModal();
  });

  // Modal close buttons
  elements.closeModal.addEventListener("click", () => {
    hideModal();
  });
  elements.closeModalBtn.addEventListener("click", () => {
    hideModal();
  });

  // Modal backdrop click - safely attach listener
  const modalBackdrop =
    elements.howToPlayModal?.querySelector(".modal-backdrop");
  if (modalBackdrop) {
    modalBackdrop.addEventListener("click", hideModal);
  }

  // Win screen buttons
  elements.playAgainBtn.addEventListener("click", startGame);
  elements.backToMenuBtn.addEventListener("click", backToMenu);

  // Loss screen buttons
  elements.tryAgainBtn.addEventListener("click", startGame);
  elements.lossBackToMenuBtn.addEventListener("click", backToMenu);

  // Unified audio button (if it exists)
  const audioBtn = document.getElementById("audio-btn");
  if (audioBtn) {
    updateAudioButton(audioBtn);
    audioBtn.addEventListener("click", () => {
      const isMuted = AudioManager.toggleAll();
      updateAudioButton(audioBtn);
    });
  }

  // Keyboard controls for game - store reference for cleanup
  gameState.keydownHandler = (e) => {
    if (!gameState.isPlaying) return;

    const key = e.key;
    if (key >= "1" && key <= "6") {
      const index = parseInt(key) - 1;
      if (gameState.currentIconChoices[index]) {
        // Use center of screen for keyboard input
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        handleReaction(
          gameState.currentIconChoices[index].id,
          centerX,
          centerY
        );
      }
    }
  };

  document.addEventListener("keydown", gameState.keydownHandler);
}

function updateAudioButton(audioBtn) {
  if (!audioBtn) return;

  const img = audioBtn.querySelector("img");
  if (!img) return;

  if (AudioManager.muted) {
    img.style.opacity = "0.3";
    audioBtn.title = "Unmute Audio";
  } else {
    img.style.opacity = "1";
    audioBtn.title = "Mute Audio";
  }
}

// Set viewport height CSS variable for better mobile support
function setViewportHeight() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty("--vh", `${vh}px`);
}

// Initialize
async function init() {
  // Set viewport height on load
  setViewportHeight();

  // Update viewport height on resize and orientation change
  window.addEventListener("resize", setViewportHeight);
  window.addEventListener("orientationchange", () => {
    setTimeout(setViewportHeight, 100);
  });

  // Wait for screens to load
  let retries = 0;
  const maxRetries = 50; // 5 seconds max wait

  while (!ScreenLoader.isReady() && retries < maxRetries) {
    await new Promise((resolve) => setTimeout(resolve, 100));
    retries++;
  }

  if (!ScreenLoader.isReady()) {
    console.error("Failed to load all screens in time");
    return;
  }

  // Wait for loading screen to complete (minimum 2 seconds + fade out)
  retries = 0;
  const maxLoadingRetries = 100; // 10 seconds max wait

  while (!ScreenLoader.loadingComplete && retries < maxLoadingRetries) {
    await new Promise((resolve) => setTimeout(resolve, 100));
    retries++;
  }

  if (!ScreenLoader.loadingComplete) {
    console.warn("Loading screen did not complete in expected time");
  }

  // Re-get elements after screens are loaded
  elements.startScreen = document.getElementById("start-screen");
  elements.gameScreen = document.getElementById("game-screen");
  elements.winScreen = document.getElementById("win-screen");
  elements.lossScreen = document.getElementById("loss-screen");
  elements.howToPlayModal = document.getElementById("how-to-play-modal");
  elements.startBtn = document.getElementById("start-btn");
  elements.howToPlayBtn = document.getElementById("how-to-play-btn");
  elements.totalIcons = document.getElementById("total-icons");
  elements.totalMessages = document.getElementById("total-messages");
  elements.closeModal = document.getElementById("close-modal");
  elements.closeModalBtn = document.getElementById("close-modal-btn");
  elements.feed = document.getElementById("feed");
  elements.score = document.getElementById("score");
  elements.streak = document.getElementById("streak");
  elements.timer = document.getElementById("timer");
  elements.target = document.getElementById("target");
  elements.multiplier = document.getElementById("multiplier");
  elements.multiplierValue = document.getElementById("multiplier-value");
  // Feedback elements are created dynamically
  elements.reactionBar = document.getElementById("reaction-bar");
  elements.winTitle = document.getElementById("win-title");
  elements.winMessage = document.getElementById("win-message");
  elements.finalScore = document.getElementById("final-score");
  elements.finalTime = document.getElementById("final-time");
  elements.postsSeen = document.getElementById("posts-seen");
  elements.bestStreak = document.getElementById("best-streak");
  elements.perfectIconsDisplay = document.getElementById("perfect-icons");
  elements.correctIconsDisplay = document.getElementById("correct-icons");
  elements.neutralIconsDisplay = document.getElementById("neutral-icons");
  elements.wrongIconsDisplay = document.getElementById("wrong-icons");
  elements.horribleIconsDisplay = document.getElementById("horrible-icons");
  elements.playAgainBtn = document.getElementById("play-again-btn");
  elements.backToMenuBtn = document.getElementById("back-to-menu-btn");
  elements.lossFinalScore = document.getElementById("loss-final-score");
  elements.lossFinalTime = document.getElementById("loss-final-time");
  elements.lossPostsSeen = document.getElementById("loss-posts-seen");
  elements.lossBestStreak = document.getElementById("loss-best-streak");
  elements.tryAgainBtn = document.getElementById("try-again-btn");
  elements.lossBackToMenuBtn = document.getElementById("loss-back-to-menu-btn");
  elements.postTimer = document.getElementById("post-timer");
  elements.postTimerFill = document.getElementById("post-timer-fill");
  elements.postTimerText = document.getElementById("post-timer-text");

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

  // Initialize audio manager
  AudioManager.init();

  // Try to start background music on start screen
  AudioManager.playMusic();

  // Setup controls
  setupControls();

  // Show start screen
  showScreen(elements.startScreen);

  console.log("🎮 Game initialized successfully!");
}

// Wait for DOM and then initialize
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
