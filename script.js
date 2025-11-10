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
// --- Dragging ---
function mouseDown(e) {
  e.preventDefault();
  activeCard = e.target.closest('.image');
  if (!activeCard) return;
  const rect = activeCard.getBoundingClientRect();
  startX = e.clientX - rect.left;
  startY = e.clientY - rect.top;
  activeCard.style.transform = "scale(1.1)";
  document.addEventListener('mousemove', mouseMove);
  document.addEventListener('mouseup', mouseUp);
}

function mouseMove(e) { e.preventDefault(); moveCard(e.clientX, e.clientY); }
function mouseUp(e) { endDrag(); }

function touchStart(e) {
  e.preventDefault();
  if (e.touches.length !== 1) return;
  activeCard = e.target.closest('.image');
  if (!activeCard) return;
  const rect = activeCard.getBoundingClientRect();
  startX = e.touches[0].clientX - rect.left;
  startY = e.touches[0].clientY - rect.top;
  activeCard.style.transform = "scale(1.1)";
  document.addEventListener('touchmove', touchMove, { passive: false });
  document.addEventListener('touchend', touchEnd);
}
function touchMove(e) { e.preventDefault(); moveCard(e.touches[0].clientX, e.touches[0].clientY); }
function touchEnd(e) { endDrag(); }

function moveCard(clientX, clientY) {
  if (!activeCard) return;
  const arenaRect = arena.getBoundingClientRect();
  const radius = arenaRect.width/2 - activeCard.offsetWidth/2;

  let x = clientX - startX - arenaRect.left + activeCard.offsetWidth/2;
  let y = clientY - startY - arenaRect.top + activeCard.offsetHeight/2;

  const dx = x - arenaRect.width/2;
  const dy = y - arenaRect.height/2;
  const dist = Math.sqrt(dx*dx + dy*dy);
  if (dist > radius) {
    const angle = Math.atan2(dy, dx);
    x = arenaRect.width/2 + radius*Math.cos(angle);
    y = arenaRect.height/2 + radius*Math.sin(angle);
  }

  activeCard.style.left = (x - activeCard.offsetWidth/2) + "px";
  activeCard.style.top = (y - activeCard.offsetHeight/2) + "px";
}

function endDrag() {
  if (!activeCard) return;
  activeCard.style.transform = "scale(1)";
  const key = activeCard.src.split("/").pop();
  const rect = activeCard.getBoundingClientRect();
  positions[key] = { x: rect.left, y: rect.top };
  activeCard = null;
  document.removeEventListener('mousemove', mouseMove);
  document.removeEventListener('mouseup', mouseUp);
  document.removeEventListener('touchmove', touchMove);
  document.removeEventListener('touchend', touchEnd);
}

// --- Keyboard Controls ---
document.addEventListener('keydown', e => {
  if (e.code === "Space" && instructions.classList.contains("screen")) {
    instructions.classList.add('hidden');
    taskScreen.classList.remove('hidden');
  } else if (e.code === "Enter" && !taskScreen.classList.contains("hidden")) {
    const allInside = checkAllInside();
    if (allInside) {
      taskScreen.classList.add('hidden');
      questions.classList.remove('hidden');
    } else {
      warningMessage.classList.remove('hidden');
    }
  }
});

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
