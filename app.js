const PLLS = [
  { name: "Aa", type: "A Perm", alg: "x R' U R' D2 R U' R' D2 R2 x'", img: "A1.gif" },
  { name: "Ab", type: "A Perm", alg: "x R2 D2 R U R' D2 R U' R x'", img: "A.gif" },
  { name: "E", type: "E Perm", alg: "x' R U' R' D R U R' D' R U R' D R U' R' D' x", img: "E.gif" },
  { name: "F", type: "F Perm", alg: "R' U' F' R U R' U' R' F R2 U' R' U' R U R' U R", img: "F.gif" },
  { name: "Ga", type: "G Perm", alg: "R2 U R' U R' U' R U' R2 D U' R' U R D'", img: "G1.gif" },
  { name: "Gb", type: "G Perm", alg: "R' U' R U D' R2 U R' U R U' R U' R2 D", img: "G.gif" },
  { name: "Gc", type: "G Perm", alg: "R2 U' R U' R U R' U R2 D' U R U' R' D", img: "G3.gif" },
  { name: "Gd", type: "G Perm", alg: "R U R' U' D R2 U' R U' R' U R' U R2 D'", img: "G2.gif" },
  { name: "H", type: "H Perm", alg: "M2 U M2 U2 M2 U M2", img: "H.gif" },
  { name: "Ja", type: "J Perm", alg: "x R2 F R F' R U2 r' U r U2 x'", img: "J.gif" },
  { name: "Jb", type: "J Perm", alg: "R U R' F' R U R' U' R' F R2 U' R'", img: "J1.gif" },
  { name: "Na", type: "N Perm", alg: "R U R' U R U R' F' R U R' U' R' F R2 U' R' U2 R U' R'", img: "N1.gif" },
  { name: "Nb", type: "N Perm", alg: "R' U R U' R' F' U' F R U R' F R' F' R U' R", img: "N.gif" },
  { name: "Ra", type: "R Perm", alg: "R U' R' U' R U R D R' U' R D' R' U2 R'", img: "R1.gif" },
  { name: "Rb", type: "R Perm", alg: "R2 F R U R U' R' F' R U2 R' U2 R", img: "R.gif" },
  { name: "T", type: "T Perm", alg: "R U R' U' R' F R2 U' R' U' R U R' F'", img: "T.gif" },
  { name: "Ua", type: "U Perm", alg: "R U' R U R U R U' R' U' R2", img: "U1.gif" },
  { name: "Ub", type: "U Perm", alg: "R2 U R U R' U' R' U' R' U R'", img: "U.gif" },
  { name: "V", type: "V Perm", alg: "R' U R' U' y R' F' R2 U' R' U R' F R F", img: "V.gif" },
  { name: "Y", type: "Y Perm", alg: "F R U' R' U' R U R' F' R U R' U' R' F R F'", img: "Y.gif" },
  { name: "Z", type: "Z Perm", alg: "M2 U M2 U M' U2 M2 U2 M' U2", img: "Z.gif" }
];

const state = {
  sequence: [],
  index: 0,
  running: false,
  startTime: 0,
  elapsedBeforeStart: 0,
  rafId: null
};

const singleState = {
  pll: null,
  running: false,
  startTime: 0,
  elapsedBeforeStart: 0,
  rafId: null
};

let spaceArmed = false;
let spaceMode = null;

function setArmedVisual(mode, active) {
  if (mode === "single") $("singleTimer").classList.toggle("armed", active);
  if (mode === "main") $("timer").classList.toggle("armed", active);
}

const $ = (id) => document.getElementById(id);

function formatTime(ms) {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const centis = Math.floor((ms % 1000) / 10);
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${String(centis).padStart(2, "0")}`;
}

function currentElapsed() {
  if (!state.running) return state.elapsedBeforeStart;
  return state.elapsedBeforeStart + performance.now() - state.startTime;
}

function tick() {
  $("timer").textContent = formatTime(currentElapsed());
  state.rafId = requestAnimationFrame(tick);
}

function startTimer() {
  if (!state.sequence.length) generateSequence();
  if (state.running) return;
  state.running = true;
  state.startTime = performance.now();
  tick();
}

function stopTimer() {
  if (!state.running) return;
  state.elapsedBeforeStart = currentElapsed();
  state.running = false;
  cancelAnimationFrame(state.rafId);
  $("timer").textContent = formatTime(state.elapsedBeforeStart);
  saveResult(state.elapsedBeforeStart);
}

function resetTimer() {
  state.running = false;
  state.elapsedBeforeStart = 0;
  state.startTime = 0;
  cancelAnimationFrame(state.rafId);
  $("timer").textContent = "00:00.00";
}

function resetTraining() {
  generateSequence();
}

function saveResult(ms) {
  if (!state.sequence.length || ms <= 0) return;
  localStorage.setItem("pll-last-time", String(ms));
  const best = Number(localStorage.getItem("pll-best-time") || 0);
  if (!best || ms < best) localStorage.setItem("pll-best-time", String(ms));
  renderStats();
}

function shuffle(array) {
  const next = [...array];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

function generateSequence() {
  state.sequence = shuffle(PLLS);
  state.index = 0;
  resetTimer();
  renderCurrentCase();
  renderSequence();
  renderStats();
}

function goNext() {
  if (!state.sequence.length) return;
  if (state.index < state.sequence.length - 1) {
    state.index += 1;
    renderCurrentCase();
    renderSequence();
    renderStats();
    return;
  }
  stopTimer();
}

function goPrev() {
  if (!state.sequence.length || state.index <= 0) return;
  state.index -= 1;
  renderCurrentCase();
  renderSequence();
  renderStats();
}

function renderCurrentCase() {
  const pll = state.sequence[state.index];
  if (!pll) {
    $("currentDiagram").innerHTML = `<div class="image-placeholder">PLL</div>`;
    return;
  }
  $("currentDiagram").innerHTML = pllImage(pll, "large");
  $("caseIndex").textContent = `第 ${state.index + 1} / ${state.sequence.length} 个`;
  $("currentName").textContent = `${pll.name} Perm`;
  $("currentAlg").textContent = pll.alg;
}

function renderSequence() {
  const wrap = $("sequenceList");
  wrap.innerHTML = "";
  state.sequence.forEach((pll, index) => {
    const chip = document.createElement("button");
    chip.className = "sequence-chip";
    if (index < state.index) chip.classList.add("done");
    if (index === state.index) chip.classList.add("active");
    chip.innerHTML = `
      <span class="sequence-number">${index + 1}</span>
      <span class="mini-diagram">${pllImage(pll, "mini")}</span>
      <span class="sequence-name">${pll.name}</span>
    `;
    chip.addEventListener("click", () => {
      state.index = index;
      renderCurrentCase();
      renderSequence();
      renderStats();
    });
    wrap.appendChild(chip);
  });
}

function renderStats() {
  $("progressText").textContent = state.sequence.length ? `${state.index + 1} / ${state.sequence.length}` : "0 / 21";
  const last = Number(localStorage.getItem("pll-last-time") || 0);
  const best = Number(localStorage.getItem("pll-best-time") || 0);
  $("lastTime").textContent = last ? formatTime(last) : "--";
  $("bestTime").textContent = best ? formatTime(best) : "--";
}

function renderLibrary() {
  const grid = $("pllGrid");
  grid.innerHTML = "";
  PLLS.forEach((pll) => {
    const card = document.createElement("button");
    card.className = "pll-card";
    card.type = "button";
    card.innerHTML = `
      <div class="card-top">
        <h3>${pll.name} Perm</h3>
        <span class="tag">${pll.type}</span>
      </div>
      <div class="diagram">${pllImage(pll, "library")}</div>
      <p class="algorithm">${pll.alg}</p>
    `;
    card.addEventListener("click", () => openSinglePractice(pll));
    grid.appendChild(card);
  });
}

function pllImage(pll, variant) {
  return `<img class="pll-image pll-image-${variant}" src="assets/pll21/${pll.img}" alt="${pll.name} PLL 图示">`;
}

function singleElapsed() {
  if (!singleState.running) return singleState.elapsedBeforeStart;
  return singleState.elapsedBeforeStart + performance.now() - singleState.startTime;
}

function singleTick() {
  $("singleTimer").textContent = formatTime(singleElapsed());
  singleState.rafId = requestAnimationFrame(singleTick);
}

function openSinglePractice(pll) {
  stopTimer();
  singleState.pll = pll;
  singleResetTimer();
  $("singleDiagram").innerHTML = pllImage(pll, "large");
  $("singleName").textContent = `${pll.name} Perm`;
  $("singleAlg").textContent = pll.alg;
  $("singlePractice").classList.remove("hidden");
  $("singlePractice").setAttribute("aria-hidden", "false");
}

function closeSinglePractice() {
  singleStopTimer(false);
  $("singlePractice").classList.add("hidden");
  $("singlePractice").setAttribute("aria-hidden", "true");
}

function singleStartTimer() {
  if (!singleState.pll || singleState.running) return;
  singleState.running = true;
  singleState.startTime = performance.now();
  singleTick();
}

function singleStopTimer(save = true) {
  if (!singleState.running) return;
  singleState.elapsedBeforeStart = singleElapsed();
  singleState.running = false;
  cancelAnimationFrame(singleState.rafId);
  $("singleTimer").textContent = formatTime(singleState.elapsedBeforeStart);
  if (save && singleState.pll && singleState.elapsedBeforeStart > 0) {
    localStorage.setItem(`pll-single-last-${singleState.pll.name}`, String(singleState.elapsedBeforeStart));
  }
}

function singleResetTimer() {
  singleState.running = false;
  singleState.elapsedBeforeStart = 0;
  singleState.startTime = 0;
  cancelAnimationFrame(singleState.rafId);
  $("singleTimer").textContent = "00:00.00";
}

function singleToggleTimer() {
  singleState.running ? singleStopTimer() : singleStartTimer();
}

$("generateBtn").addEventListener("click", generateSequence);
$("startBtn").addEventListener("click", startTimer);
$("stopBtn").addEventListener("click", stopTimer);
$("resetBtn").addEventListener("click", resetTraining);
$("nextBtn").addEventListener("click", goNext);
$("prevBtn").addEventListener("click", goPrev);
$("singleBackBtn").addEventListener("click", closeSinglePractice);
$("singleStartBtn").addEventListener("click", singleStartTimer);
$("singleStopBtn").addEventListener("click", singleStopTimer);
$("singleResetBtn").addEventListener("click", singleResetTimer);

document.addEventListener("keydown", (event) => {
  if (event.code === "Space") {
    event.preventDefault();
    const inSingle = !$("singlePractice").classList.contains("hidden");
    if ((inSingle && singleState.running) || (!inSingle && state.running)) {
      inSingle ? singleStopTimer() : stopTimer();
      setArmedVisual(spaceMode, false);
      spaceArmed = false;
      spaceMode = null;
      return;
    }
    if (!event.repeat) {
      spaceArmed = true;
      spaceMode = inSingle ? "single" : "main";
      setArmedVisual(spaceMode, true);
    }
  }
  if (event.key === "Escape" && !$("singlePractice").classList.contains("hidden")) closeSinglePractice();
  if (event.key === "ArrowRight") goNext();
  if (event.key === "ArrowLeft") goPrev();
});

document.addEventListener("keyup", (event) => {
  if (event.code !== "Space" || !spaceArmed) return;
  event.preventDefault();
  if (spaceMode === "single" && !$("singlePractice").classList.contains("hidden")) {
    singleStartTimer();
  }
  if (spaceMode === "main" && $("singlePractice").classList.contains("hidden")) {
    startTimer();
  }
  setArmedVisual(spaceMode, false);
  spaceArmed = false;
  spaceMode = null;
});

renderLibrary();
renderCurrentCase();
renderStats();
