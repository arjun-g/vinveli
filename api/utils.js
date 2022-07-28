const express = require("express");
const axios = require("axios").default;

const { fetch } = require("./rapyd");
const router = express.Router();

router.get("/identity", async (req,  res) => {
  const resp = await fetch("/v1/identities/types", {
    method: "GET"
  });
  res.json(resp.data.data);
});

router.post("/geo", async (req, res) => {
    const {
        country,
        state
    } = req.body;
    if(state){
        const states = await axios({
            url: "https://countriesnow.space/api/v0.1/countries/state/cities",
            method: "POST",
            data: {
                country,
                state
            },
            headers: {
                "Content-Type": "application/json"
            }
        }).then(resp => resp.data.data);
        res.json(states);
    }
    else if(country){
        const states = await axios({
            url: "https://countriesnow.space/api/v0.1/countries/states",
            method: "POST",
            data: {
                country
            },
            headers: {
                "Content-Type": "application/json"
            }
        }).then(resp => {
            return resp.data.data.states
        });
        res.json(states);
    }
    else{
        const countries = await axios.get("https://countriesnow.space/api/v0.1/countries/iso").then(resp => resp.data.data);
        res.json(countries);
    }
});

router.get("/geo/country/:country", async (req, res) => {
    const countries = await axios.get("https://countriesnow.space/api/v0.1/countries/iso").then(resp => resp.data.data);
    res.json(countries);
});

module.exports = router;
