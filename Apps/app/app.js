const DATA_ROOT = "../data";
const STORAGE_KEY = "bleague-sql-learning-progress-v1";
const CDN_BASE = "https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/";
let storageAvailable = true;

const state = {
  db: null,
  problems: [],
  selectedId: null,
  editor: null,
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
  questionView: document.querySelector("#question-view"),
  questionCategory: document.querySelector("#question-category"),
  questionTitle: document.querySelector("#question-title"),
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
  feedback: document.querySelector("#feedback"),
  resultSummary: document.querySelector("#result-summary"),
  resultOutput: document.querySelector("#result-output"),
  answerSection: document.querySelector("#answer-section"),
  referenceSql: document.querySelector("#reference-sql"),
  questionExplanation: document.querySelector("#question-explanation"),
};

function loadProgress() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    return {
      completed: parsed.completed && typeof parsed.completed === "object" ? parsed.completed : {},
      favorites: parsed.favorites && typeof parsed.favorites === "object" ? parsed.favorites : {},
    };
  } catch {
    storageAvailable = false;
    return { completed: {}, favorites: {} };
  }
}

function saveProgress() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.progress));
  } catch {
    storageAvailable = false;
  }
  renderProgress();
  renderProblemList();
  return storageAvailable;
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
    ? "進捗とお気に入りは、このブラウザに保存されます。"
    : "このブラウザでは保存できません。ページを閉じると進捗とお気に入りは失われます。";
  elements.storageStatus.classList.toggle("storage-warning", !storageAvailable);
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

function updateProblemNavigation() {
  const visible = visibleProblems();
  const currentIndex = visible.findIndex((problem) => problem.id === state.selectedId);
  const hasCurrentProblem = currentIndex >= 0;
  elements.previousProblemButton.disabled = !hasCurrentProblem || currentIndex === 0;
  elements.nextProblemButton.disabled = !hasCurrentProblem || currentIndex === visible.length - 1;
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
  elements.emptyState.classList.add("hidden");
  elements.questionView.classList.remove("hidden");
  if (state.editor) state.editor.refresh();
  elements.questionCategory.textContent = problem.category;
  elements.questionTitle.textContent = `${problemNumber(problem)} ${problem.title}`;
  elements.questionDifficulty.textContent = `難易度 ${difficultyStars(problem.difficulty)}`;
  elements.questionTables.textContent = `使用テーブル: ${problem.sourceTables.join(", ")}`;
  elements.questionPrompt.textContent = problem.prompt;
  setEditorValue("");
  elements.feedback.className = "feedback";
  elements.feedback.textContent = "";
  elements.resultSummary.textContent = "";
  elements.resultOutput.innerHTML = '<p class="muted">SQLを実行すると結果が表示されます。</p>';
  setAnswerVisibility(false);
  elements.referenceSql.textContent = formatReferenceSql(problem.referenceSql);
  elements.questionExplanation.textContent = problem.explanation;
  updateFavoriteButton();
  renderProblemList();
  closeProblemDrawer({ restoreFocus: false });
  focusEditor();
}

function moveToRelativeProblem(offset) {
  const visible = visibleProblems();
  const currentIndex = visible.findIndex((problem) => problem.id === state.selectedId);
  const target = visible[currentIndex + offset];
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
  const label = visible ? "解答例を隠す" : "解答例を表示";
  elements.answerButton.setAttribute("aria-expanded", String(visible));
  elements.answerButton.setAttribute("aria-label", label);
  elements.answerButton.textContent = label;
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
    lineNumbers: true,
    lineWrapping: true,
    matchBrackets: true,
    indentUnit: 2,
    tabSize: 2,
    indentWithTabs: false,
    smartIndent: true,
    autofocus: false,
    extraKeys: {
      Tab: "indentMore",
      "Shift-Tab": "indentLess",
      "Ctrl-Enter": () => runCurrentQuery(false),
      "Cmd-Enter": () => runCurrentQuery(false),
    },
  });
  state.editor.setOption("placeholder", elements.sqlEditor.getAttribute("placeholder") || "SELECT ...");
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
  }
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
  if (result.values.length > 1000) {
    elements.resultOutput.insertAdjacentHTML("afterend", '<p class="muted">表示は先頭1000行までです。</p>');
  }
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
      const wasCompleted = Boolean(state.progress.completed[problem.id]);
      state.progress.completed[problem.id] = true;
      const persisted = saveProgress();
      elements.feedback.className = "feedback success";
      elements.feedback.textContent = wasCompleted
        ? "正解です。達成済みの問題です。"
        : persisted
          ? "正解です。達成状況と正解数を更新しました。"
          : "正解です。ただし、このブラウザでは達成状況を保存できません。";
      setAnswerVisibility(true);
    } else {
      elements.feedback.className = "feedback error";
      elements.feedback.textContent = "不正解です。正解数には加算されません。SQLを修正して再挑戦できます。";
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
    populateCategoryFilter();
    renderProgress();
    renderProblemList();

    const manifestResponse = await fetch(`${DATA_ROOT}/db-manifest.json`);
    if (!manifestResponse.ok) throw new Error("データベースのマニフェストを読み込めませんでした。");
    const manifest = await manifestResponse.json();
    if (!manifest.available) throw new Error("SQLite未生成");
    const bytes = await loadDatabaseBytes(manifest);
    const SQL = await initSqlJs({ locateFile: (file) => `${CDN_BASE}${file}` });
    state.db = new SQL.Database(bytes);
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

createSqlEditor();
if (!state.editor) elements.sqlEditor.addEventListener("keydown", handleFallbackEditorKeydown);

loadData();
