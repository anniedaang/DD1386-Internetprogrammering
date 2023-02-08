import http from "http";
import fs from "fs";

let dirName = "/Users/anniedang/Documents/DD1386 Prog/adang-lab2/src/part3";

const requestHandler = function (req, res) {
  // if the url in the request is "/" and the method GET, then server will read the file chomp.html and send the content in the response body
  if (req.url === "/" && req.method === "GET") {
    fs.readFile(dirName + "/chomp.html", function (err, data) {
      if (err) {
        console.log("Error reading file", err);
      } else {
        res.writeHead(200, { "Content-Type": "text/html" });
        res.write(data);
        res.end();
      }
    });
  }
  // if the url in the request is "/chomp.js" and the method GET, then server will read the file chomp.js and send the content in the response body to client
  else if (req.url === "/chomp.js" && req.method === "GET") {
    fs.readFile(dirName + "/chomp.js", function (err, data) {
      if (err) {
        console.log("Error reading file", err);
      } else {
        res.writeHead(200, { "Content-Type": "text/javascript" });
        res.write(data);
        res.end();
      }
    });
  }
  // if the url in the request is "/chomp.css" and the method GET, then server will read the file chomp.css and send the content in the response body to client
  else if (req.url === "/chomp.css" && req.method === "GET") {
    fs.readFile(dirName + "/chomp.css", function (err, data) {
      if (err) {
        console.log("Error reading file", err);
      } else {
        res.writeHead(200, { "Content-Type": "text/css" });
        res.write(data);
        res.end();
      }
    });
  }
  // all other requests should be ignored
  else {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.write("404 Not Found");
    res.end();
  }
}


const server = http.createServer(requestHandler);
const port = 1234;

server.listen(port, (err) => {
  if (err) {
    console.log("Error starting server", err);
  } else {
    console.log(`Server is listening on port ${port}`);
  }
});
