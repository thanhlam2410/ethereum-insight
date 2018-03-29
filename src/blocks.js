let storage = require("./storage");
let jsonrpc = require("./jsonrpc");

let currentBlock = -1;

const SYNC_INTERVAL_TIME = 10 * 1000;
const SAVE_INTERVAL_TIME = 1000;
const WAITING_BLOCKS = [];

async function load() {
    let currentHighestBlock = await getHighestBlock();
    if (currentHighestBlock && currentHighestBlock.id > currentBlock) {
        currentBlock = currentHighestBlock.id;
    }

    return Promise.resolve();
}

function getHighestBlock() {
    let query = storage.buildQuery("blocks");
    query.sort = {
        id: -1
    }

    return storage.get(query);
}

async function syncBlockData() {
    try {
        //get lastest block number
        let block = await jsonrpc.getBlockNumber();
        parseBlock(block.data);
        getBlockInfo();

        //schedule next sync
        setTimeout(syncBlockData, SYNC_INTERVAL_TIME);
    } catch (err) {
        console.log(err);
    }
}

function parseBlock(blockNumber) {
    let decimalNumber = convertHexToDecimal(blockNumber);
    console.log(decimalNumber);

    if (decimalNumber <= currentBlock) {
        return;
    }

    if (currentBlock === -1) {
        WAITING_BLOCKS.push(decimalNumber);
    } else {
        for (let i = 0; i < decimalNumber - currentBlock; i++) {
            WAITING_BLOCKS.push(currentBlock + i + 1);
        }
    }

    currentBlock = decimalNumber;
    console.log(WAITING_BLOCKS);
}

async function getBlockInfo() {
    try {
        let time = Date.now();
        if (WAITING_BLOCKS.length === 0) {
            return;
        }

        let blockNumber = WAITING_BLOCKS[0];
        let block = await jsonrpc.getBlockByNumber(convertDecimalToHex(blockNumber), true);
        console.log(block);
        WAITING_BLOCKS.splice(0, 1);
        console.log(WAITING_BLOCKS);
        serialize(block);
        setTimeout(getBlockInfo, SAVE_INTERVAL_TIME);
    } catch (err) {
        console.log(err);
    }
}

function serialize(block) {
    let transactions = block.transactions;
    let gasUsed = block.gasUsed;

    delete block.transactions;
    delete block.uncles;

    block.id = convertHexToDecimal(block.number);
    let query = storage.buildQuery("blocks");
    query.data = block;
    storage.insert(query);
}

async function parseTx(txId) {
    let tx = await jsonrpc.getTxReceipt(txId);
    console.log(tx);
}

function convertHexToDecimal(hex) {
    if (hex.indexOf("0x") === 0) {
        hex = hex.substring(2);
    }

    let blockNumber = parseInt(hex, 16);
    return blockNumber;
}

function convertDecimalToHex(decimal) {
    let hexString = decimal.toString(16);
    return "0x" + hexString;
}

module.exports = {
    load,
    syncBlockData
}