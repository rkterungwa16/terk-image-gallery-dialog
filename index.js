const http = require("http");
const { Routers } = require("./router");
const { HomePage } = require("./handlers/pages/home.page.js");
const { Assets } = require("./handlers/assets.js");

const port = process.env.PORT || 8700;

Routers.register("public", Assets).register('/', HomePage);

/**
 * Handles incoming HTTP requests and sends a response.
 * @param {http.IncomingMessage} req - The incoming request object.
 * @param {http.ServerResponse} res - The server response object.
 */
const routes = function (req, res) {
  Routers.check(req.url, [req, res]);
};

// Instantiate the HTTP server
const server = http.createServer(routes).listen(port, function () {
  console.log(
    "\x1b[36m%s\x1b[0m",
    "The HTTP server is running on port " + port
  );
});

module.exports = server;
