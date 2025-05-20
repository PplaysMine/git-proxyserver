const express = require("express");
const cors = require("cors");
const axios = require("axios");
const jwt = require('jsonwebtoken');
const config = require("./config");

const app = express();
const CLIENT_SECRET = config.CLIENT_SECRET;
const FRONTEND_URL =  config.FRONTEND_URL;

app.use(cors({
    origin: FRONTEND_URL,
    credentials: true,
}));
app.use(express.json());

app.get("/auth-token-exchange", async (req, res) => {
    const query = req.query;
    let tokenRes = null;
    if(query.client_id && query.code) {
        tokenRes = await axios.post("https://github.com/login/oauth/access_token", {
            client_id: query.client_id,
            client_secret: CLIENT_SECRET,
            code: query.code,
        },
        { headers: { Accept: "application/json" } });
    }
    console.log(`Successful connection: ${query.code}`);

    if(tokenRes) {
        const token = jwt.sign({
            exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 10),
            data: {
                info: tokenRes['data'],
            },
        }, query.code);
        res.send(token);
    } else {
        res.sendStatus(500);
    }
});

app.listen(7000, () => {
    console.log("Listening...")
});

// npx webpack serve