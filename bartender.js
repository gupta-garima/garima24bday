// Firebase Configuration (Matching index page)
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
        console.warn("Firebase config using placeholders. Operating in Offline/Local mode. 🏠");
    }
} catch (e) {
    console.error("Firebase failed to initialize:", e);
}

// Bartender Logic
const queueList = document.getElementById('bartenderQueueList');
const emptyState = document.getElementById('emptyState');
const barQueueCount = document.getElementById('barQueueCount');

let queue = [];

function saveQueue() {
    // Firebase handles persistence
}

function serveOrder(id) {
    if (db) {
        db.ref(`orders/${id}`).update({ status: 'ready' });
    } else {
        // Local fallback
        queue = queue.map(item => item.id === id ? { ...item, status: 'ready' } : item);
        localStorage.setItem('drinkQueueLocal', JSON.stringify(queue));
        renderQueue();
    }
}

function clearOrder(id) {
    if (db) {
        db.ref(`orders/${id}`).remove();
    } else {
        // Local fallback
        queue = queue.filter(item => item.id !== id);
        localStorage.setItem('drinkQueueLocal', JSON.stringify(queue));
        renderQueue();
    }
}

function renderQueue() {
    console.log("Rendering Queue...", queue);
    queueList.innerHTML = '';
    const summaryDiv = document.getElementById('orderSummary');
    console.log("Summary Div found:", summaryDiv);

    if (summaryDiv) summaryDiv.innerHTML = '';

    // Safety check for the counter element
    const counterDisplay = document.getElementById('barQueueCount');
    console.log("Counter Display found:", counterDisplay);

    const pendingCount = queue.filter(item => item.status === 'pending').length;

    if (counterDisplay) {
        counterDisplay.textContent = `(${pendingCount})`;
    }

    if (queue.length === 0) {
        emptyState.classList.remove('hidden');
        if (summaryDiv) summaryDiv.style.display = 'none';
        emptyState.textContent = "No drinks in queue... Time for a break? 😴";
    } else {
        emptyState.classList.add('hidden');
        if (summaryDiv) summaryDiv.style.display = 'flex';

        // Calculate counts for PENDING only
        const counts = {};
        queue.forEach(item => {
            if (item.status === 'pending') {
                const drinkName = item.drink;
                counts[drinkName] = (counts[drinkName] || 0) + 1;
            }
        });

        // Render Summary
        if (summaryDiv) {
            // Add Total Header
            const totalHeader = document.createElement('div');
            totalHeader.style.width = '100%';
            totalHeader.style.textAlign = 'center';
            totalHeader.style.marginBottom = '10px';
            totalHeader.style.fontWeight = 'bold';
            totalHeader.style.color = '#d4a017'; // Dark Gold
            totalHeader.textContent = `Total Pending: ${pendingCount}`;
            summaryDiv.appendChild(totalHeader);

            Object.keys(counts).forEach(drink => {
                const tag = document.createElement('div');
                tag.className = 'summary-tag';
                tag.textContent = `${drink}: ${counts[drink]}`;
                summaryDiv.appendChild(tag);
            });
        }

        // Render List
        queue.forEach((item, index) => {
            const li = document.createElement('li');
            li.className = `queue-item ${item.status === 'ready' ? 'ready-item' : ''}`;
            if (item.status === 'ready') {
                li.style.opacity = '0.6';
                li.style.borderLeft = '6px solid var(--primary-color)';
            }

            const span = document.createElement('span');
            span.innerHTML = `<strong style="color:var(--primary-dark)">${item.name}</strong> wants a <br><span style="font-size:1.8rem">${item.drink}</span>`;

            const btnContainer = document.createElement('div');
            btnContainer.style.display = 'flex';
            btnContainer.style.gap = '10px';

            if (item.status === 'pending') {
                const serveBtn = document.createElement('button');
                serveBtn.className = 'complete-btn';
                serveBtn.textContent = 'Serve ✅';
                serveBtn.onclick = () => serveOrder(item.id);
                btnContainer.appendChild(serveBtn);
            } else {
                const clearBtn = document.createElement('button');
                clearBtn.className = 'secondary-btn';
                clearBtn.style.padding = '10px 20px';
                clearBtn.textContent = 'Clear 🗑️';
                clearBtn.onclick = () => clearOrder(item.id);
                btnContainer.appendChild(clearBtn);
            }

            li.appendChild(span);
            li.appendChild(btnContainer);
            queueList.appendChild(li);
        });
    }
}

// Listen for Firebase updates
if (db) {
    db.ref('orders').on('value', (snapshot) => {
        const data = snapshot.val();
        queue = [];
        if (data) {
            Object.keys(data).forEach(id => {
                const item = data[id];
                item.id = id;
                queue.push(item);
            });
            queue.sort((a, b) => a.timestamp - b.timestamp);
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

// Initial render called by Firebase listener
