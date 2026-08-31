const STORAGE_KEY = "studybet-prototype-state-v2";
const TICK_MS = 1000;
const DEMO_SPEED = 6;
const DB_NAME = "studybet-recordings";
const DB_STORE = "clips";

const els = {
  navTabs: document.getElementById("navTabs"),
  screenTitle: document.getElementById("screenTitle"),
  groupName: document.getElementById("groupName"),
  goalMinutes: document.getElementById("goalMinutes"),
  awayLimit: document.getElementById("awayLimit"),
  inviteCode: document.getElementById("inviteCode"),
  goalPenalty: document.getElementById("goalPenalty"),
  awayPenalty: document.getElementById("awayPenalty"),
  lastPlacePenalty: document.getElementById("lastPlacePenalty"),
  sidebarGroupName: document.getElementById("sidebarGroupName"),
  sidebarInviteCode: document.getElementById("sidebarInviteCode"),
  heroPenalty: document.getElementById("heroPenalty"),
  heroPenaltyHint: document.getElementById("heroPenaltyHint"),
  goalSummary: document.getElementById("goalSummary"),
  focusTime: document.getElementById("focusTime"),
  awayTime: document.getElementById("awayTime"),
  focusPercent: document.getElementById("focusPercent"),
  focusProgressBar: document.getElementById("focusProgressBar"),
  rankSummary: document.getElementById("rankSummary"),
  remainingSummary: document.getElementById("remainingSummary"),
  streakSummary: document.getElementById("streakSummary"),
  penaltyCountSummary: document.getElementById("penaltyCountSummary"),
  cameraPresenceText: document.getElementById("cameraPresenceText"),
  rulePreview: document.getElementById("rulePreview"),
  weeklySummary: document.getElementById("weeklySummary"),
  sessionStatusBadge: document.getElementById("sessionStatusBadge"),
  cameraStatusBadge: document.getElementById("cameraStatusBadge"),
  cameraPreview: document.getElementById("cameraPreview"),
  cameraOverlay: document.getElementById("cameraOverlay"),
  sessionStatus: document.getElementById("sessionStatus"),
  focusTimePanel: document.getElementById("focusTimePanel"),
  awayTimePanel: document.getElementById("awayTimePanel"),
  cameraStatus: document.getElementById("cameraStatus"),
  leaderboard: document.getElementById("leaderboard"),
  resultState: document.getElementById("resultState"),
  resultCards: document.getElementById("resultCards"),
  penaltyBoard: document.getElementById("penaltyBoard"),
  historyList: document.getElementById("historyList"),
  memberStats: document.getElementById("memberStats"),
  calendarMonthLabel: document.getElementById("calendarMonthLabel"),
  calendarGrid: document.getElementById("calendarGrid"),
  prevMonthBtn: document.getElementById("prevMonthBtn"),
  nextMonthBtn: document.getElementById("nextMonthBtn"),
  recordingEmpty: document.getElementById("recordingEmpty"),
  recordingList: document.getElementById("recordingList"),
  startCameraBtn: document.getElementById("startCameraBtn"),
  startSessionBtn: document.getElementById("startSessionBtn"),
  toggleAwayBtn: document.getElementById("toggleAwayBtn"),
  endSessionBtn: document.getElementById("endSessionBtn"),
  saveSettingsBtn: document.getElementById("saveSettingsBtn"),
  resetDemoBtn: document.getElementById("resetDemoBtn"),
  copyInviteBtn: document.getElementById("copyInviteBtn"),
  goRoomBtn: document.getElementById("goRoomBtn"),
  installAppBtn: document.getElementById("installAppBtn"),
  mobileDock: document.getElementById("mobileDock"),
};

const screenTitles = {
  dashboard: "대시보드",
  room: "스터디룸",
  penalties: "패널티 보드",
  history: "기록",
};

function defaultState() {
  return {
    activeScreen: "dashboard",
    settings: {
      groupName: "토익 아침캠 6주 챌린지",
      goalMinutes: 120,
      awayLimit: 15,
      inviteCode: "STB-2401",
      goalPenalty: "아메리카노 사기",
      awayPenalty: "편의점 간식 사기",
      lastPlacePenalty: "다음 모임 디저트 쏘기",
    },
    session: {
      running: false,
      startedAt: null,
      focusSeconds: 0,
      awaySeconds: 0,
      isAway: false,
      cameraOn: false,
      results: [],
      statusText: "대기 중",
    },
    calendar: {
      month: "2026-08",
      selectedDate: "2026-08-31",
    },
    friends: [
      { id: "me", name: "나", focusSeconds: 0, awaySeconds: 0, sessionsDone: 2, streak: 3, penalties: 1, status: "offline" },
      { id: "jiwoo", name: "지우", focusSeconds: 493 * 60, awaySeconds: 17 * 60, sessionsDone: 6, streak: 5, penalties: 0, status: "focus" },
      { id: "minho", name: "민호", focusSeconds: 421 * 60, awaySeconds: 33 * 60, sessionsDone: 5, streak: 4, penalties: 1, status: "focus" },
      { id: "sena", name: "세나", focusSeconds: 398 * 60, awaySeconds: 54 * 60, sessionsDone: 5, streak: 2, penalties: 2, status: "away" },
    ],
    penaltyAssignments: [
      {
        id: "p1",
        userId: "sena",
        name: "세나",
        reason: "주간 최하위",
        penaltyText: "다음 모임 디저트 쏘기",
        assignedAt: "2026-08-29",
        tone: "bad",
      },
      {
        id: "p2",
        userId: "minho",
        name: "민호",
        reason: "이탈 20분 초과",
        penaltyText: "편의점 간식 사기",
        assignedAt: "2026-08-30",
        tone: "bad",
      },
    ],
    history: [
      {
        id: "h1",
        date: "2026-08-30",
        title: "일요일 저녁 집중 세션",
        focusSeconds: 96 * 60,
        awaySeconds: 8 * 60,
        outcome: "목표 달성",
      },
      {
        id: "h2",
        date: "2026-08-29",
        title: "토요일 오전 세션",
        focusSeconds: 71 * 60,
        awaySeconds: 18 * 60,
        outcome: "이탈 패널티 1건",
      },
    ],
  };
}

let state = loadState();
let mediaStream = null;
let timerId = null;
let mediaRecorder = null;
let recordingChunks = [];
let recordingsCache = [];

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return defaultState();
  try {
    const parsed = JSON.parse(raw);
    return {
      ...defaultState(),
      ...parsed,
      settings: { ...defaultState().settings, ...(parsed.settings || {}) },
      session: { ...defaultState().session, ...(parsed.session || {}) },
      calendar: { ...defaultState().calendar, ...(parsed.calendar || {}) },
      friends: parsed.friends || defaultState().friends,
      penaltyAssignments: parsed.penaltyAssignments || defaultState().penaltyAssignments,
      history: parsed.history || defaultState().history,
    };
  } catch {
    return defaultState();
  }
}

function persistState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function openRecordingDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(DB_STORE)) {
        db.createObjectStore(DB_STORE, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function loadRecordings() {
  try {
    const db = await openRecordingDb();
    const tx = db.transaction(DB_STORE, "readonly");
    const store = tx.objectStore(DB_STORE);
    const items = await new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
    recordingsCache = items
      .map((item) => ({
        ...item,
        videoUrl: item.blob ? URL.createObjectURL(item.blob) : null,
      }))
      .sort((a, b) => b.date.localeCompare(a.date) || (b.createdAt || "").localeCompare(a.createdAt || ""));
  } catch {
    recordingsCache = [];
  }
}

async function saveRecordingClip(record) {
  try {
    const db = await openRecordingDb();
    const tx = db.transaction(DB_STORE, "readwrite");
    tx.objectStore(DB_STORE).put(record);
    await new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    await loadRecordings();
  } catch {
    recordingsCache = recordingsCache.concat(record);
  }
}

function formatDuration(totalSeconds) {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function formatMinutes(totalSeconds) {
  return `${Math.round(totalSeconds / 60)}분`;
}

function syncFormFromState() {
  els.groupName.value = state.settings.groupName;
  els.goalMinutes.value = state.settings.goalMinutes;
  els.awayLimit.value = state.settings.awayLimit;
  els.inviteCode.value = state.settings.inviteCode;
  els.goalPenalty.value = state.settings.goalPenalty;
  els.awayPenalty.value = state.settings.awayPenalty;
  els.lastPlacePenalty.value = state.settings.lastPlacePenalty;
}

function updateSettingsFromForm() {
  state.settings.groupName = els.groupName.value.trim() || defaultState().settings.groupName;
  state.settings.goalMinutes = Number(els.goalMinutes.value) || defaultState().settings.goalMinutes;
  state.settings.awayLimit = Number(els.awayLimit.value) || defaultState().settings.awayLimit;
  state.settings.inviteCode = els.inviteCode.value.trim() || defaultState().settings.inviteCode;
  state.settings.goalPenalty = els.goalPenalty.value.trim() || defaultState().settings.goalPenalty;
  state.settings.awayPenalty = els.awayPenalty.value.trim() || defaultState().settings.awayPenalty;
  state.settings.lastPlacePenalty =
    els.lastPlacePenalty.value.trim() || defaultState().settings.lastPlacePenalty;
  persistState();
}

function navigate(screen) {
  state.activeScreen = screen;
  document.querySelectorAll(".screen").forEach((node) => {
    node.classList.toggle("active", node.dataset.screen === screen);
  });
  document.querySelectorAll(".nav-chip").forEach((node) => {
    node.classList.toggle("active", node.dataset.screen === screen);
  });
  document.querySelectorAll(".dock-item").forEach((node) => {
    node.classList.toggle("active", node.dataset.screen === screen);
  });
  els.screenTitle.textContent = screenTitles[screen];
  persistState();
}

function getTodayDateKey() {
  return new Date().toISOString().slice(0, 10);
}

function getMonthLabel(monthKey) {
  const [year, month] = monthKey.split("-").map(Number);
  return `${year}년 ${month}월`;
}

function renderRulePreview() {
  const me = state.friends.find((friend) => friend.id === "me");
  const focusMinutes = Math.round(state.session.focusSeconds / 60);
  const remainingMinutes = Math.max(0, state.settings.goalMinutes - focusMinutes);
  const percent = Math.min(100, Math.round((state.session.focusSeconds / (state.settings.goalMinutes * 60)) * 100));
  els.sidebarGroupName.textContent = state.settings.groupName;
  els.sidebarInviteCode.textContent = `초대코드 ${state.settings.inviteCode}`;
  els.goalSummary.textContent = `${state.settings.goalMinutes}분`;
  els.remainingSummary.textContent = `${remainingMinutes}분`;
  els.streakSummary.textContent = `${me.streak}일`;
  els.penaltyCountSummary.textContent = `${me.penalties}건`;
  els.focusPercent.textContent = `${percent}%`;
  els.focusProgressBar.style.width = `${percent}%`;
  els.rulePreview.innerHTML = `
    <strong>${state.settings.groupName}</strong><br />
    목표를 못 채우면 <strong>${state.settings.goalPenalty}</strong><br />
    이탈이 ${state.settings.awayLimit}분을 넘기면 <strong>${state.settings.awayPenalty}</strong><br />
    이번 세션 최하위는 <strong>${state.settings.lastPlacePenalty}</strong>
  `;
}

function renderSession() {
  const sessionLabel = state.session.running ? (state.session.isAway ? "자리비움" : "집중 중") : "대기 중";
  state.session.statusText = sessionLabel;
  els.sessionStatus.textContent = sessionLabel;
  els.sessionStatusBadge.textContent = sessionLabel;
  els.focusTime.textContent = formatDuration(state.session.focusSeconds);
  els.awayTime.textContent = formatDuration(state.session.awaySeconds);
  els.focusTimePanel.textContent = formatDuration(state.session.focusSeconds);
  els.awayTimePanel.textContent = formatDuration(state.session.awaySeconds);
  els.cameraStatus.textContent = state.session.cameraOn ? "ON" : "OFF";
  els.cameraStatusBadge.textContent = state.session.cameraOn ? "카메라 ON" : "카메라 OFF";
  els.cameraPresenceText.textContent = state.session.cameraOn
    ? state.session.running
      ? "지금 셀로그처럼 집중 장면을 남기는 중"
      : "카메라 준비 완료, 바로 집중 시작 가능"
    : "카메라를 켜고 시작해보세요";
  els.toggleAwayBtn.textContent = state.session.isAway ? "공부 복귀" : "잠깐 자리비움";
  els.startSessionBtn.textContent = state.session.running ? "공부 진행 중" : "공부 시작";

  state.friends = state.friends.map((friend) => {
    if (friend.id !== "me") return friend;
    return {
      ...friend,
      focusSeconds: state.session.focusSeconds,
      awaySeconds: state.session.awaySeconds,
      status: state.session.running ? (state.session.isAway ? "away" : "focus") : "offline",
    };
  });
}

function renderCalendar() {
  els.calendarMonthLabel.textContent = getMonthLabel(state.calendar.month);
  const [year, month] = state.calendar.month.split("-").map(Number);
  const firstDay = new Date(year, month - 1, 1);
  const startOffset = firstDay.getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const daysInPrevMonth = new Date(year, month - 1, 0).getDate();
  const recordingMap = new Map();
  recordingsCache.forEach((item) => {
    recordingMap.set(item.date, (recordingMap.get(item.date) || 0) + 1);
  });

  const cells = [];
  for (let i = 0; i < startOffset; i += 1) {
    const day = daysInPrevMonth - startOffset + i + 1;
    const dateKey = formatDateKey(year, month - 1, day);
    cells.push(renderCalendarCell(day, dateKey, true, recordingMap.get(dateKey) || 0));
  }
  for (let day = 1; day <= daysInMonth; day += 1) {
    const dateKey = formatDateKey(year, month, day);
    cells.push(renderCalendarCell(day, dateKey, false, recordingMap.get(dateKey) || 0));
  }
  while (cells.length % 7 !== 0) {
    const nextDay = cells.length % 7;
    const day = nextDay + 1;
    const dateKey = formatDateKey(year, month + 1, day);
    cells.push(renderCalendarCell(day, dateKey, true, recordingMap.get(dateKey) || 0));
  }

  els.calendarGrid.innerHTML = cells.join("");
}

function formatDateKey(year, month, day) {
  const normalized = new Date(year, month - 1, day);
  return `${normalized.getFullYear()}-${String(normalized.getMonth() + 1).padStart(2, "0")}-${String(normalized.getDate()).padStart(2, "0")}`;
}

function renderCalendarCell(day, dateKey, muted, count) {
  const isSelected = state.calendar.selectedDate === dateKey;
  return `
    <button
      class="calendar-day${muted ? " muted" : ""}${count ? " has-recording" : ""}${isSelected ? " selected" : ""}"
      type="button"
      data-date="${dateKey}"
    >
      <strong>${day}</strong>
      <span>${count ? `${count}개 기록` : "기록 없음"}</span>
      <small>${count ? "영상 보기" : "쉬는 날"}</small>
    </button>
  `;
}

function simulateFriendsTick() {
  state.friends = state.friends.map((friend) => {
    if (friend.id === "me") return friend;
    const drift = Math.random();
    let status = friend.status;
    if (drift < 0.08) status = "away";
    else if (drift < 0.12) status = "offline";
    else status = "focus";

    return {
      ...friend,
      focusSeconds: friend.focusSeconds + (status === "focus" ? DEMO_SPEED : 0),
      awaySeconds: friend.awaySeconds + (status === "away" ? DEMO_SPEED : 0),
      status,
    };
  });
}

function getRankForMe() {
  const sorted = [...state.friends].sort((a, b) => b.focusSeconds - a.focusSeconds);
  const index = sorted.findIndex((friend) => friend.id === "me");
  return `${index + 1}위`;
}

function renderLeaderboard() {
  els.rankSummary.textContent = getRankForMe();
  const sorted = [...state.friends].sort((a, b) => b.focusSeconds - a.focusSeconds);
  els.leaderboard.innerHTML = sorted
    .map((friend, index) => {
      const statusClass =
        friend.status === "focus" ? "status-focus" : friend.status === "away" ? "status-away" : "status-offline";
      const statusLabel = friend.status === "focus" ? "집중" : friend.status === "away" ? "이탈" : "대기";
      return `
        <div class="leaderboard-row">
          <div class="participant">
            <div class="avatar">${friend.name.slice(0, 1)}</div>
            <div><strong>${index + 1}. ${friend.name}</strong></div>
          </div>
          <div>${formatMinutes(friend.focusSeconds)}</div>
          <div>${formatMinutes(friend.awaySeconds)}</div>
          <div><span class="status-pill ${statusClass}">${statusLabel}</span></div>
        </div>
      `;
    })
    .join("");
}

function computeResults() {
  const me = state.friends.find((friend) => friend.id === "me");
  const goalSeconds = state.settings.goalMinutes * 60;
  const awayLimitSeconds = state.settings.awayLimit * 60;
  const lowest = [...state.friends].sort((a, b) => a.focusSeconds - b.focusSeconds)[0];
  const results = [];

  if (me.focusSeconds < goalSeconds) {
    results.push({
      type: "bad",
      title: "목표 미달",
      body: `오늘 목표 ${state.settings.goalMinutes}분을 채우지 못해 ${state.settings.goalPenalty}가 배정됐습니다.`,
      reason: "목표 미달",
      penaltyText: state.settings.goalPenalty,
    });
  } else {
    results.push({
      type: "good",
      title: "목표 달성",
      body: "오늘 목표를 채워 목표 미달 패널티는 면제됐습니다.",
    });
  }

  if (me.awaySeconds > awayLimitSeconds) {
    results.push({
      type: "bad",
      title: "이탈 초과",
      body: `이탈 시간이 ${state.settings.awayLimit}분을 넘겨 ${state.settings.awayPenalty}가 배정됐습니다.`,
      reason: "이탈 초과",
      penaltyText: state.settings.awayPenalty,
    });
  } else {
    results.push({
      type: "good",
      title: "이탈 기준 통과",
      body: "허용 범위 안에서 세션을 마쳤습니다.",
    });
  }

  if (lowest.id === "me") {
    results.push({
      type: "bad",
      title: "세션 최하위",
      body: `이번 세션 최하위로 ${state.settings.lastPlacePenalty}가 배정됐습니다.`,
      reason: "세션 최하위",
      penaltyText: state.settings.lastPlacePenalty,
    });
  } else {
    results.push({
      type: "good",
      title: "순위 방어",
      body: `${lowest.name}보다 앞서 있어 세션 꼴찌 패널티는 피했습니다.`,
    });
  }

  state.session.results = results;
  const badResults = results.filter((item) => item.type === "bad");
  els.heroPenalty.textContent = badResults.length ? badResults.map((item) => item.title).join(" · ") : "패널티 없음";
  els.heroPenaltyHint.textContent = badResults.length
    ? "이번 세션 결과가 패널티 보드에 반영됐습니다."
    : "이번 세션은 패널티 없이 종료됐습니다.";

  badResults.forEach((item, index) => {
    state.penaltyAssignments.unshift({
      id: `live-${Date.now()}-${index}`,
      userId: "me",
      name: "나",
      reason: item.reason,
      penaltyText: item.penaltyText,
      assignedAt: new Date().toISOString().slice(0, 10),
      tone: "bad",
    });
  });

  state.history.unshift({
    id: `history-${Date.now()}`,
    date: new Date().toISOString().slice(0, 10),
    title: `${state.settings.groupName} 세션`,
    focusSeconds: state.session.focusSeconds,
    awaySeconds: state.session.awaySeconds,
    outcome: badResults.length ? `패널티 ${badResults.length}건` : "패널티 없음",
  });

  state.friends = state.friends.map((friend) => {
    if (friend.id !== "me") return friend;
    return {
      ...friend,
      sessionsDone: friend.sessionsDone + 1,
      penalties: friend.penalties + badResults.length,
      streak: badResults.length ? friend.streak : friend.streak + 1,
    };
  });
}

function renderResults() {
  const assigned = state.session.results.filter((item) => item.type === "bad");
  els.resultState.textContent = state.session.results.length
    ? assigned.length
      ? `이번 세션에서 ${assigned.length}개의 패널티가 자동 배정됐습니다.`
      : "이번 세션은 패널티 없이 종료되었습니다."
    : "세션을 마감하면 자동으로 결과 카드가 생성됩니다.";

  els.resultCards.innerHTML = state.session.results
    .map(
      (item) => `
        <article class="result-card ${item.type}">
          <h4>${item.title}</h4>
          <p>${item.body}</p>
        </article>
      `,
    )
    .join("");
}

function renderPenaltyBoard() {
  els.penaltyBoard.innerHTML = state.penaltyAssignments
    .slice(0, 6)
    .map(
      (item) => `
        <article class="penalty-item ${item.tone}">
          <h4>${item.name} · ${item.reason}</h4>
          <p>${item.penaltyText}</p>
          <div class="penalty-meta">
            <span>${item.assignedAt}</span>
            <span>자동 배정</span>
          </div>
        </article>
      `,
    )
    .join("");
}

function renderHistory() {
  els.historyList.innerHTML = state.history
    .slice(0, 8)
    .map(
      (item) => `
        <article class="history-card">
          <h4>${item.title}</h4>
          <p>${item.outcome}</p>
          <div class="history-meta">
            <span>${item.date}</span>
            <span>${formatMinutes(item.focusSeconds)} 집중 · ${formatMinutes(item.awaySeconds)} 이탈</span>
          </div>
        </article>
      `,
    )
    .join("");
}

function renderRecordingList() {
  const selected = state.calendar.selectedDate;
  const selectedItems = recordingsCache.filter((item) => item.date === selected);
  els.recordingEmpty.style.display = selectedItems.length ? "none" : "block";
  els.recordingList.innerHTML = selectedItems
    .map(
      (item) => `
        <article class="recording-card">
          <div class="recording-head">
            <div>
              <h4>${item.title}</h4>
              <p>${item.date} · ${item.timeLabel}</p>
            </div>
            <span class="recording-badge">${item.hasVideo ? "영상 기록됨" : "메타데이터만"}</span>
          </div>
          <div class="recording-meta">
            집중 ${formatMinutes(item.focusSeconds)} · 이탈 ${formatMinutes(item.awaySeconds)} · 결과 ${item.outcome}
          </div>
          ${item.videoUrl ? `<video controls playsinline src="${item.videoUrl}"></video>` : ""}
        </article>
      `,
    )
    .join("");
}

function renderMemberStats() {
  els.memberStats.innerHTML = state.friends
    .map(
      (friend) => `
        <article class="stat-card">
          <h4>${friend.name}</h4>
          <p>${friend.sessionsDone}회 참여 · 연속 ${friend.streak}일 · 누적 패널티 ${friend.penalties}건</p>
        </article>
      `,
    )
    .join("");
}

function renderWeeklySummary() {
  const me = state.friends.find((friend) => friend.id === "me");
  const goalHit = me.focusSeconds >= state.settings.goalMinutes * 60;
  const rows = [
    {
      tone: goalHit ? "good" : "warn",
      title: goalHit ? "오늘 목표권 진입" : "오늘 공부시간 아직 부족",
      body: goalHit
        ? `${formatMinutes(me.focusSeconds)} 집중으로 오늘 목표를 넘겼습니다.`
        : `${state.settings.goalMinutes}분 목표까지 ${Math.max(0, state.settings.goalMinutes - Math.round(me.focusSeconds / 60))}분 남았습니다.`,
    },
    {
      tone: "good",
      title: `현재 그룹 순위 ${getRankForMe()}`,
      body: "열품타처럼 친구 그룹 안에서 실시간으로 순위가 갱신됩니다.",
    },
    {
      tone: state.session.cameraOn ? "good" : "warn",
      title: "셀로그 체크인 상태",
      body: state.session.cameraOn ? "카메라가 연결되어 함께 공부하는 존재감이 유지되고 있습니다." : "카메라를 켜면 셀로그식 체크인이 활성화됩니다.",
    },
  ];

  els.weeklySummary.innerHTML = rows
    .map(
      (row) => `
        <article class="feed-row ${row.tone}">
          <h4>${row.title}</h4>
          <p>${row.body}</p>
        </article>
      `,
    )
    .join("");
}

function renderAll() {
  renderRulePreview();
  renderSession();
  renderLeaderboard();
  renderResults();
  renderPenaltyBoard();
  renderHistory();
  renderMemberStats();
  renderWeeklySummary();
  renderCalendar();
  renderRecordingList();
  navigate(state.activeScreen);
}

function startMediaRecording() {
  if (!state.session.cameraOn || !mediaStream || typeof MediaRecorder === "undefined") return;
  try {
    recordingChunks = [];
    mediaRecorder = new MediaRecorder(mediaStream, { mimeType: "video/webm" });
    mediaRecorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) recordingChunks.push(event.data);
    };
    mediaRecorder.start(1000);
  } catch {
    mediaRecorder = null;
  }
}

async function stopMediaRecordingAndSave(sessionSnapshot) {
  if (!mediaRecorder) {
    return;
  }

  const stoppedRecorder = mediaRecorder;
  mediaRecorder = null;

  await new Promise((resolve) => {
    stoppedRecorder.onstop = resolve;
    stoppedRecorder.stop();
  });

  if (!recordingChunks.length) return;

  const blob = new Blob(recordingChunks, { type: "video/webm" });
  const videoUrl = URL.createObjectURL(blob);
  const createdAt = new Date().toISOString();
  const date = createdAt.slice(0, 10);
  const timeLabel = createdAt.slice(11, 16);

  await saveRecordingClip({
    id: `clip-${createdAt}`,
    date,
    createdAt,
    timeLabel,
    title: `${state.settings.groupName} 공부 기록`,
    focusSeconds: sessionSnapshot.focusSeconds,
    awaySeconds: sessionSnapshot.awaySeconds,
    outcome: sessionSnapshot.outcome,
    hasVideo: true,
    blob,
    videoUrl,
  });

  state.calendar.selectedDate = date;
  state.calendar.month = date.slice(0, 7);
  persistState();
}

async function startCamera() {
  if (!navigator.mediaDevices?.getUserMedia) {
    els.cameraOverlay.textContent = "이 브라우저에서는 카메라 접근을 사용할 수 없습니다.";
    return;
  }

  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false });
    els.cameraPreview.srcObject = mediaStream;
    els.cameraOverlay.style.display = "none";
    state.session.cameraOn = true;
    persistState();
    renderAll();
  } catch {
    els.cameraOverlay.textContent = "카메라 권한이 없거나 장치를 찾지 못했습니다.";
  }
}

function ensureTimer() {
  if (timerId) return;
  timerId = window.setInterval(() => {
    if (!state.session.running) return;
    if (state.session.isAway || document.hidden || !state.session.cameraOn) {
      state.session.awaySeconds += DEMO_SPEED;
    } else {
      state.session.focusSeconds += DEMO_SPEED;
    }
    simulateFriendsTick();
    persistState();
    renderAll();
  }, TICK_MS);
}

function startSession() {
  if (state.session.running) return;
  state.session.running = true;
  state.session.startedAt = new Date().toISOString();
  state.session.results = [];
  startMediaRecording();
  navigate("room");
  ensureTimer();
  persistState();
  renderAll();
}

function toggleAway() {
  if (!state.session.running) return;
  state.session.isAway = !state.session.isAway;
  persistState();
  renderAll();
}

async function endSession() {
  if (!state.session.running) return;
  state.session.running = false;
  state.session.isAway = false;
  computeResults();
  const summary = {
    focusSeconds: state.session.focusSeconds,
    awaySeconds: state.session.awaySeconds,
    outcome: state.session.results.filter((item) => item.type === "bad").length
      ? `패널티 ${state.session.results.filter((item) => item.type === "bad").length}건`
      : "패널티 없음",
  };
  await stopMediaRecordingAndSave(summary);
  state.session.focusSeconds = 0;
  state.session.awaySeconds = 0;
  state.session.results = [...state.session.results];
  navigate("penalties");
  persistState();
  renderAll();
}

function resetDemo() {
  if (mediaStream) {
    mediaStream.getTracks().forEach((track) => track.stop());
    mediaStream = null;
  }
  state = defaultState();
  persistState();
  els.cameraPreview.srcObject = null;
  els.cameraOverlay.style.display = "grid";
  els.cameraOverlay.textContent = "카메라를 켜면 내 화면이 여기 표시됩니다";
  syncFormFromState();
  renderAll();
}

async function copyInviteCode() {
  const text = state.settings.inviteCode;
  try {
    await navigator.clipboard.writeText(text);
    els.heroPenalty.textContent = "초대코드 복사 완료";
    els.heroPenaltyHint.textContent = `${text} 코드를 친구에게 보내면 됩니다.`;
  } catch {
    els.heroPenalty.textContent = "초대코드 확인";
    els.heroPenaltyHint.textContent = text;
  }
}

function showInstallHint() {
  els.heroPenalty.textContent = "설치형 웹앱 지원";
  els.heroPenaltyHint.textContent = "브라우저 메뉴에서 홈 화면 추가 또는 앱 설치를 선택하면 앱처럼 쓸 수 있습니다.";
}

document.addEventListener("visibilitychange", () => {
  if (!state.session.running) return;
  renderAll();
});

els.navTabs.addEventListener("click", (event) => {
  const button = event.target.closest("[data-screen]");
  if (!button) return;
  navigate(button.dataset.screen);
});

els.mobileDock.addEventListener("click", (event) => {
  const button = event.target.closest("[data-screen]");
  if (!button) return;
  navigate(button.dataset.screen);
});

els.calendarGrid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-date]");
  if (!button) return;
  state.calendar.selectedDate = button.dataset.date;
  state.calendar.month = button.dataset.date.slice(0, 7);
  persistState();
  renderCalendar();
  renderRecordingList();
});

els.prevMonthBtn.addEventListener("click", () => {
  const [year, month] = state.calendar.month.split("-").map(Number);
  const date = new Date(year, month - 2, 1);
  state.calendar.month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
  persistState();
  renderCalendar();
});

els.nextMonthBtn.addEventListener("click", () => {
  const [year, month] = state.calendar.month.split("-").map(Number);
  const date = new Date(year, month, 1);
  state.calendar.month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
  persistState();
  renderCalendar();
});

els.saveSettingsBtn.addEventListener("click", () => {
  updateSettingsFromForm();
  renderAll();
});

els.startCameraBtn.addEventListener("click", startCamera);
els.startSessionBtn.addEventListener("click", startSession);
els.toggleAwayBtn.addEventListener("click", toggleAway);
els.endSessionBtn.addEventListener("click", () => {
  endSession();
});
els.resetDemoBtn.addEventListener("click", resetDemo);
els.copyInviteBtn.addEventListener("click", copyInviteCode);
els.goRoomBtn.addEventListener("click", () => navigate("room"));
els.installAppBtn.addEventListener("click", showInstallHint);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js").catch(() => {});
  });
}

loadRecordings().finally(() => {
  syncFormFromState();
  ensureTimer();
  if (!state.calendar.selectedDate) state.calendar.selectedDate = getTodayDateKey();
  renderAll();
});
