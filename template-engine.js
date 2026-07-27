const path = require("path");

const { asyncReadFile } = require("./utils");

const port = process.env.PORT || 3300;
const config = {
  templateGlobals: {
    appName: "Terk UI Image Gallery Dialog",
    companyName: "Kombolt Technologies, Inc.",
    yearCreated: "2025",
    baseUrl: `http://localhost:${port}/`,
  },
};

const interpolate = (str, data) => {
  str = typeof str == "string" && str.length > 0 ? str : "";
  data = typeof data == "object" && data !== null ? data : {};

  // Add the templateGlobals to the data object, prepending their key name with "global."
  for (let keyName in config.templateGlobals) {
    if (config.templateGlobals.hasOwnProperty(keyName)) {
      data["global." + keyName] = config.templateGlobals[keyName];
    }
  }
  // For each key in the data object, insert its value into the string at the corresponding placeholder
  for (let key in data) {
    if (data.hasOwnProperty(key) && typeof (data[key] == "string")) {
      let replace = data[key];
      let find = "{" + key + "}";
      str = str.replace(find, replace);
    }
  }
  return str;
};

// Get the string content of a template, and use provided data for string interpolation
const getTemplate = async (templateName, data) => {
  templateName =
    typeof templateName == "string" && templateName.length > 0
      ? templateName
      : false;
  data = typeof data == "object" && data !== null ? data : {};
  if (templateName) {
    let templatesDir = path.join(__dirname, "./views/");

    try {
      let finalString = await asyncReadFile(
        templatesDir + templateName + ".html"
      );
      finalString = interpolate(finalString, data);
      return finalString;
    } catch (e) {
      throw new Error("No template could be found");
    }
  } else {
  }
};

// Add the universal header and footer to a string, and pass provided data object to header and footer for interpolation
const addUniversalTemplates = async (str, data) => {
  str = typeof str == "string" && str.length > 0 ? str : "";
  data = typeof data == "object" && data !== null ? data : {};
  // Get the header
  try {
    const header = await getTemplate("_header", data);
    const footer = await getTemplate("_footer", data);
    const fullString = header + str + footer;
    return fullString;
  } catch (e) {
    throw new Error("No template could be found");
  }
};

module.exports = {
  addUniversalTemplates,
  getTemplate,
  interpolate,
};
