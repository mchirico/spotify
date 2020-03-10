const path = require("path");
const http = require("http");
const express = require("express");
const bodyParser = require("body-parser");

// CSRF
const csrf = require("csurf");
var cookieParser = require("cookie-parser");
var csrfProtection = csrf({ cookie: true });

// Firebase
const {
    signUp, signIn, sendVerifyEmail,
    deleteAccount
} = require("./firebase/utils");


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

app.post("/api/signup", csrfProtection, function (req, res) {
    signUp(req.body.email, req.body.password, data => {
        res.cookie("AccessToken", data.idToken, {
            httpOnly: true,
            expires: 0
        });
        console.log('/api/signup: ', data);
        res.set("Content-Type", "application/json");
        res.json(data);
        //  res.json({ idToken: data.idToken });
    });
});
//sendVerifyEmail
app.post("/api/sendverifyemail", csrfProtection, function (req, res) {
    sendVerifyEmail(req.body.idToken, data => {
        res.cookie("AccessToken", data.idToken, {
            httpOnly: true,
            expires: 0
        });
        console.log('/api/sendverifyemail: ', data);
        res.set("Content-Type", "application/json");
        res.json(data);
        //  res.json({ idToken: data.idToken });
    });
});

app.post("/api/signin", csrfProtection, function (req, res) {
    signIn(req.body.email, req.body.password, data => {
        res.cookie("AccessToken", data.idToken, {
            httpOnly: true,
            expires: 0
        });
        //console.log(data)
        //res.json({ idToken: data.idToken });
        res.json(data);
    });
});

app.post("/api/delete/account", csrfProtection, function (req, res) {
    deleteAccount(req.body.idToken, data => {
        res.cookie("AccessToken", "***Auth token value***", {
            httpOnly: true,
            expires: 0
        });
        res.set("Content-Type", "application/json");
        res.json(data);
    });
});

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
