/* ==========================================================
   ARRANGEMENT TASK — COMPLETE JAVASCRIPT LOGIC (2025)
   ========================================================== */

/* ---------- Helper functions ---------- */
function el(id) { return document.getElementById(id); }
function showMsg(text, ms = 1800) {
  const msg = el("floatingMsg");
  msg.textContent = text;
  msg.style.display = "block";
  clearTimeout(msg._t);
  msg._t = setTimeout(() => (msg.style.display = "none"), ms);
}

/* ---------- Participant/session info ---------- */
const subID = "participant01"; // fixed ID for online version
const condition = "1";
el("sessionInfo").textContent = `Sub: ${subID} • Condition: ${condition}`;

/* ---------- Stimulus configuration ---------- */
const baseStimFolder = "stimuli";
const sessionFolders = ["animal_session1", "animal_session2"];

// 🟡 Put your actual filenames here:
const names_session1 = [
  // 'wolf.png', 'husky.png', ...
];
const names_session2 = [
  // 'dog.png', 'cat.png', ...
];

let stimuliFiles = [];
(function buildStimList() {
  let id = 0;
  for (const f of names_session1) {
    stimuliFiles.push({ id: "s" + id++, name: f, src: `${baseStimFolder}/${sessionFolders[0]}/${f}` });
  }
  for (const f of names_session2) {
    stimuliFiles.push({ id: "s" + id++, name: f, src: `${baseStimFolder}/${sessionFolders[1]}/${f}` });
  }
  if (stimuliFiles.length === 0) {
    // fallback placeholders
    for (let i = 0; i < 6; i++) {
      stimuliFiles.push({
        id: "ph" + i,
        name: "placeholder_" + i,
        src: "https://via.placeholder.com/80?text=Img" + (i + 1),
      });
    }
    showMsg("⚠️ Using placeholder images. Edit the arrays in script to use your own.");
  }
})();

/* ---------- Constants ---------- */
const ARENA_SIZE = 680;
const STIM_SIZE = 80;
const LEFT_X_RANGE = [40, 260];
const LEFT_Y_RANGE = [120, 640];

/* ---------- DOM references ---------- */
const arena = el("arena");
const imagePool = el("imagePool");
const downloadBtn = el("downloadBtn");
const instructions = el("instructions");
const beginBtn = el("beginBtn");
const overlay = el("overlayScreen");
const overlayText = el("overlayText");
const continueBtn = el("continueBtn");

let elems = [];
let dragging = null;
let dragOffset = { x: 0, y: 0 };
let finished = false;

/* ---------- Utility ---------- */
function randIn(a, b) { return a + Math.random() * (b - a); }
function getArenaRect() { return arena.getBoundingClientRect(); }
function isInsideCircle(x, y) {
  const cx = ARENA_SIZE / 2;
  const cy = ARENA_SIZE / 2;
  const dx = x - cx, dy = y - cy;
  return dx * dx + dy * dy <= Math.pow(ARENA_SIZE / 2 - STIM_SIZE / 2, 2);
}

/* ---------- Create image elements ---------- */
function createStimuli() {
  const app = document.querySelector(".app").getBoundingClientRect();
  for (const stim of stimuliFiles) {
    const node = document.createElement("div");
    node.className = "stim";
    const img = document.createElement("img");
    img.src = stim.src;
    img.alt = stim.name;
    node.appendChild(img);
    document.body.appendChild(node);

    const item = {
      id: stim.id,
      name: stim.name,
      el: node,
      x: app.left + randIn(LEFT_X_RANGE[0], LEFT_X_RANGE[1]),
      y: app.top + randIn(LEFT_Y_RANGE[0], LEFT_Y_RANGE[1]),
      inArena: false,
    };
    node.style.position = "absolute";
    node.style.left = item.x + "px";
    node.style.top = item.y + "px";
    elems.push(item);
  }
}
createStimuli();

/* ---------- Smooth dragging ---------- */
document.addEventListener("pointerdown", (e) => {
  const target = e.target.closest(".stim");
  if (!target) return;
  e.preventDefault();
  dragging = elems.find((it) => it.el === target);
  const rect = target.getBoundingClientRect();
  dragOffset = { x: e.pageX - rect.left, y: e.pageY - rect.top };
  target.setPointerCapture(e.pointerId);
  target.style.transition = "none";
  target.style.zIndex = 1000;
});

document.addEventListener("pointermove", (e) => {
  if (!dragging) return;
  e.preventDefault();
  const node = dragging.el;
  const newX = e.pageX - dragOffset.x;
  const newY = e.pageY - dragOffset.y;
  node.style.left = newX + "px";
  node.style.top = newY + "px";
});

document.addEventListener("pointerup", (e) => {
  if (!dragging) return;
  const node = dragging.el;
  node.releasePointerCapture(e.pointerId);
  node.style.transition = "transform 0.1s ease-out";
  const rect = node.getBoundingClientRect();
  const arenaR = getArenaRect();
  const cx = rect.left + rect.width / 2 - arenaR.left;
  const cy = rect.top + rect.height / 2 - arenaR.top;

  if (isInsideCircle(cx, cy)) {
    node.style.left = arenaR.left + cx - rect.width / 2 + "px";
    node.style.top = arenaR.top + cy - rect.height / 2 + "px";
    dragging.inArena = true;
    dragging.arenaX = cx;
    dragging.arenaY = cy;
  } else {
    dragging.inArena = false;
  }
  dragging = null;
});

/* ---------- Check function ---------- */
function checkAllInside() {
  const arenaR = getArenaRect();
  for (const item of elems) {
    const rect = item.el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2 - arenaR.left;
    const cy = rect.top + rect.height / 2 - arenaR.top;
    if (!isInsideCircle(cx, cy)) return false;
  }
  return true;
}

/* ---------- CSV helpers ---------- */
function downloadBlob(text, name) {
  const blob = new Blob([text], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

/* ---------- Finish function ---------- */
function attemptFinish() {
  const arenaR = getArenaRect();
  const coordsRows = [["SubID", "Condition", "Image", "X", "Y"]];
  for (const item of elems) {
    const rect = item.el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2 - arenaR.left;
    const cy = rect.top + rect.height / 2 - arenaR.top;
    coordsRows.push([subID, condition, item.name, cx.toFixed(2), cy.toFixed(2)]);
  }
  const csv1 = coordsRows.map((r) => r.join(",")).join("\n");
  downloadBlob(csv1, `${subID}_coords_c${condition}.csv`);

  const distRows = [["Image1", "Image2", "Distance"]];
  for (let i = 0; i < elems.length; i++) {
    for (let j = i + 1; j < elems.length; j++) {
      const a = elems[i], b = elems[j];
      const dx = (a.arenaX || 0) - (b.arenaX || 0);
      const dy = (a.arenaY || 0) - (b.arenaY || 0);
      distRows.push([a.name, b.name, Math.sqrt(dx * dx + dy * dy).toFixed(2)]);
    }
  }
  const csv2 = distRows.map((r) => r.join(",")).join("\n");
  downloadBlob(csv2, `${subID}_pairwise_c${condition}.csv`);

  finished = true;
}

/* ---------- Overlay system ---------- */
let taskStage = "instructions"; // arranging, check, doublecheck, finish, done

function showOverlay(html, nextStage) {
  overlayText.innerHTML = html;
  overlay.style.display = "flex";
  continueBtn.onclick = () => {
    overlay.style.display = "none";
    taskStage = nextStage;
    if (nextStage === "arranging") showMsg("You can now drag and arrange images.");
  };
}

/* ---------- Keyboard control ---------- */
document.addEventListener("keydown", (e) => {
  if (taskStage === "arranging" && e.code === "Space") {
    e.preventDefault();
    if (checkAllInside()) {
      showOverlay(`
        ✅ All items are inside.<br><br>
        Please review your arrangement.<br><br>
        When ready, press <strong>F</strong> to return and adjust.
      `, "check");
    } else {
      showMsg("Some images are outside. Fix them and press Space again.");
    }
  } else if (taskStage === "check" && e.key.toLowerCase() === "f") {
    e.preventDefault();
    showOverlay(`
      🔁 Double-check your arrangement.<br><br>
      Adjust positions if necessary.<br><br>
      When ready, press <strong>Space</strong> again to confirm.
    `, "doublecheck");
  } else if (taskStage === "doublecheck" && e.code === "Space") {
    e.preventDefault();
    if (checkAllInside()) {
      showOverlay(`
        ✅ Final check complete.<br><br>
        Press <strong>Enter</strong> to finish and download your results.
      `, "finish");
    } else {
      showMsg("Some images are outside. Fix and press Space again.");
    }
  } else if (taskStage === "finish" && e.key === "Enter") {
    e.preventDefault();
    attemptFinish();
    showOverlay(`
      🎉 Task complete!<br><br>
      CSV files have been downloaded.<br><br>
      Thank you for participating!
    `, "done");
  }
});

/* ---------- Start experiment ---------- */
function startExperiment() {
  instructions.style.display = "none";
  showMsg("Experiment started. Drag images into the arena.");
  taskStage = "arranging";
}
beginBtn.addEventListener("click", startExperiment);
document.addEventListener("keydown", (e) => {
  if (e.code === "Space" && instructions.style.display !== "none") {
    e.preventDefault();
    startExperiment();
  }
});

window.addEventListener("load", () => {
  showMsg("Ready. Press Begin or Space to start.");
});
