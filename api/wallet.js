const express = require("express");
const dayjs = require("dayjs");
const { ObjectID } = require("bson");
const { fetch } = require("./rapyd");
const router = express.Router();

router.post("/wallet", async (req, res) => {
  const db = await req.db();
  const usercollection = db.collection("users");
  const user = await usercollection.findOne({
    _id: new ObjectID(req.user.id),
  });
  const { metadata } = req.body;
  console.log("STEP 1", user);
  const walletResp = await fetch("/v1/user", {
    method: "POST",
    body: {
      first_name: user.firstName,
      last_name: user.lastName,
      ewallet_reference_id: user._id.toString() + "t1",
      metadata,
      type: "person",
      contact: {
        phone_number: user.phonenumber,
        email: user.email,
        first_name: user.firstName,
        last_name: user.lastName,
        contact_type: "personal",
        address: {
          name: `${user.firstName} ${user.lastName}`,
          line_1: user.address.line1,
          line_2: user.address.line2,
          line_3: user.address.line3,
          city: user.address.city,
          state: user.address.state,
          country: user.address.country,
          zip: user.address.zip,
          phone_number: user.phonenumber,
          metadata: {},
          canton: "",
          district: "",
        },
        identification_type: user.identification.type,
        identification_number: user.identification.number,
        date_of_birth: dayjs(user.dob).format("MM/DD/YYYY"),
        country: user.address.country,
        nationality: user.address.country,
        metadata,
      },
    },
  }).catch(err => console.log("ERR", err));

  console.log("GOT WLL", walletResp.data);
  // console.log("WALLETREP", walletResp.data);
  const walletId = walletResp.data.data.id;
  await usercollection.findOneAndUpdate(
    {
      _id: user._id,
    },
    {
      $set: {
        wallet: walletId,
      },
    }
  );
  res.json({ success: true });
});

router.get("/wallet", async (req, res) => {
  const db = await req.db();
  const usercollection = db.collection("users");
  const user = await usercollection.findOne({
    _id: new ObjectID(req.user.id),
  });
  let data = {};
  fetch(`/v1/user/${user.wallet}`, {
    method: "GET",
  }).then((resp) => {
    data = resp.data.data;
    fetch(`/v1/issuing/bankaccounts/list?ewallet=${user.wallet}`, {
      method: "GET"
    }).then((resp) => {
      data.vas = resp.data.data.bank_accounts;
      res.json(data);
    });
    // res.json(data);
  });
});

router.get("/wallet/beneficiary", async (req, res) => {
  const {
    cancel_url,
    complete_url
  } = req.query;
  const db = await req.db();
  const usercollection = db.collection("users");
  const user = await usercollection.findOne({
    _id: new ObjectID(req.user.id),
  });
  fetch("/v1/hosted/disburse/beneficiary", {
    method: "POST",
    body: {
      beneficiary_country: user.address.country,
      beneficiary_entity_type: "individual",
      sender_country: "US",
      sender_currency: "USD",
      sender_entity_type: "company",
      merchant_reference_id: req.user.id,
      cancel_url,
      complete_url
    }
  })
  .then(resp => {
    res.json({
      uri: resp.data.data.redirect_url
    });
  })
})

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
      fetch(`/v1/payouts/confirm/${resp.data.data.id}`, {
        method: "POST",
        body: {}
      })
      .then(re => {
        fetch(`/v1/payouts/complete/${resp.data.data.id}/${amount}`, {
          method: "POST"
        })
        .then(res => console.log(resp.data.data))
      })
      .catch(err => {
        fetch(`/v1/payouts/complete/${resp.data.data.id}/${amount}`, {
          method: "POST"
        })
        .then(res => console.log(resp.data.data))
      });
      resolve(resp.data.data);
    });
  })
  })
}

router.put("/wallet/refund", async (req, res) => {
  const resp = await createPayout(req, req.body.amount);
  res.json(resp);
});

router.get("/wallet/payouts", (req, res) => {
  fetch("/v1/payouts", {
    method: "GET"
  }).then(resp => {
    console.log(resp.data);
    res.json(resp.data.data);
  });
})

router.get("/wallet/va/countries", (req, res) => {
  console.log("CU", req.query);
  res.json([
    { label: "Australia", value: "AU" },
    { label: "Germany", value: "DE" },
    { label: "Denmark", value: "DK" },
    { label: "United Kingdom", value: "GB" },
    { label: "Indonesia", value: "ID" },
    { label: "Mexico", value: "MX" },
    { label: "New Zealand", value: "NZ" },
    { label: "Singapore", value: "SG" },
    { label: "Slovakia", value: "SK" },
    { label: "United States", value: "US" },
  ]);
});

router.get("/wallet/va/currencies/:country", (req, res) => {
  const country = req.params.country;
  fetch(`/v1/issuing/bankaccounts/capabilities/${country}`, {
    method: "GET",
  }).then((resp) => {
    res.json(resp.data.data.supported_currencies);
  });
});

router.post("/wallet/va", async (req, res) => {
  const { currency, country } = req.body;
  const db = await req.db();
  const usercollection = db.collection("users");
  console.log("GOT USER", req.user);
  const user = await usercollection.findOne({ _id: new ObjectID(req.user.id) });
  fetch("/v1/issuing/bankaccounts", {
    method: "POST",
    body: {
      currency,
      country,
      ewallet: user.wallet,
    },
  }).then((resp) => {
    res.json(resp.data.data);
  });
});

router.put("/wallet/va/:accountId/deposit", async (req, res) => {
  console.log("HERE", req.params);
  const accountId = req.params.accountId;
  const { currency, amount } = req.body;
  fetch("/v1/issuing/bankaccounts/bankaccounttransfertobankaccount", {
    method: "POST",
    body: {
      currency,
      amount,
      issued_bank_account: accountId,
    },
  }).then((resp) => {
    res.json(resp.data.data);
  })
});

module.exports = router;
