const DATA_ROOT = "../data";
// The 100-question bank starts with a fresh answer history.
const STORAGE_KEY = "bleague-sql-learning-progress-v2";
const LEGACY_STORAGE_KEY = "bleague-sql-learning-progress-v1";
const SYNC_STATE_KEY = "bleague-sql-learning-progress-sync-v1";
const SYNC_PENDING_KEY = "bleague-sql-learning-progress-sync-pending-v1";
const PROGRESS_API_PATH = "/api/progress";
const CDN_BASE = "https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/";
const SQL_KEYWORDS = [
  "SELECT", "FROM", "WHERE", "GROUP BY", "HAVING", "ORDER BY", "LIMIT", "OFFSET",
  "JOIN", "LEFT JOIN", "LEFT OUTER JOIN", "RIGHT JOIN", "INNER JOIN", "CROSS JOIN", "ON",
  "AS", "DISTINCT", "ALL", "AND", "OR", "NOT", "NULL", "IS NULL", "IS NOT NULL",
  "IN", "EXISTS", "BETWEEN", "LIKE", "GLOB", "CASE", "WHEN", "THEN", "ELSE", "END",
  "ASC", "DESC", "UNION", "UNION ALL", "WITH", "COUNT", "SUM", "AVG", "MIN", "MAX",
  "ROUND", "CAST", "COALESCE", "STRFTIME",
];
let storageAvailable = true;
let syncStatus = "local";
let syncReady = false;
let syncInitialized = false;
let syncPending = false;
let syncQueue = Promise.resolve();

const state = {
  db: null,
  problems: [],
  selectedId: null,
  editor: null,
  schema: { tables: [], columnsByTable: {} },
  progress: loadProgress(),
};

const elements = {
  menuButton: document.querySelector("#menu-button"),
  drawerOverlay: document.querySelector("#drawer-overlay"),
  problemDrawer: document.querySelector("#problem-drawer"),
  problemDrawerClose: document.querySelector("#problem-drawer-close"),
  dataStatus: document.querySelector("#data-status"),
  problemList: document.querySelector("#problem-list"),
  progressFilter: document.querySelector("#progress-filter"),
  categoryFilter: document.querySelector("#category-filter"),
  progressDetailButton: document.querySelector("#progress-detail-button"),
  progressModal: document.querySelector("#progress-modal"),
  progressModalClose: document.querySelector("#progress-modal-close"),
  correctCount: document.querySelector("#correct-count"),
  problemCount: document.querySelector("#problem-count"),
  completionRate: document.querySelector("#completion-rate"),
  favoriteCount: document.querySelector("#favorite-count"),
  storageStatus: document.querySelector("#storage-status"),
  emptyState: document.querySelector("#empty-state"),
  nextProblemList: document.querySelector("#next-problem-list"),
  questionView: document.querySelector("#question-view"),
  questionCategory: document.querySelector("#question-category"),
  questionTitleText: document.querySelector("#question-title-text"),
  questionCompletion: document.querySelector("#question-completion"),
  questionDifficulty: document.querySelector("#question-difficulty"),
  questionTables: document.querySelector("#question-tables"),
  previousProblemButton: document.querySelector("#previous-problem-button"),
  nextProblemButton: document.querySelector("#next-problem-button"),
  questionPrompt: document.querySelector("#question-prompt"),
  favoriteButton: document.querySelector("#favorite-button"),
  sqlEditor: document.querySelector("#sql-editor"),
  runButton: document.querySelector("#run-button"),
  submitButton: document.querySelector("#submit-button"),
  answerButton: document.querySelector("#answer-button"),
  hintButton: document.querySelector("#hint-button"),
  hintSection: document.querySelector("#hint-section"),
  questionHint: document.querySelector("#question-hint"),
  feedback: document.querySelector("#feedback"),
  resultSummary: document.querySelector("#result-summary"),
  resultOutput: document.querySelector("#result-output"),
  answerSection: document.querySelector("#answer-section"),
  referenceSql: document.querySelector("#reference-sql"),
  questionExplanation: document.querySelector("#question-explanation"),
};

function loadProgress() {
  try {
    const currentRaw = localStorage.getItem(STORAGE_KEY);
    const parsed = JSON.parse(currentRaw || "{}");
    const legacy = currentRaw ? {} : JSON.parse(localStorage.getItem(LEGACY_STORAGE_KEY) || "{}");
    syncInitialized = localStorage.getItem(SYNC_STATE_KEY) === "true";
    syncPending = localStorage.getItem(SYNC_PENDING_KEY) === "true";
    return {
      completed: currentRaw && parsed.completed && typeof parsed.completed === "object" ? parsed.completed : {},
      favorites: parsed.favorites && typeof parsed.favorites === "object"
        ? parsed.favorites
        : legacy.favorites && typeof legacy.favorites === "object" ? legacy.favorites : {},
    };
  } catch {
    storageAvailable = false;
    return { completed: {}, favorites: {} };
  }
}

function saveLocalProgress() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.progress));
    localStorage.setItem(SYNC_PENDING_KEY, "true");
    syncPending = true;
  } catch {
    storageAvailable = false;
  }
}

function saveProgress() {
  saveLocalProgress();
  renderProgress();
  renderProblemList();
  renderNextProblemList();
  updateQuestionCompletion();
  if (syncReady) queueProgressSync();
  return storageAvailable;
}

function normalizedProgress(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { completed: {}, favorites: {} };
  }
  const normalizeFlags = (flags) => {
    if (!flags || typeof flags !== "object" || Array.isArray(flags)) return {};
    return Object.fromEntries(
      Object.entries(flags)
        .filter(([key, enabled]) => typeof key === "string" && key.length <= 200 && enabled === true),
    );
  };
  return {
    completed: normalizeFlags(value.completed),
    favorites: normalizeFlags(value.favorites),
  };
}

function mergedProgress(left, right) {
  return {
    completed: { ...left.completed, ...right.completed },
    favorites: { ...left.favorites, ...right.favorites },
  };
}

function setSyncStatus(status) {
  syncStatus = status;
  renderProgress();
}

function syncStatusMessage() {
  if (syncStatus === "syncing") return "進捗とお気に入りを端末間で同期中…";
  if (syncStatus === "synced") return "進捗とお気に入りは端末間で同期されます。";
  if (syncStatus === "error") return "同期できないため、このブラウザにも保存しています。";
  return "進捗とお気に入りは、このブラウザに保存されます。";
}

async function fetchProgressApi(options = {}) {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 8000);
  try {
    return await fetch(PROGRESS_API_PATH, {
      ...options,
      headers: { Accept: "application/json", ...(options.headers || {}) },
      cache: "no-store",
      signal: controller.signal,
    });
  } finally {
    window.clearTimeout(timeout);
  }
}

async function putProgress(progress) {
  const payload = normalizedProgress(progress);
  const response = await fetchProgressApi({
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error(`同期API unavailable (${response.status})`);
  syncInitialized = true;
  const current = JSON.stringify(normalizedProgress(state.progress));
  syncPending = current !== JSON.stringify(payload);
  try {
    localStorage.setItem(SYNC_STATE_KEY, "true");
    if (syncPending) localStorage.setItem(SYNC_PENDING_KEY, "true");
    else localStorage.removeItem(SYNC_PENDING_KEY);
  } catch {
    storageAvailable = false;
  }
  setSyncStatus("synced");
}

async function synchronizeProgress() {
  setSyncStatus("syncing");
  try {
    const response = await fetchProgressApi();
    if (!response.ok) throw new Error(`同期API unavailable (${response.status})`);
    const remote = normalizedProgress(await response.json());
    const local = normalizedProgress(state.progress);
    const shouldMerge = !syncInitialized || syncPending;
    state.progress = shouldMerge ? mergedProgress(remote, local) : remote;
    saveLocalProgress();
    syncInitialized = true;
    syncPending = false;
    try {
      localStorage.setItem(SYNC_STATE_KEY, "true");
      localStorage.removeItem(SYNC_PENDING_KEY);
    } catch {
      storageAvailable = false;
    }
    if (shouldMerge) await putProgress(state.progress);
    setSyncStatus("synced");
  } catch (error) {
    syncPending = true;
    try {
      localStorage.setItem(SYNC_PENDING_KEY, "true");
    } catch {
      storageAvailable = false;
    }
    setSyncStatus("error");
    console.info("Progress sync is not available; using local storage:", error);
    syncReady = true;
    return false;
  }
  syncReady = true;
  return true;
}

function queueProgressSync() {
  syncQueue = syncQueue
    .catch(() => {})
    .then(async () => {
      try {
        await putProgress(state.progress);
      } catch (error) {
        syncPending = true;
        setSyncStatus("error");
        console.info("Progress sync failed; keeping local storage:", error);
      }
    });
}

function selectedProblem() {
  return state.problems.find((problem) => problem.id === state.selectedId) || null;
}

function problemNumber(problem) {
  const index = state.problems.findIndex((item) => item.id === problem.id);
  return `Q${String(index + 1).padStart(2, "0")}`;
}

function splitSqlList(value) {
  const items = [];
  let start = 0;
  let depth = 0;
  let quote = null;
  for (let index = 0; index < value.length; index += 1) {
    const character = value[index];
    if (quote) {
      if (character === quote) {
        if (value[index + 1] === quote) index += 1;
        else quote = null;
      }
      continue;
    }
    if (character === "'" || character === '"' || character === "`") {
      quote = character;
    } else if (character === "(") {
      depth += 1;
    } else if (character === ")") {
      depth = Math.max(0, depth - 1);
    } else if (character === "," && depth === 0) {
      items.push(value.slice(start, index).trim());
      start = index + 1;
    }
  }
  items.push(value.slice(start).trim());
  return items.filter(Boolean);
}

function formatReferenceSql(sql) {
  const normalized = sql.replace(/\s+/g, " ").trim();
  const clauseBreaks = /\s+(UNION ALL|LEFT OUTER JOIN|RIGHT OUTER JOIN|FULL OUTER JOIN|INNER JOIN|LEFT JOIN|RIGHT JOIN|FULL JOIN|JOIN|FROM|WHERE|GROUP BY|HAVING|ORDER BY|LIMIT|ON)(?=\s)/gi;
  const lines = normalized.replace(clauseBreaks, "\n$1 ").split("\n");
  const formatted = [];

  lines.forEach((line) => {
    const trimmed = line.trim();
    const listClause = trimmed.match(/^(SELECT|GROUP BY|ORDER BY)\s+(.+)$/i);
    if (listClause) {
      const items = splitSqlList(listClause[2]);
      formatted.push(`${listClause[1].toUpperCase()}\n  ${items.join(",\n  ")}`);
      return;
    }
    const conditionClause = trimmed.match(/^(WHERE|HAVING)\s+(.+)$/i);
    if (conditionClause) {
      const conditions = conditionClause[2].split(/\s+AND\s+/i);
      formatted.push(`${conditionClause[1].toUpperCase()}\n  ${conditions.join("\n  AND ")}`);
      return;
    }
    formatted.push(trimmed);
  });
  return formatted.join("\n");
}

let previousFocus = null;
let previousDrawerFocus = null;

function openProblemDrawer() {
  previousDrawerFocus = document.activeElement;
  elements.problemDrawer.classList.add("open");
  elements.drawerOverlay.classList.add("open");
  elements.problemDrawer.setAttribute("aria-hidden", "false");
  elements.drawerOverlay.setAttribute("aria-hidden", "false");
  elements.menuButton.setAttribute("aria-expanded", "true");
  elements.menuButton.setAttribute("aria-label", "問題一覧を閉じる");
  document.body.classList.add("drawer-open");
  elements.problemDrawerClose.focus();
}

function closeProblemDrawer({ restoreFocus = true } = {}) {
  elements.problemDrawer.classList.remove("open");
  elements.drawerOverlay.classList.remove("open");
  elements.problemDrawer.setAttribute("aria-hidden", "true");
  elements.drawerOverlay.setAttribute("aria-hidden", "true");
  elements.menuButton.setAttribute("aria-expanded", "false");
  elements.menuButton.setAttribute("aria-label", "問題一覧を開く");
  document.body.classList.remove("drawer-open");
  if (restoreFocus && previousDrawerFocus instanceof HTMLElement) previousDrawerFocus.focus();
  previousDrawerFocus = null;
}

function openProgressModal() {
  previousFocus = document.activeElement;
  elements.progressModal.classList.remove("hidden");
  elements.progressModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
  elements.progressModalClose.focus();
}

function closeProgressModal() {
  elements.progressModal.classList.add("hidden");
  elements.progressModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
  if (previousFocus instanceof HTMLElement) previousFocus.focus();
  previousFocus = null;
}

function renderProgress() {
  const completedCount = Object.values(state.progress.completed).filter(Boolean).length;
  const favoriteCount = Object.values(state.progress.favorites).filter(Boolean).length;
  const total = state.problems.length;
  elements.correctCount.textContent = completedCount;
  elements.problemCount.textContent = total;
  elements.favoriteCount.textContent = favoriteCount;
  elements.completionRate.textContent = total ? `${Math.round((completedCount / total) * 100)}%` : "0%";
  elements.storageStatus.textContent = storageAvailable
    ? syncStatusMessage()
    : "このブラウザでは保存できません。ページを閉じると進捗とお気に入りは失われます。";
  elements.storageStatus.classList.toggle("storage-warning", !storageAvailable || syncStatus === "error");
}

function difficultyStars(level) {
  return `${"★".repeat(level)}${"☆".repeat(5 - level)}`;
}

function visibleProblems() {
  const progressFilter = elements.progressFilter.value;
  const categoryFilter = elements.categoryFilter.value;
  return state.problems.filter((problem) => {
    const completed = Boolean(state.progress.completed[problem.id]);
    const favorite = Boolean(state.progress.favorites[problem.id]);
    const progressMatches = progressFilter === "all"
      || (progressFilter === "completed" && completed)
      || (progressFilter === "incomplete" && !completed)
      || (progressFilter === "favorites" && favorite);
    return progressMatches && (categoryFilter === "all" || problem.category === categoryFilter);
  });
}

function currentCategoryProblems() {
  const current = selectedProblem();
  return current ? state.problems.filter((problem) => problem.category === current.category) : [];
}

function updateProblemNavigation() {
  const categoryProblems = currentCategoryProblems();
  const currentIndex = categoryProblems.findIndex((problem) => problem.id === state.selectedId);
  const hasCurrentProblem = currentIndex >= 0;
  elements.previousProblemButton.disabled = !hasCurrentProblem || currentIndex === 0;
  elements.nextProblemButton.disabled = !hasCurrentProblem || currentIndex === categoryProblems.length - 1;
}

function nextProblemsByCategory() {
  const nextProblems = new Map();
  state.problems.forEach((problem) => {
    if (!state.progress.completed[problem.id] && !nextProblems.has(problem.category)) {
      nextProblems.set(problem.category, problem);
    }
  });
  return [...nextProblems.values()];
}

function renderNextProblemList() {
  if (!elements.nextProblemList) return;
  const nextProblems = nextProblemsByCategory();
  elements.nextProblemList.innerHTML = "";
  if (!nextProblems.length) {
    elements.nextProblemList.innerHTML = '<p class="muted">すべての問題を達成しました。</p>';
    return;
  }
  nextProblems.forEach((problem) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "next-problem-card";
    button.setAttribute("aria-label", `${problemNumber(problem)} ${problem.title}を始める`);
    button.innerHTML = `
      <div class="next-problem-card-meta"><span class="tag">${escapeHtml(problem.category)}</span><span class="problem-number">${problemNumber(problem)}</span></div>
      <h4>${escapeHtml(problem.title)}</h4>
      <p>${escapeHtml(problem.prompt)}</p>`;
    button.addEventListener("click", () => selectProblem(problem.id));
    elements.nextProblemList.appendChild(button);
  });
}

function renderProblemList() {
  const filtered = visibleProblems();

  elements.problemList.innerHTML = "";
  if (!filtered.length) {
    elements.problemList.innerHTML = '<p class="muted">該当する問題はありません。</p>';
    updateProblemNavigation();
    return;
  }
  filtered.forEach((problem) => {
    const completed = Boolean(state.progress.completed[problem.id]);
    const favorite = Boolean(state.progress.favorites[problem.id]);
    const button = document.createElement("button");
    button.type = "button";
    button.className = `problem-card${problem.id === state.selectedId ? " selected" : ""}`;
    button.setAttribute("aria-label", `${problemNumber(problem)} ${problem.title}を開く`);
    button.innerHTML = `
      <div class="problem-card-top"><span class="problem-number">${problemNumber(problem)}</span>
        <span class="problem-card-status">
          <span class="completion-icon ${completed ? "completed" : "incomplete"}" role="img" aria-label="${completed ? "達成済み" : "未達成"}" title="${completed ? "達成済み" : "未達成"}">✓</span>
          <span class="drawer-favorite ${favorite ? "active" : "inactive"}" role="img" aria-label="${favorite ? "お気に入り" : "お気に入りではありません"}" title="${favorite ? "お気に入り" : "お気に入りではありません"}">${favorite ? "★" : "☆"}</span>
        </span></div>
      <h3>${escapeHtml(problem.title)}</h3>
      <div class="problem-card-meta"><span class="star">${difficultyStars(problem.difficulty)}</span><span class="tag">${escapeHtml(problem.category)}</span></div>`;
    button.addEventListener("click", () => selectProblem(problem.id));
    elements.problemList.appendChild(button);
  });
  updateProblemNavigation();
}

function populateCategoryFilter() {
  const categories = [...new Set(state.problems.map((problem) => problem.category))];
  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    elements.categoryFilter.appendChild(option);
  });
}

function selectProblem(problemId) {
  const problem = state.problems.find((item) => item.id === problemId);
  if (!problem) return;
  state.selectedId = problemId;
  updateQuestionCompletion();
  elements.emptyState.classList.add("hidden");
  elements.questionView.classList.remove("hidden");
  initializeSqlEditor();
  if (state.editor) state.editor.refresh();
  elements.questionCategory.textContent = problem.category;
  elements.questionTitleText.innerHTML = `<span class="question-number-prefix">${problemNumber(problem).replace("Q", "Q.")}</span> ${escapeHtml(problem.title)}`;
  elements.questionDifficulty.textContent = `難易度 ${difficultyStars(problem.difficulty)}`;
  elements.questionTables.textContent = `使用テーブル: ${problem.sourceTables.join(", ")}`;
  elements.questionPrompt.textContent = problem.prompt;
  setEditorValue("");
  elements.feedback.className = "feedback";
  elements.feedback.textContent = "";
  elements.resultSummary.textContent = "";
  elements.resultOutput.innerHTML = '<p class="muted">SQLを実行すると結果が表示されます。</p>';
  elements.questionHint.textContent = createProblemHint(problem);
  setHintVisibility(false);
  setAnswerVisibility(false);
  elements.referenceSql.textContent = formatReferenceSql(problem.referenceSql);
  elements.questionExplanation.textContent = problem.explanation;
  updateFavoriteButton();
  renderProblemList();
  closeProblemDrawer({ restoreFocus: false });
  focusEditor();
}

function updateQuestionCompletion() {
  const completed = Boolean(state.selectedId && state.progress.completed[state.selectedId]);
  elements.questionCompletion.classList.toggle("hidden", !completed);
}

function moveToRelativeProblem(offset) {
  const categoryProblems = currentCategoryProblems();
  const currentIndex = categoryProblems.findIndex((problem) => problem.id === state.selectedId);
  const target = categoryProblems[currentIndex + offset];
  if (target) selectProblem(target.id);
}

function updateFavoriteButton() {
  const isFavorite = Boolean(state.progress.favorites[state.selectedId]);
  elements.favoriteButton.classList.toggle("active", isFavorite);
  elements.favoriteButton.setAttribute("aria-pressed", String(isFavorite));
  const label = isFavorite ? "お気に入りを解除" : "お気に入りに追加";
  elements.favoriteButton.setAttribute("aria-label", label);
  elements.favoriteButton.setAttribute("title", label);
  elements.favoriteButton.textContent = isFavorite ? "★" : "☆";
}

function setAnswerVisibility(visible) {
  elements.answerSection.classList.toggle("hidden", !visible);
  elements.answerButton.classList.toggle("is-visible", visible);
  const label = visible ? "解答例を隠す" : "解答例を表示";
  elements.answerButton.setAttribute("aria-expanded", String(visible));
  elements.answerButton.setAttribute("aria-label", label);
  elements.answerButton.textContent = label;
}

function setHintVisibility(visible) {
  elements.hintSection.classList.toggle("hidden", !visible);
  elements.hintButton.classList.toggle("is-visible", visible);
  elements.hintButton.setAttribute("aria-expanded", String(visible));
  elements.hintButton.textContent = visible ? "ヒントを隠す" : "ヒントを表示";
}

function toggleHint() {
  if (!selectedProblem()) return;
  setHintVisibility(elements.hintSection.classList.contains("hidden"));
}

function createProblemHint(problem) {
  if (Array.isArray(problem.requiredSqlTerms) && problem.requiredSqlTerms.length) {
    return `使うとよい要素: ${problem.requiredSqlTerms.join("、")}`;
  }
  return `使用テーブル: ${problem.sourceTables.join("、")}`;
}

function quoteSqlIdentifier(identifier) {
  return `"${String(identifier).replace(/"/g, '""')}"`;
}

function loadSqlSchema(database) {
  const schema = { tables: [], columnsByTable: {} };
  const tableResult = database.exec(
    "SELECT name, type FROM sqlite_master "
      + "WHERE type IN ('table', 'view') AND name NOT LIKE 'sqlite_%' "
      + "ORDER BY name COLLATE NOCASE",
  )[0];
  if (!tableResult) return schema;

  tableResult.values.forEach(([name, type]) => {
    const tableName = String(name);
    const columnsResult = database.exec(`PRAGMA table_info(${quoteSqlIdentifier(tableName)})`)[0];
    const columns = columnsResult
      ? columnsResult.values.map((row) => String(row[1]))
      : [];
    schema.tables.push({ name: tableName, type: String(type) });
    schema.columnsByTable[tableName] = columns;
  });
  return schema;
}

function textBeforeEditorCursor(editor, cursor) {
  return editor.getRange({ line: 0, ch: 0 }, cursor);
}

function sqlIdentifierFragment(editor, cursor) {
  const lineBeforeCursor = editor.getLine(cursor.line).slice(0, cursor.ch);
  const match = lineBeforeCursor.match(/[A-Za-z_][\w$]*(?:\.[A-Za-z_][\w$]*)?\.?$/);
  const fragment = match ? match[0] : "";
  const lastDot = fragment.lastIndexOf(".");
  return {
    fragment,
    qualifier: lastDot >= 0 ? fragment.slice(0, lastDot) : "",
    prefix: lastDot >= 0 ? fragment.slice(lastDot + 1) : fragment,
    from: { line: cursor.line, ch: cursor.ch - fragment.length },
    to: cursor,
  };
}

function sqlTableAliases(sql) {
  const aliases = {};
  const tableNames = new Set();
  const tablePattern = /\b(?:FROM|JOIN)\s+([A-Za-z_][\w$]*)(?:\s+(?:AS\s+)?([A-Za-z_][\w$]*))?/gi;
  let match;
  while ((match = tablePattern.exec(sql))) {
    const tableName = match[1];
    const alias = match[2];
    tableNames.add(tableName.toLowerCase());
    if (alias && !SQL_KEYWORDS.includes(alias.toUpperCase())) aliases[alias.toLowerCase()] = tableName;
  }
  return { aliases, tableNames };
}

function schemaTable(schema, name) {
  return schema.tables.find((table) => table.name.toLowerCase() === String(name).toLowerCase()) || null;
}

function completionItem(text, kind) {
  return { text, displayText: `${text} · ${kind}`, className: `sql-hint-${kind}` };
}

function uniqueCompletionItems(items) {
  const seen = new Set();
  return items.filter((item) => {
    const key = item.text.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function sqlHint(editor) {
  if (!state.schema.tables.length) return { list: [], from: editor.getCursor(), to: editor.getCursor() };
  const cursor = editor.getCursor();
  const context = sqlIdentifierFragment(editor, cursor);
  const beforeCursor = textBeforeEditorCursor(editor, cursor);
  const token = editor.getTokenAt(cursor);
  if (token.type && /(comment|string)/i.test(token.type)) return { list: [], from: context.from, to: context.to };

  const { aliases, tableNames } = sqlTableAliases(beforeCursor);
  const qualifiedTable = schemaTable(state.schema, context.qualifier);
  const aliasTable = aliases[context.qualifier.toLowerCase()];
  const relatedTable = qualifiedTable || schemaTable(state.schema, aliasTable);
  const inTableContext = /(?:\b(?:FROM|JOIN)\s+|,\s*)[A-Za-z_\w$]*$/i.test(beforeCursor);
  let items = [];

  if (inTableContext && !context.qualifier) {
    items = state.schema.tables.map((table) => completionItem(table.name, table.type === "view" ? "view" : "table"));
  } else if (relatedTable) {
    const columns = state.schema.columnsByTable[relatedTable.name] || [];
    items = columns.map((column) => completionItem(
      context.qualifier ? `${context.qualifier}.${column}` : column,
      "column",
    ));
  } else {
    const scopedTables = [...tableNames]
      .map((name) => schemaTable(state.schema, name))
      .filter(Boolean);
    const tables = scopedTables.length ? scopedTables : state.schema.tables;
    items = tables.flatMap((table) => (state.schema.columnsByTable[table.name] || [])
      .map((column) => completionItem(column, "column")));
    Object.entries(aliases).forEach(([alias, tableName]) => {
      (state.schema.columnsByTable[tableName] || []).forEach((column) => {
        items.push(completionItem(`${alias}.${column}`, "column"));
      });
    });
  }

  items = uniqueCompletionItems([
    ...items,
    ...SQL_KEYWORDS.map((keyword) => completionItem(keyword, "keyword")),
  ]).filter((item) => {
    const candidate = context.qualifier ? item.text.split(".").pop() : item.text;
    return !context.prefix || candidate.toLowerCase().startsWith(context.prefix.toLowerCase());
  });
  items.sort((left, right) => {
    const leftExact = left.text.toLowerCase() === context.fragment.toLowerCase() ? 0 : 1;
    const rightExact = right.text.toLowerCase() === context.fragment.toLowerCase() ? 0 : 1;
    return leftExact - rightExact || left.text.localeCompare(right.text);
  });
  return { list: items, from: context.from, to: context.to };
}

function showSqlHints(editor) {
  if (!window.CodeMirror?.showHint) return;
  window.CodeMirror.showHint(editor, sqlHint, {
    completeSingle: false,
    closeOnUnfocus: false,
    alignWithWord: true,
  });
}

function selectedLineRange(editor) {
  const selection = editor.listSelections()[0];
  return {
    from: Math.min(selection.anchor.line, selection.head.line),
    to: Math.max(selection.anchor.line, selection.head.line),
  };
}

function toggleCommentLines(editor) {
  const { from, to } = selectedLineRange(editor);
  const lines = [];
  for (let line = from; line <= to; line += 1) lines.push(editor.getLine(line));
  const nonEmpty = lines.filter((line) => line.trim());
  const shouldUncomment = nonEmpty.length > 0 && nonEmpty.every((line) => /^\s*--(?:\s|$)/.test(line));
  editor.operation(() => {
    for (let line = from; line <= to; line += 1) {
      const content = editor.getLine(line);
      if (!content.trim()) continue;
      const indent = content.search(/\S|$/);
      if (shouldUncomment) {
        const commentLength = content.slice(indent).startsWith("-- ") ? 3 : 2;
        editor.replaceRange("", { line, ch: indent }, { line, ch: indent + commentLength }, "toggleComment");
      } else {
        editor.replaceRange("-- ", { line, ch: indent }, { line, ch: indent }, "toggleComment");
      }
    }
  });
}

function moveEditorLines(editor, direction) {
  const { from, to } = selectedLineRange(editor);
  const neighbor = direction < 0 ? from - 1 : to + 1;
  if (neighbor < 0 || neighbor >= editor.lineCount()) return;
  const lines = editor.getValue().split("\n");
  const count = to - from + 1;
  const block = lines.splice(from, count);
  lines.splice(direction < 0 ? from - 1 : from + 1, 0, ...block);
  const mapLine = (line) => {
    if (direction < 0) {
      if (line >= from && line <= to) return line - 1;
      if (line === from - 1) return to;
    } else {
      if (line >= from && line <= to) return line + 1;
      if (line === to + 1) return from;
    }
    return line;
  };
  const selections = editor.listSelections().map((selection) => ({
    anchor: { line: mapLine(selection.anchor.line), ch: selection.anchor.ch },
    head: { line: mapLine(selection.head.line), ch: selection.head.ch },
  }));
  editor.operation(() => {
    editor.setValue(lines.join("\n"), "moveLine");
    editor.setSelections(selections);
  });
}

function toggleAnswer() {
  if (!selectedProblem()) return;
  setAnswerVisibility(elements.answerSection.classList.contains("hidden"));
}

function createSqlEditor() {
  if (!window.CodeMirror) return;
  state.editor = window.CodeMirror.fromTextArea(elements.sqlEditor, {
    mode: "text/x-sql",
    theme: "default",
    inputStyle: "textarea",
    lineNumbers: true,
    lineWrapping: true,
    matchBrackets: true,
    indentUnit: 2,
    tabSize: 2,
    indentWithTabs: false,
    smartIndent: true,
    autoCloseBrackets: "()[]{}''\"\"",
    autofocus: false,
    extraKeys: {
      Tab: "indentMore",
      "Shift-Tab": "indentLess",
      "Ctrl-Space": showSqlHints,
      "Cmd-Space": showSqlHints,
      "Ctrl-Enter": () => runCurrentQuery(false),
      "Cmd-Enter": () => runCurrentQuery(false),
      "Ctrl-/": toggleCommentLines,
      "Cmd-/": toggleCommentLines,
      "Alt-Up": (editor) => moveEditorLines(editor, -1),
      "Alt-Down": (editor) => moveEditorLines(editor, 1),
    },
  });
  state.editor.setOption("placeholder", elements.sqlEditor.getAttribute("placeholder") || "SELECT ...");
  state.editor.on("inputRead", (editor, change) => {
    if (change.origin === "setValue" || change.origin === "complete" || change.origin === "complete-space") return;
    const input = change.text.join("");
    if (/[A-Za-z0-9_\.\s]$/.test(input)) showSqlHints(editor);
  });
  state.editor.on("change", (editor, change) => {
    if (change.origin !== "complete") return;
    const cursor = editor.getCursor();
    const nextCharacter = editor.getRange(cursor, { line: cursor.line, ch: cursor.ch + 1 });
    if (!nextCharacter || !/^\s$/.test(nextCharacter)) editor.replaceRange(" ", cursor, cursor, "complete-space");
  });
}

function initializeSqlEditor() {
  if (state.editor || elements.sqlEditor.dataset.editorInitialized === "true") return;
  createSqlEditor();
  if (!state.editor) elements.sqlEditor.addEventListener("keydown", handleFallbackEditorKeydown);
  elements.sqlEditor.dataset.editorInitialized = "true";
}

function getEditorValue() {
  return state.editor ? state.editor.getValue() : elements.sqlEditor.value;
}

function setEditorValue(value) {
  if (state.editor) state.editor.setValue(value);
  else elements.sqlEditor.value = value;
}

function focusEditor() {
  if (state.editor) state.editor.focus();
  else elements.sqlEditor.focus();
}

function handleFallbackEditorKeydown(event) {
  if (event.key === "Tab") {
    event.preventDefault();
    const start = elements.sqlEditor.selectionStart;
    const end = elements.sqlEditor.selectionEnd;
    elements.sqlEditor.setRangeText("  ", start, end, "end");
    return;
  }
  if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
    event.preventDefault();
    runCurrentQuery(false);
    return;
  }
  if (event.key === "/" && (event.metaKey || event.ctrlKey)) {
    event.preventDefault();
    toggleFallbackComments();
    return;
  }
  if ((event.key === "ArrowUp" || event.key === "ArrowDown") && event.altKey) {
    event.preventDefault();
    moveFallbackLine(event.key === "ArrowUp" ? -1 : 1);
    return;
  }
  const pairs = { "(": ")", "[": "]", "{": "}", "'": "'", '"': '"' };
  if (pairs[event.key]) {
    const start = elements.sqlEditor.selectionStart;
    const end = elements.sqlEditor.selectionEnd;
    event.preventDefault();
    elements.sqlEditor.setRangeText(`${event.key}${pairs[event.key]}`, start, end, "end");
    elements.sqlEditor.selectionStart = elements.sqlEditor.selectionEnd - 1;
  }
}

function toggleFallbackComments() {
  const textarea = elements.sqlEditor;
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const lineStart = textarea.value.lastIndexOf("\n", start - 1) + 1;
  const lineEndIndex = textarea.value.indexOf("\n", end);
  const lineEnd = lineEndIndex < 0 ? textarea.value.length : lineEndIndex;
  const selected = textarea.value.slice(lineStart, lineEnd);
  const lines = selected.split("\n");
  const nonEmpty = lines.filter((line) => line.trim());
  const shouldUncomment = nonEmpty.length > 0 && nonEmpty.every((line) => /^\s*--(?:\s|$)/.test(line));
  const replacement = lines.map((line) => {
    if (!line.trim()) return line;
    const indent = line.match(/^\s*/)[0].length;
    return shouldUncomment
      ? line.slice(0, indent) + line.slice(indent).replace(/^--\s?/, "")
      : `${line.slice(0, indent)}-- ${line.slice(indent)}`;
  }).join("\n");
  textarea.setRangeText(replacement, lineStart, lineEnd, "select");
}

function moveFallbackLine(direction) {
  const textarea = elements.sqlEditor;
  const lines = textarea.value.split("\n");
  const lineStart = textarea.value.lastIndexOf("\n", textarea.selectionStart - 1) + 1;
  const lineIndex = textarea.value.slice(0, lineStart).split("\n").length - 1;
  const targetIndex = lineIndex + direction;
  if (targetIndex < 0 || targetIndex >= lines.length) return;
  [lines[lineIndex], lines[targetIndex]] = [lines[targetIndex], lines[lineIndex]];
  textarea.value = lines.join("\n");
  const newLineStart = lines.slice(0, targetIndex).join("\n").length + (targetIndex ? 1 : 0);
  textarea.selectionStart = newLineStart;
  textarea.selectionEnd = newLineStart;
}

function stripSqlComments(sql) {
  return sql.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/--[^\n\r]*/g, " ");
}

function prepareReadOnlySql(sql) {
  const cleaned = stripSqlComments(sql).trim();
  if (!cleaned) throw new Error("SQLを入力してください。");
  if (!/^(SELECT|WITH)\b/i.test(cleaned)) throw new Error("MVPではSELECTまたはWITHから始まる読み取りSQLのみ実行できます。");
  const withoutTrailingSemicolon = cleaned.replace(/;\s*$/, "");
  if (withoutTrailingSemicolon.includes(";")) throw new Error("複数のSQLを一度に実行することはできません。");
  if (/\b(INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|REPLACE|ATTACH|DETACH|PRAGMA|VACUUM|REINDEX|BEGIN|COMMIT|ROLLBACK)\b/i.test(withoutTrailingSemicolon)) {
    throw new Error("データを変更するSQLや管理用SQLは実行できません。");
  }
  return withoutTrailingSemicolon;
}

function execute(sql) {
  if (!state.db) throw new Error("SQLiteデータベースが読み込まれていません。CSVからSQLiteを生成してください。");
  const result = state.db.exec(prepareReadOnlySql(sql));
  if (!result.length) return { columns: [], values: [] };
  return { columns: result[0].columns, values: result[0].values };
}

function normalizedValue(value) {
  if (value === null || value === undefined) return "null:";
  if (typeof value === "number") return `number:${Math.round(value * 1e9) / 1e9}`;
  return `text:${String(value)}`;
}

function valuesMatch(actual, expected, numericTolerance) {
  if (typeof actual === "number" && typeof expected === "number") {
    return Math.abs(actual - expected) <= numericTolerance;
  }
  return normalizedValue(actual) === normalizedValue(expected);
}

function rowsMatch(actual, expected, numericTolerance) {
  return actual.length === expected.length
    && actual.every((value, index) => valuesMatch(value, expected[index], numericTolerance));
}

function resultsMatch(actual, expected, comparison) {
  if (actual.columns.length !== expected.columns.length || actual.values.length !== expected.values.length) return false;
  const numericTolerance = Number.isFinite(comparison?.numericTolerance) ? comparison.numericTolerance : 0;
  const actualRows = actual.values;
  const expectedRows = expected.values;
  if (comparison.rowOrder !== "sensitive") {
    if (numericTolerance === 0) {
      const normalizeRows = (rows) => rows.map((row) => row.map(normalizedValue).join("\u0001")).sort();
      return JSON.stringify(normalizeRows(actualRows)) === JSON.stringify(normalizeRows(expectedRows));
    }
    const matched = new Set();
    return actualRows.every((actualRow) => {
      const expectedIndex = expectedRows.findIndex((expectedRow, index) => (
        !matched.has(index) && rowsMatch(actualRow, expectedRow, numericTolerance)
      ));
      if (expectedIndex < 0) return false;
      matched.add(expectedIndex);
      return true;
    });
  }
  return actualRows.every((actualRow, index) => rowsMatch(actualRow, expectedRows[index], numericTolerance));
}

function renderResult(result) {
  elements.resultSummary.textContent = `${result.values.length}行 · ${result.columns.length}列`;
  if (!result.columns.length) {
    elements.resultOutput.innerHTML = '<p class="muted">結果がありません。</p>';
    return;
  }
  const table = document.createElement("table");
  const header = document.createElement("tr");
  result.columns.forEach((column) => {
    const cell = document.createElement("th");
    cell.scope = "col";
    cell.textContent = column;
    header.appendChild(cell);
  });
  const thead = document.createElement("thead");
  thead.appendChild(header);
  table.appendChild(thead);
  const tbody = document.createElement("tbody");
  result.values.slice(0, 1000).forEach((row) => {
    const tr = document.createElement("tr");
    row.forEach((value) => {
      const cell = document.createElement("td");
      cell.textContent = value === null ? "NULL" : String(value);
      tr.appendChild(cell);
    });
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  elements.resultOutput.innerHTML = "";
  elements.resultOutput.appendChild(table);
}

function showError(message) {
  elements.feedback.className = "feedback error";
  elements.feedback.textContent = message;
}

async function loadDatabaseBytes(manifest) {
  const paths = Array.isArray(manifest.files) && manifest.files.length
    ? manifest.files
    : [manifest.path];
  if (paths.some((path) => typeof path !== "string" || !path)) {
    throw new Error("SQLiteファイルのマニフェストが不正です。");
  }

  const responses = await Promise.all(paths.map(async (path) => {
    const response = await fetch(`${DATA_ROOT}/${path}`);
    if (!response.ok) throw new Error("SQLite未生成");
    return new Uint8Array(await response.arrayBuffer());
  }));
  const totalLength = responses.reduce((total, bytes) => total + bytes.length, 0);
  const combined = new Uint8Array(totalLength);
  let offset = 0;
  responses.forEach((bytes) => {
    combined.set(bytes, offset);
    offset += bytes.length;
  });
  return combined;
}

function runCurrentQuery(submit) {
  const problem = selectedProblem();
  if (!problem) return;
  try {
    const actual = execute(getEditorValue());
    renderResult(actual);
    if (!submit) {
      elements.feedback.className = "feedback";
      elements.feedback.textContent = "";
      return;
    }
    const expected = execute(problem.referenceSql);
    if (resultsMatch(actual, expected, problem.comparison)) {
      state.progress.completed[problem.id] = true;
      saveProgress();
      elements.feedback.className = "feedback success";
      elements.feedback.textContent = "正解！";
      setAnswerVisibility(true);
    } else {
      elements.feedback.className = "feedback error";
      elements.feedback.textContent = "不正解！";
    }
  } catch (error) {
    showError(error instanceof Error ? error.message : "SQLの実行に失敗しました。");
  }
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[character]));
}

async function loadData() {
  try {
    const problemsResponse = await fetch(`${DATA_ROOT}/problems.json`);
    if (!problemsResponse.ok) throw new Error("問題定義を読み込めませんでした。");
    state.problems = await problemsResponse.json();
    await synchronizeProgress();
    elements.progressFilter.value = "incomplete";
    populateCategoryFilter();
    renderProgress();
    renderProblemList();
    renderNextProblemList();

    const manifestResponse = await fetch(`${DATA_ROOT}/db-manifest.json`);
    if (!manifestResponse.ok) throw new Error("データベースのマニフェストを読み込めませんでした。");
    const manifest = await manifestResponse.json();
    if (!manifest.available) throw new Error("SQLite未生成");
    const bytes = await loadDatabaseBytes(manifest);
    const SQL = await initSqlJs({ locateFile: (file) => `${CDN_BASE}${file}` });
    state.db = new SQL.Database(bytes);
    state.schema = loadSqlSchema(state.db);
    elements.dataStatus.textContent = "SQLite準備完了";
    elements.dataStatus.classList.add("ready");
    elements.runButton.disabled = false;
    elements.submitButton.disabled = false;
  } catch (error) {
    elements.dataStatus.textContent = "CSV取り込み後にSQLiteを生成してください";
    elements.dataStatus.classList.add("error");
    elements.runButton.disabled = true;
    elements.submitButton.disabled = true;
    console.info("Database is not available yet:", error);
  }
}

elements.progressFilter.addEventListener("change", renderProblemList);
elements.categoryFilter.addEventListener("change", renderProblemList);
elements.previousProblemButton.addEventListener("click", () => moveToRelativeProblem(-1));
elements.nextProblemButton.addEventListener("click", () => moveToRelativeProblem(1));
elements.menuButton.addEventListener("click", () => {
  if (elements.problemDrawer.classList.contains("open")) closeProblemDrawer();
  else openProblemDrawer();
});
elements.problemDrawerClose.addEventListener("click", () => closeProblemDrawer());
elements.drawerOverlay.addEventListener("click", closeProblemDrawer);
elements.progressDetailButton.addEventListener("click", openProgressModal);
elements.progressModalClose.addEventListener("click", closeProgressModal);
elements.progressModal.addEventListener("click", (event) => {
  if (event.target.matches("[data-modal-close]")) closeProgressModal();
});
document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  if (!elements.progressModal.classList.contains("hidden")) closeProgressModal();
  if (elements.problemDrawer.classList.contains("open")) closeProblemDrawer();
});
elements.favoriteButton.addEventListener("click", () => {
  if (!state.selectedId) return;
  state.progress.favorites[state.selectedId] = !state.progress.favorites[state.selectedId];
  saveProgress();
  updateFavoriteButton();
});
elements.runButton.addEventListener("click", () => runCurrentQuery(false));
elements.submitButton.addEventListener("click", () => runCurrentQuery(true));
elements.answerButton.addEventListener("click", toggleAnswer);
elements.hintButton.addEventListener("click", toggleHint);

loadData();
