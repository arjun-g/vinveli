const express = require("express");
const router = express.Router();

router.get("/missions", async (req, res) => {
    const db = await req.db();
    const collection = db.collection("missions");
    const result = await collection.find({});
    const missions = await result.toArray();
    res.json({ missions: missions });
});

router.get("/missions/:missionId", async (req, res) => {
    const db = await req.db();
    const collection = db.collection("missions");
    const result = await collection.findOne({ _id: req.params.missionId });
    res.json(result);
});

module.exports = router;