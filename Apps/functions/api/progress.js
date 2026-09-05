const MAX_BODY_BYTES = 64 * 1024;
const MAX_PROGRESS_KEYS = 1000;
const KEY_PREFIX = "sql-learning-progress:v1:";

function responseHeaders(overrides = {}) {
  const headers = new Headers({
    "Content-Type": "application/json; charset=UTF-8",
    "Cache-Control": "private, no-store",
  });
  Object.entries(overrides).forEach(([name, value]) => headers.set(name, value));
  return headers;
}

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: responseHeaders(),
  });
}

function errorResponse(message, status) {
  return jsonResponse({ error: message }, status);
}

function decodeUsername(request) {
  const authorization = request.headers.get("Authorization") || "";
  const [scheme, encoded] = authorization.split(/\s+/, 2);
  if (!/^Basic$/i.test(scheme) || !encoded) return null;
  try {
    const binary = atob(encoded);
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
    const credentials = new TextDecoder().decode(bytes);
    const separator = credentials.indexOf(":");
    return separator < 0 ? null : credentials.slice(0, separator);
  } catch {
    return null;
  }
}

async function progressKey(username) {
  const digest = new Uint8Array(
    await crypto.subtle.digest("SHA-256", new TextEncoder().encode(username)),
  );
  const hex = [...digest].map((value) => value.toString(16).padStart(2, "0")).join("");
  return `${KEY_PREFIX}${hex}`;
}

function normalizeFlags(flags) {
  if (!flags || typeof flags !== "object" || Array.isArray(flags)) return {};
  return Object.fromEntries(
    Object.entries(flags)
      .filter(([key, enabled]) => typeof key === "string" && key.length <= 200 && enabled === true)
      .slice(0, MAX_PROGRESS_KEYS),
  );
}

function normalizeProgress(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return {
    completed: normalizeFlags(value.completed),
    favorites: normalizeFlags(value.favorites),
  };
}

function assertConfigured(context) {
  if (!context.env.PROGRESS_KV) {
    return errorResponse("進捗保存の設定がありません。", 503);
  }
  return null;
}

function assertAuthenticated(context) {
  const username = decodeUsername(context.request);
  if (!username || username !== context.env.BASIC_AUTH_USERNAME) {
    return errorResponse("認証が必要です。", 401);
  }
  return username;
}

export async function onRequestGet(context) {
  const configurationError = assertConfigured(context);
  if (configurationError) return configurationError;
  const username = assertAuthenticated(context);
  if (username instanceof Response) return username;

  try {
    const saved = await context.env.PROGRESS_KV.get(await progressKey(username));
    if (!saved) return jsonResponse({ completed: {}, favorites: {} });
    const progress = normalizeProgress(JSON.parse(saved));
    return progress ? jsonResponse(progress) : jsonResponse({ completed: {}, favorites: {} });
  } catch (error) {
    console.error("Failed to read progress:", error);
    return errorResponse("進捗を読み込めませんでした。", 503);
  }
}

export async function onRequestPut(context) {
  const configurationError = assertConfigured(context);
  if (configurationError) return configurationError;
  const username = assertAuthenticated(context);
  if (username instanceof Response) return username;

  const contentLength = Number(context.request.headers.get("Content-Length") || 0);
  if (contentLength > MAX_BODY_BYTES) return errorResponse("保存データが大きすぎます。", 413);
  if (!(context.request.headers.get("Content-Type") || "").toLowerCase().startsWith("application/json")) {
    return errorResponse("JSON形式で送信してください。", 415);
  }

  try {
    const body = await context.request.arrayBuffer();
    if (body.byteLength > MAX_BODY_BYTES) return errorResponse("保存データが大きすぎます。", 413);
    const progress = normalizeProgress(JSON.parse(new TextDecoder().decode(body)));
    if (!progress) return errorResponse("進捗データが不正です。", 400);
    await context.env.PROGRESS_KV.put(await progressKey(username), JSON.stringify(progress));
    return jsonResponse({ saved: true });
  } catch (error) {
    if (error instanceof SyntaxError) return errorResponse("進捗データが不正です。", 400);
    console.error("Failed to write progress:", error);
    return errorResponse("進捗を保存できませんでした。", 503);
  }
}
