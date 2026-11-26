// 왕관과 길드 (Crown & Guild) — SillyTavern 확장
// 상태 계산·캐릭터 생성·판정·상태 패널·프롬프트 주입을 담당합니다.

import * as E from './engine.js';

const MOD = 'crown_and_guild';
const PROMPT_KEY = 'crown_and_guild_state';
const DEFAULTS = {
    enabled: true,
    allChars: false,
    depth: 1,
    choiceAutoSend: false,
    showHud: true,
    showQuick: true,
    showChips: true,
    dock: false,
    hotkeys: true,
    toasts: true,
    sceneHead: true,
    missHint: true,
    portraits: true,
    wide3: true,
    personaPortrait: true,
    dockWidth: 420,
};

const cur = { state: null, logs: new Map(), active: false };

/* ───────────────────────── 공통 ───────────────────────── */

const ctx = () => SillyTavern.getContext();

function settings() {
    const c = ctx();
    if (!c.extensionSettings[MOD]) c.extensionSettings[MOD] = {};
    const s = c.extensionSettings[MOD];
    for (const [k, v] of Object.entries(DEFAULTS)) if (s[k] === undefined) s[k] = v;
    return s;
}

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
const meta = () => ctx().chatMetadata?.[MOD];
const base = () => meta()?.base || null;

function debounce(fn, ms) {
    let t;
    return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
}

async function saveChat() {
    const c = ctx();
    if (typeof c.saveChatConditional === 'function') return c.saveChatConditional();
    if (typeof c.saveChat === 'function') return c.saveChat();
}

function currentCharacter() {
    const c = ctx();
    if (c.characterId === undefined || c.characterId === null) return null;
    return c.characters?.[c.characterId] || null;
}

function isActive() {
    const s = settings();
    if (!s.enabled) return false;
    if (base()) return true;
    if (!ctx().chatId && !ctx().getCurrentChatId?.()) return false;
    if (s.allChars) return true;
    const ch = currentCharacter();
    if (!ch) return false;
    return !!(ch.data?.extensions?.crown_and_guild) || /왕관과\s*길드/.test(ch.name || '');
}

const ICON = {
    crest: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5l-8-3Z" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M8 10h8M12 7v10" stroke="currentColor" stroke-width="1.6"/></svg>',
    coin: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="12" cy="12" r="4.5" fill="none" stroke="currentColor" stroke-width="1.2"/></svg>',
    die: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2 21 7v10l-9 5-9-5V7l9-5Z" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M3 7l9 5 9-5M12 12v10" fill="none" stroke="currentColor" stroke-width="1.2"/></svg>',
    book: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h7a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H4V4Zm16 0h-4a3 3 0 0 0-3 3" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M20 4v14h-6" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>',
    pin: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-6-5.5-6-11a6 6 0 1 1 12 0c0 5.5-6 11-6 11Z" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="12" cy="10" r="2.2" fill="currentColor"/></svg>',
    close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="1.8"/></svg>',
};

/* ───────────────────────── 상태 계산 ───────────────────────── */

/* 긴 대화 대비 — 메시지 서명이 그대로인 구간은 저장해 둔 중간 상태에서 이어 계산한다 */
const SNAP_EVERY = 20;
let snapCache = { key: null, snaps: [], logs: new Map() };
function msgSig(m) {
    if (!m) return 'x';
    return `${m.is_user ? 'u' : 'a'}|${E.hashStr(String(m.mes || ''))}|${m.extra?.cg_manual ? E.hashStr(JSON.stringify(m.extra.cg_manual)) : ''}|${m.extra?.cg_offer ? E.hashStr(JSON.stringify(m.extra.cg_offer)) : ''}`;
}
function recompute() {
    cur.logs = new Map();
    cur.active = isActive();
    const b = base();
    if (!b) { cur.state = null; return; }
    const createdAt = meta()?.createdAt ?? 0;
    const chat = ctx().chat || [];
    const key = `${ctx().getCurrentChatId?.() || ctx().chatId || ''}|${createdAt}|${E.hashStr(JSON.stringify(b))}`;
    if (snapCache.key !== key) snapCache = { key, snaps: [], logs: new Map() };
    // 누적 서명
    const sigs = []; let acc = 0;
    for (let i = 0; i < chat.length; i++) { acc = E.hashStr(`${acc}|${msgSig(chat[i])}`); sigs.push(acc); }
    // 쓸 수 있는 가장 늦은 스냅샷
    let start = 0, st = null, offer = null;
    for (let k = snapCache.snaps.length - 1; k >= 0; k--) {
        const sn = snapCache.snaps[k];
        if (sn.i < chat.length && sigs[sn.i] === sn.sig) { st = E.clone(sn.state); offer = sn.offer ? E.clone(sn.offer) : null; start = sn.i + 1; snapCache.snaps.length = k + 1; break; }
    }
    if (!st) { st = E.normalize(E.clone(b)); snapCache.snaps = []; }
    for (const [i, lg] of snapCache.logs) if (i < start) cur.logs.set(i, lg);
    snapCache.logs = new Map([...snapCache.logs].filter(([i]) => i < start));
    for (let i = start; i < chat.length; i++) {
        const m = chat[i];
        if (m) {
            let log = [];
            if (!m.is_user && i >= createdAt) {
                const v = offer ? E.parseVerdict(m.mes) : null;
                if (v === 'accept') { log = E.applyOps(st, E.parseOpLines(E.offerLines(offer))).map(x => ({ ...x, trade: true })); log.unshift({ k: 'info', t: `거래 성사 — ${offer.with || '상대'}` }); }
                if (v) offer = null;
                const ops = E.parseOps(m.mes);
                if (ops.length) log = log.concat(E.applyOps(st, ops));
                E.noteMet(st, m.mes);
                const lt = E.parseLetters(m.mes);
                if (lt.length) { E.addLetters(st, lt, i); log.push({ k: 'info', t: `편지 ${lt.length}통 — ${lt.map(x => x.from).join(', ')} (수첩 소식 탭)` }); }
            }
            if (m.is_user && i >= createdAt) { const sl = E.parseSentLetters(m.mes); if (sl.length) { E.addSentLetters(st, sl, i); log.push({ k: 'info', t: `편지를 부쳤다 — ${sl.map(x => x.to).join(', ')}` }); } }
            if (!m.is_user && m.extra?.cg_offer) offer = m.extra.cg_offer;
            const man = m.extra?.cg_manual;
            if (Array.isArray(man) && man.length) log = log.concat(E.applyOps(st, E.parseOpLines(man)).map(x => ({ ...x, manual: true })));
            if (log.length) { cur.logs.set(i, log); snapCache.logs.set(i, log); }
        }
        // 마지막 몇 메시지는 자주 바뀌니(스와이프·수정) 조금 앞에서만 저장
        if ((i + 1) % SNAP_EVERY === 0 && i < chat.length - 3) snapCache.snaps.push({ i, sig: sigs[i], state: E.clone(st), offer: offer ? E.clone(offer) : null });
    }
    cur.state = st;
}

function findPendingRoll(genType) {
    const chat = ctx().chat || [];
    let end = chat.length - 1;
    if ((genType === 'swipe' || genType === 'regenerate') && end >= 0 && !chat[end].is_user) end--;
    for (let i = end; i >= 0; i--) {
        const m = chat[i];
        if (m.is_user) continue;
        return m.extra?.cg_roll ? { ...m.extra.cg_roll, idx: i } : null;
    }
    return null;
}

/** 프롬프트 다이어트용: 최근 대화 몇 개의 글과 지금까지 GM 응답 수 */
function promptCtx(genType) {
    const chat = ctx().chat || [];
    let end = chat.length - 1;
    if ((genType === 'swipe' || genType === 'regenerate') && end >= 0 && !chat[end].is_user) end--;
    const parts = [];
    for (let i = end; i >= 0 && parts.length < 3; i--) if (chat[i]?.mes) parts.push(String(chat[i].mes).replace(/<변동>[\s\S]*?<\/변동>/g, ''));
    const box = document.getElementById('send_textarea');
    if (box?.value) parts.push(box.value);
    for (const n of findPendingNotes(genType)) parts.push(n);
    const turn = chat.slice(0, end + 1).filter(m => !m.is_user).length + 1;
    return { ctx: parts.join('\n'), turn };
}

function lastAiBefore(genType) {
    const chat = ctx().chat || [];
    let end = chat.length - 1;
    if ((genType === 'swipe' || genType === 'regenerate') && end >= 0 && !chat[end].is_user) end--;
    for (let i = end; i >= 0; i--) if (!chat[i].is_user) return i;
    return -1;
}

function findPendingNotes(genType) {
    const chat = ctx().chat || [];
    let end = chat.length - 1;
    if ((genType === 'swipe' || genType === 'regenerate') && end >= 0 && !chat[end].is_user) end--;
    let start = end;
    while (start >= 0 && chat[start].is_user) start--;
    if (start < 0) start = 0;
    const out = [];
    for (let i = start; i <= end; i++) if (Array.isArray(chat[i]?.extra?.cg_notes)) out.push(...chat[i].extra.cg_notes);
    return out;
}

function needsPrologue(genType) {
    const chat = ctx().chat || [];
    const createdAt = meta()?.createdAt ?? 0;
    let end = chat.length - 1;
    if ((genType === 'swipe' || genType === 'regenerate') && end >= 0 && !chat[end].is_user) end--;
    for (let i = createdAt; i <= end; i++) if (chat[i] && !chat[i].is_user) return false;
    return true;
}

let setPromptFallback = null;
async function loadFallbacks() {
    if (typeof ctx().setExtensionPrompt === 'function') return;
    try { setPromptFallback = (await import('../../../../script.js')).setExtensionPrompt; } catch (e) { console.warn('[왕관과 길드] setExtensionPrompt를 찾지 못했습니다.', e); }
}

function updatePrompt(genType = null) {
    const c = ctx();
    const s = settings();
    const setPrompt = typeof c.setExtensionPrompt === 'function' ? c.setExtensionPrompt.bind(c) : setPromptFallback;
    if (!setPrompt) return;
    if (!cur.active || !cur.state) {
        setPrompt(PROMPT_KEY, '', 1, 0);
        return;
    }
    const notes = findPendingNotes(genType);
    const ai = lastAiBefore(genType);
    for (const l of (ai >= 0 ? cur.logs.get(ai) || [] : [])) if (l.ep) notes.push(`깨달음! 지난 장면에서 기술을 쓰던 중 {{user}}가 스스로 「${l.ep}」 기술을 깨쳤다 — 이번 응답 첫머리에 그 깨달음의 순간(감각이 트이는 느낌, 몸이 먼저 움직이는 순간)을 생생하게 묘사할 것`);
    let text = E.buildPrompt(cur.state, { roll: findPendingRoll(genType), prologue: needsPrologue(genType), notes, ...promptCtx(genType) });
    text += `\n※ 이 채팅에서 {{user}}의 이름은 「${cur.state.profile.name}」이다. 서술과 대사에서 반드시 이 이름으로 부른다.`;
    setPrompt(PROMPT_KEY, text, 1, Math.max(0, Number(s.depth) || 0), false, 0);
}

/* ───────────────────────── 메시지 장식 ───────────────────────── */

const TAG_RE = /&lt;(변동|판정|선택지|상품|거래)&gt;[\s\S]*?&lt;\/\1&gt;/g;

function fallbackHide(mesText) {
    if (!mesText) return;
    const h = mesText.innerHTML;
    if (/&lt;(변동|판정|선택지|상품|거래)&gt;/.test(h)) {
        mesText.innerHTML = h.replace(TAG_RE, '');
    }
}

function lastAiIndex() {
    const chat = ctx().chat || [];
    for (let i = chat.length - 1; i >= 0; i--) if (!chat[i].is_user) return i;
    return -1;
}

/* 이름 칸 높이 — 바뀐 메시지만 잰다. 읽기를 한꺼번에 먼저 하고 쓰기는 나중에 해서
   메시지마다 화면 배치를 다시 계산하는 일(레이아웃 스래싱)을 막는다 */
function measureNames(els) {
    const todo = [];
    for (const el of els) {
        const nt = el.querySelector('.name_text'); if (!nt) continue;
        const key = nt.textContent + '|' + (el.offsetParent ? 1 : 0);
        if (el.__cgNameKey === key) continue;
        todo.push([el, nt, key]);
    }
    const hs = todo.map(([, nt]) => nt.offsetHeight);          // 읽기만 한 번에
    todo.forEach(([el, , key], i) => { if (hs[i]) { el.style.setProperty('--tg-nameh', `${hs[i]}px`); el.__cgNameKey = key; } });
}
function clearDeco(el) {
    el.querySelectorAll('.cg-deco, .cg-scene').forEach(n => n.remove());
    el.__cgSig = null;
}
function decorate(el) {
    if (!cur.active) { if (el.__cgSig !== null && el.__cgSig !== undefined) clearDeco(el); return; }
    const id = Number(el.getAttribute('mesid'));
    const m = ctx().chat?.[id];
    const mesText = el.querySelector('.mes_text');
    if (!m || !mesText) { clearDeco(el); return; }
    const sh = settings().sceneHead && base() ? (sceneHeader(id) || '') : '';
    let html = '';

    if (!base() && id === 0) {
        html += `<div class="cg-start-card">
            <div class="cg-start-title">${ICON.crest}<span>새 모험가 등록</span></div>
            <p>난이도와 출신, 외모와 배경, 첫 직업을 정하면 이야기가 시작됩니다.</p>
            <ol class="cg-start-steps"><li><b>캐릭터 만들기</b><small>일곱 단계 · 3분쯤</small></li><li><b>프롤로그</b><small>출신에 맞는 첫 장면을 GM이 씁니다</small></li><li><b>선택지 · 버튼</b><small>누르거나 직접 써서 이어 갑니다</small></li></ol>
            <div class="cg-start-btns"><button class="cg-btn cg-btn-primary" data-cg="open-creator">캐릭터 만들기</button><button class="cg-btn" data-cg="save-import">저장 파일로 이어하기</button></div>
        </div>`;
    }

    if (!m.is_user && base()) {
        const guide = !settings().guideSeen && id === firstAiAfterStart();
        const chk = E.parseCheck(m.mes);
        const isLast = id === lastAiIndex();
        if (chk) html += checkCardHtml(id, chk, m.extra?.cg_roll, isLast);
        const choices = isLast && !(chk && !m.extra?.cg_roll) ? E.parseChoices(m.mes) : [];
        const wares = E.parseWares(m.mes);
        if (wares?.items.length) html += waresHtml(st0(), wares, id, isLast);
        if (choices.length) {
            html += `<div class="cg-choices">${choices.map(t => `<button class="cg-choice" data-cg="choice" data-text="${esc(t)}">${esc(t)}</button>`).join('')}</div>`;
        }
        if (guide) html += guideHtml();
        if (isLast && settings().missHint && !m.extra?.cg_missok && id > (meta()?.createdAt ?? 0)) {
            const miss = E.suspectMissing(m.mes, cur.logs.get(id) || []);
            if (miss.length) html += `<div class="cg-miss"><span>반영 안 됐을 수도 있어요 — <b>${miss.map(esc).join(' · ')}</b></span><button class="cg-mini" data-cg="miss-fix">수동 조정</button><button class="cg-mini" data-cg="miss-ok" data-mesid="${id}">괜찮아요</button></div>`;
        }
    }
    const log = cur.logs.get(id);
    if (log?.length && settings().showChips) {
        html += `<div class="cg-chips">${log.map(l => `<span class="cg-chip cg-chip-${l.k}${l.t.startsWith('→') ? ' cg-chip-move' : ''}${l.manual ? ' cg-chip-manual' : ''}">${esc(l.t)}</span>`).join('')}</div>`;
    }
    // 바뀐 게 없으면 DOM을 건드리지 않는다 (메시지가 수백 개여도 새로 붙는 것만 다시 그린다)
    const sig = `${E.hashStr(m.mes || '')}|${sh}|${html}`;
    const same = mesText.__cgMes === m.mes && mesText.__cgFirst === mesText.firstChild;   // 본문이 다시 그려지면 첫 노드가 바뀐다
    if (el.__cgSig === sig && same && (!html || mesText.nextElementSibling?.classList.contains('cg-deco'))) return;
    el.querySelectorAll('.cg-deco, .cg-scene').forEach(n => n.remove());
    fallbackHide(mesText);
    mesText.__cgMes = m.mes; mesText.__cgFirst = mesText.firstChild;
    el.__cgSig = sig;
    if (sh) mesText.insertAdjacentHTML('beforebegin', sh.replace('class="cg-scene"', 'class="cg-scene cg-root"'));
    if (!html) return;
    const deco = document.createElement('div');
    deco.className = 'cg-deco cg-root';
    deco.innerHTML = html;
    mesText.after(deco);
}

const st0 = () => cur.state;
/** 캐릭터를 만든 뒤 처음 나온 GM 메시지 */
function firstAiAfterStart() {
    const chat = ctx().chat || [], from = meta()?.createdAt ?? 0;
    for (let i = from; i < chat.length; i++) if (chat[i] && !chat[i].is_user) return i;
    return -1;
}
function guideHtml() {
    return `<div class="cg-guide">
        <div class="cg-guide-head"><b>처음이라면 — 이렇게 이어 가요</b><button class="cg-x" data-cg="guide-done" title="닫기">✕</button></div>
        <ol>
            <li><b>선택지</b><span>위 선택지를 누르면 입력칸에 들어갑니다. 고쳐서 보내도 되고, 선택지 없이 하고 싶은 걸 직접 써도 됩니다.</span></li>
            <li><b>행동</b><span>입력칸 위 <em>행동</em> 버튼 — 하루 일과·사람 만나기·생업·수련·이동을 골라 넣습니다. <em>의뢰판</em>·<em>시장</em>도 같은 줄에 있어요.</span></li>
            <li><b>수첩</b><span><em>수첩</em> 버튼(Alt+J) — 능력치·돈·소지품·동료·가게·농장·달력이 모두 여기 있습니다.</span></li>
            <li><b>◆ 칩</b><span>메시지 아래 작은 칩은 GM이 바꾼 수치(돈·위치·호감 등)예요. 틀렸으면 수첩의 <em>편집</em>에서 고칩니다.</span></li>
            <li><b>판정</b><span>주사위 카드가 뜨면 <em>주사위 굴리기</em>를 누르세요. 결과에 맞춰 GM이 이어 씁니다.</span></li>
        </ol>
        <div class="cg-guide-btns"><button class="cg-btn" data-cg="act-open">행동 창 열어 보기</button><button class="cg-btn" data-cg="panel">수첩 열기</button><button class="cg-btn cg-btn-primary" data-cg="guide-done">알겠어요</button></div>
    </div>`;
}
function waresHtml(st, w, id, isLast) {
    return `<div class="cg-wares"><div class="cg-wares-head"><b>${esc(w.who || '상대')}의 물건</b><small>교환하거나 사고팔 수 있습니다</small></div>
        <ul>${w.items.map(x => `<li><span>${esc(x.name)}</span><b>${x.price ? esc(E.formatMoney(x.price)) : '값 흥정'}</b></li>`).join('')}</ul>
        ${isLast ? `<button class="cg-btn cg-btn-primary" data-cg="trade-open" data-id="${id}">거래 창 열기</button>` : ''}</div>`;
}

function checkCardHtml(id, chk, roll, isLast) {
    const head = `<div class="cg-check-head">${ICON.die}<span class="cg-check-label">판정</span><b>${esc(chk.stat)}</b><span class="cg-dot">·</span><span>난이도 ${chk.dc}</span></div>`;
    const what = chk.what ? `<div class="cg-check-what">${esc(chk.what)}</div>` : '';
    if (roll) {
        return `<div class="cg-check cg-rolled cg-tier-${tierClass(roll.tier)}" data-mesid="${id}">${head}${what}
            <div class="cg-check-result"><span class="cg-die-num">${roll.d20}</span><span class="cg-check-calc">${esc(E.describeRoll(roll))}</span><span class="cg-tier">${esc(roll.tier)}</span></div></div>`;
    }
    if (!isLast) return `<div class="cg-check cg-expired">${head}${what}<div class="cg-check-note">굴리지 않고 넘어간 판정</div></div>`;
    const st = cur.state;
    const mod = E.statMod(st?.stats?.[chk.stat] ?? 15);
    return `<div class="cg-check" data-mesid="${id}">${head}${what}
        <div class="cg-check-row"><span class="cg-check-note">d20 ${mod >= 0 ? '+' : ''}${mod} (${esc(chk.stat)} ${st?.stats?.[chk.stat] ?? '-'})</span>
        <button class="cg-btn cg-btn-primary" data-cg="roll" data-mesid="${id}">${ICON.die}<span>주사위 굴리기</span></button></div></div>`;
}

const tierClass = (t) => ({ 대성공: 'crit', 성공: 'ok', '부분 성공': 'part', 실패: 'fail', 대실패: 'fumble' }[t] || 'ok');

function decorateAll() {
    const els = [...document.querySelectorAll('#chat .mes')];
    measureNames(els);
    els.forEach(decorate);
}

async function doRoll(id) {
    const c = ctx();
    const m = c.chat?.[id];
    if (!m || !cur.state) return;
    if (m.extra?.cg_roll) return;
    const chk = E.parseCheck(m.mes);
    if (!chk) return;
    const r = E.rollCheck(cur.state, chk.stat, chk.dc, Math.random, chk.what);
    r.what = chk.what;
    m.extra = m.extra || {};
    m.extra.cg_roll = r;
    await saveChat();

    const card = document.querySelector(`#chat .mes[mesid="${id}"] .cg-check`);
    if (card) {
        card.classList.add('cg-rolling');
        const btn = card.querySelector('[data-cg="roll"]');
        if (btn) btn.disabled = true;
        const row = card.querySelector('.cg-check-row');
        if (row) row.innerHTML = '<span class="cg-die-num cg-spin">?</span>';
        const num = card.querySelector('.cg-die-num');
        let n = 0;
        await new Promise(res => {
            const t = setInterval(() => {
                if (num) num.textContent = String(1 + Math.floor(Math.random() * 20));
                if (++n > 12) { clearInterval(t); res(); }
            }, 55);
        });
    }
    refreshNow();
    toastr?.info?.(`${r.stat} 판정: ${r.total} vs ${r.dc} — ${r.tier}`, '왕관과 길드', { timeOut: 2500 });
}

/* ───────────────────────── 입력창 도우미 ───────────────────────── */

function insertInput(text, send = false) {
    const ta = document.getElementById('send_textarea');
    if (!ta) return;
    const v = ta.value.trim();
    ta.value = v ? `${v} ${text}` : text;
    ta.dispatchEvent(new Event('input', { bubbles: true }));
    ta.focus();
    if (send) document.getElementById('send_but')?.click();
}

function quickActions() {
    const st = cur.state;
    const acts = [
        ['의뢰판', '@board'],
        ['상점', '@shop'],
        ...(st && E.marketOf(st.location) ? [['시장', '@market']] : []),
        ['거래', '@trade'],
        ['정보 수집', '(주변에서 소문과 정보를 모은다)'],
        ['훈련', '(하루 동안 훈련한다)'],
        ['생활 기술', '(생활 기술을 수련한다: )'],
        ['낮잠', '(잠깐 눈을 붙인다)'],
        ['휴식', '(여관에서 하룻밤 쉰다)'],
        ['행동', '@act'],
    ];
    const o = st?.orgs || {};
    if (o.merchant) acts.splice(2, 0, ['장사', '(가게를 열고 장사를 한다)']);
    if (o.mage) acts.splice(2, 0, ['연구', '(탑에서 마법을 연구한다)']);
    if (o.artisan) acts.splice(2, 0, ['제작', '(공방에서 물건을 만든다)']);
    if (o.church) acts.splice(2, 0, ['봉사', '(성당에서 봉사하고 기도한다)']);
    if (o.knight) acts.splice(2, 0, ['기사단 임무', '(기사단의 훈련과 임무에 나선다)']);
    if (o.shadow) acts.splice(2, 0, ['뒷일', '(뒷골목에서 일을 받는다)']);
    return acts;
}

/* ───────────────────────── HUD · 빠른 행동 ───────────────────────── */

function bar(v, max, cls) {
    const pct = max > 0 ? Math.max(0, Math.min(100, (v / max) * 100)) : 0;
    return `<span class="cg-bar ${cls}"><i style="width:${pct}%"></i></span>`;
}

function hudEvent(st) {
    const t = E.eventsOn(st.day);
    if (t.length) return `<em class="cg-hud-ev now" data-cg="panel-cal" title="${esc(t.map(e => e.desc).join(' / '))}">${esc(t[0].name)}</em>`;
    const u = E.upcomingEvents(st.day, 14)[0];
    return u ? `<em class="cg-hud-ev" data-cg="panel-cal" title="${esc(u.ev.desc)}">${esc(u.ev.name)} D-${u.inDays}</em>` : '';
}

function renderHud() {
    let hud = document.getElementById('cg-hud');
    const s = settings();
    if (!cur.active || !cur.state || !s.showHud) { hud?.remove(); return; }
    if (!hud) {
        hud = document.createElement('div');
        hud.id = 'cg-hud';
        hud.className = 'cg-root';
        const chat = document.getElementById('chat');
        chat?.parentElement?.insertBefore(hud, chat);
    }
    const st = cur.state;
    const date = E.formatDate(st.day);
    const ready = E.promotionReady(st).length;
    hud.innerHTML = `
        <button class="cg-hud-name" data-cg="panel" title="모험가 수첩 열기">${ICON.crest}<span class="cg-hud-n">${esc(st.profile.name)}</span><span class="cg-hud-job">${esc(st.mainJob || '무소속')}${ready ? '<em class="cg-star" title="승급 자격">★</em>' : ''}</span></button>
        <div class="cg-hud-vitals">
            <span class="cg-hud-lv">${esc(st.cls || '')} Lv ${st.lv}</span>
            <span class="cg-hud-v" title="HP ${st.hp}/${E.maxHP(st)}"><b>HP</b>${bar(st.hp, E.maxHP(st), 'cg-hp')}<small>${st.hp}</small></span>
            <span class="cg-hud-v" title="MP ${st.mp}/${E.maxMP(st)}"><b>MP</b>${bar(st.mp, E.maxMP(st), 'cg-mp')}<small>${st.mp}</small></span>
            <span class="cg-hud-v" title="기력 ${E.energyOf(st)}/${E.maxEN(st)}"><b>기력</b>${bar(E.energyOf(st), E.maxEN(st), 'cg-en')}<small>${E.energyOf(st)}</small></span>
        </div>
        <span class="cg-hud-money">${ICON.coin}${esc(E.formatMoney(st.money))}</span>${(() => { const fl = letterFlags(); const n = (st.letters || []).filter(l => !fl[l.id]).length; return n ? `<span class="cg-hud-mail" data-cg="panel-tab" data-tab="news" title="안 읽은 편지">✉ ${n}</span>` : ''; })()}
        <span class="cg-hud-loc">${ICON.pin}<span>${esc(st.location)}</span><small>${date.m}월 ${date.d}일 ${esc(E.todOf(st))} · ${date.season} · ${esc(E.weatherOf(st.day, E.marketOf(st.location) || '제도 루미에른'))}</small>${hudEvent(st)}</span>
        <button class="cg-hud-book" data-cg="panel" title="모험가 수첩">${ICON.book}</button>`;
}

function renderQuick() {
    let q = document.getElementById('cg-quick');
    const s = settings();
    if (!cur.active || !cur.state || !s.showQuick) { q?.remove(); return; }
    if (!q) {
        q = document.createElement('div');
        q.id = 'cg-quick';
        q.className = 'cg-root';
        const form = document.getElementById('form_sheld');
        form?.insertBefore(q, form.firstChild);
    }
    q.innerHTML = quickActions().map(([l, t]) => t === '@board' ? `<button class="cg-q cg-q-strong" data-cg="board">${esc(l)}</button>`
        : t === '@shop' ? `<button class="cg-q cg-q-strong" data-cg="shop">${esc(l)}</button>`
        : t === '@market' ? `<button class="cg-q cg-q-strong" data-cg="market">${esc(l)}</button>`
        : t === '@trade' ? `<button class="cg-q" data-cg="trade-open">${esc(l)}</button>`
        : t === '@act' ? `<button class="cg-q cg-q-strong" data-cg="act-open">${esc(l)}</button>`
        : `<button class="cg-q" data-cg="quick" data-text="${esc(t)}">${esc(l)}</button>`).join('')
        + `<button class="cg-q cg-q-book" data-cg="panel">${ICON.book}<span>수첩</span></button>`;
}


/* ── 초상 (수첩 속 사진) ── 채팅마다 meta().portraits[이름|'@me'] 에 작게 줄여 저장 */
const portraits = () => { const m = meta(); if (m && !m.portraits) m.portraits = {}; return m?.portraits || {}; };
let personaMod = null;
import('/scripts/personas.js').then(m => { personaMod = m; }).catch(() => {});
function personaUrl() {
    const a = personaMod?.user_avatar;
    if (a) return `/User Avatars/${encodeURIComponent(a)}`;
    const img = [...document.querySelectorAll('#chat .mes[is_user="true"] .avatar img')].pop();
    return img?.getAttribute('src') || '';
}
/* 도감 인물의 기본 초상 — 확장 폴더 portraits/<file>.jpg (있는 것만, 처음 한 번 확인) */
const BUNDLED_OK = new Set();
const bundledUrl = (d) => new URL(`./portraits/${d.file}.jpg`, import.meta.url).href;
function probeBundled() {
    let left = E.NPC_DIR.length;
    for (const d of E.NPC_DIR) {
        const im = new Image();
        im.onload = () => { BUNDLED_OK.add(d.file); if (--left === 0) { renderPanel(); renderSide(); } };
        im.onerror = () => { if (--left === 0) { renderPanel(); renderSide(); } };
        im.src = bundledUrl(d);
    }
}
function portraitOf(who) {
    const all = portraits();
    if (all[who]) return all[who];
    if (who === '@me') return settings().personaPortrait ? personaUrl() : '';
    const d = E.npcInfo(who);
    if (d) {
        for (const k of [d.n, ...d.aka]) if (all[k]) return all[k];   // '미렐'로 넣은 사진도 '미렐 하트웰'에서 보인다
        if (BUNDLED_OK.has(d.file)) return bundledUrl(d);
    }
    return '';
}
let phMenu = null;
function photoHtml(who, label, cls = '') {
    if (!settings().portraits) return '';
    const src = portraitOf(who);
    return `<button class="cg-photo ${cls}${src ? '' : ' is-empty'}${phMenu === who ? ' is-open' : ''}" data-cg="ph-menu" data-who="${esc(who)}" title="${esc(label)} — 초상 바꾸기">${src ? `<img src="${esc(src)}" alt="" loading="lazy" draggable="false">` : `<span>${esc(String(label || '?').slice(0, 1))}</span><small>초상</small>`}</button>`;
}
function phMenuHtml(who) {
    if (phMenu !== who || !settings().portraits) return '';
    const has = !!portraits()[who];
    return `<div class="cg-ph-menu"><b>${who === '@me' ? '내 초상' : `${esc(who)}의 초상`}</b>
        ${portraitOf(who) ? `<button class="cg-mini" data-cg="ph-view" data-who="${esc(who)}">크게 보기</button>` : ''}
        <button class="cg-mini cg-primary-mini" data-cg="ph-up" data-who="${esc(who)}">사진 올리기</button>
        <button class="cg-mini" data-cg="ph-url" data-who="${esc(who)}">이미지 주소로</button>
        ${who === '@me' && has ? `<button class="cg-mini" data-cg="ph-clear" data-who="@me">페르소나 이미지로 되돌리기</button>` : has ? `<button class="cg-mini" data-cg="ph-clear" data-who="${esc(who)}">지우기</button>` : ''}
        <button class="cg-mini" data-cg="ph-menu" data-who="${esc(who)}">닫기</button>
        <small>세로 3:4로 잘라 이 채팅에 저장합니다.</small></div>`;
}

/* 초상 크게 보기 — 사진을 누르면 화면 가운데 크게, 거기서 바꾸기·지우기 */
function openPhotoView(who) {
    let ov = document.getElementById('cg-photoview');
    if (!ov) { ov = document.createElement('div'); ov.id = 'cg-photoview'; ov.className = 'cg-root'; document.body.appendChild(ov); }
    const src = portraitOf(who), name = who === '@me' ? (cur.state?.profile?.name || '나') : who;
    const own = !!portraits()[who];
    ov.innerHTML = `<div class="cg-pv-box" role="dialog" aria-label="${esc(name)}의 초상">
        <div class="cg-pv-img">${src ? `<img src="${esc(src)}" alt="">` : `<span>${esc(String(name).slice(0, 1))}</span><small>아직 초상이 없습니다</small>`}</div>
        <div class="cg-pv-bar"><b>${esc(name)}</b>
            <button class="cg-mini cg-primary-mini" data-cg="ph-up" data-who="${esc(who)}">${src ? '사진 바꾸기' : '사진 올리기'}</button>
            <button class="cg-mini" data-cg="ph-url" data-who="${esc(who)}">이미지 주소로</button>
            ${own ? `<button class="cg-mini" data-cg="ph-clear" data-who="${esc(who)}">${who === '@me' ? '페르소나 이미지로' : '지우기'}</button>` : ''}
            <button class="cg-mini" data-cg="pv-close">닫기</button></div></div>`;
    ov.onclick = (ev) => { if (ev.target === ov) closePhotoView(); };
    ov.classList.add('cg-open');
}
/* 캐릭터 패널 큰 초상: 작은 썸네일 대신 원본 그림 */
function fullCharAvatar() {
    const img = document.getElementById('avatar_load_preview'); if (!img) return;
    const src = img.getAttribute('src') || '';
    const m = src.match(/[?&]type=avatar&file=([^&]+)/);
    if (m) img.setAttribute('src', `/characters/${m[1]}`);
}
function closePhotoView() { document.getElementById('cg-photoview')?.classList.remove('cg-open'); }
function shrinkImage(src) {
    return new Promise((res, rej) => {
        const im = new Image(); im.crossOrigin = 'anonymous';
        im.onload = () => {
            const W = Math.min(900, Math.max(360, im.width)), H = Math.round(W * 4 / 3), r = Math.max(W / im.width, H / im.height);
            const sw = W / r, sh = H / r, sx = (im.width - sw) / 2, sy = Math.max(0, (im.height - sh) * 0.3);
            const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
            const cx = cv.getContext('2d'); cx.imageSmoothingEnabled = true; cx.imageSmoothingQuality = 'high'; cx.drawImage(im, sx, sy, sw, sh, 0, 0, W, H);
            try { res(cv.toDataURL('image/jpeg', 0.92)); } catch { res(null); }
        };
        im.onerror = rej; im.src = src;
    });
}
async function setPortrait(who, src) {
    let v = null;
    try { v = await shrinkImage(src); } catch { toastr.warning('그림을 읽지 못했습니다'); return; }
    portraits()[who] = v || src; // 다른 사이트 그림은 줄이지 못하면 주소 그대로
    phMenu = null; await saveChat(); renderPanel();
    if (document.getElementById('cg-photoview')?.classList.contains('cg-open')) openPhotoView(who);
}
function pickPortraitFile(who) {
    const inp = document.createElement('input'); inp.type = 'file'; inp.accept = 'image/*';
    inp.onchange = () => { const f = inp.files?.[0]; if (!f) return; const rd = new FileReader(); rd.onload = () => setPortrait(who, rd.result); rd.readAsDataURL(f); };
    inp.click();
}
async function askPortraitUrl(who) {
    const c = ctx(); let url = '';
    if (typeof c.callGenericPopup === 'function' && c.POPUP_TYPE) url = await c.callGenericPopup('이미지 주소(https://…)를 붙여 넣으세요', c.POPUP_TYPE.INPUT, '');
    else url = window.prompt('이미지 주소(https://…)');
    url = String(url || '').trim();
    if (url) setPortrait(who, url);
}

/* ───────────────────────── 모험가 수첩 (패널) ───────────────────────── */

let panelTab = 'status';

function openPanel(tab) {
    if (tab) panelTab = tab;
    let p = document.getElementById('cg-panel');
    if (!p) {
        p = document.createElement('aside');
        p.id = 'cg-panel';
        p.className = 'cg-root';
        document.body.appendChild(p);
    }
    p.classList.add('cg-open');
    dockHidden = false;
    document.body.classList.toggle('cg-docked', !!((settings().dock || isWide()) && cur.active));
    renderPanel();
}
function closePanel() { if (isWide()) return; if (settings().dock) dockHidden = true; document.getElementById('cg-panel')?.classList.remove('cg-open'); applyBodyState(); }

const TABS = [['status', '상태'], ['cls', '클래스'], ['life', '생활 기술'], ['bag', '소지품'], ['party', '동료·동반자'], ['craft', '공방'], ['shops', '가게·생업'], ['farm', '농장'], ['orgs', '소속·신분'], ['quests', '의뢰'], ['cal', '달력'], ['news', '소식'], ['rel', '인맥'], ['dex', '인물 도감'], ['log', '기록'], ['edit', '편집'], ['cheat', '치트']];

/** 테마가 세로 책갈피로 탭을 세울 때 쓰는 짧은 이름 (data-s) */
const TAB_SHORT = { life: '생활', party: '동료', shops: '가게', orgs: '신분', dex: '도감' };

function renderPanel() {
    renderSide();
    const p = document.getElementById('cg-panel');
    if (!p || !p.classList.contains('cg-open')) return;
    const st = cur.state;
    if (!cur.active) { closePanel(); return; }
    if (!st) {
        p.innerHTML = `<header class="cg-p-head"><span>${ICON.book}<span><em class="cg-en">Adventurer's Journal</em>모험가 수첩</span></span><button class="cg-x" data-cg="close-panel">${ICON.close}</button></header>
            <div class="cg-p-body"><div class="cg-empty">아직 등록된 모험가가 없습니다.<br><button class="cg-btn cg-btn-primary" data-cg="open-creator">캐릭터 만들기</button></div></div>`;
        return;
    }
    const body = { status: tabStatus, cls: tabClass, life: tabLife, bag: tabBag, party: tabParty, shops: tabShops, farm: tabFarm, craft: tabCraft, orgs: tabOrgs, quests: tabQuests, cal: tabCal, news: tabNews, rel: tabRel, dex: tabDex, log: tabLog, edit: tabEdit, cheat: tabCheat }[panelTab] || tabStatus;
    const keepScroll = p.querySelector('.cg-p-body')?.scrollTop || 0;
    const sameTab = p.dataset.tab === panelTab;
    p.dataset.tab = panelTab;
    p.innerHTML = `
        <header class="cg-p-head"><span>${ICON.book}<span><em class="cg-en">Adventurer's Journal</em>모험가 수첩</span></span><span class="cg-p-tools"><button class="cg-x cg-pin ${settings().dock ? 'on' : ''}" data-cg="dock-toggle" title="${settings().dock ? '고정 풀기' : '채팅 오른쪽에 고정'}">📌</button><button class="cg-x" data-cg="close-panel" title="닫기">${ICON.close}</button></span></header>
        <nav class="cg-tabs">${TABS.map(([k, l]) => `<button class="${k === panelTab ? 'on' : ''}" data-cg="tab" data-tab="${k}" data-s="${TAB_SHORT[k] || l}">${l}</button>`).join('')}</nav>
        <div class="cg-p-body">${body(st)}</div>`;
    if (sameTab) { const bd = p.querySelector('.cg-p-body'); if (bd) bd.scrollTop = keepScroll; }
}

function tabStatus(st) {
    const p = st.profile;
    const D = E.DIFFICULTY[st.difficulty];
    const a = p.appearance || {};
    const appear = [['체격', a.height], ['머리', a.hair], ['눈', a.eyes], ['인상', a.impression], ['특징', a.marks], ['차림', a.outfit], ['기타', a.free]].filter(([, v]) => v);
    const perks = [...(p.perksFree || []), ...(p.perks || [])];
    return `
    <section class="cg-idcard${settings().portraits ? ' has-photo' : ''}">
        ${photoHtml('@me', p.name, 'cg-photo-me')}
        <div class="cg-id-top"><span class="cg-diff cg-diff-${st.difficulty}">${D.label}</span><span class="cg-id-origin">${esc(E.ORIGINS[p.origin].label)} · ${esc(p.race)}</span></div>
        <h2>${esc(p.name)}</h2>
        <div class="cg-id-sub">${esc([p.gender, `${E.ageOf(st)}살${st.aging ? '' : ' (멈춤)'}`].filter(Boolean).join(' · '))}</div>
        <dl class="cg-id-grid">
            <dt>신분</dt><dd>${esc(E.statusLabel(st))}</dd>
            <dt>직업</dt><dd>${esc(st.mainJob || '무소속')}</dd>
            <dt>적성</dt><dd>${(st.affinity || []).map(elemChip).join(' ') || '<span class="cg-el cg-el-무">무</span> 무속성'}</dd>
            <dt>클래스</dt><dd>${esc(st.cls)} Lv ${st.lv}</dd>
            <dt>명성</dt><dd>${st.renown}</dd>
            <dt>의뢰</dt><dd>${st.questsDone}건 완료</dd>
            ${st.spouse ? `<dt>배우자</dt><dd>${esc(st.spouse.name)}</dd>` : ''}
        </dl>
        ${phMenuHtml('@me')}
    </section>
    <section class="cg-sec">
        <div class="cg-lvrow"><b>Lv ${st.lv}</b>${bar(st.exp, E.expNeed(st), 'cg-exp')}<small>EXP ${st.exp} / ${E.expNeed(st)}</small></div>
        <div class="cg-lvrow"><b>HP</b>${bar(st.hp, E.maxHP(st), 'cg-hp')}<small>${st.hp} / ${E.maxHP(st)}</small></div>
        <div class="cg-lvrow"><b>MP</b>${bar(st.mp, E.maxMP(st), 'cg-mp')}<small>${st.mp} / ${E.maxMP(st)}</small></div>
        <div class="cg-lvrow"><b>기력</b>${bar(E.energyOf(st), E.maxEN(st), 'cg-en')}<small>${E.energyOf(st)} / ${E.maxEN(st)}</small></div>
    </section>
    <section class="cg-sec">
        <h3>능력치${st.statPoints ? ` <em class="cg-pts">배분 가능 ${st.statPoints}</em>` : ''}</h3>
        <div class="cg-stats">${E.STATS.map(s => {
        const v = st.stats[s], m = E.statMod(v);
        return `<div class="cg-stat" title="${esc(E.STAT_DESC[s])}"><span>${s}</span><b>${v}</b><small>${m >= 0 ? '+' : ''}${m}</small>${st.statPoints && v < E.statCap(st) ? `<span class="cg-plus-row">${[1, 5].filter(n => n <= st.statPoints).map(n => `<button class="cg-plus" data-cg="stat-up" data-stat="${s}" data-n="${n}">+${n}</button>`).join('')}</span>` : ''}</div>`;
    }).join('')}</div>
    </section>
    ${st.conds.length ? `<section class="cg-sec"><h3>상태 이상</h3><div class="cg-tags">${st.conds.map(c => `<span class="cg-tag cg-tag-warn">${esc(c)}</span>`).join('')}</div></section>` : ''}
    ${st.titles.length ? `<section class="cg-sec"><h3>칭호</h3><div class="cg-tags">${st.titles.map(c => `<span class="cg-tag">${esc(c)}</span>`).join('')}</div></section>` : ''}
    ${st.skills.length ? `<section class="cg-sec"><h3>스킬</h3><ul class="cg-list">${st.skills.map(s => `<li><b>${esc(s.name)}</b>${s.desc ? `<small>${esc(s.desc)}</small>` : ''}</li>`).join('')}</ul></section>` : ''}
    ${perks.length ? `<section class="cg-sec"><h3>이세계 특전</h3><ul class="cg-list">${perks.map(k => `<li><b>${esc(k)}</b>${E.PERKS[k] ? `<small>${esc(E.PERKS[k])}</small>` : ''}</li>`).join('')}</ul></section>` : ''}
    <section class="cg-sec">
        <h3>프로필</h3>
        <dl class="cg-dl">
            <dt>배경</dt><dd>${esc(E.BACKGROUNDS[p.background]?.label)}</dd>
            ${appear.map(([k, v]) => `<dt>${k}</dt><dd>${esc(v)}</dd>`).join('')}
            ${p.personality ? `<dt>성격</dt><dd>${esc(p.personality)}</dd>` : ''}
            ${p.goal ? `<dt>목표</dt><dd>${esc(p.goal)}</dd>` : ''}
            ${p.story ? `<dt>사연</dt><dd>${esc(p.story)}</dd>` : ''}
        </dl>
    </section>
    <section class="cg-sec">
        <h3>자유 판정</h3>
        <div class="cg-free-roll">
            <select id="cg-fr-stat">${E.STATS.map(s => `<option>${s}</option>`).join('')}</select>
            <select id="cg-fr-dc">${Object.entries({ 쉬움: 8, 보통: 12, 어려움: 15, '매우 어려움': 18, 영웅적: 22 }).map(([k, v]) => `<option value="${v}" ${v === 12 ? 'selected' : ''}>${k} ${v}</option>`).join('')}</select>
            <button class="cg-btn" data-cg="free-roll">${ICON.die}<span>굴리기</span></button>
        </div>
        <small class="cg-hint">결과는 최근 GM 메시지에 기록되고, 다음 응답에 반영됩니다.</small>
    </section>`;
}

function bankHtml(st) {
    const here = E.placeKind(st.location) === 'city';
    return `<section class="cg-sec cg-bank"><h3>길드 예금 <small>맡길 때 무료 · 찾을 때 수수료 1%</small></h3>
        <div class="cg-bank-row"><span>잔고</span><b>${esc(E.formatMoney(st.bank || 0))}</b></div>
        <div class="cg-bank-ctl">
            <input id="cg-bank-amt" placeholder="금액 (예: 2금 50은)" ${here ? '' : 'disabled'}>
            <button class="cg-btn" data-cg="bank" data-val="예금" ${here && st.money > 0 ? '' : 'disabled'}>맡기기</button>
            <button class="cg-btn" data-cg="bank" data-val="인출" ${here && st.bank > 0 ? '' : 'disabled'}>찾기</button>
            <button class="cg-mini" data-cg="bank" data-val="예금" data-all="1" ${here && st.money > 0 ? '' : 'disabled'}>전부 맡기기</button>
        </div>
        ${E.creditLimit(st) || st.credit ? `<div class="cg-bank-row"><span>길드 보증 외상 <small>한도 ${esc(E.formatMoney(E.creditLimit(st)))} · 다음 달 1일 자동 상환</small></span><b>${esc(E.formatMoney(st.credit || 0))}</b></div>
        <div class="cg-bank-ctl"><button class="cg-btn" data-cg="bank" data-val="외상" ${here && st.credit < E.creditLimit(st) ? '' : 'disabled'}>외상 쓰기</button><button class="cg-btn" data-cg="bank" data-val="외상상환" ${st.credit > 0 && st.money > 0 ? '' : 'disabled'}>갚기</button><small class="cg-faint">위 칸에 금액을 적어 주세요</small></div>` : ''}
        <small class="cg-hint">${here ? '길드 지점이 있는 도시입니다. 큰돈을 들고 험한 곳을 다니면 소매치기·강도의 표적이 될 수 있어요. 생활비는 소지금에서만 나갑니다.' : '이곳에는 길드 지점이 없습니다 — 도시로 가야 맡기거나 찾을 수 있어요.'}</small>
    </section>`;
}

function merchantPerksHtml(st, m) {
    const sus = E.isSuspended(st, 'merchant');
    const now = E.merchantPerksNow(m.rank);
    const next = E.MERCHANT_PERKS[m.rank + 1];
    const hasCaravan = (st.assets || []).some(a => /상단/.test(a.name || a));
    return `<div class="cg-perks">
        <small class="cg-hint">회비 매달 ${esc(E.formatMoney(E.MERCHANT_DUES[m.rank] || 50))} · 거래 수수료 없음${sus ? ' · <b class="cg-warn-text">영업 정지 중 — 혜택이 막혀 있습니다</b>' : ''}</small>
        <ul class="${sus ? 'off' : ''}">${now.map(t => `<li>◆ ${esc(t)}</li>`).join('')}</ul>
        ${next ? `<div class="cg-perks-next"><em>다음 등급 ${esc(E.ORGS.merchant.ranks[m.rank + 1])}</em>${next.map(t => `<span>◇ ${esc(t)}</span>`).join('')}</div>` : ''}
        ${m.rank >= 3 && !hasCaravan ? `<button class="cg-mini" data-cg="caravan" ${st.money >= 500000 ? '' : 'disabled'}>상단 꾸리기 · 50금</button>` : ''}
    </div>`;
}

function guildExamHtml(st, mk) {
    const A = st.orgs.artisan; if (!A) return '';
    const nx = Object.keys(E.MASTER_EXAM).map(Number).find(x => x > A.rank && !A.exams?.[x]);
    const hall = ['제도 루미에른', '바르그홀름'].includes(mk);
    const passed = Object.keys(A.exams || {}).map(Number);
    const fits = nx ? st.items.filter(i => E.examFits(i.name, nx)) : [];
    const cands = nx ? st.items.filter(i => E.findCraft(i.name)) : [];
    return `<section class="cg-sec cg-exam"><h3>장인 길드 <small>${esc(E.orgLabel('artisan', A.rank))}${passed.length ? ` · 통과한 심사: ${passed.map(r => esc(E.ORGS.artisan.ranks[r])).join(', ')}` : ''}</small></h3>
        ${nx ? `<p><b>${esc(E.ORGS.artisan.ranks[nx])}</b>이 되려면 — ${esc(E.MASTER_EXAM[nx][2])}. 공적도 ${E.meritNeed(st, nx)} 필요 (지금 ${A.merit}).</p>
        ${cands.length ? `<ul class="cg-craftlist">${cands.map(i => { const ok = E.examFits(i.name, nx); return `<li class="${ok ? '' : 'locked'}"><div><b>${esc(i.name)}</b><small>${ok ? '심사 기준에 맞는다' : '품질이나 품목 난도가 모자라다'}</small></div><button class="cg-mini" data-cg="exam" data-name="${esc(i.name)}" ${ok && hall ? '' : 'disabled'}>심사에 내기</button></li>`; }).join('')}</ul>` : '<small class="cg-hint">심사에 낼 만한 물건을 먼저 만들어 보세요.</small>'}
        <small class="cg-hint">${hall ? '이곳 장인 길드 본관에서 심사를 받을 수 있습니다. 낸 물건은 돌려받지 못하고, 통과하면 본관에 걸립니다.' : '걸작 심사는 제도나 바르그홀름의 장인 길드 본관에서만 받습니다.'}${fits.length ? '' : ''}</small>` : '<p class="cg-hint">모든 심사를 통과했습니다.</p>'}
    </section>`;
}
function ordersHtml(st, mk) {
    const mine = st.commissions || [];
    const board = E.craftOrders(st).filter(o => !o.taken);
    if (!mine.length && !board.length) return '';
    const haveOf = (c) => { const qi = E.QUALITY.findIndex(q => q[0] === c.qmin); return st.items.filter(i => E.findCraft(i.name)?.[0] === c.item && E.QUALITY.findIndex(q => q[0] === E.qualityOf(i.name)) >= qi).reduce((a, i) => a + i.qty, 0); };
    return `<section class="cg-sec"><h3>주문 제작 <small>${mk ? `${esc(mk)} 주문 게시판 — 달마다 바뀝니다` : '맡은 주문'}</small></h3>
        ${mine.length ? `<ul class="cg-craftlist">${mine.map(c => { const h = haveOf(c), left = c.due - st.day; return `<li><div><b>${esc(c.client)} — ${esc(c.item)} ×${c.qty}</b><small>${esc(c.qmin)} 이상 · 보수 ${esc(E.formatMoney(c.total))} · ${left >= 0 ? `기한 ${left}일 남음` : `<span class="cg-warn-text">기한 ${-left}일 지남 (3할 깎임)</span>`} · 가진 것 ${h}/${c.qty}</small></div>
            <span class="cg-mkt-ctl"><button class="cg-mini" data-cg="order-deliver" data-id="${esc(c.id)}" ${h >= c.qty ? '' : 'disabled'}>납품</button><button class="cg-mini cg-danger" data-cg="order-drop" data-id="${esc(c.id)}">${orderDropAsk === c.id ? '정말?' : '포기'}</button></span></li>`; }).join('')}</ul>` : ''}
        ${board.length ? `<ul class="cg-craftlist">${board.map(o => `<li><div><b>${esc(o.client)} — ${esc(o.item)} ×${o.qty}</b><small>${esc(o.qmin)} 이상 · 개당 ${esc(E.formatMoney(o.unit))} (합계 ${esc(E.formatMoney(o.total))}) · ${o.days}일 안에</small></div><button class="cg-mini" data-cg="order-take" data-id="${esc(o.id)}" ${mine.length >= 3 ? 'disabled' : ''}>맡기</button></li>`).join('')}</ul>` : ''}
        <small class="cg-hint">주문은 세 건까지. 기한을 넘기면 보수가 3할 깎이고, 포기하면 장인 길드 경고를 받습니다. 납품하면 길드 공적이 크게 쌓여요.</small></section>`;
}
let orderDropAsk = null;
function tabCraft(st) {
    const mk = E.marketOf(st.location);
    const cr = E.crowdOf(mk || '제도 루미에른', st.day);
    const crafts = Object.keys(st.life || {}).filter(k => E.lineOf(k));
    const gathers = Object.keys(st.life || {}).filter(k => E.GATHER[k]);
    const blocked = mk && E.deliveryBlocked(mk, st.day);
    const head = `<div class="cg-season ${mk ? 'on' : ''}"><b>오늘 ${esc(cr.weather)}</b><span>${mk ? `${esc(mk)} · 손님 ${esc(cr.label)}${cr.why.length ? ` (${esc(cr.why.join(' · '))})` : ''}` : '시장이 없는 곳 — 납품하려면 도시나 마을로'}</span>${blocked ? '<small class="cg-warn-text">길이 막혀 오늘은 납품할 수 없다</small>' : ''}</div>`;
    const lines = crafts.map(sk => {
        const rank = st.life[sk].rank;
        const line = E.lineOf(sk);
        const goods = E.CRAFT_GOODS.filter(g => g[1] === sk);
        return `<section class="cg-sec"><h3>${esc(sk)} <small>${esc(E.LIFE_RANKS[rank])} · ${esc(line)} 계열 — 납품처: ${esc(E.CRAFT_LINES[line].buyer)}</small></h3>
            <ul class="cg-craftlist">${goods.map(([name, , need, base, rate]) => {
                const ok = rank >= need;
                const q = mk ? E.deliveryQuote(st, name, mk) : null;
                return `<li class="${ok ? '' : 'locked'}"><div><b>${esc(name)}</b><small>${ok ? `재료 ${esc(E.formatMoney(Math.round(base * 0.35)))} · ${rate >= 1 ? `하루 ${rate}개` : `${Math.round(1 / rate)}일에 1개`}${q ? ` · 납품(보통) ${esc(E.formatMoney(q.unit))}` : ''}${q?.why.length ? ` <i>${esc(q.why.join(' · '))}</i>` : ''}` : `${esc(sk)} ${esc(E.LIFE_RANKS[need])} 랭크부터 · 기준가 ${esc(E.formatMoney(base))}`}</small></div>
                    ${ok ? `<span class="cg-mkt-ctl"><input type="number" min="1" value="1" data-cq="${esc(name)}"><button class="cg-mini" data-cg="craft-make" data-name="${esc(name)}">만들기</button></span>` : ''}</li>`;
            }).join('')}</ul></section>`;
    }).join('');
    const made = st.items.filter(i => E.findCraft(i.name));
    const myShops = (st.shops || []);
    const madeHtml = made.length ? `<section class="cg-sec"><h3>만든 물건 <small>납품하거나 내 가게에 진열</small></h3>
        <ul class="cg-craftlist">${made.map(i => { const q = mk ? E.deliveryQuote(st, i.name, mk) : null; return `<li><div><b>${esc(i.name)} ×${i.qty}</b><small>값어치 ${esc(E.formatMoney(E.craftValue(i.name)))}${q ? ` · 오늘 납품가 ${esc(E.formatMoney(q.unit))}` : ''}${q?.why.length ? ` <i>${esc(q.why.join(' · '))}</i>` : ''}</small></div>
            <span class="cg-mkt-ctl"><input type="number" min="1" value="${i.qty}" data-dq="${esc(i.name)}"><button class="cg-mini" data-cg="craft-deliver" data-name="${esc(i.name)}" ${q && !blocked ? '' : 'disabled'}>납품</button>
            ${myShops.length ? `<select data-ds="${esc(i.name)}">${myShops.map(s2 => `<option>${esc(s2.name)}</option>`).join('')}</select><button class="cg-mini" data-cg="craft-display" data-name="${esc(i.name)}">진열</button>` : ''}</span></li>`; }).join('')}</ul>
        <small class="cg-hint">납품은 바로 돈이 되지만 납품처가 값을 매깁니다(장인 길드원은 수수료 없음, 등급이 오르면 조금 더). 진열하면 내 가게에서 이문을 붙여 천천히 팔립니다.</small></section>` : '';
    const gatherHtml = gathers.length ? `<section class="cg-sec"><h3>채집 생업 <small>일한 날만큼 교역품을 거둔다 — 성 밖일수록 많이</small></h3>
        <ul class="cg-tierlist">${gathers.map(sk => `<li><b>${esc(sk)}</b><small>${esc(E.LIFE_RANKS[st.life[sk].rank])} · ${esc(E.GATHER[sk])}</small><span class="cg-mkt-ctl" style="margin-left:auto"><input type="number" min="1" max="30" value="3" data-gq="${esc(sk)}"><button class="cg-mini" data-cg="gather" data-name="${esc(sk)}">일하기</button></span></li>`).join('')}</ul>
        <small class="cg-hint">비·눈 오는 날은 덜 거두고, 폭우·폭설엔 쉽니다. 거둔 교역품은 시장에서 팔거나 귀족가 주문에 쓸 수 있어요.</small></section>` : '';
    return head + guildExamHtml(st, mk) + ordersHtml(st, mk) + (lines || '<section class="cg-sec"><div class="cg-empty-s">제작 기술이 없습니다 — 대장일·세공·가죽 공예·재봉·목공·요리·연금술을 배우면 이곳에서 만들고 납품할 수 있어요.</div></section>') + madeHtml + gatherHtml;
}

let shopCloseAsk = null;
let soKind = '잡화';
function worksHtml(st) {
    const here = E.WORKS.filter(w => E.workPlaceOk(st, w));
    return `<section class="cg-sec"><h3>일자리 <small>${esc(st.location)} — 며칠씩 일하고 품삯을 받습니다</small></h3>
        ${here.length ? `<ul class="cg-craftlist">${here.map(w => { const p = E.workPay(st, w, st.day + 1); return `<li class="${p ? '' : 'locked'}"><div><b>${esc(w[0])}</b><small>${esc(w[5])} · 내일 품삯 약 ${p ? esc(E.formatMoney(p)) : '없음'}${w[4] ? ` · ${esc(w[4])} 실력이 늘수록 많이` : ''}</small></div>
            <span class="cg-mkt-ctl"><input type="number" min="1" max="30" value="3" data-wq="${esc(w[0])}"><button class="cg-mini" data-cg="work" data-name="${esc(w[0])}">일하기</button></span></li>`; }).join('')}</ul>` : '<div class="cg-empty-s">여기서는 일을 구할 수 없습니다 — 마을이나 도시로</div>'}
        <small class="cg-hint">계절·날씨·축제·정세에 따라 품삯이 달라집니다(수확철 농장, 축제 때 임시 경비, 역병 때 치유원, 손님 많은 날 주점 악사 팁).</small></section>`;
}
function estatesHtml(st) {
    const mk = E.marketOf(st.location);
    const own = st.estates || [];
    return `<section class="cg-sec"><h3>땅과 집 <small>세·배당은 달마다, 수확은 철마다 들어옵니다</small></h3>
        <ul class="cg-craftlist">${E.ESTATES.map(([name, market, price, kind, desc]) => { const has = own.some(e => e.name === name); return `<li class="${has ? 'mine' : ''}"><div><b>${esc(name)}${has ? ' · 내 것' : ''}</b><small>${esc(desc)} · ${esc(market)} · ${esc(E.formatMoney(price))}</small></div>
            ${has ? `<button class="cg-mini" data-cg="estate-sell" data-name="${esc(name)}">${estateSellAsk === name ? '정말 팔까요?' : '팔기(8할)'}</button>` : `<button class="cg-mini" data-cg="estate-buy" data-name="${esc(name)}" ${mk === market && st.money >= price ? '' : 'disabled'}>사기</button>`}</li>`; }).join('')}</ul>
        <small class="cg-hint">그 땅이 있는 곳에 가야 살 수 있습니다. 풍년·흉작, 광산 낙반, 사교 시즌 같은 일이 수입을 바꿉니다.</small></section>`;
}
let estateSellAsk = null;
function foodHtml(st, sh, here) {
    const fame = sh.fame || 0, rk = Math.max(0, E.ownerRank(st, sh));
    const mi = E.menuInfo(st, sh), fm = E.foodMult(st, sh);
    const cap = E.fameCap(rk), dn = E.districtOf(sh);
    const tiers = E.FAME_TIERS.map(([n, nm]) => `<i style="left:${n}%" title="${esc(nm)}"></i>`).join('');
    const nextT = E.FAME_TIERS.find(([n]) => n > fame);
    const id = esc(sh.name);
    const rows = (sh.menu || []).map(n => {
        const r = E.findRecipe(n); if (!r) return '';
        const live = mi.live.includes(r), sig = sh.signature === n;
        return `<li class="${live ? '' : 'off'} ${sig ? 'sig' : ''}"><button class="cg-star" data-cg="menu-sig" data-name="${id}" data-dish="${esc(n)}" title="대표 메뉴로">${sig ? '★' : '☆'}</button><b>${esc(n)}</b><span class="cg-taste">${'●'.repeat(r[2])}${'○'.repeat(5 - r[2])}</span>${r[3] ? `<em class="cg-season-tag">${esc(r[3])}</em>` : ''}<small>${live ? `값 ×${r[4]}` : (rk < r[1] ? '솜씨 부족' : '철 지남')}</small><button class="cg-mini" data-cg="menu-del" data-name="${id}" data-dish="${esc(n)}">빼기</button></li>`;
    }).join('');
    const avail = E.RECIPES.filter(r => !(sh.menu || []).includes(r[0]));
    const full = (sh.menu || []).length >= mi.slots;
    const regs = E.richRegulars(st, sh);
    const dOpts = Object.entries(E.DISTRICTS).map(([k, d]) => { const c = Math.round(E.SHOP_TIERS[sh.tier].open * d.move); const no = k === dn || (d.capital && sh.market !== '제도 루미에른') || (d.fame && fame < d.fame); return `<option value="${esc(k)}" ${no ? 'disabled' : ''}>${esc(k)} · ${esc(E.formatMoney(c))}${k === dn ? ' (지금)' : d.capital && sh.market !== '제도 루미에른' ? ' (제도만)' : d.fame && fame < d.fame ? ` (소문 ${d.fame})` : ''}</option>`; }).join('');
    const moveHere = E.marketOf(st.location) && E.marketOf(st.location) !== sh.market;
    const houses = E.presentHouses(st).filter(h => E.houseStance(st, h) === 'ok');
    const canBanq = rk >= 3 && (fame >= 35 || (st.patron && E.PATRON_ROLES[st.patron.role]?.chef));
    return `<div class="cg-food">
        <div class="cg-fame"><span>소문</span><div class="cg-fame-bar"><div style="width:${fame}%"></div><div class="cg-fame-cap" style="left:${cap}%" title="지금 솜씨로 닿을 수 있는 끝"></div>${tiers}</div><b>${esc(E.fameTier(fame))}</b></div>
        <small class="cg-hint">소문 ${Math.round(fame)}${nextT ? ` · 다음: ${esc(nextT[1])}(${nextT[0]})` : ''} · 요리 ${esc(E.LIFE_RANKS[rk])} 솜씨로는 ${cap}까지 · 손님 ×${fm.cap.toFixed(2)} · 값 ×${fm.price.toFixed(2)}${regs.length ? `<br>단골: ${esc(regs.join(', '))}` : ''}</small>
        <h5>메뉴판 <small>${(sh.menu || []).length}/${mi.slots}칸 · 맛 평균 ${mi.appeal.toFixed(1)}${mi.live.length ? '' : ' · 낼 요리가 없어 손님이 끊겨요'}</small></h5>
        <ul class="cg-menu">${rows || '<li class="off">메뉴가 비었습니다</li>'}</ul>
        <div class="cg-menu-add"><select id="cg-menu-${id}">${avail.map(r => `<option value="${esc(r[0])}" ${rk >= r[1] ? '' : 'disabled'}>${esc(r[0])} — 맛 ${r[2]}${r[3] ? ` · ${esc(r[3])}` : ''}${rk >= r[1] ? '' : ` (요리 ${esc(E.LIFE_RANKS[r[1]])})`}</option>`).join('')}</select><button class="cg-btn" data-cg="menu-add" data-name="${id}" ${full ? 'disabled' : ''}>${full ? '메뉴판이 꽉 참' : '메뉴에 올리기'}</button></div>
        ${(st.farms || []).length ? `<div class="cg-menu-add"><span class="cg-unit">재료</span><select id="cg-sup-${id}"><option value="없음">시장에서 사 온다</option>${st.farms.map(f => `<option value="${esc(f.name)}" ${sh.supply === f.name ? 'selected' : ''}>${esc(f.name)}에서 직접 기른 재료${f.market === sh.market ? '' : ' (운송 1할)'}</option>`).join('')}</select><button class="cg-mini" data-cg="shop-supply" data-name="${id}">정하기</button></div>${sh.homegrown === E.ymOf(st.day) ? '<small class="cg-hint">이달은 직접 기른 재료로 — 손님들이 알아봅니다 (맛 +0.4)</small>' : ''}` : ''}
        <div class="cg-food-row"><span>자리</span><b>${esc(dn)}</b><small>${esc(E.DISTRICTS[dn].desc)}</small></div>
        <div class="cg-menu-add"><select id="cg-move-${id}">${dOpts}</select><button class="cg-mini" data-cg="shop-move" data-name="${id}">${moveHere ? `${esc(E.marketOf(st.location))}로 옮기기` : '자리 옮기기'}</button></div>
        ${moveHere ? '<small class="cg-hint">다른 도시로 옮기면 소문과 평판이 절반으로 줄어요.</small>' : ''}
        ${canBanq && houses.length ? `<div class="cg-menu-add cg-banq"><select id="cg-banq-${id}">${houses.map(h => `<option value="${esc(h.name)}">${esc(h.name)}${st.patron?.house === h.name ? ' ★' : ''}</option>`).join('')}</select><select id="cg-banqk-${id}"><option value="잔칫상">잔칫상 (요리 D)</option><option value="궁정 만찬" ${rk >= 6 ? '' : 'disabled'}>궁정 만찬 (요리 A)</option></select><button class="cg-btn cg-btn-primary" data-cg="banquet" data-name="${id}">연회 차리기</button></div>` : ''}
    </div>`;
}
const farmOpen = new Set(['field', 'stable', 'store']);
function tabFarm(st) {
    const mk = E.marketOf(st.location);
    const total = E.landTotal(st), title = E.landTitle(st);
    const nextT = E.LANDLORD_TITLES.find(([n]) => n > total);
    const head = `<div class="cg-landlord"><b>${esc(title || '땅 없음')}</b><span>땅 ${total}필지</span>${nextT ? `<small>다음: ${esc(nextT[1])} — ${nextT[0]}필지</small>` : '<small>제국에서 손꼽히는 땅 부자</small>'}</div>`;
    const cards = (st.farms || []).map((f, fi) => {
        const u = E.farmUse(f), L = E.farmLabor(st, f), fd = E.farmFeed(f);
        const here = mk === f.market, reach = here || f.steward || !!f.kin;
        const cost = E.farmMonthlyCost(st, f);
        const rent = Math.round(u.tenant * (E.LAND_PRICE[f.market] || 20000) * E.TENANT_RENT);
        const seg = (n, cls, lab) => n ? `<i class="${cls}" style="flex:${n}" title="${esc(lab)} ${n}필지">${n >= 2 ? esc(lab) : ''}</i>` : '';
        const m = E.formatDate(st.day).m;
        const monthsTo = (hm) => { const arr = [].concat(hm); return Math.min(...arr.map(x => ((x - m + 12) % 12) || 12)); };
        const fields = (f.fields || []).map(x => { const c = E.findCrop(x.crop); const g = Math.min(1, Math.floor((st.day - x.since) / 30) / c[2]); return `<li><div><b>${esc(x.crop)} ${x.plots}필지</b><small>${c[1].join('·')}월 수확 · ${monthsTo(c[1])}달 뒤 · 자람 ${Math.round(g * 100)}%</small></div><button class="cg-mini" data-cg="farm-clear" data-fi="${fi}" data-what="${esc(x.crop)} ${x.plots}">갈아엎기</button></li>`; }).join('');
        const orch = (f.orchards || []).map(x => { const c = E.findOrchard(x.fruit); const left = c[2] - (st.day - x.planted); return `<li><div><b>${esc(x.fruit)} 과수원 ${x.plots}필지</b><small>${left > 0 ? `어린나무 — 첫 열매까지 ${Math.ceil(left / 30)}달` : `${Math.floor((st.day - x.planted) / 360)}년 된 나무 · ${c[1]}월 수확 · ${monthsTo(c[1])}달 뒤`}</small></div><button class="cg-mini" data-cg="farm-clear" data-fi="${fi}" data-what="${esc(x.fruit)} ${x.plots}">베어 내기</button></li>`; }).join('');
        const herd = E.LIVESTOCK.map(a => `<li class="${f.herd?.[a[0]] ? '' : 'none'}"><div><b>${esc(a[0])} <em>${f.herd?.[a[0]] || 0}마리</em></b><small>${esc(a[6])} · 한 마리 ${esc(E.formatMoney(a[1]))}</small></div><span class="cg-mkt-ctl"><input type="number" min="1" value="1" id="cg-hq-${fi}-${esc(a[0])}"><button class="cg-mini" data-cg="stock-buy" data-fi="${fi}" data-a="${esc(a[0])}" ${reach ? '' : 'disabled'}>들이기</button><button class="cg-mini" data-cg="stock-sell" data-fi="${fi}" data-a="${esc(a[0])}" ${reach && f.herd?.[a[0]] ? '' : 'disabled'}>팔기</button>${a[0] === '짐말' && f.herd?.짐말 && here ? `<button class="cg-mini" data-cg="farm-horse" data-fi="${fi}">타고 가기</button>` : ''}</span></li>`).join('');
        const store = Object.entries(f.store || {}).filter(([, q]) => q > 0).map(([g, q]) => `<li><div><b>${esc(g)} <em>${q}</em></b><small>한 개 ${esc(E.formatMoney(E.farmPrice(st, f, g)))}${E.FARM_GOODS[g]?.[1] ? ` · ${E.FARM_GOODS[g][1] === 1 ? '금방 상함' : '오래 두면 상함'}` : ''}</small></div><span class="cg-mkt-ctl"><button class="cg-mini" data-cg="farm-ship" data-fi="${fi}" data-g="${esc(g)}" ${reach ? '' : 'disabled'}>전부 출하</button>${E.findTrade(g) ? `<button class="cg-mini" data-cg="farm-load" data-fi="${fi}" data-g="${esc(g)}" ${here ? '' : 'disabled'}>짐에 싣기</button>` : ''}</span></li>`).join('');
        const cellar = (f.cellar || []).map(c => `<li><div><b>${esc(c.drink)} <em>${c.qty}통</em></b><small>${E.drinkAge(c, st.day)}년 묵음 · 솜씨 ×${c.q} · 한 통 약 ${esc(E.formatMoney(E.drinkValue(c, st.day)))}</small></div></li>`).join('');
        const brewOpts = Object.entries(E.BREW).map(([d, b]) => { const can = Math.floor((f.store?.[b[0]] || 0) / b[1]); return `<option value="${esc(d)}" ${can ? '' : 'disabled'}>${esc(d)} — ${esc(b[0])} ${b[1]}개에 한 통 (${can}통 가능)</option>`; }).join('');
        const plantOpts = `<optgroup label="밭작물">${E.FIELD_CROPS.map(c => `<option value="${esc(c[0])}">${esc(c[0])} — ${c[1].join('·')}월 수확${(E.CLIMATE[f.market]?.[c[0]] ?? 1) > 1.05 ? ' · 잘 맞음' : (E.CLIMATE[f.market]?.[c[0]] ?? 1) < 0.8 ? ' · 안 맞음' : ''}</option>`).join('')}</optgroup>
            <optgroup label="과수원 (묘목)">${E.ORCHARDS.map(o => `<option value="${esc(o[0])}">${esc(o[0])} — 묘목 ${esc(E.formatMoney(o[5]))}/필지 · ${Math.round(o[2] / 30)}달 뒤 첫 열매${(E.CLIMATE[f.market]?.[o[0]] ?? 1) > 1.05 ? ' · 잘 맞음' : (E.CLIMATE[f.market]?.[o[0]] ?? 1) < 0.8 ? ' · 안 맞음' : ''}</option>`).join('')}</optgroup>
            <optgroup label="그 밖"><option value="목초지">목초지 — 소·양·말을 놓아 먹인다</option><option value="소작">소작 — 소작인에게 내주고 소작료를 받는다</option></optgroup>`;
        const shops = (st.shops || []).map(s => `<option value="${esc(s.name)}">${esc(s.name)}로 보내기</option>`).join('');
        return `<article class="cg-farm">
            <header><b>${esc(f.name)}</b><em class="cg-shoptier">${f.plots}필지</em><small>${esc(f.market)}${here ? ' · <span class="cg-here">지금 여기</span>' : f.steward ? ' · 관리인이 돌봄' : ' · 멀리 있음'}</small></header>
            <div class="cg-landbar">${seg(u.fields, 'f', '밭')}${seg(u.orch, 'o', '과수원')}${seg(u.pasture, 'p', '목초지')}${seg(u.tenant, 't', '소작')}${seg(u.free, 'x', '놀림')}</div>
            ${staffListHtml(st, f.name)}${f.kin ? `<small class="cg-hint">${esc(E.josa(f.kin, '이', '가'))} 농장을 맡아 돌보고 있습니다 (관리인 노릇 · 일손 +2)</small>` : ''}
            <div class="cg-landlegend"><span class="f">밭 ${u.fields}</span><span class="o">과수원 ${u.orch}</span><span class="p">목초지 ${u.pasture}</span><span class="t">소작 ${u.tenant}</span><span class="x">놀림 ${u.free}</span></div>
            <dl class="cg-shopdl">
                <div><dt>일손</dt><dd class="${L.ratio < 1 ? 'cg-warn-text' : ''}">${L.have} / ${L.need}<small>${L.here ? ' · 주인 몫 2 포함' : ''}${L.ratio < 1 ? ' · 모자라면 수확이 준다' : ''}</small></dd></div>
                <div><dt>일꾼</dt><dd><span class="cg-step"><button class="cg-mini" data-cg="farm-worker" data-fi="${fi}" data-d="-1" ${f.workers && reach ? '' : 'disabled'}>−</button><b>${f.workers || 0}</b><button class="cg-mini" data-cg="farm-worker" data-fi="${fi}" data-d="1" ${reach ? '' : 'disabled'}>+</button></span><small>달마다 ${esc(E.formatMoney(E.WORKER_WAGE))}씩</small></dd></div>
                <div><dt>달마다</dt><dd>${rent ? `<span class="cg-good-text">+${esc(E.formatMoney(rent))}</span> ` : ''}-${esc(E.formatMoney(cost))}<small> · 품삯·꼴값${rent ? '·소작료' : ''}</small></dd></div>
                <div><dt>목초지</dt><dd class="${fd.cover < 1 ? 'cg-warn-text' : ''}">${u.pasture} / ${fd.pastureNeed}필지<small>${fd.cover < 1 ? ' · 모자란 만큼 꼴을 사 먹임' : ''}</small></dd></div>
            </dl>
            <div><div class="cg-fsec ${farmOpen.has('field') ? 'open' : ''}"><h5 class="cg-fsec-h" data-cg="fsec" data-k="field">밭과 과수원 <small>${u.fields + u.orch}필지</small><i class="cg-fsec-i"></i></h5><div class="cg-fsec-b">
            <ul class="cg-craftlist">${fields}${orch || ''}${!fields && !orch ? '<li class="none"><div><small>아무것도 심지 않았습니다</small></div></li>' : ''}</ul>
            <div class="cg-menu-add"><select id="cg-plant-${fi}">${plantOpts}</select><input type="number" min="1" value="${Math.max(1, Math.min(u.free, 2))}" id="cg-plantn-${fi}" class="cg-num-in"><button class="cg-btn" data-cg="farm-plant" data-fi="${fi}" ${u.free > 0 && reach ? '' : 'disabled'}>심기</button></div>
            ${u.pasture || u.tenant ? `<div class="cg-farm-mini">${u.pasture ? `<button class="cg-mini" data-cg="farm-clear" data-fi="${fi}" data-what="목초지 1">목초지 1필지 비우기</button>` : ''}${u.tenant ? `<button class="cg-mini" data-cg="farm-clear" data-fi="${fi}" data-what="소작 1">소작지 1필지 거두기</button>` : ''}</div>` : ''}
            </div></div><div class="cg-fsec ${farmOpen.has('herd') ? 'open' : ''}"><h5 class="cg-fsec-h" data-cg="fsec" data-k="herd">가축 <small>${E.LIVESTOCK.filter(a => f.herd?.[a[0]]).map(a => `${a[0]} ${f.herd[a[0]]}`).join(' · ') || '없음'}</small><i class="cg-fsec-i"></i></h5><div class="cg-fsec-b">
            <ul class="cg-craftlist cg-herd">${herd}</ul>
            </div></div><div class="cg-fsec ${farmOpen.has('stable') ? 'open' : ''}"><h5 class="cg-fsec-h" data-cg="fsec" data-k="stable">마구간 <small>${(f.stable || []).length}마리${E.horseRequests(st).some(r => !r.done && (f.stable || []).some(h => h.name === r.horse)) ? ' · <b class="cg-new">제안 있음</b>' : ''}</small><i class="cg-fsec-i"></i></h5><div class="cg-fsec-b">${stableHtml(st, f, fi)}
            </div></div><div class="cg-fsec ${farmOpen.has('store') ? 'open' : ''}"><h5 class="cg-fsec-h" data-cg="fsec" data-k="store">창고 <small>${Object.values(f.store || {}).filter(q => q > 0).length}가지 · 과일·채소·달걀은 금방 상함</small><i class="cg-fsec-i"></i></h5><div class="cg-fsec-b">
            <ul class="cg-craftlist">${store || '<li class="none"><div><small>비었습니다</small></div></li>'}</ul>
            ${shops && store ? `<div class="cg-menu-add"><select id="cg-shipshop-${fi}"><option value="">돈으로 받기</option>${shops}</select><small class="cg-hint">출하할 때 내 가게 재고로 보낼 수도 있어요</small></div>` : ''}
            </div></div><div class="cg-fsec ${farmOpen.has('cellar') ? 'open' : ''}"><h5 class="cg-fsec-h" data-cg="fsec" data-k="cellar">술 저장고 <small>${(f.cellar || []).reduce((a, c) => a + c.qty, 0)}통 · 와인은 묵힐수록 비싸다</small><i class="cg-fsec-i"></i></h5><div class="cg-fsec-b">
            <ul class="cg-craftlist">${cellar || '<li class="none"><div><small>담근 술이 없습니다</small></div></li>'}</ul>
            <div class="cg-menu-add"><select id="cg-brew-${fi}">${brewOpts.includes('option value') && !/<option value="[^"]*" >/.test(brewOpts) ? '<option value="" selected disabled>담글 원료가 창고에 없습니다</option>' : ''}${brewOpts}</select><input type="number" min="1" value="1" id="cg-brewn-${fi}" class="cg-num-in"><button class="cg-btn" data-cg="farm-brew" data-fi="${fi}" ${reach ? '' : 'disabled'}>담그기</button></div>
            ${(f.cellar || []).length ? `<div class="cg-farm-mini">${[...new Set(f.cellar.map(c => c.drink))].map(d => `<button class="cg-mini" data-cg="farm-ship" data-fi="${fi}" data-g="${esc(d)}" data-n="1" ${reach ? '' : 'disabled'}>${esc(d)} 1통 팔기</button>`).join('')}</div>` : ''}
            </div></div></div>
            <div class="cg-shop-more"><button class="cg-mini" data-cg="farm-steward" data-fi="${fi}" ${here || f.steward ? '' : 'disabled'}>${f.steward ? '관리인 내보내기' : `관리인 두기 · 달마다 ${esc(E.formatMoney(E.STEWARD_WAGE))}`}</button>
            <button class="cg-mini" data-cg="farm-sellland" data-fi="${fi}" ${here && u.free ? '' : 'disabled'}>놀리는 땅 1필지 팔기</button></div>
        </article>`;
    }).join('');
    const lp = mk ? E.LAND_PRICE[mk] : 0;
    const clim = mk ? Object.entries(E.CLIMATE[mk] || {}) : [];
    const buy = mk ? `<section class="cg-sec"><h3>땅 사기 <small>${esc(mk)} · 한 필지 ${esc(E.formatMoney(lp))}</small></h3>
        <div class="cg-shopopen"><input id="cg-fb-name" placeholder="농장 이름 (있는 농장 이름을 적으면 땅을 늘립니다)" value="${esc((st.farms || []).find(f => f.market === mk)?.name || '')}">
        <div class="cg-menu-add"><input type="number" min="1" value="3" id="cg-fb-n" class="cg-num-in"><span class="cg-unit">필지</span><select id="cg-fb-orch"><option value="">빈 땅</option>${E.ORCHARDS.map(o => `<option value="${esc(o[0])}">열매 맺는 ${esc(o[0])} 과수원 (+${esc(E.formatMoney(o[5] * 6))}/필지)</option>`).join('')}</select></div>
        <button class="cg-btn cg-btn-primary" data-cg="farm-buy">땅 사기</button></div>
        ${clim.length ? `<small class="cg-hint">이 땅의 풍토 — ${clim.map(([k, v]) => `${esc(k)} ${v > 1 ? '잘 됨' : v < 0.8 ? '안 됨' : '그럭저럭'}`).join(' · ')}</small>` : ''}
        <small class="cg-hint">땅값: ${Object.entries(E.LAND_PRICE).map(([k, v]) => `${esc(k)} ${esc(E.formatMoney(v))}`).join(' · ')}</small></section>` : '<section class="cg-sec"><div class="cg-empty-s">땅은 도시나 마을의 토지 중개인에게서 삽니다</div></section>';
    return `<section class="cg-sec"><h3>농장과 땅 <small>수확·가축·품삯은 달마다 저절로 계산됩니다</small></h3>${head}${cards || '<div class="cg-empty-s">아직 땅이 없습니다</div>'}</section>${horseMarketHtml(st)}${buy}`;
}
function farmOf(t) { return cur?.state?.farms?.[+t.dataset.fi]; }
function tabShops(st) {
    const mk = E.marketOf(st.location);
    const mr = st.orgs.merchant ? st.orgs.merchant.rank : -1;
    const tiers = Object.entries(E.SHOP_TIERS);
    const cards = (st.shops || []).map(sh => {
        const here = mk === sh.market;
        const cap = E.shopCapacity(st, sh);
        const days = cap ? Math.floor(sh.stock / Math.max(1, cap)) : 0;
        const next = sh.tier === '노점' ? '점포' : sh.tier === '점포' ? '상회' : null;
        const max = sh.tier === '노점' ? 1 : sh.tier === '점포' ? 4 : 12;
        const k = E.SHOP_KINDS[sh.kind];
        const craft = E.isCraftShop(sh.kind);
        const rk = E.ownerRank(st, sh);
        const margin = craft ? k[0] * (0.7 + Math.max(0, rk) * 0.08) : k[0];
        const can = next ? E.canRunTier(st, sh.kind, next) : null;
        const nextName = next ? (k[4]?.[Object.keys(E.SHOP_TIERS).indexOf(next)] || next) : '';
        return `<article class="cg-shopcard">
            <header><b>${esc(sh.name)}</b><em class="cg-shoptier">${esc(E.shopTierName(sh))}</em><small>${esc(sh.market)} · ${esc(sh.kind)} (이문 ${Math.round(margin * 100)}%)${craft ? ` · 주인의 ${esc(k[3])} ${esc(E.LIFE_RANKS[Math.max(0, rk)])}` : ''}${here ? ' · <span class="cg-here">지금 여기</span>' : ''}</small></header>
            ${craft ? `<small class="cg-hint">${here ? `주인이 직접 일하는 중 — 장사가 잘되고 ${esc(k[3])} 실력이 늘어요.` : `주인이 없어 ${sh.staff ? '제자·일꾼이 절반만 꾸려 갑니다.' : '문을 닫았습니다.'}`}${sh.kind === '여관' && here ? ' 제 여관이라 생활비가 들지 않아요.' : ''}</small>` : ''}
            <div class="cg-shoprow"><span>평판</span>${bar(sh.rep, 100, 'cg-exp')}<small>${Math.round(sh.rep)}</small></div>
            ${(() => { const c = E.crowdOf(sh.market, st.day); return `<div class="cg-crowd ${c.mult >= 1.15 ? 'up' : c.mult < 0.9 ? 'down' : ''}">오늘 ${esc(c.weather)} · 손님 <b>${esc(c.label)}</b>${c.why.length ? ` <small>${esc(c.why.join(' · '))}</small>` : ''}</div>`; })()}
            ${staffListHtml(st, sh.name)}
            ${E.isFoodShop(sh) ? foodHtml(st, sh, here) : ''}
            <dl class="cg-shopdl">
                <div><dt>${craft ? '재료' : '재고'}</dt><dd>${esc(E.formatMoney(sh.stock))}<small>${cap ? (sh.stock ? ` · 약 ${days}일치` : ' · 바닥!') : ' · 지킬 사람이 없어 문을 닫음'}</small></dd></div>
                <div><dt>하루 판매</dt><dd>${cap ? `원가 ${esc(E.formatMoney(cap))}어치` : '—'}<small>${sh.lastSales ? ` · 어제 매출 ${esc(E.formatMoney(sh.lastSales))}` : ''}</small></dd></div>
                <div><dt>${craft ? '제자·일꾼' : '점원'}</dt><dd><span class="cg-step"><button class="cg-mini" data-cg="shop-staff" data-name="${esc(sh.name)}" data-d="-1" ${sh.staff ? '' : 'disabled'}>−</button><b>${sh.staff}</b><button class="cg-mini" data-cg="shop-staff" data-name="${esc(sh.name)}" data-d="1" ${sh.staff < max ? '' : 'disabled'}>+</button></span><small>하루 ${esc(E.formatMoney(E.WAGE[sh.tier]))}씩 · 최대 ${max}</small></dd></div>
                <div><dt>금고</dt><dd class="${sh.till < 0 ? 'cg-warn-text' : ''}">${esc(E.formatMoney(sh.till))}<small> · 유지비 하루 ${esc(E.formatMoney(E.SHOP_TIERS[sh.tier].upkeep))}</small></dd></div>
            </dl>
            <div class="cg-bank-ctl">
                <input data-ss="${esc(sh.name)}" placeholder="${craft ? '재료에 쓸 돈' : '재고에 넣을 돈'} (예: 5은)">
                <button class="cg-btn" data-cg="shop-stock" data-name="${esc(sh.name)}" ${here || sh.staff ? '' : 'disabled'}>${craft ? '재료 들이기' : '재고 채우기'}</button>
                <button class="cg-btn" data-cg="shop-collect" data-name="${esc(sh.name)}" ${sh.till > 0 && (here || st.orgs.merchant) ? '' : 'disabled'}>${here ? '수금' : '어음으로 예금'}</button>
            </div>
            <div class="cg-menu-add cg-auto"><span class="cg-unit">자동 보충</span><select id="cg-auto-${esc(sh.name)}">${[0, 7, 14, 30].map(d => `<option value="${d}" ${(sh.auto || 0) === d ? 'selected' : ''}>${d ? `늘 ${d}일치 채워 두기` : '끔 — 직접 채운다'}</option>`).join('')}</select><button class="cg-mini" data-cg="shop-auto" data-name="${esc(sh.name)}">정하기</button></div>
            ${sh.auto ? `<small class="cg-hint">점원이 금고 돈(모자라면 소지금)으로 재고를 채웁니다. 주인이 멀리 있으면 도매상 웃돈 8%.</small>` : ''}
            <div class="cg-shop-more">
                ${next ? `<button class="cg-mini" data-cg="shop-up" data-name="${esc(sh.name)}" ${can.ok && st.money >= E.SHOP_TIERS[next].open ? '' : 'disabled'}>${esc(nextName)} 규모로 키우기 · ${esc(E.formatMoney(E.SHOP_TIERS[next].open))}${can.ok ? '' : ` (${esc(can.why)} 필요)`}</button>` : ''}
                <button class="cg-mini cg-danger" data-cg="shop-close" data-name="${esc(sh.name)}">${shopCloseAsk === sh.name ? '정말 폐업? 한 번 더' : '폐업'}</button>
            </div>
            ${here || sh.staff ? '' : '<small class="cg-hint">점원이 없고 주인도 멀리 있어 문을 닫았습니다. 점원을 두면 멀리서도 장사가 돌아가요.</small>'}
        </article>`;
    }).join('');
    const chefOff = E.chefScouts(st).length ? scoutHtml(st, true) : '';
    const chefPat = st.patron && E.PATRON_ROLES[st.patron.role]?.chef ? patronHtml(st, true) : '';
    return `${worksHtml(st)}${chefOff || chefPat ? `<section class="cg-sec"><h3>요리사를 찾는 집</h3>${chefOff}${chefPat}</section>` : ''}<section class="cg-sec"><h3>내 가게 <small>장사는 날이 지날 때마다 자동으로 굴러갑니다</small></h3>${cards || '<div class="cg-empty-s">아직 가게가 없습니다</div>'}</section>
    <section class="cg-sec"><h3>가게 열기 <small>${mk ? esc(mk) : '시장이 있는 곳에서만'}</small></h3>
        ${mk ? `<div class="cg-shopopen">
            <input id="cg-so-name" placeholder="가게 이름">
            <select id="cg-so-kind"><optgroup label="장사 — 상인 길드 등급으로 키운다">${Object.entries(E.SHOP_KINDS).filter(([k]) => !E.isCraftShop(k)).map(([k, v]) => `<option value="${esc(k)}" ${soKind === k ? 'selected' : ''}>${esc(k)} — ${esc(v[2])}</option>`).join('')}</optgroup>
                <optgroup label="손기술 — 내 기술 랭크로 키운다">${Object.entries(E.SHOP_KINDS).filter(([k]) => E.isCraftShop(k)).map(([k, v]) => `<option value="${esc(k)}" ${soKind === k ? 'selected' : ''}>${esc(k)} (${esc(v[3])}) — ${esc(v[2])}</option>`).join('')}</optgroup></select>
            <select id="cg-so-tier">${tiers.map(([k, t], i) => { const c = E.canRunTier(st, soKind, k); const nm = E.SHOP_KINDS[soKind]?.[4]?.[i] || k; return `<option value="${esc(k)}" ${c.ok ? '' : 'disabled'}>${esc(nm)} · 개업 ${esc(E.formatMoney(t.open))}${c.ok ? '' : ` (${esc(c.why)})`}</option>`; }).join('')}</select>
            <button class="cg-btn cg-btn-primary" data-cg="shop-open">개업</button></div>` : ''}
        <ul class="cg-tierlist">${tiers.map(([k, t]) => `<li><b>${esc(k)}</b><small>${esc(t.desc)} · 유지비 하루 ${esc(E.formatMoney(t.upkeep))} · 장사: ${t.need >= 0 ? `상인 길드 ${esc(E.ORGS.merchant.ranks[t.need])} 이상` : '누구나'} · 손기술: 기술 ${esc(E.LIFE_RANKS[E.CRAFT_NEED[k]])} 랭크 이상</small></li>`).join('')}</ul>
        <small class="cg-hint">손기술 가게(식당·여관·주점·대장간·공방·약방)는 주인이 직접 만들어 팔아서, 주인이 그곳에 있어야 제대로 돌아가고 일할수록 기술이 늡니다. 기술 랭크가 오르면 이문과 평판이 커지고 가게를 키울 수 있어요. 재고(원가)를 채워 두면 이문을 붙여 팔립니다. 평판·시장 크기·점원·주인이 곁에 있는지·이달의 정세가 매출을 바꿉니다. 재고가 바닥나면 평판이 떨어져요. 멀리 있을 때는 점원이 물건을 들이고(운송비 10%), 상인 길드원은 매출을 길드 어음으로 예금할 수 있습니다.</small>
    </section>${estatesHtml(st)}`;
}

function tabBag(st) {
    const eq = ['weapon', 'offhand', 'armor', 'accessory'];
    return `
    <section class="cg-money">${ICON.coin}<b>${esc(E.formatMoney(st.money))}</b><small>1금 = 100은 = 10,000동</small></section>
    ${bankHtml(st)}
    <section class="cg-sec"><h3>장비</h3>
        <div class="cg-equip">${eq.map(k => { const g = E.gearOf(st, k); return `<div class="cg-slot ${st.equip[k] ? '' : 'empty'} ${g && g.dur <= 0 ? 'broken' : ''}"><span>${E.SLOT_LABEL[k]}</span><b>${esc(st.equip[k] || '—')}${g?.plus ? ` <em class="cg-plus">+${g.plus}</em>` : ''}</b>${g ? `<div class="cg-dur">${bar(g.dur, g.max, g.dur < 30 ? 'cg-hp' : 'cg-exp')}<small>${g.dur}/${g.max}</small></div>` : ''}</div>`; }).join('')}</div>
        ${gearCtlHtml(st, eq)}
    </section>
    <section class="cg-sec"><h3>소지품 <small>${st.items.length}종</small></h3>
        ${st.items.length ? `<ul class="cg-items">${st.items.map(i => {
        const slot = E.equipSlotOf(i.name, st);
        const on = slot && st.equip[slot] === i.name;
        return `<li><span>${esc(i.name)}</span>${slot ? (on ? '<em class="cg-eq-on">장착 중</em>' : `<button class="cg-mini" data-cg="equip" data-slot="${slot}" data-name="${esc(i.name)}">장착</button>`) : ''}<b>×${i.qty}</b></li>`;
    }).join('')}</ul>` : '<div class="cg-empty-s">비어 있음</div>'}
        <button class="cg-btn cg-mt" data-cg="shop">상점 열기</button>
    </section>
    ${livingHtml(st)}
    <section class="cg-sec"><h3>자산</h3>
        ${st.assets.length ? `<ul class="cg-list">${st.assets.map(a => `<li><b>${esc(a)}</b></li>`).join('')}</ul>` : '<div class="cg-empty-s">아직 없음 — 집, 점포, 상회, 영지…</div>'}
    </section>`;
}

const openBranches = new Map(); // `${cls}|${group}` → 펼침 여부

function skillGroups(cls) {
    const list = E.SKILL_TREE[cls] || [];
    const magic = E.isMagicClass(cls);
    const groups = [];
    for (const x of list) {
        const key = x[4] || '무속성';
        let g = groups.find(y => y.key === key);
        if (!g) groups.push(g = { key, elem: E.ELEMENTS.includes(key) ? key : null, aff: key === '깃듦', items: [] });
        g.items.push(x);
    }
    for (const g of groups) g.items.sort((p, q) => p[1] - q[1]);
    return { groups, magic };
}

const skillChips = (st, sx) => (sx?.elem ? elemChip(sx.elem) : sx?.aff ? (st.affinity || []).map(elemChip).join('') : '') + mpChip(sx);
const mpChip = (sx) => { const m = E.skillMp(sx); return m === null ? '' : m === 0 ? '<em class="cg-mpc spirit" title="정령이 쓰는 기술 — 정령술사의 MP가 들지 않는다">정령의 몫</em>' : `<em class="cg-mpc">MP ${m}</em>`; };

function skillRowHtml(st, [n, t, from, d]) {
    const k = st.cskills[n];
    const sx = E.findSkill(n);
    const how = (t) => sx?.taboo ? '금서 · 깨달음 (금기)' : sx?.aff ? (t <= 2 ? '스승 · 깨달음' : '깨달음') : t <= 2 ? '교본 · 스승' : t === 3 ? '스승 · 깨달음' : '깨달음';
    if (k) {
        const pt = E.profTier(st, k.p);
        const next = pt < E.PROF_TIERS.length - 1 ? E.profNeed(st, pt + 1) : null;
        return `<li class="cg-t${t}"><i>${E.SKILL_TIER_NAME[t]}</i><div><span class="cg-skl-name"><b>${esc(n)}</b>${skillChips(st, sx)}<em class="cg-prof">${E.profTierName(pt)}</em></span><small>${esc(d)}</small>
            <div class="cg-lvrow">${bar(next ? k.p : 1, next || 1, 'cg-exp')}<small>${next ? `${k.p} / ${next}` : `${k.p} · 극의`}</small></div></div></li>`;
    }
    const ready = !from || st.cskills[from];
    return `<li class="cg-t${t} locked"><i>${E.SKILL_TIER_NAME[t]}</i><div><span class="cg-skl-name"><b>${esc(n)}</b>${skillChips(st, sx)}</span><small>${from ? `${esc(from)}에서 이어짐 · ` : ''}${how(t)}${ready ? '' : ' · 선행 기술 필요'}</small></div></li>`;
}

function branchRate(st, cls, g, mp) {
    if (g.key === '무속성') return '';
    const m = E.skillMult(st, { cls, branch: g.key, elem: g.elem, aff: g.aff }, mp);
    const way = mp.path === '외길' && mp.elem === g.key;
    const base = +(m / (way ? 1.25 : 1)).toFixed(2);
    if (!g.elem && !g.aff && base === 1) return '';
    const aff = g.aff || (g.elem && E.hasAffinity(st, g.elem)) || (E.BRANCH_AFF[cls]?.[g.key] || []).some(e => E.hasAffinity(st, e));
    return `<em class="cg-br-rate ${aff ? 'aff' : base < 1 ? 'low' : ''}">${aff ? '적성 · ' : ''}숙련 ×${base}${way ? '+' : ''}</em>`;
}

function skillTreeHtml(st, cls) {
    const { groups, magic } = skillGroups(cls);
    const mp = E.classPath(st, cls);
    const hasAff = (st.affinity || []).length > 0;
    return `<div class="cg-branches">${groups.filter(g => !g.aff || hasAff).map(g => {
        const id = `${cls}|${g.key}`;
        const open = !!openBranches.get(id);
        const base = g.items.filter(x => x[1] === 1);
        const upper = g.items.filter(x => x[1] > 1);
        const learned = g.items.filter(x => st.cskills[x[0]]).length;
        const psum = g.items.reduce((a, x) => a + (st.cskills[x[0]]?.p || 0), 0);
        const taboo = g.items.some(x => x[5] === '금기');
        const style = E.BRANCHES[cls]?.[g.key];
        const ba = (E.BRANCH_AFF[cls]?.[g.key] || []);
        const label = g.elem ? `${elemChip(g.elem)}<b>${esc(cls === '정령술사' ? `${g.elem}의 정령` : cls === '도적' && g.elem === '어둠' ? '그림자술' : `${g.elem} 계열`)}</b>${cls === '도적' && g.elem === '어둠' ? '<small class="cg-br-style">어둠 적성자의 오래된 기술</small>' : ''}`
            : g.aff ? `${st.affinity.map(elemChip).join('')}<b>깃든 속성</b><small class="cg-br-style">타고난 적성이 기술에 깃든다</small>`
            : g.key === '무속성' ? (cls === '마법사' ? '<span class="cg-el cg-el-무">무</span><b>무속성</b>' : E.hasPath(cls) ? '<b>공통</b><small class="cg-br-style">모든 갈래의 바탕</small>' : `<b>${esc(cls)}의 기술</b><small class="cg-br-style">한 줄기로 깊어진다</small>`)
            : `<b>${esc(g.key)}</b>${style ? `<small class="cg-br-style" title="${esc(style[1])}">${esc(style[0])}</small>` : ''}${ba.length ? `<small class="cg-br-style">${ba.map(elemChip).join('')}</small>` : ''}`;
        return `<div class="cg-branch ${open ? 'open' : ''} ${(g.elem && E.hasAffinity(st, g.elem)) || g.aff ? 'is-aff' : ''}">
            <button class="cg-br-head" data-cg="branch" data-val="${esc(id)}">
                <span class="cg-br-arrow">${upper.length ? (open ? '▾' : '▸') : '·'}</span>${label}${taboo ? '<em class="cg-br-taboo">금기</em>' : ''}${mp.path === '외길' && mp.elem === g.key ? '<em class="cg-br-path">외길</em>' : ''}
                <span class="cg-br-meta">${branchRate(st, cls, g, mp)}<small>익힘 ${learned}/${g.items.length}${psum ? ` · 숙련 ${psum}` : ''}</small></span>
            </button>
            ${base.length || open ? `<ol class="cg-skl">${base.map(x => skillRowHtml(st, x)).join('')}${open ? upper.map(x => skillRowHtml(st, x)).join('') : ''}</ol>` : ''}
            ${upper.length && !open ? `<button class="cg-br-more" data-cg="branch" data-val="${esc(id)}">상위 기술 ${upper.length}개 펼치기${upper.some(x => st.cskills[x[0]]) ? ` · 익힘 ${upper.filter(x => st.cskills[x[0]]).length}` : ''}</button>` : ''}
        </div>`;
    }).join('')}</div>`;
}

function classPathHtml(st, cls) {
    if (!E.hasPath(cls)) return '';
    const mp = E.classPath(st, cls);
    const magic = mp.magic;
    const rows = magic ? [...E.ELEMENTS, '무속성'].filter(e => (e === '무속성' ? cls === '마법사' : true) && (mp.by[e] !== undefined || (e !== '무속성' && E.hasAffinity(st, e))))
        : Object.keys(E.BRANCHES[cls] || {});
    const max = Math.max(1, ...rows.map(r => mp.by[r] || 0));
    const chip = (r) => magic ? (r === '무속성' ? '<span class="cg-el cg-el-무">무</span>' : elemChip(r)) : `<span class="cg-brname">${esc(r)}</span>`;
    const note = (r) => magic ? (E.hasAffinity(st, r) ? ' · 적성' : '') : '';
    return `<section class="cg-sec cg-mpath"><h3>${esc(E.classWay(cls))} <small>어떤 ${magic ? '속성' : '갈래'}를 주로 쓰느냐에 따라 저절로 정해집니다</small></h3>
        <div class="cg-mpath-top">${mp.path ? `<b>${esc(E.pathLabel(mp))}</b><span>${esc(E.pathDesc(mp))}</span>` : `<b class="cg-faint">아직 정해지지 않음</b><span>${magic ? (cls === '마법사' ? '속성 마법' : '정령 기술') : '갈래 기술'} 숙련 합계 ${mp.etotal} / ${mp.need} — 이만큼 쌓이면 길이 드러납니다.</span>`}</div>
        <ul class="cg-mpath-bars ${magic ? '' : 'cg-mpath-br'}">${rows.map(r => `<li>${chip(r)}${bar(mp.by[r] || 0, max, magic ? `cg-elbar cg-elbar-${r === '무속성' ? '무' : r}` : 'cg-exp')}<small>${mp.by[r] || 0}${note(r)}</small></li>`).join('')}</ul>
        <div class="cg-mpath-ways">${Object.entries(E.pathTable(cls)).filter(([k]) => k !== '올라운더' || magic || Object.keys(E.BRANCHES[cls] || {}).length > 2).map(([k, v]) => `<div class="${mp.path === k ? 'on' : ''}"><b>${esc(k)}</b><small>${esc(v)}</small></div>`).join('')}</div>
        <small class="cg-hint">${magic ? '적성 속성은 숙련 ×1.5 · 깨달음 ×1.5, 적성이 아닌 속성은 숙련 ×0.75. 한 속성에 숙련의 60% 이상을 쏟으면 외길, 두 속성이면 두 갈래, 셋 이상 고루 쓰면 올라운더가 됩니다.'
            : `한 갈래에 숙련의 60% 이상을 쏟으면 그 갈래의 외길(${Object.values(E.BRANCHES[cls] || {}).map(x => x[0]).join(' · ')}), 두 갈래면 두 갈래, ${Object.keys(E.BRANCHES[cls] || {}).length > 2 ? '셋 이상을 고루 쓰면 올라운더가 됩니다.' : '한쪽에 치우치지 않으면 두 갈래가 됩니다.'}${(st.affinity || []).length ? ' 깃든 속성 기술은 적성이라 숙련 ×1.5.' : ''}`} 쓰는 방식이 바뀌면 길도 바뀝니다.</small>
    </section>`;
}

function booksHtml(st) {
    const books = st.items.filter(i => /^교본[:：]/.test(i.name));
    if (!books.length) return '';
    return `<section class="cg-sec"><h3>가진 교본</h3>${books.map(b => {
        const sk = E.findSkill(b.name);
        if (!sk) return '';
        const known = E.knowsSkill(st, sk.name);
        const hasCls = !!st.classes[sk.cls];
        const pre = !sk.from || E.knowsSkill(st, sk.from);
        const can = !known && hasCls && pre;
        return `<div class="cg-clsrow"><b>${esc(sk.name)}</b><small>${esc(sk.cls)} ${E.SKILL_TIER_NAME[sk.tier]}${known ? ' · 이미 익힘' : !hasCls ? ` · ${esc(sk.cls)}를 먼저 배워야 함` : !pre ? ` · 선행: ${esc(sk.from)}` : ''}</small>
            <button class="cg-mini" data-cg="readbook" data-name="${esc(b.name)}" ${can ? '' : 'disabled'}>읽고 익히기</button></div>`;
    }).join('')}</section>`;
}

function tabClass(st) {
    const main = E.CLASSES[st.cls];
    const skillList = (cls) => skillTreeHtml(st, cls);
    const known = Object.entries(st.classes);
    const unknown = Object.entries(E.CLASSES).filter(([k]) => !st.classes[k]);
    const sub = st.sub && st.classes[st.sub] ? st.sub : null;
    return `
    <section class="cg-clsmain">
        <em class="cg-en">${esc(main.en)} · Main Class</em>
        <div class="cg-clsmain-top"><h2>${esc(st.cls)}</h2><span class="cg-hud-lv">Lv ${st.lv}</span></div>
        <div class="cg-id-sub">${esc(main.role)} · ${esc(main.weapon)} · 주 능력치 ${esc(main.stats.join('·'))} (판정 +${st.lv >= 30 ? 2 : 1})</div>
        ${E.CLASS_TRAIT[st.cls] ? `<div class="cg-aff-note cg-trait">${esc(E.CLASS_TRAIT[st.cls])}</div>` : ''}
        <div class="cg-rare-line">${rareBadge(st.cls)}<small>${esc(E.RARITY[E.classRarity(st.cls)][1])}</small></div>
        ${!['마법사', '정령술사', '소환사'].includes(st.cls) ? `<div class="cg-aff-note">${(st.affinity || []).length ? `${(st.affinity).map(elemChip).join(' ')} 적성 — 기술과 힘에 이 속성이 자연스레 깃듭니다. ${st.affinity.includes(E.COMMON_AFF[st.cls]) ? `${esc(st.cls)}에게 흔한 적성입니다.` : `${esc(st.cls)} 중에서는 드문 일입니다.`}` : '<span class="cg-el cg-el-무">무</span> 무속성 — 순수한 무기술과 몸의 힘으로 싸웁니다.'}</div>` : ''}
        <div class="cg-lvrow"><b>EXP</b>${bar(st.exp, E.expNeed(st), 'cg-exp')}<small>${st.lv >= E.CLASS_MAX ? 'MAX' : `${st.exp} / ${E.expNeed(st)}`}</small></div>
        ${skillList(st.cls)}
        <small class="cg-hint">기술은 교본을 사서 읽거나 스승에게 전수받아 익힙니다. 쓸수록 숙련도(미숙 → 익숙 → 숙련 → 달인 → 극의)가 오르고, 숙련 이상이 되면 쓸 때마다 낮은 확률로 이어지는 상위 기술을 스스로 깨칩니다. 비전 기술은 깨달음으로만 얻습니다.</small>
    </section>
    ${classPathHtml(st, st.cls)}
    ${booksHtml(st)}
    ${focusHtml(st, st.cls)}
    <section class="cg-sec"><h3>보조 클래스 <small>얻는 경험의 25%를 함께 받음</small></h3>
        ${sub ? `<div class="cg-clsrow"><b>${esc(sub)}</b><span class="cg-hud-lv">Lv ${st.classes[sub].lv}</span><small>${esc(E.CLASSES[sub].role)}</small><button class="cg-mini" data-cg="setsub" data-val="없음">해제</button></div>
            <div class="cg-sub-skl">${E.learnedSkills(st, sub).map(x => `<span>${esc(x.name)} · ${E.profTierName(E.profTier(st, x.p))}</span>`).join('') || '<span>익힌 기술 없음</span>'}</div>` : '<div class="cg-empty-s">없음 — 아래에서 익힌 클래스 하나를 보조로 둘 수 있습니다.</div>'}
    </section>
    <section class="cg-sec"><h3>익힌 클래스 <small>${known.length} / ${Object.keys(E.CLASSES).length}</small></h3>
        ${known.map(([k, v]) => `<div class="cg-clsrow ${k === st.cls ? 'on' : ''}">
            <b>${esc(k)}</b><span class="cg-hud-lv">Lv ${v.lv}</span><small>${esc(E.CLASSES[k].role)}</small>
            ${k === st.cls ? '<em class="cg-eq-on">주 클래스</em>' : `<button class="cg-mini" data-cg="setcls" data-val="${esc(k)}">주로</button>${k !== st.sub ? `<button class="cg-mini" data-cg="setsub" data-val="${esc(k)}">보조로</button>` : '<em class="cg-eq-on">보조</em>'}`}
        </div>`).join('')}
        <small class="cg-hint">클래스는 전투 중이 아닐 때 언제든 바꿀 수 있습니다. 바꾼 사실은 다음 응답에서 GM에게 전달됩니다.</small>
    </section>
    ${unknown.length ? `<section class="cg-sec"><h3>아직 배우지 않은 클래스</h3><ul class="cg-list cg-dim">${unknown.map(([k, c]) => `<li><b>${esc(k)} <small>${esc(c.role)}</small> ${rareBadge(k)}</b><small>배울 곳: ${esc(c.teacher)}${E.NEEDS_AFFINITY.includes(k) && !(st.affinity || []).length ? ' · 속성 적성이 있어야 발현' : ''}</small></li>`).join('')}</ul>
        <small class="cg-hint">이야기 속에서 스승을 찾아가 배우면 새 클래스가 생깁니다.</small></section>` : ''}`;
}

function focusHtml(st, cls) {
    const f = Object.entries(st.classes[cls]?.focus || {}).sort((a, b) => b[1] - a[1]);
    const n1 = E.focusNeed(st, 1), n2 = E.focusNeed(st, 2);
    return `<section class="cg-sec"><h3>${esc(cls)}로서의 강점 <small>성향 → 특화(${n1}) → 정통(${n2})</small></h3>
        ${f.length ? `<ul class="cg-focus">${f.map(([name, pts]) => {
        const t = E.focusTier(st, pts);
        const next = t < 2 ? E.focusNeed(st, t + 1) : null;
        const prev = E.focusNeed(st, t);
        return `<li class="cg-ft-${t}"><div class="cg-life-top"><b>${esc(name)}</b><span class="cg-ftier">${E.focusTierName(t)}${t ? ` · 판정 +${t}` : ''}</span></div>
            <div class="cg-lvrow">${bar(next ? pts - prev : 1, next ? next - prev : 1, 'cg-exp')}<small>${next ? `${pts} / ${next}` : `${pts} · 최고 단계`}</small></div></li>`;
    }).join('')}</ul>` : `<div class="cg-empty-s">아직 뚜렷한 강점이 없습니다. 같은 방식으로 싸우고 연습하다 보면 저절로 생깁니다.</div>`}
        <small class="cg-hint">특화·정통이 되면 그 분야의 판정(판정 내용에 분야 이름이 들어갈 때)에 보너스가 붙고, GM이 기술을 그 색깔로 그립니다. 흔한 분야 예: ${esc((E.FOCUS_HINTS[cls] || []).join(', '))} — 이 밖의 분야도 생길 수 있습니다.</small>
    </section>`;
}

function tabLife(st) {
    const groups = {};
    for (const [k, v] of Object.entries(E.LIFE)) (groups[v.group] = groups[v.group] || []).push([k, v]);
    return `${Object.entries(groups).map(([g, list]) => `
    <section class="cg-sec"><h3>${esc(g)}</h3>
        <ul class="cg-life">${list.map(([k, v]) => {
        const s = st.life[k];
        if (!s) return `<li class="locked"><div class="cg-life-top"><b>${esc(k)}</b><span class="cg-lrank">—</span></div><small>${esc(v.desc)}</small></li>`;
        const max = s.rank >= E.LIFE_RANKS.length - 1;
        return `<li><div class="cg-life-top"><b>${esc(k)}</b><span class="cg-lrank">${esc(E.lifeRankName(s.rank))}${s.rank ? '' : ''}</span></div>
            <div class="cg-lvrow">${bar(max ? 1 : s.pt, max ? 1 : E.lifeNeed(st, s.rank), 'cg-exp')}<small>${max ? 'MASTER' : `${s.pt} / ${E.lifeNeed(st, s.rank)}`}</small></div>
            <small>${esc(v.desc)} · 숙련 보너스 ${esc(v.stat)}</small></li>`;
    }).join('')}</ul>
    </section>`).join('')}
    <p class="cg-hint">랭크: 연습 → F → E → D → C → B → A → 9 → 8 … → 1. C·A·6·3·1랭크에 오르면 관련 능력치가 1씩 오릅니다.<br>이야기 속에서 요리하고, 낚시하고, 연주하면 GM이 수련치를 줍니다. 처음 해 보는 기술도 해 보면 '연습' 랭크로 생깁니다.</p>`;
}

function livingHtml(st) {
    const c = E.dailyCost(st);
    const home = E.hasHome(st);
    const opts = ['노숙', '싸구려', '보통', '고급', '자택'];
    return `<section class="cg-sec"><h3>생활 수준 <small>하루 ${esc(E.formatMoney(c.total))}${c.wages ? ` (동료 일당 ${esc(E.formatMoney(c.wages))} 포함)` : ''}</small></h3>
        <div class="cg-seg">${opts.map(o => `<button class="${st.living === o ? 'on' : ''}" data-cg="living" data-val="${o}" ${o === '자택' && !home ? 'disabled title="집이 있어야 합니다"' : ''}>${o}</button>`).join('')}</div>
        <small class="cg-hint">${esc(E.LIVING[st.living]?.desc || '')}${c.mode === '야영' ? ' · 지금은 바깥이라 야영합니다 (휴대 식량 하루 1개).' : ''}<br>${(() => { const L = E.LIVING[c.mode] || {}; return `하룻밤: 기력 ${Math.round((L.en || 0) * 100)}% · HP·MP ${Math.round((L.rec || 0) * 100)}% 회복${L.rest ? ` · 다음 날 최대 기력 ${L.rest > 0 ? '+' : ''}${L.rest}${L.rest > 0 ? ' (푹 쉼)' : ' (뻐근함)'}` : ''} / 낮잠: 기력 ${Math.round((L.nap?.[0] || 0) * 100)}% · HP·MP ${Math.round((L.nap?.[1] || 0) * 100)}%`; })()}<br>날짜가 넘어가면 생활비가 자동으로 나가고, 쉬는 만큼 HP·MP·기력이 회복됩니다. 기력이 0이 되면 쓰러지는데, 자택이 없으면 누군가 치료소나 여관으로 옮겨 주고 수고비(가진 돈의 10%, 최소 1은·최대 2금)를 챙겨 갑니다. 돈이 모자라면 ${st.difficulty === 'easy' ? '경고만 뜹니다' : '굶주림·빈털터리 상태가 됩니다'}.</small>
    </section>`;
}

const rareBadge = (c) => { const r = E.classRarity(c); return `<span class="cg-rare cg-rare-${r}" title="발현 난이도">${'◆'.repeat(r + 1)}<i>${esc(E.RARITY[r][0])}</i></span>`; };
const elemChip = (e) => `<span class="cg-el cg-el-${esc(e)}">${esc(e)}</span>`;

function soulHtml(st) {
    if (!st.classes?.테이머) return '';
    const used = E.soulUsed(st), cap = E.soulCap(st);
    const pips = Array.from({ length: Math.max(cap, used) }, (_, i) => `<i class="${i < used ? 'on' : ''} ${i >= cap ? 'over' : ''}"></i>`).join('');
    return `<div class="cg-soul"><span><b>영혼의 자리</b><small>${used} / ${cap}</small></span><span class="cg-soul-pips">${pips}</span>
        <small class="cg-hint">${st.classes?.테이머 ? `테이머 레벨과 정신이 자랄수록 넓어집니다. 순한 짐승 1 · 사나운 짐승 2 · 마수 3 · 상위 마수 5 · 전설 8. 이미 다른 이와 유대를 쌓은 짐승은 길들이기 훨씬 어렵습니다.` : '테이머가 아니면 짐승 한 마리 정도만 곁에 둘 수 있습니다.'}</small></div>`;
}

function beastHtml(c) {
    const o = E.obeyState(c);
    const away = c.away;
    return `<div class="cg-obey cg-obey-${o.lv}"><span><b>${esc(o.name)}</b><small>${esc(E.GRADE_NAME[c.grade || 1])} · 영혼의 자리 ${E.soulCost(c.grade)} · 뜻대로 부리려면 유대 ${o.need}</small></span></div>
        <div class="cg-call ${away ? '' : 'out'}">${away
            ? `<span>◇ ${away.fee ? `${esc(away.to)}에게 대여 중 <small>하루 ${esc(E.formatMoney(away.fee))} · 교감 유지 약 ${E.awayDaysLeft(c)}일 남음</small>` : `${esc(away.to)}에 맡김 <small>교감 유지 약 ${E.awayDaysLeft(c)}일 남음</small>`}</span><button class="cg-btn cg-btn-primary" data-cg="comp-home" data-val="${esc(c.name)}">데려오기</button>`
            : `<span>◆ 곁에 있음 <small>떨어져도 교감 약 ${E.awayDaysLeft(c)}일 유지</small></span><button class="cg-btn" data-cg="comp-stable" data-val="${esc(c.name)}">마구간에 맡기기</button>`}</div>`;
}

function companionsHtml(st) {
    const list = st.companions || [];
    const title = `<h3>동반자 · 동물 <small>정령 · 소환수 · 짐승 · 반려동물</small></h3>${soulHtml(st)}`;
    if (!list.length) return `<section class="cg-sec">${title}<div class="cg-empty-s">아직 없습니다. 정령술사는 정령과, 소환사는 이계의 존재와 계약하고, 테이머는 짐승을 길들입니다. 누구나 개·고양이 같은 동물과 함께 살 수 있어요.</div>${petAdoptHtml(st)}</section>`;
    return `<section class="cg-sec">${title}${list.map(c => {
        if (c.kind === '마수' && !c.tamed) return animalHtml(st, c);
        const K = E.COMPANION_KINDS[c.kind];
        return `<div class="cg-mate cg-comp cg-comp-${esc(c.kind)}">
            <div class="cg-mate-head"><b>${esc(c.name)}</b><span><em class="cg-kind">${esc(c.kind)}</em> ${c.elem ? elemChip(c.elem) : ''}</span></div>
            <div class="cg-comp-sub">${esc(E.compSpecies(c))} · ${esc(E.companionStage(c))} · Lv ${c.lv}</div>
            ${c.kind === '정령' ? `<div class="cg-cheat-row cg-sp-name"><input id="cg-spn-${esc(c.name)}" placeholder="지어 줄 이름"><button class="cg-mini" data-cg="spirit-name" data-val="${esc(c.name)}">이름 지어 주기</button></div>` : ''}
            ${E.CALL_MP[c.kind] ? `<div class="cg-call ${c.out ? 'out' : ''}"><span>${c.out ? `◆ 곁에 불려 나와 있음 <small>유지 장면마다 MP ${E.keepCost(c)}</small>` : `◇ 쉬는 중 <small>부르기 MP ${E.callCost(c)} · 유지 MP ${E.keepCost(c)}</small>`}</span>
                ${c.out ? `<button class="cg-btn" data-cg="comp-back" data-val="${esc(c.name)}">돌려보내기</button>` : `<button class="cg-btn cg-btn-primary" data-cg="comp-call" data-val="${esc(c.name)}" ${st.mp < E.callCost(c) || c.hp <= 0 ? 'disabled' : ''}>불러내기</button>`}</div>` : ''}
            <div class="cg-lvrow"><b>HP</b>${bar(c.hp, c.maxhp, 'cg-hp')}<small>${c.hp} / ${c.maxhp}</small></div>
            <div class="cg-lvrow"><b>유대</b><span class="cg-relbar"><i style="left:${c.bond < 0 ? 50 + c.bond / 2 : 50}%;width:${Math.abs(c.bond) / 2}%" class="${c.bond < 0 ? 'neg' : ''}"></i></span><small>${c.bond > 0 ? '+' : ''}${c.bond}</small></div>
            ${c.kind === '마수' && c.tamed ? beastHtml(c) : ''}
            ${c.terms ? `<div class="cg-terms">계약 조건 — ${esc(c.terms)}</div>` : ''}
            ${c.conds?.length ? `<div class="cg-mate-foot cg-bad">${esc(c.conds.join(', '))}</div>` : ''}
            <div class="cg-mate-foot">${esc(K.desc.split('.')[0])}.${K.upkeep ? (c.away ? ' 먹이는 맡긴 곳에서.' : ` 먹이 하루 ${esc(E.formatMoney(K.upkeep))}`) : ''}</div>
        </div>`;
    }).join('')}${petAdoptHtml(st)}</section>`;
}
function animalHtml(st, c) {
    const T = E.PET_TRAITS[c.trait];
    const homes = [['', '곁에 데리고 다님'], ['자택', '집에 두기'], ...(st.shops || []).map(x => [x.name, `${x.name}에 두기 (마스코트)`])];
    return `<div class="cg-mate cg-comp cg-comp-pet${settings().portraits ? ' has-photo' : ''}">${photoHtml(c.name, c.name, 'cg-photo-mate')}<div class="cg-mate-body">
        <div class="cg-mate-head"><b>${esc(c.name)}</b><span><em class="cg-kind">${c.pet ? '반려동물' : '동물'}</em></span></div>
        <div class="cg-comp-sub">${esc(c.species || '')}${c.trait ? ` · <span class="cg-pettrait" title="${esc(T?.[1] || '')}">${esc(c.trait)}</span>` : ''}${c.home ? ` · ${c.home === '자택' ? '집에서 기다림' : `${esc(c.home)}의 마스코트`}` : ''}</div>
        <div class="cg-lvrow"><b>유대</b>${bar(Math.max(0, c.bond), 100, 'cg-exp')}<small>${c.bond}</small></div>
        <div class="cg-mate-foot">${esc(T?.[1] || '')}. 함께 지낸 날만큼 가까워집니다${T && T[0] !== 1 ? ` (속도 ×${E.traitRate(c)})` : ''}. 먹이 하루 ${esc(E.formatMoney(E.PET_UPKEEP))}.</div>
        <div class="cg-cheat-row"><button class="cg-mini cg-primary-mini" data-cg="pet-care" data-val="${esc(c.name)}" ${c.cared === st.day ? 'disabled' : ''}>${c.cared === st.day ? '오늘 돌봄' : '돌보기'}</button>
            <select data-cg-change="pet-home" data-val="${esc(c.name)}">${homes.map(([v, l]) => `<option value="${esc(v)}" ${(c.home || '') === v ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select></div>
    </div>${phMenuHtml(c.name)}</div>`;
}
let petFormOpen = false;
function petAdoptHtml(st) {
    if (!petFormOpen) return `<div class="cg-cheat-row cg-mt"><button class="cg-btn" data-cg="pet-form">＋ 동물 들이기</button></div>`;
    return `<div class="cg-petform"><b>동물 들이기</b>
        <div class="cg-cheat-row"><input id="cg-pet-name" placeholder="이름"><select id="cg-pet-sp">${Object.entries(E.PET_SPECIES).map(([k, v]) => `<option value="${esc(k)}">${esc(k)} (분양 ${esc(E.formatMoney(v))})</option>`).join('')}</select>
        <select id="cg-pet-tr"><option value="">성격: 데려와 봐야 안다</option>${Object.keys(E.PET_TRAITS).map(k => `<option>${esc(k)}</option>`).join('')}</select></div>
        <div class="cg-cheat-row"><button class="cg-btn cg-btn-primary" data-cg="pet-adopt" data-mode="buy">분양받기</button><button class="cg-btn" data-cg="pet-adopt" data-mode="rescue">길에서 구해 데려오기</button><button class="cg-mini" data-cg="pet-form">닫기</button></div>
        <small class="cg-hint">분양은 돈이 들고, 구해 준 동물은 처음부터 마음을 조금 열고 옵니다. 데려온 장면은 GM이 그려 줍니다.</small></div>`;
}

function tabParty(st) {
    return tabPartyMembers(st) + companionsHtml(st);
}

function tabPartyMembers(st) {
    if (!st.party.length) return `<section class="cg-sec"><h3>동료</h3><div class="cg-empty-s">아직 함께 다니는 동료가 없습니다.<br>이야기 속에서 파티를 꾸리거나, 길드 주점에서 동료를 구해 보세요.</div></section>`;
    return `<section class="cg-sec"><h3>동료 <small>${st.party.length}명 · 일당 합계 ${esc(E.formatMoney(st.party.reduce((a, m) => a + (m.wage || 0), 0)))}</small></h3>
        ${st.party.map(m => {
        const v = st.rel[m.name] || 0;
        return `<div class="cg-mate${settings().portraits ? ' has-photo' : ''}">${photoHtml(m.name, m.name, 'cg-photo-mate')}<div class="cg-mate-body">
                <div class="cg-mate-head"><b>${esc(m.name)}</b><span>${esc([m.role, m.rank].filter(Boolean).join(' · '))}</span></div>
                <div class="cg-lvrow"><b>HP</b>${bar(m.hp, m.maxhp, 'cg-hp')}<small>${m.hp} / ${m.maxhp}</small></div>
                <div class="cg-lvrow"><b>호감</b><span class="cg-relbar"><i style="left:${v < 0 ? 50 + v / 2 : 50}%;width:${Math.abs(v) / 2}%" class="${v < 0 ? 'neg' : ''}"></i></span><small>${v > 0 ? '+' : ''}${v}</small></div>
                <div class="cg-mate-foot">${m.wage ? `일당 ${esc(E.formatMoney(m.wage))}` : '무보수'}${m.conds?.length ? ` · <span class="cg-bad">${esc(m.conds.join(', '))}</span>` : ''}</div>
            </div>${phMenuHtml(m.name)}</div>`;
    }).join('')}
        <small class="cg-hint">동료는 GM이 이야기 속에서 합류·이탈시킵니다. 일당이 밀리면 호감이 떨어집니다.</small></section>`;
}

let calOffset = 0;
/* ── 소식: 편지함 · 제도 소식지 · 소문 ── */
let letterOpen = null;
const letterFlags = () => { const m = meta(); if (m && !m.letterFlags) m.letterFlags = {}; return m?.letterFlags || {}; };
function tabNews(st) {
    const fl = letterFlags();
    const letters = (st.letters || []).filter(l => fl[l.id] !== 'h').slice().reverse();
    const unread = letters.filter(l => !fl[l.id]).length;
    const g = E.gazette(st), rm = g.rumors;
    const open = letters.find(l => l.id === letterOpen);
    return `<section class="cg-sec"><h3>편지함 <small>${letters.length ? `${letters.length}통${unread ? ` · 안 읽음 ${unread}` : ''}` : '아직 받은 편지가 없습니다'}</small></h3>
        ${open ? `<article class="cg-letterview"><header><b>${esc(open.from)}</b><small>${esc(E.formatDate(open.day).text)}</small></header><div>${esc(open.body).replace(/\n/g, '<br>')}</div>
            <footer><button class="cg-btn cg-btn-primary" data-cg="letter-reply" data-from="${esc(open.from)}">답장 쓰기</button><button class="cg-btn" data-cg="letter-pop" data-id="${esc(open.id)}">펼쳐 보기</button><button class="cg-btn" data-cg="letter-close">목록으로</button><button class="cg-btn" data-cg="letter-hide" data-id="${esc(open.id)}">치우기</button></footer></article>` : ''}
        ${letters.length ? `<ul class="cg-letters">${letters.map(l => `<li class="${fl[l.id] ? '' : 'new'} ${l.id === letterOpen ? 'on' : ''}" data-cg="letter-open" data-id="${esc(l.id)}"><b>${esc(l.from)}</b><span>${esc(l.body.replace(/\s+/g, ' ').slice(0, 42))}${l.body.length > 42 ? '…' : ''}</span><small>${E.formatDate(l.day).m}월 ${E.formatDate(l.day).d}일</small></li>`).join('')}</ul>` : '<p class="cg-hint">GM이 편지를 보내면(가족·혼담·의뢰인·옛 동료…) 여기에 쌓입니다. 직접 쓰려면 아래 버튼을 누르세요.</p>'}
        <div class="cg-farm-mini"><button class="cg-btn" data-cg="letter-write">편지 쓰기</button></div>
        ${(st.sent || []).length ? `<h4 class="cg-cr-sub">보낸 편지</h4><ul class="cg-letters cg-sent">${(st.sent || []).slice().reverse().slice(0, 12).map(x => `<li><b>→ ${esc(x.to)}</b><span>${esc(x.body.replace(/\s+/g, ' ').slice(0, 42))}${x.body.length > 42 ? '…' : ''}</span><small>${E.formatDate(x.day).m}월 ${E.formatDate(x.day).d}일${E.pendingSent(st).includes(x) ? ' · 답 기다리는 중' : ''}</small></li>`).join('')}</ul>` : ''}</section>
    <section class="cg-sec cg-gazette"><h3>제도 소식지 <small>${esc(g.issue)}</small></h3>
        <ul>${g.items.map(it => `<li><b>${esc(it.h)}</b><span>${esc(it.t)}</span></li>`).join('')}</ul>
        <div class="cg-farm-mini">${actBtn('소식지 기사를 더 알아보기', '(소식지에 난 이야기를 더 알아본다: )')}</div></section>
    <section class="cg-sec"><h3>나에 관한 소문 <small>명성 ${st.renown || 0}</small></h3>
        ${rm ? `<p class="cg-hint">${esc(rm.reach)} 이런 이야기가 돕니다 — 부풀려지기도 합니다.</p><ul class="cg-list">${rm.items.map(t => `<li>${esc(t)}</li>`).join('')}</ul>` : '<p class="cg-hint">아직 사람들 입에 오를 만한 일이 없습니다. 명성이 오르고 큰일을 해내면 소문이 돕니다.</p>'}</section>`;
}

function tabCal(st) {
    const base = E.formatDate(st.day);
    const monthStart = st.day - (base.d - 1);
    calOffset = Math.max(calOffset, -Math.floor(monthStart / 30));
    const firstDay = monthStart + calOffset * 30;
    const { y, m } = E.formatDate(firstDay);
    const cells = [];
    for (let d = 1; d <= 30; d++) {
        const day = firstDay + d - 1;
        const evs = E.eventsOn(day);
        const today = day === st.day;
        cells.push(`<div class="cg-day ${today ? 'today' : ''} ${day < st.day ? 'past' : ''} ${evs.length ? 'ev' : ''}" title="${esc(evs.map(e => e.name).join(', '))}"><i>${d}</i>${evs.slice(0, 2).map(e => `<span class="cg-evk-${e.kind}">${esc(e.name)}</span>`).join('')}</div>`);
    }
    const up = E.upcomingEvents(st.day, 60);
    const todayEv = E.eventsOn(st.day);
    return `<section class="cg-sec"><div class="cg-cal-head"><button class="cg-mini" data-cg="cal" data-d="-1">‹</button><h3>제국력 ${y}년 ${m}월 <small>${E.formatDate(firstDay).season}</small></h3><button class="cg-mini" data-cg="cal" data-d="1">›</button></div>
        <div class="cg-cal">${cells.join('')}</div>
        <small class="cg-hint">한 달은 30일입니다.</small></section>
    ${scheduleHtml(st)}
    <section class="cg-sec"><h3>이달의 정세 <small>달마다 바뀌고, 시세를 움직입니다</small></h3>${affairsHtml(st)}${seasonHtml(st)}
        ${E.merchantRank(st) >= 4 ? `<p class="cg-hint">상인 길드의 귀띔 — 다음 달: <b>${esc(E.affairsOf(st.day + 31 - E.formatDate(st.day).d).map(a => a.name).join(' · '))}</b></p>` : ''}
        ${E.marketOf(st.location) ? `<button class="cg-btn" data-cg="market">${esc(E.marketOf(st.location))} 시세 보기</button>` : '<small class="cg-hint">시장이 있는 도시·마을에서 시세를 볼 수 있습니다.</small>'}</section>
    ${todayEv.length ? `<section class="cg-sec"><h3>오늘</h3><ul class="cg-list">${todayEv.map(e => `<li><b>${esc(e.name)}</b><small>${esc(e.desc)}</small></li>`).join('')}</ul></section>` : ''}
    <section class="cg-sec"><h3>다가오는 행사</h3>${up.length ? `<ul class="cg-list">${up.slice(0, 8).map(u => { const f = E.formatDate(u.day); return `<li><b>${esc(u.ev.name)} <span class="cg-dday">D-${u.inDays}</span></b><small>${f.m}월 ${f.d}일 · ${esc(u.ev.desc)}</small></li>`; }).join('')}</ul>` : '<div class="cg-empty-s">두 달 안에는 없음</div>'}</section>`;
}

function familyHtml(st) {
    const f = st.family;
    if (!f) return '';
    const allow = f.head ? E.TITLE_INCOME[f.title] : Math.round((E.TITLE_ALLOW[f.title] || 0) * (f.heir ? 1 : 0.5));
    const h = E.houseOf(f.house);
    return `<section class="cg-sec"><h3>가문 <small>${f.own ? '직접 세운 가문' : '제국 귀족 명부의 가문'}</small></h3>
        <div class="cg-family">
            <header><b>${esc(f.house)}</b><em class="cg-shoptier">${esc(f.head ? '당주' : E.birthLabel(f, st.profile.gender))}</em>${f.heir ? '<em class="cg-heir">후계자</em>' : ''}${f.disowned ? '<em class="cg-heir bad">의절</em>' : ''}</header>
            <small>${esc(f.title)} · ${esc(f.region)} · ${esc(f.faction)}${h?.trait ? ` · ${esc(h.trait)}` : ''}${f.siblings ? ` · 형제: ${esc(f.siblings)}` : ''}</small>
            ${f.head ? '' : `<div class="cg-shoprow"><span>총애</span>${bar(f.favor ?? 50, 100, 'cg-exp')}<small>${f.favor ?? 50}</small></div>`}
            <ul class="cg-patron-ul">
                <li>${f.disowned ? '가문의 돈과 뒷배가 끊겼습니다' : f.head ? `달마다 영지 수입 ${esc(E.formatMoney(allow))}` : (f.favor ?? 50) >= 20 ? `달마다 집에서 생활비 ${esc(E.formatMoney(allow))}` : '총애가 바닥나 생활비가 끊겼습니다'}</li>
                <li>${f.head ? '가문의 당주 — 영지와 가신, 혼담과 파벌 정치를 책임집니다.' : f.heir ? '가문을 물려받을 사람입니다. 당주가 물러나거나 세상을 뜨면 승계합니다.' : '후계자가 아닙니다 — 후계 자리를 노리거나, 기사·마도사·거상·모험가로 제 이름을 세울 수 있습니다. 공을 세우면 따로 작위를 받아 분가를 열 수도 있어요.'}</li>
            </ul>
            <div class="cg-farm-mini">${f.head ? '' : f.disowned ? `<button class="cg-mini" data-cg="fam-return">가문으로 돌아가기</button>` : `${actBtn('본가에 인사', `(${f.house} 본가에 인사하러 간다)`)}${actBtn('당주와 면담', '(당주를 찾아가 이야기를 청한다)')}${f.heir ? '' : actBtn('후계 자리 노리기', '(후계 자리를 얻기 위해 움직이기 시작한다: )')}<button class="cg-mini cg-danger" data-cg="fam-disown">${disownAsk ? '정말 의절할까요? 한 번 더' : '가문과 의절하기'}</button>`}</div>
        </div></section>`;
}
let disownAsk = false;
function honorHtml(st) {
    const h = st.honor || { pts: 0 };
    const idx = E.HONORS.findIndex(x => x[1] === h.title);
    const next = E.HONORS[idx + 1];
    const steps = E.HONORS.map((x, i) => `<li class="${i <= idx ? 'past' : x[1] === h.pending ? 'now' : ''}"><b>${esc(x[1])}</b><small>공훈 ${x[0]}${x[3] ? ' · 세습' : ''}</small></li>`).join('');
    return `<section class="cg-sec"><h3>공훈과 작위 <small>공훈 ${h.pts || 0}${h.title ? ` · ${esc(h.title)}` : ''}</small></h3>
        <ol class="cg-honor">${steps}</ol>
        ${h.pending ? `<div class="cg-crowd up">서임 대상: <b>${esc(h.pending)}</b> <small>6월 10일 황제 탄신 축하연에서 서임됩니다</small></div>` : ''}
        ${next && !h.pending ? `<div class="cg-shoprow"><span>다음</span>${bar(h.pts || 0, next[0], 'cg-exp')}<small>${next[0]}</small></div>` : ''}
        ${(h.pending && E.HONORS.find(x => x[1] === h.pending)?.[3]) || (h.hereditary) ? `<div class="cg-menu-add"><input id="cg-house-name" placeholder="새 가문의 이름 (예: 그린우드)" value="${esc((h.houseName || '').replace(/ (남작|자작|백작)가$/, ''))}"><button class="cg-mini" data-cg="house-name">가문 이름 정하기</button></div>` : ''}
        ${E.isTitled(st) && E.warThisMonth(st.day) ? `<div class="cg-hreq"><span>소집령</span><b>이달 군역 소집</b><small>나서지 않으면 다음 달 초 면제금 ${esc(E.formatMoney(E.warDutyFee(st)))}</small>${st.warServed?.[E.ymOf(st.day)] ? '<em>참전함</em>' : `<button class="cg-mini cg-primary-mini" data-cg="war-serve">직접 나서기</button>`}</div>` : ''}
        <small class="cg-hint">길드·기사단·탑·교회에서 높은 등급에 오르거나(C급 이상), 나라를 구할 만한 공을 세우면 공훈이 쌓입니다. 일대 기사작 → 일대 남작 → 세습 남작(새 가문) → 자작 → 백작. 그 위는 황제의 특별한 뜻으로만.</small>
    </section>`;
}
const COAT_COLOR = { 밤색: '#8a5530', '짙은 밤색': '#5a3520', 흑마: '#1c1a1a', 백마: '#eeeae0', 잿빛: '#9a9a98', '얼룩 잿빛': 'repeating-linear-gradient(45deg,#9a9a98 0 3px,#d8d8d4 3px 6px)', 적갈색: '#9c4a2e', '금빛(팔로미노)': '#d9b468', 점박이: 'radial-gradient(circle at 30% 30%,#fff 0 2px,transparent 3px),radial-gradient(circle at 70% 65%,#fff 0 2px,transparent 3px),#6b4a30', '은빛 갈기의 밤색': 'linear-gradient(90deg,#8a5530 60%,#e8e6df 60%)' };
let horseRenameOpen = null;
const coatColor = (c) => COAT_COLOR[c] || '#777';
function stableHtml(st, f, fi) {
    const mk = E.marketOf(st.location), here = mk === f.market, reach = here || f.steward || !!f.kin;
    const horses = f.stable || [];
    const reqs = E.horseRequests(st).filter(r => horses.some(h => h.name === r.horse));
    const mares = horses.filter(h => h.sex === '암' && h.grade != null && E.horseAdult(h, st.day) && !h.preg);
    const stallions = horses.filter(h => h.sex === '수' && h.grade != null && E.horseAdult(h, st.day));
    const studs = reach ? E.studOffers(st, mk || f.market) : [];
    const list = horses.map(h => {
        const adult = E.horseAdult(h, st.day);
        const odds = h.grade == null ? E.horseOdds(h) : null;
        const oddsTxt = odds ? odds.map((p, i) => [p, i]).filter(([p]) => p >= 0.05).map(([p, i]) => `${E.HORSE_GRADES[i]} ${Math.round(p * 100)}%`).join(' · ') : '';
        return `<li class="cg-horse ${h.grade >= 4 ? 'top' : ''}">
            <div><b>${esc(h.name)} <em>${h.sex === '수' ? '♂' : '♀'}</em> ${h.grade != null ? `<span class="cg-hgrade g${h.grade}">${esc(E.HORSE_GRADES[h.grade])}</span>` : `<span class="cg-hgrade young">${esc(E.horseStage(h, st.day))}</span>`}</b>
            ${h.coat ? `<small class="cg-look"><i class="cg-coat" style="background:${coatColor(h.coat)}"></i>${esc(E.horseLookText(h))}</small>` : ''}
            <small>${esc(h.breed)} · ${Math.floor((st.day - h.born) / 360)}살${h.sire && h.sire !== '모름' ? ` · 아비 ${esc(h.sire)}, 어미 ${esc(h.dam)}` : ''} · 값 ${esc(E.formatMoney(E.horseValue(h, st.day)))}${h.preg ? ` · <span class="cg-good-text">새끼 뱀 — ${h.preg.due - st.day > 30 ? `${Math.ceil((h.preg.due - st.day) / 30)}달 뒤 출산` : '곧 출산'}</span>` : ''}</small>
            ${h.grade == null ? `<small class="cg-care">정성 ${Math.round(h.care || 0)} · 다 크면 — ${esc(oddsTxt)}</small>` : ''}${h.bond ? `<small class="cg-care">♥ 정 ${Math.round(h.bond)}</small>` : ''}</div>
            ${h.unnamed || horseRenameOpen === h.id ? `<span class="cg-hname"><input id="cg-hn-${esc(h.id)}" placeholder="${h.unnamed ? '태어난 망아지 — 이름을 지어 주세요' : '새 이름'}"><button class="cg-mini cg-primary-mini" data-cg="horse-rename" data-name="${esc(h.name)}" data-id="${esc(h.id)}">${h.unnamed ? '이름 짓기' : '바꾸기'}</button></span>` : ''}
            <span class="cg-mkt-ctl">${h.unnamed ? '' : `<button class="cg-mini" data-cg="horse-rename-open" data-id="${esc(h.id)}" title="이름 바꾸기">✎ 이름</button>`}${here ? `<button class="cg-mini" data-cg="horse-care" data-name="${esc(h.name)}" title="주인이 직접 — 5일이 흐릅니다">직접 5일 돌보기</button>` : ''}${adult && here ? `<button class="cg-mini" data-cg="horse-ride" data-name="${esc(h.name)}">타고 가기</button>` : ''}<button class="cg-mini" data-cg="horse-sell" data-name="${esc(h.name)}" ${reach ? '' : 'disabled'}>팔기</button></span>
        </li>`;
    }).join('');
    const hands = f.steward || f.kin || f.workers;
    return `<small class="cg-hint">혈통 있는 말 — 정성을 들일수록 좋은 말로 자랍니다${st.stableFame ? ` · 마구간 명성 ${st.stableFame}` : ''}</small>
        <div class="cg-menu-add cg-stablecare"><span class="cg-unit">맡겨 두기</span>
            <span class="cg-seg"><button class="${f.careMode !== '정성' ? 'on' : ''}" data-cg="stable-care" data-farm="${esc(f.name)}" data-mode="보통">보통</button><button class="${f.careMode === '정성' ? 'on' : ''}" data-cg="stable-care" data-farm="${esc(f.name)}" data-mode="정성" ${hands ? '' : 'disabled title="일꾼·관리인·가족이 있어야 합니다"'}>정성 · 마리당 2은/달</button></span>
            ${here && horses.length > 1 ? `<button class="cg-mini" data-cg="horse-care-all" title="모두 함께 — 5일이 흐르고, 한 마리씩보다 절반쯤 정성">다 같이 5일</button>` : ''}</div>
        <small class="cg-hint">맡겨 두면 날짜가 흐르지 않고 일손이 달마다 돌봅니다. 아끼는 말은 [직접 돌보기]로 — 날짜가 흐르는 대신 정성과 정이 가장 크게 쌓입니다.</small>
        <ul class="cg-craftlist cg-stable">${list || '<li class="none"><div><small>마구간이 비었습니다 — 말 시장에서 들이세요</small></div></li>'}</ul>
        ${reqs.length ? `<div class="cg-hreqs">${reqs.map(r => `<div class="cg-hreq ${r.done ? 'done' : ''}"><span>${r.kind === 'stud' ? '교배 신청' : '매입 제안'}</span><b>${esc(r.from)}</b><small>${esc(r.horse)} — ${r.kind === 'stud' ? `씨값 ${esc(E.formatMoney(r.fee))}` : `${esc(E.formatMoney(r.price))}에 사겠답니다`}</small>${r.done ? '<em>처리함</em>' : `<button class="cg-mini cg-primary-mini" data-cg="${r.kind === 'stud' ? 'horse-stud-ok' : 'horse-bid-ok'}" data-name="${esc(r.horse)}" data-from="${esc(r.from)}">${r.kind === 'stud' ? '받아들이기' : '넘기기'}</button>`}</div>`).join('')}</div>` : ''}
        ${mares.length && reach ? `<div class="cg-menu-add cg-breed"><select id="cg-mare-${fi}">${mares.map(h => `<option value="${esc(h.name)}">♀ ${esc(h.name)} (${esc(E.HORSE_GRADES[h.grade])})</option>`).join('')}</select><span class="cg-unit">×</span><select id="cg-sire-${fi}">${stallions.map(h => `<option value="mine|${esc(h.name)}">♂ ${esc(h.name)} (${esc(E.HORSE_GRADES[h.grade])}) — 내 말</option>`).join('')}${studs.map(s => `<option value="stud|${esc(s.name)}">♂ ${esc(s.name)} · ${esc(s.owner)} (${esc(E.HORSE_GRADES[s.grade])} · ${esc(s.breed)} · ${esc(s.coat)}) — 씨값 ${esc(E.formatMoney(s.fee))}</option>`).join('')}</select><button class="cg-btn" data-cg="horse-breed" data-fi="${fi}">교배</button></div>` : ''}`;
}
function horseMarketHtml(st) {
    const mk = E.marketOf(st.location);
    if (!mk) return '';
    const offers = E.horseMarket(st, mk);
    const farms = st.farms || [];
    return `<section class="cg-sec"><h3>말 시장 <small>${esc(mk)} · 이달 나온 말</small></h3>
        <ul class="cg-craftlist cg-stable">${offers.map(o => `<li class="cg-horse ${o.grade >= 4 ? 'top' : ''} ${o.bought ? 'none' : ''}"><div><b>${esc(o.name)} <em>${o.sex === '수' ? '♂' : '♀'}</em> <span class="cg-hgrade g${o.grade}">${esc(E.HORSE_GRADES[o.grade])}</span></b><small class="cg-look"><i class="cg-coat" style="background:${coatColor(o.coat)}"></i>${esc(E.horseLookText(o))}</small><small>${esc(o.breed)} · ${o.age}살 · ${esc(o.seller)}</small></div>
            <span class="cg-mkt-ctl"><b class="cg-price">${esc(E.formatMoney(o.price))}</b><button class="cg-mini" data-cg="horse-buy" data-name="${esc(o.name)}" ${!o.bought && st.money >= o.price ? '' : 'disabled'}>${o.bought ? '팔림' : '사기'}</button></span></li>`).join('')}</ul>
        ${farms.length ? `<div class="cg-menu-add"><span class="cg-unit">들일 곳</span><select id="cg-hb-farm">${farms.map(f => `<option value="${esc(f.name)}">${esc(f.name)} 마구간</option>`).join('')}</select></div>` : '<small class="cg-hint">농장(마구간)이 없으면 산 말을 직접 데리고 다닙니다.</small>'}
        <small class="cg-hint">명마는 대개 귀족가의 마구간에서 나옵니다. 혈통: ${E.HORSE_BREEDS.map(b => `${esc(b[0])}(${esc(b[3])})`).join(' · ')}</small></section>`;
}
function tabOrgs(st) {
    const joined = Object.entries(st.orgs);
    const cards = joined.map(([id, m]) => {
        const o = E.ORGS[id];
        const next = m.rank + 1;
        const max = next >= o.ranks.length;
        const need = max ? 0 : E.meritNeed(st, next);
        const prevNeed = E.meritNeed(st, m.rank);
        const ready = !max && m.merit >= need;
        return `<div class="cg-org ${ready ? 'ready' : ''}">
            <div class="cg-org-head"><b>${esc(o.name)}</b><span>${esc(o.ranks[m.rank])}</span></div>
            ${(() => { const sk = E.strikesOf(st, id); return sk.length ? `<div class="cg-strikes ${E.isSuspended(st, id) ? 'bad' : ''}"><span>${'●'.repeat(sk.length)}${'○'.repeat(Math.max(0, 5 - sk.length))}</span><small>경고 ${sk.length}회${E.isSuspended(st, id) ? (id === 'merchant' ? ' · 영업 정지 중' : ' · 자격 정지 중') : ''} — ${esc(sk.map(x => x.why).join(', '))}</small></div>` : ''; })()}
            ${id === 'merchant' ? merchantPerksHtml(st, m) : ''}
            <ol class="cg-ladder">${o.ranks.map((r, i) => `<li class="${i < m.rank ? 'past' : i === m.rank ? 'now' : ''}" title="${esc(r)}"></li>`).join('')}</ol>
            ${max ? '<div class="cg-org-note">최고 지위에 올랐습니다.</div>' : `
            <div class="cg-lvrow"><small>공적</small>${bar(m.merit - prevNeed, need - prevNeed, 'cg-merit')}<small>${m.merit} / ${need}</small></div>
            <div class="cg-org-note">${ready ? `★ ${esc(o.ranks[next])} 승급 자격 — 시험·심사 기회를 기다리세요.` : `다음: ${esc(o.ranks[next])}`}</div>`}
        </div>`;
    }).join('');
    const others = Object.entries(E.ORGS).filter(([id]) => !st.orgs[id]);
    return `
    ${familyHtml(st)}${honorHtml(st)}
    <section class="cg-sec"><h3>신분 <small>${esc(E.statusLabel(st))}</small></h3>
        <ol class="cg-noble">${E.NOBLE.map((n, i) => `<li class="${i < st.noble ? 'past' : i === st.noble ? 'now' : ''}">${esc(n)}</li>`).join('')}</ol>
        ${st.family && !st.family.head ? `<small class="cg-hint">${esc(st.family.house)}의 자제로서 받는 예우입니다. 작위 자체는 당주의 것이고, 물려받거나 공을 세워 따로 받아야 내 작위가 됩니다.</small>` : ''}<small class="cg-hint">신분은 큰 공훈·명성·귀족의 후원이 있을 때 황제의 서임 같은 사건으로만 오릅니다. 황족은 황태자·황녀와의 혼인으로만 될 수 있습니다.</small>
    </section>
    <section class="cg-sec"><h3>소속</h3>${cards || '<div class="cg-empty-s">소속 없음</div>'}</section>
    ${st.orgs.adventurer ? `<section class="cg-sec cg-rules"><h3>모험가 길드 규약 · 불문율 <small>규약은 경고 · 불문율은 평판</small></h3>
        <ul>${E.GUILD_RULES.map(([k, t]) => `<li class="${k === '규약' ? 'law' : 'lore'}"><em>${esc(k)}</em>${esc(t)}</li>`).join('')}</ul></section>` : ''}
    ${st.patron ? `<section class="cg-sec"><h3>후원 가문</h3>${patronHtml(st)}</section>` : ''}
    ${st.orgs.merchant ? `<section class="cg-sec cg-rules"><h3>상인 길드 규약 · 불문율 <small>수수료 대신 회비, 신용이 전부</small></h3>
        <ul>${E.MERCHANT_RULES.map(([k, t]) => `<li class="${k === '규약' ? 'law' : 'lore'}"><em>${esc(k)}</em>${esc(t)}</li>`).join('')}</ul></section>` : ''}
    ${others.length ? `<section class="cg-sec"><h3>다른 길</h3><ul class="cg-list cg-dim">${others.map(([, o]) => `<li><b>${esc(o.name)}</b><small>${esc(o.ranks[0])} → … → ${esc(o.ranks[o.ranks.length - 1])}</small></li>`).join('')}</ul><small class="cg-hint">이야기 속에서 가입하면 겸업할 수 있습니다.</small></section>` : ''}`;
}

function zonesHtml(D, d) {
    const top = Math.max(d.best, d.cur);
    return `<ol class="cg-zones">${D.zones.map(([a, b, nm, desc, mobs, boss]) => {
        const to = b || Math.max(a + 2, top);
        const here = d.cur >= a && (!b || d.cur <= b), reached = top >= a, unknown = !b && !reached;
        const cells = [];
        for (let f = a; f <= to; f++) cells.push(`<i class="${f === d.cur ? 'cur' : f <= top ? 'done' : ''}${f % 10 === 0 ? ' g' : ''}${f % 10 === 0 && d.guard?.includes(f) ? ' gk' : ''}" title="${f}층${f % 10 === 0 ? ' · 수호자' : ''}">${f === d.cur ? '▼' : f % 10 === 0 ? '◆' : ''}</i>`);
        return `<li class="${here ? 'is-here' : reached ? 'is-reached' : 'is-far'}${unknown ? ' is-unknown' : ''}">
            <div class="cg-zone-h"><span>${b ? `${a}–${b}층` : `${a}층~`}</span><b>${unknown ? '???' : esc(nm)}</b>${here ? `<em>지금 ${d.cur}층</em>` : ''}</div>
            ${reached || here || !unknown ? `<small>${esc(unknown ? '아직 아무도 닿지 못했다.' : desc)}${!unknown && (reached || here) ? ` · ${esc(mobs)}` : ''}${boss && (reached || here) ? ` · 수호자: ${esc(boss)}` : ''}</small>` : ''}
            ${unknown ? '' : `<div class="cg-zone-f">${cells.join('')}</div>`}</li>`;
    }).join('')}</ol>`;
}
function dungeonHtml(st) {
    const rows = Object.entries(E.DUNGEONS).map(([dn, D]) => {
        const d = st.dungeons?.[dn] || { cur: 0, best: 0, guard: [] };
        const max = Math.max(50, d.best + 5);
        const bands = D.bands.map(([f, nm], i) => { const to = (D.bands[i + 1]?.[0] ?? max + 1) - 1; return `<i class="b${i}" style="left:${(f - 1) / max * 100}%;width:${(Math.min(to, max) - f + 1) / max * 100}%" title="${esc(nm)}">${esc(nm)}</i>`; }).join('');
        const marks = [10, 20, 30, 40, 50].filter(x => x <= max).map(x => `<b class="${d.guard?.includes(x) ? 'done' : ''}" style="left:${(x - 0.5) / max * 100}%" title="${x}층 수호자"></b>`).join('');
        const b = E.dungeonBand(dn, d.cur || 1);
        const starts = [...(d.guard || [])].sort((a, c) => a - c);
        return `<div class="cg-dungeon">
            <header><b>${esc(dn)}</b><small>${d.cur ? `지금 ${d.cur}층 · ${esc(D.zones ? E.dungeonZone(dn, d.cur)[2] : `${b[1]} — ${b[2]}`)}` : '지상'} · 내 최고 ${d.best}층 · 제국 최고 ${D.record}층</small></header>
            ${D.zones ? zonesHtml(D, d) : `<div class="cg-dbar">${bands}${marks}${d.best ? `<em class="best" style="left:${(d.best - 0.5) / max * 100}%">최고</em>` : ''}${d.cur ? `<em class="cur" style="left:${(d.cur - 0.5) / max * 100}%">▼</em>` : ''}</div>`}
            <div class="cg-farm-mini">${d.cur ? `${actBtn('한 층 더 내려가기', `(${D.short} ${d.cur + 1}층으로 내려간다)`)}${actBtn('이 층 탐색', `(${D.short} ${d.cur}층을 샅샅이 탐색한다)`)}${actBtn('지상으로', `(${D.short}에서 지상으로 돌아간다)`)}` : `${actBtn('미궁으로 들어가기', `(${dn}에 들어간다)`)}${starts.map(f => actBtn(`전이진 ${f}층부터`, `(${D.short} ${f}층 전이진으로 내려간다)`)).join('')}`}</div>
        </div>`;
    }).join('');
    return `<section class="cg-sec"><h3>던전</h3>${rows}<small class="cg-hint">10층마다 수호자가 있고, 쓰러뜨리면 그 층의 전이진이 열려 다음부터 거기서 시작할 수 있습니다.</small></section>`;
}
let codexOpen = null;
function gearCtlHtml(st, eq) {
    const gs = eq.map(k => [k, E.gearOf(st, k)]).filter(([, g]) => g);
    if (!gs.length) return '';
    const sm = E.smithHere(st);
    return `<div class="cg-gearctl"><h5>대장간 <small>${sm.canEnhance ? (sm.city ? '도시의 대장간' : '내 대장간') : sm.canRepair ? '수리만 가능' : '이곳에선 맡길 데가 없습니다 (도시로)'}</small></h5>
        ${gs.map(([k, g]) => { const rc = E.repairCost(st, g), ec = E.enhanceCost(g.plus), rate = E.ENHANCE_RATE[g.plus]; return `<div class="cg-gearrow"><span>${esc(E.SLOT_LABEL[k])}</span><b>${esc(E.gearLabel(g))}</b>
            <button class="cg-mini" data-cg="gear-fix" data-slot="${esc(E.SLOT_LABEL[k])}" ${sm.canRepair && g.dur < g.max && st.money >= rc ? '' : 'disabled'}>수리${g.dur < g.max ? ` ${rc ? esc(E.formatMoney(rc)) : '(직접)'}` : ''}</button>
            ${g.plus < 10 ? `<button class="cg-mini" data-cg="gear-up" data-slot="${esc(E.SLOT_LABEL[k])}" ${sm.canEnhance && g.dur > 0 && st.money >= ec ? '' : 'disabled'} title="실패하면 ${g.plus >= 4 ? '한 단계 내려가고 내구 -30' : '그대로'}">+${g.plus + 1} 강화 · ${Math.round(rate * 100)}% · ${esc(E.formatMoney(ec))}</button>` : '<em class="cg-plus">최고 강화</em>'}</div>`; }).join('')}
        <small class="cg-hint">+4부터는 실패하면 한 단계 내려가고 내구가 깎입니다. 대장일 D 이상이면 직접 수리(공짜), 내 대장간에 대장일 C 이상이면 직접 강화.</small></div>`;
}
function codexHtml(st) {
    const cx = st.codex || {};
    const known = Object.keys(cx).length;
    const list = [...E.BESTIARY.map(m => m[0]), ...Object.keys(cx).filter(n => !E.findMonster(n))];
    return `<section class="cg-sec"><h3>마물 도감 <small>${known} / ${E.BESTIARY.length}종</small></h3>
        <ul class="cg-codex">${list.map(n => {
            const M = E.findMonster(n), c = cx[n], lv = c ? E.codexLevel(c.kills) : 0;
            if (!c) return `<li class="unk"><span class="cg-mgrade">${M ? esc(M[1]) : '?'}</span><b>???</b></li>`;
            const open = codexOpen === n;
            return `<li class="${open ? 'open' : ''} lv${lv}" data-cg="codex" data-name="${esc(n)}"><span class="cg-mgrade">${M ? esc(M[1]) : '?'}</span><b>${esc(n)}</b><em>${c.kills}마리</em>${lv >= 4 ? '<i>숙달</i>' : ''}
                ${open ? `<div class="cg-codex-d">${M ? `<p>${esc(M[5])}</p><small>사는 곳 — ${esc(M[2])}</small><small>약점 — ${lv >= 2 ? esc(M[3]) : `??? (${5 - c.kills}마리 더)`}</small><small>소재 — ${lv >= 3 ? esc(M[4]) : `??? (${Math.max(0, 15 - c.kills)}마리 더)`}</small>` : '<small>기록에 없는 마물</small>'}${lv < 4 ? `<small>숙달까지 ${40 - c.kills}마리 — 숙달하면 '${esc(n)} 사냥꾼' 칭호</small>` : ''}</div>` : ''}</li>`;
        }).join('')}</ul></section>`;
}
function tabQuests(st) {
    return `
    <section class="cg-sec"><h3>진행 중 <small>${st.quests.length} / ${E.maxQuests(st)}</small></h3>
        ${st.quests.length ? `<ul class="cg-quests">${st.quests.map(q => {
        const left = q.due !== undefined ? q.due - st.day : null;
        return `<li>${q.rank ? `<span class="cg-qrank">${esc(q.rank)}</span>` : ''}<b>${esc(q.name)}</b>${q.reward ? `<small>보수 ${esc(q.reward)}</small>` : ''}
            ${q.place || q.desc ? `<div class="cg-qdesc">${esc([q.place, q.desc].filter(Boolean).join(' — '))}</div>` : ''}
            ${left !== null ? `<div class="cg-qdue ${left < 0 ? 'over' : left <= 1 ? 'soon' : ''}">${left < 0 ? `기한 ${-left}일 초과` : `기한까지 ${left}일`}</div>` : ''}</li>`;
    }).join('')}</ul>` : '<div class="cg-empty-s">진행 중인 의뢰가 없습니다.</div>'}
        <button class="cg-btn cg-mt" data-cg="board">의뢰판 보기</button>
    </section>
    ${dungeonHtml(st)}
    ${codexHtml(st)}
    <section class="cg-sec"><h3>최근 기록 <small>총 ${st.questsDone}건 완료</small></h3>
        ${st.questLog.length ? `<ul class="cg-quests cg-done">${st.questLog.map(q => `<li><span class="cg-qres ${q.result === '완료' ? 'ok' : 'bad'}">${q.result}</span><b>${esc(q.name)}</b><small>${E.formatDate(q.day).m}월 ${E.formatDate(q.day).d}일</small></li>`).join('')}</ul>` : '<div class="cg-empty-s">아직 없음</div>'}
    </section>`;
}

function familyLifeHtml(st) {
    const kids = st.children || [];
    const canBaby = st.spouse && !st.expecting;
    if (!kids.length && !st.expecting && !(st.generations || []).length && !st.spouse && !E.matchOffers(st).length) return '';
    const places = [...(st.farms || []).map(f => f.name), ...(st.shops || []).map(s => s.name)];
    const rows = kids.map(c => {
        const age = E.childAge(c, st.day), adult = E.childAdult(c, st.day);
        return `<li class="cg-kid ${c.heir ? 'heir' : ''}">
            <div class="cg-kid-top"><b>${c.unnamed ? '<i>이름 없는 아기</i>' : esc(c.name)}</b><em>${c.sex === '남' ? '아들' : '딸'} · ${age}살 ${esc(E.childStage(c, st.day))}</em>${c.heir ? '<span class="cg-heir">후계자</span>' : ''}</div>
            <small>${c.other ? `${esc(c.other)}와의 아이 · ` : ''}${E.formatDate(c.born).y}년 ${E.formatDate(c.born).m}월생${c.role ? ` · ${esc(E.josa(c.role, '을', '를'))} 맡고 있음` : ''}${c.spouse ? ` · <b class="cg-good-text">${esc(c.spouse.name)}(${esc(c.spouse.from)})와 혼인</b>` : ''}</small>
            ${c.unnamed ? `<div class="cg-menu-add"><input id="cg-kn-${esc(c.id)}" placeholder="아이의 이름을 지어 주세요"><button class="cg-mini cg-primary-mini" data-cg="kid-name" data-id="${esc(c.id)}" data-name="${esc(c.name)}">이름 짓기</button></div>` : `<div class="cg-farm-mini">
                ${c.heir ? '' : `<button class="cg-mini" data-cg="kid-heir" data-name="${esc(c.name)}">후계자로</button>`}
                ${age >= 13 && places.length ? `<select id="cg-kr-${esc(c.id)}"><option value="없음">가업을 맡기지 않음</option>${places.map(p => `<option ${c.role === p ? 'selected' : ''}>${esc(p)}</option>`).join('')}</select><button class="cg-mini" data-cg="kid-role" data-id="${esc(c.id)}" data-name="${esc(c.name)}">맡기기</button>` : ''}
                ${adult ? `<button class="cg-mini cg-danger" data-cg="kid-pass" data-name="${esc(c.name)}">${passAsk === c.name ? '정말 대를 물려줄까요? 한 번 더' : '대를 물려주기'}</button>` : ''}
            </div>`}
        </li>`;
    }).join('');
    return `<section class="cg-sec"><h3>가족 <small>${kids.length ? `자녀 ${kids.length}` : ''}${st.expecting ? ` · 아이를 기다리는 중 (${E.formatDate(st.expecting.due).m}월 무렵)` : ''}</small></h3>
        ${st.spouse && places.length ? `<div class="cg-menu-add"><span class="cg-unit">${esc(st.spouse.name)}에게</span><select id="cg-sp-role"><option value="없음">가업을 맡기지 않음</option>${places.map(p => `<option ${st.spouse.role === p ? 'selected' : ''}>${esc(p)}</option>`).join('')}</select><button class="cg-mini" data-cg="spouse-role" data-name="${esc(st.spouse.name)}">맡기기</button></div>` : ''}
        ${matchHtml(st)}
        ${kids.length ? `<ul class="cg-kids">${rows}</ul>` : ''}
        ${(st.generations || []).length ? `<div class="cg-gen"><small>앞선 세대</small>${st.generations.map(g => `<span>${esc(g.name)} <i>${esc(g.title)}</i></span>`).join('<b>→</b>')}<span class="now">${esc(st.profile.name)}</span></div>` : ''}
        <div class="cg-farm-mini">${canBaby ? `<button class="cg-mini cg-primary-mini" data-cg="baby-news">${esc(st.spouse.name)}와의 아이 소식</button>` : ''}<button class="cg-mini" data-cg="adopt-open">${adoptOpen ? '접기' : '아이 들이기'}</button></div>
        ${adoptOpen ? `<div class="cg-menu-add cg-adopt"><input id="cg-ad-name" placeholder="이름"><select id="cg-ad-sex"><option value="여">딸</option><option value="남">아들</option></select><input type="number" id="cg-ad-age" class="cg-num-in" min="0" max="30" value="5"><span class="cg-unit">살</span><button class="cg-mini cg-primary-mini" data-cg="adopt">들이기</button></div>` : ''}
        <small class="cg-hint">열세 살부터 가업을 거들고(농장은 관리인 노릇, 가게는 일손 하나), 열여섯에 어른이 되면 대를 물려줄 수 있습니다. 대를 물려주면 주인공이 그 아이로 바뀌고 땅·가게·재산·가문·세습 작위가 이어집니다(몸과 경력 — 클래스·기술·소속 — 은 처음부터).</small></section>`;
}
let passAsk = null, adoptOpen = false, noteEdit = null;
function matchHtml(st) {
    const mo = E.matchOffers(st);
    const sc = E.familyStanding(st);
    if (!mo.length) return '';
    return `<div class="cg-match"><h5>이달 들어온 혼담 <small>우리 집안의 격: ${esc(E.MATCH_TIERS[E.matchTier(sc)][1])} 급 (${sc})</small></h5>${mo.map(o => `<div class="cg-hreq ${o.done ? 'done' : ''}"><span>${o.forName === '본인' ? '나에게' : `${esc(o.forName)}에게`}</span><b>${esc(o.person)} · ${o.age}살</b><small>${esc(o.family)} — ${esc(o.desc)}</small>${o.done ? `<em>${o.done === 'ok' ? '받아들임' : '거절함'}</em>` : `<span class="cg-match-btns"><button class="cg-mini cg-primary-mini" data-cg="match-ok" data-for="${esc(o.forName)}" data-who="${esc(o.person)}">받아들이기</button><button class="cg-mini" data-cg="match-no" data-for="${esc(o.forName)}" data-who="${esc(o.person)}">거절</button></span>`}</div>`).join('')}</div>`;
}
let staffEdit = null;
function staffListHtml(st, where) {
    const ps = E.namedStaff(st).filter(p => p.where === where);
    if (!ps.length) return '';
    const open = ps.find(p => p.id === staffEdit);
    return `<div class="cg-staff">${ps.map(p => `<span title="${esc(p.trait)} — 눌러서 이름 바꾸기" data-cg="staff-edit" data-id="${esc(p.id)}"><em>${esc(p.role)}</em>${esc(p.name)}<small>${esc(p.trait)}</small></span>`).join('')}</div>
        ${open ? `<div class="cg-menu-add"><span class="cg-unit">${esc(open.role)}</span><input id="cg-staff-name" placeholder="${esc(open.name)}의 새 이름"><button class="cg-mini cg-primary-mini" data-cg="staff-rename" data-where="${esc(open.where)}" data-role="${esc(open.role)}">바꾸기</button></div><small class="cg-hint">${esc(open.name)} — ${esc(open.trait)}</small>` : ''}`;
}
function scheduleHtml(st) {
    const sc = E.mySchedule(st, 120);
    const ev = E.monthEvents(st);
    const kindIcon = { farm: '🌾', horse: '🐎', order: '📜', family: '👶', honor: '👑', money: '💰' };
    return `<section class="cg-sec"><h3>내 일정 <small>넉 달 안</small></h3>
        ${ev.length ? `<div class="cg-mev">${ev.map(e => `<div><b>이달의 사건 · ${esc(e.name)}</b><small>${esc(e.desc)}</small></div>`).join('')}</div>` : ''}
        ${sc.length ? `<ul class="cg-list cg-sched">${sc.slice(0, 12).map(x => { const f = E.formatDate(x.day); return `<li><b>${kindIcon[x.kind] || '·'} ${esc(x.text)} <span class="cg-dday">${x.day === st.day ? '오늘' : `D-${x.day - st.day}`}</span></b><small>${f.m}월 ${f.d}일</small></li>`; }).join('')}</ul>` : '<div class="cg-empty-s">다가오는 내 일정이 없습니다</div>'}</section>`;
}
function tabRel(st) {
    const names = [...new Set([...Object.keys(st.rel), ...Object.keys(st.bonds || {}), ...st.party.map(m => m.name)])];
    const score = (n) => (st.bonds?.[n] ? 1000 + E.ROMANCE.indexOf(st.bonds[n].stage) * 100 : 0) + (st.rel[n] || 0);
    names.sort((a, b) => score(b) - score(a));
    const RN = E.ROMANCE_NEED[st.difficulty] || E.ROMANCE_NEED.normal;
    const spouse = st.spouse ? `<section class="cg-spouse">${settings().portraits && portraitOf(st.spouse.name) ? photoHtml(st.spouse.name, st.spouse.name, 'cg-photo-spouse') : '<span class="cg-ring">♡</span>'}<div><small>배우자</small><b>${esc(st.spouse.name)}</b>${st.spouse.title ? `<em>${esc(st.spouse.title)}</em>` : ''}</div>${st.spouse.since !== undefined ? `<small class="cg-since">${E.formatDate(st.spouse.since).y}년 ${E.formatDate(st.spouse.since).m}월 ${E.formatDate(st.spouse.since).d}일 혼인</small>` : ''}</section>` : '';
    const rows = names.map(n => {
        const v = st.rel[n] || 0;
        const bond = st.bonds?.[n];
        const inParty = st.party.some(m => m.name === n);
        const nx = E.nextRomance(st, n);
        const hint = bond?.stage === '배우자' ? '' : nx ? (nx.blockedBySpouse ? '배우자가 있어 더 나아갈 수 없음' : nx.ok ? `<span class="cg-ok">${nx.next} 가능 — 계기가 될 장면이 필요</span>` : `${nx.next}까지 호감 ${nx.need}`) : '';
        const ph = settings().portraits && (portraitOf(n) || phMenu === n);
        return `<li class="${bond ? 'cg-romance' : ''}${ph ? ' has-photo' : ''}">${ph ? photoHtml(n, n, 'cg-photo-rel') : ''}
            <div class="cg-rel-top"><b>${esc(n)}</b>${inParty ? '<span class="cg-tagmini">동료</span>' : ''}<span class="cg-stage">${E.friendStage(v)}</span>${bond ? `<span class="cg-stage cg-stage-love">${esc(bond.stage)}</span>` : ''}</div>
            <div class="cg-rel-bar"><span class="cg-relbar"><i style="left:${v < 0 ? 50 + v / 2 : 50}%;width:${Math.abs(v) / 2}%" class="${v < 0 ? 'neg' : ''}"></i></span><small>${v > 0 ? '+' : ''}${v}</small></div>
            ${hint && (v > 0 || bond) ? `<div class="cg-rel-hint">${hint}</div>` : ''}
            ${st.notes?.[n] ? `<div class="cg-note"><span>노트</span>${esc(st.notes[n].t)}</div>` : ''}
            ${noteEdit === n ? `<div class="cg-menu-add"><input id="cg-note-in" value="${esc(st.notes?.[n]?.t || '')}" placeholder="신분·사는 곳·있었던 일"><button class="cg-mini cg-primary-mini" data-cg="note-save" data-name="${esc(n)}">저장</button></div>` : ''}
            <div class="cg-rel-acts">${personActs(st, n)}<button class="cg-act" data-cg="note-edit" data-name="${esc(n)}">${st.notes?.[n] ? '노트 고치기' : '노트 쓰기'}</button>${settings().portraits && !portraitOf(n) ? `<button class="cg-act" data-cg="ph-menu" data-who="${esc(n)}">초상 넣기</button>` : ''}</div>
            ${phMenuHtml(n)}
        </li>`;
    }).join('');
    const extra = Object.keys(st.notes || {}).filter(n => !names.includes(n));
    const noteSec = `<section class="cg-sec"><h3>인물 노트 <small>GM이 이 사람들을 기억합니다</small></h3>
        ${extra.length ? `<ul class="cg-list">${extra.map(n => `<li><b>${esc(n)}</b><small>${esc(st.notes[n].t)}</small></li>`).join('')}</ul>` : ''}
        <div class="cg-menu-add"><input id="cg-nn-name" placeholder="이름" style="max-width:7em"><input id="cg-nn-text" placeholder="신분·사는 곳·있었던 일"><button class="cg-mini cg-primary-mini" data-cg="note-new">적기</button></div></section>`;
    return `${spouse}${familyLifeHtml(st)}${noteSec}<section class="cg-sec"><h3>인맥 <small>${names.length}명</small></h3>${names.length ? `<ul class="cg-rel">${rows}</ul>` : '<div class="cg-empty-s">아직 아는 사람이 없습니다.</div>'}</section>
    <section class="cg-sec"><h3>관계의 단계</h3>
        <p class="cg-hint">우정은 호감에 따라 저절로 변합니다: 낯선 사이 → 안면(10) → 친구(30) → 절친(60).<br>
        연애는 호감만으로 오르지 않습니다. 조건을 채운 뒤 고백·데이트·청혼 같은 장면에서 상대가 받아들여야 합니다: 설렘(${RN.설렘}) → 연인(${RN.연인}) → 약혼(${RN.약혼}) → 혼인.<br>
        동료든 길에서 만난 NPC든 누구와도 맺을 수 있고, 배우자는 한 명입니다. 귀족과 혼인하면 그 가문의 신분을 따르고, 황족은 황태자·황녀와의 혼인으로만 될 수 있습니다.</p>
    </section>`;
}

/* ───── 인물 도감: 이름 있는 사람들의 얼굴·외모·지금 자리 ───── */
let dexGroup = '';
function tabDex(st) {
    const known = new Set([...Object.keys(st.rel || {}), ...Object.keys(st.notes || {}), ...Object.keys(st.bonds || {}), ...(st.party || []).map(m => m.name), st.spouse?.name].filter(Boolean).map(n => E.npcInfo(n)?.n).filter(Boolean));
    const groups = E.NPC_GROUPS.filter(g => E.NPC_DIR.some(d => d.g === g));
    const shown = dexGroup ? [dexGroup] : groups;
    const card = (d0) => {
        const d = E.npcNow(st, d0.n) || d0;
        const key = Object.keys(E.NPC_SCHEDULES).find(k => k === d.n || d.aka.includes(k));
        const w = key ? E.npcWhere(st, key) : null;
        return `<li class="cg-dex-card${known.has(d.n) ? ' is-met' : ''}">
            ${photoHtml(d.n, d.n, 'cg-photo-dex') || ''}
            <div class="cg-dex-info">
                <div class="cg-dex-top"><b>${esc(d.n)}</b>${known.has(d.n) ? '<span class="cg-tagmini">아는 사이</span>' : ''}</div>
                <div class="cg-dex-role">${esc(d.role)}</div>
                <div class="cg-dex-who">${esc(d.who)}</div>
                ${d.note && known.has(d.n) ? `<div class="cg-dex-news">근황 · ${esc(d.note)}</div>` : ''}
                <p class="cg-dex-look">${esc(d.look)}</p>
                ${w ? `<div class="cg-dex-where">지금 ${esc(todOfName(st))} · ${esc(String(w.loc).replace('제도 루미에른 · ', ''))} ${esc(w.spot)}${w.rest ? ' (쉬는 날)' : ''}</div>` : ''}
            </div>
            ${phMenuHtml(d.n)}
        </li>`;
    };
    return `<section class="cg-sec"><h3>인물 도감 <small>${E.NPC_DIR.length}명 · 아는 사이 ${known.size}명</small></h3>
        <p class="cg-hint">이 세계의 이름 있는 사람들이에요. GM은 여기 적힌 외모대로 그립니다. 초상을 누르면 크게 보거나 이 채팅에서만 바꿀 수 있어요.</p>
        <div class="cg-dex-chips"><button class="cg-lchip ${!dexGroup ? 'on' : ''}" data-cg="dex-group" data-val="">전체</button>${groups.map(g => `<button class="cg-lchip ${dexGroup === g ? 'on' : ''}" data-cg="dex-group" data-val="${esc(g)}">${esc(g)}</button>`).join('')}</div>
    </section>
    ${shown.map(g => `<section class="cg-sec"><h3>${esc(g)}</h3><ul class="cg-dex">${E.NPC_DIR.filter(d => d.g === g).map(card).join('')}</ul></section>`).join('')}`;
}
const todOfName = (st) => E.todOf(st);

function chronHtml(st) {
    const c = [...(st.chronicle || [])].reverse();
    const byYear = {};
    for (const x of c) (byYear[E.formatDate(x.day).y] = byYear[E.formatDate(x.day).y] || []).push(x);
    return `<section class="cg-sec"><h3>연대기 <small>큰 일은 저절로 남습니다 · ${c.length}줄</small></h3>
        <div class="cg-menu-add"><input id="cg-chron-in" placeholder="직접 남기기 — 예: 흑림에서 처음으로 마물을 물리쳤다"><button class="cg-mini cg-primary-mini" data-cg="chron-add">남기기</button></div>
        <div class="cg-farm-mini"><button class="cg-btn" data-cg="chron-book" ${c.length ? '' : 'disabled'}>연대기 책으로 내보내기</button></div>
        ${c.length ? Object.entries(byYear).sort((a, b) => b[0] - a[0]).map(([y, xs]) => `<div class="cg-chron"><em>제국력 ${y}년</em><ul>${xs.map(x => `<li class="${x.m ? 'mine' : ''}"><span>${E.formatDate(x.day).m}월</span>${esc(x.t)}</li>`).join('')}</ul></div>`).join('') : '<div class="cg-empty-s">아직 남은 기록이 없습니다</div>'}
        ${(st.generations || []).length ? `<small class="cg-hint">앞선 세대: ${esc(st.generations.map(g => g.name).join(' → '))}</small>` : ''}</section>`;
}
function tabLog(st) {
    const entries = [...cur.logs.entries()].sort((a, b) => b[0] - a[0]).slice(0, 40);
    return `${chronHtml(st)}<section class="cg-sec"><h3>변동 기록 <small>최근 메시지 순</small></h3>${entries.length ? entries.map(([i, l]) => `
        <div class="cg-logrow"><span class="cg-logid">#${i}</span><div class="cg-chips">${l.map(x => `<span class="cg-chip cg-chip-${x.k}${x.t.startsWith('→') ? ' cg-chip-move' : ''}${x.manual ? ' cg-chip-manual' : ''}">${esc(x.t)}</span>`).join('')}</div></div>`).join('') : '<div class="cg-empty-s">아직 변동이 없습니다.</div>'}</section>`;
}

function tabEdit(st) {
    return `${saveHtml(st)}
    <section class="cg-sec"><h3>세월 <small>지금 ${E.ageOf(st)}살 · ${esc(E.ageStage(E.ageOf(st)))}</small></h3>
        <div class="cg-farm-mini"><button class="cg-mini ${st.aging ? 'cg-primary-mini' : ''}" data-cg="aging" data-val="켬">해마다 나이를 먹는다</button><button class="cg-mini ${st.aging ? '' : 'cg-primary-mini'}" data-cg="aging" data-val="끔">나이를 멈춘다</button></div>
        <small class="cg-hint">나이를 먹으면 생일마다 한 살씩 들고, 쉰·예순·일흔에는 몸이 조금씩 약해지는 대신 정신이 깊어집니다.</small></section>
    <section class="cg-sec"><h3>수동 조정</h3>
        <p class="cg-hint">GM이 빠뜨렸거나 잘못 적은 변동을 직접 고칩니다. 한 줄에 하나씩, GM의 &lt;변동&gt; 형식 그대로 적으세요. 마지막 메시지에 기록되므로 그 메시지를 지우면 함께 취소됩니다.</p>
        <textarea id="cg-manual" rows="7" placeholder="돈 +3은&#10;아이템 +하급 회복약 2&#10;공적 모험가길드 +20&#10;HP 최대&#10;호감 미렐 +5&#10;승급 모험가길드 E등급"></textarea>
        <button class="cg-btn cg-btn-primary" data-cg="manual-apply">적용</button>
    </section>
    <section class="cg-sec"><h3>형식 요약</h3>
        <ul class="cg-cheat">
            <li><code>돈 +2은 50동</code> <code>돈 =3금</code></li>
            <li><code>경험 +40</code> <code>HP -12</code> <code>MP 최대</code></li>
            <li><code>아이템 +이름 수량</code> <code>아이템 -이름</code></li>
            <li><code>공적 모험가길드 +25</code> <code>승급 상인길드</code> <code>가입 청람의탑</code></li>
            <li><code>명성 +5</code> <code>신분 기사작</code> <code>호감 이름 +3</code></li>
            <li><code>스킬 +이름 | 설명</code> <code>칭호 +이름</code> <code>상태 +출혈</code></li>
            <li><code>의뢰 +이름 | 등급 | 보수</code> <code>의뢰완료 이름</code></li>
            <li><code>위치 장소</code> <code>날짜 +1일</code> <code>장착 무기 이름</code> <code>자산 +이름</code></li>
            <li><code>동료 +이름 | 역할 | 등급 | 최대HP | 일당</code> <code>동료HP 이름 -10</code> <code>동료 -이름</code></li>
            <li><code>적성 +바람</code> <code>길들임 +이름 | 마수 | 종족</code> <code>정령계약 +이름 | 정령 | 종족 | 속성</code></li>
            <li><code>계약 +이름 | 소환수 | 종족 | 속성 | HP | 조건</code> <code>유대 이름 +3</code> <code>성장 이름 +10</code> <code>진화 이름 | 새 종족</code></li>
            <li><code>불러내기 이름</code> <code>돌려보내기 이름</code> <code>유지</code> <small>정령·소환수 부르기/유지 MP</small></li>
            <li><code>대여 이름 | 누구 | 50동</code> <code>맡기기 이름 | 마구간</code> <code>데려오기 이름</code> <code>동반자등급 이름 3</code> <small>길들인 짐승</small></li>
            <li><code>예금 2금</code> <code>인출 50은</code> <code>예금 전부</code> <code>경고 +1 | 사유</code> <code>경고 -1</code> <small>길드 은행 · 규약</small></li>
            <li><code>기술습득 화염구</code> <code>숙련 화염구 +3</code> <code>깨달음 화염 폭풍</code></li>
            <li><code>특화 얼음 마법 +5</code> <code>수련 요리 +10</code> <code>클래스 궁수</code></li>
            <li><code>관계 이름 연인</code> <code>관계 이름 약혼</code> <code>관계 이름 이별</code></li>
            <li><code>결혼 이름 | 남작가 영애</code> <code>이혼 이름</code> <code>생활 보통</code></li>
        </ul>
    </section>
    <section class="cg-sec cg-danger"><h3>초기화</h3>
        <p class="cg-hint">이 채팅의 캐릭터를 처음부터 다시 만듭니다. 새 채팅에서 하는 것을 권합니다.</p>
        <button class="cg-btn" data-cg="export">상태 복사 (JSON)</button>
        <button class="cg-btn cg-btn-danger" data-cg="reset">캐릭터 다시 만들기</button>
    </section>`;
}

async function addManual(lines, note = null) {
    const c = ctx();
    const chat = c.chat || [];
    if (!chat.length) return;
    const m = chat[chat.length - 1];
    m.extra = m.extra || {};
    m.extra.cg_manual = [...(m.extra.cg_manual || []), ...lines];
    if (note) m.extra.cg_notes = [...(m.extra.cg_notes || []), note];
    await saveChat();
    refreshNow();
}

async function freeRoll() {
    const c = ctx();
    const id = lastAiIndex();
    if (id < 0 || !cur.state) return;
    const m = c.chat[id];
    if (m.extra?.cg_roll) { toastr?.warning?.('이 장면에는 이미 판정 결과가 있습니다. GM의 다음 응답 이후에 다시 굴릴 수 있어요.', '왕관과 길드'); return; }
    const stat = document.getElementById('cg-fr-stat')?.value || '근력';
    const dc = Number(document.getElementById('cg-fr-dc')?.value) || 12;
    const r = E.rollCheck(cur.state, stat, dc);
    r.what = '플레이어가 선언한 행동';
    r.free = true;
    m.extra = m.extra || {};
    m.extra.cg_roll = r;
    await saveChat();
    refreshNow();
    toastr?.info?.(`${stat} 판정: ${r.total} vs ${dc} — ${r.tier}. 무엇을 시도하는지 입력해서 보내세요.`, '왕관과 길드', { timeOut: 4000 });
}

/* ───────────────────────── 상점 · 의뢰판 (모달) ───────────────────────── */

let modal = null; // { kind: 'shop'|'board', tab }

function openModal(kind, tab) {
    if (!cur.state) { toastr?.warning?.('먼저 캐릭터를 만들어 주세요.', '왕관과 길드'); return; }
    modal = { kind, tab };
    let ov = document.getElementById('cg-modal');
    if (!ov) {
        ov = document.createElement('div');
        ov.id = 'cg-modal';
        ov.className = 'cg-root';
        document.body.appendChild(ov);
    }
    ov.classList.add('cg-open');
    renderModal();
}
function closeModal() { modal = null; document.getElementById('cg-modal')?.classList.remove('cg-open'); }

function renderModal() {
    const ov = document.getElementById('cg-modal');
    if (!ov || !modal || !cur.state) return;
    const st = cur.state;
    let head = '', tabs = [], body = '';
    if (modal.kind === 'shop') {
        if (cartLoc !== st.location) { cart = {}; cartLoc = st.location; }
        const shops = E.availableShops(st);
        if (E.placeKind(st.location) === 'city') shops.push('서점');
        tabs = [...shops.map(n => [n, n]), ['sell', '팔기']];
        if (!modal.tab || !tabs.some(t => t[0] === modal.tab)) modal.tab = shops[0] || 'sell';
        head = `<em class="cg-en">Market</em><b>상점</b><small>${esc(st.location)}</small>`;
        body = shops.length || modal.tab === 'sell' ? (modal.tab === 'sell' ? shopSellHtml(st) : modal.tab === '서점' ? shopBooksHtml(st) : shopBuyHtml(st, modal.tab)) : '';
        if (!shops.length) body = `<p class="cg-hint cg-pad">이곳(${esc(st.location)})에는 가게가 없습니다. 마을이나 도시로 가야 합니다.</p>` + (modal.tab === 'sell' ? '' : '');
        if (!shops.length && modal.tab === 'sell') body = `<p class="cg-hint cg-pad">이곳에는 물건을 사 줄 사람이 없습니다.</p>`;
    } else if (modal.kind === 'market') {
        const mk = E.marketOf(st.location);
        tabs = [['here', '이곳 시세'], ['compare', '시세 비교'], ...(st.orgs.merchant ? [['noble', '귀족 거래']] : [])];
        if (!modal.tab) modal.tab = 'here';
        head = `<em class="cg-en">Trade · ${E.formatDate(st.day).m}월 시세</em><b>${esc(mk || '시장 없음')}</b><small>${esc(E.MARKETS[mk]?.desc || '이곳에는 교역 시장이 없습니다')}</small>`;
        body = modal.tab === 'noble' ? nobleHtml(st) : !mk ? '<p class="cg-hint cg-pad">시장이 있는 도시·마을로 가야 교역품을 사고팔 수 있습니다.</p>' : modal.tab === 'here' ? marketHereHtml(st, mk) : marketCompareHtml(st, mk);
    } else if (modal.kind === 'act') {
        tabs = [['daily', '일상'], ['people', '사람'], ['work', '생업'], ['train', '수련'], ['move', '이동']];
        if (!modal.tab) modal.tab = 'daily';
        head = `<em class="cg-en">Actions</em><b>행동</b><small>누르면 입력창에 들어갑니다 — 고쳐서 보내도 돼요${settings().choiceAutoSend ? ' (바로 전송 켜짐)' : ''}</small>`;
        body = actHtml(st, modal.tab);
    } else if (modal.kind === 'trade') {
        tabs = [];
        head = `<em class="cg-en">Barter · Trade</em><b>거래</b><small>흥정은 이 창에서 — 성사되면 물건과 돈이 바로 오갑니다</small>`;
        body = tradeHtml(st);
    } else {
        const types = E.boardTypes(st);
        tabs = types;
        if (!modal.tab || !tabs.some(t => t[0] === modal.tab)) modal.tab = types[0][0];
        head = `<em class="cg-en">Guild Quest Board</em><b>의뢰판</b><small>${E.formatDate(st.day).m}월 ${E.formatDate(st.day).d}일 게시 · 매일 아침 바뀝니다</small>`;
        body = boardHtml(st, modal.tab);
    }
    const viewKey = `${modal.kind}|${modal.tab}`, pb = ov.querySelector('.cg-mbody'), keepTop = pb && ov.dataset.view === viewKey ? pb.scrollTop : 0;
    ov.dataset.view = viewKey;
    ov.innerHTML = `<div class="cg-mwin">
        <header class="cg-mhead"><div>${head}</div><span class="cg-mmoney">${ICON.coin}${esc(E.formatMoney(st.money))}</span><button class="cg-x" data-cg="close-modal">${ICON.close}</button></header>
        ${tabs.length ? '' : '<!-- no tabs -->'}<nav class="cg-mtabs" ${tabs.length ? '' : 'hidden'}>${tabs.map(([k, l]) => `<button class="${k === modal.tab ? 'on' : ''}" data-cg="mtab" data-tab="${esc(k)}">${esc(l)}</button>`).join('')}</nav>
        <div class="cg-mbody">${body}</div>${modal.kind === 'shop' && modal.tab !== 'sell' ? cartHtml(st) : ''}
    </div>`;
    { const nb = ov.querySelector('.cg-mbody'); if (nb) nb.scrollTop = keepTop; }
}

/* ───────────────────────── 행동 창 — 타이핑 대신 누르기 ───────────────────────── */
/** 행동 버튼: 누르면 입력창에 행동 문장이 들어간다(고쳐서 보낼 수 있음) */
const actBtn = (label, text, cls = '') => `<button class="cg-act ${cls}" data-cg="act" data-text="${esc(text)}">${esc(label)}</button>`;
const JOSA_WA = (n) => E.josa(n, '과', '와');
const JOSA_EGE = (n) => `${n}에게`;
const JOSA_EUL = (n) => E.josa(n, '을', '를');
function personActs(st, n) {
    const nx = E.nextRomance(st, n);
    const bond = st.bonds?.[n]?.stage;
    const out = [actBtn('대화', `(${JOSA_WA(n)} 이야기를 나눈다)`), actBtn('함께 시간 보내기', `(${JOSA_WA(n)} 함께 시간을 보낸다)`), actBtn('도움 청하기', `(${JOSA_EGE(n)} 도움을 청한다: )`)];
    if (st.items?.length) out.push(`<span class="cg-act-gift"><select data-gift="${esc(n)}">${st.items.filter(i => i.qty > 0).slice(0, 40).map(i => `<option>${esc(i.name)}</option>`).join('')}</select>${actBtn('선물', '', 'cg-act-giftbtn').replace('data-cg="act"', `data-cg="act-gift" data-who="${esc(n)}"`)}</span>`);
    if (st.party?.some(m => m.name === n)) out.push(actBtn('같이 훈련', `(${JOSA_WA(n)} 함께 훈련한다)`));
    if (bond === '연인' || bond === '약혼' || bond === '배우자') out.push(actBtn('데이트', `(${JOSA_WA(n)} 데이트를 한다: )`, 'love'));
    if (nx?.ok && (!st.spouse || st.spouse.name === n)) {
        const t = { 설렘: [`마음 표현하기`, `(${JOSA_EGE(n)} 조심스레 마음을 내비친다)`], 연인: ['고백하기', `(${JOSA_EGE(n)} 고백한다)`], 약혼: ['청혼하기', `(${JOSA_EGE(n)} 청혼한다)`], 배우자: ['혼례 올리기', `(${JOSA_WA(n)} 혼례를 올린다)`] }[nx.next];
        if (t) out.push(actBtn(t[0], t[1], 'love strong'));
    }
    return out.join('');
}
function actHtml(st, tab) {
    const loc = st.location || '';
    const city = E.placeKind(loc) === 'city';
    if (tab === 'daily') return `<div class="cg-pad cg-actgrid">
        <h4>하루</h4><div>${[['산책', '(동네를 천천히 걷는다)'], ['맛있는 걸 먹으러', '(소문난 식당에서 한 끼 먹는다)'], ['장 보기', '(시장을 둘러보며 필요한 것을 산다)'], ['술 한잔', '(주점에서 한잔하며 사람들 이야기를 듣는다)'], ['목욕탕', '(공중목욕탕에서 피로를 푼다)'], ['기도', '(성당에 들러 기도한다)'], ['책 읽기', '(서점이나 도서관에서 책을 읽는다)'], ['거리 공연 구경', '(광장의 거리 공연을 구경한다)'], ['일찍 잠들기', '(오늘은 일찍 잠자리에 든다)']].map(([l, t]) => actBtn(l, t)).join('')}</div>
        <h4>시간</h4><div>${[['낮까지', '(낮이 될 때까지 시간을 보낸다)'], ['저녁까지', '(저녁이 될 때까지 시간을 보낸다)'], ['밤까지', '(밤이 될 때까지 시간을 보낸다)'], ['다음 날 아침', '(하룻밤 자고 다음 날 아침을 맞는다)']].map(([l, t]) => actBtn(l, t)).join('')}</div>
        <h4>며칠</h4><div>${[['하루 쉬기', '(하루 푹 쉰다)'], ['사흘 쉬기', '(사흘 동안 몸을 추스른다)'], ['일주일 일상', '(일주일 동안 평소처럼 지낸다 — 특별한 일만 장면으로)']].map(([l, t]) => actBtn(l, t)).join('')}</div>
        ${st.party?.length ? `<h4>동료들과</h4><div>${actBtn('같이 식사', '(동료들과 같이 밥을 먹는다)')}${actBtn('작전 회의', '(동료들과 다음 일을 의논한다)')}${actBtn('모닥불 이야기', '(동료들과 모닥불에 둘러앉아 이야기한다)')}</div>` : ''}</div>`;
    if (tab === 'people') {
        const people = [...new Set([...(st.spouse ? [st.spouse.name] : []), ...Object.keys(st.bonds || {}), ...st.party.map(m => m.name), ...Object.entries(st.rel || {}).sort((a, b) => b[1] - a[1]).map(([k]) => k)])].slice(0, 16);
        const kids = (st.children || []).filter(c => !c.unnamed);
        const kw = E.knownWhere(st), knownSet = new Set(kw.flatMap(k => [k.name, k.key]));
        const strangers = E.peopleHere(st).filter(h => !knownSet.has(h.name) && !Object.keys(st.rel || {}).some(r => r.startsWith(h.name)));
        const whereRow = (k) => `<div class="cg-where ${k.here ? 'here' : ''}"><span><b>${esc(k.name)}</b><small>${esc(k.loc.replace('제도 루미에른 · ', ''))} · ${esc(k.spot)}${k.rest ? ' · 쉬는 날' : ''}</small></span>${k.here ? actBtn('다가가기', `(${k.spot}에 있는 ${JOSA_EGE(k.name)} 다가간다)`) : actBtn('찾아가기', `(${JOSA_EUL(k.name)} 찾아 ${k.loc.replace('제도 루미에른 · ', '')} ${E.josa(k.spot, '으로', '로')} 간다)`)}</div>`;
        return `<div class="cg-pad cg-actgrid">
            <h4>지금 어디에 — ${esc(E.todOf(st))}</h4>
            ${kw.length ? `<div class="cg-wheres">${kw.sort((a, b) => (b.here ? 1 : 0) - (a.here ? 1 : 0)).map(whereRow).join('')}</div>` : '<p class="cg-hint">아는 사람이 생기면 지금 어디 있는지 여기에 보입니다.</p>'}
            ${strangers.length ? `<h4>이곳에서 마주칠 만한 사람</h4><div class="cg-wheres">${strangers.map(h => `<div class="cg-where here"><span><b>${esc(h.name)}</b><small>${esc(h.role)} · ${esc(h.spot)}</small></span>${actBtn('다가가기', `(${h.spot}에 있는 ${JOSA_EGE(h.name)} 다가간다)`)}</div>`).join('')}</div>` : ''}
            <h4>가까운 사람</h4>
            ${people.length ? people.map(n => `<div class="cg-act-person"><b>${esc(n)}<small>${esc(st.bonds?.[n]?.stage || E.friendStage(st.rel?.[n] || 0))}</small></b><div>${personActs(st, n)}</div></div>`).join('') : '<p class="cg-hint">아직 아는 사람이 없습니다.</p>'}
            ${kids.length ? `<h4>아이들</h4>${kids.map(c => `<div class="cg-act-person"><b>${esc(c.name)}<small>${E.childAge(c, st.day)}살</small></b><div>${actBtn('놀아 주기', `(${JOSA_WA(c.name)} 놀아 준다)`)}${actBtn('글·검술 가르치기', `(${JOSA_EGE(c.name)} 글과 검술을 가르친다)`)}${E.childAge(c, st.day) >= 13 ? actBtn('가업 가르치기', `(${JOSA_EGE(c.name)} 가업을 가르친다)`) : ''}</div></div>`).join('')}` : ''}
            <h4>새 사람</h4><div>${actBtn('말 걸어 보기', '(근처 사람에게 말을 걸어 본다: )')}${actBtn('사람 찾기', '(사람을 수소문한다: )')}${actBtn('도움이 필요한 사람', '(곤란해 보이는 사람이 없는지 살핀다)')}</div></div>`;
    }
    if (tab === 'work') {
        const parts = [];
        for (const sh of st.shops || []) {
            const food = E.isFoodShop(sh);
            parts.push(`<div class="cg-act-person"><b>${esc(sh.name)}<small>${esc(sh.kind)}</small></b><div>${food ? actBtn('주방에서 요리', `(${sh.name} 주방에서 하루 요리한다)`) + actBtn('손님 맞기', `(${sh.name}에서 손님을 맞는다)`) + actBtn('새 메뉴 연구', `(${sh.name}에 낼 새 메뉴를 연구한다)`) : E.isCraftShop(sh.kind) ? actBtn('공방에서 일하기', `(${sh.name}에서 하루 종일 일한다)`) + actBtn('제자 가르치기', `(${sh.name}의 제자를 가르친다)`) : actBtn('가게 보기', `(${sh.name}에서 하루 장사를 한다)`) + actBtn('물건 떼러 가기', `(${sh.name}에 들일 물건을 떼러 간다)`)}${actBtn('장부 정리', `(${sh.name}의 장부를 정리한다)`)}</div></div>`);
        }
        for (const f of st.farms || []) {
            parts.push(`<div class="cg-act-person"><b>${esc(f.name)}<small>${esc(f.market)}</small></b><div>${actBtn('농장 둘러보기', `(${f.name}을 둘러본다)`)}${actBtn('밭일 거들기', `(${f.name}에서 일꾼들과 밭일을 한다)`)}${actBtn('일꾼들과 이야기', `(${f.name}의 일꾼들과 이야기를 나눈다)`)}${(f.stable || []).length ? actBtn('말과 시간 보내기', `(${f.name} 마구간에서 말들과 시간을 보낸다)`) + actBtn('말 타고 달리기', `(말을 타고 ${f.name} 들판을 달린다)`) : ''}${(f.cellar || []).length ? actBtn('술 저장고 살피기', `(${f.name}의 술 저장고에서 술을 맛본다)`) : ''}</div></div>`);
        }
        for (const [id, o] of Object.entries(st.orgs || {})) parts.push(`<div class="cg-act-person"><b>${esc(E.ORGS[id]?.name || id)}<small>${esc(E.ORGS[id]?.ranks?.[o.rank] || '')}</small></b><div>${actBtn('들러 보기', `(${E.ORGS[id]?.name || id}에 들른다)`)}${actBtn('승급 상담', `(${E.ORGS[id]?.name || id}에 승급에 대해 묻는다)`)}${actBtn('일거리 찾기', `(${E.ORGS[id]?.name || id}에서 일거리를 찾는다)`)}</div></div>`);
        if (st.family && !st.family.disowned) parts.push(`<div class="cg-act-person"><b>${esc(st.family.house)}<small>${esc(st.family.head ? '당주' : E.birthLabel(st.family, st.profile.gender))}</small></b><div>${st.family.head ? actBtn('영지 돌보기', '(영지를 돌며 가신과 영민의 사정을 살핀다)') + actBtn('가신 회의', '(가신들을 불러 회의를 연다)') : actBtn('본가에 인사', `(${st.family.house} 본가에 인사하러 간다)`) + actBtn('당주와 면담', '(당주를 찾아가 이야기를 청한다)')}${actBtn('사교 모임', '(귀족들의 사교 모임에 나간다)')}</div></div>`);
        if (st.patron) parts.push(`<div class="cg-act-person"><b>${esc(st.patron.house)}<small>후원 가문</small></b><div>${actBtn('가문 방문', `(${st.patron.house}을 찾아간다)`)}${actBtn('보고하러 가기', `(${st.patron.house}에 일을 보고하러 간다)`)}</div></div>`);
        parts.push(`<div class="cg-act-person"><b>일자리</b><div>${actBtn('일자리 찾기', '(오늘 할 만한 일자리를 찾는다)')}${actBtn('가게 탭에서 고르기', '').replace('data-cg="act"', 'data-cg="panel-tab" data-tab="shops"')}</div></div>`);
        return `<div class="cg-pad cg-actgrid">${parts.join('')}</div>`;
    }
    if (tab === 'train') {
        const sk = Object.keys(st.cskills || {});
        const life = Object.keys(st.life || {});
        return `<div class="cg-pad cg-actgrid">
            <h4>몸과 기술</h4><div>${actBtn('하루 훈련', '(하루 동안 훈련한다)')}${actBtn('일주일 맹훈련', '(일주일 동안 맹훈련한다)')}${actBtn('스승 찾기', '(가르침을 받을 스승을 찾는다: )')}</div>
            ${sk.length ? `<h4>기술 하나를 골라 연습</h4><div class="cg-act-gift"><select id="cg-act-skill">${sk.map(k => `<option>${esc(k)}</option>`).join('')}</select><button class="cg-act" data-cg="act-skill">연습하기</button></div>` : ''}
            ${life.length ? `<h4>생활 기술</h4><div class="cg-act-gift"><select id="cg-act-life">${life.map(k => `<option>${esc(k)}</option>`).join('')}</select><button class="cg-act" data-cg="act-life">하루 수련</button></div>` : ''}
            <h4>배우기</h4><div>${actBtn('글 배우기', '(글과 셈을 배운다)')}${actBtn('예법 배우기', '(귀족의 예법을 배운다)')}${actBtn('새 클래스 알아보기', '(배울 수 있는 다른 길을 알아본다)')}</div></div>`;
    }
    // 이동
    const here = loc.split('·')[0].trim();
    const spots = { '제도 루미에른': CAPITAL_PINS.map(c => c[0]), '항구도시 세렌포트': ['부두 거리', '어시장', '상관 거리', '등대 언덕'], '바르그홀름': ['대장간 거리', '광산 입구', '드워프 주점'], '곡물 도시 하벤': ['곡물 거래소', '경마장', '시장 광장', '술 창고 거리'], '엘름바트': ['통나무 성문', '모피 시장', '사냥꾼 조합', '벌목장'], '그레이븐 성채': ['성채 광장', '대장간', '용병 주점', '성벽 위'] };
    const near = spots[Object.keys(spots).find(k => here.includes(k.split(' ')[0]) || here.includes(k.split(' ').at(-1))) || ''] || [];
    const MODES = [['마차', '합승 마차로'], ['말', '말을 타고'], ['걸어서', '걸어서'], ['짐배', '루미강 짐배로']];
    const rows = E.WORLD_PLACES.map(p => {
        const qs = MODES.map(([m, w]) => [m, w, E.travelQuote(st, p[0], m)]).filter(([, , q]) => !q.error);
        if (!qs.length) return '';
        const main = qs[0][2];
        return `<div class="cg-trip"><span><b>${esc(p[1].split(' · ')[0])}</b><small>${esc(main.roads.join(' · '))}${main.dangers.length ? ` · ⚠ ${esc(main.dangers.join(', '))}` : ''}</small></span>
            <span class="cg-trip-modes">${qs.map(([m, w, q]) => actBtn(`${m} ${E.travelLabel(q)}`, `(${E.josa(p[1].split(' · ')[0], '으로', '로')} 떠난다 — ${w})`)).join('')}</span></div>`;
    }).join('');
    return `<div class="cg-pad cg-actgrid">
        <p class="cg-hint">지금: ${esc(loc)} · 일수와 삯은 확장이 계산합니다 (말은 데리고 다니는 말이 없으면 역참에서 빌림)</p>
        ${mapHtml(st, loc, /제도|루미에른/.test(here))}
        ${near.length ? `<h4>이 안에서</h4><div>${near.map(sp => actBtn(sp, `(${here} ${E.josa(sp, '으로', '로')} 간다)`)).join('')}</div>` : ''}
        <h4>멀리</h4><div class="cg-trips">${rows}</div>
        ${(st.farms || []).filter(f => !loc.includes(f.market.split(' ').at(-1))).length ? `<h4>내 농장</h4><div>${st.farms.filter(f => !loc.includes(f.market.split(' ').at(-1))).map(f => actBtn(`${f.name} (${f.market})`, `(${f.market}의 ${f.name} 농장으로 떠난다)`)).join('')}</div>` : ''}
        <h4>그 밖</h4><div>${actBtn('주변 탐색', '(주변을 둘러보며 탐색한다)')}${actBtn('지름길 찾기', '(지름길이 있는지 알아본다)')}${actBtn('대상단 호위로 따라가기', '(대상단 호위 일을 맡아 함께 길을 떠난다: )')}</div></div>`;
}


/* ── 지도 ── 좌표는 그림 크기에 대한 % */
const MAP_IMG = { world: new URL('./maps/world.jpg', import.meta.url).href, capital: new URL('./maps/capital.jpg', import.meta.url).href };
const WORLD_PINS = { 제도: [53.1, 37.6], 브레이크: [56.6, 43.2], 흑림: [68.4, 34.2], 아르카: [47.9, 45.9], 거울호수: [43, 42], 세렌포트: [21.5, 45.1], 경계목: [33.9, 30.3], 하벤: [51.4, 51.8], 비엔: [61.2, 53.5], 엘름바트: [82.7, 39.6], 철문: [61.5, 22], 바르그홀름: [69, 13.7], 그레이븐: [57.9, 5.4], 망루: [92.4, 11.7] };
const WORLD_LABEL = E.PLACE_LABEL;
const FAR_PINS = [
    ['이스메라', 9.1, 23, '청옥해 건너 배로 열흘, 일곱 섬의 왕국. 향신료·비단·이국 마도구. 배는 세렌포트에서만 뜬다.', '(세렌포트에서 이스메라로 가는 배편을 알아본다)'],
    ['청옥해', 11.1, 54.7, '세렌포트 앞바다. 가을 폭풍철과 세이렌 전설.', ''],
    ['태양해', 42.3, 75.2, '남부 평원 남서쪽으로 파고든 따뜻한 만. 해적이 가장 많다.', ''],
    ['사막 왕국 사하르', 69, 83, '태양해 동쪽 기슭부터 펼쳐진 사막, 수도 카흐란. 하벤 남쪽 나루에서 배로 닷새, 육로는 보름 넘는 죽음의 길.', '(하벤 남쪽 나루에서 사하르로 가는 배편을 알아본다)'],
    ['타르간 초원', 86, 24.4, '동쪽 끝 대초원, 칸을 섬기는 유목 부족. 지금은 휴전.', ''],
    ['얼음 바다', 81.4, 5.4, '잿빛 산맥 너머. 얼음 섬과 고래잡이 배뿐.', ''],
    ['잿빛 산맥', 44, 15, '제국 북쪽을 가로막는 산맥. 겨울엔 고갯길이 막힌다.', ''],
];
const CAPITAL_PINS = [
    ['황궁 앞 광장', 50.1, 20, '황궁 정문 앞 큰 광장. 행사와 포고가 여기서 열린다.'],
    ['백은 구역', 60.5, 23.4, '귀족 저택가. 평민은 허가가 있어야 들어간다.'],
    ['대성당 광장', 24.7, 24.4, '빛의 대성당과 그 앞 광장.'],
    ['기사단 연병장', 74.2, 23, '제국 기사단의 훈련장.'],
    ['상인 길드 회관', 33.5, 38.6, '길드 대로 서쪽, 상인 길드 본관.'],
    ['청람의 탑 제도 지부', 41.7, 32.5, '마법사들의 탑 지부.'],
    ['길드 대로', 51.4, 42, '모험가 길드 본부가 있는 큰길. 주점과 의뢰 게시판.'],
    ['장인 공방가', 66.5, 37.5, '대장간·공방이 모인 거리.'],
    ['서쪽 노동자 거리', 13, 44, '일꾼과 짐꾼들이 사는 동네.'],
    ['사거리 시장', 50.1, 50.3, '제도에서 가장 큰 장터.'],
    ['회색 골목', 84, 58.6, '동쪽 강변 저지대의 빈민가. 뒷골목 정보와 장물.'],
    ['루미강 부두', 36.5, 67.4, '짐배와 창고. 세렌포트행 짐배가 뜬다.'],
    ['남문', 50.1, 83, '시장 다리를 건너면 나오는 남쪽 성문. 아르카·하벤 길.'],
];
const TRIP_MODES = [['마차', '합승 마차로'], ['말', '말을 타고'], ['걸어서', '걸어서'], ['짐배', '루미강 짐배로']];
function tripModeBtns(st, key, destLabel) {
    return TRIP_MODES.map(([m, w]) => [m, w, E.travelQuote(st, key, m)]).filter(([, , q]) => !q.error)
        .map(([m, w, q]) => actBtn(`${m} ${E.travelLabel(q)}`, `(${E.josa(destLabel, '으로', '로')} 떠난다 — ${w})`)).join('');
}
function mapHtml(st, loc, inCapital) {
    const view = modal.map || (inCapital ? 'capital' : 'world');
    const sel = modal.pin || '';
    const herePlace = E.WORLD_PLACES.find(p => p[2].test(loc));
    const pin = (key, x, y, label, cls) => `<button class="cg-mpin ${cls}${sel === key ? ' is-sel' : ''}" data-cg="map-pin" data-pin="${esc(key)}" style="left:${x}%;top:${y}%"><i></i><span>${esc(label)}</span></button>`;
    let pins = '', info = '';
    const seen = (k) => st.visited?.[k] !== undefined;
    if (view === 'world') {
        pins = E.WORLD_PLACES.map(p => WORLD_PINS[p[0]] ? pin(p[0], ...WORLD_PINS[p[0]], WORLD_LABEL[p[0]] || p[1].split(' · ')[0], herePlace === p ? 'is-here' : seen(p[0]) ? '' : 'is-unseen') : '').join('')
            + FAR_PINS.map(f => pin(f[0], f[1], f[2], f[0], 'is-far')).join('');
        const p = E.WORLD_PLACES.find(q => q[0] === sel), f = FAR_PINS.find(q => q[0] === sel);
        if (p) {
            const name = p[1].split(' · ')[0];
            if (p === herePlace) info = `<b>${esc(name)}</b><small>지금 여기 있습니다</small>${p[0] === '제도' ? `<div class="cg-map-acts"><button class="cg-act" data-cg="map-view" data-view="capital">제도 안 지도 보기</button></div>` : ''}`;
            else { const q = E.travelQuote(st, p[0], '마차'); info = `<b>${esc(name)}</b>${seen(p[0]) ? `<em class="cg-seen">${E.formatDate(st.visited[p[0]]).y}년 ${E.formatDate(st.visited[p[0]]).m}월 처음 가 봄</em>` : '<em class="cg-unseen">아직 가 보지 않은 곳</em>'}<small>${esc((q.roads || []).join(' · '))}${q.dangers?.length ? ` · ⚠ ${esc(q.dangers.join(', '))}` : ''}</small><div class="cg-map-acts">${tripModeBtns(st, p[0], name)}</div>`; }
        } else if (f) info = `<b>${esc(f[0])}</b><small>${esc(f[3])}</small>${f[4] ? `<div class="cg-map-acts">${actBtn('배편 알아보기', f[4])}</div>` : ''}`;
    } else {
        const spotHere = inCapital ? (CAPITAL_PINS.find(c => loc.includes(c[0]))?.[0] || '') : '';
        const seenSp = (k) => st.seenSpots?.[k] !== undefined;
        pins = CAPITAL_PINS.map(c => pin(c[0], c[1], c[2], c[0], spotHere === c[0] ? 'is-here' : seenSp(c[0]) ? '' : 'is-unseen')).join('');
        const c = CAPITAL_PINS.find(q => q[0] === sel);
        if (c) info = `<b>${esc(c[0])}</b><small>${esc(c[3])}</small><div class="cg-map-acts">${spotHere === c[0] ? '<em class="cg-here">지금 여기</em>'
            : inCapital ? actBtn(`${E.josa(c[0], '으로', '로')} 가기`, `(제도 루미에른 ${E.josa(c[0], '으로', '로')} 간다)`)
            : tripModeBtns(st, '제도', `제도 루미에른 ${c[0]}`)}</div>`;
    }
    if (!info) info = `<small>${view === 'world' ? '갈 곳을 누르면 길과 일수, 삯이 나옵니다.' : '갈 곳을 누르세요.'}${view === 'world' ? ` 가 본 곳 ${Object.keys(st.visited || {}).length} / ${E.WORLD_PLACES.length}` : ` 가 본 곳 ${CAPITAL_PINS.filter(c => st.seenSpots?.[c[0]] !== undefined).length} / ${CAPITAL_PINS.length}`}</small>`;
    return `<div class="cg-map-wrap">
        <div class="cg-seg cg-map-switch"><button class="${view === 'world' ? 'on' : ''}" data-cg="map-view" data-view="world">대륙</button><button class="${view === 'capital' ? 'on' : ''}" data-cg="map-view" data-view="capital">제도 루미에른</button></div>
        <div class="cg-map cg-map-${view}"><img src="${MAP_IMG[view]}" alt="" draggable="false">${pins}</div>
        <div class="cg-map-info">${info}</div></div>`;
}

/* ── 시장 ── */
function affairsHtml(st) {
    return `<div class="cg-affairs">${E.affairsOf(st.day).map(a => `<span title="${esc(a.desc)}"><b>${esc(a.name)}</b><small>${esc(a.desc)}</small></span>`).join('')}</div>`;
}
function cargoHtml(st) {
    const used = E.cargoUsed(st), cap = E.cargoCap(st);
    return `<div class="cg-cargo"><span>짐</span>${bar(used, cap, 'cg-exp')}<small>${used} / ${cap}짐 · ${cap >= 80 ? '짐마차' : cap >= 25 ? '손수레' : '등짐'}${cap % 5 ? '' : ''}</small></div>`;
}
function marketHereHtml(st, mk) {
    const sp = E.tradeSpread(st);
    return `<div class="cg-pad">${affairsHtml(st)}${cargoHtml(st)}
        <p class="cg-hint">사고파는 값 차이 ${Math.round(sp * 100)}%${st.orgs.merchant ? ' · 상인 길드 등급이 오를수록 줄어듭니다' : ' · 상인 길드에 들면 줄어듭니다'}. 많이 사면 값이 오르고, 많이 팔면 값이 내려갑니다(이번 달 이 시장 한정).</p></div>
    <table class="cg-mkt"><thead><tr><th>교역품</th><th>살 때</th><th>팔 때</th><th>시세</th><th>보유</th><th></th></tr></thead><tbody>
    ${E.TRADE_GOODS.map(([name, base, cat, desc]) => {
        const q = E.tradeQuote(st, name, mk);
        const own = st.items.find(i => i.name === name)?.qty || 0;
        const ratio = q.mid / base;
        const tr = ratio <= 0.8 ? ['down', '쌈'] : ratio >= 1.2 ? ['up', '비쌈'] : ['', '보통'];
        return `<tr><td><b>${esc(name)}</b><small>${esc(cat)} · ${esc(desc)}</small></td>
            <td class="cg-num">${esc(E.formatMoney(q.buy))}</td><td class="cg-num">${esc(E.formatMoney(q.sell))}</td>
            <td><em class="cg-trend ${tr[0]}">${tr[1]}</em></td><td class="cg-num">${own || '—'}</td>
            <td class="cg-mkt-ctl"><input type="number" min="1" value="1" data-mq="${esc(name)}"><button class="cg-mini" data-cg="mkt-buy" data-name="${esc(name)}">사기</button><button class="cg-mini" data-cg="mkt-sell" data-name="${esc(name)}" ${own ? '' : 'disabled'}>팔기</button></td></tr>`;
    }).join('')}</tbody></table>`;
}
function marketCompareHtml(st, here) {
    const exact = !!st.orgs.merchant && !E.isSuspended(st, 'merchant');
    const mks = Object.keys(E.MARKETS);
    return `<div class="cg-pad">${affairsHtml(st)}<p class="cg-hint">${st.orgs.merchant && !exact ? '영업 정지 중이라 길드 시세 게시판을 볼 수 없습니다. ' : ''}${exact ? '상인 길드의 시세 게시판 덕분에 다른 시장의 이달 시세를 정확히 압니다.' : '다른 시장의 값은 소문으로만 압니다(쌈·보통·비쌈). 상인 길드에 들면 정확한 시세를 볼 수 있어요.'} 계절과 정세는 달마다 바뀝니다.</p></div>
    <table class="cg-mkt cg-mkt-cmp"><thead><tr><th>교역품</th>${mks.map(m => `<th class="${m === here ? 'here' : ''}">${esc(m.replace('항구도시 ', '').replace('제도 ', ''))}</th>`).join('')}</tr></thead><tbody>
    ${E.TRADE_GOODS.map(([name, base]) => `<tr><td><b>${esc(name)}</b></td>${mks.map(m => {
        const p = E.marketPrice(st, m, name), r = p / base;
        const cls = r <= 0.8 ? 'down' : r >= 1.2 ? 'up' : '';
        return `<td class="cg-num ${m === here ? 'here' : ''}">${exact || m === here ? `<span class="cg-trend-n ${cls}">${esc(E.formatMoney(p))}</span>` : `<em class="cg-trend ${cls}">${r <= 0.8 ? '쌈' : r >= 1.2 ? '비쌈' : '보통'}</em>`}</td>`;
    }).join('')}</tr>`).join('')}</tbody></table>`;
}

function scoutHtml(st, onlyChef) {
    const offers = onlyChef ? E.chefScouts(st) : E.scoutOffers(st);
    if (!offers.length) return '';
    return `<div class="cg-scout"><h4>스카웃 제의 <small>${onlyChef ? '소문을 듣고 귀족가가 요리사를 찾아왔습니다' : '이달에 귀족가가 당신을 찾고 있습니다'}</small></h4>${offers.map(o => `<article>
        <header><b>${esc(o.house)}</b><small>${esc(o.faction)}${o.rival ? ` · 정적: ${esc(o.rival)}` : ''} · 호감 ${o.favor}</small></header>
        <p>${esc(o.caravan || '')}${o.perk ? ` — ${esc(o.perk)}` : ''}</p>
        <div class="cg-scout-roles">${o.roles.map(r => `<button class="cg-btn ${r === '상단원' ? '' : 'cg-btn-primary'}" data-cg="scout" data-house="${esc(o.house)}" data-role="${esc(r)}">${esc(r)}로 들어가기</button>`).join('')}</div>
        <small class="cg-hint">${o.roles.map(r => `${esc(r)}: ${esc(E.PATRON_ROLES[r].desc)}`).join('<br>')}${st.patron ? `<br>지금의 후원 가문(${esc(st.patron.house)})을 떠나게 됩니다.` : ''}</small>
    </article>`).join('')}</div>`;
}
function patronHtml(st, compact) {
    if (!st.patron) return '';
    const h = E.patronHouse(st), P = E.PATRON_ROLES[st.patron.role], fav = st.houseFavor?.[st.patron.house] || 0;
    const next = P.ranks[st.patron.rank + 1];
    return `<div class="cg-patron"><header><b>${esc(st.patron.house)}</b><em class="cg-shoptier">${esc(P.ranks[st.patron.rank])}</em><small>${esc(st.patron.role)} · ${esc(h?.faction || '')}${h?.rival ? ` · 정적 ${esc(h.rival)}와는 거래 불가` : ''}</small></header>
        <div class="cg-shoprow"><span>호감</span>${bar(fav, 100, 'cg-exp')}<small>${fav}</small></div>
        ${compact ? '' : `<small class="cg-hint">${esc(P.desc)}${h?.perk ? ` · ${esc(h.perk.text)}` : ''}</small>`}
        <ul class="cg-patron-ul">
            <li>${P.pay ? `급료 매달 ${esc(E.formatMoney(P.pay[st.patron.rank]))}` : `상납 — 가게 매출의 ${Math.round(P.tribute[st.patron.rank] * 100)}%`}</li>
            <li>${st.patron.role === '전속 요리사' ? '저택에서 먹고 자며 가문의 식탁을 맡습니다 — 다달이 호감이 오르고, 연회를 차리면 더 오릅니다. 내 식당은 점원·제자만으로 돌아가요.' : st.patron.role === '어용 식당' ? '가문의 문장 덕에 손님 +20%·값 +15%, 소문도 빨리 퍼집니다. 다달이 가문 연회를 한 번은 차려야 호감이 떨어지지 않아요.' : `가문의 주문은 등급과 상관없이 받고, 값을 ${st.patron.role === '상단원' ? '10' : '15'}% 더 쳐 줍니다. 다달이 채우지 못하면 호감이 떨어져요.`}</li>
            ${next ? `<li>다음 자리: ${esc(next)} — 호감 ${E.PATRON_FAVOR[st.patron.rank + 1]}${st.patron.rank + 1 >= 3 ? ' · 1년 이상 섬김' : ''}</li>` : ''}
        </ul>
        <button class="cg-mini cg-danger" data-cg="patron-leave">${patronLeaveAsk ? '정말 떠날까요? 한 번 더' : '후원 가문 떠나기'}</button>
    </div>`;
}
let patronLeaveAsk = false;
function seasonHtml(st) {
    const ss = E.seasonStatus(st.day), pres = E.presentHouses(st);
    return `<div class="cg-season ${ss.on ? 'on' : ''}"><b>${ss.on ? '사교 시즌' : '비시즌'}</b><span>${esc(ss.text)}</span><small>지금 제도에 머무는 귀족가 ${pres.length}곳</small></div>`;
}
function rosterHtml(st) {
    const groups = {};
    for (const h of E.NOBLE_HOUSES) (groups[h.title] = groups[h.title] || []).push(h);
    return `<details class="cg-roster"><summary>귀족 명부 · ${E.NOBLE_HOUSES.length}가문 <small>사교 시즌에 모이고, 가문마다 머무는 때와 길이가 다릅니다</small></summary>
        ${['공작', '후작', '변경백', '백작', '자작', '남작', '황실'].filter(t => groups[t]).map(t => [t, groups[t]]).map(([t, hs]) => `<div class="cg-roster-g"><em>${esc(t === '황실' ? '황실' : `${t}가`)}</em>${hs.map(h => { const f = st.houseFavor?.[h.name] || 0; const sc = E.houseStance(st, h); const p = E.houseProfile(h); const here = E.inCapital(h, st.day); return `<span class="${sc} ${st.patron?.house === h.name ? 'mine' : ''} ${here ? 'here' : ''}" title="${esc(`${h.region} · ${h.faction} · ${h.trait} · 가업 ${p.business} · ${p.stayText} (올해 ${E.stayLabel(h, st.day)})${p.agent ? ' · 제도에 상관을 둠' : ''}`)}">${here ? '● ' : ''}${esc(h.short || h.name)}${f ? `<i>${f}</i>` : ''}</span>`; }).join('')}</div>`).join('')}
        <small class="cg-hint">● 지금 제도에 머무는 가문 · 숫자는 호감. 이름에 마우스를 올리면 영지·파벌·가풍·가업과 올해 머무는 때가 보여요. 큰 가문은 일 년 내내, 넉넉한 가문은 시즌 내내, 그렇지 못한 가문은 한창때나 축제 때만 잠깐 올라옵니다. 후원 가문과 맞서는 파벌은 흐리게 보입니다.</small></details>`;
}
function nobleHtml(st) {
    const mr = E.merchantRank(st);
    const inCap = E.marketOf(st.location) === '제도 루미에른';
    if (mr < 2 && !st.patron) return `<div class="cg-pad">${scoutHtml(st)}<p class="cg-hint">귀족가는 아무 상인과 거래하지 않습니다. 상인 길드 <b>${esc(E.ORGS.merchant.ranks[2])}</b>부터 남작가, ${esc(E.ORGS.merchant.ranks[3])}부터 백작·자작가, ${esc(E.ORGS.merchant.ranks[4])}부터 공작·후작·변경백가가 주문을 넣고 집안의 진귀한 물건을 내놓기도 합니다.${E.isSuspended(st, 'merchant') ? ' (지금은 영업 정지 중)' : ''}</p>
        ${seasonHtml(st)}
        <ul class="cg-noble-tease">${E.presentHouses(st).slice(0, 8).map(h => `<li><b>${esc(h.name)}</b><small>${esc(E.stayLabel(h, st.day))} · ${esc(h.region)} · ${esc(h.faction)} · ${esc(h.trait)} — ${esc(E.josa(h.likes.join(' · '), '을', '를'))} 즐겨 찾는다</small></li>`).join('')}</ul>${rosterHtml(st)}</div>`;
    return `<div class="cg-pad">${seasonHtml(st)}${scoutHtml(st)}${patronHtml(st, true)}<p class="cg-hint">${inCap ? '제도에 와 있는 귀족가와 제도에 상관을 둔 가문 가운데, 이달 상인을 찾는 집들입니다. 주문은 가문마다 한 달에 한 번, 시세보다 후하게 쳐 줍니다. 납품하면 명성도 오릅니다.' : '귀족가와의 거래는 제도 루미에른에서 합니다 — 주문은 미리 볼 수 있어요.'}</p></div>
    <div class="cg-noble">${E.nobleOffers(st).map(o => {
        const ok = (mr >= o.need || o.mine) && !o.rivalBlocked;
        const fav = st.houseFavor?.[o.house] || 0;
        const have = st.items.find(i => i.name === o.good)?.qty || 0;
        return `<article class="${ok ? '' : 'locked'} ${o.mine ? 'mine' : ''}"><header><b>${esc(o.house)}</b>${o.mine ? '<small>후원 가문</small>' : o.rivalBlocked ? '<small>맞서는 집안 — 거래 불가</small>' : o.stance === 'cold' ? '<small>반대 파벌 — 냉담 (값 -10%)</small>' : ok ? `<small>호감 ${fav}</small>` : `<small>${esc(E.ORGS.merchant.ranks[o.need])}부터</small>`}</header>
            <p class="cg-noble-trait">${esc(o.region || '')} · ${esc(o.faction || '')} · ${esc(o.trait || '')}<br>${o.here ? `제도 체류 ${esc(o.stay)}` : `가문은 영지에 — 제도의 상관(${esc(o.business)})이 주문만 받는다`}</p>
            <div class="cg-noble-row"><span><em>주문</em>${esc(o.good)} ${o.qty}짐 · 짐당 ${esc(E.formatMoney(o.unit))}<small>합계 ${esc(E.formatMoney(o.total))} · 가진 것 ${have}짐</small></span>
                <button class="cg-mini" data-cg="noble-sell" data-house="${esc(o.house)}" ${ok && inCap && !o.delivered && have >= o.qty ? '' : 'disabled'}>${o.delivered ? '납품 끝' : '납품'}</button></div>
            ${o.sale ? `<div class="cg-noble-row"><span><em>내놓은 물건</em>${esc(o.sale.name)}<small>${esc(E.formatMoney(o.sale.price))}</small></span>
                <button class="cg-mini" data-cg="noble-buy" data-house="${esc(o.house)}" ${ok && inCap && !o.bought && st.money >= o.sale.price ? '' : 'disabled'}>${o.bought ? '구입함' : '사기'}</button></div>` : ''}
        </article>`;
    }).join('')}</div><div class="cg-pad">${rosterHtml(st)}</div>`;
}

/* ── 거래 (물물교환) ── */
let trade = null; // { with, give: {name: qty}, giveMoney, get: [{name, price, qty}], getMoney }
function openTrade(wares) {
    trade = { with: wares?.who || '', give: {}, giveMoney: 0, get: (wares?.items || []).map(x => ({ name: x.name, price: x.price, qty: 0 })), getMoney: 0 };
    openModal('trade');
}
function tradeVal(st, name, price) { return price ?? E.valueOf(st, name); }
function tradeHtml(st) {
    if (!trade) trade = { with: '', give: {}, giveMoney: 0, get: [], getMoney: 0 };
    if (trade.done) return `<div class="cg-trade">${tradeResultHtml()}<p class="cg-hint">${esc(E.josa(trade.with.trim() || '상대', '와', '과'))}의 거래가 끝났습니다. GM은 다음 장면에서 이어 받습니다 — 대화를 이어 가거나 바로 다음 행동을 적으세요.</p><div class="cg-trade-go"><button class="cg-btn cg-btn-primary" data-cg="close-modal">닫기</button></div></div>`;
    const exact = E.appraiseExact(st);
    const fmtV = (v) => v == null ? '?' : exact ? E.formatMoney(v) : `약 ${E.formatMoney(Math.round(v * 0.8))}~${E.formatMoney(Math.round(v * 1.25))}`;
    return `<div class="cg-trade">
        <label class="cg-trade-who">거래 상대 <input data-tr="with" value="${esc(trade.with)}" placeholder="예: 떠돌이 행상 볼프"></label>
        <div class="cg-trade-cols">
            <section><h4>내가 주는 것</h4>
                <ul>${st.items.map(i => { const q = trade.give[i.name] || 0; const v = tradeVal(st, i.name); return `<li class="${q ? 'on' : ''}"><span>${esc(i.name)}<small>보유 ${i.qty} · ${fmtV(v)}</small></span>
                    <span class="cg-step"><button class="cg-mini" data-cg="tr-give" data-name="${esc(i.name)}" data-d="-1" ${q ? '' : 'disabled'}>−</button><b>${q}</b><button class="cg-mini" data-cg="tr-give" data-name="${esc(i.name)}" data-d="1" ${q < i.qty ? '' : 'disabled'}>+</button></span></li>`; }).join('') || '<li class="cg-faint">소지품이 없습니다</li>'}</ul>
                <label class="cg-trade-money">돈 <input data-tr="giveMoney" value="${trade.giveMoney ? esc(E.formatMoney(trade.giveMoney)) : ''}" placeholder="예: 2은 50동"><small>소지금 ${esc(E.formatMoney(st.money))}</small></label>
            </section>
            <section><h4>받고 싶은 것</h4>
                <ul>${trade.get.map((g, k) => `<li class="${g.qty ? 'on' : ''}"><span>${esc(g.name)}<small>${g.price ? `부른 값 ${esc(E.formatMoney(g.price))}` : fmtV(tradeVal(st, g.name))}</small></span>
                    <span class="cg-step"><button class="cg-mini" data-cg="tr-get" data-k="${k}" data-d="-1" ${g.qty ? '' : 'disabled'}>−</button><b>${g.qty}</b><button class="cg-mini" data-cg="tr-get" data-k="${k}" data-d="1">+</button></span></li>`).join('')}
                    <li class="cg-trade-add"><input data-tr="newGet" placeholder="원하는 물건 이름"><button class="cg-mini" data-cg="tr-add">추가</button></li></ul>
                <label class="cg-trade-money">돈 <input data-tr="getMoney" value="${trade.getMoney ? esc(E.formatMoney(trade.getMoney)) : ''}" placeholder="받을 돈"></label>
            </section>
        </div>
        ${tradeSumHtml(st)}
        <p class="cg-hint">${exact ? '감정 실력 덕분에 값을 정확히 압니다.' : '물건값은 어림짐작입니다 — 감정 특성이나 상인 길드 경험이 있으면 정확해집니다.'} 상대는 내 물건을 조금 깎아 보고, 제 물건은 부른 값대로 봅니다. 매력과 상인 길드 등급이 높을수록 잘 넘어오고, 흥정은 한 번만 해 볼 수 있어요. 거래는 이 창에서 바로 끝나고, GM은 다음 장면에서 이어 받습니다.</p>
        ${tradeResultHtml()}
        <div class="cg-trade-go">${trade.done ? '<button class="cg-btn cg-btn-primary" data-cg="close-modal">닫기</button>' : `<button class="cg-btn" data-cg="close-modal">그만두기</button><button class="cg-btn" data-cg="tr-haggle" ${trade.haggled ? 'disabled' : ''}>흥정하기 <small>매력</small></button><button class="cg-btn cg-btn-primary" data-cg="tr-send">제안하기</button>`}</div>
    </div>`;
}
function tradeSumHtml(st) {
    let mine = trade.giveMoney || 0, theirs = trade.getMoney || 0, unknown = false;
    for (const [n, q] of Object.entries(trade.give)) { if (!q) continue; const v = tradeVal(st, n); if (v == null) unknown = true; else mine += v * q; }
    for (const g of trade.get) { if (!g.qty) continue; const v = tradeVal(st, g.name, g.price); if (v == null) unknown = true; else theirs += v * g.qty; }
    const diff = mine - theirs;
    const lean = mine + theirs === 0 ? '' : Math.abs(diff) <= Math.max(mine, theirs) * 0.1 ? '대체로 공평' : diff > 0 ? '내 쪽이 더 많이 준다' : '상대에게 불리하다 — 흥정이 필요할 것';
    return `<div class="cg-trade-sum"><span>내 쪽 <b>${esc(E.formatMoney(mine))}</b></span><em>${unknown ? '값을 모르는 물건이 있어 가늠하기 어렵다' : esc(lean)}</em><span>상대 쪽 <b>${esc(E.formatMoney(theirs))}</b></span></div>`;
}
function tradeOffer() {
    return { with: trade.with.trim() || '상대', give: Object.entries(trade.give).filter(([, q]) => q > 0).map(([name, qty]) => ({ name, qty })), giveMoney: trade.giveMoney || 0, get: trade.get.filter(g => g.qty > 0).map(g => ({ name: g.name, qty: g.qty, price: g.price })), getMoney: trade.getMoney || 0 };
}
function tradeResultHtml() {
    const r = trade.result; if (!r) return '';
    const w0 = trade.with.trim() || '상대';
    const who = esc(w0), whoI = esc(E.josa(w0, '이', '가'));
    const msg = {
        accept: `${whoI} 고개를 끄덕인다. "좋소, 거래합시다."`,
        close: `${whoI} 망설인다. "조금만… 조금만 더 얹어 주면 생각해 보지."`,
        reject: `${whoI} 고개를 젓는다. "그건 안 되오."`,
        haggleWin: `흥정이 먹혔다 — ${whoI} 한발 물러선다.`,
        haggleLose: `흥정이 통하지 않았다 — ${who}의 표정이 굳는다.`,
        done: `거래 성사 — ${esc(r.summary || '물건과 돈이 오갔습니다.')}`,
    }[r.k];
    return `<div class="cg-trade-res ${r.k}">${msg}${r.k === 'close' || r.k === 'reject' ? `<small>${E.appraiseExact(cur.state) ? `대략 ${esc(E.formatMoney(r.short))} 어치가 모자라 보인다.` : '무언가 더 얹어야 할 것 같다.'}</small>` : ''}${r.roll ? `<small>매력 판정 ${r.roll.d20}${r.roll.mod >= 0 ? '+' : ''}${r.roll.mod} = ${r.roll.total} vs ${r.roll.dc} — ${esc(r.roll.tier)}</small>` : ''}</div>`;
}
async function proposeTrade() {
    const st = cur.state;
    const o = tradeOffer();
    if (!o.give.length && !o.giveMoney && !o.get.length && !o.getMoney) { toastr?.info?.('주고받을 것을 골라 주세요.', '왕관과 길드'); return; }
    if (o.giveMoney > st.money) { toastr?.warning?.('소지금이 모자랍니다.', '왕관과 길드'); return; }
    const j = E.tradeJudge(st, o, { haggle: trade.haggle || 0, tries: trade.tries || 0 });
    if (j.verdict !== 'accept') { trade.tries = (trade.tries || 0) + 1; trade.result = { k: j.verdict, short: j.short }; renderModal(); return; }
    const lines = E.offerLines(o);
    await addManual(lines, `방금 ${E.josa(o.with || '상대', '과', '와')} 거래가 성사됐다 — 플레이어가 준 것: ${o.give.map(g => `${g.name}×${g.qty}`).concat(o.giveMoney ? [E.formatMoney(o.giveMoney)] : []).join(', ') || '없음'} / 받은 것: ${o.get.map(g => `${g.name}×${g.qty}`).concat(o.getMoney ? [E.formatMoney(o.getMoney)] : []).join(', ') || '없음'}. 확장이 이미 반영했으니 <변동>에 다시 적지 말고, 다음 장면에서 자연스럽게 이어 묘사만.`);
    trade.result = { k: 'done', summary: `준 것: ${o.give.map(g => `${g.name}×${g.qty}`).concat(o.giveMoney ? [E.formatMoney(o.giveMoney)] : []).join(', ') || '없음'} · 받은 것: ${o.get.map(g => `${g.name}×${g.qty}`).concat(o.getMoney ? [E.formatMoney(o.getMoney)] : []).join(', ') || '없음'}` };
    trade.done = true;
    renderModal();
}
function haggleTrade() {
    if (trade.haggled) return;
    const st = cur.state;
    const r = E.rollCheck(st, '매력', 12, Math.random, '흥정');
    trade.haggled = true;
    const h = { 대성공: 0.18, 성공: 0.1, '부분 성공': 0.05 }[r.tier] || 0;
    const good = h > 0;
    if (good) trade.haggle = h; else trade.tries = (trade.tries || 0) + 1;
    trade.result = { k: good ? 'haggleWin' : 'haggleLose', roll: { d20: r.d20, mod: r.mod + (r.bonus || 0), total: r.total, dc: 12, tier: r.tier } };
    renderModal();
}

function shopBuyHtml(st, shopName) {
    const shop = E.SHOPS[shopName];
    if (!shop) return '';
    return `<p class="cg-hint cg-pad">${esc(shop.desc)}${E.statMod(st.stats.매력) ? ` · 매력 보정 ${E.statMod(st.stats.매력) > 0 ? '-' : '+'}${Math.abs(E.statMod(st.stats.매력) * 3)}%` : ''}</p>
    <ul class="cg-goods">${shop.items.map(([name, base, cat, slot, desc]) => {
        const price = E.buyPrice(st, base);
        const own = st.items.find(i => i.name === name)?.qty || 0;
        return `<li><div class="cg-gname"><b>${esc(name)}</b><small>${esc(cat)}${slot && E.SLOT_LABEL[slot] !== cat ? ` · ${E.SLOT_LABEL[slot]} 칸` : ''}${desc ? ` · ${esc(desc)}` : ''}${own ? ` · 보유 ${own}` : ''}</small></div>
            <span class="cg-price">${esc(E.formatMoney(price))}</span>
            ${cart[name] ? `<span class="cg-incart">담음 ${cart[name].qty}</span>` : ''}<button class="cg-btn" data-cg="cart-add" data-name="${esc(name)}" data-price="${price}">담기</button></li>`;
    }).join('')}</ul>`;
}

function shopBooksHtml(st) {
    const rows = [];
    for (const cls of Object.keys(st.classes)) {
        for (const [n, t, from, d] of E.SKILL_TREE[cls]) {
            if (t > 2 || st.cskills[n] || E.findSkill(n)?.taboo || E.findSkill(n)?.aff || E.findSkill(n)?.elem === '어둠') continue;
            const el = E.findSkill(n)?.elem;
            const price = E.buyPrice(st, E.BOOK_PRICE[t]);
            const owned = st.items.some(i => E.findSkill(i.name)?.name === n && /^교본/.test(i.name));
            const pre = !from || st.cskills[from];
            rows.push(`<li><div class="cg-gname"><b>교본: ${esc(n)}</b><small>${esc(cls)} ${E.SKILL_TIER_NAME[t]}${el ? ` · ${el}${E.hasAffinity(st, el) ? '(적성)' : ''}` : ''} · ${esc(d)}${from ? ` · 선행: ${esc(from)}${pre ? '' : ' (아직 모름)'}` : ''}${owned ? ' · 보유 중' : ''}</small></div>
                <span class="cg-price">${esc(E.formatMoney(price))}</span>
                <button class="cg-btn" data-cg="cart-add" data-one="1" data-name="${esc(`교본: ${n}`)}" data-price="${price}" ${owned || cart[`교본: ${n}`] ? 'disabled' : ''}>${cart[`교본: ${n}`] ? '담음' : '담기'}</button></li>`);
        }
    }
    return `<p class="cg-hint cg-pad">제도의 서점 「양피지와 잉크」. 익힌 클래스의 기초·중급 교본만 구할 수 있습니다. 상급은 스승에게, 비전은 깨달음으로만.</p>
    ${rows.length ? `<ul class="cg-goods">${rows.join('')}</ul>` : '<p class="cg-hint">지금 살 만한 교본이 없습니다.</p>'}`;
}

function shopSellHtml(st) {
    if (!st.items.length) return '<p class="cg-hint cg-pad">팔 물건이 없습니다.</p>';
    return `<p class="cg-hint cg-pad">값을 아는 물건은 바로 팔 수 있고, 처음 보는 물건은 주인과 흥정해야 합니다(입력창에 행동이 들어갑니다).</p>
    <ul class="cg-goods">${st.items.map(i => {
        const price = E.sellPrice(st, i.name);
        const slot = E.equipSlotOf(i.name, st);
        const equipped = slot && st.equip[slot] === i.name && i.qty <= 1;
        return `<li><div class="cg-gname"><b>${esc(i.name)}</b><small>보유 ${i.qty}${equipped ? ' · 장착 중' : ''}</small></div>
            <span class="cg-price">${price !== null ? esc(E.formatMoney(price)) : '—'}</span>
            ${equipped ? '<button class="cg-btn" disabled>장착 중</button>'
            : price !== null ? `<button class="cg-btn" data-cg="sell" data-name="${esc(i.name)}" data-price="${price}">팔기</button>`
                : `<button class="cg-btn" data-cg="haggle" data-name="${esc(i.name)}">흥정</button>`}</li>`;
    }).join('')}</ul>`;
}

function boardHtml(st, type) {
    const seed = String(ctx().getCurrentChatId?.() || ctx().chatId || '');
    const list = E.generateBoard(st, type, seed);
    const full = st.quests.length >= E.maxQuests(st) || (type === 'adventurer' && E.isSuspended(st));
    if (!list.length) return '<p class="cg-hint cg-pad">오늘은 붙은 의뢰가 없습니다. 내일 다시 와 보세요.</p>';
    return `${type === 'adventurer' && E.isSuspended(st) ? `<p class="cg-hint cg-pad cg-warn-text">경고 ${st.strikes.length}회로 자격 정지 중입니다. 경고를 지우기 전까지는 의뢰를 받을 수 없어요.</p>` : full ? `<p class="cg-hint cg-pad cg-warn-text">진행 중인 의뢰가 ${st.quests.length}개입니다. 더 받으려면 먼저 하나를 끝내세요.</p>` : ''}
    <div class="cg-notices">${list.map((q, i) => `
        <article class="cg-notice ${q.eligible ? '' : 'locked'} ${q.kind === '긴급' ? 'urgent' : q.kind === '지명' ? 'named' : ''}">
            <span class="cg-npin"></span>
            <div class="cg-nrank">${esc(q.rank)}</div>
            ${q.kind ? `<em class="cg-nkind">${esc(q.kind)}</em>` : ''}<h4>${esc(q.name.replace(/^\[(긴급|지명)\]\s*/, ''))}</h4>
            <p>${esc(q.desc)}</p>
            <dl><dt>의뢰인</dt><dd>${esc(q.client)}</dd><dt>장소</dt><dd>${esc(q.place)}</dd><dt>기한</dt><dd>${q.days}일</dd>
            <dt>보수</dt><dd><b>${esc(E.formatMoney(q.net))}</b>${q.org === 'adventurer' ? (q.kind === '긴급' ? ' <small>(수수료 면제)</small>' : ' <small>(수수료 1할 제외)</small>') : ''}</dd>
            ${q.merit ? `<dt>공적</dt><dd>+${q.merit}</dd>` : ''}<dt>경험</dt><dd>+${q.exp}</dd></dl>
            <button class="cg-btn ${q.eligible && !full ? 'cg-btn-primary' : ''}" data-cg="accept" data-type="${type}" data-i="${i}" ${!q.eligible || full ? 'disabled' : ''}>${q.eligible ? '수주' : '등급 부족'}</button>
        </article>`).join('')}</div>`;
}

/* 장바구니 — 담아 두고 한 번에 결제 */
let cart = {}, cartLoc = null;
function cartHtml(st) {
    const rows = Object.entries(cart);
    const total = rows.reduce((a, [, c]) => a + c.price * c.qty, 0);
    if (!rows.length) return `<div class="cg-cart is-empty"><b>장바구니</b><small>비어 있습니다 — 물건 옆 '담기'를 누르세요.</small></div>`;
    const left = st.money - total;
    return `<div class="cg-cart"><div class="cg-cart-h"><b>장바구니 <small>${rows.reduce((a, [, c]) => a + c.qty, 0)}개</small></b><button class="cg-mini" data-cg="cart-clear">비우기</button></div>
        <ul>${rows.map(([n, c]) => `<li><span>${esc(n)}</span>
            <span class="cg-cart-q">${c.one ? '' : `<button class="cg-ab" data-cg="cart-q" data-name="${esc(n)}" data-d="-1">−</button>`}<b>${c.qty}</b>${c.one ? '' : `<button class="cg-ab" data-cg="cart-q" data-name="${esc(n)}" data-d="1">+</button>`}</span>
            <em>${esc(E.formatMoney(c.price * c.qty))}</em><button class="cg-x-mini" data-cg="cart-q" data-name="${esc(n)}" data-d="-999" title="빼기">✕</button></li>`).join('')}</ul>
        <div class="cg-cart-f"><span>합계 <b>${esc(E.formatMoney(total))}</b></span><span class="${left < 0 ? 'cg-bad' : ''}">결제 후 ${left < 0 ? `${esc(E.formatMoney(-left))} 모자람` : esc(E.formatMoney(left))}</span>
            <button class="cg-btn cg-btn-primary" data-cg="cart-pay" ${left < 0 ? 'disabled' : ''}>결제하기</button></div></div>`;
}
async function cartPay() {
    const st = cur.state, rows = Object.entries(cart);
    if (!st || !rows.length) return;
    const total = rows.reduce((a, [, c]) => a + c.price * c.qty, 0);
    if (st.money < total) { toastr?.warning?.('돈이 모자랍니다.', '왕관과 길드'); return; }
    await addManual([`돈 -${E.formatMoney(total)}`, ...rows.map(([n, c]) => `아이템 +${n} ${c.qty}`)], `상점에서 ${rows.map(([n, c]) => `「${n}」${c.qty > 1 ? ` ×${c.qty}` : ''}`).join(', ')} 구입 (합계 ${E.formatMoney(total)})`);
    toastr?.success?.(`${rows.length}종 · 합계 ${E.formatMoney(total)} 결제`, '왕관과 길드', { timeOut: 2000 });
    cart = {};
    renderModal();
}
async function doBuy(name, price) {
    const st = cur.state;
    if (!st || st.money < price) { toastr?.warning?.('돈이 모자랍니다.', '왕관과 길드'); return; }
    await addManual([`돈 -${E.formatMoney(price)}`, `아이템 +${name} 1`], `상점에서 「${name}」 구입 (${E.formatMoney(price)})`);
    renderModal();
}
async function doSell(name, price) {
    await addManual([`아이템 -${name} 1`, `돈 +${E.formatMoney(price)}`], `상점에 「${name}」 판매 (${E.formatMoney(price)})`);
    renderModal();
}
async function doAccept(type, i) {
    const st = cur.state;
    const seed = String(ctx().getCurrentChatId?.() || ctx().chatId || '');
    const q = E.generateBoard(st, type, seed)[i];
    if (!q) return;
    if (st.quests.length >= E.maxQuests(st)) return;
    await addManual([E.questOpLine(q)], `의뢰판에서 「${q.name}」(${q.rank}) 수주 — 의뢰인 ${q.client}, ${q.place}. 내용: ${q.desc}`);
    toastr?.success?.(`「${q.name}」 의뢰를 받았습니다.`, '왕관과 길드');
    renderModal();
}

/* ───────────────────────── 캐릭터 생성 창 ───────────────────────── */

const STEPS = ['난이도', '출신', '인물', '배경·진로', '클래스·기술', '능력치', '확인'];
let cf = null; // 생성 폼 상태
let cstep = 0;

function newForm() {
    return {
        difficulty: 'normal', origin: 'native', perks: [],
        name: '', gender: '', age: '', race: '인간',
        appearance: { height: '', hair: '', eyes: '', impression: '', marks: '', outfit: '', free: '' },
        personality: '', background: '농민', job: '모험가', craft: '', location: '', goal: '', story: '', extraItem: '',
        alloc: Object.fromEntries(E.STATS.map(s => [s, 0])),
        cls: '전사', clsTouched: false, life: [], focus: '', affMode: 'auto', affinity: [], compSpecies: '', compName: '', compTerms: '',
        startNow: true,
        aging: true,
        famMode: 'existing', family: { house: '에른스트 백작가', name: '', title: '남작', birth: '1', region: '제도 근교', faction: '중립', siblings: '' },
    };
}

function poolSize() {
    const D = E.DIFFICULTY[cf.difficulty];
    return Math.round((D.points + (E.RACES[cf.race]?.free || 0) + (cf.origin === 'native' ? 1 : 0)) * 2.5);
}
const usedPoints = () => Object.values(cf.alloc).reduce((a, b) => a + b, 0);
const ALLOC_MAX = 20;
const finalStat = (s) => 10 + (cf.alloc[s] || 0) + (E.RACES[cf.race]?.bonus?.[s] || 0) * 3;
const showStat = (s) => finalStat(s);
const perkSlots = () => E.DIFFICULTY[cf.difficulty].perks[cf.origin] ?? 0;

function openCreator() {
    if (!ctx().chat?.length && !ctx().getCurrentChatId?.()) { toastr?.warning?.('먼저 채팅을 여세요.', '왕관과 길드'); return; }
    cf = newForm();
    cstep = 0;
    let ov = document.getElementById('cg-creator');
    if (!ov) {
        ov = document.createElement('div');
        ov.id = 'cg-creator';
        ov.className = 'cg-root';
        document.body.appendChild(ov);
    }
    ov.classList.add('cg-open');
    renderCreator();
}
function closeCreator() { document.getElementById('cg-creator')?.classList.remove('cg-open'); }

function field(label, key, ph = '', sub = null) {
    const v = sub ? cf[sub][key] : cf[key];
    return `<label class="cg-f"><span>${label}</span><input data-cf="${sub ? sub + '.' : ''}${key}" value="${esc(v)}" placeholder="${esc(ph)}"></label>`;
}

function renderCreator() {
    const ov = document.getElementById('cg-creator');
    if (!ov) return;
    // 출신이 바뀌면 특전/배경 정리
    if (cf.perks.length > perkSlots()) cf.perks = cf.perks.slice(0, perkSlots());
    while (usedPoints() > poolSize()) { const s = E.STATS.find(k => cf.alloc[k] > 0); if (!s) break; cf.alloc[s]--; }

    const steps = STEPS.map((s, i) => `<li class="${i === cstep ? 'on' : i < cstep ? 'done' : ''}" data-cg="cstep" data-step="${i}"><i>${['Ⅰ', 'Ⅱ', 'Ⅲ', 'Ⅳ', 'Ⅴ', 'Ⅵ', 'Ⅶ'][i]}</i><span>${s}</span></li>`).join('');
    const body = [cStepDiff, cStepOrigin, cStepPerson, cStepBg, cStepClass, cStepStats, cStepConfirm][cstep]();
    ov.dataset.diff = cf.difficulty;
    // 같은 단계 안에서 고를 때는 스크롤 위치를 그대로 (단계를 넘길 때만 맨 위로)
    const prevBody = ov.querySelector('.cg-cr-body'), keepTop = prevBody && ov.dataset.step === String(cstep) ? prevBody.scrollTop : 0;
    ov.dataset.step = String(cstep);
    ov.innerHTML = `
    <div class="cg-cr-win">
        <header class="cg-cr-head">
            <div class="cg-cr-title">${ICON.crest}<div><em class="cg-en">Adventurer Registry</em><b>모험가 등록부</b><small>아스텔 제국 · 제도 루미에른</small></div></div>
            <button class="cg-x" data-cg="close-creator" title="닫기">${ICON.close}</button>
        </header>
        <ol class="cg-cr-steps">${steps}</ol>
        <div class="cg-cr-body">${body}</div>
        <footer class="cg-cr-foot">
            <button class="cg-btn" data-cg="cprev" ${cstep === 0 ? 'disabled' : ''}>이전</button>
            <span class="cg-cr-note">${footNote()}</span>
            ${cstep < STEPS.length - 1 ? '<button class="cg-btn cg-btn-primary" data-cg="cnext">다음</button>' : '<button class="cg-btn cg-btn-primary" data-cg="create">등록하고 시작</button>'}
        </footer>
    </div>`;
    { const nb = ov.querySelector(".cg-cr-body"); if (nb) nb.scrollTop = keepTop; }
}

function footNote() {
    if (cstep === 2 && !cf.name.trim()) return '이름은 꼭 정해 주세요.';
    if (cstep === 5) return `남은 포인트 ${poolSize() - usedPoints()}`;
    if (cstep === 4) return `생활 기술 ${cf.life.length} / 2`;
    return '';
}

function cards(items, key, opts = {}) {
    return `<div class="cg-cards ${opts.cls || ''}">${items.map(([val, title, desc, extra]) => `
        <button class="cg-card ${cf[key] === val ? 'on' : ''}" data-cg="pick" data-key="${key}" data-val="${esc(val)}">
            <b>${esc(title)}</b>${extra ? `<em>${esc(extra)}</em>` : ''}<span>${esc(desc)}</span>
        </button>`).join('')}</div>`;
}

function cStepDiff() {
    return `<h3 class="cg-cr-q">어떤 세계에서 시작할까요?</h3>
    ${cards(Object.entries(E.DIFFICULTY).map(([k, d]) => [k, d.label, d.desc, d.sub]), 'difficulty', { cls: 'cg-cards-3 cg-diff-cards' })}
    <ul class="cg-diff-facts">
        <li>능력치 포인트 <b>${E.DIFFICULTY[cf.difficulty].points}</b></li>
        <li>판정 보정 <b>${E.DIFFICULTY[cf.difficulty].rollBonus >= 0 ? '+' : ''}${E.DIFFICULTY[cf.difficulty].rollBonus}</b></li>
        <li>승급에 필요한 공적 <b>×${E.DIFFICULTY[cf.difficulty].meritMult}</b></li>
        <li>시작 자금 <b>×${E.DIFFICULTY[cf.difficulty].moneyMult}</b></li>
        <li>전이자 특전 <b>${E.DIFFICULTY[cf.difficulty].perks.transferred}개</b></li>
    </ul>`;
}

function cStepOrigin() {
    const slots = perkSlots();
    return `<h3 class="cg-cr-q">당신은 어디에서 왔나요?</h3>
    ${cards(Object.entries(E.ORIGINS).map(([k, o]) => [k, o.label, o.desc]), 'origin', { cls: 'cg-cards-3' })}
    ${slots > 0 ? `<h4 class="cg-cr-sub">이세계 특전 <small>${cf.perks.length} / ${slots}개 선택</small></h4>
    <div class="cg-perks">${Object.entries(E.PERKS).map(([k, d]) => `<button class="cg-perk ${cf.perks.includes(k) ? 'on' : ''}" data-cg="perk" data-val="${esc(k)}"><b>${esc(k)}</b><span>${esc(d)}</span></button>`).join('')}</div>`
            : cf.origin !== 'native' ? `<p class="cg-hint">이 난이도에서 ${E.ORIGINS[cf.origin].label}는 특전 없이 시작합니다.${cf.origin === 'transferred' ? ' (언어 이해만 기본으로 주어집니다)' : ''}</p>` : '<p class="cg-hint">원주민은 이 세계의 상식과 연줄이 무기입니다. 능력치 포인트를 1점 더 받습니다.</p>'}`;
}

function cStepPerson() {
    return `<h3 class="cg-cr-q">어떤 사람인가요?</h3>
    <div class="cg-grid3">
        ${field('이름', 'name', '예: 리안')}
        <label class="cg-f"><span>성별</span><input data-cf="gender" list="cg-genders" value="${esc(cf.gender)}" placeholder="남성 / 여성 / 자유"><datalist id="cg-genders"><option>남성</option><option>여성</option></datalist></label>
        ${field('나이', 'age', '예: 17세')}
    </div>
    <div class="cg-chips cg-age-mode"><span class="cg-unit">세월</span><button class="cg-chip ${cf.aging !== false && cf.aging !== '0' ? 'on' : ''}" data-cg="pick" data-key="aging" data-val="1">해마다 나이를 먹는다</button><button class="cg-chip ${cf.aging === false || cf.aging === '0' ? 'on' : ''}" data-cg="pick" data-key="aging" data-val="0">나이를 먹지 않는다</button><small class="cg-hint">나이를 먹으면 아이들과 함께 늙어 가고 대를 물려주는 이야기가 됩니다. 나중에 편집 탭에서 바꿀 수 있어요.</small></div>
    <h4 class="cg-cr-sub">종족</h4>
    ${cards(Object.entries(E.RACES).map(([k, r]) => [k, k, r.desc, Object.entries(r.bonus).map(([s, v]) => `${s}${v > 0 ? '+' : ''}${v}`).join(' ') || (r.free ? `자유 포인트 +${r.free}` : '')]), 'race', { cls: 'cg-cards-5' })}
    <h4 class="cg-cr-sub">외모</h4>
    <div class="cg-grid3">
        ${field('키·체격', 'height', '예: 작고 마른 편', 'appearance')}
        ${field('머리', 'hair', '예: 허리까지 오는 은발', 'appearance')}
        ${field('눈', 'eyes', '예: 졸린 듯한 호박색', 'appearance')}
        ${field('인상', 'impression', '예: 무표정, 차가워 보임', 'appearance')}
        ${field('특징', 'marks', '예: 왼뺨의 옅은 흉터', 'appearance')}
        ${field('차림', 'outfit', '예: 낡은 회색 후드', 'appearance')}
    </div>
    <label class="cg-f"><span>그 밖의 외모 묘사</span><textarea data-cf="appearance.free" rows="2" placeholder="자유롭게">${esc(cf.appearance.free)}</textarea></label>
    <label class="cg-f"><span>성격</span><input data-cf="personality" value="${esc(cf.personality)}" placeholder="예: 겉으론 무심하지만 남의 일에 자꾸 끼어든다"></label>`;
}

function famFormHtml() {
    const F = cf.family;
    const byTitle = {};
    for (const h of E.NOBLE_HOUSES) if (h.title !== '황실' && !h.noScout) (byTitle[h.title] = byTitle[h.title] || []).push(h);
    const order = ['공작', '후작', '변경백', '백작', '자작', '남작'];
    const pickBtn = (v, l) => `<button class="cg-chip ${cf.famMode === v ? 'on' : ''}" data-cg="pick" data-key="famMode" data-val="${v}">${l}</button>`;
    const g = /여/.test(cf.gender) ? 'f' : /남/.test(cf.gender) ? 'm' : '';
    const births = E.BIRTH_ORDER.map((b, i) => `<option value="${i}" ${String(F.birth) === String(i) ? 'selected' : ''}>${esc(E.birthLabel({ birth: i }, cf.gender))}${i <= 1 ? ' — 후계자' : ''}</option>`).join('');
    return `<div class="cg-famform">
        <h4 class="cg-cr-sub">어느 가문인가요? <small>외동이나 첫째는 후계자로 시작합니다 · 성별은 앞 단계에서 정한 대로 부릅니다</small></h4>
        <div class="cg-chips">${pickBtn('existing', '제국 귀족 명부의 가문')}${pickBtn('new', '새 가문 만들기')}</div>
        ${cf.famMode === 'new' ? `<div class="cg-grid2">
            <label class="cg-f"><span>가문 이름</span><input data-cf="family.name" value="${esc(F.name)}" placeholder="예: 블랙손"></label>
            <label class="cg-f"><span>작위</span><select data-cf="family.title">${['남작', '자작', '백작', '후작', '공작'].map(t => `<option ${F.title === t ? 'selected' : ''}>${t}</option>`).join('')}</select></label>
            <label class="cg-f"><span>영지</span><select data-cf="family.region">${['제도 근교', '남부 평원', '서부 해안', '동부 산림', '잿빛 산맥', '북부'].map(t => `<option ${F.region === t ? 'selected' : ''}>${t}</option>`).join('')}</select></label>
            <label class="cg-f"><span>파벌</span><select data-cf="family.faction">${['보수파', '실용파', '중립'].map(t => `<option ${F.faction === t ? 'selected' : ''}>${t}</option>`).join('')}</select></label>
        </div>` : `<label class="cg-f"><span>가문</span><select data-cf="family.house">${order.filter(t => byTitle[t]).map(t => `<optgroup label="${t}가">${byTitle[t].map(h => `<option value="${esc(h.name)}" ${F.house === h.name ? 'selected' : ''}>${esc(h.name)} — ${esc(h.region)} · ${esc(h.faction)} · ${esc(h.trait)}</option>`).join('')}</optgroup>`).join('')}</select></label>`}
        <div class="cg-grid2">
            <label class="cg-f"><span>몇째인가요?</span><select data-cf="family.birth">${births}</select></label>
            <label class="cg-f"><span>형제자매 (선택)</span><input data-cf="family.siblings" value="${esc(F.siblings)}" placeholder="예: 오빠 레온(후계자), 여동생 미라"></label>
        </div>
    </div>`;
}
function cStepBg() {
    const bgs = Object.entries(E.BACKGROUNDS).filter(([, b]) => !b.transferredOnly && (!b.races || b.races.includes(cf.race))).sort((a, b) => (b[1].races ? 1 : 0) - (a[1].races ? 1 : 0));
    if (E.BACKGROUNDS[cf.background]?.races && !E.BACKGROUNDS[cf.background].races.includes(cf.race)) cf.background = '농민';
    const goals = ['S등급 모험가', '거상이 되기', '귀족 작위', '기사 서임', '대마도사', '명장', '성녀·성자', '조용히 먹고살기', '원래 세계로 돌아가기'];
    return `${cf.origin === 'transferred'
        ? `<h3 class="cg-cr-q">넘어올 때 지니고 있던 것</h3><p class="cg-hint">전이자는 신분도 연줄도 없는 이방인으로 시작합니다.</p>${field('주머니 속 물건 하나', 'extraItem', '예: 배터리 32%인 스마트폰, 볼펜, 사탕 한 봉지')}`
        : `<h3 class="cg-cr-q">어디서 자랐나요?</h3>${cards(bgs.map(([k, b]) => [k, b.label, b.desc, b.family ? '귀족' : E.NOBLE[b.noble]]), 'background', { cls: 'cg-cards-4' })}${cf.background === '귀족가' ? famFormHtml() : ''}`}
    <h4 class="cg-cr-sub">첫 진로 <small>어느 조직에 몸담고 시작할지 · 전투 클래스는 다음 단계에서</small></h4>
    ${cards(Object.entries(E.JOBS).map(([k, j]) => [k, k === '기사지망' ? '기사 지망' : k, j.desc, j.org ? E.ORGS[j.org].ranks[0] : '무소속']), 'job', { cls: 'cg-cards-4' })}
    ${cf.job === '장인' ? field('제작 분야', 'craft', '예: 대장장이 / 연금술 / 재봉 / 목공 / 요리') : ''}
    <div class="cg-grid2">
        <label class="cg-f"><span>시작 장소</span><select data-cf="location"><option value="">자동 (${cf.origin === 'transferred' ? '흑림 가장자리' : '제도 · 길드 대로'})</option>${E.START_LOCS.map(l => `<option ${cf.location === l ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select></label>
        <label class="cg-f"><span>목표</span><input data-cf="goal" list="cg-goals" value="${esc(cf.goal)}" placeholder="무엇이 되고 싶나요?"><datalist id="cg-goals">${goals.map(g => `<option>${g}</option>`).join('')}</datalist></label>
    </div>
    <label class="cg-f"><span>사연 (선택)</span><textarea data-cf="story" rows="3" placeholder="${cf.origin === 'reincarnated' ? '전생에는 어떤 사람이었나요? 이 세계에서는 어떻게 자랐나요?' : cf.origin === 'transferred' ? '원래 세계에서는 어떤 사람이었나요? 어떻게 넘어왔나요?' : '어떤 일을 겪어 왔나요?'}">${esc(cf.story)}</textarea></label>`;
}

function cStepClass() {
    const needAff = E.NEEDS_AFFINITY.includes(cf.cls);
    const affMode = needAff && cf.affMode === 'none' ? 'auto' : cf.affMode;
    const lifeGroups = {};
    for (const [k, v] of Object.entries(E.LIFE)) (lifeGroups[v.group] = lifeGroups[v.group] || []).push([k, v]);
    return `<h3 class="cg-cr-q">어떻게 싸우나요? <small>전투 클래스 · 나중에 다른 클래스를 배우고 바꿀 수 있습니다</small></h3>
    <div class="cg-cards cg-cards-5">${Object.entries(E.CLASSES).map(([k, c]) => `
        <button class="cg-card ${cf.cls === k ? 'on' : ''}" data-cg="pickcls" data-val="${esc(k)}">
            <em class="cg-en">${esc(c.en)}</em><b>${esc(k)}</b><em>${esc(c.role)}</em>${rareBadge(k)}<span>${esc(c.desc)}</span>
            <span class="cg-card-meta">주 능력치 ${esc(c.stats.join('·'))} · ${esc(c.weapon)}</span>
        </button>`).join('')}</div>
    <div class="cg-cls-preview">${(() => { const { groups, magic } = skillGroups(cf.cls); return `<b>${esc(cf.cls)}의 기술 계보</b> <small class="cg-faint">처음엔 기초 기술만 알고, 나머지는 교본·스승·깨달음으로 익힙니다${magic ? ' · 속성 기초는 적성 속성만' : ''}</small><ul class="cg-prev-br">${groups.map(g => { const st = E.BRANCHES[cf.cls]?.[g.key]; return `<li><span class="cg-prev-k">${g.elem ? elemChip(g.elem) : ''}<b>${esc(g.aff ? '깃든 속성' : g.key === '무속성' ? (cf.cls === '마법사' ? '무속성' : E.hasPath(cf.cls) ? '공통' : '기술') : cf.cls === '정령술사' ? `${g.key}의 정령` : cf.cls === '도적' && g.key === '어둠' ? '그림자술' : g.key)}</b>${st ? `<small>${esc(st[0])}</small>` : g.aff ? '<small>적성이 있을 때만</small>' : ''}</span><span class="cg-prev-s">${[1, 2, 3, 4].map(t => g.items.filter(x => x[1] === t).map(x => `<i class="t${t}">${esc(x[0])}</i>`).join('')).filter(Boolean).join('<em>›</em>')}</span></li>`; }).join('')}</ul>`; })()}</div>
    <div class="cg-rare-note">${rareBadge(cf.cls)}<span><b>${esc(cf.cls)}</b> — ${esc(E.RARITY[E.classRarity(cf.cls)][1])}</span></div>
    <h4 class="cg-cr-sub">적성 속성 <small>타고난 마력의 결 · ${E.maxAffinity(cf.difficulty)}개까지 · ${needAff ? `${esc(cf.cls)}는 적성이 있어야 발현합니다` : '일반 직업은 대부분 무속성입니다'}</small></h4>
    <div class="cg-aff-pick">
        <button class="cg-lchip ${affMode === 'auto' ? 'on' : ''}" data-cg="affauto">마력 측정에 맡기기</button>
        ${needAff ? '' : `<button class="cg-lchip ${affMode === 'none' ? 'on' : ''}" data-cg="affnone"><span class="cg-el cg-el-무">무</span> 무속성</button>`}
        ${E.ELEMENTS.map(e => `<button class="cg-lchip cg-el-pick cg-el-${e} ${affMode === 'pick' && cf.affinity.includes(e) ? 'on' : ''}" data-cg="pickaff" data-val="${e}" title="${esc(E.ELEM_DESC[e])}">${e}</button>`).join('')}
    </div>
    <p class="cg-hint">${affMode === 'auto' ? `모험가 길드 등록 때 마력 측정구에 손을 얹으면 정해집니다. 이 이름의 ${esc(cf.cls)}라면 → <b class="cg-aff-res">${E.measureAffinityFor(cf.name || '이름 없는 자', cf.cls, cf.difficulty).join(' · ') || '무속성'}</b> (이름이나 클래스가 바뀌면 결과도 바뀝니다)`
        : affMode === 'none' ? '속성 마력 없이 순수한 무기술과 몸으로 싸웁니다. 일반 직업에서는 가장 흔한 경우입니다.'
        : esc(cf.affinity.map(e => `${e}: ${E.ELEM_DESC[e]}`).join(' / ')) + (needAff ? '' : ` — ${esc(cf.cls)}이지만 적성이 있어 기술과 힘에 이 속성이 깃듭니다.`)}${(affMode === 'pick' && cf.affinity.includes('어둠')) ? ' · 어둠 적성은 남에게 알려지면 교회의 의심을 삽니다.' : ''}</p>
    ${E.STARTER_COMPANIONS[cf.cls] ? `<h4 class="cg-cr-sub">첫 동반자 <small>${cf.cls === '정령술사' ? '처음 교감한 정령' : cf.cls === '소환사' ? '처음 계약한 이계의 존재' : '처음 길들인 짐승'}</small></h4>
    <div class="cg-aff-pick">${E.STARTER_COMPANIONS[cf.cls].map(([sp, el]) => `<button class="cg-lchip ${cf.compSpecies === sp ? 'on' : ''}" data-cg="pickcomp" data-val="${esc(sp)}">${esc(sp)}${cf.cls === '정령술사' && E.RARE_SPIRITS.includes(el) ? ' <small class="cg-rare-tag">희귀</small>' : el && cf.cls !== '정령술사' ? ` · ${el}` : ''}</button>`).join('')}</div>
    <div class="cg-grid2" style="margin-top:10px">${field('이름', 'compName', '비워 두면 자동')}${cf.cls === '소환사' ? field('계약 조건', 'compTerms', '예: 매일 단것 하나를 바친다') : ''}</div>` : ''}
    <h4 class="cg-cr-sub">처음부터 지닌 강점 <small>선택 · 같은 ${esc(cf.cls)}라도 사람마다 잘하는 분야가 다릅니다 · 비워 두면 플레이하며 저절로 생깁니다</small></h4>
    <div class="cg-focus-pick">${(E.FOCUS_HINTS[cf.cls] || []).map(f => `<button class="cg-lchip ${cf.focus === f ? 'on' : ''}" data-cg="pickfocus" data-val="${esc(f)}">${esc(f)}</button>`).join('')}
        <input data-cf="focus" value="${esc(E.FOCUS_HINTS[cf.cls]?.includes(cf.focus) ? '' : cf.focus)}" placeholder="직접 적기 (예: 은신 저격)"></div>
    <h4 class="cg-cr-sub">생활 기술 <small>처음부터 익히고 있던 것 2개까지 · F랭크에서 시작 · 나머지도 이야기 속에서 배울 수 있습니다</small></h4>
    ${Object.entries(lifeGroups).map(([g, list]) => `<div class="cg-life-pick"><span>${esc(g)}</span>${list.map(([k, v]) => `<button class="cg-lchip ${cf.life.includes(k) ? 'on' : ''}" data-cg="picklife" data-val="${esc(k)}" title="${esc(v.desc)}">${esc(k)}</button>`).join('')}</div>`).join('')}`;
}

function cStepStats() {
    const left = poolSize() - usedPoints();
    const rb = E.RACES[cf.race]?.bonus || {};
    return `<h3 class="cg-cr-q">능력치 배분 <small>기본 10 · 능력치당 최대 +20 · 시작은 10~20대, 30이면 초보 모험가 수준</small></h3>
    <div class="cg-pool"><b>${left}</b><span>남은 포인트 / ${poolSize()}</span><button class="cg-btn" data-cg="alloc-reset">초기화</button><button class="cg-btn" data-cg="alloc-auto">클래스에 맞게 자동</button></div>
    <div class="cg-alloc">${E.STATS.map(s => {
        const v = showStat(s), m = E.statMod(v);
        return `<div class="cg-arow">
            <div class="cg-aname"><b>${s}</b><small>${esc(E.STAT_DESC[s])}</small></div>
            <button class="cg-ab" data-cg="alloc" data-stat="${s}" data-d="-1" ${cf.alloc[s] <= 0 ? 'disabled' : ''}>−</button>
            <div class="cg-aval"><b>${v}</b>${rb[s] ? `<em>${rb[s] > 0 ? '+' : ''}${rb[s] * 3} 종족</em>` : ''}<small>${m >= 0 ? '+' : ''}${m}</small></div>
            <button class="cg-ab" data-cg="alloc" data-stat="${s}" data-d="1" ${left <= 0 || cf.alloc[s] >= ALLOC_MAX ? 'disabled' : ''}>+</button>
            <button class="cg-ab cg-ab5" data-cg="alloc" data-stat="${s}" data-d="5" ${left <= 0 || cf.alloc[s] >= ALLOC_MAX ? 'disabled' : ''}>+5</button>
        </div>`;
    }).join('')}</div>
    <p class="cg-hint">10대가 평범한 사람, 30이 초보 모험가, 60이 이름난 실력자, 100이 인간의 한계입니다(큰 사건으로 한계를 넘으면 200 · 500 · 999까지). 판정은 d20 + 능력 보정(15 기준 8마다 ±1)으로 굴립니다. 체력은 HP, 지능은 MP를 정합니다. 레벨이 오를 때마다 능력 포인트 5점을 받습니다.</p>`;
}

function formToCreate() {
    const comps = E.STARTER_COMPANIONS[cf.cls];
    return {
        ...cf,
        affinity: cf.affMode === 'pick' ? cf.affinity : [],
        affNone: cf.affMode === 'none',
        companion: comps ? { species: cf.compSpecies || comps[0][0], name: cf.compName, terms: cf.compTerms } : null,
        stats: Object.fromEntries(E.STATS.map(s => [s, finalStat(s)])), statScale: 2,
        family: cf.background === '귀족가' ? { ...cf.family, mode: cf.famMode } : null,
        aging: cf.aging !== false && cf.aging !== '0',
    };
}

function cStepConfirm() {
    const st = E.createState(formToCreate());
    const p = st.profile;
    return `<h3 class="cg-cr-q">등록부 확인</h3>
    <div class="cg-confirm">
        <div class="cg-idcard">
            <div class="cg-id-top"><span class="cg-diff cg-diff-${st.difficulty}">${E.DIFFICULTY[st.difficulty].label}</span><span class="cg-id-origin">${esc(E.ORIGINS[p.origin].label)} · ${esc(p.race)}</span></div>
            <h2>${esc(p.name)}</h2>
            <div class="cg-id-sub">${esc([p.gender, `${E.ageOf(st)}살${st.aging ? '' : ' (멈춤)'}`].filter(Boolean).join(' · '))}</div>
            <dl class="cg-id-grid">
                <dt>신분</dt><dd>${esc(E.statusLabel(st))}</dd>
                <dt>직업</dt><dd>${esc(st.mainJob)}</dd>
                <dt>소지금</dt><dd>${esc(E.formatMoney(st.money))}</dd>
                <dt>시작</dt><dd>${esc(st.location)}</dd>
            </dl>
        </div>
        <div class="cg-confirm-r">
            <div class="cg-stats">${E.STATS.map(s => `<div class="cg-stat"><span>${s}</span><b>${st.stats[s]}</b><small>${E.statMod(st.stats[s]) >= 0 ? '+' : ''}${E.statMod(st.stats[s])}</small></div>`).join('')}</div>
            <dl class="cg-dl">
                <dt>HP / MP</dt><dd>${st.hp} / ${st.mp}</dd>
                <dt>적성</dt><dd>${st.affinity.map(elemChip).join(' ') || '<span class="cg-el cg-el-무">무</span> 무속성'}</dd>
                ${st.companions.length ? `<dt>동반자</dt><dd>${esc(st.companions[0].name)} (${esc(st.companions[0].species)})</dd>` : ''}
                <dt>클래스</dt><dd>${esc(st.cls)} Lv 1${Object.keys(st.classes[st.cls].focus || {}).length ? ` · 강점 ${esc(Object.keys(st.classes[st.cls].focus)[0])}` : ''}</dd>
                ${Object.keys(st.life).length ? `<dt>생활 기술</dt><dd>${esc(Object.keys(st.life).join(', '))} (F)</dd>` : ''}
                <dt>배경</dt><dd>${esc(E.BACKGROUNDS[p.background].label)}</dd>
                <dt>소지품</dt><dd>${esc(st.items.map(i => i.name + (i.qty > 1 ? ' ×' + i.qty : '')).join(', '))}</dd>
                ${st.skills.length ? `<dt>스킬</dt><dd>${esc(st.skills.map(s => s.name).join(', '))}</dd>` : ''}
                ${[...(p.perksFree || []), ...p.perks].length ? `<dt>특전</dt><dd>${esc([...(p.perksFree || []), ...p.perks].join(', '))}</dd>` : ''}
                ${p.goal ? `<dt>목표</dt><dd>${esc(p.goal)}</dd>` : ''}
            </dl>
        </div>
    </div>
    <label class="cg-check-opt"><input type="checkbox" data-cf="startNow" ${cf.startNow ? 'checked' : ''}> 등록하면 바로 프롤로그를 요청합니다</label>
    ${base() ? '<p class="cg-hint cg-warn-text">이 채팅에는 이미 캐릭터가 있습니다. 등록하면 지금 시점부터 새 캐릭터로 바뀝니다.</p>' : ''}`;
}

function autoAlloc() {
    const pri = {
        모험가: ['근력', '체력', '민첩', '감각'], 상인: ['매력', '지능', '행운'], 기사지망: ['근력', '체력', '정신'],
        마법사: ['지능', '정신', '감각'], 장인: ['민첩', '지능', '근력'], 신관: ['정신', '매력', '지능'], 자유인: ['민첩', '행운', '매력'],
    }[cf.job] || E.STATS;
    const cpri = E.CLASSES[cf.cls]?.stats || [];
    pri.splice(0, 0, ...cpri.filter(x => true));
    for (let i = pri.length - 1; i >= 0; i--) if (pri.indexOf(pri[i]) !== i) pri.splice(i, 1);
    cf.alloc = Object.fromEntries(E.STATS.map(s => [s, 0]));
    let left = poolSize();
    const order = [...pri, ...E.STATS.filter(s => !pri.includes(s))];
    // 주력 능력치부터 한 점씩 돌아가며 배분 (주력은 최대 +6, 나머지는 +3)
    const cap = (s) => pri.includes(s) ? (pri.indexOf(s) === 0 ? 15 : 12) : 7;
    let guard = 0;
    while (left > 0 && guard++ < 100) {
        let moved = false;
        for (const s of order) {
            const turns = pri.indexOf(s) === 0 ? 2 : 1;
            for (let t = 0; t < turns && left > 0; t++) if (cf.alloc[s] < cap(s)) { cf.alloc[s]++; left--; moved = true; }
        }
        if (!moved) { for (const s of order) if (left > 0 && cf.alloc[s] < ALLOC_MAX) { cf.alloc[s]++; left--; } }
    }
}

async function createCharacter() {
    if (!cf.name.trim()) { cstep = 2; renderCreator(); toastr?.warning?.('이름을 정해 주세요.', '왕관과 길드'); return; }
    const c = ctx();
    const st = E.createState(formToCreate());
    c.chatMetadata[MOD] = { base: st, createdAt: (c.chat || []).length, ver: 1 };
    if (typeof c.saveMetadata === 'function') await c.saveMetadata();
    else await saveChat();
    closeCreator();
    refreshNow();
    toastr?.success?.(`${st.profile.name}, 모험가 등록부에 이름이 올랐습니다.`, '왕관과 길드');
    if (cf.startNow) insertInput('(모험을 시작한다)', true);
}

/* ───────────────────────── 편의 기능: 단축키 · 슬래시 명령 · 매크로 · 알림 · 저장 ───────────────────────── */
function statePeek(key) {
    const st = cur.state; if (!st) return '';
    const d = E.formatDate(st.day);
    const map = {
        name: st.profile.name, money: E.formatMoney(st.money), date: d.text, day: String(st.day + 1), season: d.season,
        location: st.location, place: st.location, hp: `${st.hp}/${E.maxHP(st)}`, mp: `${st.mp}/${E.maxMP(st)}`, level: String(st.lv), class: st.cls || '',
        status: E.statusLabel(st), renown: String(st.renown), age: String(E.ageOf(st)), job: st.mainJob || '', weather: E.crowdOf(E.marketOf(st.location) || '제도 루미에른', st.day).weather,
    };
    return map[key] ?? '';
}
function registerScripting() {
    const c = ctx();
    const reg = (name, fn, help) => { try { c.registerSlashCommand?.(name, (args, value) => fn(String(value ?? '').trim(), args) ?? '', [], help, true, true); } catch { /* 지원하지 않는 버전 */ } };
    reg('cg', (v) => { openPanel(v || undefined); return ''; }, '<span>왕관과 길드 수첩 열기 — /cg 탭이름(status·farm·shops·rel·quests·cal·log…)</span>');
    reg('cg-act', (v) => { openModal('act', v || undefined); return ''; }, '<span>왕관과 길드 행동 창 열기 — /cg-act daily|people|work|train|move</span>');
    reg('cg-apply', (v) => { const lines = v.split(/\s*(?:\n|;|\\n)\s*/).filter(Boolean); if (lines.length) addManual(lines); return ''; }, '<span>왕관과 길드 변동 직접 적용 — /cg-apply 돈 +3은; 날짜 +1일</span>');
    reg('cg-get', (v) => statePeek(v || 'money'), '<span>왕관과 길드 값 읽기 — /cg-get money|date|location|hp|mp|level|status|age|weather (파이프로 /echo 등에 넘길 수 있음)</span>');
    reg('cg-export', () => { exportState(); return ''; }, '<span>왕관과 길드 상태 내보내기(파일)</span>');
    for (const k of ['name', 'money', 'date', 'day', 'season', 'location', 'hp', 'mp', 'level', 'class', 'status', 'renown', 'age', 'job', 'weather']) {
        try { c.registerMacro?.(`cg_${k}`, () => statePeek(k)); } catch { /* 지원하지 않는 버전 */ }
    }
}
/** 단축키: Alt+J 수첩 · Alt+A 행동 · Alt+B 의뢰판 · Alt+M 시장 · Alt+1~4 선택지 */
function onHotkey(e) {
    if (!cur.active || !cur.state || !settings().hotkeys) return;
    if (!e.altKey || e.ctrlKey || e.metaKey) return;
    const k = e.key.toLowerCase();
    const act = { j: () => { const p = document.getElementById('cg-panel'); if (p?.classList.contains('cg-open')) closePanel(); else openPanel(); }, a: () => openModal('act'), b: () => openModal('board'), m: () => openModal('market'), t: () => document.querySelector('[data-cg="trade-open"]')?.click() }[k];
    if (act) { e.preventDefault(); act(); return; }
    if (/^[1-6]$/.test(e.key)) {
        const btns = [...document.querySelectorAll('.cg-choices')].pop()?.querySelectorAll('.cg-choice');
        const b = btns?.[Number(e.key) - 1];
        if (b) { e.preventDefault(); b.click(); }
    }
}
/** 큰 일이 생기면 화면 구석에 알림 */
let toastSeen = -1;
function toastBig() {
    if (!settings().toasts || !cur.state) return;
    const last = Math.max(-1, ...cur.logs.keys());
    if (last <= toastSeen) return;
    const first = toastSeen === -1;
    toastSeen = last;
    if (first) return; // 채팅을 처음 열 때는 조용히
    const big = (cur.logs.get(last) || []).filter(l => l.k === 'rank' && !/랭크 [A-F0-9]!$|수련/.test(l.t)).slice(0, 3);
    for (const l of big) toastr?.info?.(l.t, '왕관과 길드', { timeOut: 5000 });
}
/** 장면 머리: 장소나 날짜가 바뀐 메시지 위에 띠를 단다 */
function sceneHeader(id) {
    const log = cur.logs.get(id) || [];
    const loc = log.find(l => /^→ /.test(l.t))?.t.slice(2);
    const day = log.find(l => /일 경과 · /.test(l.t))?.t.split(' · ')[1];
    if (!loc && !day) return '';
    return `<div class="cg-scene">${day ? `<span>${esc(day)}</span>` : ''}${loc ? `<b>${esc(loc)}</b>` : ''}</div>`;
}
/* 저장 · 이어하기 */
function exportState() {
    const st = cur.state; if (!st) return;
    const data = { app: '왕관과 길드', ver: 1, savedAt: new Date().toISOString(), state: st };
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `왕관과길드_${st.profile.name}_${E.formatDate(st.day).y}년${E.formatDate(st.day).m}월.json`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    toastr?.success?.('상태를 파일로 저장했습니다. 새 채팅에서 [가져오기]로 이어 갈 수 있어요.', '왕관과 길드');
}
async function importState(text) {
    let data; try { data = JSON.parse(text); } catch { toastr?.error?.('파일을 읽을 수 없습니다.', '왕관과 길드'); return; }
    const st = data?.state || data;
    if (!st?.profile || st.day === undefined) { toastr?.error?.('왕관과 길드 저장 파일이 아닙니다.', '왕관과 길드'); return; }
    const c = ctx();
    c.chatMetadata[MOD] = { base: E.normalize(st), createdAt: (c.chat || []).length, ver: 1, continued: true };
    if (typeof c.saveMetadata === 'function') await c.saveMetadata(); else await saveChat();
    refreshNow();
    toastr?.success?.(`${st.profile.name}의 이야기를 이어 갑니다 — ${E.formatDate(st.day).text}`, '왕관과 길드');
    insertInput('(지난 이야기에 이어서 — 지금 장면부터 다시 시작한다)');
}
function pickImportFile() {
    const inp = document.createElement('input');
    inp.type = 'file'; inp.accept = '.json,application/json';
    inp.onchange = async () => { const f = inp.files?.[0]; if (f) importState(await f.text()); };
    inp.click();
}
function saveHtml(st) {
    const ch = (st.chronicle || []).length;
    return `<section class="cg-sec"><h3>저장 · 이어하기 <small>대화가 너무 길어졌을 때</small></h3>
        <p class="cg-hint">대화가 길어지면 GM이 앞부분을 잊고 느려집니다. 지금 상태를 파일로 저장해 두고, 새 채팅을 연 뒤 [가져오기]를 누르면 수치·가족·가게·농장·연대기(${ch}줄)·인물 노트까지 그대로 이어집니다.</p>
        <div class="cg-farm-mini"><button class="cg-btn" data-cg="save-export">파일로 저장</button><button class="cg-btn" data-cg="save-import">가져오기</button></div></section>
    <section class="cg-sec"><h3>단축키 · 스크립트</h3>
        <ul class="cg-list cg-dim"><li><b>Alt+J</b><small>수첩 열고 닫기</small></li><li><b>Alt+A</b><small>행동 창</small></li><li><b>Alt+B · Alt+M · Alt+T</b><small>의뢰판 · 시장 · 거래</small></li><li><b>Alt+1 ~ 6</b><small>마지막 선택지 고르기</small></li></ul>
        <div class="cg-farm-mini"><button class="cg-btn" data-cg="guide-reset">처음 안내 다시 보기</button></div>
        <p class="cg-hint">슬래시 명령: <code>/cg 탭</code> · <code>/cg-act</code> · <code>/cg-apply 돈 +3은; 날짜 +1일</code> · <code>/cg-get money</code> · <code>/cg-export</code><br>매크로(테마·빠른 답장에서): <code>{{cg_money}}</code> <code>{{cg_date}}</code> <code>{{cg_location}}</code> <code>{{cg_hp}}</code> <code>{{cg_status}}</code> <code>{{cg_weather}}</code> 등</p></section>`;
}

/* ───────────────────────── 설정 패널 ───────────────────────── */

function renderSettings() {
    const host = document.getElementById('extensions_settings2') || document.getElementById('extensions_settings');
    if (!host || document.getElementById('cg-settings')) return;
    const s = settings();
    const box = document.createElement('div');
    box.id = 'cg-settings';
    box.innerHTML = `
    <div class="inline-drawer">
        <div class="inline-drawer-toggle inline-drawer-header"><b>왕관과 길드</b><div class="inline-drawer-icon fa-solid fa-circle-chevron-down down"></div></div>
        <div class="inline-drawer-content cg-set">
            <label class="checkbox_label"><input type="checkbox" data-set="enabled"> 확장 사용</label>
            <label class="checkbox_label"><input type="checkbox" data-set="allChars"> 모든 캐릭터에서 사용 (기본: 「왕관과 길드」 카드에서만)</label>
            <label class="checkbox_label"><input type="checkbox" data-set="showHud"> 상단 상태 막대</label>
            <label class="checkbox_label"><input type="checkbox" data-set="showQuick"> 입력창 위 빠른 행동</label>
            <label class="checkbox_label"><input type="checkbox" data-set="showChips"> 메시지 아래 변동 표시</label>
            <label class="checkbox_label"><input type="checkbox" data-set="choiceAutoSend"> 선택지를 누르면 바로 전송</label>
            <label class="checkbox_label"><input type="checkbox" data-set="hotkeys"> 단축키 (Alt+J 수첩 · Alt+A 행동 · Alt+1~6 선택지)</label>
            <label class="checkbox_label"><input type="checkbox" data-set="toasts"> 큰 일이 생기면 알림 띄우기</label>
            <label class="checkbox_label"><input type="checkbox" data-set="sceneHead"> 장소·날짜가 바뀐 메시지 위에 장면 띠</label>
            <label class="checkbox_label"><input type="checkbox" data-set="missHint"> GM이 변동을 빠뜨린 것 같으면 알려 주기</label>
            <label class="checkbox_label"><input type="checkbox" data-set="portraits"> 수첩에 초상 보이기 (나·동료·인맥 — 그림은 채팅마다 따로 저장)</label>
            <label class="checkbox_label"><input type="checkbox" data-set="personaPortrait"> 내 초상을 따로 넣지 않으면 페르소나 이미지 쓰기</label>
            <label class="checkbox_label"><input type="checkbox" data-set="wide3"> 넓은 화면(${WIDE_MIN}px 이상)에서 3단 배치 — 왼쪽 상황판 · 가운데 채팅 · 오른쪽 수첩과 편지</label>
            <label class="checkbox_label"><input type="checkbox" data-set="dock"> 수첩을 채팅 오른쪽에 고정 (채팅창이 그만큼 좁아집니다)</label>
            <label>고정한 수첩 너비 <input type="number" min="320" max="640" step="20" data-set="dockWidth" class="text_pole" style="width:6em"> px</label>
            <label>게임 상태 주입 깊이 <input type="number" min="0" max="10" data-set="depth" class="text_pole" style="width:5em"></label>
            <div class="cg-set-btns"><div class="menu_button" data-cg="panel">모험가 수첩 열기</div><div class="menu_button" data-cg="open-creator">캐릭터 만들기</div></div>
        </div>
    </div>`;
    host.appendChild(box);
    box.querySelectorAll('[data-set]').forEach(inp => {
        const k = inp.dataset.set;
        if (inp.type === 'checkbox') inp.checked = !!s[k]; else inp.value = s[k];
        inp.addEventListener('input', () => {
            s[k] = inp.type === 'checkbox' ? inp.checked : Number(inp.value);
            ctx().saveSettingsDebounced?.();
            refreshNow();
        });
    });
}

/* ───────────────────────── 치트 ───────────────────────── */

function fatigueRow(st) {
    const e = E.energyOf(st), m = E.maxEN(st);
    return `<span>기력</span>${bar(e, m, 'cg-en' + (e <= m * 0.2 ? ' cg-low' : ''))}<small>${e}/${m}</small>`;
}
function cheatBtn(label, lines, cls = '') {
    return `<button class="cg-btn ${cls}" data-cg="cheat" data-lines="${esc(lines.join('\n'))}">${label}</button>`;
}


let cheatSkCls = null;
let cheatSpEl = '';
let cheatRealm = '';
let cheatBand = '';
function cheatSkillsHtml(st) {
    const classes = Object.keys(E.SKILL_TREE);
    if (!cheatSkCls || !E.SKILL_TREE[cheatSkCls]) cheatSkCls = E.SKILL_TREE[st.cls] ? st.cls : classes[0];
    const list = E.SKILL_TREE[cheatSkCls] || [];
    const tierOpts = E.PROF_TIERS.map((t, i) => `<option value="${E.profNeed(st, i)}">${t[0]} (${E.profNeed(st, i)})</option>`).join('');
    return `<section class="cg-sec"><h3>기술 <small>클래스를 고르면 그 기술만 보입니다 · 숙련은 숫자로 바로 지정</small></h3>
        <div class="cg-cheat-row">
            <select data-cg-change="cheat-skcls">${classes.map(c => `<option ${c === cheatSkCls ? 'selected' : ''}>${esc(c)}</option>`).join('')}</select>
            <button class="cg-btn" data-cg="cheat-sk-all" data-mode="learn">이 클래스 기술 모두 익히기</button>
            <select id="cg-ch-sktier">${tierOpts}</select><button class="cg-btn" data-cg="cheat-sk-all" data-mode="prof">모두 이 숙련으로</button>
        </div>
        <ul class="cg-cheat-sk">${list.map(x => {
        const k = st.cskills?.[x[0]]; const p = k?.p || 0;
        return `<li class="${k ? 'on' : ''}"><b>${esc(x[0])}</b><small>${E.SKILL_TIER_NAME[x[1]] || ''}${x[4] ? ` · ${esc(x[4])}` : ''}${k ? ` · ${E.profTierName(E.profTier(st, p))}` : ' · 미습득'}</small>
            <input type="number" min="0" max="999" data-chsk="${esc(x[0])}" value="${p}" title="숙련">
            ${k ? '' : `<button class="cg-mini" data-cg="cheat" data-lines="${esc(`기술습득 ${x[0]}`)}">익히기</button>`}</li>`;
    }).join('')}</ul>
        <div class="cg-cheat-row"><button class="cg-btn cg-btn-primary" data-cg="cheat-sk-apply">숙련 숫자 적용</button><small class="cg-hint">바꾼 칸만 적용됩니다. 배우지 않은 기술에 숫자를 넣으면 함께 익힙니다.</small></div>
    </section>`;
}
function tabCheat(st) {
    const people = [...new Set([...Object.keys(st.rel), ...st.party.map(m => m.name)])].sort((a, b) => (st.rel[b] || 0) - (st.rel[a] || 0));
    const nobleMax = 8; // 공작까지 (황족·황제는 치트로도 불가)
    return `
    <p class="cg-hint cg-cheat-note">여기서 바꾼 값은 마지막 메시지에 '수동 조정'으로 기록됩니다. 그 메시지를 지우거나 다시 생성하면 함께 사라지니, 다시 생성할 메시지에서 썼다면 한 번 더 눌러 주세요. GM은 바뀐 수치를 그대로 받아들입니다.</p>

    <section class="cg-sec"><h3>소지금 <small>지금 ${esc(E.formatMoney(st.money))}</small></h3>
        <div class="cg-cheat-row">
            ${cheatBtn('+1은', ['돈 +1은'])}${cheatBtn('+10은', ['돈 +10은'])}${cheatBtn('+1금', ['돈 +1금'])}${cheatBtn('+10금', ['돈 +10금'])}${cheatBtn('+100금', ['돈 +100금'])}
        </div>
        <div class="cg-cheat-row">
            <input id="cg-ch-g" type="number" min="0" placeholder="금"><input id="cg-ch-s" type="number" min="0" placeholder="은"><input id="cg-ch-c" type="number" min="0" placeholder="동">
            <button class="cg-btn" data-cg="cheat-money" data-mode="add">더하기</button><button class="cg-btn cg-btn-primary" data-cg="cheat-money" data-mode="set">이 금액으로</button>
        </div>
    </section>

    <section class="cg-sec"><h3>명성 · 신분 <small>명성 ${st.renown} · ${esc(E.NOBLE[st.noble])}</small></h3>
        <div class="cg-cheat-row">
            ${cheatBtn('명성 +10', ['명성 +10'])}${cheatBtn('명성 +100', ['명성 +100'])}
            ${st.noble < E.NOBLE_ROYAL ? `<select id="cg-ch-noble">${E.NOBLE.slice(0, nobleMax + 1).map((n, i) => `<option value="${esc(n)}" ${i === st.noble ? 'selected' : ''}>${esc(n)}</option>`).join('')}</select>
            <button class="cg-btn" data-cg="cheat-set" data-src="cg-ch-noble" data-tpl="신분 {v}">신분 설정</button>` : ''}
        </div>
        <small class="cg-hint">황족·황제는 치트로도 될 수 없습니다(황족은 혼인, 황제는 어려움 난이도의 찬탈로만).</small>
    </section>

    <section class="cg-sec"><h3>회복</h3>
        <div class="cg-cheat-row">
            ${cheatBtn('HP·MP·기력 가득', ['HP 최대', 'MP 최대', '기력 최대'], 'cg-btn-primary')}
            ${st.party.length ? cheatBtn('동료 전원 회복', st.party.map(m => `동료HP ${m.name} 최대`)) : ''}
            ${st.conds.length ? cheatBtn('상태 이상 모두 해제', st.conds.map(c => `상태 -${c}`)) : ''}
        </div>
    </section>

    <section class="cg-sec"><h3>레벨 · 경험 <small>Lv ${st.lv} · EXP ${st.exp}/${E.expNeed(st)} · 포인트 ${st.statPoints}</small></h3>
        <div class="cg-cheat-row">
            ${cheatBtn('경험 +100', ['경험 +100'])}${cheatBtn('레벨 +1', ['레벨 +1', `포인트 +${E.DIFFICULTY[st.difficulty].lvPoints}`])}${cheatBtn('능력 포인트 +1', ['포인트 +1'])}${cheatBtn('+5', ['포인트 +5'])}
        </div>
    </section>

    <section class="cg-sec"><h3>클래스 <small>${esc(st.cls)} Lv ${st.lv}</small></h3>
        <div class="cg-cheat-row">${cheatBtn('주 클래스 Lv +1', ['레벨 +1', `포인트 +${E.DIFFICULTY[st.difficulty].lvPoints}`])}${cheatBtn('Lv +10', ['레벨 +10', `포인트 +${E.DIFFICULTY[st.difficulty].lvPoints * 10}`])}</div>
        <div class="cg-cheat-row">
            <select id="cg-ch-cls">${Object.keys(E.CLASSES).map(k => `<option>${k}</option>`).join('')}</select>
            <input id="cg-ch-clslv" type="number" min="1" max="${E.CLASS_MAX}" value="1">
            <button class="cg-btn" data-cg="cheat-cls">레벨로 익히기</button>
        </div>
        <small class="cg-hint">고른 클래스를 그 레벨로 익힌 상태로 만듭니다(이미 익혔다면 레벨만 바꿈). 주 클래스 전환은 '클래스' 탭에서.</small>
    </section>

    ${cheatSkillsHtml(st)}

    <section class="cg-sec"><h3>적성 속성 <small>${(st.affinity || []).join('·') || '없음'}</small></h3>
        <div class="cg-cheat-row">${E.ELEMENTS.map(e => `<button class="cg-btn ${E.hasAffinity(st, e) ? 'cg-btn-primary' : ''}" data-cg="cheat" data-lines="${esc(`적성 ${E.hasAffinity(st, e) ? '-' : '+'}${e}`)}">${e}</button>`).join('')}</div>
        <small class="cg-hint">눌러서 켜고 끕니다.</small>
    </section>

    <section class="cg-sec"><h3>동반자</h3>
        ${(st.companions || []).length ? `<ul class="cg-cheat-list">${st.companions.map(c => `<li><b>${esc(c.name)}</b><small>Lv ${c.lv} · 유대 ${c.bond}</small>
            <button class="cg-mini" data-cg="cheat" data-lines="${esc(`성장 ${c.name} +100`)}">성장 +100</button>
            <button class="cg-mini" data-cg="cheat" data-lines="${esc(`유대 ${c.name} +20`)}">유대 +20</button>
            <button class="cg-mini" data-cg="cheat" data-lines="${esc(`동반자HP ${c.name} 최대`)}">회복</button></li>`).join('')}</ul>` : ''}
        <div class="cg-cheat-sp">
            <div class="cg-cheat-sp-h">정령 들이기 <small>속성을 고르면 등급별 정령이 나옵니다 · 격 제한 없이 바로 계약</small></div>
            <div class="cg-dex-chips">${E.SPIRIT_ELEMS.map(e => `<button class="cg-lchip ${cheatSpEl === e ? 'on' : ''}" data-cg="cheat-spel" data-val="${e}">${e === '어둠' ? '그림자' : e}</button>`).join('')}</div>
            ${cheatSpEl ? `<div class="cg-cheat-sp-list">${E.SPIRIT_GRADES.map((g, i) => { const nm = E.spiritBaseName(cheatSpEl, i); return `<button class="cg-mini" data-cg="cheat" data-lines="${esc(`정령계약 +${nm} | 정령 | ${nm} | ${cheatSpEl} | | | 강제`)}"><small>${g}</small> ${esc(nm)}</button>`; }).join('')}</div>` : ''}
        </div>
        <div class="cg-cheat-sp">
            <div class="cg-cheat-sp-h">이계 존재 <small>세계를 고르면 진명이 알려진 존재들이 나옵니다 · 진명만 배우거나 바로 계약</small></div>
            <div class="cg-dex-chips">${Object.keys(E.TRUE_NAMES).map(r => `<button class="cg-lchip ${cheatRealm === r ? 'on' : ''}" data-cg="cheat-realm" data-val="${r}">${r}</button>`).join('')}</div>
            ${cheatRealm ? `<ul class="cg-cheat-list">${[1, 2, 3].flatMap(g => E.TRUE_NAMES[cheatRealm][g].map(b => { const short = b.split(' ').pop(); const known = (st.truenames || []).some(x => x.name === b); return `<li><b>${esc(b)}</b><small>${E.SUMMON_GRADES[g]}${known ? ' · 진명 앎' : ''}</small>
                ${known ? '' : `<button class="cg-mini" data-cg="cheat" data-lines="${esc(`진명 ${b} | ${cheatRealm} | ${E.SUMMON_GRADES[g]}`)}">진명</button>`}
                <button class="cg-mini" data-cg="cheat" data-lines="${esc(`계약 +${short} | 소환수 | ${b} | | | | 강제`)}">계약</button></li>`; })).join('')}</ul>` : ''}
        </div>
        ${(st.companions || []).some(c => c.kind === '마수') ? `<div class="cg-cheat-row cg-mt">
            <select id="cg-ch-evo">${st.companions.filter(c => c.kind === '마수').map(c => `<option value="${esc(c.name)}">${esc(c.name)} (${esc(c.species || '')})</option>`).join('')}</select>
            <input id="cg-ch-evosp" placeholder="새 종족 (예: 다이어울프)" class="cg-wide">
            <button class="cg-btn" data-cg="cheat-evo">진화</button>
        </div>` : ''}
        ${(st.pacts || []).some(p => !p.done) ? `<ul class="cg-cheat-list cg-mt">${st.pacts.filter(p => !p.done).map(p => `<li><b>${esc(p.who)}</b><small>${esc(p.what)} · ${p.broken ? '기한 넘김 · 분노 중' : `${p.due - st.day}일 남음`}</small>
            <button class="cg-mini" data-cg="cheat" data-lines="${esc(`대가이행 ${p.who} | ${p.what}`)}">대가 치름</button></li>`).join('')}</ul>` : ''}
        <div class="cg-cheat-row cg-mt">
            <input id="cg-ch-cname" placeholder="이름" class="cg-wide"><select id="cg-ch-ckind"><option>정령</option><option>소환수</option><option selected>마수</option></select>
            <input id="cg-ch-csp" placeholder="종족 (예: 그리폰 새끼)" class="cg-wide"><select id="cg-ch-cel"><option value="">속성 없음</option>${E.ELEMENTS.map(e => `<option>${e}</option>`).join('')}</select>
            <button class="cg-btn" data-cg="cheat-comp">들이기</button>
        </div>
    </section>

    <section class="cg-sec"><h3>강점 (특화)</h3>
        <div class="cg-cheat-row">
            <input id="cg-ch-focus" list="cg-ch-focus-list" placeholder="분야 이름 (예: 얼음 마법)" class="cg-wide"><datalist id="cg-ch-focus-list">${(E.FOCUS_HINTS[st.cls] || []).map(f => `<option>${esc(f)}</option>`).join('')}</datalist>
            <button class="cg-btn" data-cg="cheat-focus" data-n="30">+30</button><button class="cg-btn" data-cg="cheat-focus" data-n="100">+100</button>
        </div>
        <small class="cg-hint">지금 주 클래스(${esc(st.cls)})에 쌓입니다.</small>
    </section>

    <section class="cg-sec"><h3>생활 기술 랭크</h3>
        <div class="cg-cheat-row">
            <select id="cg-ch-life">${Object.keys(E.LIFE).map(k => `<option>${k}</option>`).join('')}</select>
            <select id="cg-ch-lrank">${E.LIFE_RANKS.map(r => `<option>${r}</option>`).join('')}</select>
            <button class="cg-btn" data-cg="cheat-life">랭크 설정</button>
            ${cheatBtn('모든 기술 +30 수련', Object.keys(st.life).map(k => `수련 ${k} +30`))}
        </div>
    </section>

    <section class="cg-sec"><h3>능력치 <small>숫자를 고치고 한 번에 적용 · 지금 상한 ${E.statCap(st)} (${E.STAT_CAP_NAMES[Math.min(3, st.capBreak || 0)]})</small></h3>
        <div class="cg-cheat-stats">${E.STATS.map(k => `
            <label class="cg-cs"><span>${k}</span><input type="number" min="1" max="999" step="1" data-chstat="${esc(k)}" value="${st.stats[k]}"></label>`).join('')}</div>
        <div class="cg-cheat-row cg-mt">
            <button class="cg-btn cg-btn-primary" data-cg="cheat-stats">적용</button><button class="cg-btn" data-cg="cheat-stats-reset">되돌리기</button>
            <span class="cg-faint">모두</span>${[-1, 1, 5, 10].map(n => `<button class="cg-btn" data-cg="cheat-stats-all" data-n="${n}">${n > 0 ? '+' : '−'}${Math.abs(n)}</button>`).join('')}
            <input id="cg-ch-statall" type="number" min="1" max="999" placeholder="값"><button class="cg-btn" data-cg="cheat-stats-all" data-set="1">모두 이 값으로</button>
        </div>
            <div class="cg-cheat-row">${cheatBtn(`한계 돌파 (${E.statCap(st)} → ${E.STAT_CAPS[Math.min(3, (st.capBreak || 0) + 1)]})`, ['한계돌파 치트'])}</div>
    </section>

    <section class="cg-sec"><h3>호감도</h3>
        ${people.length ? `<ul class="cg-cheat-list">${people.map((n, i) => `
            <li><b>${esc(n)}</b><small>${st.rel[n] || 0}</small>
                <button class="cg-mini" data-cg="cheat" data-lines="${esc(`호감 ${n} -10`)}">−10</button>
                <button class="cg-mini" data-cg="cheat" data-lines="${esc(`호감 ${n} +10`)}">+10</button>
                <input id="cg-ch-rel-${i}" type="number" min="-100" max="100" value="${st.rel[n] || 0}">
                <button class="cg-mini" data-cg="cheat-set" data-src="cg-ch-rel-${i}" data-tpl="${esc(`호감 ${n} ={v}`)}">설정</button>
                <select id="cg-ch-bond-${i}">${['없음', ...E.ROMANCE].map(r => `<option ${(st.bonds[n]?.stage || '없음') === r ? 'selected' : ''}>${r}</option>`).join('')}</select>
                <button class="cg-mini" data-cg="cheat-set" data-src="cg-ch-bond-${i}" data-tpl="${esc(`관계강제 ${n} {v}`)}">연애</button>
            </li>`).join('')}</ul>` : '<div class="cg-empty-s">아직 아는 사람이 없습니다.</div>'}
        <div class="cg-cheat-row cg-mt">
            <input id="cg-ch-newname" placeholder="이름 (새 인물도 가능)" class="cg-wide"><input id="cg-ch-newval" type="number" min="-100" max="100" value="50">
            <button class="cg-btn" data-cg="cheat-newrel">설정</button>
        </div>
        <small class="cg-hint">'연애' 버튼은 조건(호감·순서)을 무시하고 연애 단계를 바로 정합니다. '배우자'로 정하면 혼인한 것으로 처리되고, 다른 배우자가 있었다면 바뀝니다.</small>
    </section>

    <section class="cg-sec"><h3>소속 · 등급 · 공적</h3>
        ${Object.entries(E.ORGS).map(([id, o]) => {
        const m = st.orgs[id];
        return `<div class="cg-cheat-org">
                <b>${esc(o.name)}</b>
                ${m ? `<select id="cg-ch-rank-${id}">${o.ranks.map((r, i) => `<option value="${esc(r)}" ${i === m.rank ? 'selected' : ''}>${esc(r)}</option>`).join('')}</select>
                <button class="cg-mini" data-cg="cheat-set" data-src="cg-ch-rank-${id}" data-tpl="${esc(`승급 ${o.name.replace(/\s/g, '')} {v}`)}">등급 설정</button>
                <small>공적 ${m.merit}</small>
                <button class="cg-mini" data-cg="cheat" data-lines="${esc(`공적 ${o.name.replace(/\s/g, '')} +100`)}">+100</button>`
                : `<small class="cg-faint">미가입</small><button class="cg-mini" data-cg="cheat" data-lines="${esc(`가입 ${o.name.replace(/\s/g, '')}`)}">가입</button>`}
            </div>`;
    }).join('')}
    </section>

    <section class="cg-sec"><h3>아이템</h3>
        <div class="cg-cheat-row">
            <input id="cg-ch-item" placeholder="아이템 이름" class="cg-wide"><input id="cg-ch-qty" type="number" min="1" value="1">
            <button class="cg-btn" data-cg="cheat-item">넣기</button>
        </div>
        <div class="cg-cheat-row">
            <span class="cg-cheat-lbl">유적 발견물</span>
            <select id="cg-ch-band">${[['', '상층'], ['중층', '중층'], ['하층', '하층']].map(([v, l]) => `<option value="${v}" ${cheatBand === v ? 'selected' : ''}>${l}</option>`).join('')}</select>
            <button class="cg-btn" data-cg="cheat-relic" data-k="">아무거나</button><button class="cg-btn" data-cg="cheat-relic" data-k="장비">장비</button><button class="cg-btn" data-cg="cheat-relic" data-k="보물">보물</button><button class="cg-btn" data-cg="cheat-relic" data-k="금서">금서</button>
        </div>
        ${st.items.filter(i => st.relics?.[i.name]?.tn && !st.relics[i.name].read).length ? `<div class="cg-cheat-row">${st.items.filter(i => st.relics?.[i.name]?.tn && !st.relics[i.name].read).map(i => `<button class="cg-mini" data-cg="cheat" data-lines="${esc(`해독 ${i.name} 강제`)}">해독 · ${esc(i.name.replace(/^금서 /, ''))}</button>`).join('')}</div>` : ''}
        <small class="cg-hint">장비는 직업을 가리지 않고 나옵니다. 깊은 층일수록 값이 높고, 금서에는 이계 존재의 진명이 적혀 있습니다.</small>
    </section>`;
}

let cheatToast = null;
async function cheat(lines) {
    if (!lines.length) return;
    const keep = document.querySelector('#cg-panel .cg-p-body')?.scrollTop;
    await addManual(lines);
    if (keep !== undefined) { const b = document.querySelector('#cg-panel .cg-p-body'); if (b) b.scrollTop = keep; }
    if (cheatToast) toastr?.clear?.(cheatToast);
    cheatToast = toastr?.success?.(lines.length === 1 ? lines[0] : `${lines.length}개 항목 조정`, '치트', { timeOut: 1500 });
}

function addWandItem() {
    const menu = document.getElementById('extensionsMenu');
    if (!menu || document.getElementById('cg-wand')) return;
    const item = document.createElement('div');
    item.id = 'cg-wand';
    item.className = 'list-group-item flex-container flexGap5 interactable';
    item.tabIndex = 0;
    item.dataset.cg = 'panel';
    item.innerHTML = '<div class="fa-solid fa-shield-halved extensionsMenuExtensionButton"></div><span>모험가 수첩</span>';
    menu.appendChild(item);
}



/* 편지 펼쳐 보기 — 편지지를 화면 가운데 크게 */
function openLetterView(id) {
    const st = cur.state; const l = (st?.letters || []).find(x => x.id === id); if (!l) return;
    const fl = letterFlags(); if (!fl[id]) { fl[id] = 'r'; saveChat(); }
    let ov = document.getElementById('cg-letterpop');
    if (!ov) { ov = document.createElement('div'); ov.id = 'cg-letterpop'; ov.className = 'cg-root'; document.body.appendChild(ov); ov.onclick = (ev) => { if (ev.target === ov) closeLetterView(); }; }
    const d = E.formatDate(l.day);
    const paras = String(l.body).split(/\n{2,}|\n/).map(x => x.trim()).filter(Boolean).map(x => `<p>${esc(x)}</p>`).join('');
    ov.innerHTML = `<div class="cg-lp-wrap" role="dialog" aria-label="${esc(l.from)}의 편지">
        <article class="cg-lp-paper"><header><small>제국력 ${d.y}년 ${d.m}월 ${d.d}일</small><b>${esc(l.from)}</b></header>
            <div class="cg-lp-body">${paras}</div>
            <footer>— ${esc(l.from)}</footer></article>
        <div class="cg-lp-bar"><button class="cg-mini cg-primary-mini" data-cg="lp-reply" data-from="${esc(l.from)}">답장 쓰기</button><button class="cg-mini" data-cg="lp-hide" data-id="${esc(l.id)}">치우기</button><button class="cg-mini" data-cg="lp-close">닫기</button></div></div>`;
    ov.classList.add('cg-open');
    renderSide(); renderHud(); if (panelTab === 'news') renderPanel();
}

/* 편지 쓰기 — 편지지를 펼쳐 놓고 직접 쓴다 */
function letterPeople(st) {
    return [...new Set([...(st.spouse ? [st.spouse.name] : []), ...st.party.map(m => m.name), ...(st.letters || []).slice().reverse().map(l => l.from),
        ...Object.keys(st.bonds || {}), ...Object.entries(st.rel || {}).sort((a, b) => b[1] - a[1]).map(([k]) => k)])].filter(n => n && n !== '누군가').slice(0, 40);
}
function openLetterCompose(to = '') {
    const st = cur.state; if (!st) return;
    let ov = document.getElementById('cg-letterpop');
    if (!ov) { ov = document.createElement('div'); ov.id = 'cg-letterpop'; ov.className = 'cg-root'; document.body.appendChild(ov); ov.onclick = (ev) => { if (ev.target === ov) closeLetterView(); }; }
    const d = E.formatDate(st.day), people = letterPeople(st);
    ov.innerHTML = `<div class="cg-lp-wrap" role="dialog" aria-label="편지 쓰기">
        <article class="cg-lp-paper cg-lp-write"><header><small>제국력 ${d.y}년 ${d.m}월 ${d.d}일 · ${esc(st.location.split(' · ')[0])}에서</small>
            <label class="cg-lp-to"><span>받는 이</span><input id="cg-lw-to" list="cg-lw-people" value="${esc(to)}" placeholder="이름을 적거나 고르세요" autocomplete="off"></label>
            <datalist id="cg-lw-people">${people.map(n => `<option value="${esc(n)}">`).join('')}</datalist>
            ${people.length ? `<div class="cg-lp-chips">${people.slice(0, 10).map(n => `<button class="cg-lp-chip" data-cg="lw-to" data-val="${esc(n)}">${esc(n)}</button>`).join('')}</div>` : ''}</header>
            <textarea id="cg-lw-body" class="cg-lp-ta" placeholder="여기에 편지를 씁니다…"></textarea>
            <footer>— ${esc(st.profile.name)}</footer></article>
        <div class="cg-lp-bar"><button class="cg-mini cg-primary-mini" data-cg="lw-send">봉해서 보내기</button><button class="cg-mini" data-cg="lw-input">입력칸에 넣기</button><button class="cg-mini" data-cg="lp-close">닫기</button></div></div>`;
    ov.classList.add('cg-open');
    setTimeout(() => document.getElementById(to ? 'cg-lw-body' : 'cg-lw-to')?.focus(), 30);
}
function letterComposeText() {
    const to = document.getElementById('cg-lw-to')?.value.trim(), body = document.getElementById('cg-lw-body')?.value.trim();
    if (!to || !body) { toastr?.info?.(!to ? '받는 이를 적어 주세요.' : '편지 내용을 써 주세요.', '왕관과 길드'); return null; }
    return `(${to}에게 편지를 써서 부친다)\n<보낸편지 ${to}>\n${body}\n</보낸편지>`;
}
function closeLetterView() { document.getElementById('cg-letterpop')?.classList.remove('cg-open'); }

/* ───────────────────────── 넓은 화면 3단 배치 — 왼쪽 '지금 상황', 오른쪽 아래 편지 ───────────────────────── */
const WIDE_MIN = 1400;
function isWide() { return !!(cur.active && cur.state && settings().wide3 && window.innerWidth >= WIDE_MIN); }
function mapThumb(st) {
    const inCap = /제도|루미에른/.test(st.location) && !/외곽|브레이크/.test(st.location);
    let img = MAP_IMG.world, fx = null, fy = null;
    if (inCap) { const c = CAPITAL_PINS.find(c => st.location.includes(c[0])); img = MAP_IMG.capital; if (c) { fx = c[1] / 100; fy = c[2] / 100; } else { fx = .5; fy = .45; } }
    else { const p = E.placeExact(st.location); const w = p && WORLD_PINS[p[0]]; if (w) { fx = w[0] / 100; fy = w[1] / 100; } }
    if (fx === null) return `<div class="cg-s-map" style="background-image:url('${img}');background-size:cover;background-position:center"></div>`;
    const k = 2, ky = k * (2 / 3) * 2.2, cl = v => Math.max(0, Math.min(1, v));
    const px = cl((fx * k - .5) / (k - 1)), py = cl((fy * ky - .5) / (ky - 1));
    const lx = (fx * k + (1 - k) * px) * 100, ly = (fy * ky + (1 - ky) * py) * 100;
    return `<div class="cg-s-map" style="background-image:url('${img}');background-size:${k * 100}% auto;background-position:${(px * 100).toFixed(1)}% ${(py * 100).toFixed(1)}%"><i style="left:${lx.toFixed(1)}%;top:${ly.toFixed(1)}%"></i></div>`;
}
function sideCard(lbl, right, body, cg, extra = '') {
    return `<section class="cg-s-card"${cg ? ` data-cg="${cg}"${extra}` : ''}><header><span class="cg-s-lbl">${lbl}</span>${right ? `<span class="cg-s-r">${right}</span>` : ''}</header>${body}</section>`;
}
function renderSide() {
    let L = document.getElementById('cg-side'), R = document.getElementById('cg-mail'), H = document.getElementById('cg-chead');
    if (!isWide()) { L?.remove(); R?.remove(); H?.remove(); return; }
    const st = cur.state, p = st.profile, D = E.DIFFICULTY[st.difficulty];
    if (!L) { L = document.createElement('aside'); L.id = 'cg-side'; L.className = 'cg-root'; document.body.appendChild(L); }
    if (!R) { R = document.createElement('aside'); R.id = 'cg-mail'; R.className = 'cg-root'; document.body.appendChild(R); }
    const chat = document.getElementById('chat');
    if (!H && chat) { H = document.createElement('div'); H.id = 'cg-chead'; H.className = 'cg-root'; chat.parentElement.insertBefore(H, chat); }
    const date = E.formatDate(st.day), tod = E.todOf(st), TODS = ['아침', '낮', '저녁', '밤'];
    const weather = E.weatherOf(st.day, E.marketOf(st.location) || '제도 루미에른');
    const ev = E.eventsOn(st.day)[0], up = E.upcomingEvents(st.day, 30)[0];
    const conds = st.conds || [];
    // 주인공
    const hero = sideCard('HERO', `<span class="cg-s-tag">${esc(st.mainJob ? st.mainJob.replace(/^모험가 길드 /, '') : D.label)}</span>`, `
        <div class="cg-s-hero">${settings().portraits ? `<div class="cg-s-ph" data-cg="ph-view" data-who="@me" title="크게 보기 · 바꾸기">${portraitOf('@me') ? `<img src="${esc(portraitOf('@me'))}" alt="">` : `<span>${esc(p.name.slice(0, 1))}</span>`}</div>` : ''}
            <div class="cg-s-hb"><div class="cg-s-name"><b>${esc(p.name)}</b><small>${E.ageOf(st)}살</small></div>
            <div class="cg-s-sub">${esc([`${st.cls} Lv ${st.lv}`, E.statusLabel(st)].join(' · '))}</div>
            <div class="cg-s-bars"><span>HP</span>${bar(st.hp, E.maxHP(st), 'cg-hp')}<small>${st.hp}/${E.maxHP(st)}</small><span>MP</span>${bar(st.mp, E.maxMP(st), 'cg-mp')}<small>${st.mp}/${E.maxMP(st)}</small>${fatigueRow(st)}<span>EXP</span>${bar(st.lv >= E.CLASS_MAX ? 1 : st.exp, st.lv >= E.CLASS_MAX ? 1 : E.expNeed(st), 'cg-exp')}<small>${st.lv >= E.CLASS_MAX ? 'MAX' : `${st.exp}/${E.expNeed(st)}`}</small></div></div></div>
        <footer><span class="${conds.length ? 'cg-bad' : ''}">${esc(conds.join(', ') || '이상 없음')}</span><b>${esc(E.formatMoney(st.money))}</b></footer>`, 'panel-tab', ' data-tab="status"');
    // 달력
    const cal = sideCard('CALENDAR', `${esc(date.season)} · ${esc(weather)}`, `
        <div class="cg-s-date">${date.m}월 ${date.d}일 <em>${esc(tod)}</em></div>
        <div class="cg-s-sub">제국력 ${date.y}년${ev ? ` · 오늘: ${esc(ev.name)}` : up ? ` · ${esc(up.ev.name)}까지 ${up.inDays}일` : ''}</div>
        <div class="cg-s-tod">${TODS.map(t => `<i class="${t === tod ? 'on' : TODS.indexOf(t) < TODS.indexOf(tod) ? 'past' : ''}"></i>`).join('')}</div>
        <div class="cg-s-todl">${TODS.map(t => `<span>${t}</span>`).join('')}</div>`, 'panel-tab', ' data-tab="cal"');
    // 지금 있는 곳
    const here = E.peopleHere(st).map(x => x.name);
    const [l1, l2] = st.location.split(' · ');
    const inCapNow = /제도|루미에른/.test(l1) && !/외곽/.test(l1);
    const where = sideCard('WHERE', inCapNow ? `제도 ${CAPITAL_PINS.filter(c => st.seenSpots?.[c[0]] !== undefined).length}/${CAPITAL_PINS.length} · 대륙 ${Object.keys(st.visited || {}).length}/${E.WORLD_PLACES.length}` : `가 본 곳 ${Object.keys(st.visited || {}).length}/${E.WORLD_PLACES.length}`, `
        ${mapThumb(st)}
        <div class="cg-s-loc">${esc(l1)}${l2 ? ` · <b>${esc(l2)}</b>` : ''}</div>
        <div class="cg-s-sub">${here.length ? `여기 있는 사람: ${esc(here.join(' · '))}` : '아는 얼굴이 보이지 않는다'}</div>`, 'side-move');
    // 동료
    const party = sideCard('PARTY', st.party.length ? `${st.party.length}명` : '', st.party.length ? st.party.map(m => `
        <div class="cg-s-mate">${settings().portraits ? `<div class="cg-s-ph sm" data-cg="ph-view" data-who="${esc(m.name)}" title="크게 보기 · 바꾸기">${portraitOf(m.name) ? `<img src="${esc(portraitOf(m.name))}" alt="">` : `<span>${esc(m.name.slice(0, 1))}</span>`}</div>` : ''}
            <div class="cg-s-hb"><div class="cg-s-name"><b>${esc(m.name)}</b><small>${esc([m.role, m.rank].filter(Boolean).join(' · '))}</small></div>
            <div class="cg-s-bars one"><span>HP</span>${bar(m.hp, m.maxhp, 'cg-hp')}<small>${m.hp}/${m.maxhp}</small></div>
            ${m.conds?.length ? `<div class="cg-s-sub cg-bad">${esc(m.conds.join(', '))}</div>` : ''}</div></div>`).join('') : '<div class="cg-s-sub">아직 함께 다니는 동료가 없다</div>', 'panel-tab', ' data-tab="party"');
    L.innerHTML = hero + cal + where + `<div class="cg-s-grow">${party}</div>`;
    // 편지 · 소식
    const fl = letterFlags(), letters = [...(st.letters || [])].reverse();
    const unread = letters.filter(l => !fl[l.id]);
    const show = [...unread, ...letters.filter(l => fl[l.id] && fl[l.id] !== 'h')].slice(0, 12);
    const news = E.gazette(st).items.slice(-1)[0];
    R.innerHTML = sideCard('LETTERS', `${unread.length ? `<span class="cg-s-tag">새 편지 ${unread.length}</span> ` : ''}<button class="cg-s-write" data-cg="letter-write" title="편지 쓰기">✎ 쓰기</button>`, `
        ${show.length ? `<ul class="cg-s-letters">${show.map(l => `<li class="${fl[l.id] ? '' : 'new'}" data-cg="side-letter" data-id="${esc(l.id)}"><b>${esc(l.from)}</b><span>${esc(l.body.replace(/\s+/g, ' ').slice(0, 30))}…</span><small>${E.formatDate(l.day).m}월 ${E.formatDate(l.day).d}일</small></li>`).join('')}</ul>` : '<div class="cg-s-sub">받은 편지가 없다</div>'}
        ${news ? `<div class="cg-s-lbl cg-s-news">${esc(news.h)}</div><div class="cg-s-sub">${esc(news.t)}</div>` : ''}`, 'panel-tab', ' data-tab="news"');
    if (H) H.innerHTML = `<span class="cg-s-lbl">CHRONICLE</span><span>${esc(l1)}${l2 ? ` — ${esc(l2)}` : ''}</span><small>${date.m}월 ${date.d}일 ${esc(tod)}</small>`;
}
window.addEventListener('resize', (() => { let t; return () => { clearTimeout(t); t = setTimeout(() => { if (!cur.active) return; applyBodyState(); renderSide(); }, 150); }; })());

/* ───────────────────────── 이벤트 ───────────────────────── */

let dockHidden = false;
function applyBodyState() {
    const on = cur.active && !!cur.state;
    document.body.classList.toggle('cg-active', on);
    const s = settings();
    const wide = isWide();
    document.body.classList.toggle('cg-wide', wide);
    const docked = cur.active && ((s.dock && !dockHidden) || wide);
    document.body.classList.toggle('cg-docked', docked);
    document.documentElement.style.setProperty('--cg-dock-w', `${Math.max(320, Math.min(640, s.dockWidth || 420))}px`);
    if (docked && !document.getElementById('cg-panel')?.classList.contains('cg-open')) openPanel();
    if (on) document.body.dataset.cgDiff = cur.state.difficulty;
    else delete document.body.dataset.cgDiff;
}

function refreshNow() {
    recompute();
    updatePrompt();
    applyBodyState();
    renderHud();
    renderQuick();
    renderPanel();
    renderModal();
    decorateAll();
    toastBig();
}
const refresh = debounce(refreshNow, 40);

function onClick(e) {
    const lt = e.target.closest('#chat .mes_text .cg-letter');
    if (lt && cur.state && !e.target.closest('a, button')) {
        const from = (lt.querySelector('b')?.textContent || '').trim();
        const body = lt.textContent.slice(from.length).replace(/\s+/g, ' ').trim().slice(0, 14);
        const l = (cur.state.letters || []).slice().reverse().find(x => x.from === from && x.body.replace(/\s+/g, ' ').includes(body));
        if (l) { openLetterView(l.id); return; }
    }
    const t = e.target.closest('[data-cg]');
    if (!t) return;
    const a = t.dataset.cg;
    switch (a) {
        case 'open-creator': e.preventDefault(); openCreator(); break;
        case 'close-creator': closeCreator(); break;
        case 'fsec': { const k = t.dataset.k; if (farmOpen.has(k)) farmOpen.delete(k); else farmOpen.add(k); t.closest('.cg-fsec')?.classList.toggle('open'); break; }
        case 'dock-toggle': { const st2 = settings(); st2.dock = !st2.dock; ctx().saveSettingsDebounced?.(); dockHidden = false; applyBodyState(); renderPanel(); document.querySelectorAll('#cg-settings [data-set="dock"]').forEach(x => x.checked = st2.dock); break; }
        case 'panel': e.preventDefault(); { const p = document.getElementById('cg-panel'); if (p?.classList.contains('cg-open')) closePanel(); else openPanel(); } break;
        case 'close-panel': closePanel(); break;
        case 'panel-cal': panelTab = 'cal'; calOffset = 0; openPanel(); break;
        case 'board': openModal('board'); break;
        case 'shop': openModal('shop'); break;
        case 'close-modal': closeModal(); break;
        case 'market': openModal('market'); break;
        case 'trade-open': { const id = t.dataset.id; const w = id != null ? E.parseWares(ctx().chat?.[Number(id)]?.mes || '') : null; openTrade(w); break; }
        case 'tr-give': if (trade?.done) break; { const n = t.dataset.name; const it = cur.state.items.find(i => i.name === n); trade.give[n] = Math.max(0, Math.min(it?.qty || 0, (trade.give[n] || 0) + Number(t.dataset.d))); renderModal(); break; }
        case 'tr-get': { const g = trade.get[Number(t.dataset.k)]; if (g) g.qty = Math.max(0, g.qty + Number(t.dataset.d)); renderModal(); break; }
        case 'tr-add': { const v = (document.querySelector('[data-tr="newGet"]')?.value || '').trim(); if (v) { trade.get.push({ name: v, price: null, qty: 1 }); renderModal(); } break; }
        case 'tr-send': proposeTrade(); break;
        case 'noble-sell': addManual([`귀족납품 ${t.dataset.house}`], `${t.dataset.house}에 주문 물건 납품`).then(renderModal); break;
        case 'noble-buy': addManual([`귀족구입 ${t.dataset.house}`], `${t.dataset.house}의 물건을 삼`).then(renderModal); break;
        case 'caravan': addManual(['상단결성'], '상단을 꾸림'); break;
        case 'scout': addManual([`스카웃수락 ${t.dataset.house} | ${t.dataset.role}`], `${t.dataset.house}의 스카웃 제의를 받아들여 ${t.dataset.role}이 됨 — 가문 사람과의 만남을 다음 장면에 그릴 것`).then(() => { if (modal) renderModal(); }); break;
        case 'patron-leave': if (!patronLeaveAsk) { patronLeaveAsk = true; if (modal) renderModal(); else renderPanel(); } else { patronLeaveAsk = false; addManual(['후원해지'], '후원 가문을 떠남 — 가문의 반응을 그릴 것').then(() => { if (modal) renderModal(); }); } break;
        case 'exam': addManual([`걸작제출 ${t.dataset.name}`], `${t.dataset.name}을 걸작 심사에 냄 — 심사관들의 평을 그릴 것`); break;
        case 'order-take': addManual([`주문수락 ${t.dataset.id}`], '주문 제작을 맡음'); break;
        case 'order-deliver': addManual([`주문납품 ${t.dataset.id}`], '주문한 물건을 의뢰인에게 넘김'); break;
        case 'order-drop': if (orderDropAsk !== t.dataset.id) { orderDropAsk = t.dataset.id; renderPanel(); } else { orderDropAsk = null; addManual([`주문포기 ${t.dataset.id}`], '맡은 주문을 포기함'); } break;
        case 'work': { const n = t.dataset.name; const d = Math.max(1, Math.min(30, parseInt(document.querySelector(`[data-wq="${CSS.escape(n)}"]`)?.value) || 1)); addManual([`일하기 ${n} ${d}일`], `${n} 일을 ${d}일 함 — 일터의 사람들과 일어난 일을 그릴 것`); break; }
        case 'estate-buy': addManual([`부동산구입 ${t.dataset.name}`], `${t.dataset.name}을 사들임`); break;
        case 'estate-sell': if (estateSellAsk !== t.dataset.name) { estateSellAsk = t.dataset.name; renderPanel(); } else { estateSellAsk = null; addManual([`부동산매각 ${t.dataset.name}`], `${t.dataset.name}을 팖`); } break;
        case 'craft-make': { const n = t.dataset.name; const q = Math.max(1, parseInt(document.querySelector(`[data-cq="${CSS.escape(n)}"]`)?.value) || 1); addManual([`제작 ${n} ${q}`], `${n} ${q}개를 만들며 며칠을 보냄`); break; }
        case 'craft-deliver': { const n = t.dataset.name; const q = Math.max(1, parseInt(document.querySelector(`[data-dq="${CSS.escape(n)}"]`)?.value) || 1); addManual([`납품 ${n} ${q}`], `${n} ${q}개를 납품함`); break; }
        case 'craft-display': { const n = t.dataset.name; const q = Math.max(1, parseInt(document.querySelector(`[data-dq="${CSS.escape(n)}"]`)?.value) || 1); const sh = document.querySelector(`[data-ds="${CSS.escape(n)}"]`)?.value; addManual([`진열 ${sh} | ${n} ${q}`]); break; }
        case 'gather': { const n = t.dataset.name; const d = Math.max(1, Math.min(30, parseInt(document.querySelector(`[data-gq="${CSS.escape(n)}"]`)?.value) || 1)); addManual([`생산 ${n} ${d}일`], `${n}로 ${d}일을 보냄`); break; }
        case 'shop-open': {
            const n = document.getElementById('cg-so-name')?.value.trim();
            if (!n) { toastr?.info?.('가게 이름을 적어 주세요.', '왕관과 길드'); break; }
            addManual([`가게개업 ${n} | ${document.getElementById('cg-so-kind').value} | ${document.getElementById('cg-so-tier').value}`], `${n} 개업`); break;
        }
        case 'shop-stock': {
            const v = (document.querySelector(`[data-ss="${CSS.escape(t.dataset.name)}"]`)?.value || '').trim();
            if (!v) { toastr?.info?.('넣을 금액을 적어 주세요.', '왕관과 길드'); break; }
            addManual([`재고 ${t.dataset.name} | ${v}`]); break;
        }
        case 'shop-collect': addManual([`수금 ${t.dataset.name}`]); break;
        case 'fam-disown': if (!disownAsk) { disownAsk = true; renderPanel(); break; } disownAsk = false; addManual(['의절'], '가문과 의절함 — 그 결심과 집안의 반응을 그릴 것'); break;
        case 'fam-return': addManual(['가문복귀'], '가문으로 돌아감 — 집안 사람들의 반응을 그릴 것'); break;
        case 'baby-news': addManual([`임신 ${cur.state?.spouse?.name || ''}`], '아이가 생겼다는 소식 — 그 순간을 그릴 것'); break;
        case 'adopt-open': adoptOpen = !adoptOpen; renderPanel(); break;
        case 'adopt': { const n = document.getElementById('cg-ad-name')?.value.trim(); const sx = document.getElementById('cg-ad-sex')?.value; const ag = parseInt(document.getElementById('cg-ad-age')?.value) || 0; if (!n) { toastr?.info?.('이름을 적어 주세요.', '왕관과 길드'); break; } adoptOpen = false; addManual([`자녀 +${n} | ${sx} | ${ag}`], `${E.josa(n, '을', '를')} 가족으로 들임 — 그 사연을 그릴 것`); break; }
        case 'staff-edit': staffEdit = staffEdit === t.dataset.id ? null : t.dataset.id; renderPanel(); break;
        case 'staff-rename': { const n = document.getElementById('cg-staff-name')?.value.trim(); if (n) { staffEdit = null; addManual([`고용인이름 ${t.dataset.where} | ${t.dataset.role} | ${n}`]); } break; }
        case 'kid-name': { const n = document.getElementById(`cg-kn-${t.dataset.id}`)?.value.trim(); if (!n) { toastr?.info?.('이름을 적어 주세요.', '왕관과 길드'); break; } addManual([`아이이름 ${t.dataset.name} | ${n}`], `아이에게 '${n}'이라는 이름을 지어 줌`); break; }
        case 'kid-heir': addManual([`후계자 ${t.dataset.name}`], `${E.josa(t.dataset.name, '을', '를')} 후계자로 정함`); break;
        case 'kid-role': { const v = document.getElementById(`cg-kr-${t.dataset.id}`)?.value || '없음'; addManual([`가업맡기기 ${t.dataset.name} | ${v}`]); break; }
        case 'kid-pass': if (passAsk !== t.dataset.name) { passAsk = t.dataset.name; renderPanel(); break; } passAsk = null; addManual([`세대교체 ${t.dataset.name}`], `세월이 흘러 ${t.dataset.name}에게 대를 물려줌 — 새 주인공의 첫 장면을 그릴 것`); break;
        case 'spouse-role': { const v = document.getElementById('cg-sp-role')?.value || '없음'; addManual([`가업맡기기 ${t.dataset.name} | ${v}`]); break; }
        case 'match-ok': addManual([`혼담수락 ${t.dataset.for} | ${t.dataset.who}`], `${t.dataset.for === '본인' ? '나' : t.dataset.for}의 혼담을 받아들임 — 두 집안이 만나는 장면을 그릴 것`); break;
        case 'match-no': addManual([`혼담거절 ${t.dataset.for} | ${t.dataset.who}`], `혼담을 정중히 거절함`); break;
        case 'gear-fix': addManual([`수리 ${t.dataset.slot}`]); break;
        case 'gear-up': addManual([`강화 ${t.dataset.slot}`], `대장간에서 ${E.josa(t.dataset.slot, '을', '를')} 강화함`); break;
        case 'codex': codexOpen = codexOpen === t.dataset.name ? null : t.dataset.name; renderPanel(); break;
        case 'chron-add': { const v = document.getElementById('cg-chron-in')?.value.trim(); if (v) addManual([`연대기 ${v}`]); break; }
        case 'note-edit': noteEdit = noteEdit === t.dataset.name ? null : t.dataset.name; renderPanel(); break;
        case 'note-save': { const v = document.getElementById('cg-note-in')?.value.trim(); noteEdit = null; if (v) addManual([`인물 ${t.dataset.name} | ${v}`]); else renderPanel(); break; }
        case 'note-new': { const n = document.getElementById('cg-nn-name')?.value.trim(), v = document.getElementById('cg-nn-text')?.value.trim(); if (n && v) addManual([`인물 ${n} | ${v}`]); break; }
        case 'miss-fix': openPanel('edit'); break;
        case 'miss-ok': { const mm = ctx().chat?.[Number(t.dataset.mesid)]; if (mm) { mm.extra = mm.extra || {}; mm.extra.cg_missok = true; saveChat(); decorateAll(); } break; }
        case 'side-move': openModal('act', 'move'); break;
        case 'side-letter': openLetterView(t.dataset.id); break;
        case 'letter-pop': openLetterView(t.dataset.id); break;
        case 'lp-close': closeLetterView(); break;
        case 'lp-reply': openLetterCompose(t.dataset.from); break;
        case 'lp-hide': { letterFlags()[t.dataset.id] = 'h'; if (letterOpen === t.dataset.id) letterOpen = null; saveChat(); closeLetterView(); renderSide(); renderPanel(); break; }
        case 'letter-open': { letterOpen = t.dataset.id; const fl = letterFlags(); if (!fl[letterOpen]) { fl[letterOpen] = 'r'; saveChat(); } renderPanel(); renderHud(); break; }
        case 'letter-close': letterOpen = null; renderPanel(); break;
        case 'dex-group': dexGroup = t.dataset.val || ''; renderPanel(); break;
        case 'cheat-realm': cheatRealm = cheatRealm === t.dataset.val ? '' : t.dataset.val; renderPanel(); break;
        case 'cheat-relic': cheatBand = document.getElementById('cg-ch-band')?.value || ''; cheat([`발견 ${t.dataset.k} ${document.getElementById('cg-ch-band')?.value || ''}`.replace(/\s+/g, ' ').trim()]); break;
        case 'cheat-evo': { const n = document.getElementById('cg-ch-evo')?.value; const sp = document.getElementById('cg-ch-evosp')?.value.trim(); if (n && sp) cheat([`진화 ${n} | ${sp} | 강제`]); break; }
        case 'cheat-spel': cheatSpEl = cheatSpEl === t.dataset.val ? '' : t.dataset.val; renderPanel(); break;
        case 'ph-menu': phMenu = phMenu === t.dataset.who ? null : t.dataset.who; renderPanel(); break;
        case 'ph-up': pickPortraitFile(t.dataset.who); break;
        case 'ph-url': askPortraitUrl(t.dataset.who); break;
        case 'ph-clear': delete portraits()[t.dataset.who]; phMenu = null; saveChat(); renderPanel(); if (document.getElementById('cg-photoview')?.classList.contains('cg-open')) openPhotoView(t.dataset.who); break;
        case 'ph-view': e.stopPropagation(); phMenu = null; openPhotoView(t.dataset.who); renderPanel(); break;
        case 'pv-close': closePhotoView(); break;
        case 'letter-hide': { letterFlags()[t.dataset.id] = 'h'; letterOpen = null; saveChat(); renderPanel(); break; }
        case 'letter-reply': openLetterCompose(t.dataset.from); break;
        case 'letter-write': openLetterCompose(); break;
        case 'lw-to': { const i = document.getElementById('cg-lw-to'); if (i) { i.value = t.dataset.val; document.getElementById('cg-lw-body')?.focus(); } break; }
        case 'lw-input': { const tx = letterComposeText(); if (tx) { closeLetterView(); insertInput(tx); } break; }
        case 'lw-send': { const tx = letterComposeText(); if (tx) { closeLetterView(); insertInput(tx); document.getElementById('send_but')?.click(); } break; }
        case 'chron-book': {
            const st = cur.state; if (!st) break;
            const blob = new Blob([E.chronicleBookHtml(st)], { type: 'text/html' });
            const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `${st.profile.name}의_연대기.html`;
            document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
            toastr?.success?.('연대기 책을 파일로 저장했습니다 — 브라우저로 열거나 인쇄할 수 있어요.', '왕관과 길드');
            break;
        }
        case 'guide-done': settings().guideSeen = true; ctx().saveSettingsDebounced?.(); decorateAll(); break;
        case 'guide-reset': settings().guideSeen = false; ctx().saveSettingsDebounced?.(); decorateAll(); toastr?.info?.('첫 GM 메시지 아래에 안내가 다시 보입니다.', '왕관과 길드'); break;
        case 'save-export': exportState(); break;
        case 'save-import': pickImportFile(); break;
        case 'aging': addManual([`나이먹기 ${t.dataset.val}`]); break;
        case 'shop-auto': { const v = +(document.getElementById(`cg-auto-${t.dataset.name}`)?.value || 0); addManual([`자동보충 ${t.dataset.name} | ${v ? `${v}일` : '끔'}`]); break; }
        case 'shop-supply': { const v = document.getElementById(`cg-sup-${t.dataset.name}`)?.value || '없음'; addManual([`식재료 ${t.dataset.name} | ${v}`]); break; }
        case 'war-serve': addManual(['군역 참전'], '소집령에 응해 군역에 나섬 — 출정 장면을 그릴 것'); break;
        case 'house-name': { const n = document.getElementById('cg-house-name')?.value.trim(); if (n) addManual([`가문창설 ${n}`]); break; }
        case 'horse-buy': { const fm = document.getElementById('cg-hb-farm')?.value || ''; addManual([`말구입 ${t.dataset.name}${fm ? ` | ${fm}` : ''}`], `말 시장에서 ${E.josa(t.dataset.name, '을', '를')} 사들임`); break; }
        case 'horse-rename-open': horseRenameOpen = horseRenameOpen === t.dataset.id ? null : t.dataset.id; renderPanel(); break;
        case 'horse-rename': { const n = document.getElementById(`cg-hn-${t.dataset.id}`)?.value.trim(); if (!n) { toastr?.info?.('새 이름을 적어 주세요.', '왕관과 길드'); break; } horseRenameOpen = null; addManual([`말이름 ${t.dataset.name} | ${n}`]); break; }
        case 'horse-sell': addManual([`말판매 ${t.dataset.name}`]); break;
        case 'stable-care': addManual([`마구간관리 ${t.dataset.farm} | ${t.dataset.mode}`], ''); break;
        case 'horse-care-all': addManual(['말돌보기 전부 | 5'], '마구간의 말들을 며칠 동안 함께 돌봄'); break;
        case 'horse-care': addManual([`말돌보기 ${t.dataset.name} | 5`], `${E.josa(t.dataset.name, '을', '를')} 며칠 동안 정성껏 돌봄`); break;
        case 'horse-ride': addManual([`말타고가기 ${t.dataset.name}`], `${E.josa(t.dataset.name, '을', '를')} 타고 길을 나섬`); break;
        case 'horse-stud-ok': addManual([`교배수락 ${t.dataset.name}`], `${t.dataset.from}의 교배 신청을 받아들임`); break;
        case 'horse-bid-ok': addManual([`말제안수락 ${t.dataset.name} | ${t.dataset.from}`], `${t.dataset.from}에 ${E.josa(t.dataset.name, '을', '를')} 넘김 — 가문 사람이 말을 데리러 오는 장면`); break;
        case 'horse-breed': { const fi = t.dataset.fi; const m = document.getElementById(`cg-mare-${fi}`)?.value; const sv = document.getElementById(`cg-sire-${fi}`)?.value || ''; const [k, n] = sv.split('|'); if (m && n) addManual([`${k === 'mine' ? '말교배' : '종마교배'} ${m} | ${n}`], `${m}의 교배`); break; }
        case 'farm-buy': { const n = document.getElementById('cg-fb-name')?.value.trim(); const q = parseInt(document.getElementById('cg-fb-n')?.value) || 1; const o = document.getElementById('cg-fb-orch')?.value; if (!n) { toastr?.info?.('농장 이름을 적어 주세요.', '왕관과 길드'); break; } addManual([`농장구입 ${n} | ${q}필지${o ? ` | 과수원 ${o}` : ''}`], `${n}의 땅 ${q}필지를 사들임`); break; }
        case 'farm-plant': { const f = farmOf(t); const w = document.getElementById(`cg-plant-${t.dataset.fi}`)?.value; const q = parseInt(document.getElementById(`cg-plantn-${t.dataset.fi}`)?.value) || 1; if (f && w) addManual([`경작 ${f.name} | ${w} ${q}`]); break; }
        case 'farm-clear': { const f = farmOf(t); if (f) addManual([`휴경 ${f.name} | ${t.dataset.what}`]); break; }
        case 'farm-worker': { const f = farmOf(t); if (f) addManual([`농장일꾼 ${f.name} | ${t.dataset.d > 0 ? '+1' : '-1'}`]); break; }
        case 'farm-steward': { const f = farmOf(t); if (f) addManual([`관리인 ${f.name} | ${f.steward ? '해고' : '고용'}`]); break; }
        case 'farm-sellland': { const f = farmOf(t); if (f) addManual([`농장매각 ${f.name} | 1필지`]); break; }
        case 'stock-buy': case 'stock-sell': { const f = farmOf(t); const q = parseInt(document.getElementById(`cg-hq-${t.dataset.fi}-${t.dataset.a}`)?.value) || 1; if (f) addManual([`${a === 'stock-buy' ? '가축구입' : '가축매각'} ${f.name} | ${t.dataset.a} ${q}`]); break; }
        case 'farm-horse': { const f = farmOf(t); if (f) addManual([`말데려오기 ${f.name}`], `${f.name}에서 기른 말 한 마리를 데리고 나섬`); break; }
        case 'farm-brew': { const f = farmOf(t); const d = document.getElementById(`cg-brew-${t.dataset.fi}`)?.value; const q = parseInt(document.getElementById(`cg-brewn-${t.dataset.fi}`)?.value) || 1; if (f && d) addManual([`양조 ${f.name} | ${d} ${q}`], `${f.name}에서 ${d}을 담금`); break; }
        case 'farm-ship': { const f = farmOf(t); const sh = document.getElementById(`cg-shipshop-${t.dataset.fi}`)?.value || ''; if (f) addManual([`출하 ${f.name} | ${t.dataset.g} ${t.dataset.n || '전부'}${sh ? ` | ${sh}` : ''}`]); break; }
        case 'farm-load': { const f = farmOf(t); if (f) addManual([`싣기 ${f.name} | ${t.dataset.g} 전부`]); break; }
        case 'menu-add': { const v = document.getElementById(`cg-menu-${t.dataset.name}`)?.value; if (v) addManual([`메뉴추가 ${t.dataset.name} | ${v}`]); break; }
        case 'menu-del': addManual([`메뉴빼기 ${t.dataset.name} | ${t.dataset.dish}`]); break;
        case 'menu-sig': addManual([`대표메뉴 ${t.dataset.name} | ${t.dataset.dish}`]); break;
        case 'shop-move': { const v = document.getElementById(`cg-move-${t.dataset.name}`)?.value; if (v) addManual([`가게이전 ${t.dataset.name} | ${v}`], `${t.dataset.name} 자리를 ${E.josa(v, '으로', '로')} 옮김`); break; }
        case 'banquet': { const h = document.getElementById(`cg-banq-${t.dataset.name}`)?.value, k = document.getElementById(`cg-banqk-${t.dataset.name}`)?.value; if (h) addManual([`가문연회 ${h} | ${k}`], `${h}의 연회에 ${k}을 차려 냄 — 연회 장면과 손님들의 반응을 그릴 것`); break; }
        case 'shop-staff': addManual([`점원 ${t.dataset.name} | ${t.dataset.d > 0 ? '+1' : '-1'}`]); break;
        case 'shop-up': addManual([`가게확장 ${t.dataset.name}`], `${t.dataset.name} 확장`); break;
        case 'shop-close': if (shopCloseAsk !== t.dataset.name) { shopCloseAsk = t.dataset.name; renderPanel(); } else { shopCloseAsk = null; addManual([`가게폐업 ${t.dataset.name}`], `${t.dataset.name} 폐업`); } break;
        case 'tr-haggle': haggleTrade(); break;
        case 'mkt-buy': case 'mkt-sell': {
            const n = t.dataset.name; const q = Math.max(1, parseInt(document.querySelector(`[data-mq="${CSS.escape(n)}"]`)?.value) || 1);
            addManual([`${t.dataset.cg === 'mkt-buy' ? '매입' : '매각'} ${n} ${q}`]).then(renderModal); break;
        }
        case 'mtab': modal.tab = t.dataset.tab; renderModal(); break;
        case 'map-view': modal.map = t.dataset.view; modal.pin = ''; renderModal(); break;
        case 'map-pin': modal.pin = modal.pin === t.dataset.pin ? '' : t.dataset.pin; renderModal(); break;
        case 'buy': doBuy(t.dataset.name, Number(t.dataset.price)); break;
        case 'cart-add': { const n = t.dataset.name; if (cart[n]) { if (!cart[n].one) cart[n].qty++; } else cart[n] = { price: Number(t.dataset.price), qty: 1, one: !!t.dataset.one }; renderModal(); break; }
        case 'cart-q': { const n = t.dataset.name; if (cart[n]) { cart[n].qty += Number(t.dataset.d); if (cart[n].qty <= 0) delete cart[n]; } renderModal(); break; }
        case 'cart-clear': cart = {}; renderModal(); break;
        case 'pet-form': petFormOpen = !petFormOpen; renderPanel(); break;
        case 'pet-adopt': {
            const n = document.getElementById('cg-pet-name')?.value.trim(), sp = document.getElementById('cg-pet-sp')?.value || '강아지', tr = document.getElementById('cg-pet-tr')?.value || '';
            if (!n) { toastr?.info?.('이름을 지어 주세요.', '왕관과 길드'); break; }
            petFormOpen = false;
            addManual([t.dataset.mode === 'rescue' ? `구조 ${n} | ${sp} | ${tr}` : `입양 ${n} | ${sp} | ${tr} | 분양`], t.dataset.mode === 'rescue' ? `길에서 곤경에 처한 ${sp}를 구해 「${n}」이라 이름 짓고 데려옴 — 그 만남을 짧게 그릴 것` : `${sp}를 분양받아 「${n}」이라 이름 지음 — 데려오는 장면을 짧게 그릴 것`);
            break;
        }
        case 'pet-care': addManual([`돌보기 ${t.dataset.val}`], `${t.dataset.val}를 돌봄 (먹이·빗질·산책)`); break;
        case 'spirit-name': { const v = document.getElementById(`cg-spn-${t.dataset.val}`)?.value.trim(); if (v) addManual([`정령이름 ${t.dataset.val} | ${v}`], `정령 ${t.dataset.val}에게 「${v}」라는 이름을 지어 줌`); break; }
        case 'cart-pay': cartPay(); break;
        case 'sell': doSell(t.dataset.name, Number(t.dataset.price)); break;
        case 'haggle': closeModal(); insertInput(`(상점 주인에게 「${t.dataset.name}」 값을 얼마나 쳐 줄지 묻는다)`); break;
        case 'accept': doAccept(t.dataset.type, Number(t.dataset.i)); break;
        case 'equip': addManual([`장착 ${E.SLOT_LABEL[t.dataset.slot]} ${t.dataset.name}`], `「${t.dataset.name}」 장착`); break;
        case 'comp-call': addManual([`불러내기 ${t.dataset.val}`], `${t.dataset.val}를 불러냄`); break;
        case 'bank': {
            const all = t.dataset.all === '1';
            const amt = (document.getElementById('cg-bank-amt')?.value || '').trim();
            if (!all && !amt) { toastr?.info?.('금액을 적어 주세요.', '왕관과 길드'); break; }
            const v = all ? '전부' : amt;
            addManual([`${t.dataset.val} ${v}`], `길드 ${({ 예금: '예금', 인출: '인출', 외상: '보증 외상', 외상상환: '외상 상환' })[t.dataset.val] || t.dataset.val}: ${v}`);
            break;
        }
        case 'comp-home': addManual([`데려오기 ${t.dataset.val}`], `${t.dataset.val}를 데려옴`); break;
        case 'comp-stable': addManual([`맡기기 ${t.dataset.val} | 마구간`], `${t.dataset.val}를 마구간에 맡김`); break;
        case 'comp-back': addManual([`돌려보내기 ${t.dataset.val}`], `${t.dataset.val}를 돌려보냄`); break;
        case 'living': if (!t.disabled) addManual([`생활 ${t.dataset.val}`], `생활 수준 변경: ${t.dataset.val}`); break;
        case 'cal': calOffset += Number(t.dataset.d); renderPanel(); break;
        case 'readbook': {
            const sk = E.findSkill(t.dataset.name);
            if (sk) addManual([`아이템 -${t.dataset.name} 1`, `기술습득 ${sk.name}`], `교본을 읽고 ${E.josa('「' + sk.name + '」', '을', '를')} 익혔다 — 교본을 붙들고 연습하는 짧은 장면을 넣고, 처음이라 아직 서툴다는 느낌으로`);
            break;
        }
        case 'setcls': addManual([`클래스 ${t.dataset.val}`], `주 클래스를 ${E.josa(t.dataset.val, '으로', '로')} 바꿈`); break;
        case 'setsub': addManual([`보조 클래스 ${t.dataset.val}`], t.dataset.val === '없음' ? '보조 클래스를 내려놓음' : `보조 클래스를 ${E.josa(t.dataset.val, '으로', '로')} 정함`); break;
        case 'cheat': cheat(t.dataset.lines.split('\n').filter(Boolean)); break;
        case 'cheat-set': {
            const v = document.getElementById(t.dataset.src)?.value;
            if (v !== undefined && v !== '') cheat([t.dataset.tpl.replace('{v}', v)]);
            break;
        }
        case 'cheat-money': {
            const g = Number(document.getElementById('cg-ch-g')?.value) || 0, sv = Number(document.getElementById('cg-ch-s')?.value) || 0, c = Number(document.getElementById('cg-ch-c')?.value) || 0;
            const total = g * 10000 + sv * 100 + c;
            if (t.dataset.mode === 'set') cheat([`돈 =${total}동`]); else if (total) cheat([`돈 +${total}동`]);
            break;
        }
        case 'cheat-newrel': {
            const n = document.getElementById('cg-ch-newname')?.value.trim(); const v = document.getElementById('cg-ch-newval')?.value;
            if (n && v !== '') cheat([`호감 ${n} =${v}`]);
            break;
        }
        case 'cheat-cls': {
            const c = document.getElementById('cg-ch-cls')?.value; const lv = Number(document.getElementById('cg-ch-clslv')?.value) || 1;
            if (c) cheat([`클래스습득 강제 ${c}`, `클래스레벨 ${c} =${lv}`]);
            break;
        }
        case 'cheat-stats': {
            document.querySelectorAll('[data-chstat]').forEach(i => i.classList.remove('cg-changed'));
            const lines = [...document.querySelectorAll('[data-chstat]')].map(i => [i.dataset.chstat, Math.max(1, Math.min(999, parseInt(i.value) || 0))]).filter(([k, v]) => v && v !== cur.state.stats[k]).map(([k, v]) => `능력 ${k} =${v}`);
            if (lines.length) cheat(lines);
            break;
        }
        case 'cheat-stats-all': {
            // 입력칸만 바꾼다 — '적용'을 눌러야 반영
            const v = parseInt(document.getElementById('cg-ch-statall')?.value);
            for (const i of document.querySelectorAll('[data-chstat]')) {
                const now = parseInt(i.value) || cur.state.stats[i.dataset.chstat];
                i.value = Math.max(1, Math.min(999, t.dataset.set ? (v >= 1 ? v : now) : now + Number(t.dataset.n)));
                i.classList.toggle('cg-changed', Number(i.value) !== cur.state.stats[i.dataset.chstat]);
            }
            break;
        }
        case 'cheat-stats-reset': for (const i of document.querySelectorAll('[data-chstat]')) { i.value = cur.state.stats[i.dataset.chstat]; i.classList.remove('cg-changed'); } break;
        case 'cheat-sk-all': {
            const list = E.SKILL_TREE[cheatSkCls] || [];
            if (t.dataset.mode === 'learn') cheat(list.filter(x => !cur.state.cskills?.[x[0]]).map(x => `기술습득 ${x[0]}`));
            else { const v = parseInt(document.getElementById('cg-ch-sktier')?.value) || 0; cheat(list.flatMap(x => [...(cur.state.cskills?.[x[0]] ? [] : [`기술습득 ${x[0]}`]), `숙련 ${x[0]} =${v}`])); }
            break;
        }
        case 'cheat-sk-apply': {
            const lines = [];
            for (const i of document.querySelectorAll('[data-chsk]')) {
                const n = i.dataset.chsk, v = Math.max(0, parseInt(i.value) || 0), k = cur.state.cskills?.[n];
                if ((k?.p || 0) === v && (k || !v)) continue;
                if (!k) lines.push(`기술습득 ${n}`);
                lines.push(`숙련 ${n} =${v}`);
            }
            if (lines.length) cheat(lines);
            break;
        }
        case 'cheat-skill': {
            const n = document.getElementById('cg-ch-skill')?.value;
            if (n) cheat([t.dataset.mode === 'learn' ? `기술습득 ${n}` : `숙련 ${n} +50`]);
            break;
        }
        case 'cheat-comp': {
            const n = document.getElementById('cg-ch-cname')?.value.trim();
            const k = document.getElementById('cg-ch-ckind')?.value || '마수';
            const sp = document.getElementById('cg-ch-csp')?.value.trim() || '';
            const el = document.getElementById('cg-ch-cel')?.value || '';
            if (n) cheat([`동반자 +${n} | ${k} | ${sp} | ${el} | | | 강제`]);
            break;
        }
        case 'cheat-focus': {
            const n = document.getElementById('cg-ch-focus')?.value.trim();
            if (n) cheat([`특화 ${n} +${t.dataset.n}`]);
            break;
        }
        case 'cheat-life': {
            const k = document.getElementById('cg-ch-life')?.value; const r = document.getElementById('cg-ch-lrank')?.value;
            if (k && r) cheat([`기술랭크 ${k} ${r}`]);
            break;
        }
        case 'cheat-item': {
            const n = document.getElementById('cg-ch-item')?.value.trim(); const q = Math.max(1, Number(document.getElementById('cg-ch-qty')?.value) || 1);
            if (n) cheat([`아이템 +${n} ${q}`]);
            break;
        }
        case 'tab': panelTab = t.dataset.tab; renderPanel(); break;
        case 'branch': openBranches.set(t.dataset.val, !openBranches.get(t.dataset.val)); renderPanel(); break;
        case 'roll': doRoll(Number(t.dataset.mesid)); break;
        case 'free-roll': freeRoll(); break;
        case 'choice': insertInput(t.dataset.text, settings().choiceAutoSend); break;
        case 'quick': insertInput(t.dataset.text); break;
        case 'act-open': openModal('act'); break;
        case 'act': closeModal(); insertInput(t.dataset.text, !!settings().choiceAutoSend && !/: \)$/.test(t.dataset.text)); break;
        case 'act-gift': { const it = document.querySelector(`[data-gift="${CSS.escape(t.dataset.who)}"]`)?.value; if (it) { closeModal(); insertInput(`(${t.dataset.who}에게 ${E.josa(it, '을', '를')} 선물한다)`); } break; }
        case 'act-skill': { const k = document.getElementById('cg-act-skill')?.value; if (k) { closeModal(); insertInput(`(${E.josa(k, '을', '를')} 하루 종일 연습한다)`); } break; }
        case 'act-life': { const k = document.getElementById('cg-act-life')?.value; if (k) { closeModal(); insertInput(`(하루 동안 ${E.josa(k, '을', '를')} 수련한다)`); } break; }
        case 'panel-tab': closeModal(); openPanel(t.dataset.tab); break;
        case 'stat-up': { const st2 = cur.state, k = t.dataset.stat, n = Math.min(Number(t.dataset.n) || 1, st2.statPoints, E.statCap(st2) - st2.stats[k]); if (n > 0) addManual([`능력 ${k} =${st2.stats[k] + n}`, `포인트 -${n}`]); break; }
        case 'manual-apply': {
            const v = document.getElementById('cg-manual')?.value || '';
            const lines = v.split(/\r?\n/).map(x => x.trim()).filter(Boolean);
            if (lines.length) addManual(lines).then(() => toastr?.success?.(`${lines.length}줄 적용`, '왕관과 길드'));
            break;
        }
        case 'export': {
            navigator.clipboard?.writeText(JSON.stringify(cur.state, null, 2)).then(() => toastr?.info?.('클립보드에 복사했습니다.', '왕관과 길드'));
            break;
        }
        case 'reset': if (confirm('이 채팅의 캐릭터를 다시 만들까요?')) { closePanel(); openCreator(); } break;
        // 생성 창
        case 'pick': cf[t.dataset.key] = t.dataset.val; if (t.dataset.key === 'job' && !cf.clsTouched) cf.cls = E.JOB_DEFAULT_CLASS[cf.job] || cf.cls; if (t.dataset.key === 'origin' && cf.origin !== 'transferred' && cf.background === '이방인') cf.background = '농민'; renderCreator(); break;
        case 'perk': {
            const k = t.dataset.val;
            if (cf.perks.includes(k)) cf.perks = cf.perks.filter(x => x !== k);
            else if (cf.perks.length < perkSlots()) cf.perks.push(k);
            else if (perkSlots() === 1) cf.perks = [k];
            renderCreator();
            break;
        }
        case 'alloc': {
            const s = t.dataset.stat, d = Number(t.dataset.d);
            const next = cf.alloc[s] + d;
            if (d > 1) cf.alloc[s] = Math.min(ALLOC_MAX, cf.alloc[s] + Math.min(d, poolSize() - usedPoints()));
            else if (next >= 0 && next <= ALLOC_MAX && (d < 0 || usedPoints() < poolSize())) cf.alloc[s] = next;
            renderCreator();
            break;
        }
        case 'pickcls': if (cf.cls !== t.dataset.val) { cf.focus = ''; cf.compSpecies = ''; } cf.cls = t.dataset.val; cf.clsTouched = true; renderCreator(); break;
        case 'affauto': cf.affMode = 'auto'; cf.affinity = []; renderCreator(); break;
        case 'affnone': cf.affMode = 'none'; cf.affinity = []; renderCreator(); break;
        case 'pickaff': {
            const e = t.dataset.val, max = E.maxAffinity(cf.difficulty);
            if (cf.affMode !== 'pick') { cf.affMode = 'pick'; cf.affinity = []; }
            if (cf.affinity.includes(e)) cf.affinity = cf.affinity.filter(x => x !== e);
            else { cf.affinity.push(e); if (cf.affinity.length > max) cf.affinity.shift(); }
            if (!cf.affinity.length) cf.affMode = 'auto';
            renderCreator(); break;
        }
        case 'pickcomp': cf.compSpecies = t.dataset.val; renderCreator(); break;
        case 'pickfocus': cf.focus = cf.focus === t.dataset.val ? '' : t.dataset.val; renderCreator(); break;
        case 'picklife': {
            const k = t.dataset.val;
            if (cf.life.includes(k)) cf.life = cf.life.filter(x => x !== k);
            else if (cf.life.length < 2) cf.life.push(k);
            else cf.life = [cf.life[1], k];
            renderCreator();
            break;
        }
        case 'alloc-reset': cf.alloc = Object.fromEntries(E.STATS.map(s => [s, 0])); renderCreator(); break;
        case 'alloc-auto': autoAlloc(); renderCreator(); break;
        case 'cstep': cstep = Number(t.dataset.step); renderCreator(); break;
        case 'cprev': if (cstep > 0) { cstep--; renderCreator(); } break;
        case 'cnext':
            if (cstep === 2 && !cf.name.trim()) { toastr?.warning?.('이름을 정해 주세요.', '왕관과 길드'); return; }
            if (cstep === 4 && usedPoints() === 0) autoAlloc(); // 능력치 단계로 넘어갈 때 기본 배분
            cstep++; renderCreator(); break;
        case 'create': createCharacter(); break;
    }
}

function onInput(e) {
    const t = e.target;
    if (!t.dataset?.cf || !cf) return;
    const path = t.dataset.cf.split('.');
    const val = t.type === 'checkbox' ? t.checked : t.value;
    if (path.length === 2) cf[path[0]][path[1]] = val; else cf[path[0]] = val;
    if (t.tagName === 'SELECT' || t.type === 'checkbox') return;
    const note = document.querySelector('#cg-creator .cg-cr-note');
    if (note) note.textContent = footNote();
}

async function init() {
    await loadFallbacks();
    const c = ctx();
    const et = c.eventTypes || c.event_types;
    const on = (ev, fn) => { if (ev) c.eventSource.on(ev, fn); };

    document.addEventListener('click', onClick);
    probeBundled();
    { const av = document.getElementById('avatar_load_preview'); if (av) { new MutationObserver(fullCharAvatar).observe(av, { attributes: true, attributeFilter: ['src'] }); fullCharAvatar(); } }
    window.addEventListener('resize', debounce(() => { const els = [...document.querySelectorAll('#chat .mes')]; els.forEach(el => { el.__cgNameKey = null; }); measureNames(els); }, 150));
    document.addEventListener('change', (e) => { if (e.target?.dataset?.cgChange === 'pet-home') addManual([`반려자리 ${e.target.dataset.val} | ${e.target.value || '곁'}`]); });
    document.addEventListener('change', (e) => { if (e.target?.dataset?.cgChange === 'cheat-skcls') { cheatSkCls = e.target.value; const b = document.querySelector('#cg-panel .cg-p-body'), y = b?.scrollTop; renderPanel(); const b2 = document.querySelector('#cg-panel .cg-p-body'); if (b2 && y !== undefined) b2.scrollTop = y; } });
    document.addEventListener('change', (e) => { if (e.target?.id === 'cg-so-kind') { soKind = e.target.value; const n = document.getElementById('cg-so-name')?.value || ''; renderPanel(); const el = document.getElementById('cg-so-name'); if (el) el.value = n; } });
    document.addEventListener('input', (e) => { const k = e.target?.dataset?.tr; if (k === 'with' && trade) trade.with = e.target.value; });
    document.addEventListener('change', (e) => {
        const k = e.target?.dataset?.tr; if (!k || !trade) return;
        if (k === 'giveMoney' || k === 'getMoney') { trade[k] = Math.max(0, E.parseMoney(e.target.value)?.value || 0); const el = document.querySelector('#cg-modal .cg-trade-sum'); if (el && cur.state) el.outerHTML = tradeSumHtml(cur.state); }
    });
    document.addEventListener('input', onInput);
    document.addEventListener('input', (e) => { const k = e.target?.dataset?.chstat; if (k && cur.state) e.target.classList.toggle('cg-changed', Number(e.target.value) !== cur.state.stats[k]); });
    document.addEventListener('change', onInput);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') { closeLetterView(); closePhotoView(); closeModal(); closeCreator(); if (!settings().dock) closePanel(); }
    });
    document.addEventListener('keydown', onHotkey);
    registerScripting();

    on(et.CHAT_CHANGED, () => { closeModal(); closePanel(); closeCreator(); refresh(); });
    for (const ev of [et.MESSAGE_RECEIVED, et.MESSAGE_SENT, et.MESSAGE_SWIPED, et.MESSAGE_EDITED, et.MESSAGE_UPDATED, et.MESSAGE_DELETED, et.CHARACTER_MESSAGE_RENDERED, et.USER_MESSAGE_RENDERED, et.MORE_MESSAGES_LOADED, et.CHARACTER_EDITED, et.SETTINGS_UPDATED]) on(ev, refresh);
    const beforeGen = (type) => { recompute(); updatePrompt(type); };
    on(et.GENERATION_STARTED, beforeGen);
    on(et.GENERATION_AFTER_COMMANDS, beforeGen);
    on(et.GENERATION_ENDED, refresh);
    on(et.GENERATION_STOPPED, refresh);

    renderSettings();
    addWandItem();
    refreshNow();
}

(function boot() {
    const c = globalThis.SillyTavern?.getContext?.();
    if (!c) { setTimeout(boot, 300); return; }
    const et = c.eventTypes || c.event_types;
    let done = false;
    const start = () => { if (!done) { done = true; init(); } };
    if (et?.APP_READY) c.eventSource.on(et.APP_READY, start);
    // APP_READY가 이미 지났을 수도 있으므로 한 번 더
    setTimeout(start, 1500);
    if (document.getElementById('extensions_settings2') && document.getElementById('chat')) setTimeout(start, 200);
})();
