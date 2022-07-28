const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');
const { ObjectID } = require("bson");
const { fetch } = require("./rapyd");
const router = express.Router();

async function hash(password) {
  return new Promise((resolve, reject) => {
    bcrypt.genSalt(10, function (saltError, salt) {
      if (saltError) {
        throw saltError;
      } else {
        bcrypt.hash(password, salt, function (hashError, hash) {
          if (hashError) {
            throw hashError;
          } else {
            resolve({
              hash,
              salt,
            });
          }
        });
      }
    });
  });
}

async function compare(password, hash){
    return new Promise((resolve, reject) => {
        bcrypt.compare(password, hash, (err, isMatch) => {
            resolve(isMatch);
        });    
    });
}

function userResponseCleanup(user){
  delete user.password;
  user.id = user._id;
  delete user._id;
  return user;
}

router.post("/user/register", async (req, res) => {
    const {
        email,
        password
    } = req.body;
    const db = await req.db();
    const usercollection = db.collection("users");
    const passwordHash = await hash(password);
    const existingEmail = await usercollection.findOne({
      email
    });
    if(existingEmail){
      return res.status(401).json({ error: "EMAIL_TAKEN" });
    }
    const result = await usercollection.insertOne({
        email,
        password: passwordHash.hash
    });
    const id = result.insertedId;
    const token = jwt.sign({
        id,
        email
    }, process.env.SECRET_KEY);
    res.cookie("vinveli.auth", token, {
        maxAge: 10000000000
    });
    res.json({ success: true });
});

router.post("/user/login", async (req, res) => {
    const {
        email,
        password
    } = req.body;
    const db = await req.db();
    const usercollection = db.collection("users");
    const user = await usercollection.findOne({ email });
    if(!user){
        return res.status(401).json({ error: "INVALID_CREDS" });
    }
    const isMatch = await compare(password, user.password);
    if(isMatch){
        const token = jwt.sign({
            id: user._id.toString(),
            email,
            name: user.name
        }, process.env.SECRET_KEY);
        res.cookie("vinveli.auth", token, {
            maxAge: 1000000000
        });
        res.json({ success: true });
    }
    else{
        return res.status(401).json({ error: "INVALID_CREDS" });
    }
});

router.get("/user", async (req, res) => {
  const db = await req.db();
  const usercollection = db.collection("users");
  console.log("GOT USER", req.user);
  const user = await usercollection.findOne({ _id: new ObjectID(req.user.id) });
  res.json(userResponseCleanup(user));
});

router.put("/user", async (req, res) => {
  console.log("GOT BODY", req.body);
  const { 
    address,
    phonenumber,
    identification,
    firstName,
    lastName,
    dob,
  } = req.body;
  const db = await req.db();
  const usercollection = db.collection("users");
  const user = await usercollection.findOneAndUpdate({
    _id: new ObjectID(req.user.id)
  }, {
    $set: {
      address,
      phonenumber,
      identification,
      firstName,
      lastName,
      dob
    }
  });

  res.json(userResponseCleanup(user.value));
});

router.get("/identity", async (req,  res) => {
  const resp = await fetch("/v1/identities/types", {
    method: "GET"
  });
  res.json(resp.data.data);
});

module.exports = router;
