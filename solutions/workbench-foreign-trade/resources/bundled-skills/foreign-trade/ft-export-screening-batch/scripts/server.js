var http = require("http");
var https = require("https");
var fs = require("fs");
var path = require("path");

var PORT = 3000;
var API_HOST = "data.trade.gov";

var MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".ico": "image/x-icon",
};

function proxyApi(reqPath, queryStr, res) {
  // Extract api_key from query string, use as subscription-key header
  var params = new URLSearchParams(queryStr || "");
  var apiKey = params.get("api_key");
  params.delete("api_key");
  var cleanPath = reqPath.replace(/^\/api/, "");
  var newQS = params.toString();
  if (newQS) cleanPath += "?" + newQS;

  var options = {
    hostname: API_HOST,
    path: cleanPath,
    method: "GET",
    headers: { Accept: "application/json" },
  };

  if (apiKey) {
    options.headers["subscription-key"] = apiKey;
    console.log("[auth] subscription-key: (set)"); // 不在日志里留 key 片段
  }

  console.log("[req] " + API_HOST + cleanPath);
  doRequest(options, res, 0);
}

function doRequest(options, res, redirectCount) {
  if (redirectCount > 3) {
    res.writeHead(502, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "重定向次数过多" }));
    return;
  }

  var proxyReq = https.request(options, function(proxyRes) {
    console.log("[status] " + proxyRes.statusCode);

    if (proxyRes.statusCode === 301 || proxyRes.statusCode === 302) {
      var loc = proxyRes.headers.location;
      console.log("[redirect] -> " + loc);
      if (!loc) {
        res.writeHead(502, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "API 返回 " + proxyRes.statusCode + " 但没有 Location 头" }));
        return;
      }
      var newUrl = new URL(loc, "https://" + options.hostname);
      // 只跟随到 trade.gov 的重定向，避免把 subscription-key 头转发给其它主机
      if (newUrl.protocol !== "https:" || !(newUrl.hostname === API_HOST || newUrl.hostname.endsWith(".trade.gov"))) {
        res.writeHead(502, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "拒绝跟随到非 trade.gov 的重定向", location: loc }));
        return;
      }
      var newOpts = {
        hostname: newUrl.hostname,
        path: newUrl.pathname + newUrl.search,
        method: "GET",
        headers: options.headers,
      };
      doRequest(newOpts, res, redirectCount + 1);
      return;
    }

    var body = "";
    proxyRes.on("data", function(chunk) { body += chunk; });
    proxyRes.on("end", function() {
      res.writeHead(proxyRes.statusCode, {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      });
      res.end(body);
    });
  });

  proxyReq.on("error", function(err) {
    res.writeHead(502, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "API 请求失败", detail: err.message }));
  });

  proxyReq.setTimeout(30000, function() {
    proxyReq.destroy();
    res.writeHead(504, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "API 请求超时" }));
  });

  proxyReq.end();
}

function serveStatic(filePath, res) {
  var ext = path.extname(filePath).toLowerCase();
  var contentType = MIME[ext] || "application/octet-stream";
  try {
    var content = fs.readFileSync(filePath);
    res.writeHead(200, { "Content-Type": contentType });
    res.end(content);
  } catch (e) {
    res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
    res.end("<h1>404</h1>");
  }
}

var server = http.createServer(function(req, res) {
  var parsed = new URL(req.url, "http://" + (req.headers.host || "localhost"));

  if (req.method === "OPTIONS") {
    res.writeHead(200, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    });
    res.end();
    return;
  }

  if (parsed.pathname.startsWith("/api/")) {
    proxyApi(parsed.pathname, parsed.search, res);
    return;
  }

  var filePath = parsed.pathname === "/" ? "/export_screening.html" : parsed.pathname;
  var fullPath = path.join(__dirname, filePath);
  if (!fullPath.startsWith(__dirname)) { res.writeHead(403); res.end("Forbidden"); return; }
  serveStatic(fullPath, res);
});

// 只绑本机回环地址：原版不传 host，会监听所有网卡，局域网内任何人都能用这台机器当代理
server.listen(PORT, "127.0.0.1", function() {
  console.log("==========================================");
  console.log("  出口管制筛查工具已启动 / スクリーニングツール起動");
  console.log("  http://127.0.0.1:" + PORT);
  console.log("  API: " + API_HOST);
  console.log("==========================================");
});
