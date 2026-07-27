const fs = require("fs");

// Parse a JSON string to an object in all cases, without throwing
const parseJsonToObject = (str) => {
  try {
    const obj = JSON.parse(str);
    return obj;
  } catch (e) {
    return {};
  }
};

const processPostRequest = (req, callback) => {
  let body = "";
  // Get the payload,if any
  let decoder = new StringDecoder("utf-8");
  let buffer = "";
  req.on("data", function (data) {
    buffer += decoder.write(data);
  });
  req.on("end", function () {
    buffer += decoder.end();
    callback(parseJsonToObject(buffer));
  });
};

const asyncReadFile = (path) => {
  return new Promise((resolve, reject) => {
    fs.readFile(path, "utf8", (err, stringifiedData) => {
      if (!err && stringifiedData) {
        resolve(stringifiedData);
      }

      reject(new Error(err));
    });
  });
};

module.exports = {
  processPostRequest,
  parseJsonToObject,
  asyncReadFile,
};
