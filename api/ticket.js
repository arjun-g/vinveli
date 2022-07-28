const express = require("express");
const { ObjectID } = require("bson");
const { fetch } = require("./rapyd");
const router = express.Router();

router.post("/ticket", async (req, res) => {
    const { missionId, count, deposit, seats } = req.body;
    const db = await req.db();
    const missioncollection = db.collection("missions");
    const usercollection = db.collection("users");
    const ticketcollection = db.collection("tickets");
    const mission = await missioncollection.findOne({
        _id: missionId
    });
    const user = await usercollection.findOne({
        _id: new ObjectID(req.user.id)
    });
    const amount = deposit ? ((mission.cost * count) / 4) : (mission.cost * count);
    await fetch("/v1/account/transfer", {
        method: "POST",
        body: {
            amount,
            currency: "USD",
            destination_ewallet: process.env.VINVELI_WALLET,
            source_ewallet: user.wallet
        }
    }).then(async resp => {
        const result = await ticketcollection.insertOne({
            mission,
            amount,
            count,
            deposit,
            seats,
            userId: user._id.toString()
        });
        const ticketId = result.insertedId;
        const ticket = await ticketcollection.findOne({
            _id: new ObjectID(ticketId)
        });
        res.json(ticket);
    })
    .catch(err => {
        res.status(400).json(err.response.data.status);
    })
});

router.get("/ticket", async (req, res) => {
    const db = await req.db();
    const ticketcollection = db.collection("tickets");
    const result = ticketcollection.find({
        userId: req.user.id
    });
    const tickets = await result.toArray();
    res.json({ tickets });
});

module.exports = router;
