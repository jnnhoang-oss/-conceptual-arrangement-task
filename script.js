// 1. CONFIGURATION & CONSTANTS
const CONFIG = {
    IMAGE_FOLDER: ".github/wth/",
    PRACTICE_DURATION: 30, // seconds
    IMAGE_SIZE: { width: 50, height: 50 }
};

const IMAGE_FILES = [
    "aardvark.jpg", "anteater.jpg", "brown_bear.jpg", "camel.jpg", "canary.jpg",
    // ... rest of your image files
];

// 2. DOM ELEMENT REFERENCES
const DOM = {
    arenaContainer: document.getElementById("arenaContainer"),
    arena: document.getElementById("arena"),
    instructions: document.getElementById("instructions"),
    questions: document.getElementById("questions"),
    endScreen: document.getElementById("endScreen"),
    totalTimeDisplay: document.getElementById("totalTime"),
    warningMessage: document.getElementById("warningMessage"),
    beginBtn: document.getElementById("beginBtn")
};

// 3. STATE MANAGEMENT
const STATE = {
    participantID: "",
    isInPracticeMode: true,
    isArenaVisible: false,
    currentDraggedElement: null,
    positions: {},
    startTime: null,
    elapsedTime: 0,
    attentionAnswer: "",
    deviceAnswer: "",
    gsqsAnswers: [],
    gsqsScore: 0
};

// 4. INITIALIZATION
function initializeExperiment() {
    STATE.participantID = prompt("Enter Participant ID:") || `P${Math.floor(Math.random() * 1000)}`;
    
    // Bind event listeners
    DOM.beginBtn.addEventListener("click", startPracticeRound);
    document.addEventListener("keydown", handleKeyboardEvents);
}

// 5. PRACTICE ROUND MANAGEMENT
function startPracticeRound() {
    // Hide instructions, show arena
    DOM.instructions.style.display = "none";
    DOM.arenaContainer.style.display = "block";
    
    // Select a single random image for practice
    const practiceImage = selectRandomImage();
    createPracticeImage(practiceImage);
    
    // Setup dragging for practice image
    setupDragging();
    
    // Start timer
    startTimer();
    STATE.isArenaVisible = true;
    
    // Set timeout for practice round
    setTimeout(endPracticeRound, CONFIG.PRACTICE_DURATION * 1000);
}

function selectRandomImage() {
    return IMAGE_FILES[Math.floor(Math.random() * IMAGE_FILES.length)];
}

function createPracticeImage(imageName) {
    const img = document.createElement("img");
    img.src = `${CONFIG.IMAGE_FOLDER}${imageName}`;
    img.alt = imageName;
    img.classList.add("image");
    
    // Position image in center of screen
    img.style.left = `${window.innerWidth / 2 - CONFIG.IMAGE_SIZE.width / 2}px`;
    img.style.top = `${window.innerHeight / 2 - CONFIG.IMAGE_SIZE.height / 2}px`;
    
    DOM.arenaContainer.appendChild(img);
}

function endPracticeRound() {
    STATE.isInPracticeMode = false;
    
    // Clear practice image and start main task
    DOM.arenaContainer.innerHTML = '';
    startMainTask();
}

// 6. MAIN TASK MANAGEMENT
function startMainTask() {
    loadImages();
    setupDragging();
    startTimer();
    STATE.isArenaVisible = true;
}

function loadImages() {
    IMAGE_FILES.forEach(file => {
        const img = document.createElement("img");
        img.src = `${CONFIG.IMAGE_FOLDER}${file}`;
        img.alt = file;
        img.classList.add("image");
        
        // Randomize initial image positions
        const x = Math.random() * (window.innerWidth * 0.4 - 60);
        const y = Math.random() * (window.innerHeight - 80);
        
        img.style.left = `${x}px`;
        img.style.top = `${y}px`;
        
        DOM.arenaContainer.appendChild(img);
    });
}

// 7. ADVANCED DRAGGING SYSTEM
function setupDragging() {
    const images = document.querySelectorAll(".image");
    
    images.forEach(image => {
        image.addEventListener("mousedown", startDrag);
    });
    
    document.addEventListener("mousemove", drag);
    document.addEventListener("mouseup", stopDrag);
}

function startDrag(e) {
    STATE.currentDraggedElement = e.target;
    
    // Calculate offset to maintain cursor position relative to image
    const rect = e.target.getBoundingClientRect();
    STATE.offsetX = e.clientX - rect.left;
    STATE.offsetY = e.clientY - rect.top;
}

function drag(e) {
    if (!STATE.currentDraggedElement) return;
    
    const x = e.pageX - STATE.offsetX;
    const y = e.pageY - STATE.offsetY;
    
    STATE.currentDraggedElement.style.left = `${x}px`;
    STATE.currentDraggedElement.style.top = `${y}px`;
}

function stopDrag() {
    if (STATE.currentDraggedElement) {
        const img = STATE.currentDraggedElement;
        const rect = img.getBoundingClientRect();
        
        STATE.positions[img.src.split("/").pop()] = {
            x: rect.left,
            y: rect.top
        };
        
        STATE.currentDraggedElement = null;
    }
}

// 8. TIMER MANAGEMENT
function startTimer() {
    STATE.startTime = new Date();
    
    setInterval(() => {
        STATE.elapsedTime = Math.floor((new Date() - STATE.startTime) / 1000);
        DOM.totalTimeDisplay.textContent = STATE.elapsedTime;
    }, 1000);
}

// 9. EVENT HANDLERS
function handleKeyboardEvents(e) {
    if (e.code === "Space" && !STATE.isArenaVisible) {
        startMainTask();
    } else if (e.code === "Enter" && STATE.isArenaVisible) {
        endTask();
    }
}

function endTask() {
    if (checkAllImagesInArena()) {
        DOM.warningMessage.style.display = "none";
        DOM.arenaContainer.style.display = "none";
        DOM.questions.style.display = "flex";
    } else {
        DOM.warningMessage.style.display = "block";
    }
}

function checkAllImagesInArena() {
    const images = document.querySelectorAll(".image");
    return Array.from(images).every(isImageInArena);
}

function isImageInArena(img) {
    const arenaRect = DOM.arena.getBoundingClientRect();
    const imgRect = img.getBoundingClientRect();
    
    const arenaCenter = {
        x: arenaRect.left + arenaRect.width / 2,
        y: arenaRect.top + arenaRect.height / 2
    };
    
    const imgCenter = {
        x: imgRect.left + imgRect.width / 2,
        y: imgRect.top + imgRect.height / 2
    };
    
    const distance = Math.sqrt(
        Math.pow(imgCenter.x - arenaCenter.x, 2) +
        Math.pow(imgCenter.y - arenaCenter.y, 2)
    );
    
    return distance < arenaRect.width / 2;
}

// 10. INITIALIZATION CALL
initializeExperiment();
