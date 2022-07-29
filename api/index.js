require("dotenv").config();

const express = require("express");
const cookieParser = require('cookie-parser')
const { MongoClient, ServerApiVersion, Db } = require('mongodb');
const jwt = require("jsonwebtoken");
const cors = require("cors");

const walletRoute = require("./wallet");
const missionRoute = require("./missions");
const userRoute = require("./users");
const utilsRoute = require("./utils");
const hooksRoute = require("./hooks");
const ticketRoute = require("./ticket");

const app = express();
app.use(express.json());
app.use(cookieParser());

let db = null;

/** @type {MongoClient} */
let dbclient = null;

app.use(cors());

app.use((req, res, next) => {
    if(req.cookies["vinveli.auth"]){
        const parsedjwt = jwt.verify(req.cookies["vinveli.auth"], process.env.SECRET_KEY);
        req.user = parsedjwt;
        next();
    }else{
        if(req.path !== "/api/user/register" && req.path !== "/api/user/login" && req.path !== "/api/hooks"){
            res.status(401).json({ error: true });
        }else{
            next();
        }
    }
});

app.use((req, res, next) => {
    /** @type {Promise<Db>} */
    req.db = async () => {
        if(db) return Promise.resolve(db);
        dbclient = new MongoClient(process.env.DB_CONNECTION, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
        return new Promise((resolve, reject) => {
            console.log("CONNECTION");
            dbclient.connect(err => {
                db = dbclient.db(process.env.DB_NAME);
                resolve(db);
            });
        });
    };
    next();
});

app.use("/api", utilsRoute);
app.use("/api", userRoute);
app.use("/api", missionRoute);
app.use("/api", hooksRoute);
app.use("/api", ticketRoute);

app.use("/api", walletRoute);

app.use((req, res) => {
    res.send(req.url);
})

app.listen(process.env.PORT || 3001);

const cleanup = (event) => {
    console.log("DISCONNECTION");
    dbclient.close();
    dbclient = null;
    process.exit();
  }
  
  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);