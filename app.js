// ═══════════════════════════════════════════════════
//  FORGE PERSO — Configuration
// ═══════════════════════════════════════════════════

// 👉 Colle ta clé API Anthropic ici
const API_KEY = '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'; // sk-ant-...

// ═══════════════════════════════════════════════════
//  DONNÉES INITIALES
// ═══════════════════════════════════════════════════
const LS = {
  get: k => { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } },
  set: (k, v) => localStorage.setItem(k, JSON.stringify(v)),
};

function uid() { return Math.random().toString(36).slice(2,9); }
function today() { return new Date().toISOString().slice(0,10); }
function now() { return new Date().toLocaleTimeString('fr-FR', {hour:'2-digit',minute:'2-digit'}); }
function fmtDate(iso) { return new Date(iso).toLocaleDateString('fr-FR',{day:'numeric',month:'short'}); }

// ── State ─────────────────────────────────────────
let data = LS.get('forge_data') || initData();

function initData() {
  return {
    xp: 1240,
    streak: 7,
    streakRecord: 14,
    lastReset: today(),
    todayXP: 120,
    focusMin: 75,
    habits: [
      { id:uid(), name:'Réveil 6h00',    emoji:'⏰', xp:50, pillar:'discipline', streak:7,  done:true  },
      { id:uid(), name:'Entraînement',   emoji:'💪', xp:80, pillar:'physique',   streak:5,  done:true  },
      { id:uid(), name:'Lecture 20 min', emoji:'📖', xp:40, pillar:'ambition',   streak:3,  done:false },
      { id:uid(), name:'Méditation',     emoji:'🧘', xp:30, pillar:'discipline', streak:7,  done:false },
      { id:uid(), name:'Douche froide',  emoji:'❄️', xp:45, pillar:'physique',   streak:2,  done:false },
    ],
    sport: {
      weight: 78, height: 181, age: '22',
      goals: ['masse'], sports: ['musculation'],
      frequency: 4, sessionDuration: 60,
      programGenerated: true,
    },
    calEvents: [
      { id:uid(), name:'Maths',    day:0, hour:8,  color:'blue'   },
      { id:uid(), name:'Physique', day:2, hour:9,  color:'blue'   },
      { id:uid(), name:'Sport 💪', day:1, hour:7,  color:'green'  },
      { id:uid(), name:'Sport 💪', day:3, hour:7,  color:'green'  },
      { id:uid(), name:'Chimie',   day:4, hour:13, color:'red'    },
      { id:uid(), name:'Focus',    day:1, hour:15, color:'purple' },
    ],
  };
}

function save() { LS.set('forge_data', data); }

// Pillar scores calculés depuis les habitudes
function pillarScore(pillar) {
  const h = data.habits.filter(x => x.pillar === pillar);
  if (!h.length) return 0;
  const avgStreak = h.reduce((s,x) => s+x.streak,0) / h.length;
  const doneRatio = h.filter(x=>x.done).length / h.length;
  return Math.min(100, Math.round(avgStreak * 5 + doneRatio * 50));
}

// Daily reset
function checkReset() {
  if (data.lastReset === today()) return;
  data.habits.forEach(h => {
    if (h.done) h.streak++;
    else if (h.streak > 0) h.streak = 0;
    h.done = false;
  });
  data.lastReset = today();
  data.todayXP = 0;
  save();
}
checkReset();

// ── Navigation ────────────────────────────────────
let currentTab = '';
function go(tab) {
  currentTab = tab;
  document.querySelectorAll('.view').forEach(v => v.classList.remove('on'));
  document.querySelectorAll('.sb-btn,.mnav-btn').forEach(b => b.classList.remove('on'));
  document.getElementById('view-'+tab)?.classList.add('on');
  document.querySelectorAll(`[data-tab="${tab}"]`).forEach(b => b.classList.add('on'));
  const renders = { dashboard:renderDashboard, habits:renderHabits, sport:renderSport, calendar:renderCalendar, scanner:renderScanner };
  if (renders[tab]) renders[tab]();
  document.getElementById('main')?.scrollTo(0,0);
}

// ── Notification ──────────────────────────────────
let _notifT;
function notif(icon, text) {
  const el = document.getElementById('notif');
  el.innerHTML = `${icon} ${text}`;
  el.classList.add('on');
  clearTimeout(_notifT);
  _notifT = setTimeout(() => el.classList.remove('on'), 3000);
}

// ── Modals ────────────────────────────────────────
function openModal(id) { document.getElementById(id).classList.add('on'); }
function closeModal(id) { document.getElementById(id).classList.remove('on'); }

// ══════════════════════════════════════════════════
//  DASHBOARD
// ══════════════════════════════════════════════════
function renderDashboard() {
  const disc = pillarScore('discipline');
  const phys = pillarScore('physique');
  const ambi = pillarScore('ambition');
  const done = data.habits.filter(h=>h.done);
  const accent = '#C8FF00';

  document.getElementById('view-dashboard').innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px">
      <div>
        <div class="label" style="margin-bottom:4px">${new Date().toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long'})}</div>
        <div class="title">Bonjour 👋</div>
      </div>
      <div style="text-align:right">
        <div class="xp-big" style="font-size:26px">${data.xp.toLocaleString('fr-FR')}</div>
        <div class="label">XP TOTAL</div>
      </div>
    </div>

    <!-- Pillars -->
    <div class="dash-row" style="margin-bottom:12px">
      ${pillarCard('⚔️','Discipline',disc,accent,'rgba(200,255,0,.1)','rgba(200,255,0,.2)')}
      ${pillarCard('💪','Physique',phys,'var(--blue)','rgba(79,172,254,.1)','rgba(79,172,254,.2)')}
    </div>
    <div style="margin-bottom:12px">
      ${pillarCard('🎯','Ambition',ambi,'var(--gold)','rgba(255,209,102,.1)','rgba(255,209,102,.2)')}
    </div>

    <!-- Stats row -->
    <div class="dash-row-3" style="margin-bottom:12px">
      <div class="card" style="padding:14px;text-align:center">
        <div class="streak-num" style="font-size:26px">🔥 ${data.streak}</div>
        <div class="label" style="margin-top:4px">Streak</div>
      </div>
      <div class="card" style="padding:14px;text-align:center">
        <div style="font-family:'JetBrains Mono',monospace;font-size:22px;font-weight:700;color:${accent}">${done.length}/${data.habits.length}</div>
        <div class="label" style="margin-top:4px">Habitudes</div>
      </div>
      <div class="card" style="padding:14px;text-align:center">
        <div style="font-family:'JetBrains Mono',monospace;font-size:22px;font-weight:700;color:var(--blue)">+${data.todayXP}</div>
        <div class="label" style="margin-top:4px">XP auj.</div>
      </div>
    </div>

    <!-- Quick actions -->
    <div class="card" style="padding:14px">
      <div class="label" style="margin-bottom:10px">Accès rapide</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button onclick="go('habits')" class="btn-ghost">☑ Habitudes</button>
        <button onclick="go('chat')" class="btn-ghost" style="border-color:rgba(200,255,0,.3);color:var(--accent)">✦ Conseiller IA</button>
        <button onclick="go('scanner')" class="btn-ghost">📷 Scanner EDT</button>
        <button onclick="go('sport')" class="btn-ghost">⚡ Sport</button>
      </div>
    </div>`;

  // Animate bars
  setTimeout(() => {
    document.querySelectorAll('.pbar').forEach(b => b.style.width = b.dataset.pct+'%');
  }, 100);
}

function pillarCard(icon, name, score, color, iconBg, iconBorder) {
  return `<div class="card pillar-card">
    <div class="pillar-top">
      <div>
        <div class="label" style="margin-bottom:4px">${name.toUpperCase()}</div>
        <div class="pillar-score" style="color:${color}">${score}</div>
      </div>
      <div class="pillar-icon" style="background:${iconBg};border:1px solid ${iconBorder}">${icon}</div>
    </div>
    <div class="bar-wrap"><div class="bar-fill pbar" data-pct="${score}" style="width:0%;background:${color}"></div></div>
  </div>`;
}

// ══════════════════════════════════════════════════
//  HABITUDES
// ══════════════════════════════════════════════════
function renderHabits() {
  const done = data.habits.filter(h=>h.done);
  document.getElementById('view-habits').innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
      <div class="title">Habitudes</div>
      <div style="display:flex;align-items:center;gap:8px">
        <span class="tag tag-a">${done.length}/${data.habits.length}</span>
        <button onclick="openHabitModal(null)" class="btn" style="padding:8px 14px;font-size:11px">+ Ajouter</button>
      </div>
    </div>
    <div style="display:flex;flex-direction:column;gap:7px" id="habits-list">
      ${data.habits.map(h => habitHTML(h)).join('')}
    </div>
    ${!data.habits.length ? `<div style="text-align:center;padding:60px;color:var(--muted)">Aucune habitude — clique + Ajouter</div>` : ''}`;
}

function habitHTML(h) {
  const colors = { discipline:'#C8FF00', physique:'var(--blue)', ambition:'var(--gold)', sport:'var(--purple)' };
  const c = colors[h.pillar] || '#C8FF00';
  return `<div class="habit-item ${h.done?'done':''}" id="h-${h.id}">
    <div class="hcheck ${h.done?'done':''}" onclick="toggleHabit('${h.id}')">
      <svg width="10" height="8" viewBox="0 0 10 8"><polyline points="1,4 3.5,7 9,1" fill="none" stroke="#000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </div>
    <div class="hemoji">${h.emoji}</div>
    <div class="hinfo">
      <div class="hname">${h.name}</div>
      <div class="hmeta">
        <span style="font-family:'JetBrains Mono',monospace;font-size:9px;color:${c}">🔥 ${h.streak}j</span>
        <span style="font-family:'JetBrains Mono',monospace;font-size:9px;color:var(--muted)">+${h.xp} XP</span>
        <span style="font-family:'JetBrains Mono',monospace;font-size:7px;color:${c};background:${c}15;border:1px solid ${c}35;padding:1px 5px;border-radius:3px;letter-spacing:1px">${h.pillar.toUpperCase()}</span>
      </div>
    </div>
    <div class="hactions">
      <button class="hbtn" onclick="openHabitModal('${h.id}')">✏️</button>
      <button class="hbtn del" onclick="delHabit('${h.id}')">🗑</button>
    </div>
  </div>`;
}

function toggleHabit(id) {
  const h = data.habits.find(x=>x.id===id);
  if (!h) return;
  h.done = !h.done;
  if (h.done) { data.xp += h.xp; data.todayXP += h.xp; notif('⚡', `${h.name} — +${h.xp} XP`); }
  else { data.xp = Math.max(0, data.xp - h.xp); data.todayXP = Math.max(0, data.todayXP - h.xp); }
  save(); renderHabits();
}

function delHabit(id) {
  if (!confirm('Supprimer ?')) return;
  data.habits = data.habits.filter(h=>h.id!==id);
  save(); renderHabits(); notif('🗑️','Habitude supprimée');
}

let _editingHabit = null;
function openHabitModal(idOrNull) {
  _editingHabit = idOrNull ? data.habits.find(h=>h.id===idOrNull) : null;
  const e = _editingHabit;
  const pillars = [['discipline','⚔️ Discipline'],['physique','💪 Physique'],['ambition','🎯 Ambition']];
  document.getElementById('habit-modal-body').innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:18px">
      <div class="title" style="font-size:17px">${e?'Modifier':'Nouvelle habitude'}</div>
      <button onclick="closeModal('habit-modal')" style="color:var(--muted);font-size:18px;line-height:1">✕</button>
    </div>
    <div style="display:flex;flex-direction:column;gap:13px">
      <div><div class="label" style="margin-bottom:5px">Nom</div><input id="hm-name" class="input" placeholder="Ex: Méditation 10 min" value="${e?.name||''}"></div>
      <div style="display:grid;grid-template-columns:80px 1fr;gap:10px">
        <div><div class="label" style="margin-bottom:5px">Emoji</div><input id="hm-emoji" class="input" placeholder="🔥" value="${e?.emoji||'📌'}" style="text-align:center"></div>
        <div><div class="label" style="margin-bottom:5px">XP (+${e?.xp||40})</div><div class="slider-row"><input type="range" id="hm-xp" min="10" max="100" step="5" value="${e?.xp||40}" oninput="document.getElementById('hm-xp-v').textContent=this.value+' XP'"><span id="hm-xp-v" class="sval">${e?.xp||40} XP</span></div></div>
      </div>
      <div><div class="label" style="margin-bottom:6px">Pilier</div><div class="chips">${pillars.map(([v,l])=>`<button class="chip ${(e?.pillar||'discipline')===v?'on':''}" onclick="selectChip(this,'hm-pillar')" data-val="${v}">${l}</button>`).join('')}</div></div>
      <button class="btn" onclick="saveHabit()" style="margin-top:4px">✓ Enregistrer</button>
    </div>`;
  openModal('habit-modal');
}

function selectChip(btn, group) {
  btn.closest('.chips').querySelectorAll('.chip').forEach(b=>b.classList.remove('on'));
  btn.classList.add('on');
}

function saveHabit() {
  const name = document.getElementById('hm-name').value.trim();
  if (!name) return;
  const emoji = document.getElementById('hm-emoji').value || '📌';
  const xp = parseInt(document.getElementById('hm-xp').value);
  const pillar = document.querySelector('#habit-modal-body .chip.on')?.dataset.val || 'discipline';
  if (_editingHabit) { Object.assign(_editingHabit, {name,emoji,xp,pillar}); }
  else { data.habits.push({id:uid(),name,emoji,xp,pillar,streak:0,done:false}); }
  save(); closeModal('habit-modal'); renderHabits(); notif('✅','Habitude sauvegardée');
}

// ══════════════════════════════════════════════════
//  SPORT
// ══════════════════════════════════════════════════
function renderSport() {
  const s = data.sport;
  const bmi = (s.weight / Math.pow(s.height/100, 2)).toFixed(1);
  const imcPct = Math.min(100, Math.max(0, (parseFloat(bmi)-15)/25*100));
  document.getElementById('view-sport').innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
      <div class="title">Sport</div>
      ${s.programGenerated ? '<span class="tag tag-a">Programme actif</span>' : '<span class="tag tag-g">Aucun programme</span>'}
    </div>
    <div class="sport-tabs">
      <button class="stab on" onclick="switchSport('profile',this)">Profil</button>
      <button class="stab" onclick="switchSport('config',this)">Configurer</button>
      <button class="stab" onclick="switchSport('prog',this)">Entraînements</button>
    </div>

    <!-- Profil physique -->
    <div id="sp-profile" class="spanel on">
      <div class="dash-row" style="margin-bottom:12px">
        <div class="card" style="padding:14px;text-align:center"><div style="font-family:'JetBrains Mono',monospace;font-size:28px;font-weight:700;color:#C8FF00" id="disp-weight">${s.weight} kg</div><div class="label">Poids</div></div>
        <div class="card" style="padding:14px;text-align:center"><div style="font-family:'JetBrains Mono',monospace;font-size:28px;font-weight:700;color:var(--blue)" id="disp-height">${s.height} cm</div><div class="label">Taille</div></div>
      </div>
      <div class="card" style="padding:14px;margin-bottom:12px">
        <div style="display:flex;justify-content:space-between;margin-bottom:8px">
          <div class="label">IMC</div>
          <div style="font-family:'JetBrains Mono',monospace;font-size:11px;color:#C8FF00" id="disp-bmi">${bmi} — ${imcCat(parseFloat(bmi))}</div>
        </div>
        <div style="height:8px;border-radius:4px;background:linear-gradient(to right,#4facfe,#C8FF00,#ffd166,#ff5e5e);position:relative">
          <div id="imc-cursor" style="position:absolute;top:-4px;width:2px;height:16px;background:#fff;border-radius:1px;left:${imcPct}%;transform:translateX(-50%);box-shadow:0 0 8px rgba(255,255,255,.6)"></div>
        </div>
        <div style="display:flex;justify-content:space-between;margin-top:4px">
          <span style="font-family:'JetBrains Mono',monospace;font-size:7px;color:var(--blue)">Maigre &lt;18.5</span>
          <span style="font-family:'JetBrains Mono',monospace;font-size:7px;color:#C8FF00">Normal 18.5–25</span>
          <span style="font-family:'JetBrains Mono',monospace;font-size:7px;color:var(--gold)">Surpoids 25–30</span>
          <span style="font-family:'JetBrains Mono',monospace;font-size:7px;color:var(--red)">Obésité &gt;30</span>
        </div>
      </div>
      <div class="card" style="padding:16px">
        <div class="label" style="margin-bottom:12px">Modifier</div>
        <div style="display:flex;flex-direction:column;gap:10px">
          <div>
            <div class="label" style="margin-bottom:4px">Poids (kg)</div>
            <div class="slider-row"><input type="range" id="s-weight" min="40" max="160" value="${s.weight}" oninput="updateBMI()"><span id="s-wv" class="sval">${s.weight} kg</span></div>
          </div>
          <div>
            <div class="label" style="margin-bottom:4px">Taille (cm)</div>
            <div class="slider-row"><input type="range" id="s-height" min="140" max="220" value="${s.height}" oninput="updateBMI()"><span id="s-hv" class="sval">${s.height} cm</span></div>
          </div>
          <div>
            <div class="label" style="margin-bottom:4px">Âge</div>
            <input id="s-age" class="input" type="number" placeholder="22" value="${s.age||22}" style="width:100px">
          </div>
          <button class="btn" onclick="saveSport()" style="margin-top:4px">💾 Sauvegarder</button>
        </div>
      </div>
    </div>

    <!-- Configuration programme -->
    <div id="sp-config" class="spanel">
      <div style="display:flex;flex-direction:column;gap:14px">
        <div class="card" style="padding:16px">
          <div class="label" style="margin-bottom:8px">Type de sport</div>
          <div class="chips">
            ${[['calisthenics','🤸 Callisthénie'],['musculation','🏋️ Musculation salle'],['running','🏃 Running'],['crossfit','🔄 CrossFit'],['yoga','🧘 Yoga / Mobilité'],['boxe','🥊 Boxe / MMA']].map(([v,l])=>`<button class="chip ${(s.sports||[]).includes(v)?'on':''}" onclick="this.classList.toggle('on')" data-sport="${v}">${l}</button>`).join('')}
          </div>
        </div>
        <div class="card" style="padding:16px">
          <div class="label" style="margin-bottom:8px">Matériel disponible</div>
          <div class="chips">
            ${[['rien','🏠 Poids de corps uniquement'],['barre_traction','🔝 Barre de traction'],['anneaux','⭕ Anneaux'],['parallettes','🤸 Parallettes'],['elastiques','🎗️ Élastiques'],['kettlebell','🔔 Kettlebell'],['halteres','🏋️ Haltères'],['full_gym','🏢 Salle complète'],['barre','📊 Barre + disques']].map(([v,l])=>`<button class="chip ${(s.equipment||[]).includes(v)?'on':''}" onclick="this.classList.toggle('on')" data-equip="${v}">${l}</button>`).join('')}
          </div>
        </div>
        <div class="card" style="padding:16px">
          <div class="label" style="margin-bottom:8px">Objectif principal</div>
          <div class="chips">
            ${[['force','🏆 Force'],['masse','💪 Masse / Hypertrophie'],['seche','🔥 Sèche / Perte de gras'],['endurance','🏃 Endurance'],['mobilite','🧘 Mobilité / Souplesse'],['athletisme','⚡ Athlétisme']].map(([v,l])=>`<button class="chip ${(s.goals||[]).includes(v)?'on':''}" onclick="this.classList.toggle('on')" data-goal="${v}">${l}</button>`).join('')}
          </div>
        </div>
        <div class="card" style="padding:16px">
          <div>
            <div class="label" style="margin-bottom:4px">Séances / semaine</div>
            <div class="slider-row"><input type="range" id="s-freq" min="2" max="7" step="1" value="${s.frequency||4}" oninput="document.getElementById('s-fv').textContent=this.value+'x / semaine'"><span id="s-fv" class="sval">${s.frequency||4}x / semaine</span></div>
          </div>
          <div style="margin-top:12px">
            <div class="label" style="margin-bottom:4px">Durée séance (min)</div>
            <div class="slider-row"><input type="range" id="s-dur" min="20" max="120" step="5" value="${s.sessionDuration||60}" oninput="document.getElementById('s-dv').textContent=this.value+' min'"><span id="s-dv" class="sval">${s.sessionDuration||60} min</span></div>
          </div>
          <div style="margin-top:12px">
            <div class="label" style="margin-bottom:4px">Niveau</div>
            <div class="chips">
              ${[['debutant','🌱 Débutant'],['intermediaire','💪 Intermédiaire'],['avance','🔥 Avancé']].map(([v,l])=>`<button class="chip ${(s.level||'intermediaire')===v?'on':''}" onclick="selectOneChip(this,'data-level')" data-level="${v}">${l}</button>`).join('')}
            </div>
          </div>
        </div>
        <button class="btn" onclick="generateProg()" style="padding:14px;font-size:13px">⚡ Générer mon programme personnalisé</button>
      </div>
    </div>

    <!-- Programme généré -->
    <div id="sp-prog" class="spanel">
      <div id="prog-content">
        ${s.programGenerated ? buildProgHTML(s) : '<div style="text-align:center;padding:60px;color:var(--muted)"><div style="font-size:32px;margin-bottom:12px">🏋️</div><div>Configure et génère ton programme dans l\'onglet "Configurer"</div></div>'}
      </div>
    </div>`;
}

function imcCat(b) { return b<18.5?'Insuffisance pondérale':b<25?'Poids normal':b<30?'Surpoids':'Obésité'; }

function updateBMI() {
  const w = parseFloat(document.getElementById('s-weight').value);
  const h = parseFloat(document.getElementById('s-height').value);
  document.getElementById('s-wv').textContent = w + ' kg';
  document.getElementById('s-hv').textContent = h + ' cm';
  const bmi = (w / Math.pow(h/100, 2)).toFixed(1);
  const imcPct = Math.min(100, Math.max(0, (parseFloat(bmi)-15)/25*100));
  const dispW = document.getElementById('disp-weight');
  const dispH = document.getElementById('disp-height');
  const dispB = document.getElementById('disp-bmi');
  const cursor = document.getElementById('imc-cursor');
  if (dispW) dispW.textContent = w + ' kg';
  if (dispH) dispH.textContent = h + ' cm';
  if (dispB) dispB.textContent = bmi + ' — ' + imcCat(parseFloat(bmi));
  if (cursor) cursor.style.left = imcPct + '%';
}

function switchSport(tab, btn) {
  document.querySelectorAll('#view-sport .stab').forEach(b=>b.classList.remove('on'));
  document.querySelectorAll('#view-sport .spanel').forEach(p=>p.classList.remove('on'));
  btn.classList.add('on');
  document.getElementById('sp-'+tab).classList.add('on');
}

function selectOneChip(btn, attr) {
  btn.closest('.chips').querySelectorAll('.chip').forEach(b=>b.classList.remove('on'));
  btn.classList.add('on');
}

function saveSport() {
  const w = document.getElementById('s-weight');
  const h = document.getElementById('s-height');
  const a = document.getElementById('s-age');
  if (w) data.sport.weight = parseFloat(w.value);
  if (h) data.sport.height = parseFloat(h.value);
  if (a) data.sport.age = a.value;
  save(); notif('💾','Profil physique sauvegardé'); renderSport();
}

function generateProg() {
  const sports   = [...document.querySelectorAll('[data-sport].on')].map(b=>b.dataset.sport);
  const equip    = [...document.querySelectorAll('[data-equip].on')].map(b=>b.dataset.equip);
  const goals    = [...document.querySelectorAll('[data-goal].on')].map(b=>b.dataset.goal);
  const levelBtn = document.querySelector('[data-level].on');
  const freq     = parseInt(document.getElementById('s-freq')?.value || 4);
  const dur      = parseInt(document.getElementById('s-dur')?.value || 60);

  if (!sports.length) { notif('⚠️','Choisis au moins un sport'); return; }
  if (!equip.length)  { notif('⚠️','Choisis ton matériel disponible'); return; }
  if (!goals.length)  { notif('⚠️','Choisis un objectif'); return; }

  data.sport.sports          = sports;
  data.sport.equipment       = equip;
  data.sport.goals           = goals;
  data.sport.level           = levelBtn?.dataset.level || 'intermediaire';
  data.sport.frequency       = freq;
  data.sport.sessionDuration = dur;
  data.sport.programGenerated = true;
  data.xp += 50;
  save();
  notif('⚡', 'Programme généré ! +50 XP');
  renderSport();
  setTimeout(() => { document.querySelectorAll('#view-sport .stab')[2].click(); }, 200);
}

function buildProgHTML(s) {
  const sport  = s.sports?.[0] || 'calisthenics';
  const goal   = s.goals?.[0]  || 'force';
  const equip  = s.equipment   || ['rien'];
  const level  = s.level       || 'intermediaire';
  const freq   = s.frequency   || 4;
  const hasGym = equip.some(e=>['full_gym','barre','halteres'].includes(e));
  const hasBarre = equip.includes('barre_traction') || hasGym;
  const hasAnneaux = equip.includes('anneaux');
  const hasParal = equip.includes('parallettes') || hasGym;
  const hasKB = equip.includes('kettlebell') || hasGym;

  const prog = getProgram(sport, goal, level, freq, { hasGym, hasBarre, hasAnneaux, hasParal, hasKB });

  const equipLabel = equip.map(e=>({
    rien:'Poids de corps', barre_traction:'Barre traction', anneaux:'Anneaux',
    parallettes:'Parallettes', elastiques:'Élastiques', kettlebell:'Kettlebell',
    halteres:'Haltères', full_gym:'Salle complète', barre:'Barre + disques'
  }[e]||e)).join(' · ');

  return `
  <div class="card glow" style="padding:16px;margin-bottom:12px">
    <div style="font-family:'Syne',sans-serif;font-weight:800;font-size:16px;margin-bottom:6px">${prog.name}</div>
    <div style="font-size:12px;color:var(--dim);margin-bottom:10px">${prog.desc}</div>
    <div style="display:flex;gap:6px;flex-wrap:wrap">
      <span class="tag tag-a">${freq}x / semaine</span>
      <span class="tag tag-a">${s.sessionDuration||60} min</span>
      <span class="tag tag-g">${level.charAt(0).toUpperCase()+level.slice(1)}</span>
      <span class="tag tag-g">${equipLabel}</span>
    </div>
  </div>
  ${prog.days.map((d,i)=>`
  <div class="workout">
    <div class="wday-head" onclick="toggleWday(${i})">
      <div>
        <div style="font-family:'Syne',sans-serif;font-weight:700;font-size:13px">${d.day}</div>
        <div style="font-family:'JetBrains Mono',monospace;font-size:9px;color:#C8FF00;letter-spacing:1px;margin-top:2px">${d.focus}</div>
      </div>
      <div style="display:flex;align-items:center;gap:8px">
        <span class="label">${d.exs.length} exercices · ~${s.sessionDuration||60} min</span>
        <span id="wch-${i}" style="color:var(--muted)">▾</span>
      </div>
    </div>
    <div class="wexercises" id="wex-${i}">
      ${d.exs.map(([name,sets,muscle,rest,tip],j)=>`
      <div class="wex">
        <span class="wnum">${String(j+1).padStart(2,'0')}</span>
        <div style="flex:1">
          <div style="font-size:13px;font-weight:500">${name}</div>
          <div style="font-family:'JetBrains Mono',monospace;font-size:8px;color:var(--muted);margin-top:2px;letter-spacing:.5px">${muscle} · Repos ${rest}</div>
          ${tip?`<div style="font-size:10px;color:var(--dim);margin-top:2px;font-style:italic">${tip}</div>`:''}
        </div>
        <span class="wsets">${sets}</span>
      </div>`).join('')}
    </div>
  </div>`).join('')}
  <div class="card" style="padding:14px;margin-top:10px;border-color:rgba(200,255,0,.1)">
    <div style="font-family:'JetBrains Mono',monospace;font-size:8px;letter-spacing:2px;color:#C8FF00;margin-bottom:6px">💡 CONSEIL FORGE</div>
    <div style="font-size:12px;color:var(--dim);line-height:1.6">${prog.tip}</div>
  </div>`;
}

function getProgram(sport, goal, level, freq, eq) {
  // ── CALISTHENICS ──────────────────────────────
  if (sport === 'calisthenics') {
    if (goal === 'force') {
      const days3 = [
        { day:'Lundi',    focus:'Push — Poussée horizontale & verticale', exs:[
          ['Pompes diamant',                '5×5',   'Triceps / Pec',     '2 min',   'Corps parfaitement droit'],
          ['Pompes Pike',                   '4×8',   'Épaules',           '90s',     'Hanches hautes, tête vers le sol'],
          [eq.hasAnneaux?'Dips anneaux':'Dips chaise', '4×6-8','Triceps / Pec bas','2 min','Descente lente 3s'],
          [eq.hasParal?'Planche (progression)':'Gainage frontal long','3×max','Core / épaules','3 min','Progression : incliné → avancé'],
          ['Élévations de jambes suspendues', eq.hasBarre?'3×10':'3×10 sol','Abdos','60s',''],
        ]},
        { day:'Mercredi', focus:'Pull — Tirage vertical & horizontal', exs:[
          [eq.hasBarre?'Tractions pronation':'Tirage élastique vertical','5×5',eq.hasBarre?'Grand dorsal':'Grand dorsal', '2-3 min','Montée explosive, descente lente 3s'],
          [eq.hasBarre?'Tractions supination':'Curl élastique','4×6','Biceps / Dos','90s',''],
          [eq.hasBarre?'Tirage australien':'Rowing élastique','4×8','Dos milieu / Biceps','90s',eq.hasBarre?'Corps incliné 45°':''],
          ['Face pull élastique',           '3×12','Épaules arrière','60s',''],
          ['Shrugs poids de corps (sac leste)','3×15','Trapèzes','60s',''],
        ]},
        { day:'Vendredi', focus:'Legs & Core — Force inférieure', exs:[
          ['Pistol squat (progression)',    '4×5 /jambe','Quadriceps','2 min','Progression : assis → complet'],
          ['Nordic curl',                   '3×5','Ischio-jambiers','2 min','Mouvement le plus difficile — progressif'],
          ['Single-leg calf raise',         '3×15 /jambe','Mollets','60s',''],
          ['L-sit (progression)',           '3×max','Core / hanches','2 min','Progression : genoux → jambes tendues'],
          ['Dragon flag (progression)',     '3×5','Core complet','90s',''],
        ]},
      ];
      if (freq >= 4) days3.push({ day:'Samedi', focus:'Skill — Éléments gymniques', exs:[
        ['Handstand wall hold',             '5×30s','Équilibre / Épaules','60s','Dos au mur pour débuter'],
        ['Back lever progression',          '4×max','Dos / Épaules','2 min',''],
        ['Front lever progression',         '4×max','Dos / Core','2 min',''],
        ['Muscle-up progression',           eq.hasBarre?'4×3':'3×max','Tirage complet','3 min',''],
      ]});
      return {
        name: 'Calisthenics — Force & Skill',
        desc: 'Développement de la force relative et maîtrise du poids de corps. Progression sur les mouvements d\'appui.',
        tip: 'En callisthénie, la force vient de la progression. Augmente les reps avant d\'aller à une variante plus difficile. Tiens un log de chaque séance.',
        days: days3.slice(0, freq >= 4 ? 4 : 3),
      };
    }

    if (goal === 'masse' || goal === 'athletisme') {
      return {
        name: 'Calisthenics — Hypertrophie',
        desc: 'Volume élevé sur les mouvements fondamentaux pour maximiser la prise de masse sans salle.',
        tip: 'Pour l\'hypertrophie en callisthénie : vise 8-15 reps, descente lente (3-4s), montée explosive. Mange en surplus calorique.',
        days: [
          { day:'Lundi',    focus:'Push A — Volume pectoraux & triceps', exs:[
            ['Pompes larges',               '4×12-15','Pectoraux','90s','Descente 3s'],
            ['Pompes inclinées (pieds haut)','3×12','Pec haut / Épaules','90s',''],
            [eq.hasAnneaux?'Dips anneaux':'Dips chaise','4×12','Triceps','90s',''],
            ['Pompes archer',               '3×8/côté','Pec / épaules','90s','Pec interne'],
            ['Pike push-up',                '3×10','Épaules','60s',''],
          ]},
          { day:'Mercredi', focus:'Pull A — Volume dos & biceps', exs:[
            [eq.hasBarre?'Tractions larges':'Tirage élastique','4×10-12',eq.hasBarre?'Grand dorsal':'Grand dorsal','90s',''],
            [eq.hasBarre?'Tractions supination':'Curl élastique','3×10','Biceps','90s',''],
            [eq.hasBarre?'Tirage australien':'Rowing élastique','4×12','Dos / Biceps','90s',''],
            ['Pompes sur doigts',           '2×max','Avant-bras / Prise','60s',''],
          ]},
          { day:'Vendredi', focus:'Legs & Core — Volume inférieur', exs:[
            ['Jump squat',                  '4×15','Quadriceps / Explosivité','90s',''],
            ['Bulgare split squat',         '3×12/jambe','Quadriceps / Fessiers','90s',''],
            ['Calf raise (une jambe)',       '3×20/jambe','Mollets','60s',''],
            ['Ab wheel / Dragon flag',      '3×10','Core','90s',''],
            ['Mountain climbers',           '3×20','Core / Cardio','45s',''],
          ]},
        ].slice(0, freq >= 4 ? 4 : 3),
      };
    }

    // Par défaut calisthenics
    return {
      name: 'Calisthenics — Programme Complet',
      desc: 'Programme full-body adapté à ton matériel et tes objectifs.',
      tip: 'Maîtrise la forme avant d\'augmenter la difficulté. La qualité prime toujours.',
      days: [
        { day:'Lundi',    focus:'Full Body A', exs:[
          ['Pompes',                        '4×max','Pectoraux / Triceps','90s',''],
          [eq.hasBarre?'Tractions':'Tirage élastique','4×max',eq.hasBarre?'Dos / Biceps':'Dos','90s',''],
          ['Squat',                         '3×20','Jambes','60s',''],
          ['Gainage',                       '3×60s','Core','30s',''],
        ]},
        { day:'Jeudi',    focus:'Full Body B', exs:[
          ['Dips',                          '4×max','Triceps / Pec','90s',''],
          [eq.hasBarre?'Tirage australien':'Rowing élastique','4×12','Dos','90s',''],
          ['Fentes marchées',               '3×12/jambe','Jambes','60s',''],
          ['Élévations de jambes',          '3×15','Abdos','60s',''],
        ]},
      ],
    };
  }

  // ── MUSCULATION ───────────────────────────────
  if (sport === 'musculation') {
    if (goal === 'masse' || goal === 'athletisme') {
      return {
        name: 'Musculation — Hypertrophie Push/Pull/Legs',
        desc: 'Split PPL classique, volume élevé, progression de charge hebdomadaire.',
        tip: 'Progressive overload obligatoire : +1kg ou +1 rep chaque semaine minimum. Note tes séances.',
        days: [
          { day:'Lundi',    focus:'PUSH — Pectoraux · Épaules · Triceps', exs:[
            ['Développé couché barre',      '4×8-10','Pectoraux','2 min','Toucher la poitrine'],
            ['Développé incliné haltères',  '3×10-12','Pec haut','90s',''],
            ['Développé militaire debout',  '4×8-10','Épaules','2 min',''],
            ['Élévations latérales',        '3×15',  'Épaules latérales','60s','Drop set final'],
            ['Extension triceps poulie',    '3×12',  'Triceps','60s',''],
          ]},
          { day:'Mercredi', focus:'PULL — Dos · Biceps', exs:[
            ['Soulevé de terre',            '4×5-6', 'Chaîne postérieure','3 min','Dos plat, barre contre le corps'],
            ['Tractions lestées',           '4×6-8', 'Grand dorsal','2 min','Ou tirage poulie haute'],
            ['Rowing haltère unilatéral',   '3×10',  'Dos épaisseur','90s',''],
            ['Curl barre incliné',          '3×10-12','Biceps','60s','Amplitude complète'],
          ]},
          { day:'Vendredi', focus:'LEGS — Quadriceps · Ischio · Fessiers', exs:[
            ['Squat barre haute',           '4×8-10','Quadriceps','2-3 min','Descente parallèle minimum'],
            ['Leg press',                   '3×12',  'Quadriceps / Fessiers','90s',''],
            ['Romanian deadlift',           '3×10',  'Ischio-jambiers','90s',''],
            ['Hip thrust',                  '3×12',  'Fessiers','90s',''],
            ['Extensions mollets assis',    '4×15',  'Mollets','60s',''],
          ]},
        ].slice(0, freq >= 4 ? 4 : 3),
      };
    }
    if (goal === 'force') {
      return {
        name: 'Musculation — Force (5×5 Powerlifting)',
        desc: 'Charges lourdes, faibles répétitions, progression linéaire sur les mouvements de base.',
        tip: '+2.5kg sur chaque exercice à chaque séance. Si tu rates 3 séances, réduis de 10% et repars.',
        days: [
          { day:'Lundi',    focus:'Squat · Développé couché · Rowing', exs:[
            ['Squat barre',                 '5×5',   'Jambes complet','3 min','Mouvement principal'],
            ['Développé couché',            '5×5',   'Pectoraux','3 min',''],
            ['Rowing barre pendlay',        '5×5',   'Dos','3 min',''],
          ]},
          { day:'Mercredi', focus:'Squat · Développé militaire · SDT', exs:[
            ['Squat barre',                 '5×5',   'Jambes','3 min','Même poids que lundi'],
            ['Développé militaire',         '5×5',   'Épaules','3 min',''],
            ['Soulevé de terre',            '1×5',   'Chaîne post.','5 min','1 seule série lourde'],
          ]},
          { day:'Vendredi', focus:'Squat · Développé couché · Rowing', exs:[
            ['Squat barre',                 '5×5',   'Jambes','3 min','+2.5kg vs lundi'],
            ['Développé couché',            '5×5',   'Pectoraux','3 min','+2.5kg vs lundi'],
            ['Rowing barre pendlay',        '5×5',   'Dos','3 min','+2.5kg vs lundi'],
          ]},
        ],
      };
    }
  }

  // ── RUNNING ───────────────────────────────────
  if (sport === 'running') {
    return {
      name: 'Running — Plan d\'entraînement progressif',
      desc: 'Alternance endurance fondamentale, seuil et fractionné pour progresser rapidement.',
      tip: '80% de tes séances doivent être en endurance fondamentale (tu peux parler). Le fractionné améliore ta VMA.',
      days: [
        { day:'Mardi',    focus:'Endurance fondamentale', exs:[
          ['Course EF (allure confort)',    freq>=5?'60 min':'45 min','Cardio de base','—','Tu dois pouvoir tenir une conversation'],
          ['Étirements dynamiques',        '10 min','Mobilité','—',''],
        ]},
        { day:'Jeudi',    focus:'Fractionné VMA', exs:[
          ['Échauffement',                 '15 min','EF','—',''],
          ['Intervalles 30s/30s',          '10 rép.','VMA 90-100%','—','30s rapide / 30s récup'],
          ['Retour au calme',              '10 min','EF','—',''],
        ]},
        { day:'Samedi',   focus:'Sortie longue', exs:[
          ['Course longue EF',             freq>=4?'75-90 min':'60-75 min','Endurance','—','Allure très confortable'],
        ]},
      ].slice(0, freq >= 4 ? 3 : 2),
    };
  }

  // ── Défaut ────────────────────────────────────
  return {
    name: 'Programme personnalisé',
    desc: 'Adapté à tes sélections.',
    tip: 'La régularité prime tout. 3 séances constantes valent mieux que 6 séances aléatoires.',
    days: [
      { day:'Lundi',  focus:'Séance A', exs:[['Exercice 1','3×10','Complet','90s',''],['Exercice 2','3×10','Complet','90s','']]},
      { day:'Jeudi',  focus:'Séance B', exs:[['Exercice 1','3×10','Complet','90s',''],['Exercice 2','3×10','Complet','90s','']]},
    ],
  };
}

function toggleWday(i) {
  const ex = document.getElementById('wex-'+i);
  const ch = document.getElementById('wch-'+i);
  ex?.classList.toggle('on');
  if (ch) ch.textContent = ex?.classList.contains('on') ? '▴' : '▾';
}

// ══════════════════════════════════════════════════
//  CALENDRIER
// ══════════════════════════════════════════════════
function renderCalendar() {
  const DAYS = ['LUN','MAR','MER','JEU','VEN','SAM','DIM'];
  const HOURS = Array.from({length:14},(_,i)=>i+7);
  const todayDow = (new Date().getDay()+6)%7;
  const evColors = {blue:'ev-blue',green:'ev-green',red:'ev-red',gold:'ev-gold',purple:'ev-purple'};

  const dayHeads = DAYS.map((d,i)=>{
    const isToday = i===todayDow;
    const dt = new Date(); dt.setDate(dt.getDate()-todayDow+i);
    return `<div class="cal-dhead ${isToday?'today':''}">
      <div style="font-family:'JetBrains Mono',monospace;font-size:8px;letter-spacing:2px;color:${isToday?'#C8FF00':'var(--muted)'}">${d}</div>
      <div style="font-family:'JetBrains Mono',monospace;font-size:14px;font-weight:700;color:${isToday?'#C8FF00':'var(--white)'}">${dt.getDate()}</div>
    </div>`;
  }).join('');

  const rows = HOURS.map(h=>{
    const cells = DAYS.map((_,i)=>{
      const ev = data.calEvents.find(e=>e.day===i&&e.hour===h);
      return `<div class="cal-cell ${i===todayDow?'today':''}">${ev?`<div class="cal-ev ${evColors[ev.color]||'ev-blue'}">${ev.name}</div>`:''}</div>`;
    }).join('');
    return `<div class="cal-row"><div class="cal-t">${h}h</div>${cells}</div>`;
  }).join('');

  document.getElementById('view-calendar').innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
      <div class="title">Calendrier</div>
      <button onclick="go('scanner')" class="btn-ghost" style="font-size:11px">📷 Scanner EDT</button>
    </div>
    <div class="cal-head"><div></div>${dayHeads}</div>
    <div class="cal-body">${rows}</div>`;
}

// ══════════════════════════════════════════════════
//  SCANNER EDT
// ══════════════════════════════════════════════════
let _scanSlots = [];

function renderScanner() {
  document.getElementById('view-scanner').innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
      <div class="title">Scanner EDT</div>
      <span class="tag tag-a">Claude Vision</span>
    </div>

    ${API_KEY === 'REMPLACE_PAR_TA_CLE_API' ? `
    <div style="padding:14px;background:rgba(255,94,94,.07);border:1px solid rgba(255,94,94,.2);border-radius:var(--r);margin-bottom:14px;font-size:13px;color:var(--red)">
      ⚠️ Configure ta clé API Anthropic dans <code style="background:rgba(255,255,255,.07);padding:1px 5px;border-radius:3px">app.js</code> ligne 5 pour utiliser le scanner.
    </div>` : ''}

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
      <div style="display:flex;flex-direction:column;gap:10px">
        <label id="scan-zone" class="scan-zone" onclick="document.getElementById('scan-input').click()">
          <div id="scan-zone-inner">
            <div style="font-size:36px;opacity:.4;margin-bottom:8px">📷</div>
            <div style="font-family:'Syne',sans-serif;font-weight:700;font-size:11px;letter-spacing:1px;color:var(--muted)">SÉLECTIONNER UNE PHOTO</div>
            <div style="font-family:'JetBrains Mono',monospace;font-size:8px;color:var(--muted);opacity:.5;margin-top:4px">JPG · PNG</div>
          </div>
          <input type="file" id="scan-input" accept="image/*" style="display:none" onchange="handleScan(this)">
        </label>
        <div class="card" style="padding:10px 12px;display:flex;align-items:center;gap:8px">
          <div style="width:5px;height:5px;border-radius:50%;background:#C8FF00;box-shadow:0 0 6px #C8FF00;flex-shrink:0"></div>
          <div style="font-size:11px;font-weight:500">Claude Vision IA</div>
        </div>
      </div>
      <div style="display:flex;flex-direction:column;gap:8px">
        <div class="label" id="scan-status">En attente...</div>
        <div id="scan-results" style="flex:1;overflow-y:auto;max-height:260px;display:flex;flex-direction:column;gap:5px"></div>
        <button id="scan-import-btn" onclick="importScan()" disabled style="opacity:.4;padding:11px;border-radius:var(--r2);background:var(--border);color:var(--muted);font-family:'Syne',sans-serif;font-weight:700;font-size:11px;letter-spacing:1px;text-transform:uppercase">Importer dans le calendrier</button>
      </div>
    </div>`;
}

async function handleScan(input) {
  const file = input.files[0];
  if (!file) return;
  const zone = document.getElementById('scan-zone-inner');
  const status = document.getElementById('scan-status');
  document.getElementById('scan-zone').classList.add('analyzing');
  zone.innerHTML = `<div style="font-size:20px">⏳</div><div style="font-family:'Syne',sans-serif;font-weight:700;font-size:11px;letter-spacing:1px;color:var(--muted);margin-top:8px">Analyse en cours...</div>`;
  status.textContent = 'Traitement IA...';

  const reader = new FileReader();
  reader.onload = async e => {
    const b64 = e.target.result.split(',')[1];
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method:'POST',
        headers:{
          'Content-Type':'application/json',
          'x-api-key': API_KEY,
          'anthropic-version':'2023-06-01',
          'anthropic-dangerous-direct-browser-access':'true'
        },
        body: JSON.stringify({
          model:'claude-sonnet-4-20250514',
          max_tokens:1000,
          messages:[{role:'user',content:[
            {type:'image',source:{type:'base64',media_type:file.type||'image/jpeg',data:b64}},
            {type:'text',text:'Analyse cet emploi du temps et extrais TOUS les créneaux. Réponds UNIQUEMENT en JSON valide (sans markdown) : {"slots":[{"day":"Lundi","start":"08h00","end":"10h00","name":"Mathématiques","room":"204"}]}. Si pas d\'EDT : {"slots":[]}.'}
          ]}]
        })
      });
      const json = await res.json();
      const text = json.content?.map(c=>c.text||'').join('').replace(/```json|```/g,'').trim();
      const parsed = JSON.parse(text);
      _scanSlots = parsed.slots || [];
      document.getElementById('scan-zone').className = 'scan-zone done';
      zone.innerHTML = `<div style="font-size:28px">✅</div><div style="font-family:'Syne',sans-serif;font-weight:700;font-size:12px;color:#C8FF00;margin-top:8px">${_scanSlots.length} créneaux détectés</div>`;
      status.textContent = _scanSlots.length + ' créneaux détectés';
      document.getElementById('scan-results').innerHTML = _scanSlots.map(s=>`
        <div style="display:flex;align-items:center;gap:8px;padding:8px 10px;background:var(--card);border:1px solid var(--border);border-radius:6px">
          <span style="font-family:'JetBrains Mono',monospace;font-size:9px;color:#C8FF00;width:80px;flex-shrink:0">${s.start}–${s.end}</span>
          <div style="flex:1;min-width:0"><div style="font-size:12px;font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${s.name}</div>${s.room?`<div style="font-family:'JetBrains Mono',monospace;font-size:8px;color:var(--muted)">${s.room}</div>`:''}</div>
          <span style="font-family:'JetBrains Mono',monospace;font-size:8px;color:var(--muted);flex-shrink:0">${s.day}</span>
        </div>`).join('');
      if (_scanSlots.length) {
        const btn = document.getElementById('scan-import-btn');
        btn.disabled = false; btn.style.opacity='1'; btn.style.background='#C8FF00'; btn.style.color='#000';
      }
    } catch(err) {
      document.getElementById('scan-zone').className = 'scan-zone';
      zone.innerHTML = `<div style="font-size:28px">⚠️</div><div style="color:var(--red);font-size:11px;margin-top:8px">${err.message}</div>`;
      status.textContent = 'Erreur';
    }
  };
  reader.readAsDataURL(file);
}

function importScan() {
  const dayMap = {lundi:0,mardi:1,mercredi:2,jeudi:3,vendredi:4,samedi:5,dimanche:6};
  const colors = ['blue','green','red','gold','purple'];
  _scanSlots.forEach(s=>{
    const d = dayMap[s.day.toLowerCase()];
    if (d===undefined) return;
    const h = parseInt(s.start)||8;
    data.calEvents.push({id:uid(),name:s.name.slice(0,14),day:d,hour:h,color:colors[Math.abs(s.name.charCodeAt(0))%5]});
  });
  save(); notif('✅',_scanSlots.length+' créneaux importés'); go('calendar');
}

// ══════════════════════════════════════════════════
//  CHAT IA
// ══════════════════════════════════════════════════
let chats = LS.get('forge_chats') || [];
let currentChatId = null;
let chatMode = 'business';
let _aiTyping = false;

const SYSTEM_PROMPTS = {
  business: `Tu es le conseiller business personnel et coach de Léo. Tu es direct, précis, ambitieux. Tu aides sur : stratégie business, lancement de projets, monétisation, marketing, mindset entrepreneur. Tu poses des questions pertinentes pour comprendre les objectifs. Réponds en français, de manière concise et actionnelle. Utilise des listes courtes quand c'est utile. Ne sois pas générique — donne de vrais conseils concrets.`,
  tiktok: `Tu es expert en création de contenu TikTok sans montrer son visage. Tu aides Léo à créer des vidéos virales avec texte, voix off, B-roll, animations. Spécialités : scripts viraux, hooks percutants, tendances, montage, sons, hashtags, stratégie de niche. Donne des scripts prêts à utiliser, des idées de vidéos précises et des formules qui fonctionnent. Réponds en français, de manière très concrète et créative.`,
  coach: `Tu es le coach personnel de Léo — discipline, performance, mindset, productivité. Tu combines les philosophies de David Goggins, Stoïcisme, et neurosciences. Tu es exigeant mais bienveillant. Tu aides sur : habitudes, focus, gestion du temps, objectifs, récupération mentale. Donne des conseils précis et actionnables, pas des platitudes. Réponds en français.`,
};

const SUGGESTIONS = {
  business: ['Comment monétiser mon app FORGE ?','Stratégie de lancement produit','Trouver mes premiers clients','Business model SaaS étudiant'],
  tiktok: ['Idée de vidéo virale sans visage','Script hook pour TikTok Business','Comment trouver ma niche','Stratégie pour 1000 abonnés'],
  coach: ['Je manque de motivation aujourd\'hui','Comment créer une routine imparable','Gérer la procrastination','Optimiser mon sommeil et énergie'],
};

function saveChats() { LS.set('forge_chats', chats); }

function newChat() {
  const id = uid();
  chats.unshift({ id, title:'Nouvelle conversation', mode: chatMode, messages:[], date: new Date().toISOString() });
  currentChatId = id;
  saveChats(); renderChatList(); loadChat(id);
}

function loadChat(id) {
  currentChatId = id;
  const chat = chats.find(c=>c.id===id);
  if (!chat) return;
  chatMode = chat.mode || 'business';
  document.getElementById('chat-title').textContent = chat.title;
  document.getElementById('chat-mode-label').textContent = 'Mode : '+chatMode.charAt(0).toUpperCase()+chatMode.slice(1);
  renderChatList();
  renderMessages(chat.messages);
  renderSuggestions();
}

function delChat(id) {
  chats = chats.filter(c=>c.id!==id);
  if (currentChatId === id) { currentChatId = null; clearMessages(); }
  saveChats(); renderChatList();
}

function setChatMode(btn, mode) {
  chatMode = mode;
  document.querySelectorAll('#chat-mode-btns .chat-sug').forEach(b=>b.classList.remove('on'));
  btn.classList.add('on');
  if (currentChatId) {
    const chat = chats.find(c=>c.id===currentChatId);
    if (chat) { chat.mode = mode; saveChats(); }
  }
  document.getElementById('chat-mode-label').textContent = 'Mode : '+mode.charAt(0).toUpperCase()+mode.slice(1);
  renderSuggestions();
}

function renderChatList() {
  const list = document.getElementById('chat-list');
  if (!list) return;
  list.innerHTML = chats.length ? chats.map(c=>`
    <div class="chat-item ${c.id===currentChatId?'on':''}" onclick="loadChat('${c.id}')">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:4px">
        <div class="chat-item-title">${c.title}</div>
        <button class="chat-item-del" onclick="event.stopPropagation();delChat('${c.id}')">✕</button>
      </div>
      <div class="chat-item-date">${fmtDate(c.date)} · ${(c.mode||'business').toUpperCase()}</div>
    </div>`).join('') : `<div style="padding:16px;text-align:center;color:var(--muted);font-size:12px">Aucune conversation</div>`;
}

function renderMessages(messages) {
  const container = document.getElementById('chat-messages');
  if (!container) return;
  if (!messages.length) {
    clearMessages();
    return;
  }
  container.innerHTML = messages.map(m => msgHTML(m)).join('');
  container.scrollTop = container.scrollHeight;
}

function clearMessages() {
  const container = document.getElementById('chat-messages');
  if (!container) return;
  container.innerHTML = `
    <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;opacity:.5">
      <div style="font-size:32px">✦</div>
      <div style="font-family:'Syne',sans-serif;font-weight:700;font-size:14px;letter-spacing:1px">Conseiller IA</div>
      <div style="font-size:12px;color:var(--muted);text-align:center;max-width:240px">Business · TikTok sans visage · Coach<br>Je suis là pour t'aider.</div>
    </div>`;
}

function renderSuggestions() {
  const el = document.getElementById('chat-sugs');
  if (!el) return;
  const sugs = SUGGESTIONS[chatMode] || [];
  el.innerHTML = sugs.map(s=>`<button class="chat-sug" onclick="sendSuggestion('${s.replace(/'/g,"\\'")}')"> ${s}</button>`).join('');
}

function msgHTML(m) {
  const isUser = m.role === 'user';
  const formatted = formatMsg(m.content);
  return `<div class="msg ${isUser?'user':'ai'}">
    <div class="msg-avatar">${isUser?'👤':'F'}</div>
    <div>
      <div class="msg-bubble">${formatted}</div>
      <div class="msg-time">${m.time||''}</div>
    </div>
  </div>`;
}

function formatMsg(text) {
  return text
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>')
    .replace(/`([^`]+)`/g,'<code>$1</code>')
    .replace(/^### (.*)/gm,'<strong>$1</strong>')
    .replace(/^## (.*)/gm,'<strong>$1</strong>')
    .replace(/^# (.*)/gm,'<strong>$1</strong>')
    .replace(/^[-•] (.*)/gm,'<li>$1</li>')
    .replace(/^\d+\. (.*)/gm,'<li>$1</li>')
    .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
    .replace(/\n\n/g,'</p><p>').replace(/\n/g,'<br>')
    .replace(/^(?!<)(.+)/gm,'<p>$1</p>');
}

function sendSuggestion(text) {
  document.getElementById('chat-input').value = text;
  sendMessage();
}

async function sendMessage() {
  if (_aiTyping) return;
  const input = document.getElementById('chat-input');
  const text = input.value.trim();
  if (!text) return;

  // Create chat if none
  if (!currentChatId) newChat();

  input.value = '';
  input.style.height = 'auto';

  const chat = chats.find(c=>c.id===currentChatId);
  if (!chat) return;

  // Add user message
  const userMsg = { role:'user', content:text, time:now() };
  chat.messages.push(userMsg);
  if (chat.title === 'Nouvelle conversation') chat.title = text.slice(0,36)+(text.length>36?'…':'');

  appendMsg(userMsg);
  renderChatList();
  saveChats();

  // Show typing
  _aiTyping = true;
  document.getElementById('chat-send-btn').disabled = true;
  appendTyping();

  if (API_KEY === 'REMPLACE_PAR_TA_CLE_API') {
    removeTyping();
    const errMsg = { role:'assistant', content:'⚠️ Configure ta clé API Anthropic dans app.js ligne 5 pour utiliser le chat.', time:now() };
    chat.messages.push(errMsg);
    appendMsg(errMsg);
    _aiTyping = false;
    document.getElementById('chat-send-btn').disabled = false;
    saveChats();
    return;
  }

  try {
    const messages = chat.messages.slice(-20).map(m=>({ role:m.role==='assistant'?'assistant':'user', content:m.content }));
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method:'POST',
      headers:{
        'Content-Type':'application/json',
        'x-api-key': API_KEY,
        'anthropic-version':'2023-06-01',
        'anthropic-dangerous-direct-browser-access':'true'
      },
      body: JSON.stringify({
        model:'claude-sonnet-4-20250514',
        max_tokens:1000,
        system: SYSTEM_PROMPTS[chat.mode||'business'],
        messages,
      })
    });
    const json = await res.json();
    const reply = json.content?.map(c=>c.text||'').join('') || 'Erreur de réponse.';
    removeTyping();
    const aiMsg = { role:'assistant', content:reply, time:now() };
    chat.messages.push(aiMsg);
    appendMsg(aiMsg);
    saveChats();
  } catch(err) {
    removeTyping();
    const errMsg = { role:'assistant', content:'Erreur : '+err.message, time:now() };
    chat.messages.push(errMsg);
    appendMsg(errMsg);
    saveChats();
  }

  _aiTyping = false;
  document.getElementById('chat-send-btn').disabled = false;
  document.getElementById('chat-messages').scrollTop = 999999;
}

function appendMsg(m) {
  const container = document.getElementById('chat-messages');
  // Remove welcome screen if present
  const welcome = container.querySelector('div[style*="flex:1"]');
  if (welcome) welcome.remove();
  const div = document.createElement('div');
  div.innerHTML = msgHTML(m);
  container.appendChild(div.firstElementChild);
  container.scrollTop = container.scrollHeight;
}

function appendTyping() {
  const container = document.getElementById('chat-messages');
  const div = document.createElement('div');
  div.id = 'typing-msg';
  div.className = 'msg ai';
  div.innerHTML = `<div class="msg-avatar">F</div><div class="msg-bubble"><span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span></div>`;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}

function removeTyping() {
  document.getElementById('typing-msg')?.remove();
}

// Auto-resize textarea
document.addEventListener('DOMContentLoaded', () => {
  const inp = document.getElementById('chat-input');
  if (inp) {
    inp.addEventListener('input', () => { inp.style.height='auto'; inp.style.height=inp.scrollHeight+'px'; });
    inp.addEventListener('keydown', e => { if (e.key==='Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } });
  }

  // Register service worker
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(()=>{});

  // Init
  go('dashboard');
  renderChatList();
  clearMessages();
  renderSuggestions();
});;
