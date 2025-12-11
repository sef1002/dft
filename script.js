// --- Core parameters ---
const N = 256;               // number of samples
const sampleRate = 256;      // "Hz" (just needs to be consistent)
const dt = 1 / sampleRate;

let t = new Array(N);
for (let n = 0; n < N; n++) {
  t[n] = n * dt;
}

// State
let signal = new Array(N);
let spectrumReal = new Array(N);
let spectrumImag = new Array(N);
let spectrumMag = new Array(N);

let filteredReal = new Array(N);
let filteredImag = new Array(N);
let filteredSignal = new Array(N);
let filteredMag = new Array(N);

let scrollOffset = 0;
let scrollSpeed = 0.35;

// DOM elements
const signalTypeEl = document.getElementById("signalType");
const baseFreqEl = document.getElementById("baseFreq");
const baseFreqValueEl = document.getElementById("baseFreqValue");
const secondFreqEl = document.getElementById("secondFreq");
const secondFreqValueEl = document.getElementById("secondFreqValue");
const addNoiseEl = document.getElementById("addNoise");

const filterTypeEl = document.getElementById("filterType");
const cutoffEl = document.getElementById("cutoff");
const cutoffValueEl = document.getElementById("cutoffValue");
const lowCutoffEl = document.getElementById("lowCutoff");
const lowCutoffValueEl = document.getElementById("lowCutoffValue");
const highCutoffEl = document.getElementById("highCutoff");
const highCutoffValueEl = document.getElementById("highCutoffValue");

const lpHpControls = document.getElementById("lpHpControls");
const bpControls = document.getElementById("bpControls");

const scrollSpeedEl = document.getElementById("scrollSpeed");
const scrollSpeedValueEl = document.getElementById("scrollSpeedValue");
const resetBtn = document.getElementById("resetBtn");

// canvases
const timeOriginalCanvas = document.getElementById("timeOriginal");
const timeFilteredCanvas = document.getElementById("timeFiltered");
const freqOriginalCanvas = document.getElementById("freqOriginal");
const freqFilteredCanvas = document.getElementById("freqFiltered");

const timeOriginalCtx = timeOriginalCanvas.getContext("2d");
const timeFilteredCtx = timeFilteredCanvas.getContext("2d");
const freqOriginalCtx = freqOriginalCanvas.getContext("2d");
const freqFilteredCtx = freqFilteredCanvas.getContext("2d");

// --- Utility: generate signal ---
function generateSignal() {
  const type = signalTypeEl.value;
  const f0 = parseFloat(baseFreqEl.value);
  const f1 = parseFloat(secondFreqEl.value);
  const addNoise = addNoiseEl.checked;

  for (let n = 0; n < N; n++) {
    const x = t[n];
    let s = 0;

    if (type === "sine") {
      s = Math.sin(2 * Math.PI * f0 * x);
    } else if (type === "square") {
      s = Math.sign(Math.sin(2 * Math.PI * f0 * x));
    } else if (type === "sawtooth") {
      const frac = (f0 * x) % 1;
      s = 2 * (frac - 0.5); // -1 to 1
    } else if (type === "sinePlusNoise") {
      s = Math.sin(2 * Math.PI * f0 * x);
      s += 0.4 * (Math.random() * 2 - 1);
    } else if (type === "twoTone") {
      s = Math.sin(2 * Math.PI * f0 * x) +
          0.7 * Math.sin(2 * Math.PI * f1 * x);
    }

    if (addNoise) {
      s += 0.2 * (Math.random() * 2 - 1);
    }

    signal[n] = s;
  }
}

// --- DFT and inverse DFT ---
function computeDFT(input, realOut, imagOut, magOut) {
  const twoPiOverN = (2 * Math.PI) / N;

  for (let k = 0; k < N; k++) {
    let real = 0;
    let imag = 0;
    for (let n = 0; n < N; n++) {
      const angle = twoPiOverN * k * n;
      real += input[n] * Math.cos(-angle);
      imag += input[n] * Math.sin(-angle);
    }
    realOut[k] = real;
    imagOut[k] = imag;
    if (magOut) {
      magOut[k] = Math.sqrt(real * real + imag * imag);
    }
  }
}

function computeIDFT(realIn, imagIn, output) {
  const twoPiOverN = (2 * Math.PI) / N;

  for (let n = 0; n < N; n++) {
    let real = 0;
    for (let k = 0; k < N; k++) {
      const angle = twoPiOverN * k * n;
      real += realIn[k] * Math.cos(angle) - imagIn[k] * Math.sin(angle);
    }
    output[n] = real / N;
  }
}

// --- Filter application ---
function applyFilter() {
  const type = filterTypeEl.value;
  const cutoff = parseFloat(cutoffEl.value);
  const lowCut = parseFloat(lowCutoffEl.value);
  const highCut = parseFloat(highCutoffEl.value);

  const nyquist = sampleRate / 2;

  for (let k = 0; k < N; k++) {
    const freq = (k * sampleRate) / N; // 0 to ~sampleRate
    let keep = false;

    if (type === "lowpass") {
      keep = freq <= cutoff;
    } else if (type === "highpass") {
      keep = freq >= cutoff;
    } else if (type === "bandpass") {
      const low = Math.min(lowCut, highCut);
      const high = Math.max(lowCut, highCut);
      keep = freq >= low && freq <= high;
    }

    if (freq > nyquist) {
      // ignore mirrored part for our visual model
      keep = false;
    }

    if (keep) {
      filteredReal[k] = spectrumReal[k];
      filteredImag[k] = spectrumImag[k];
    } else {
      filteredReal[k] = 0;
      filteredImag[k] = 0;
    }
  }

  computeIDFT(filteredReal, filteredImag, filteredSignal);

  // Magnitude spectrum of filtered
  for (let k = 0; k < N; k++) {
    const r = filteredReal[k];
    const im = filteredImag[k];
    filteredMag[k] = Math.sqrt(r * r + im * im);
  }
}

// --- Drawing helpers ---
function clearCanvas(ctx) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}

function drawTimeDomain(ctx, data, color = "#4ea8ff", offset = 0) {
  clearCanvas(ctx);
  const { width, height } = ctx.canvas;
  const midY = height / 2;
  const scaleY = (height * 0.42);

  ctx.save();
  ctx.translate(0, midY);

  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.4;

  for (let i = 0; i < N; i++) {
    const x = ((i + offset) % N) * (width / (N - 1));
    const y = -data[i] * scaleY;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }

  ctx.stroke();
  ctx.restore();

  // horizontal axis
  ctx.strokeStyle = "rgba(160, 164, 184, 0.4)";
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(0, midY);
  ctx.lineTo(width, midY);
  ctx.stroke();
}

function drawFrequencyDomain(ctx, mag, color = "#5ac8fa") {
  clearCanvas(ctx);
  const { width, height } = ctx.canvas;
  const nyquistIndex = Math.floor(N / 2);

  // find max for normalization
  let maxMag = 0;
  for (let k = 0; k <= nyquistIndex; k++) {
    if (mag[k] > maxMag) maxMag = mag[k];
  }
  if (maxMag === 0) maxMag = 1;

  const barWidth = width / (nyquistIndex + 1);

  ctx.fillStyle = color;

  for (let k = 0; k <= nyquistIndex; k++) {
    const m = mag[k] / maxMag;
    const barHeight = m * (height * 0.9);
    const x = k * barWidth;
    const y = height - barHeight;
    ctx.fillRect(x, y, barWidth * 0.8, barHeight);
  }

  // baseline
  ctx.strokeStyle = "rgba(160, 164, 184, 0.4)";
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(0, height - 0.5);
  ctx.lineTo(width, height - 0.5);
  ctx.stroke();
}

// --- Update pipeline ---
function updateAll() {
  generateSignal();
  computeDFT(signal, spectrumReal, spectrumImag, spectrumMag);
  applyFilter();

  drawTimeDomain(timeOriginalCtx, signal, "#4ea8ff", scrollOffset);
  drawTimeDomain(timeFilteredCtx, filteredSignal, "#ff7eb3", scrollOffset);

  drawFrequencyDomain(freqOriginalCtx, spectrumMag, "#4ea8ff");
  drawFrequencyDomain(freqFilteredCtx, filteredMag, "#ff7eb3");
}

// --- Animation loop ---
function animate() {
  const speedFactor = scrollSpeed; // 0–1-ish from slider mapping
  scrollOffset = (scrollOffset + speedFactor * 0.4) % N;

  drawTimeDomain(timeOriginalCtx, signal, "#4ea8ff", scrollOffset);
  drawTimeDomain(timeFilteredCtx, filteredSignal, "#ff7eb3", scrollOffset);

  requestAnimationFrame(animate);
}

// --- Event wiring ---
function onControlsChange() {
  baseFreqValueEl.textContent = baseFreqEl.value;
  secondFreqValueEl.textContent = secondFreqEl.value;
  cutoffValueEl.textContent = cutoffEl.value;
  lowCutoffValueEl.textContent = lowCutoffEl.value;
  highCutoffValueEl.textContent = highCutoffEl.value;
  scrollSpeedValueEl.textContent = scrollSpeedEl.value;

  // filter panel switching
  if (filterTypeEl.value === "bandpass") {
    lpHpControls.classList.add("hidden");
    bpControls.classList.remove("hidden");
  } else {
    lpHpControls.classList.remove("hidden");
    bpControls.classList.add("hidden");
  }

  scrollSpeed = parseFloat(scrollSpeedEl.value) / 100; // map 0–100 to 0–1

  updateAll();
}

signalTypeEl.addEventListener("change", onControlsChange);
baseFreqEl.addEventListener("input", onControlsChange);
secondFreqEl.addEventListener("input", onControlsChange);
addNoiseEl.addEventListener("change", onControlsChange);

filterTypeEl.addEventListener("change", onControlsChange);
cutoffEl.addEventListener("input", onControlsChange);
lowCutoffEl.addEventListener("input", onControlsChange);
highCutoffEl.addEventListener("input", onControlsChange);

scrollSpeedEl.addEventListener("input", onControlsChange);

resetBtn.addEventListener("click", () => {
  baseFreqEl.value = 5;
  secondFreqEl.value = 20;
  addNoiseEl.checked = false;
  filterTypeEl.value = "lowpass";
  cutoffEl.value = 20;
  lowCutoffEl.value = 10;
  highCutoffEl.value = 40;
  scrollSpeedEl.value = 35;
  scrollOffset = 0;
  onControlsChange();
});

// --- Init ---
onControlsChange();
requestAnimationFrame(animate);