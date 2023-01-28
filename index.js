const express = require('express')

const puppeteer = require('puppeteer')

const TelegramBot = require('node-telegram-bot-api');
const bot = new TelegramBot('5843097780:AAEzg5mG91RmiXgxuCni9NhOfjFeRE4O1fI', {polling: true});

const app= express();
// console.log(process.env.PORT)
  
// cron.schedule('* * * * *', async() => {
//     console.log('cron is working')
//     scrapChannel('https://groww.in/markets/top-losers?index=GIDXNIFTY100');
// })

var stockApi;
async function scrapChannel(url) {
    console.log('run');
    const browser = await puppeteer.launch({
        headless:true,
        defaultViewport: null
    });
    const page = await browser.newPage();
    await page.goto(url , {waitUntil:'networkidle2' , timeout: 0});



    const [el] = await page.$x('/html/body/div[1]/div[2]/div[2]/div[2]/div/div/div[1]/div/div/table/tbody/tr[1]/td[1]/a')
    const text = await el.getProperty('textContent');
    const stName = await text.jsonValue();

    const [el2] = await page.$x('/html/body/div[1]/div[2]/div[2]/div[2]/div/div/div[1]/div/div/table/tbody/tr[1]/td[3]/text()')
    const priceSrc = await el2.getProperty('textContent');
    const priceVal = await priceSrc.jsonValue();

    const [el3] = await page.$x('/html/body/div[1]/div[2]/div[2]/div[2]/div/div/div[1]/div/div/table/tbody/tr[1]/td[4]')
    const lowSrc = await el3.getProperty('textContent');
    const lowVal = await lowSrc.jsonValue();

    const [el4] = await page.$x('/html/body/div[1]/div[2]/div[2]/div[2]/div/div/div[1]/div/div/table/tbody/tr[1]/td[5]')
    const highSrc = await el4.getProperty('textContent');
    const highVal = await priceSrc.jsonValue();

    const [el5] = await page.$x('/html/body/div[1]/div[2]/div[2]/div[2]/div/div/div[1]/div/div/table/tbody/tr[1]/td[3]/div')
    const downBy = await el5.getProperty('textContent');
    const downVal = await downBy.jsonValue();

    let downvalMod = downVal.replace(/\(.*\)/gm, "");

    downvalMod = downvalMod.replace(/\+/g,"");
    downvalMod = downvalMod.replace(/\-/g,"");
    let priceValMod = priceVal.replace(/\₹/g,"");
    priceValMod = priceValMod.replace(/\,/g,"");

    let pTempd  =    (downvalMod/ priceValMod);
    console.log(pTempd)
    let pTemp = pTempd * 100;
    let percentage = parseFloat(pTemp).toFixed(2)
    console.log(percentage + " " + 'ptemp')

    if(percentage *10 < 10000) {
        console.log("is more than 10%")
    }
    else {
        console.log('less than 10%')
    }
    var stockApi;
   return  stockApi = {
        stockName: stName,
        currentPrice: priceVal,
        lowPrice: lowVal,
        highPrice: highVal,
        downBy: downVal
    }

    console.log(stockApi)
   
    browser.close();
}


bot.onText(/\/echo (.+)/, (msg, match) => {  
    const chatId = msg.chat.id;
    const resp = match[1];
    bot.sendMessage(chatId, resp);
   
  });
  
  bot.on('message', async (msg) => {
    console.log(msg)
    const chatId = msg.chat.id;
   const data =  await  scrapChannel('https://groww.in/markets/top-losers?index=GIDXNIFTY100');
    bot.sendMessage(chatId, 'Hello' +" " +msg.chat.first_name + " name of stock is " + data.stockName + " price is " + data.currentPrice + " down by " + data.downBy);
  });
app.get('/',(req,res)=>{
    res.send('hello')
})

const port = 3000;


app.listen(port,(req,res)=>{console.log('server is running on port 3000')})
