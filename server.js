const http = require("http");
const fs = require("fs");
const path = require("path");

const rootDir = __dirname;
const port = Number(process.env.PORT || 3000);
const host = "0.0.0.0";

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
};

function resolveFilePath(urlPath) {
  const cleanPath = decodeURIComponent(urlPath.split("?")[0] || "/");
  const normalized = path.posix.normalize(cleanPath);
  const safePath = normalized.replace(/^(\.\.(\/|\\|$))+/, "");

  if (safePath === "/" || safePath === ".") {
    return path.join(rootDir, "index.html");
  }

  const fullPath = path.join(rootDir, safePath);
  if (path.extname(fullPath)) {
    return fullPath;
  }

  return path.join(fullPath, "index.html");
}

function sendFile(res, filePath) {
  fs.readFile(filePath, (error, data) => {
    if (error) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Not found");
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
      "Content-Type": contentTypes[ext] || "application/octet-stream",
      "Cache-Control": "no-cache",
    });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  const filePath = resolveFilePath(req.url || "/");
  sendFile(res, filePath);
});

server.listen(port, host, () => {
  // eslint-disable-next-line no-console
  console.log(`GaiaTakas web is running on http://${host}:${port}`);
});
