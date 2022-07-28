const axios = require('axios').default;
const crypto = require('crypto');
const accessKey = process.env.RAPYD_ACCESS_KEY;
const secretKey = process.env.RAPYD_SECRET_KEY;

const log = true;

module.exports.fetch = async function fetch(url, {
    method,
    body,
    headers
}){
    const salt = generateRandomString(8);
    const idempotency = new Date().getTime().toString();
    const timestamp = Math.round(new Date().getTime() / 1000);
    const signature = sign(method, url, salt, timestamp, body);
    return axios({
        url: `https://sandboxapi.rapyd.net${url}`,
        method,
        data: body,
        headers: {
            'Content-Type': 'application/json',
            salt: salt,
            timestamp: timestamp,
            signature: signature,
            access_key: accessKey,
            idempotency: idempotency,
            ...headers
        }
    });
}

function sign(method, urlPath, salt, timestamp, body) {

    try {
        let bodyString = "";
        if (body) {
            bodyString = JSON.stringify(body);
            bodyString = bodyString == "{}" ? "" : bodyString;
        }

        let toSign = method.toLowerCase() + urlPath + salt + timestamp + accessKey + secretKey + bodyString;
        log && console.log(`toSign: ${toSign}`);

        let hash = crypto.createHmac('sha256', secretKey);
        hash.update(toSign);
        const signature = Buffer.from(hash.digest("hex")).toString("base64")
        log && console.log(`signature: ${signature}`);

        return signature;
    }
    catch (error) {
        console.error("Error generating signature");
        throw error;
    }
}

function generateRandomString(size) {
    try {
        return crypto.randomBytes(size).toString('hex');
    }
    catch (error) {
        console.error("Error generating salt");
        throw error;
    }
}
