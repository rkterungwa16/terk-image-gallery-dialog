const { addUniversalTemplates, getTemplate } = require("../../template-engine");

const HomePage = async (req, res) => {
  switch (req.method) {
    case "GET":
      // Prepare data for interpolation
      const templateData = {
        "head.title": "Terk UI Image Gallery Dialog",
        "head.description":
          "A vanilla JavaScript implementation of an image gallery dialog using publish/subscriber pattern",
        "body.class": "index",
      };
      try {
        const indexStr = await getTemplate("index", templateData);
        const pageStr = await addUniversalTemplates(indexStr, templateData);
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(pageStr);
      } catch (e) {
        res.writeHead(500, { "Content-Type": "text/html" });
        res.end("failure 500");
      }
      break;

    default:
      res.writeHead(405, { "Content-Type": "text/html" });
      res.end("handler undefined");
  }
};

module.exports = {
  HomePage,
};
