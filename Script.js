// --- ALGORITHM METADATA & COMPLEXITY ---
const ALGORITHMS = {
  BUBBLE: { name: "Bubble Sort", best: "O(n)", avg: "O(n²)", worst: "O(n²)", space: "O(1)" },
  SELECTION: { name: "Selection Sort", best: "O(n²)", avg: "O(n²)", worst: "O(n²)", space: "O(1)" },
  INSERTION: { name: "Insertion Sort", best: "O(n)", avg: "O(n²)", worst: "O(n²)", space: "O(1)" },
  SHELL: { name: "Shell Sort", best: "O(n log n)", avg: "O(n^(4/3))", worst: "O(n²)", space: "O(1)" },
  QUICK: { name: "Quick Sort", best: "O(n log n)", avg: "O(n log n)", worst: "O(n²)", space: "O(log n)" },
  MERGE: { name: "Merge Sort", best: "O(n log n)", avg: "O(n log n)", worst: "O(n log n)", space: "O(n)" },
  HEAP: { name: "Heap Sort", best: "O(n log n)", avg: "O(n log n)", worst: "O(n log n)", space: "O(1)" },
  RADIX: { name: "Radix Sort", best: "O(nk)", avg: "O(nk)", worst: "O(nk)", space: "O(n+k)" },
  BUCKET: { name: "Bucket Sort", best: "O(n+k)", avg: "O(n+k)", worst: "O(n²)", space: "O(n)" }
};

let array = [];
let steps = [];
let currentStepIdx = 0;
let isSorting = false;
let isPaused = false;
let animationTimer = null;
let startTime = 0;
let elapsedBeforePause = 0;
let comparisons = 0;
let swaps = 0;

const canvas = document.getElementById("visualizerCanvas");
const ctx = canvas.getContext("2d");

const algoSelect = document.getElementById("algoSelect");
const patternSelect = document.getElementById("patternSelect");
const speedSelect = document.getElementById("speedSelect");
const sizeSelect = document.getElementById("sizeSelect");

const btnRandomize = document.getElementById("btnRandomize");
const btnSort = document.getElementById("btnSort");
const btnPause = document.getElementById("btnPause");
const btnStep = document.getElementById("btnStep");

const statComparisons = document.getElementById("statComparisons");
const statSwaps = document.getElementById("statSwaps");
const statTime = document.getElementById("statTime");
const statProgress = document.getElementById("statProgress");
const progressFill = document.getElementById("progressFill");
const statusPill = document.getElementById("statusPill");

window.addEventListener("resize", resizeCanvas);
document.addEventListener("DOMContentLoaded", () => {
  resizeCanvas();
  updateComplexityHUD();
  generateNewArray();
});

document.addEventListener("keydown", (e) => {
  if (e.code === "Space" && !e.target.matches("select, button")) {
    e.preventDefault();
    if (!isSorting && currentStepIdx === 0) startSorting();
    else if (isSorting) togglePause();
  }
});

algoSelect.addEventListener("change", () => {
  updateComplexityHUD();
  resetForNewSelection();
});

function updateComplexityHUD() {
  const meta = ALGORITHMS[algoSelect.value];
  document.getElementById("displayAlgoName").innerText = meta.name.toUpperCase();
  document.getElementById("compBest").innerText = meta.best;
  document.getElementById("compAvg").innerText = meta.avg;
  document.getElementById("compWorst").innerText = meta.worst;
  document.getElementById("compSpace").innerText = meta.space;
}

function resizeCanvas() {
  if (canvas.parentElement) {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
    drawArray();
  }
}

sizeSelect.addEventListener("change", generateNewArray);
patternSelect.addEventListener("change", generateNewArray);
btnRandomize.addEventListener("click", generateNewArray);
btnSort.addEventListener("click", startSorting);
btnPause.addEventListener("click", togglePause);
btnStep.addEventListener("click", stepOnce);

function generateNewArray() {
  if (isSorting) stopSorting();
  const size = parseInt(sizeSelect.value);
  const pattern = patternSelect.value;
  array = buildArrayByPattern(size, pattern);
  resetStats();
  setStatus("READY", "");
  drawArray();
}

function buildArrayByPattern(size, pattern) {
  let arr = [];
  if (pattern === "RANDOM") {
    for (let i = 0; i < size; i++) arr.push(Math.floor(Math.random() * 90) + 10);
  } else if (pattern === "NEARLY_SORTED") {
    for (let i = 0; i < size; i++) arr.push(10 + Math.floor((i / size) * 90));
    const swapsCount = Math.max(1, Math.floor(size * 0.08));
    for (let s = 0; s < swapsCount; s++) {
      const a = Math.floor(Math.random() * size);
      const b = Math.floor(Math.random() * size);
      const t = arr[a]; arr[a] = arr[b]; arr[b] = t;
    }
  } else if (pattern === "REVERSED") {
    for (let i = 0; i < size; i++) arr.push(10 + Math.floor(((size - i) / size) * 90));
  } else if (pattern === "FEW_UNIQUE") {
    const values = [15, 30, 45, 60, 75, 90];
    for (let i = 0; i < size; i++) arr.push(values[Math.floor(Math.random() * values.length)]);
  }
  return arr;
}

function resetForNewSelection() {
  if (isSorting) stopSorting();
  resetStats();
  setStatus("READY", "");
  drawArray();
}

function resetStats() {
  steps = [];
  currentStepIdx = 0;
  comparisons = 0;
  swaps = 0;
  elapsedBeforePause = 0;
  statComparisons.innerText = "0";
  statSwaps.innerText = "0";
  statTime.innerText = "0.00s";
  statProgress.innerText = "0%";
  progressFill.style.width = "0%";
  btnPause.disabled = true;
  btnPause.innerText = "Pause";
}

function setStatus(text, cls) {
  statusPill.innerText = text;
  statusPill.className = "status-pill" + (cls ? " " + cls : "");
}

function barColor(value) {
  const t = Math.min(1, Math.max(0, (value - 10) / 90));
  const c1 = [110, 231, 255]; // cyan
  const c2 = [167, 139, 250]; // violet
  const r = Math.round(c1[0] + (c2[0] - c1[0]) * t);
  const g = Math.round(c1[1] + (c2[1] - c1[1]) * t);
  const b = Math.round(c1[2] + (c2[2] - c1[2]) * t);
  return `rgb(${r},${g},${b})`;
}

function drawArray(activeIndices = {}, glow = {}) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const barWidth = canvas.width / array.length;
  const maxHeight = canvas.height - 10;

  for (let i = 0; i < array.length; i++) {
    const barHeight = (array[i] / 100) * maxHeight;
    const x = i * barWidth;
    const y = canvas.height - barHeight;
    const w = Math.max(barWidth - 2, 1);

    const color = activeIndices[i] || barColor(array[i]);

    if (activeIndices[i]) {
      ctx.save();
      ctx.shadowColor = activeIndices[i];
      ctx.shadowBlur = 12;
      ctx.fillStyle = color;
      ctx.fillRect(x, y, w, barHeight);
      ctx.restore();
    } else {
      ctx.fillStyle = color;
      ctx.fillRect(x, y, w, barHeight);
    }
  }
}

// --- UPDATED START SORTING FUNCTION (FETCHES FROM JAVA BACKEND) ---
async function startSorting() {
  if (isSorting) return;
  const algo = algoSelect.value;

  if (currentStepIdx === 0) {
    setStatus("RUNNING", "running");
    try {
      // Call Java Spring Boot REST Controller
      const response = await fetch("http://localhost:8080/api/sort", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          algorithm: algo,
          array: array
        })
      });

      if (!response.ok) {
        throw new Error("Server status: " + response.status);
      }

      const data = await response.json();
      steps = data.steps; // Steps received from Java!
    } catch (error) {
      console.warn("Backend API unreachable. Falling back to client-side JS generation:", error);
      steps = generateClientSteps(algo, [...array]);
    }
  }

  isSorting = true;
  isPaused = false;
  btnSort.disabled = true;
  btnRandomize.disabled = true;
  btnPause.disabled = false;
  btnStep.disabled = true;
  btnPause.innerText = "Pause";
  setStatus("RUNNING", "running");
  startTime = performance.now();

  runLoop();
}

function togglePause() {
  if (!isSorting) return;
  isPaused = !isPaused;
  if (isPaused) {
    clearTimeout(animationTimer);
    elapsedBeforePause += performance.now() - startTime;
    btnPause.innerText = "Resume";
    btnStep.disabled = false;
    setStatus("PAUSED", "");
  } else {
    startTime = performance.now();
    btnPause.innerText = "Pause";
    btnStep.disabled = true;
    setStatus("RUNNING", "running");
    runLoop();
  }
}

async function stepOnce() {
  if (currentStepIdx >= steps.length) {
    if (steps.length === 0) {
      const algo = algoSelect.value;
      try {
        const response = await fetch("http://localhost:8080/api/sort", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ algorithm: algo, array: array })
        });
        const data = await response.json();
        steps = data.steps;
      } catch (err) {
        steps = generateClientSteps(algo, [...array]);
      }
    } else {
      return;
    }
  }
  isSorting = true;
  btnSort.disabled = true;
  btnRandomize.disabled = true;
  btnPause.disabled = false;
  setStatus("PAUSED", "");
  applyStep();
  if (currentStepIdx >= steps.length) finishSorting();
}

function applyStep() {
  const step = steps[currentStepIdx];
  const activeMap = {};

  if (step.type === "COMPARE") {
    comparisons++;
    statComparisons.innerText = comparisons;
    activeMap[step.index1] = "#f5c451";
    if (step.index2 !== -1) activeMap[step.index2] = "#f5c451";
  } else if (step.type === "SWAP") {
    swaps++;
    statSwaps.innerText = swaps;
    let temp = array[step.index1];
    array[step.index1] = array[step.index2];
    array[step.index2] = temp;
    activeMap[step.index1] = "#ff5d7a";
    activeMap[step.index2] = "#ff5d7a";
  } else if (step.type === "OVERWRITE") {
    swaps++;
    statSwaps.innerText = swaps;
    array[step.index1] = step.value;
    activeMap[step.index1] = "#ff5d7a";
  }

  drawArray(activeMap);
  currentStepIdx++;

  const totalElapsed = elapsedBeforePause + (isPaused ? 0 : performance.now() - startTime);
  statTime.innerText = (totalElapsed / 1000).toFixed(2) + "s";

  const pct = steps.length ? Math.round((currentStepIdx / steps.length) * 100) : 0;
  statProgress.innerText = pct + "%";
  progressFill.style.width = pct + "%";
}

function runLoop() {
  if (!isSorting || isPaused) return;

  if (currentStepIdx < steps.length) {
    applyStep();
    const delay = parseInt(speedSelect.value);
    animationTimer = setTimeout(runLoop, delay);
  } else {
    finishSorting();
  }
}

function finishSorting() {
  isSorting = false;
  isPaused = false;
  btnSort.disabled = false;
  btnRandomize.disabled = false;
  btnPause.disabled = true;
  btnStep.disabled = false;
  setStatus("SORTED", "done");

  let i = 0;
  const sweep = () => {
    const activeMap = {};
    for (let k = 0; k <= i && k < array.length; k++) activeMap[k] = "#3fd68f";
    drawArray(activeMap);
    i++;
    if (i <= array.length) requestAnimationFrame(() => setTimeout(sweep, 4));
  };
  sweep();
}

function stopSorting() {
  clearTimeout(animationTimer);
  isSorting = false;
  isPaused = false;
  btnSort.disabled = false;
  btnRandomize.disabled = false;
  btnPause.disabled = true;
  btnStep.disabled = false;
}

// Client-side fallback step generator
function generateClientSteps(algo, arr) {
  const steps = [];
  if (algo === "MERGE") {
    mergeSortHelper(arr, 0, arr.length - 1, steps);
  } else if (algo === "BUBBLE") {
    bubbleSortSteps(arr, steps);
  } else if (algo === "SELECTION") {
    selectionSortSteps(arr, steps);
  } else if (algo === "INSERTION") {
    insertionSortSteps(arr, steps);
  } else if (algo === "SHELL") {
    shellSortSteps(arr, steps);
  } else if (algo === "QUICK") {
    quickSortSteps(arr, 0, arr.length - 1, steps);
  } else if (algo === "HEAP") {
    heapSortSteps(arr, steps);
  } else if (algo === "RADIX") {
    radixSortSteps(arr, steps);
  } else if (algo === "BUCKET") {
    bucketSortSteps(arr, steps);
  }
  return steps;
}

function bubbleSortSteps(arr, steps) {
  for (let i = 0; i < arr.length - 1; i++) {
    for (let j = 0; j < arr.length - i - 1; j++) {
      steps.push({ type: "COMPARE", index1: j, index2: j + 1 });
      if (arr[j] > arr[j + 1]) {
        steps.push({ type: "SWAP", index1: j, index2: j + 1 });
        let temp = arr[j]; arr[j] = arr[j + 1]; arr[j + 1] = temp;
      }
    }
  }
}

function selectionSortSteps(arr, steps) {
  for (let i = 0; i < arr.length; i++) {
    let minIdx = i;
    for (let j = i + 1; j < arr.length; j++) {
      steps.push({ type: "COMPARE", index1: minIdx, index2: j });
      if (arr[j] < arr[minIdx]) minIdx = j;
    }
    if (minIdx !== i) {
      steps.push({ type: "SWAP", index1: i, index2: minIdx });
      let temp = arr[i]; arr[i] = arr[minIdx]; arr[minIdx] = temp;
    }
  }
}

function insertionSortSteps(arr, steps) {
  for (let i = 1; i < arr.length; i++) {
    let key = arr[i], j = i - 1;
    while (j >= 0 && arr[j] > key) {
      steps.push({ type: "COMPARE", index1: j, index2: j + 1 });
      steps.push({ type: "OVERWRITE", index1: j + 1, value: arr[j] });
      arr[j + 1] = arr[j]; j--;
    }
    if (j >= 0) steps.push({ type: "COMPARE", index1: j, index2: j + 1 });
    steps.push({ type: "OVERWRITE", index1: j + 1, value: key });
    arr[j + 1] = key;
  }
}

function shellSortSteps(arr, steps) {
  const n = arr.length;
  for (let gap = Math.floor(n / 2); gap > 0; gap = Math.floor(gap / 2)) {
    for (let i = gap; i < n; i++) {
      let temp = arr[i];
      let j = i;
      while (j >= gap) {
        steps.push({ type: "COMPARE", index1: j - gap, index2: j });
        if (arr[j - gap] > temp) {
          steps.push({ type: "OVERWRITE", index1: j, value: arr[j - gap] });
          arr[j] = arr[j - gap];
          j -= gap;
        } else break;
      }
      steps.push({ type: "OVERWRITE", index1: j, value: temp });
      arr[j] = temp;
    }
  }
}

function quickSortSteps(arr, lo, hi, steps) {
  if (lo >= hi) return;
  const pivot = arr[hi];
  let i = lo - 1;
  for (let j = lo; j < hi; j++) {
    steps.push({ type: "COMPARE", index1: j, index2: hi });
    if (arr[j] < pivot) {
      i++;
      if (i !== j) {
        steps.push({ type: "SWAP", index1: i, index2: j });
        const t = arr[i]; arr[i] = arr[j]; arr[j] = t;
      }
    }
  }
  if (i + 1 !== hi) {
    steps.push({ type: "SWAP", index1: i + 1, index2: hi });
    const t = arr[i + 1]; arr[i + 1] = arr[hi]; arr[hi] = t;
  }
  const p = i + 1;
  quickSortSteps(arr, lo, p - 1, steps);
  quickSortSteps(arr, p + 1, hi, steps);
}

function heapSortSteps(arr, steps) {
  const n = arr.length;

  function heapify(size, root) {
    let largest = root;
    const left = 2 * root + 1;
    const right = 2 * root + 2;

    if (left < size) {
      steps.push({ type: "COMPARE", index1: left, index2: largest });
      if (arr[left] > arr[largest]) largest = left;
    }
    if (right < size) {
      steps.push({ type: "COMPARE", index1: right, index2: largest });
      if (arr[right] > arr[largest]) largest = right;
    }
    if (largest !== root) {
      steps.push({ type: "SWAP", index1: root, index2: largest });
      const t = arr[root]; arr[root] = arr[largest]; arr[largest] = t;
      heapify(size, largest);
    }
  }

  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) heapify(n, i);

  for (let end = n - 1; end > 0; end--) {
    steps.push({ type: "SWAP", index1: 0, index2: end });
    const t = arr[0]; arr[0] = arr[end]; arr[end] = t;
    heapify(end, 0);
  }
}

function radixSortSteps(arr, steps) {
  const n = arr.length;
  const maxVal = Math.max(...arr, 1);
  for (let exp = 1; Math.floor(maxVal / exp) > 0; exp *= 10) {
    const output = new Array(n).fill(0);
    const count = new Array(10).fill(0);

    for (let i = 0; i < n; i++) {
      const digit = Math.floor(arr[i] / exp) % 10;
      count[digit]++;
    }
    for (let i = 1; i < 10; i++) count[i] += count[i - 1];

    for (let i = n - 1; i >= 0; i--) {
      const digit = Math.floor(arr[i] / exp) % 10;
      output[count[digit] - 1] = arr[i];
      count[digit]--;
    }

    for (let i = 0; i < n; i++) {
      arr[i] = output[i];
      steps.push({ type: "OVERWRITE", index1: i, value: output[i] });
    }
  }
}

function bucketSortSteps(arr, steps) {
  const n = arr.length;
  if (n === 0) return;
  const min = Math.min(...arr);
  const max = Math.max(...arr);
  const bucketCount = Math.max(1, Math.min(10, n));
  const range = (max - min) / bucketCount || 1;

  const buckets = Array.from({ length: bucketCount }, () => []);
  for (let i = 0; i < n; i++) {
    let idx = Math.floor((arr[i] - min) / range);
    if (idx >= bucketCount) idx = bucketCount - 1;
    buckets[idx].push(arr[i]);
  }

  for (const bucket of buckets) {
    for (let i = 1; i < bucket.length; i++) {
      let key = bucket[i], j = i - 1;
      while (j >= 0 && bucket[j] > key) {
        bucket[j + 1] = bucket[j];
        j--;
      }
      bucket[j + 1] = key;
    }
  }

  let k = 0;
  for (const bucket of buckets) {
    for (const val of bucket) {
      if (k > 0) steps.push({ type: "COMPARE", index1: k - 1, index2: k });
      steps.push({ type: "OVERWRITE", index1: k, value: val });
      arr[k] = val;
      k++;
    }
  }
}

function mergeSortHelper(mainArray, startIdx, endIdx, steps) {
  if (startIdx >= endIdx) return;
  const middleIdx = Math.floor((startIdx + endIdx) / 2);
  mergeSortHelper(mainArray, startIdx, middleIdx, steps);
  mergeSortHelper(mainArray, middleIdx + 1, endIdx, steps);
  doMerge(mainArray, startIdx, middleIdx, endIdx, steps);
}

function doMerge(mainArray, startIdx, middleIdx, endIdx, steps) {
  let k = startIdx;
  let i = startIdx;
  let j = middleIdx + 1;
  const auxiliaryArray = mainArray.slice();

  while (i <= middleIdx && j <= endIdx) {
    steps.push({ type: "COMPARE", index1: i, index2: j });
    if (auxiliaryArray[i] <= auxiliaryArray[j]) {
      steps.push({ type: "OVERWRITE", index1: k, value: auxiliaryArray[i] });
      mainArray[k++] = auxiliaryArray[i++];
    } else {
      steps.push({ type: "OVERWRITE", index1: k, value: auxiliaryArray[j] });
      mainArray[k++] = auxiliaryArray[j++];
    }
  }

  while (i <= middleIdx) {
    steps.push({ type: "COMPARE", index1: i, index2: -1 });
    steps.push({ type: "OVERWRITE", index1: k, value: auxiliaryArray[i] });
    mainArray[k++] = auxiliaryArray[i++];
  }

  while (j <= endIdx) {
    steps.push({ type: "COMPARE", index1: j, index2: -1 });
    steps.push({ type: "OVERWRITE", index1: k, value: auxiliaryArray[j] });
    mainArray[k++] = auxiliaryArray[j++];
  }
}