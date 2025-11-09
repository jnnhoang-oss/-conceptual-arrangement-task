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
const imageList = [
  "images/apple.png",
  "images/banana.png",
  "images/car.png",
  "images/bike.png",
  "images/cat.png",
  "images/dog.png"
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

// ---------------------- STAGE CONTROL ----------------------
document.addEventListener("keydown", (e) => {
  if (stage === "arranging" && e.code === "Space") {
    if (checkAllInside()) {
      stage = "check";
      showOverlay("All images inside the circle. Press F to double-check.");
    } else {
      showWarning("⚠ Please move all images inside the arena before continuing.");
    }
  } else if (stage === "check" && e.key.toLowerCase() === "f") {
    stage = "doublecheck";
    hideOverlay();
    showArenaText("Double-check your arrangement. Press SPACE to confirm.");
  } else if (stage === "doublecheck" && e.code === "Space") {
    if (checkAllInside()) {
      stage = "finish";
      showOverlay("All items verified! Press ENTER to finish and save.");
    } else {
      showWarning("⚠ Some images are still outside the circle.");
    }
  } else if (stage === "finish" && e.code === "Enter") {
    saveData();
  }
});

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
