let request = require("request");
let http = require("https");
let url = require("url");
let querystring = require("querystring");

const HOST = "https://rinkeby.infura.io/WiVPEB9SF24XkZpjm4lX";

/**
 * Get current latest block number
 */
function getBlockNumber() {
    let data = {
        "jsonrpc": "2.0",
        "method": "eth_blockNumber",
        "params": []
    }

    return send(data);
}

function getBlockByNumber(blockNumber, allowFullData) {
    let data = {
        "jsonrpc": "2.0",
        "method": "eth_getBlockByNumber",
        "params": [blockNumber, allowFullData]
    }

    return send(data);
}

function getTxReceipt(txId) {
    let data = {
        "jsonrpc": "2.0",
        "method": "eth_getTransactionReceipt",
        "params": [txId]
    }

    return send(data);
}

function send(data) {
    let headers = {
        "content-type": "application/json"
    }

    return new Promise((resolve, reject) => {
        request.post(HOST, {
            json: data,
            timeout: 5 * 1000
        }, function (err, response, body) {
            if (err) {
                return reject({
                    message: "network error",
                    detail: err.message
                });
            }

            if (response.statusCode > 400) {
                return reject({
                    message: response.statusMessage,
                    detail: body
                });
            }

            return resolve(parseBody(body));
        });
    });
}

function parseBody(body) {
    if (!body) {
        return {
            data: null
        }
    }

    let result = body.result;

    if (typeof (result) === "object") {
        return result;
    }

    if (Array.isArray(result)) {
        return {
            data: result
        }
    }

    if (typeof (result) === "string") {
        try {
            let jsonBody = JSON.parse(result);
            return jsonBody;
        } catch (err) {
            return {
                data: result
            }
        }
    }

    return {
        data: null
    };
}

module.exports = {
    getBlockNumber,
    getBlockByNumber,
    getTxReceipt
}