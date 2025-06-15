const express = require('express');
const cors = require('cors');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const config = require('./config');

const app = express();
const CLIENT_SECRET_GITHUB = config.CLIENT_SECRET_GITHUB;
const CLIENT_SECRET_GITLAB = config.CLIENT_SECRET_GITLAB
const FRONTEND_URL =  config.FRONTEND_URL;

let user_connections_auth = 0;
let user_connections_del = 0;

app.use(cors({
    origin: FRONTEND_URL,
    credentials: true,
}));
app.use(express.json());

app.get('/auth-token-exchange', async (req, res) => {
    const query = req.query;
    let tokenRes = null;
    user_connections_auth++;
    console.log(`${user_connections_auth} connections to the auth-token-exchange endpoint.`);
    if(query.client_id && query.code && query.type) {
        if(query.type == 'hub') {
            tokenRes = await axios.post('https://github.com/login/oauth/access_token', {
                client_id: query.client_id,
                client_secret: CLIENT_SECRET_GITHUB,
                code: query.code,
            },
            { headers: { Accept: 'application/json' } });
        } else if(query.type == 'lab') {
            tokenRes = await axios.post('https://gitlab.ruhr-uni-bochum.de/oauth/token', null, {
                params: {
                    client_id: query.client_id,
                    client_secret: CLIENT_SECRET_GITLAB,
                    code: query.code,
                    grant_type: 'authorization_code',
                    redirect_uri: FRONTEND_URL,
                },
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });
        } else {
            res.sendStatus(400);
            return;
        }
    } else {
        res.sendStatus(400);
        return;
    }

    if(tokenRes) {
        const token = jwt.sign({
            exp: query.type == 'hub' ? Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 10) : Math.floor(Date.now() / 1000) + (60 * 60 * 2),
            data: {
                info: tokenRes['data'],
                type: query.type,
            },
        }, query.code);
        res.send(token);
    } else {
        res.sendStatus(500);
    }
});

app.delete('/auth-token', async (req, res) => {
    user_connections_del++;
    console.log(`${user_connections_del} connections to the auth-token delete endpoint.`);
    const query = req.query;
    if(query.token && query.client_id && query.type) {
        if(query.type == 'lab') {
            let result = await axios.post('https://gitlab.ruhr-uni-bochum.de/oauth/revoke', null, {
                params: {
                    client_id: query.client_id,
                    client_secret: CLIENT_SECRET_GITLAB,
                    token: query.token,
                }
            });
            if(result.status == 200) res.sendStatus(200);
            else res.sendStatus(500);
        } else if(query.type == 'hub') {
            const basicAuth = Buffer.from(`${query.client_id}:${CLIENT_SECRET_GITHUB}`).toString('base64');
            let result = await axios.delete(`https://api.github.com/applications/${query.client_id}/token`, {
                headers: {
                    'Authorization': `Basic ${basicAuth}`,
                    'Accept': 'application/vnd.github.v3+json',
                },
                data: {
                    access_token: query.token,
                },
            });
            if(result.status == 204) res.sendStatus(200);
            else res.sendStatus(500);
        } else {
            res.sendStatus(400);
            return;
        }
    } else {
        res.sendStatus(400);
        return;
    }
});

app.listen(7000, () => {
    console.log('Listening...')
});