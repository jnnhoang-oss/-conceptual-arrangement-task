// --- Elements (ensure these IDs exist in your HTML) ---
const arenaContainer = document.getElementById("arenaContainer");
const arena = document.getElementById("arena");
const instructions = document.getElementById("instructions");
const screenQuestion = document.getElementById("screenQuestion"); // fixed: was missing
const pracInstructions = document.getElementById("pracInstructions");
const questions = document.getElementById("questions");
const endScreen = document.getElementById("endScreen");
const totalTimeDisplay = document.getElementById("totalTime");
const warningMessage = document.getElementById("warningMessage");

let participantID = prompt("Enter Participant ID:") || "P1";
let startTime, timerInterval;
let attentionAnswer = "", deviceAnswer = "";
let fullscreenAnswer = "";
let sleepAnswers = {};
let positions = {};
let totalSeconds = 0;
let arenaVisible = false;
let isPrac = false;

// image folder and lists
const imageFolder = ".github/wth;
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

const pracImage = ["herring.jpg","horse.jpg","hyena.jpg"];

// ---------- Load images ----------
function loadImages() {
  const imagesToLoad = isPrac ? pracImage : imageFiles;

  // remove previous images
  document.querySelectorAll(".image").forEach(img => img.remove());
  positions = {}; // clear positions for the new round

  imagesToLoad.forEach((file) => {
    const img = document.createElement("img");
    img.src = imageFolder + file;
    img.alt = file;
    img.className = "image";

    // position using transform so we can use GPU-accelerated translations
    const x = Math.round(Math.random() * (window.innerWidth * 0.4 - 60));
    const y = Math.round(Math.random() * (window.innerHeight - 160)); // leave room for UI
    img.style.position = "fixed";           // fixed so transforms correspond to viewport coords
    img.style.left = "0px";                 // we'll use transform for final placement
    img.style.top = "0px";
    img.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    img.dataset.staticX = x; // store initial for debugging if needed
    img.dataset.staticY = y;

    document.body.appendChild(img); // append to body so it's above other layout
  });

  // enable pointer dragging on the newly created images
  enableDragging();
}

// ---------- Fast & accurate dragging (pointer events) ----------
let activeImg = null;
let grabOffsetX = 0;
let grabOffsetY = 0;

function enableDragging() {
  // Remove existing pointer handlers first to avoid duplicates
  document.querySelectorAll(".image").forEach(img => {
    img.onpointerdown = null;
    img.onpointermove = null;
    img.onpointerup = null;
    img.onpointercancel = null;
  });

  // pointerdown on images
  document.querySelectorAll(".image").forEach(img => {
    img.addEventListener("pointerdown", (ev) => {
      ev.preventDefault();
      // bring to front
      img.style.zIndex = 9999;

      activeImg = img;
      const rect = img.getBoundingClientRect();

      // compute offset between pointer and image top-left
      grabOffsetX = ev.clientX - rect.left;
      grabOffsetY = ev.clientY - rect.top;

      // capture pointer so we receive moves outside the element
      img.setPointerCapture(ev.pointerId);

      // visual feedback
      img.style.transition = "transform 0.05s linear";
      img.style.transform += " scale(1.08)"; // slight pop (we'll overwrite transform next)
    });
  });

  // pointermove on document
  document.addEventListener("pointermove", (ev) => {
    if (!activeImg) return;
    ev.preventDefault();

    // calculate new absolute top-left position
    const newX = ev.clientX - grabOffsetX;
    const newY = ev.clientY - grabOffsetY;

    // set transform directly to absolute coordinates (position fixed => viewport coords)
    activeImg.style.transform = `translate3d(${newX}px, ${newY}px, 0)`;
  }, { passive: false });

  // pointerup / pointercancel
  document.addEventListener("pointerup", finishPointerDrag);
  document.addEventListener("pointercancel", finishPointerDrag);

  function finishPointerDrag(ev) {
    if (!activeImg) return;

    try { activeImg.releasePointerCapture && activeImg.releasePointerCapture(ev && ev.pointerId); } catch (e) { /* ignore */ }

    // finalize position: get bounding rect as final coordinates
    const rect = activeImg.getBoundingClientRect();
    const key = activeImg.src.split("/").pop();
    positions[key] = { x: Math.round(rect.left), y: Math.round(rect.top) };

    // reset visuals
    activeImg.style.transition = "";
    activeImg.style.zIndex = "";
    // ensure transform matches final coords (sometimes transform has scale appended)
    activeImg.style.transform = `translate3d(${positions[key].x}px, ${positions[key].y}px, 0)`;

    activeImg = null;
  }
}

// ---------- Arena checks ----------
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
  // For practice we might require same rule; keep consistent
  const imgs = document.querySelectorAll(".image");
  if (imgs.length === 0) return false;
  return Array.from(imgs).every(isInsideArena);
}

// ---------- Timer ----------
function startTimer() {
  clearInterval(timerInterval);
  startTime = Date.now();
  totalSeconds = 0;
  totalTimeDisplay.textContent = "0";
  timerInterval = setInterval(() => {
    totalSeconds = Math.floor((Date.now() - startTime) / 1000);
    totalTimeDisplay.textContent = totalSeconds;
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
}

// ---------- CSV Saving ----------
function saveCSV() {
  const createdAt = new Date().toLocaleString("en-US", { timeZone: "America/New_York" });
  let csv = `created_at,${createdAt}\n`;
  csv += "ParticipantID,Time,Fullscreen,Attention,Device,Image,X,Y";
  for (let i = 1; i <= 15; i++) csv += `,GSQS_Q${i}`;
  csv += ",GSQS_Total\n";

  // compute GSQS total according to your earlier logic (Yes count)
  let gsqsTotal = 0;
  for (let i = 1; i <= 15; i++) if (sleepAnswers[i] === "Yes") gsqsTotal++;

  // add one row per image
  for (let key in positions) {
    const p = positions[key];
    csv += `${participantID},${totalSeconds},${fullscreenAnswer},${attentionAnswer},${deviceAnswer},${key},${p.x},${p.y}`;
    for (let i = 1; i <= 15; i++) csv += `,${sleepAnswers[i] || ""}`;
    csv += `,${gsqsTotal}\n`;
  }

  const blob = new Blob([csv], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `arrangement_${participantID}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

// ---------- Flow control ----------
document.getElementById("beginBtn").addEventListener("click", showscreenQuestion);
document.addEventListener("keydown", e => {
  if (e.code === "Space" && !arenaVisible) {
    if (instructions.style.display !== "none") showscreenQuestion();
  } else if (e.code === "Enter" && arenaVisible) {
    endTask();
  }
});

function showscreenQuestion() {
  instructions.classList.remove("visible");
  instructions.style.display = "none";
  screenQuestion.classList.add("visible");
  screenQuestion.style.display = "flex";
}

function recordFullscreenAnswer(answer) {
  fullscreenAnswer = answer;
  screenQuestion.classList.remove("visible");
  screenQuestion.style.display = "none";
  pracInstructions.classList.add("visible");
  pracInstructions.style.display = "flex";
}

function beginPractice() {
  // hide practice instructions
  pracInstructions.classList.remove("visible");
  pracInstructions.style.display = "none";

  // enable practice mode and start after tiny delay to ensure layout settles
  isPrac = true;
  setTimeout(() => startTask(), 100);
}

function startTask() {
  // show arena
  arenaContainer.classList.add("visible");
  arenaContainer.style.display = "block";

  // clear any existing images & positions
  document.querySelectorAll(".image").forEach(img => img.remove());
  positions = {};

  // load images (practice/main determined by isPrac)
  loadImages();

  // start timer
  startTimer();
  arenaVisible = true;
}

function endTask() {
  // gather final positions of images
  document.querySelectorAll(".image").forEach(img => {
    const rect = img.getBoundingClientRect();
    const key = img.src.split("/").pop();
    positions[key] = { x: Math.round(rect.left), y: Math.round(rect.top) };
  });

  // require all inside
  if (!allImagesInside()) {
    warningMessage.style.display = "block";
    return;
  }

  // pass check
  warningMessage.style.display = "none";
  arenaVisible = false;
  stopTimer();

  if (isPrac) {
    // practice end -> start main
    isPrac = false;
    // hide arena
    arenaContainer.style.display = "none";
    alert("Practice complete! Press OK to begin the actual arrangement task.");
    // small delay to avoid first-drag offset bugs
    setTimeout(() => startTask(), 120);
    return;
  }

  // actual task end -> questions
  arenaContainer.classList.remove("visible");
  arenaContainer.style.display = "none";
  questions.classList.add("visible");
  questions.style.display = "flex";
}

// ---------- Questions logic ----------
function recordAnswer(type, answer) {
  if (type === "attention") {
    attentionAnswer = answer;
    document.getElementById("q1").style.display = "none";
    document.getElementById("q2").style.display = "block";
  } else if (type === "device") {
    deviceAnswer = answer;
    document.getElementById("q2").style.display = "none";
    showSleepQuestionnaire();
  }
}

// ---------- GSQS questionnaire ----------
const gsqsQuestions = [
  "I had a deep sleep last night",
  "I feel that I slept poorly last night",
  "It took me more than half an hour to fall asleep last night",
  "I woke up several times last night",
  "I felt tired after waking up this morning",
  "I feel that I didn't get enough sleep last night",
  "I got up in the middle of the night",
  "I felt rested after waking up this morning",
  "I feel that I only had a couple of hours' sleep last night",
  "I feel that I slept well last night",
  "I didn't sleep a wink last night",
  "I didn't have trouble falling asleep last night",
  "After I woke up last night, I had trouble falling asleep again",
  "I tossed and turned all night last night",
  "I didn't get more than 5 hours' sleep last night"
];

function showSleepQuestionnaire() {
  // clear questions container
  questions.innerHTML = "";
  let index = 0;

  // create UI for first question
  const qDiv = document.createElement("div");
  qDiv.className = "question";

  const qText = document.createElement("h2");
  qText.textContent = gsqsQuestions[index];
  qDiv.appendChild(qText);

  const yesBtn = document.createElement("button");
  const noBtn = document.createElement("button");
  yesBtn.textContent = "Yes";
  noBtn.textContent = "No";

  yesBtn.onclick = () => nextGSQS("Yes");
  noBtn.onclick = () => nextGSQS("No");

  qDiv.appendChild(yesBtn);
  qDiv.appendChild(noBtn);
  questions.appendChild(qDiv);
  questions.style.display = "flex";

  function nextGSQS(answer) {
    sleepAnswers[index + 1] = answer;
    index++;
    if (index < gsqsQuestions.length) {
      qText.textContent = gsqsQuestions[index];
    } else {
      // finished all GSQS questions
      questions.style.display = "none";
      endScreen.style.display = "flex";
      saveCSV();
    }
  }
}

// ---------- End of script ----------
