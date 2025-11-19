// ---------------- NEW FEATURES ADDED ----------------
// 1. Added fullscreen question (q0)
// 2. Added a small practice round using 1 image before the real task
// 3. Modified timer so it only counts arrangement time
// 4. Updated instructions so dragging is single-click drag only
// -----------------------------------------------------

const arenaContainer = document.getElementById("arenaContainer");
const arena = document.getElementById("arena");
const instructions = document.getElementById("instructions");
const questions = document.getElementById("questions");
const endScreen = document.getElementById("endScreen");
const totalTimeDisplay = document.getElementById("totalTime");
const warningMessage = document.getElementById("warningMessage");

let participantID = prompt("Enter Participant ID:") || "P1";
let startTime, timerInterval;
let fullscreenAnswer = "";
let attentionAnswer = "";
let deviceAnswer = "";
let positions = {};
let totalSeconds = 0;
let arenaVisible = false;
let isPractice = true; // NEW
let gsqsAnswers = [];
let currentGsqsIndex = 0;
let gsqsScore = 0;

// ---------------- GSQS ITEMS ----------------
const gsqsQuestions = [
  "1. I had a deep sleep last night",
  "2. I feel that I slept poorly last night",
  "3. It took me more than half an hour to fall asleep last night",
  "4. I woke up several times last night",
  "5. I felt tired after waking up this morning",
  "6. I feel that I didn't get enough sleep last night",
  "7. I got up in the middle of the night",
  "8. I felt rested after waking up this morning",
  "9. I feel that I only had a couple of hours' sleep last night",
  "10. I feel that I slept well last night",
  "11. I didn't sleep a wink last night",
  "12. I didn't have trouble falling asleep last night",
  "13. After I woke up last night, I had trouble falling asleep again",
  "14. I tossed and turned all night last night",
  "15. I didn't get more than 5 hours' sleep last night"
];

// ---------------- IMAGES ----------------
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
  "skunk.jpg","snail.jpg","starfish.jpg","tiger.jpg","turkey.jpg","waterbuffalo.jpg"
];

// ---------------- LOAD IMAGES ----------------
function loadImages(practice = false) {
  arenaContainer.innerHTML = ""; // clear previous

  if (practice) {
    const img = document.createElement("img");
    img.src = imageFolder + "mouse.jpg"; // practice image
    img.classList.add("image");
    img.style.left = "200px";
    img.style.top = "200px";
    arenaContainer.appendChild(img);
    return;
  }

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

// ---------------- DRAGGING (SIMPLE CLICK & DRAG ONLY) ----------------
let active = null, offsetX = 0, offsetY = 0;

function enableDragging() {
  const imgs = document.querySelectorAll(".image");

  imgs.forEach(img => {
    img.addEventListener("mousedown", e => {
      active = e.target;
      offsetX = e.offsetX;
      offsetY = e.offsetY;
    });
  });

  document.addEventListener("mousemove", e => {
    if (!active) return;
    const x = e.pageX - offsetX;
    const y = e.pageY - offsetY;
    active.style.left = `${x}px`;
    active.style.top = `${y}px`;
  });

  document.addEventListener("mouseup", () => {
    if (active) {
      const rect = active.getBoundingClientRect();
      const key = active.src.split("/").pop();
      positions[key] = { x: rect.left, y: rect.top };
      active = null;
    }
  });
}

// ---------------- TIMER ----------------
function startTimer() {
  startTime = new Date();
  timerInterval = setInterval(() => {
    totalSeconds = Math.floor((new Date() - startTime) / 1000);
    totalTimeDisplay.textContent = totalSeconds;
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
}

// ---------------- ARENA CHECK ----------------
function isInsideArena(img) {
  const imgRect = img.getBoundingClientRect();
  const arenaRect = arena.getBoundingClientRect();

  return (
    imgRect.left >= arenaRect.left &&
    imgRect.right <= arenaRect.right &&
    imgRect.top >= arenaRect.top &&
    imgRect.bottom <= arenaRect.bottom
  );
}

function allImagesInside() {
  return Array.from(document.querySelectorAll(".image")).every(isInsideArena);
}

// ---------------- SCORE CALC ----------------
function calculateGsqsScore() {
  gsqsScore = 0;

  for (let i = 1; i < gsqsAnswers.length; i++) {
    const qNum = i + 1;
    const answer = gsqsAnswers[i];

    if ([2,3,4,5,6,7,9,11,13,14,15].includes(qNum)) {
      if (answer === "Yes") gsqsScore++;
    } else {
      if (answer === "No") gsqsScore++;
    }
  }
}

// ---------------- SAVE CSV ----------------
function saveCSV() {
  let csv = "ParticipantID,Time,Fullscreen,Attention,Device,GSQSScore,Image,X,Y\n";

  for (let key in positions) {
    const p = positions[key];
    csv += `${participantID},${totalSeconds},${fullscreenAnswer},${attentionAnswer},${deviceAnswer},${gsqsScore},${key},${p.x},${p.y}\n`;
  }

  const blob = new Blob([csv], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `arrangement_${participantID}.csv`;
  a.click();
}

// ---------------- FLOW CONTROL ----------------
document.getElementById("beginBtn").addEventListener("click", () => showFullscreenQuestion());

function showFullscreenQuestion() {
  instructions.style.display = "none";
  document.getElementById("q0").style.display = "block";
}

// ---------------- START PRACTICE ----------------
function startPractice() {
  document.getElementById("q0").style.display = "none";
  arenaContainer.style.display = "block";
  loadImages(true);
  enableDragging();
  startTimer();
  arenaVisible = true;
}

// ---------------- START MAIN TASK ----------------
function startMainTask() {
  isPractice = false;
  positions = {}; // reset
  totalSeconds = 0;

  startTimer();
  loadImages(false);
  enableDragging();
}

// ---------------- END TASK (PRACTICE OR MAIN) ----------------
function endTask() {
  const imgs = document.querySelectorAll(".image");

  imgs.forEach(img => {
    const rect = img.getBoundingClientRect();
    const key = img.src.split("/").pop();
    positions[key] = { x: rect.left, y: rect.top };
  });

  if (!allImagesInside()) {
    warningMessage.style.display = "block";
    return;
  }

  warningMessage.style.display = "none";
  arenaContainer.style.display = "none";
  stopTimer();

  if (isPractice) {
    // Move to FULL instructions after practice
    document.getElementById("practiceComplete").style.display = "flex";
  } else {
    // Real task completed → questions
    questions.style.display = "flex";
  }
}

// ---------------- QUESTION LOGIC ----------------
function recordFullscreen(answer) {
  fullscreenAnswer = answer;
  document.getElementById("q0").style.display = "none";
  startPractice();
}

function recordAnswer(type, answer) {
  if (type === "attention") {
    attentionAnswer = answer;
    document.getElementById("q1").style.display = "none";
    document.getElementById("q2").style.display = "block";
  } else {
    deviceAnswer = answer;
    document.getElementById("q2").style.display = "none";
    gsqsAnswers = [];
    currentGsqsIndex = 0;
    showGsqsQuestion();
  }
}

function showGsqsQuestion() {
  if (currentGsqsIndex >= gsqsQuestions.length) {
    questions.style.display = "none";
    calculateGsqsScore();
    endScreen.style.display = "flex";
    saveCSV();
    return;
  }

  const q = gsqsQuestions[currentGsqsIndex];

  questions.innerHTML = `
    <div id="gsqs_q">
      <p>${q}</p>
      <button onclick="recordGsqs('Yes')">Yes</button>
      <button onclick="recordGsqs('No')">No</button>
    </div>
  `;
}

function recordGsqs(answer) {
  gsqsAnswers.push(answer);
  currentGsqsIndex++;
  showGsqsQuestion();
}
