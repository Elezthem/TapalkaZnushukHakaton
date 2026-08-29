const http = require("http");
const { URL } = require("url");

const port = Number(process.env.PORT || 8787);
const defaultEndpoint = process.env.SILPO_MCP_ENDPOINT || "https://mcp.silpo.ua/mcp";
const bearerToken = process.env.SILPO_MCP_TOKEN || "";

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type"
  });
  res.end(JSON.stringify(payload));
}

async function readJson(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return chunks.length ? JSON.parse(Buffer.concat(chunks).toString("utf8")) : {};
}

async function forwardRpc(endpoint, method, params) {
  if (!bearerToken) {
    throw new Error("SILPO_MCP_TOKEN is missing. Keep token server-side, as required by the docs.");
  }

  const response = await fetch(new URL(endpoint || defaultEndpoint), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${bearerToken}`
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: `${Date.now()}`,
      method,
      params
    })
  });

  const data = await response.json();
  if (!response.ok || data.error) {
    const message = data.error?.message || `Upstream MCP error ${response.status}`;
    throw new Error(message);
  }

  return data.result;
}

const server = http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    });
    return res.end();
  }

  if (req.method === "GET" && req.url === "/health") {
    return sendJson(res, 200, {
      ok: true,
      endpoint: defaultEndpoint,
      hasToken: Boolean(bearerToken)
    });
  }

  if (req.method !== "POST" || req.url !== "/api/mcp") {
    return sendJson(res, 404, { error: { message: "Route not found" } });
  }

  try {
    const body = await readJson(req);
    const result = await forwardRpc(body.endpoint, body.method, body.params || {});
    return sendJson(res, 200, { result });
  } catch (error) {
    return sendJson(res, 500, { error: { message: error.message } });
  }
});

server.listen(port, () => {
  console.log(`Silpo MCP proxy listening on http://localhost:${port}`);
});
