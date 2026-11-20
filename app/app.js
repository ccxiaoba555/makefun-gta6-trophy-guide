// GTA VI trophy guide and tracker: checklist, filters, spoiler-safe mode, detail
// panel with each trophy's guide and sources, roadmap and missable warnings.
// Progress is saved in localStorage and can be exported to a file and imported back.
// Works fully offline: the only file it loads is data/trophies.json beside it.
const KEY = 'gta6-trophy-checklist-v2';
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

function save() {
  localStorage.setItem(KEY, JSON.stringify([...earned]));
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
  const bits = [`${gradeLabel(t.grade)}`, t.kind, t.missable ? 'Missable' : 'Not missable'];
  if (t.hidden) bits.push('Hidden on PlayStation until earned');
  if (t.count) bits.push(`Tracked count: ${t.count}`);
  meta.textContent = bits.join(' · ');
  const desc = document.createElement('p');
  desc.className = 'detail-desc';
  desc.textContent = t.description;
  const guide = document.createElement('p');
  guide.className = 'detail-guide';
  guide.textContent = t.guide;
  const src = document.createElement('p');
  src.className = 'detail-sources';
  src.textContent = 'Sources: ' + (t.sources || []).join(', ');
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
  detailEl.append(h, meta, desc, guide, src, earnedBtn);
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
    if (t.missable) {
      const m = document.createElement('span');
      m.className = 'tag missable';
      m.textContent = 'Missable';
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
    ['Clear the stranger strands early', 'Andy, Kenton, Billy, Randy and Tyrone each end in a hidden final mission, and player guides report their strands have windows tied to story progress. Finish each strand as it appears, and meditate at every spot you find, since Positive Mental Attitude is the one trophy flagged as possibly missable.'],
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
    note.textContent = t.id === 28
      ? 'Flagged by player guides as the only possibly missable trophy: meditate at each spot as you find it.'
      : t.id === 48
        ? 'The description points to choices; keep a separate save before big decisions.'
        : 'Player guides report this stranger strand has a window tied to story progress; finish it promptly.';
    li.append(note);
    ul.append(li);
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
  buildRoadmap();
  buildMissable();
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
  a.href = URL.createObjectURL(new Blob([JSON.stringify({ earned: [...earned] }, null, 2)], { type: 'application/json' }));
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
    save();
    render();
  } catch {
    alert('That file is not a valid progress export.');
  }
});

init();
