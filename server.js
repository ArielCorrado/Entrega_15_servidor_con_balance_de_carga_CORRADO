const express = require("express");
const passport = require("passport");
const session = require("express-session");
require('dotenv').config();
const {storeMongo} = require("./DBConnect/DBConnect");
require("./config/auth");
const path = require("path");
const mongoose = require ("mongoose");
mongoose.set('strictQuery', true);
const argv = require("minimist")(process.argv.slice(2));
const {fork} = require("child_process");
const childProcess = fork("./childProcess.js");
const cluster = require("cluster");
const maxCPUs = require("os").cpus().length;                //Da la cantidad de Hilos (No los nucleos del CPU)

const PORT = argv._[0] || 8080;
const mode = argv.mode || "FORK";
console.log(argv)

const createServer = () => {
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

    app.get("/api/info", (req, res) => {
        const data = {
            "Argumentos de entrada": argv,
            "Sistema Operativo": process.platform,
            "Version de Node": process.version,
            "Memoria Reservada": process.memoryUsage().rss,
            "Path de Ejecucion": process.execPath,
            "ID del Proceso": process.pid,
            "Carpeta del Proyecto": process.cwd(),
            "Cantidad de Hilos": maxCPUs,
        }    
        res.end(JSON.stringify(data, null, 2));    
    })

    app.get("/api/randoms", (req, res) => {
        childProcess.send(req.query.cant ?? 1e20);  ////
        childProcess.on("message", (numeros) =>{
            res.end(JSON.stringify(numeros, null, 2));
        })
    })

    app.get("/api/randoms2/:num", (req, res) => {
        const numeros = {}
        for (let i = 1; i <= req.params.num; i++) {
            const number = Math.trunc((Math.random() * 999.999) + 1);    //Número aleatorio entre 1 y 1000
            numeros[number] = numeros[number] ? numeros[number] + 1 : 1;
        }
        res.end(JSON.stringify(numeros, null, 2));
    })

    app.get("*", (req, res) => {
        res.sendFile(path.resolve (__dirname, "./public/build/index.html"))
    })
    
    mongoose.connect(process.env.MONGO_URI_USERS)
    .then(() => {
        app.listen(PORT, console.log(`Server corriendo en puerto ${PORT} Modo: ${mode}. Proceso ${process.pid}. `))
    })
}

if (mode === "CLUSTER") {

    if (cluster.isMaster)  {
        for (let i = 0; i < maxCPUs; i++) {
            cluster.fork();
        }

        cluster.on("exit", (worker, code, signal) => {
            cluster.fork();
        })
    } else {
        createServer();
    }    

} else if (mode === "FORK") {
    createServer();
} else {
    console.log("El Segundo Parámetro es Inválido. Ingresar FORK o CLUSTER");
}

