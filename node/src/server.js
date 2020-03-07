const path = require("path");
const http = require("http");
const express = require("express");


const app = express();
const server = http.createServer(app);

const port = process.env.PORT || 3000;
const angularDirectoryPath = path.join(__dirname, "../dist");

app.use("/", express.static(angularDirectoryPath));

app.get("/example/test", function (req, res) {
    console.log("/example/test  GOOD!!!");
    res.set("Content-Type", "application/json");
    res.json({ status: "good" });

});
module.exports = {
    app: app,
    server: server,
    port: port
};
