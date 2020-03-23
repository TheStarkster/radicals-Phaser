const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const engine = require("ejs-locals");
const expressLayouts = require("express-ejs-layouts");
const http = require("http");
const app = express();

var score, Bscore, uid, name, tid;
app.engine("ejs", engine);
app.use(expressLayouts);
app.set("view engine", "ejs");

app.use(express.static("public"));

app.use(bodyParser.json());

app.get("/:tid/:id/:name", (req, res) => {
  fs.readFile("index.html", function(err, data) {
    res.writeHead(200, { "Content-Type": "text/html" });
    res.write(data);
    res.end();
    uid = req.params.id;
    name = req.params.name;
    tid = req.params.tid;
  });
});

app.get("/response", (req, res) => {
  res.render("results", {
    score: score,
    Bscore: Bscore,
    name: name
  });
});

app.post("/score", (req, res) => {
  score = req.body.score;
  Bscore = req.body.Bscore;
  const data = JSON.stringify({
    score: score,
    id: uid,
    tid: tid
  });

  const options = {
    hostname: "localhost",
    port: 5000,
    path: "/tournament/user/score-update",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": data.length
    }
  };

  const REQ = http.request(options, RES => {
    console.log(`res: ${RES}`);
    RES.on("data", d => {
      process.stdout.write(d);
    });
  });

  REQ.on("error", error => {
    console.error(error);
  });

  REQ.write(data);
  REQ.end();

  res.sendStatus(200);
});
app.listen(2573);
