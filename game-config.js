// Game Configuration File
// Edit this file to customize icons, messages, and scoring

// All available icons in the game
const GAME_ICONS = [
    { id: 'wolf', file: 'icon-wolf.png', name: 'Wolf' },
    { id: 'wizard', file: 'icon-wizard.png', name: 'Wizard' },
    { id: 'brain', file: 'icon-brain.png', name: 'Brain' },
    { id: 'heart', file: 'icon-heart.png', name: 'Heart' },
    { id: 'heartbreak', file: 'icon-heartbreak.png', name: 'Heartbreak' },
    { id: 'crying', file: 'icon-crying.png', name: 'Crying' },
    { id: 'upset', file: 'icon-upset.png', name: 'Upset' },
    { id: 'shock', file: 'icon-shock.png', name: 'Shock' },
    { id: 'trophy', file: 'icon-trophy.png', name: 'Trophy' },
    { id: 'star', file: 'icon-star.png', name: 'Star' },
    { id: 'thumbsup', file: 'icon-thumbsup.png', name: 'Thumbs Up' },
    { id: 'thumbsdown', file: 'icon-thumbsdown.png', name: 'Thumbs Down' },
    { id: 'fire1', file: 'icon-fire1.png', name: 'Fire' },
    { id: 'fire2', file: 'icon-fire2.png', name: 'Fire' },
    { id: 'fire3', file: 'icon-fire3.png', name: 'Fire' },
    { id: 'money', file: 'icon-money.png', name: 'Money' },
    { id: 'coin', file: 'icon-coin.png', name: 'Coin' },
    { id: 'goldbar', file: 'icon-goldbar.png', name: 'Gold Bar' },
    { id: 'diamond', file: 'icon-diamond.png', name: 'Diamond' },
    { id: 'crown', file: 'icon-crown.png', name: 'Crown' },
    { id: 'gift', file: 'icon-gift.png', name: 'Gift' },
    { id: 'clock', file: 'icon-clock.png', name: 'Clock' },
    { id: 'alarmclock', file: 'icon-alarmclock.png', name: 'Alarm Clock' },
    { id: 'stopwatch', file: 'icon-stopwatch.png', name: 'Stopwatch' },
    { id: 'lock', file: 'icon-lock.png', name: 'Lock' },
    { id: 'book', file: 'icon-book.png', name: 'Book' },
    { id: 'lightning', file: 'icon-lightning.png', name: 'Lightning' },
    { id: 'sparkles', file: 'icon-sparkles.png', name: 'Sparkles' },
    { id: 'wand', file: 'icon-wand.png', name: 'Wand' },
    { id: 'gauntlet', file: 'icon-gauntlet.png', name: 'Gauntlet' },
    { id: 'skull', file: 'icon-skull.png', name: 'Skull' },
    { id: 'demon', file: 'icon-demon.png', name: 'Demon' },
    { id: 'goblin', file: 'icon-goblin.png', name: 'Goblin' },
    { id: 'sock', file: 'icon-sock.png', name: 'Sock' },
    { id: 'mismatchsock', file: 'icon-mismatchsock.png', name: 'Mismatched Socks' },
    { id: 'diamondsock', file: 'icon-diamondsock.png', name: 'Diamond Sock' },
    { id: 'goldensocks', file: 'icon-goldensocks.png', name: 'Golden Socks' },
    { id: 'laundrypile', file: 'icon-laundrypile.png', name: 'Laundry Pile' },
    { id: 'basket', file: 'icon-basket.png', name: 'Basket' },
    { id: 'house', file: 'icon-house.png', name: 'House' },
    { id: 'housefire', file: 'icon-housefire.png', name: 'House Fire' },
    { id: 'tv', file: 'icon-tv.png', name: 'TV' },
    { id: 'washingmac', file: 'icon-washingmac.png', name: 'Washing Machine' },
    { id: 'cdplayer', file: 'icon-cdplayer.png', name: 'CD Player' },
    { id: 'radio', file: 'icon-radio.png', name: 'Radio' },
    { id: 'vhs', file: 'icon-vhs.png', name: 'VHS' },
    { id: 'record', file: 'icon-record.png', name: 'Record' },
    { id: 'musicnote', file: 'icon-musicnote.png', name: 'Music Note' },
    { id: 'barbell', file: 'icon-barbell.png', name: 'Barbell' },
    { id: 'shoes', file: 'icon-shoes.png', name: 'Shoes' },
    { id: 'hat', file: 'icon-hat.png', name: 'Hat' },
    { id: 'egg', file: 'icon-egg.png', name: 'Egg' },
    { id: 'butter', file: 'icon-butter.png', name: 'Butter' },
    { id: 'glass', file: 'icon-glass.png', name: 'Glass' },
    { id: 'hands', file: 'icon-hands.png', name: 'Praying Hands' },
    { id: 'teeth', file: 'icon-teeth.png', name: 'Teeth' },
    { id: 'eyeball', file: 'icon-eyeball.png', name: 'Eyeball' },
    { id: 'beetle', file: 'icon-beetle.png', name: 'Beetle' },
    { id: 'stagbeetle', file: 'icon-stagbeetle.png', name: 'Stag Beetle' },
    { id: 'mouse', file: 'icon-mouse.png', name: 'Mouse' },
    { id: 'stroller', file: 'icon-stroller.png', name: 'Stroller' },
    { id: 'wall', file: 'icon-wall.png', name: 'Wall' },
    { id: 'bullseye', file: 'icon-bullseye.png', name: 'Bullseye' },
    { id: 'redx', file: 'icon-redx.png', name: 'Red X' },
    { id: 'medal', file: 'icon-1stmedal.png', name: '1st Medal' },
];

// Post messages with icon reactions
// Each post has:
// - text: The message displayed to the player
// - perfectIcons: Array of icon IDs that give +5 points (perfect answers)
// - correctIcons: Array of icon IDs that give +2 points (good answers)
// - neutralIcons: Array of icon IDs that give 0 points (okay answers)
// - wrongIcons: Array of icon IDs that give -3 points (bad answers)
// - horribleIcons: Array of icon IDs that give -6 points (terrible answers)

const GAME_MESSAGES = [
    {
        text: "I feel like howling at the moon",
        perfectIcons: ['wolf'],
        correctIcons: ['shock'],
        neutralIcons: ['fire1'],
        wrongIcons: ['crying', 'brain'],
        horribleIcons: ['basket', 'butter']
    },
    {
        text: "Cast a spell on my problems!",
        perfectIcons: ['wizard', 'wand'],
        correctIcons: ['sparkles', 'lightning'],
        neutralIcons: ['brain'],
        wrongIcons: ['sock'],
        horribleIcons: ['butter', 'basket']
    },
    {
        text: "My relationship just ended",
        perfectIcons: ['heartbreak', 'crying'],
        correctIcons: ['upset'],
        neutralIcons: ['shock'],
        wrongIcons: ['heart', 'gift'],
        horribleIcons: ['trophy', 'thumbsup', 'star']
    },
    {
        text: "I love you!",
        perfectIcons: ['heart'],
        correctIcons: ['gift', 'sparkles'],
        neutralIcons: ['thumbsup'],
        wrongIcons: ['crying', 'upset'],
        horribleIcons: ['heartbreak', 'skull', 'demon']
    },
    {
        text: "Just won first place!",
        perfectIcons: ['trophy', 'medal', 'crown'],
        correctIcons: ['star'],
        neutralIcons: ['thumbsup'],
        wrongIcons: ['upset'],
        horribleIcons: ['crying', 'redx', 'heartbreak']
    },
    {
        text: "This makes me so angry!",
        perfectIcons: ['upset', 'fire1', 'fire2', 'fire3'],
        correctIcons: ['thumbsdown'],
        neutralIcons: ['shock'],
        wrongIcons: ['thumbsup'],
        horribleIcons: ['heart', 'trophy', 'gift']
    },
    {
        text: "I can't believe this happened!",
        perfectIcons: ['shock'],
        correctIcons: ['eyeball', 'upset'],
        neutralIcons: ['crying'],
        wrongIcons: ['thumbsup'],
        horribleIcons: ['trophy', 'star']
    },
    {
        text: "I'm so sad right now",
        perfectIcons: ['crying', 'heartbreak'],
        correctIcons: ['upset'],
        neutralIcons: ['shock'],
        wrongIcons: ['thumbsup'],
        horribleIcons: ['trophy', 'star', 'heart']
    },
    {
        text: "Lost a sock in the laundry again!",
        perfectIcons: ['sock', 'mismatchsock'],
        correctIcons: ['laundrypile'],
        neutralIcons: ['washingmac'],
        wrongIcons: ['thumbsup'],
        horribleIcons: ['trophy', 'crown', 'star']
    },
    {
        text: "Found matching socks!",
        perfectIcons: ['sock', 'thumbsup'],
        correctIcons: ['laundrypile'],
        neutralIcons: ['washingmac'],
        wrongIcons: ['mismatchsock'],
        horribleIcons: ['crying', 'upset']
    },
    {
        text: "Time to do laundry...",
        perfectIcons: ['laundrypile', 'washingmac'],
        correctIcons: ['basket', 'sock'],
        neutralIcons: ['upset'],
        wrongIcons: ['thumbsup'],
        horribleIcons: ['trophy', 'diamond', 'crown']
    },
    {
        text: "Made a fortune today!",
        perfectIcons: ['money', 'goldbar', 'diamond'],
        correctIcons: ['coin', 'trophy'],
        neutralIcons: ['thumbsup'],
        wrongIcons: ['upset'],
        horribleIcons: ['crying', 'heartbreak']
    },
    {
        text: "Completely broke...",
        perfectIcons: ['crying', 'upset'],
        correctIcons: ['shock', 'heartbreak'],
        neutralIcons: ['thumbsdown'],
        wrongIcons: ['coin'],
        horribleIcons: ['money', 'goldbar', 'trophy', 'diamond']
    },
    {
        text: "My house is on fire!",
        perfectIcons: ['housefire', 'fire1', 'fire2', 'fire3'],
        correctIcons: ['shock', 'crying'],
        neutralIcons: ['upset'],
        wrongIcons: ['house'],
        horribleIcons: ['thumbsup', 'trophy', 'heart']
    },
    {
        text: "Just bought my dream home!",
        perfectIcons: ['house', 'trophy'],
        correctIcons: ['star', 'thumbsup', 'heart'],
        neutralIcons: ['gift'],
        wrongIcons: ['upset'],
        horribleIcons: ['housefire', 'crying', 'fire1']
    },
    {
        text: "Time's running out!",
        perfectIcons: ['clock', 'alarmclock', 'stopwatch'],
        correctIcons: ['shock', 'upset'],
        neutralIcons: ['crying'],
        wrongIcons: ['thumbsup'],
        horribleIcons: ['trophy', 'heart', 'star']
    },
    {
        text: "Reading a great book",
        perfectIcons: ['book'],
        correctIcons: ['brain', 'thumbsup'],
        neutralIcons: ['star'],
        wrongIcons: ['upset'],
        horribleIcons: ['fire1', 'crying']
    },
    {
        text: "This content is locked",
        perfectIcons: ['lock'],
        correctIcons: ['wall', 'redx'],
        neutralIcons: ['shock'],
        wrongIcons: ['thumbsup'],
        horribleIcons: ['trophy', 'star', 'gift']
    },
    {
        text: "Struck by lightning!",
        perfectIcons: ['lightning', 'shock'],
        correctIcons: ['fire1', 'upset'],
        neutralIcons: ['crying'],
        wrongIcons: ['thumbsup'],
        horribleIcons: ['heart', 'trophy']
    },
    {
        text: "Everything is magical!",
        perfectIcons: ['sparkles', 'wizard', 'wand'],
        correctIcons: ['star', 'trophy'],
        neutralIcons: ['thumbsup'],
        wrongIcons: ['upset'],
        horribleIcons: ['crying', 'heartbreak']
    },
    {
        text: "Ready to fight!",
        perfectIcons: ['gauntlet'],
        correctIcons: ['upset', 'fire1'],
        neutralIcons: ['shock'],
        wrongIcons: ['crying'],
        horribleIcons: ['heartbreak', 'heart', 'thumbsup']
    },
    {
        text: "This is evil!",
        perfectIcons: ['demon', 'skull'],
        correctIcons: ['goblin', 'upset'],
        neutralIcons: ['fire1'],
        wrongIcons: ['thumbsdown'],
        horribleIcons: ['heart', 'trophy', 'gift']
    },
    {
        text: "Encountered a goblin",
        perfectIcons: ['goblin'],
        correctIcons: ['shock', 'demon'],
        neutralIcons: ['upset'],
        wrongIcons: ['thumbsup'],
        horribleIcons: ['heart', 'trophy']
    },
    {
        text: "Playing retro music",
        perfectIcons: ['record', 'vhs', 'cdplayer', 'radio'],
        correctIcons: ['musicnote', 'thumbsup'],
        neutralIcons: ['star'],
        wrongIcons: ['upset'],
        horribleIcons: ['crying', 'fire1']
    },
    {
        text: "Hitting the gym today",
        perfectIcons: ['barbell'],
        correctIcons: ['shoes', 'thumbsup'],
        neutralIcons: ['fire1'],
        wrongIcons: ['upset'],
        horribleIcons: ['crying', 'butter']
    },
    {
        text: "Making breakfast",
        perfectIcons: ['egg', 'butter'],
        correctIcons: ['thumbsup'],
        neutralIcons: ['glass'],
        wrongIcons: ['upset'],
        horribleIcons: ['skull', 'fire1', 'demon']
    },
    {
        text: "Looking sharp!",
        perfectIcons: ['teeth', 'thumbsup'],
        correctIcons: ['sparkles', 'star'],
        neutralIcons: ['trophy'],
        wrongIcons: ['upset'],
        horribleIcons: ['crying', 'heartbreak']
    },
    {
        text: "Someone's watching...",
        perfectIcons: ['eyeball'],
        correctIcons: ['shock', 'upset'],
        neutralIcons: ['crying'],
        wrongIcons: ['thumbsup'],
        horribleIcons: ['heart', 'trophy']
    },
    {
        text: "Found a bug!",
        perfectIcons: ['beetle', 'stagbeetle'],
        correctIcons: ['shock'],
        neutralIcons: ['eyeball'],
        wrongIcons: ['thumbsup'],
        horribleIcons: ['heart', 'trophy', 'gift']
    },
    {
        text: "Spotted a tiny mouse",
        perfectIcons: ['mouse'],
        correctIcons: ['shock'],
        neutralIcons: ['eyeball'],
        wrongIcons: ['thumbsup'],
        horribleIcons: ['skull', 'demon']
    },
    {
        text: "New baby arrived!",
        perfectIcons: ['stroller', 'heart'],
        correctIcons: ['gift', 'trophy'],
        neutralIcons: ['thumbsup'],
        wrongIcons: ['upset'],
        horribleIcons: ['crying', 'skull', 'demon']
    },
    {
        text: "Hit a wall in my project",
        perfectIcons: ['wall'],
        correctIcons: ['upset', 'crying'],
        neutralIcons: ['shock'],
        wrongIcons: ['thumbsup'],
        horribleIcons: ['trophy', 'star', 'heart']
    },
    {
        text: "Nailed it perfectly!",
        perfectIcons: ['bullseye', 'trophy'],
        correctIcons: ['thumbsup', 'star'],
        neutralIcons: ['gift'],
        wrongIcons: ['upset'],
        horribleIcons: ['redx', 'crying', 'thumbsdown']
    },
    {
        text: "This is completely wrong!",
        perfectIcons: ['redx', 'thumbsdown'],
        correctIcons: ['upset'],
        neutralIcons: ['crying'],
        wrongIcons: ['thumbsup'],
        horribleIcons: ['trophy', 'star', 'heart']
    },
    {
        text: "You're the best!",
        perfectIcons: ['thumbsup', 'trophy', 'star'],
        correctIcons: ['heart', 'crown'],
        neutralIcons: ['gift'],
        wrongIcons: ['upset'],
        horribleIcons: ['thumbsdown', 'crying', 'redx']
    },
    {
        text: "This is terrible",
        perfectIcons: ['thumbsdown', 'upset'],
        correctIcons: ['crying', 'redx'],
        neutralIcons: ['shock'],
        wrongIcons: ['thumbsup'],
        horribleIcons: ['trophy', 'star', 'heart']
    },
    {
        text: "Legendary rare item!",
        perfectIcons: ['diamond', 'crown', 'goldbar'],
        correctIcons: ['trophy', 'star'],
        neutralIcons: ['coin'],
        wrongIcons: ['thumbsup'],
        horribleIcons: ['sock', 'butter', 'crying']
    },
    {
        text: "Thinking really hard",
        perfectIcons: ['brain'],
        correctIcons: ['book'],
        neutralIcons: ['shock'],
        wrongIcons: ['upset'],
        horribleIcons: ['fire1', 'skull', 'demon']
    },
    {
        text: "Everything is burning!",
        perfectIcons: ['fire1', 'fire2', 'fire3'],
        correctIcons: ['upset', 'shock'],
        neutralIcons: ['crying'],
        wrongIcons: ['thumbsup'],
        horribleIcons: ['heart', 'trophy', 'gift']
    },
    {
        text: "Praying for good luck",
        perfectIcons: ['hands'],
        correctIcons: ['star', 'sparkles'],
        neutralIcons: ['thumbsup'],
        wrongIcons: ['upset'],
        horribleIcons: ['demon', 'skull']
    },
    {
        text: "Getting dressed up",
        perfectIcons: ['hat', 'shoes'],
        correctIcons: ['thumbsup'],
        neutralIcons: ['sparkles'],
        wrongIcons: ['laundrypile'],
        horribleIcons: ['crying', 'upset']
    },
    {
        text: "Royalty treatment!",
        perfectIcons: ['crown'],
        correctIcons: ['trophy', 'star'],
        neutralIcons: ['diamond'],
        wrongIcons: ['upset'],
        horribleIcons: ['crying', 'heartbreak']
    },
    {
        text: "Perfect gift received",
        perfectIcons: ['gift', 'heart'],
        correctIcons: ['thumbsup', 'trophy'],
        neutralIcons: ['star'],
        wrongIcons: ['upset'],
        horribleIcons: ['crying', 'redx', 'thumbsdown']
    },
    {
        text: "Shining bright!",
        perfectIcons: ['star', 'sparkles'],
        correctIcons: ['trophy', 'diamond'],
        neutralIcons: ['thumbsup'],
        wrongIcons: ['upset'],
        horribleIcons: ['crying', 'skull']
    },
];

// Game scoring settings
const GAME_SCORING = {
    perfectPoints: 5,      // Points for perfect icon
    correctPoints: 2,      // Points for correct icon
    neutralPoints: 0,      // Points for neutral icon
    wrongPoints: -3,       // Points for wrong icon
    horriblePoints: -6,    // Points for horrible icon
    timeoutPenalty: -2,    // Points lost when time runs out
    fastBonus: 2,          // Bonus for <1s reaction
    quickBonus: 1,         // Bonus for <2s reaction
    targetScore: 100,      // Score needed to win
    streak5Multiplier: 2,  // Multiplier at 5 streak
    streak10Multiplier: 3, // Multiplier at 10 streak
    postTimeLimit: 5000,   // Time limit per post in milliseconds (5 seconds)
};
