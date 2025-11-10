const arenaContainer = document.getElementById("arenaContainer");
const arena = document.getElementById("arena");
const instructions = document.getElementById("instructions");
const questions = document.getElementById("questions");
const endScreen = document.getElementById("endScreen");
const totalTimeDisplay = document.getElementById("totalTime");
const warningMessage = document.getElementById("warningMessage");

let participantID = prompt("Enter Participant ID:") || "P1";
let startTime, timerInterval;
let attentionAnswer = "", deviceAnswer = "";
let positions = {};
let totalSeconds = 0;
let arenaVisible = false;

// Your image folder
const imageFolder = ".github/wth/";
const imageFiles = [
  "aardvark.jpg","anteater.jpg","brown_bear.jpg","camel.jpg","canary.jpg",
    "carp.jpg","caterpillarhawkmoth.jpg","catfish.jpg","chipmunk.jpg","cranebug.jpg",
    "cricket.jpg","elephantafrican.jpg","finch.jpg","firebug.jpg","flea.jpg",
    "gerbil.jpg","giraffe.jpg","goldfish.jpg","halibut.jpg","herculesbeetle.jpg",
    "herring.jpg","horse.jpg","hyena.jpg","leopard.jpg","llama.jpg","marmot.jpg",
    "mouse.jpg","ostrich.jpg","palmcockatoo.jpg","partridge.jpg","pelican.jpg",
    "perch.jpg","pigeon.jpg","pike.jpg","porcupine.jpg","prayingmantis.jpg",
    "rabbit.jpg","reindeer.jpg","salmon.jpg","shark.jpg","sheep.jpg","shrimp.jpg",
    "skunk.jpg","snail.jpg","starfish.jpg","tiger.jpg","turkey.jpg","turkey copy.jpg","waterbuffalo.jpg"
];

// --- Load and display images ---
function loadImages() {
  imageFiles.forEach(file => {
    const img = document.createElement("img");
    img.src = imageFolder + file;
    img.alt = file;
    img.classList.add("image");

    const x = Math.random() * (window.innerWidth * 0.4 - 60);
    const y = Math.random() * (window.innerHeight - 80);
    img.style.left = `${x}px`;
    img.style.top = `${y}px`;

    arenaContainer.appendChild(img);
  });
}

// --- Dragging ---
function initializeDragging() {
  const cards = document.querySelectorAll('.image');
  cards.forEach(card => {
    card.addEventListener('mousedown', mouseDown);
    card.addEventListener('touchstart', touchStart, { passive: false });
  });
}

// Global variables
let activeCard = null;
let startX, startY;

// Mouse Down Handler
function mouseDown(e) {
  e.preventDefault();
  activeCard = e.target.closest('.image'); // Ensure we grab the card element
  if (!activeCard) return;
  startX = e.clientX - activeCard.getBoundingClientRect().left;
  startY = e.clientY - activeCard.getBoundingClientRect().top;
  document.addEventListener('mousemove', mouseMove);
  document.addEventListener('mouseup', mouseUp);
}

// Mouse Move Handler
function mouseMove(e) {
  e.preventDefault();
  if (!activeCard) return;
  let newX = e.clientX - startX;
  let newY = e.clientY - startY;

  // Optional Bounds Checking (e.g., within parent container or arena)
  const parent = activeCard.parentElement.getBoundingClientRect();
  newX = Math.max(0, Math.min(newX, parent.width - activeCard.offsetWidth));
  newY = Math.max(0, Math.min(newY, parent.height - activeCard.offsetHeight));

  activeCard.style.left = newX + 'px';
  activeCard.style.top = newY + 'px';
}

// Mouse Up Handler
function mouseUp(e) {
  activeCard = null;
  document.removeEventListener('mousemove', mouseMove);
  document.removeEventListener('mouseup', mouseUp);
}

// Touch Start Handler
function touchStart(e) {
  e.preventDefault();
  if (e.touches.length !== 1) return;
  activeCard = e.target.closest('.card');
  if (!activeCard) return;
  startX = e.touches[0].clientX - activeCard.getBoundingClientRect().left;
  startY = e.touches[0].clientY - activeCard.getBoundingClientRect().top;
  document.addEventListener('touchmove', touchMove, { passive: false });
  document.addEventListener('touchend', touchEnd);
}

// Touch Move Handler
function touchMove(e) {
  e.preventDefault();
  if (!activeCard || e.touches.length !== 1) return;
  let newX = e.touches[0].clientX - startX;
  let newY = e.touches[0].clientY - startY;

  // Optional Bounds Checking
  const parent = activeCard.parentElement.getBoundingClientRect();
  newX = Math.max(0, Math.min(newX, parent.width - activeCard.offsetWidth));
  newY = Math.max(0, Math.min(newY, parent.height - activeCard.offsetHeight));

  activeCard.style.left = newX + 'px';
  activeCard.style.top = newY + 'px';
}

// Touch End Handler
function touchEnd(e) {
  activeCard = null;
  document.removeEventListener('touchmove', touchMove);
  document.removeEventListener('touchend', touchEnd);
}

// Initialize dragging on page load
window.addEventListener('load', initializeDragging);

// --- Timer ---
function startTimer() {
  startTime = new Date();
  timerInterval = setInterval(() => {
    totalSeconds = Math.floor((new Date() - startTime) / 1000);
    totalTimeDisplay.textContent = totalSeconds;
  }, 1000);
}

// --- Check inside arena ---
function isInsideArena(img) {
  const arenaRect = arena.getBoundingClientRect();
  const centerX = arenaRect.left + arenaRect.width / 2;
  const centerY = arenaRect.top + arenaRect.height / 2;
  const radius = arenaRect.width / 2;

  const imgRect = img.getBoundingClientRect();
  const imgCenterX = imgRect.left + imgRect.width / 2;
  const imgCenterY = imgRect.top + imgRect.height / 2;

  const dx = imgCenterX - centerX;
  const dy = imgCenterY - centerY;
  return Math.sqrt(dx * dx + dy * dy) + imgRect.width / 2 < radius;
}

function allImagesInside() {
  return Array.from(document.querySelectorAll(".image")).every(isInsideArena);
}

// --- Save CSV ---
function saveCSV() {
  let csv = "ParticipantID,Time,Attention,Device,Image,X,Y\n";
  for (let key in positions) {
    const p = positions[key];
    csv += `${participantID},${totalSeconds},${attentionAnswer},${deviceAnswer},${key},${p.x},${p.y}\n`;
  }
  const blob = new Blob([csv], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `arrangement_${participantID}.csv`;
  a.click();
}

// --- Flow control ---
document.getElementById("beginBtn").addEventListener("click", startTask);
document.addEventListener("keydown", e => {
  if (e.code === "Space" && !arenaVisible) startTask();
  else if (e.code === "Enter" && arenaVisible) endTask();
});

function startTask() {
  instructions.style.display = "none";
  arenaContainer.style.display = "block";
  loadImages();
  enableDragging();
  startTimer();
  arenaVisible = true;
}

function endTask() {
  const imgs = document.querySelectorAll(".image");
  imgs.forEach(img => {
    const rect = img.getBoundingClientRect();
    const key = img.src.split("/").pop();
    positions[key] = { x: rect.left, y: rect.top };
  });

  if (allImagesInside()) {
    warningMessage.style.display = "none";
    arenaContainer.style.display = "none";
    clearInterval(timerInterval);
    questions.style.display = "flex";
  } else {
    warningMessage.style.display = "block";
  }
}

// --- Question logic ---
function recordAnswer(type, answer) {
  if (type === "attention") {
    attentionAnswer = answer;
    document.getElementById("q1").style.display = "none";
    document.getElementById("q2").style.display = "block";
  } else {
    deviceAnswer = answer;
    questions.style.display = "none";
    endScreen.style.display = "flex";
    saveCSV();
  }
}
