/* ===========================
   TruthScan AI — app.js
   =========================== */

// ---- State ----
let activeTab = 'text';
const files = {};

// ---- Tab Switching ----
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.input-area').forEach(a => a.classList.remove('active'));
    btn.classList.add('active');
    activeTab = btn.dataset.tab;
    document.getElementById('tab-' + activeTab).classList.add('active');
  });
});

// ---- File Handling ----
['image', 'video', 'audio', 'doc'].forEach(type => {
  const fileInput = document.getElementById(type + 'File');
  if (!fileInput) return;

  fileInput.addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    files[type] = file;

    const preview = document.getElementById(type + 'Preview');
    preview.classList.add('show');
    document.getElementById(type + 'Name').textContent = file.name;
    document.getElementById(type + 'Size').textContent = formatSize(file.size);

    if (type === 'image') {
      const reader = new FileReader();
      reader.onload = ev => {
        document.getElementById('imageThumb').src = ev.target.result;
      };
      reader.readAsDataURL(file);
    }
  });

  const dropZone = document.getElementById(type + 'Drop');
  if (dropZone) {
    dropZone.addEventListener('dragover', e => {
      e.preventDefault();
      dropZone.classList.add('drag-over');
    });
    dropZone.addEventListener('dragleave', () => {
      dropZone.classList.remove('drag-over');
    });
    dropZone.addEventListener('drop', e => {
      e.preventDefault();
      dropZone.classList.remove('drag-over');
      const file = e.dataTransfer.files[0];
      if (file) {
        files[type] = file;
        // Manually trigger change-like behaviour
        const dt = new DataTransfer();
        dt.items.add(file);
        fileInput.files = dt.files;
        fileInput.dispatchEvent(new Event('change'));
      }
    });
  }
});

function clearFile(type) {
  files[type] = null;
  document.getElementById(type + 'Preview').classList.remove('show');
  document.getElementById(type + 'File').value = '';
}

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

// ---- Scan Messages ----
const scanMsgs = [
  'extracting signal vectors...',
  'running linguistic pattern analysis...',
  'cross-referencing source database...',
  'analyzing metadata signatures...',
  'checking visual consistency...',
  'computing authenticity scores...',
  'aggregating multi-signal results...',
  'generating verdict...'
];

// ---- Run Scan ----
function runScan() {
  const btn = document.getElementById('scanBtn');
  btn.classList.add('loading');
  document.getElementById('scanningOverlay').classList.add('active');
  document.getElementById('resultsSection').classList.remove('visible');

  let step = 0;
  const prog = document.getElementById('progressBar');
  const msgEl = document.getElementById('scanMsg');

  const interval = setInterval(() => {
    step++;
    prog.style.width = Math.min(step * 12, 95) + '%';
    msgEl.textContent = scanMsgs[Math.min(step - 1, scanMsgs.length - 1)];

    if (step >= 8) {
      clearInterval(interval);
      prog.style.width = '100%';
      setTimeout(showResults, 400);
    }
  }, 350);
}

// ---- Result Scenarios ----
const scenarios = [
  {
    cls: 'fake',
    verdict: 'Likely Fabricated',
    confidence: 91,
    meta: 'HIGH RISK · 6 signals flagged',
    summary: 'Multiple high-confidence indicators suggest this content is artificially generated or deliberately misleading. Linguistic patterns align with known disinformation templates, source metadata is inconsistent, and the emotional manipulation index is significantly elevated.',
    signals: [
      { name: 'AI Generation',         val: 94, badge: 'high', bar: 'bar-danger', label: '94% AI-written' },
      { name: 'Emotional Manipulation', val: 88, badge: 'high', bar: 'bar-danger', label: 'Very high' },
      { name: 'Source Credibility',     val: 12, badge: 'high', bar: 'bar-danger', label: 'Unverified' },
      { name: 'Factual Accuracy',       val: 23, badge: 'high', bar: 'bar-danger', label: '23% verified' },
      { name: 'Temporal Consistency',   val: 31, badge: 'med',  bar: 'bar-warn',   label: 'Inconsistent' },
      { name: 'Visual Integrity',       val: 18, badge: 'high', bar: 'bar-danger', label: 'Artifacts found' },
    ],
    details: [
      { dot: 'dot-danger', text: '<strong>AI authorship detected:</strong> Sentence structure and vocabulary distribution matches GPT-class language model output with 94% confidence.' },
      { dot: 'dot-danger', text: '<strong>Source not found:</strong> Claimed publication "Global Herald News" has no verifiable domain history prior to 3 months ago.' },
      { dot: 'dot-danger', text: '<strong>Image manipulation:</strong> Detected JPEG ghost artifacts and inconsistent lighting vectors suggesting compositing.' },
      { dot: 'dot-warn',   text: '<strong>Timeline mismatch:</strong> Event described occurred 2 days after the article\'s claimed publication date.' },
      { dot: 'dot-warn',   text: '<strong>Emotional language:</strong> 3.8× above baseline in fear-triggering language — common in coordinated influence operations.' },
      { dot: 'dot-safe',   text: '<strong>No known malware:</strong> Embedded links are clean and do not redirect to malicious domains.' },
    ]
  },
  {
    cls: 'likely-fake',
    verdict: 'Suspicious Content',
    confidence: 67,
    meta: 'MEDIUM RISK · 3 signals flagged',
    summary: 'This content shows several markers of potential inauthenticity. While not definitively fabricated, the combination of unverified claims, selective framing, and metadata anomalies warrants caution before sharing.',
    signals: [
      { name: 'AI Generation',         val: 52, badge: 'med', bar: 'bar-warn', label: '52% AI-likely' },
      { name: 'Emotional Manipulation', val: 61, badge: 'med', bar: 'bar-warn', label: 'Elevated' },
      { name: 'Source Credibility',     val: 44, badge: 'med', bar: 'bar-warn', label: 'Partially verified' },
      { name: 'Factual Accuracy',       val: 58, badge: 'med', bar: 'bar-warn', label: '58% verified' },
      { name: 'Temporal Consistency',   val: 71, badge: 'low', bar: 'bar-safe', label: 'Consistent' },
      { name: 'Visual Integrity',       val: 80, badge: 'low', bar: 'bar-safe', label: 'No edits found' },
    ],
    details: [
      { dot: 'dot-warn', text: '<strong>Selective framing detected:</strong> Content omits key context that would significantly alter interpretation.' },
      { dot: 'dot-warn', text: '<strong>Mixed sourcing:</strong> 3 of 7 cited facts traced to low-credibility secondary sources.' },
      { dot: 'dot-warn', text: '<strong>Moderate AI signals:</strong> Some paragraphs show syntactic patterns consistent with AI-assisted writing.' },
      { dot: 'dot-safe', text: '<strong>Images appear authentic:</strong> No signs of manipulation detected in embedded media.' },
      { dot: 'dot-safe', text: '<strong>Source domain is established:</strong> Publication has 6+ year history with verified records.' },
    ]
  },
  {
    cls: 'authentic',
    verdict: 'Appears Authentic',
    confidence: 88,
    meta: 'LOW RISK · 1 minor flag',
    summary: 'Content analysis indicates high probability of authenticity. Linguistic patterns are consistent with human authorship, sources are independently verifiable, and no manipulation artifacts were detected in associated media.',
    signals: [
      { name: 'AI Generation',         val:  8, badge: 'low', bar: 'bar-safe', label: '8% AI-likely' },
      { name: 'Emotional Manipulation', val: 14, badge: 'low', bar: 'bar-safe', label: 'Normal range' },
      { name: 'Source Credibility',     val: 91, badge: 'low', bar: 'bar-safe', label: 'Highly credible' },
      { name: 'Factual Accuracy',       val: 87, badge: 'low', bar: 'bar-safe', label: '87% verified' },
      { name: 'Temporal Consistency',   val: 95, badge: 'low', bar: 'bar-safe', label: 'Consistent' },
      { name: 'Visual Integrity',       val: 97, badge: 'low', bar: 'bar-safe', label: 'Unmodified' },
    ],
    details: [
      { dot: 'dot-safe', text: '<strong>Human authorship confirmed:</strong> Linguistic fingerprinting strongly indicates organic human writing.' },
      { dot: 'dot-safe', text: '<strong>All sources verified:</strong> Primary claims cross-referenced with 4 independent authoritative sources.' },
      { dot: 'dot-safe', text: '<strong>Images unmodified:</strong> EXIF data is intact and consistent with claimed camera and location.' },
      { dot: 'dot-safe', text: '<strong>Timeline verified:</strong> Publication date and all referenced events are chronologically consistent.' },
      { dot: 'dot-warn', text: '<strong>Minor note:</strong> One citation links to a paywalled article; content could not be fully verified.' },
    ]
  }
];

// ---- Show Results ----
function showResults() {
  document.getElementById('scanBtn').classList.remove('loading');
  document.getElementById('scanningOverlay').classList.remove('active');
  document.getElementById('progressBar').style.width = '0%';

  const result = scenarios[Math.floor(Math.random() * scenarios.length)];

  // Verdict card
  const card = document.getElementById('verdictCard');
  card.className = 'verdict-card ' + result.cls;
  document.getElementById('verdictTitle').textContent = result.verdict;
  document.getElementById('verdictMeta').textContent = result.meta;
  document.getElementById('verdictSummary').textContent = result.summary;

  // Confidence ring
  const circumference = 2 * Math.PI * 33;
  const fill = (result.confidence / 100) * circumference;
  setTimeout(() => {
    document.getElementById('ringFill').setAttribute(
      'stroke-dasharray',
      fill + ' ' + (circumference - fill)
    );
  }, 100);
  document.getElementById('ringPct').textContent = result.confidence + '%';

  // Signals grid
  document.getElementById('signalsGrid').innerHTML = result.signals.map(s => `
    <div class="signal-card">
      <div class="signal-head">
        <span class="signal-name">${s.name}</span>
        <span class="signal-badge badge-${s.badge}">${s.badge.toUpperCase()}</span>
      </div>
      <div class="signal-bar-track">
        <div class="signal-bar-fill ${s.bar}" style="width:${s.val}%"></div>
      </div>
      <div class="signal-value">${s.label}</div>
    </div>
  `).join('');

  // Detail list
  document.getElementById('detailList').innerHTML = result.details.map(d => `
    <div class="detail-row">
      <div class="detail-dot ${d.dot}"></div>
      <div class="detail-text">${d.text}</div>
    </div>
  `).join('');

  // Timeline strip
  const timeline = document.getElementById('timeline');
  const colors = { fake: '#ff4d6d', 'likely-fake': '#fbbf24', authentic: '#34d399' };
  const col = colors[result.cls];
  timeline.innerHTML = '';
  for (let i = 0; i < 40; i++) {
    const h = 5 + Math.random() * 20;
    const bar = document.createElement('div');
    bar.className = 'timeline-bar';
    bar.style.height = h + 'px';
    bar.style.background = col;
    bar.style.opacity = 0.3 + (h / 25) * 0.65;
    timeline.appendChild(bar);
  }

  document.getElementById('resultsSection').classList.add('visible', 'fade-in');
}

// ---- Reset ----
function resetScan() {
  document.getElementById('resultsSection').classList.remove('visible');
  document.getElementById('textInput').value = '';
  document.getElementById('urlInput').value = '';
  document.getElementById('progressBar').style.width = '0%';
  document.getElementById('btnText').textContent = 'Analyze Content';
  document.getElementById('ringFill').setAttribute('stroke-dasharray', '0 207');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
