/*****************
    cohere.js
    スニャイヴ
    2024/05/23    
*****************/

module.exports = {
    invoke: invoke
}

const co_invoke = require('./invoke');

async function invoke(message){
    await co_invoke.invoke(message);
} 