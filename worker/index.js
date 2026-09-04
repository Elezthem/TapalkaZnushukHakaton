const DEFAULT_ENDPOINT = "https://mcp.silpo.ua/mcp";

function json(data, init = {}) {
  const headers = new Headers(init.headers || {});
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json; charset=utf-8");
  }
  headers.set("Access-Control-Allow-Origin", "*");
  headers.set("Access-Control-Allow-Headers", "Content-Type");
  headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");

  return new Response(JSON.stringify(data), {
    ...init,
    headers
  });
}

async function forwardRpc({ endpoint, method, params }, env) {
  const token = env.SILPO_MCP_TOKEN;
  if (!token) {
    throw new Error("SILPO_MCP_TOKEN is missing. Set it as a Cloudflare secret.");
  }

  const upstream = await fetch(endpoint || env.SILPO_MCP_ENDPOINT || DEFAULT_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({
      "jsonrpc": "2.0",
      "id": crypto.randomUUID(),
      method,
      "params": params || {}
    })
  });

  const payload = await upstream.json();
  if (!upstream.ok || payload.error) {
    throw new Error(payload.error?.message || `Upstream MCP error ${upstream.status}`);
  }

  return payload.result;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return json({}, { status: 204 });
    }

    if (url.pathname === "/health") {
      return json({
        ok: true,
        endpoint: env.SILPO_MCP_ENDPOINT || DEFAULT_ENDPOINT,
        hasToken: Boolean(env.SILPO_MCP_TOKEN)
      });
    }

    if (url.pathname === "/api/mcp") {
      if (request.method !== "POST") {
        return json({ error: { message: "Method not allowed" } }, { status: 405 });
      }

      try {
        const body = await request.json();
        const result = await forwardRpc(body || {}, env);
        return json({ result });
      } catch (error) {
        return json({ error: { message: error.message } }, { status: 500 });
      }
    }

    return env.ASSETS.fetch(request);
  }
};
