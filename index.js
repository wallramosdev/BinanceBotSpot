/**
 * 1 - Monitoramento
 * 2 - Estratégia
 * 3 - Trade
 */

const WebSocket = require("ws");
const ws = new WebSocket(`${process.env.STREAM_URL}/${process.env.SYMBOL.toLowerCase()}@ticker`);

const PROFITABILITY = parseFloat(process.env.PROFITABILITY);

let sellPrice = 0;
let entryPrice = 0;
let refPrice = 0.522;


ws.onmessage = (event) => {
    //console.clear();
    console.log(event.data);

    console.log("");

    const obj = JSON.parse(event.data);
    console.log("Symbol: " + obj.s);
    console.log("Best Ask: " + obj.a);

    const currentPrice = parseFloat(obj.a);

     if(sellPrice === 0 && currentPrice <= refPrice) {        
        console.log("Abrir posição.");
        newOrder("1", "BUY");
        sellPrice = currentPrice * PROFITABILITY;
        entryPrice = currentPrice;
    }
    else if(sellPrice !== 0 && currentPrice > sellPrice) {
        console.log("Fechar posição.");
        newOrder("1", "BUY");
        sellPrice = 0;
        entryPrice = 0;
    }
    else if(sellPrice !== 0) {
        console.log(`Comprei a: ${entryPrice}.`);
        console.log(`O Valor para venda deve ser acima de: ${sellPrice}.`);
        console.log("Aguardando para vender...");
    }
    else 
        console.log(`O valor de entrada deve ser igual ou menor que: ${refPrice}. Aguardando para comprar... `);

}

const axios = require('axios');
const crypto = require('crypto');

async function newOrder(quantity, side) {

    const data = { 
        symbol: process.env.SYMBOL,
        side,
        type: 'MARKET',
        quantity,
        timestamp: Date.now(),
        recvWindow: 10000
     };

     const signature = crypto
        .createHmac('sha256', process.env.SECRET_KEY)
        .update(`${new URLSearchParams(data)}`)
        .digest('hex');

     const newData = { ...data, signature };
     const qs = `?${new URLSearchParams(newData)}`;

     try{
        const result = await axios({
            method: 'POST',
            url: `${process.env.API_URL}/v3/order${qs}`,
            headers: { 'X-MBX-APIKEY': process.env.API_KEY }
        });
        console.log(result.data);
     }
     catch (err) {
        console.error(err);
     }

}
