/*****************
    cohere.js
    スニャイヴ
    2024/09/03    
*****************/

module.exports = {
    invoke: invoke
}

const co_invoke = require('./invoke');

async function invoke(message, readme){
    await co_invoke.invoke(message, readme);
    return;
}