const express = require("express");
const passport = require("passport");
const session = require("express-session");
const {storeMongo} = require("./DBConnect/DBConnect");
require("./config/auth");
const path = require("path");

const app = express();
app.use(express.static(path.resolve(__dirname,"./public/build")));
app.use(express.json());
app.use(session({ 
    store: storeMongo,
    secret: 'secret', 
    resave: true, 
    saveUninitialized: true, 
    cookie: {maxAge: 10 * 60 * 1000}
}));
app.use(passport.initialize());
app.use(passport.session());

app.post("/api/login", passport.authenticate("login"), (req, res) => {
    req.session.username = req.user.username;
    res.json({username: req.user.username, isLogged: true});
})

app.post("/api/signup", passport.authenticate("signup") ,(req, res) => {
    req.session.username = req.user.username
    res.json({username: req.user.username, isLogged: true});
})

app.get("/api/islogged", (req, res) => {
    const username = req.session.username;
    username ? res.json({username: username, isLogged: true}) : res.json({username: null, isLogged: false});
})

app.get("/api/logout", (req, res) => {
    if (req.session)req.session.destroy((err) => {
        err ? res.json({username: null, isLogged: false}) : res.json({username: username, isLogged: true});
    });
})

app.get("*", (req, res) => {
    res.sendFile(path.resolve (__dirname, "./public/build/index.html"))
})

app.listen(8080)


