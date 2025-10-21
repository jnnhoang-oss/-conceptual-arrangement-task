// ==== Experiment Configuration ====
const NUM_PLACEHOLDERS = 6;
const PARTICIPANT_ID = prompt("Enter participant ID:");
const CONDITION = prompt("Enter condition (1, 2, or 3):");

// ==== Canvas Setup ====
const canvas = document.getElementById("arenaCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let placeholders = [];
let dragging = null;
let arenaVisible = true;
let arenaRadius = Math.min(canvas.width, canvas.height) * 0.4;
let arenaCenter = { x: canvas.width * 0.7, y: canvas.height / 2 };

// ==== Generate placeholders ====
for (let i = 0; i < NUM_PLACEHOLDERS; i++) {
  placeholders.push({
    label: `Image ${i + 1}`,
    color: `hsl(${i * 60}, 70%, 50%)`,
    x: Math.random() * canvas.width * 0.3 + 50,
    y: Math.random() * canvas.height * 0.8 + 50,
    size: 80
  });
}

// ==== Drawing Function ====
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (arenaVisible) {
    // Draw arena circle
    ctx.beginPath();
    ctx.arc(arenaCenter.x, arenaCenter.y, arenaRadius, 0, Math.PI * 2);
    ctx.fillStyle = "white";
    ctx.fill();

    // Draw instruction text
    ctx.fillStyle = "black";
    ctx.font = "20px Arial";
    ctx.fillText("Drag placeholders into the circle. Press SPACE when finished.", 50, 50);
  }

  // Draw placeholders (only if arena visible)
  if (arenaVisible) {
    for (const ph of placeholders) {
      ctx.fillStyle = ph.color;
      ctx.fillRect(ph.x - ph.size / 2, ph.y - ph.size / 2, ph.size, ph.size);

      ctx.fillStyle = "white";
      ctx.font = "16px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(ph.label, ph.x, ph.y);
    }
  }
}

// ==== Mouse Controls ====
canvas.addEventListener("mousedown", e => {
  if (!arenaVisible) return;
  const { offsetX, offsetY } = e;
  for (let i = placeholders.length - 1; i >= 0; i--) {
    const ph = placeholders[i];
    if (
      offsetX > ph.x - ph.size / 2 &&
      offsetX < ph.x + ph.size / 2 &&
      offsetY > ph.y - ph.size / 2 &&
      offsetY < ph.y + ph.size / 2
    ) {
      dragging = i;
      break;
    }
  }
});

canvas.addEventListener("mousemove", e => {
  if (dragging === null || !arenaVisible) return;
  placeholders[dragging].x = e.offsetX;
  placeholders[dragging].y = e.offsetY;
  draw();
});

canvas.addEventListener("mouseup", () => (dragging = null));

// ==== Spacebar to Start / End ====
document.addEventListener("keydown", e => {
  if (e.code === "Space" && document.getElementById("instruction-screen").style.display !== "none") {
    // Start task
    document.getElementById("instruction-screen").style.display = "none";
    document.getElementById("task-screen").classList.remove("hidden");
    draw();
  } else if (e.code === "Space" && arenaVisible) {
    // Finish task
    arenaVisible = false;
    draw();
    saveCSV();
    showEndMessage();
  }
});

// ==== Save Data ====
function saveCSV() {
  let csv = "ParticipantID,Condition,Placeholder,X,Y\n";
  for (const ph of placeholders) {
    csv += `${PARTICIPANT_ID},${CONDITION},${ph.label},${ph.x.toFixed(2)},${ph.y.toFixed(2)}\n`;
  }
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `arrangement_${PARTICIPANT_ID}_condition${CONDITION}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// ==== End Message ====
function showEndMessage() {
  const msg = document.createElement("div");
  msg.className = "fullscreen";
  msg.style.background = "#222";
  msg.style.color = "white";
  msg.style.fontSize = "2rem";
  msg.innerHTML = "Thank you! Your data has been saved.";
  document.body.appendChild(msg);
}

// ==== Initialize ====
draw();
