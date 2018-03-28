let storage = require("./storage");

function parseBlock(blockNumber) {
    let number = convertHexToDecimal(blockNumber);
    console.log(number);
}

function convertHexToDecimal(hex) {
    if (hex.indexOf("0x") === 0) {
        hex = hex.substring(2);
    }

    let blockNumber = parseInt(hex, 16);
    return blockNumber;
}

module.exports = {
    parseBlock
}