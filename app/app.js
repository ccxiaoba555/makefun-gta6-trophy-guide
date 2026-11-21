// GTA VI trophy guide and tracker: checklist, filters, spoiler-safe mode, detail
// panel with each trophy's guide and clickable source links, roadmap, missable
// warnings, a count tracker for every numbered trophy, and a panel laying out
// the four points where the sources disagree side by side.
// Progress and count values are saved in localStorage and can be exported to a
// file and imported back. Works fully offline: the only file it loads is
// data/trophies.json beside it.
const KEY = 'gta6-trophy-checklist-v2';
const COUNT_KEY = 'gta6-trophy-counts-v1';
const $ = (id) => document.getElementById(id);
const rowsEl = $('rows');
const detailEl = $('detail');
const params = new URLSearchParams(location.search);

let doc = null;
let earned = new Set();
try {
  earned = new Set(JSON.parse(localStorage.getItem(KEY) ?? '[]'));
} catch {
  earned = new Set();
}
let counts = {};
try {
  counts = JSON.parse(localStorage.getItem(COUNT_KEY) ?? '{}');
} catch {
  counts = {};
}

function save() {
  localStorage.setItem(KEY, JSON.stringify([...earned]));
}

function saveCounts() {
  localStorage.setItem(COUNT_KEY, JSON.stringify(counts));
}

function spoilerOn() {
  return $('spoiler').checked;
}

function isHidden(t) {
  return t.hidden && spoilerOn() && !earned.has(t.id);
}

function gradeLabel(g) {
  return g === 'platinum' ? 'Platinum' : g[0].toUpperCase() + g.slice(1);
}

function fmtNum(n) {
  return Number(n).toLocaleString('en-US');
}

function fmtTarget(t) {
  const tr = t.tracking;
  if (!tr) return '';
  if (tr.money) return '$' + fmtNum(tr.target);
  if (tr.unit === '%') return tr.target + '%';
  return fmtNum(tr.target) + ' ' + tr.unit;
}

function getCount(id) {
  const v = Number(counts[id]);
  return Number.isFinite(v) && v >= 0 ? v : 0;
}

function updateProgress() {
  const total = doc.trophies.length;
  const n = earned.size;
  const pct = Math.round((n / total) * 100);
  $('progressText').textContent = `${n} of ${total} earned`;
  $('progressPct').textContent = `${pct}%`;
  $('progressFill').style.width = `${pct}%`;
  const others = total - 1;
  const othersEarned = earned.has(1) ? n - 1 : n;
  $('platText').textContent = othersEarned >= others
    ? 'Platinum earned: Vice Got a Price!'
    : `Platinum: ${othersEarned} of ${others} other trophies`;
}

// Every trophy's name/description/grade is checked against Exophase and every
// method against PowerPyx; count them live from the data instead of hard-coding.
function updateVerifiedCounts() {
  const total = doc.trophies.length;
  const names = doc.trophies.filter((t) => (t.sources || []).some((s) => s.url.includes('exophase.com'))).length;
  const methods = doc.trophies.filter((t) => (t.sources || []).some((s) => s.url.includes('powerpyx.com'))).length;
  const links = doc.trophies.reduce((n, t) => n + (t.sources || []).length, 0);
  const el = $('verifiedCounts');
  if (el) el.textContent = `Verified against the sources: ${names}/${total} names, ${methods}/${total} methods · ${links} source links across ${total} trophies`;
}

function trackerRow(t) {
  const tr = t.tracking;
  const wrap = document.createElement('div');
  wrap.className = 'tracker-box';
  const head = document.createElement('p');
  head.className = 'tracker-head';
  const cur = getCount(t.id);
  const done = cur >= tr.target;
  head.textContent = `${tr.label}: ${tr.money ? '$' + fmtNum(cur) : fmtNum(cur)} of ${fmtTarget(t)}${done ? ' — done!' : ''}`;
  wrap.append(head);
  const bar = document.createElement('div');
  bar.className = 'bar tracker-bar';
  const fill = document.createElement('div');
  fill.className = 'fill';
  fill.style.width = Math.min(100, Math.round((cur / tr.target) * 100)) + '%';
  bar.append(fill);
  wrap.append(bar);
  const row = document.createElement('div');
  row.className = 'tracker-input-row';
  const label = document.createElement('label');
  label.textContent = 'Your progress: ';
  const input = document.createElement('input');
  input.type = 'number';
  input.min = '0';
  input.max = String(tr.total || tr.target);
  input.value = String(cur);
  input.setAttribute('aria-label', `${tr.label} progress for ${t.name}`);
  input.addEventListener('change', () => {
    const v = Math.max(0, Math.min(Number(input.value) || 0, tr.total || tr.target));
    counts[t.id] = v;
    saveCounts();
    showDetail(t);
    renderTracker();
  });
  label.append(input);
  const max = document.createElement('span');
  max.className = 'tracker-max';
  max.textContent = ` / ${fmtTarget(t)}${tr.total ? ` (of ${fmtNum(tr.total)} in the game)` : ''}`;
  row.append(label, max);
  wrap.append(row);
  if (tr.note) {
    const note = document.createElement('p');
    note.className = 'tracker-note';
    note.textContent = tr.note;
    wrap.append(note);
  }
  if (tr.checklist) {
    const ul = document.createElement('ul');
    ul.className = 'tracker-checklist';
    for (const item of tr.checklist) {
      const li = document.createElement('li');
      li.textContent = item;
      ul.append(li);
    }
    wrap.append(ul);
  }
  return wrap;
}

function showDetail(t) {
  if (isHidden(t)) {
    detailEl.innerHTML = '';
    const p = document.createElement('p');
    p.className = 'detail-empty';
    p.textContent = 'Hidden trophy: its name and guide stay hidden until you earn it (or switch spoiler-safe off).';
    detailEl.append(p);
    return;
  }
  detailEl.innerHTML = '';
  const h = document.createElement('h3');
  h.textContent = t.name;
  const meta = document.createElement('p');
  meta.className = 'detail-meta';
  const bits = [`${gradeLabel(t.grade)}`, t.kind, t.missable ? 'Possibly missable' : 'Not missable'];
  if (t.hidden) bits.push('Hidden on PlayStation until earned');
  if (t.tracking) bits.push(`Track: ${fmtTarget(t)}`);
  else if (t.count) bits.push(`Tracked count: ${t.count}`);
  meta.textContent = bits.join(' · ');
  const desc = document.createElement('p');
  desc.className = 'detail-desc';
  desc.textContent = t.description;
  const guide = document.createElement('p');
  guide.className = 'detail-guide';
  guide.textContent = t.guide;
  detailEl.append(h, meta, desc, guide);
  if (t.note) {
    const note = document.createElement('p');
    note.className = 'detail-note';
    note.textContent = t.note;
    detailEl.append(note);
  }
  if (t.tracking) detailEl.append(trackerRow(t));
  // Sources are rendered as real links, each labelled with what it covers.
  const srcTitle = document.createElement('p');
  srcTitle.className = 'detail-sources-title';
  srcTitle.textContent = `Sources (${(t.sources || []).length}):`;
  detailEl.append(srcTitle);
  const srcList = document.createElement('ul');
  srcList.className = 'src-list';
  for (const s of t.sources || []) {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = s.url;
    a.target = '_blank';
    a.rel = 'noopener';
    a.textContent = s.name;
    li.append(a);
    if (s.covers) {
      li.append(document.createTextNode(` — covers ${s.covers}`));
    }
    srcList.append(li);
  }
  detailEl.append(srcList);
  const earnedBtn = document.createElement('button');
  earnedBtn.type = 'button';
  earnedBtn.textContent = earned.has(t.id) ? 'Mark as unearned' : 'Mark as earned';
  earnedBtn.addEventListener('click', () => {
    if (earned.has(t.id)) earned.delete(t.id);
    else earned.add(t.id);
    save();
    render();
    showDetail(t);
  });
  detailEl.append(earnedBtn);
}

function matchesFilters(t) {
  const q = $('search').value.trim().toLowerCase();
  if (q && !(t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q))) return false;
  if ($('kind').value !== 'all' && t.kind !== $('kind').value) return false;
  if ($('grade').value !== 'all' && t.grade !== $('grade').value) return false;
  const ef = $('earnedFilter').value;
  if (ef === 'earned' && !earned.has(t.id)) return false;
  if (ef === 'unearned' && earned.has(t.id)) return false;
  if ($('missableOnly').checked && !t.missable) return false;
  return true;
}

function render() {
  updateProgress();
  rowsEl.replaceChildren();
  let shown = 0;
  for (const t of doc.trophies) {
    if (!matchesFilters(t)) continue;
    shown += 1;
    const li = document.createElement('li');
    li.className = 'card' + (earned.has(t.id) ? ' earned' : '');
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = earned.has(t.id);
    box.setAttribute('aria-label', `Mark ${t.name} as earned`);
    box.addEventListener('change', () => {
      if (box.checked) earned.add(t.id);
      else earned.delete(t.id);
      save();
      render();
    });
    const body = document.createElement('button');
    body.type = 'button';
    body.className = 'card-body';
    const name = document.createElement('span');
    name.className = 'card-name';
    name.textContent = isHidden(t) ? 'Hidden trophy' : t.name;
    const desc = document.createElement('span');
    desc.className = 'card-desc';
    desc.textContent = isHidden(t) ? 'Hidden on PlayStation until earned.' : t.description;
    const tags = document.createElement('span');
    tags.className = 'card-tags';
    const g = document.createElement('span');
    g.className = 'badge grade-' + t.grade;
    g.textContent = gradeLabel(t.grade);
    tags.append(g);
    const k = document.createElement('span');
    k.className = 'tag';
    k.textContent = t.kind;
    tags.append(k);
    if (t.tracking) {
      const c = document.createElement('span');
      c.className = 'tag count-tag';
      const cur = getCount(t.id);
      c.textContent = t.tracking.money
        ? `$${fmtNum(cur)} / $${fmtNum(t.tracking.target)}`
        : `${fmtNum(cur)} / ${fmtTarget(t)}`;
      tags.append(c);
    }
    if (t.missable) {
      const m = document.createElement('span');
      m.className = 'tag missable';
      m.textContent = 'Possibly missable';
      tags.append(m);
    }
    if (t.hidden && !earned.has(t.id)) {
      const h = document.createElement('span');
      h.className = 'tag';
      h.textContent = 'Hidden';
      tags.append(h);
    }
    body.append(name, desc, tags);
    body.addEventListener('click', () => showDetail(t));
    li.append(box, body);
    rowsEl.append(li);
  }
  $('listCount').textContent = `Showing ${shown} of ${doc.trophies.length} trophies`;
}

function buildRoadmap() {
  const steps = [
    ['Play the story in order', 'Chapters 1 to 4, the named story missions and the final mission pop 13 hidden trophies on their own. No preparation needed.'],
    ['Clear the stranger strands as you go — but don’t panic', 'Andy, Kenton, Billy, Randy and Tyrone each end in a hidden final mission. PowerPyx and KeenGamer both report that every stranger mission giver returns in free roam after the finale, so none of these strands is missable. Meditate at every spot you find, since Positive Mental Attitude is the one trophy flagged as possibly missable.'],
    ['Decide carefully', 'Actions Speak Louder is about choices made for better or worse. Keep a separate save before big story decisions.'],
    ['Work the activities', 'Shooting Range gold medals (42 challenges), 250 stunts, 20 race wins, drone races at every location, fishing against Cal and one arcade game.'],
    ['Sweep the collectibles', '3 card sets, 100 WAiNK scans, 100 vehicles discovered, 10 vehicles registered, all garage properties, and exploring all of Leonida.'],
    ['Clean up the grinds', '50 challenges, 5 bank vaults, armored trucks, gang operations, $250,000 laundered, $100,000 spent, and 100% completion for the gold A Long Road.'],
    ['Platinum', 'Vice Got a Price! pops when the other 54 are done.'],
  ];
  const ol = $('roadmapList');
  for (const [title, text] of steps) {
    const li = document.createElement('li');
    const b = document.createElement('strong');
    b.textContent = title;
    li.append(b, document.createTextNode(': ' + text));
    ol.append(li);
  }
}

function buildMissable() {
  const ul = $('missableList');
  for (const t of doc.trophies.filter((x) => x.missable)) {
    const li = document.createElement('li');
    const b = document.createElement('strong');
    b.textContent = t.name;
    li.append(b, document.createTextNode(' — ' + t.description + ' '));
    const note = document.createElement('span');
    note.textContent = 'Flagged by PowerPyx and KeenGamer as the only possibly missable trophy: the Chapter 1 meditation at Jason’s home may not be repeatable, so meditate at each spot as you find it.';
    li.append(note);
    ul.append(li);
  }
  const extra = document.createElement('li');
  const b = document.createElement('strong');
  b.textContent = 'Actions Speak Louder — decision reminder, not missable';
  extra.append(b, document.createTextNode(' — keep a separate save before big story decisions, so a choice can be revisited.'));
  ul.append(extra);
  const fix = document.createElement('li');
  fix.textContent = 'Correction: the five stranger strands (Andy, Kenton, Billy, Randy, Tyrone) were listed as missable in an earlier version of this guide. PowerPyx and KeenGamer both say their givers return in free roam after the finale, so they are not missable.';
  ul.append(fix);
}

// Where the sources disagree, both sides are shown — the guide does not pick one.
const DISAGREEMENTS = [
  {
    title: 'How many trophies are missable?',
    sideA: 'This guide (earlier version): 7 — the five stranger strands plus Positive Mental Attitude and Actions Speak Louder.',
    sideB: 'PowerPyx and KeenGamer: only 1 is possibly missable — Positive Mental Attitude (the Chapter 1 meditation at Jason’s home). All stranger mission givers return in free roam after the finale.',
    verdict: 'This guide now follows PowerPyx / KeenGamer: 1 possibly missable, and Actions Speak Louder is a save-before-you-decide reminder, not a missable flag.',
  },
  {
    title: 'How many collectible card sets are there — 18 or 15?',
    sideA: 'PowerPyx and sixshore: 18 sets in the game; the trophy needs any 3 of them.',
    sideB: 'KeenGamer: “15 sets” — but that number appears in its 100% completion checklist paragraph, a different measure from the trophy total.',
    verdict: 'Different measures, not a real contradiction: 18 sets exist for the trophy; 15 is a checklist figure.',
  },
  {
    title: 'Does the Chapter 1 meditation count toward Positive Mental Attitude?',
    sideA: 'PowerPyx: meditating on Jason’s balcony at home in Chapter 1 adds +1 to the counter.',
    sideB: 'PowerPyx, same page: it is currently unclear whether that first meditation counts toward the trophy requirement.',
    verdict: 'Unconfirmed. Meditate there anyway while you can — it costs nothing and may count.',
  },
  {
    title: 'How many chapters is the story?',
    sideA: 'PowerPyx guide text: the story is split into 5 chapters; chapter trophies run to Chapter 4, and Operation Savage Glory sits in its Chapter 5.',
    sideB: 'The trophy list itself: chapter trophies run to Chapter 4, then the final mission.',
    verdict: 'A naming difference only — chapter numbering does not change any trophy requirement.',
  },
];

function buildDisagreements() {
  const wrap = $('disagreementList');
  if (!wrap) return;
  for (const d of DISAGREEMENTS) {
    const div = document.createElement('div');
    div.className = 'disagreement';
    const h = document.createElement('h3');
    h.textContent = d.title;
    const a = document.createElement('p');
    a.innerHTML = '';
    const aLabel = document.createElement('strong');
    aLabel.textContent = 'Side A: ';
    a.append(aLabel, document.createTextNode(d.sideA));
    const b = document.createElement('p');
    const bLabel = document.createElement('strong');
    bLabel.textContent = 'Side B: ';
    b.append(bLabel, document.createTextNode(d.sideB));
    const v = document.createElement('p');
    v.className = 'disagreement-verdict';
    const vLabel = document.createElement('strong');
    vLabel.textContent = 'How this guide handles it: ';
    v.append(vLabel, document.createTextNode(d.verdict));
    div.append(h, a, b, v);
    wrap.append(div);
  }
}

function renderTracker() {
  const wrap = $('trackerList');
  if (!wrap) return;
  wrap.replaceChildren();
  const tracked = doc.trophies.filter((t) => t.tracking);
  for (const t of tracked) {
    const tr = t.tracking;
    const div = document.createElement('div');
    div.className = 'tracker-row';
    const head = document.createElement('button');
    head.type = 'button';
    head.className = 'tracker-row-head';
    const cur = getCount(t.id);
    head.textContent = `${t.name} — ${tr.money ? '$' + fmtNum(cur) + ' / $' + fmtNum(tr.target) : fmtNum(cur) + ' / ' + fmtTarget(t)}`;
    head.addEventListener('click', () => showDetail(t));
    const bar = document.createElement('div');
    bar.className = 'bar tracker-bar';
    const fill = document.createElement('div');
    fill.className = 'fill';
    fill.style.width = Math.min(100, Math.round((cur / tr.target) * 100)) + '%';
    bar.append(fill);
    div.append(head, bar);
    wrap.append(div);
  }
  const summary = $('trackerSummary');
  if (summary) {
    const done = tracked.filter((t) => getCount(t.id) >= t.tracking.target).length;
    summary.textContent = `${tracked.length} trophies have a number to chase · ${done} targets reached`;
  }
}

function applyUrlParams() {
  const grade = params.get('grade');
  if (grade && ['platinum', 'gold', 'silver', 'bronze'].includes(grade)) $('grade').value = grade;
  const kind = params.get('kind');
  if (kind && ['story', 'collectible', 'combat', 'exploration', 'driving', 'misc'].includes(kind)) $('kind').value = kind;
  if (params.get('filter') === 'missable') $('missableOnly').checked = true;
  if (params.get('spoiler') === 'on') $('spoiler').checked = true;
  if (params.get('earned') === 'unearned') $('earnedFilter').value = 'unearned';
  const q = params.get('q');
  if (q) $('search').value = q;
}

async function init() {
  doc = await (await fetch('data/trophies.json')).json();
  applyUrlParams();
  updateVerifiedCounts();
  buildRoadmap();
  buildMissable();
  buildDisagreements();
  renderTracker();
  render();
  const trophyId = Number(params.get('trophy'));
  if (trophyId) {
    const t = doc.trophies.find((x) => x.id === trophyId);
    if (t) showDetail(t);
  }
  if (params.get('view') === 'roadmap') {
    $('roadmap').scrollIntoView({ block: 'start' });
  }
  if (params.get('view') === 'missable') {
    $('missable').scrollIntoView({ block: 'start' });
  }
  if (params.get('view') === 'disagreements') {
    $('disagreements').scrollIntoView({ block: 'start' });
  }
  if (params.get('view') === 'tracker') {
    $('tracker').scrollIntoView({ block: 'start' });
  }
  if (params.get('view') === 'list') {
    $('listTitle').scrollIntoView({ block: 'start' });
  }
}

for (const id of ['search', 'kind', 'grade', 'earnedFilter', 'missableOnly', 'spoiler']) {
  $(id).addEventListener('input', render);
  $(id).addEventListener('change', render);
}

$('export').addEventListener('click', () => {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify({ earned: [...earned], counts }, null, 2)], { type: 'application/json' }));
  a.download = 'gta6-trophy-progress.json';
  a.click();
});

$('import').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    const ids = Array.isArray(data) ? data : data.earned;
    earned = new Set(ids.filter((n) => Number.isInteger(n) && n >= 1 && n <= 55));
    if (data.counts && typeof data.counts === 'object') {
      counts = {};
      for (const [k, v] of Object.entries(data.counts)) {
        const n = Number(v);
        if (Number.isInteger(Number(k)) && Number.isFinite(n) && n >= 0) counts[Number(k)] = n;
      }
      saveCounts();
    }
    save();
    render();
    renderTracker();
  } catch {
    alert('That file is not a valid progress export.');
  }
});

init();
