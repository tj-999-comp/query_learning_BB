const AUTH_REALM = "SQL-Practice-Notebook";
const SECURITY_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "no-referrer",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "Content-Security-Policy": "default-src 'self'; script-src 'self' https://cdnjs.cloudflare.com 'wasm-unsafe-eval'; connect-src 'self' https://cdnjs.cloudflare.com; style-src 'self' https://cdnjs.cloudflare.com; object-src 'none'; base-uri 'none'; frame-ancestors 'none'",
};

function responseHeaders(overrides = {}) {
  const headers = new Headers(SECURITY_HEADERS);
  Object.entries(overrides).forEach(([name, value]) => headers.set(name, value));
  return headers;
}

function unauthorized() {
  return new Response("認証が必要です。", {
    status: 401,
    headers: responseHeaders({
      "Cache-Control": "no-store",
      "WWW-Authenticate": `Basic realm="${AUTH_REALM}", charset="UTF-8"`,
    }),
  });
}

function serverConfigurationError() {
  return new Response("認証設定がありません。", {
    status: 500,
    headers: responseHeaders({ "Cache-Control": "no-store" }),
  });
}

function decodeCredentials(encoded) {
  try {
    const binary = atob(encoded);
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
    const credentials = new TextDecoder().decode(bytes);
    const separator = credentials.indexOf(":");
    if (separator < 0) return null;
    return {
      username: credentials.slice(0, separator),
      password: credentials.slice(separator + 1),
    };
  } catch {
    return null;
  }
}

async function digest(value) {
  return new Uint8Array(
    await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)),
  );
}

async function safelyEqual(left, right) {
  const leftDigest = await digest(left);
  const rightDigest = await digest(right);
  let difference = 0;
  for (let index = 0; index < leftDigest.length; index += 1) {
    difference |= leftDigest[index] ^ rightDigest[index];
  }
  return difference === 0;
}

function privateResponse(response) {
  const headers = new Headers(response.headers);
  Object.entries(SECURITY_HEADERS).forEach(([name, value]) => headers.set(name, value));
  headers.set("Cache-Control", "private, no-store");
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export async function onRequest(context) {
  const expectedUsername = context.env.BASIC_AUTH_USERNAME;
  const expectedPassword = context.env.BASIC_AUTH_PASSWORD;
  if (!expectedUsername || !expectedPassword) return serverConfigurationError();

  const authorization = context.request.headers.get("Authorization");
  if (!authorization) return unauthorized();

  const [scheme, encoded] = authorization.split(/\s+/, 2);
  if (!/^Basic$/i.test(scheme) || !encoded) return unauthorized();

  const credentials = decodeCredentials(encoded);
  if (
    !credentials
    || !(await safelyEqual(credentials.username, expectedUsername))
    || !(await safelyEqual(credentials.password, expectedPassword))
  ) {
    return unauthorized();
  }

  return privateResponse(await context.next());
}
