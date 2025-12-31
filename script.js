// Firebase Configuration (Replace with your own keys)
const firebaseConfig = {
    apiKey: "AIzaSyDyLdg4CiY0j8Yj2Geb2UyQvRHmOJ7-Y8E",
    authDomain: "garima-s-24th-birthday.firebaseapp.com",
    databaseURL: "https://garima-s-24th-birthday-default-rtdb.firebaseio.com",
    projectId: "garima-s-24th-birthday",
    storageBucket: "garima-s-24th-birthday.firebasestorage.app",
    messagingSenderId: "993503875378",
    appId: "1:993503875378:web:35cf8f3224c05bd74c72b",
    measurementId: "G-4YZ2CPZ8EG"
};

// Initialize Firebase (Safely)
let db = null;
try {
    if (typeof firebase !== 'undefined' && firebaseConfig.apiKey !== "YOUR_API_KEY") {
        firebase.initializeApp(firebaseConfig);
        db = firebase.database();
        console.log("Firebase initialized successfully! 🚀");
    } else {
        console.warn("Firebase config not found or using placeholders. Operating in Offline/Local mode. 🏠");
    }
} catch (e) {
    console.error("Firebase failed to initialize:", e);
}

const canvas = document.getElementById('wheelCanvas');
const ctx = canvas.getContext('2d');
const spinBtn = document.getElementById('spinBtn');
const editListBtn = document.getElementById('editListBtn');
const editModal = document.getElementById('editModal');
const resultModal = document.getElementById('resultModal');
const closeModalBtn = document.querySelector('.close-modal');
const closeResultBtn = document.getElementById('closeResultBtn');
const saveListBtn = document.getElementById('saveListBtn');
const drinkInput = document.getElementById('drinkInput');
const resultDrinkName = document.getElementById('resultDrinkName');
const menuModal = document.getElementById('menuModal');
const viewMenuBtn = document.getElementById('viewMenuBtn');
const closeMenuBtn = document.getElementById('closeMenuBtn');
const backToHomeBtn = document.getElementById('backToHomeBtn');

// Main Drink List (v10)
let drinks = [
    "GARIMAPOLITAN",
    "THAT’S THAT ME, ESPRESSO",
    "MABUHAY!",
    "SMISKI SPECIAL",
    "24K",
    "RODEO",
    "ROULETTE",
    "SECRET",
    "GG SHOT - Tequila",
    "GG SHOT - VODKA",
    "GG SHOT - BABY GUINNESS"
];

let startAngle = 0;
let arc = Math.PI * 2 / drinks.length;
let spinTimeout = null;
let spinAngleStart = 0;
let spinTime = 0;
let spinTimeTotal = 0;
let isSpinning = false;

// Colors
const colors = [
    "#f4d03f", // Gold
    "#9b7fb8", // Purple
    "#6b8e23", // Olive Green
    "#b39ddb", // Light Purple
];

function drawWheel() {
    arc = Math.PI * 2 / drinks.length;

    // Get actual canvas dimensions for responsive centering
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Calculate responsive dimensions
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;
    const outsideRadius = Math.min(canvasWidth, canvasHeight) / 2 - 10; // 10px padding
    const textRadius = outsideRadius * 0.7; // 70% of radius for text
    const insideRadius = 0;

    for (let i = 0; i < drinks.length; i++) {
        const angle = startAngle + i * arc;

        ctx.fillStyle = colors[i % colors.length];

        ctx.beginPath();
        ctx.arc(centerX, centerY, outsideRadius, angle, angle + arc, false);
        ctx.arc(centerX, centerY, insideRadius, angle + arc, angle, true);
        ctx.stroke();
        ctx.fill();

        ctx.save();

        // Shadow for depth
        ctx.shadowColor = "rgba(0,0,0,0.1)"; // Lighter shadow for clean look
        ctx.shadowBlur = 5;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;

        // Text Color Logic
        const bgColor = colors[i % colors.length];
        // Dark text on Cream(#fffef7), Gold(#f4d03f). White text on Purple(#9b7fb8), Olive(#6b8e23).
        ctx.fillStyle = (bgColor === "#fffef7" || bgColor === "#f4d03f") ? "#000000" : "#ffffff";

        // Radial Text Alignment
        ctx.translate(centerX + Math.cos(angle + arc / 2) * (outsideRadius - 20),
            centerY + Math.sin(angle + arc / 2) * (outsideRadius - 20));
        ctx.rotate(angle + arc / 2);

        const text = drinks[i];
        ctx.textAlign = "right";
        ctx.textBaseline = "middle";

        // Adaptive font size
        ctx.font = 'bold 16px "Outfit", sans-serif';
        if (text.length > 20) ctx.font = 'bold 12px "Outfit", sans-serif'; // Smaller for very long names

        ctx.fillText(text, 0, 0);
        ctx.restore();
    }

    // Draw center circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, 30, 0, Math.PI * 2);
    ctx.fillStyle = "#fff"; // White center
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = "#f4d03f"; // Gold ring
    ctx.stroke();

    // Draw outer rim
    ctx.beginPath();
    ctx.arc(centerX, centerY, outsideRadius, 0, Math.PI * 2);
    ctx.lineWidth = 8;
    ctx.strokeStyle = "rgba(244, 208, 63, 0.3)"; // Gold Rim
    ctx.stroke();
}

function rotateWheel() {
    spinTime += 20; // Time step
    if (spinTime >= spinTimeTotal) {
        stopRotateWheel();
        return;
    }

    // Ease out logic
    const spinAngle = spinAngleStart - easeOut(spinTime, 0, spinAngleStart, spinTimeTotal);
    startAngle += (spinAngle * Math.PI / 180);
    drawWheel();
    spinTimeout = requestAnimationFrame(rotateWheel);
}

function stopRotateWheel() {
    isSpinning = false;
    spinBtn.disabled = false;

    // Calculate result
    const degrees = startAngle * 180 / Math.PI + 90;
    const arcd = arc * 180 / Math.PI;
    const index = Math.floor((360 - degrees % 360) / arcd);

    ctx.save();
    ctx.font = 'bold 30px "Outfit", sans-serif';
    const text = drinks[index];

    // Show modal
    resultDrinkName.textContent = text;
    resultModal.classList.remove('hidden');

    // Confetti
    if (typeof confetti === 'function') {
        confetti({
            particleCount: 150,
            spread: 100,
            origin: { y: 0.6 },
            colors: ['#f4d03f', '#9b7fb8', '#6b8e23'] // Gold, Purple, Olive
        });
    }

    ctx.restore();
}

function easeOut(t, b, c, d) {
    const ts = (t /= d) * t;
    const tc = ts * t;
    return b + c * (tc + -3 * ts + 3 * t);
}

function spin() {
    if (isSpinning) return;

    isSpinning = true;
    spinBtn.disabled = true;

    spinAngleStart = Math.random() * 10 + 10;
    spinTime = 0;
    spinTimeTotal = Math.random() * 3000 + 4000; // Duration between 4s and 7s
    rotateWheel();
}

// UI Event Listeners
if (spinBtn) spinBtn.addEventListener('click', spin);

if (editListBtn) editListBtn.addEventListener('click', () => {
    drinkInput.value = drinks.join('\n');
    editModal.classList.remove('hidden');
});

if (closeModalBtn) closeModalBtn.addEventListener('click', () => {
    editModal.classList.add('hidden');
});

if (saveListBtn) saveListBtn.addEventListener('click', () => {
    const text = drinkInput.value;
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    if (lines.length > 1) {
        drinks = lines;
        drawWheel();
        populateDrinkDropdown();
        editModal.classList.add('hidden');
    } else {
        alert("Please enter at least 2 drinks!");
    }
});

if (closeResultBtn) closeResultBtn.addEventListener('click', () => {
    resultModal.classList.add('hidden');
});

if (viewMenuBtn) viewMenuBtn.addEventListener('click', () => {
    menuModal.classList.remove('hidden');
});

if (closeMenuBtn) closeMenuBtn.addEventListener('click', () => {
    menuModal.classList.add('hidden');
});

if (backToHomeBtn) backToHomeBtn.addEventListener('click', () => {
    menuModal.classList.add('hidden');
});

// Close menu modal when clicking outside
window.addEventListener('click', (e) => {
    if (e.target === menuModal) {
        menuModal.classList.add('hidden');
    }
});

// Queue System Logic
const queueNameInput = document.getElementById('queueNameInput');
const queueDrinkSelect = document.getElementById('queueDrinkSelect');
const addToQueueBtn = document.getElementById('addToQueueBtn');
const queueList = document.getElementById('queueList');
const queueCount = document.getElementById('queueCount');

// Result Modal Elements
const resultNameInput = document.getElementById('resultNameInput');
const addResultToQueueBtn = document.getElementById('addResultToQueueBtn');

let queue = [];
let guestName = localStorage.getItem('guestName') || '';

// Guest Check-in Logic
const checkInModal = document.getElementById('checkInModal');
const checkInNameInput = document.getElementById('checkInNameInput');
const confirmCheckInBtn = document.getElementById('confirmCheckInBtn');

function initGuestFlow() {
    if (!guestName) {
        checkInModal.classList.remove('hidden');
    } else {
        checkInModal.classList.add('hidden');
        if (queueNameInput) queueNameInput.value = guestName;
        if (resultNameInput) resultNameInput.value = guestName;
    }
}

if (confirmCheckInBtn) {
    confirmCheckInBtn.addEventListener('click', () => {
        const name = checkInNameInput.value.trim();
        if (name) {
            guestName = name;
            localStorage.setItem('guestName', name);
            checkInModal.classList.add('hidden');
            if (queueNameInput) queueNameInput.value = guestName;
            if (resultNameInput) resultNameInput.value = guestName;
        }
    });
}

// Notification Logic
const notificationToast = document.getElementById('notificationToast');
const notifClose = document.querySelector('.notif-close');

function showNotification(title, message) {
    if (!notificationToast) return;
    document.getElementById('notifTitle').textContent = title;
    document.getElementById('notifMessage').textContent = message;
    notificationToast.classList.remove('hidden');

    // Play sound if possible
    try { new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3').play(); } catch (e) { }

    setTimeout(() => {
        notificationToast.classList.add('hidden');
    }, 8000);
}

if (notifClose) {
    notifClose.addEventListener('click', () => {
        notificationToast.classList.add('hidden');
    });
}

function saveQueue() {
    // With Firebase, we mostly write individual items, 
    // but we can listen for the whole list for the UI.
}

// Listen for Real-time Queue Updates (Firebase)
if (db) {
    db.ref('orders').on('value', (snapshot) => {
        const data = snapshot.val();
        queue = [];
        if (data) {
            Object.keys(data).forEach(id => {
                const order = data[id];
                order.id = id;
                queue.push(order);

                // Trigger notification if order is ready and belongs to this guest
                if (order.name === guestName && order.status === 'ready' && !order.notified) {
                    showNotification("Your Drink's Ready! 🥂", `Your ${order.drink} is waiting at the bar!`);
                    db.ref(`orders/${id}/notified`).set(true);
                }
            });
        }
        renderQueue();
    });
} else {
    // Local Fallback: Load from localStorage if offline
    queue = JSON.parse(localStorage.getItem('drinkQueueLocal')) || [];
    renderQueue();

    // Listen for storage events (sync across local tabs)
    window.addEventListener('storage', (e) => {
        if (e.key === 'drinkQueueLocal') {
            queue = JSON.parse(e.newValue) || [];
            renderQueue();
        }
    });
}

function populateDrinkDropdown() {
    if (!queueDrinkSelect) return;

    // Save current selection if possible
    const currentVal = queueDrinkSelect.value;

    queueDrinkSelect.innerHTML = '<option value="" disabled selected>Select Drink...</option>';
    drinks.forEach(drink => {
        const option = document.createElement('option');
        option.value = drink;
        option.textContent = drink;
        queueDrinkSelect.appendChild(option);
    });

    // Restore if it still exists
    if (drinks.includes(currentVal)) {
        queueDrinkSelect.value = currentVal;
    }
}

function addToQueue() {
    const name = (queueNameInput.value || guestName || "Guest").trim();
    const drink = queueDrinkSelect.value;
    if (!drink) return alert("Please select a drink!");

    const newOrder = {
        name: name,
        drink: drink,
        status: 'pending',
        timestamp: Date.now(),
        notified: false
    };

    if (db) {
        db.ref('orders').push(newOrder);
    } else {
        // Local fallback
        newOrder.id = 'local-' + Date.now();
        queue.push(newOrder);
        localStorage.setItem('drinkQueueLocal', JSON.stringify(queue));
        renderQueue();
    }

    queueNameInput.value = guestName;
    queueDrinkSelect.value = "";
}

function addResultToQueue() {
    const name = (resultNameInput.value || guestName || "Guest").trim();
    const drink = resultDrinkName.textContent;

    const newOrder = {
        name: name,
        drink: drink,
        status: 'pending',
        timestamp: Date.now(),
        notified: false
    };

    if (db) {
        db.ref('orders').push(newOrder);
    } else {
        // Local fallback
        newOrder.id = 'local-' + Date.now();
        queue.push(newOrder);
        localStorage.setItem('drinkQueueLocal', JSON.stringify(queue));
        renderQueue();
    }

    resultNameInput.value = guestName;
    resultModal.classList.add('hidden');
}

function removeFromQueue(id) {
    if (db) {
        db.ref(`orders/${id}`).remove();
    } else {
        queue = queue.filter(item => item.id !== id);
        localStorage.setItem('drinkQueueLocal', JSON.stringify(queue));
        renderQueue();
    }
}

function renderQueue() {
    if (!queueList) return;

    queueList.innerHTML = '';
    if (queueCount) queueCount.textContent = `(${queue.length})`;

    // Filter to show only pending (or recently ready) for the guest list?
    // Let's show all per current UI, but only allow deleting if it's theirs or if they are admin?
    // For now, keep it simple.
    queue.forEach((item, index) => {
        const li = document.createElement('li');
        li.className = `queue-item ${item.status === 'ready' ? 'glow-text-gold' : ''}`;

        const span = document.createElement('span');
        const queueNumber = index + 1;
        span.innerHTML = `<span style="color: black; font-weight: bold;">${queueNumber}.</span> ${item.name} - ${item.drink} ${item.status === 'ready' ? ' (Ready to pick up! 🥂)' : ''}`;

        li.appendChild(span);

        // Only allow deleting if it's their own drink
        if (item.name === guestName) {
            const btn = document.createElement('button');
            btn.className = 'remove-queue-btn';
            btn.innerHTML = '&times;';
            btn.onclick = () => removeFromQueue(item.id);
            li.appendChild(btn);
        }
        queueList.appendChild(li);
    });
}

// Listen for updates from other tabs (Bartender View)
window.addEventListener('storage', (e) => {
    if (e.key === 'drinkQueue') {
        queue = JSON.parse(e.newValue) || [];
        renderQueue();
    }
});

if (addToQueueBtn) addToQueueBtn.addEventListener('click', addToQueue);
if (addResultToQueueBtn) addResultToQueueBtn.addEventListener('click', addResultToQueue);

if (queueNameInput) queueNameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addToQueue();
});
if (resultNameInput) resultNameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addResultToQueue();
});

// Initial draw & populate
drawWheel();
populateDrinkDropdown();
initGuestFlow();
// renderQueue called by Firebase listener

// QR Code Logic
const showQrBtn = document.getElementById('showQrBtn');
const qrModal = document.getElementById('qrModal');
const qrClose = document.querySelector('.qr-close');
const qrContainer = document.getElementById('qrcode');

if (showQrBtn) {
    showQrBtn.addEventListener('click', () => {
        qrModal.classList.remove('hidden');
        qrContainer.innerHTML = ''; // Clear previous
        new QRCode(qrContainer, {
            text: `https://gupta-garima.github.io/garima24bday/`,
            width: 128,
            height: 128,
            colorDark: "#1a1a1a",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });
    });
}

if (qrClose) {
    qrClose.addEventListener('click', () => {
        qrModal.classList.add('hidden');
    });
}

// Close QR modal when clicking outside
window.addEventListener('click', (e) => {
    if (e.target === qrModal) {
        qrModal.classList.add('hidden');
    }
});

