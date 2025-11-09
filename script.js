const beginBtn = document.getElementById("beginBtn");
const instructions = document.getElementById("instructions");
const arena = document.getElementById("arena");
const warningMessage = document.getElementById("warningMessage");
const arenaText = document.getElementById("arenaText");

let stage = "instructions"; // stages: instructions → arranging → check → doublecheck → finish
let elements = [];
let startTime = null;
let timerInterval;

// ---------------------- IMAGE LIST ----------------------
// ⚠️ Put your image paths here
  const basePath = ".github/wth/";

  const imageNames = [
    "aardvark.jpg","anteater.jpg","brown_bear.jpg","camel.jpg","canary.jpg","carp.jpg",
    "caterpillarhawkmoth.jpg","catfish.jpg","chipmunk.jpg","cranebug.jpg","cricket.jpg",
    "elephantafrican.jpg","finch.jpg","firebug.jpg","flea.jpg","gerbil.jpg","giraffe.jpg",
    "goldfish.jpg","halibut.jpg","herculesbeetle.jpg","herring.jpg","horse.jpg","hyena.jpg",
    "leopard.jpg","llama.jpg","marmot.jpg","mouse.jpg","ostrich.jpg","palmcockatoo.jpg",
    "partridge.jpg","pelican.jpg","perch.jpg","pigeon.jpg","pike.jpg","porcupine.jpg",
    "prayingmantis.jpg","rabbit.jpg","reindeer.jpg","salmon.jpg","shark.jpg","sheep.jpg",
    "shrimp.jpg","skunk.jpg","snail.jpg","starfish.jpg","tiger.jpg","turkey.jpg","turkey copy.jpg", "waterbuffalo.jpg"
  ];


// ---------------------- INITIAL SETUP ----------------------
beginBtn.addEventListener("click", startExperiment);
document.addEventListener("keydown", (e) => {
  if (stage === "instructions" && e.code === "Space") startExperiment();
});

// ---------------------- START EXPERIMENT ----------------------
function startExperiment() {
  instructions.style.display = "none";
  stage = "arranging";
  startTime = Date.now();
  timerInterval = setInterval(updateTimer, 1000);
  loadImages();
  showArenaText("Click and drag images. Press SPACE to check when finished.");
}

// ---------------------- LOAD IMAGES ----------------------
function loadImages() {
  imageList.forEach(src => {
    const img = document.createElement("img");
    img.src = src;
    img.className = "draggable";
    img.style.position = "absolute";
    img.style.left = Math.random() * 150 + "px"; // random start position (left panel zone)
    img.style.top = Math.random() * 500 + "px";
    document.body.appendChild(img);
    makeDraggable(img);
    elements.push(img);
  });
}

// ---------------------- DRAGGING LOGIC ----------------------
function makeDraggable(el) {
  let offsetX, offsetY, isDragging = false;

  el.addEventListener("mousedown", startDrag);
  el.addEventListener("touchstart", startDrag, { passive: false });

  function startDrag(e) {
    e.preventDefault();
    isDragging = true;
    const rect = el.getBoundingClientRect();
    const mouseX = e.touches ? e.touches[0].clientX : e.clientX;
    const mouseY = e.touches ? e.touches[0].clientY : e.clientY;
    offsetX = mouseX - rect.left;
    offsetY = mouseY - rect.top;

    document.addEventListener("mousemove", drag);
    document.addEventListener("mouseup", stopDrag);
    document.addEventListener("touchmove", drag, { passive: false });
    document.addEventListener("touchend", stopDrag);
  }

  function drag(e) {
    if (!isDragging) return;
    const mouseX = e.touches ? e.touches[0].clientX : e.clientX;
    const mouseY = e.touches ? e.touches[0].clientY : e.clientY;
    el.style.left = mouseX - offsetX + "px";
    el.style.top = mouseY - offsetY + "px";
  }

  function stopDrag() {
    isDragging = false;
    document.removeEventListener("mousemove", drag);
    document.removeEventListener("mouseup", stopDrag);
    document.removeEventListener("touchmove", drag);
    document.removeEventListener("touchend", stopDrag);
  }
}

// ---------------------- TIMER ----------------------
function updateTimer() {
  const totalTime = Math.floor((Date.now() - startTime) / 1000);
  document.getElementById("totalTime").textContent = totalTime;
}

// ---------------------- CHECK FUNCTION ----------------------
function checkAllInside() {
  const rect = arena.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  const radius = rect.width / 2;
  let allInside = true;

  elements.forEach(img => {
    const r = img.getBoundingClientRect();
    const x = r.left + r.width / 2;
    const y = r.top + r.height / 2;
    const dx = x - centerX;
    const dy = y - centerY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > radius) allInside = false;
  });
  return allInside;
}

 // --- Record answers ---
  function recordAnswer(type, answer) {
    if (type === "attention") {
      attentionAnswer = answer;
      document.getElementById("q1").style.display = "none";
      document.getElementById("q2").style.display = "block";
    } else {
      deviceAnswer = answer;
      questions.classList.remove("visible");
      saveCSV();
      endScreen.classList.add("visible");
    }
  }

// ---------------------- VISUAL FEEDBACK ----------------------
function showWarning(text) {
  warningMessage.textContent = text;
  warningMessage.style.display = "block";
  setTimeout(() => (warningMessage.style.display = "none"), 2500);
}

function showArenaText(text) {
  arenaText.textContent = text;
  arenaText.style.display = "block";
}

function showOverlay(text) {
  const overlay = document.createElement("div");
  overlay.id = "overlay";
  overlay.style.position = "fixed";
  overlay.style.inset = 0;
  overlay.style.background = "rgba(255,255,255,0.96)";
  overlay.style.display = "flex";
  overlay.style.alignItems = "center";
  overlay.style.justifyContent = "center";
  overlay.style.flexDirection = "column";
  overlay.style.zIndex = "200";
  overlay.innerHTML = `<div style='max-width:700px;text-align:center;font-size:22px;'>${text}</div>`;
  document.body.appendChild(overlay);
}

function hideOverlay() {
  const overlay = document.getElementById("overlay");
  if (overlay) overlay.remove();
}

// ---------------------- SAVE CSV ----------------------
function saveData() {
  const rect = arena.getBoundingClientRect();
  const data = elements.map(img => {
    const r = img.getBoundingClientRect();
    return {
      file: img.src.split("/").pop(),
      x: (r.left + r.width / 2 - rect.left).toFixed(2),
      y: (r.top + r.height / 2 - rect.top).toFixed(2)
    };
  });

  let csv = "image,x,y\n" + data.map(d => `${d.file},${d.x},${d.y}`).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "arrangement_data.csv";
  a.click();
  URL.revokeObjectURL(url);

  showOverlay("✅ Thank you! Your data has been saved.");
  clearInterval(timerInterval);
}
