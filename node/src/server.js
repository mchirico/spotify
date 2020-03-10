const path = require("path");
const http = require("http");
const express = require("express");
const bodyParser = require("body-parser");

// CSRF
const csrf = require("csurf");
var cookieParser = require("cookie-parser");
var csrfProtection = csrf({ cookie: true });

const app = express();


app.use(cookieParser());
app.use(csrfProtection);
app.all("*", function (req, res, next) {
    res.cookie("XSRF-TOKEN", req.csrfToken());
    return next();
});

app.use(bodyParser.json());

const server = http.createServer(app);
const port = process.env.PORT || 3000;
const angularDirectoryPath = path.join(__dirname, "../dist");

app.post("/api/login", csrfProtection, function (req, res) {
    // For this example: login is always successful if the request passes the "csrfProtection" middleware
    // Set Access Token. Atuhentication, on this application, works with cookies:
    //  ** MAKE CALLS TO FIREBASE HERE ***
    console.log("called login...", req.body);
    res.cookie("AccessToken", "***Auth token value***", {
        httpOnly: true,
        expires: 0
    });
    res.json({ login: "csrf for login worked... You're Good!" });
});

app.post("/api/transfer_money", csrfProtection, function (req, res) {
    // Check for auth cookie
    var token = req.cookies["AccessToken"];
    if (token === "***Auth token value***") {
        res.set("Content-Type", "application/json");
        console.log("worked.. money transferred.");
        res.json({ money: "Money sent!!  Read access token" });
    } else {
        res.status(401).
            send();
    }
});


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
