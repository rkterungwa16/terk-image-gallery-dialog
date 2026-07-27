export class Router {
  constructor() {
    this.root = "/";
    this.routes = [];
  }

  register = (name, handler) => {
    if (typeof name == "function") {
      handler = name;
      name = "";
    }
    this.routes.push({
      name,
      handler,
    });
    return this;
  };

  check = (f, [req, res]) => {
    for (let i = 0; i < this.routes.length; i++) {
      let name = this.routes[i].name;
      if (req.url === "/" && req.url === name) {
        this.routes[i].handler(req, res);
        return this;
      } else if (req.url.includes(name)) {
        this.routes[i].handler(req, res);
        return this;
      }
    }
    return false;
  };
}

export const Routers = new Router();
