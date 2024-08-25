/*****************
    cohere.js
    スニャイヴ
    2024/07/22    
*****************/

module.exports = {
    invoke: invoke
}

const co_invoke = require('./invoke');

async function invoke(message, readme){
    co_invoke.invoke(message, readme);
}