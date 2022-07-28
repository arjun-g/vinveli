const express = require("express");
const { ObjectID } = require("bson");
const router = express.Router();

// router.post("/hooks/beneficiary", async (req, res) => {
//     const {
//         data
//     } = req.body;
//     const db = await req.db();
//     const usercollection = db.collection("users");
//     await usercollection.findOneAndUpdate({
//         _id: new ObjectID(data.merchant_reference_id)
//     }, {
//         $set: {
//             beneficiary: data.id
//         }
//     });
//     res.json({ success: true });
// });

router.post("/hooks", async (req, res) => {
  console.log("PAYOUT HOOK", req.body);
  const { type, data } = req.body;
  if (type === "BENEFICIARY_CREATED") {
    const db = await req.db();
    const usercollection = db.collection("users");
    await usercollection.findOneAndUpdate(
      {
        _id: new ObjectID(data.merchant_reference_id),
      },
      {
        $set: {
          beneficiary: data.id,
        },
      }
    );
  }
  res.json({ success: true });
});

module.exports = router;
