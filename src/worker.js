let jsonrpc = require("./jsonrpc");

function runWorkerProcess() {
    console.log("worker" + process.pid + " is running");
    process.on("message", handleProcessMessage);

    sendToMaster({
        action: "ping",
        data: {
            id: process.pid
        }
    });

    process.exit(1);
}

function handleProcessMessage(data) {
    console.log(data);
}

function sendToMaster(message) {
    process.send(message);
}

module.exports = {
    runWorkerProcess
}