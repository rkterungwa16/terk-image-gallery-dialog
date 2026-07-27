const path = require("path");

const { asyncReadFile } = require("../utils");

const Assets = async (req, res) => {
  const sendError = function (message, code) {
    // res.writeHead(code || 404, {'Content-Type': 'text/html'});
    res.end(message);
  };
  const serve = function (file) {
    let contentType;
    switch (file.ext.toLowerCase()) {
      case "css":
        contentType = "text/css";
        break;
      case "html":
        contentType = "text/html";
        break;
      case "js":
        contentType = "application/javascript";
        break;
      case "ico":
        contentType = "image/ico";
        break;
      case "json":
        contentType = "application/json";
        break;
      case "jpg":
        contentType = "image/jpeg";
        break;
      case "jpeg":
        contentType = "image/jpeg";
        break;
      case "png":
        contentType = "image/png";
        break;
      case "webp":
        contentType = "image/webp";
        break;
      case "svg":
        contentType = "image/svg+xml";
        break;
      default:
        contentType = "text/plain";
    }
    res.writeHead(200, { "Content-Type": contentType });
    res.end(file.content);
  };
  try {
    const urlPath = path.join(__dirname, `/../${req.url}`);
    console.log("REQ.URL", req.url);
    console.log("URL__PATH__", urlPath);
    const data = await asyncReadFile(urlPath);
    serve({
      ext: urlPath.split(".").pop(),
      content: data,
    });
  } catch (e) {
    console.log("ERROR___", e);
    throw new Error("Could not find file");
  }
};

module.exports = {
  Assets,
};
