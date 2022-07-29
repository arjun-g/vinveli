const express = require("express");
const { ObjectID } = require("bson");
const { fetch } = require("./rapyd");
const router = express.Router();

async function createPayout(req, amount){
    return new Promise(async (resolve, reject) => {
    const db = await req.db();
    const usercollection = db.collection("users");
    const user = await usercollection.findOne({
      _id: new ObjectID(req.user.id),
    });
    Promise.all([
      fetch(`/v1/payouts/beneficiary/${user.beneficiary}`, {
        method: "GET"
      }).then(resp => {
        return resp.data.data;
      }),
      fetch(`/v1/payouts/sender/${process.env.VINVELI_SENDER}`, {
        method: "GET"
      }).then(resp => {
        return resp.data.data;
      })
    ]).then(([beneficiary, sender]) => {
        console.log("BEN", beneficiary, sender);
      fetch("/v1/payouts", {
        method: "POST",
        body: {
          beneficiary: user.beneficiary,
          beneficiary_country: beneficiary.country,
          beneficiary_entity_type: beneficiary.entity_type,
          ewallet: process.env.VINVELI_WALLET,
          merchant_reference_id: req.user.id,
          payout_currency: beneficiary.currency,
          sender: sender.id,
          sender_amount: amount,
          sender_country: sender.country,
          sender_currency: sender.currency,
          sender_entity_type: sender.entity_type,
          payout_method_type: beneficiary.default_payout_method_type
        }
      })
      .then(resp => {
        console.log("URL", `/v1/payouts/complete/${resp.data.data.id}/${amount}`)
        fetch(`/v1/payouts/confirm/${resp.data.data.id}`, {
          method: "POST",
          body: {}
        })
        .then(re => {
          fetch(`/v1/payouts/complete/${resp.data.data.id}/${amount}`, {
            method: "POST"
          })
          .then(res => console.log(res.data.data))
          .catch(() => {});
        })
        .catch(re => {
            fetch(`/v1/payouts/complete/${resp.data.data.id}/${amount}`, {
              method: "POST"
            })
            .then(res => console.log(res.data.data))
            .catch(() => {});
        });
        resolve(resp.data.data);
      });
    })
    })
  }

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
        await fetch(`/v1/account/transfer/response`, {
            method: "POST",
            body: {
                id: resp.data.data.id,
                status: "accept"
            }
        });
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

router.delete("/ticket/:ticketId", async (req, res) => {
    const db = await req.db();
    const ticketcollection = db.collection("tickets");
    const ticket = await ticketcollection.findOne({
        userId: req.user.id,
        _id: new ObjectID(req.params.ticketId)
    });
    console.log(ticket);
    const resp = await createPayout(req, ticket.amount);
    await ticketcollection.findOneAndUpdate({
        userId: req.user.id,
        _id: new ObjectID(req.params.ticketId)
    }, {
        $set: {
            cancelled: true
        }
    });
    res.json(resp);
});

module.exports = router;
