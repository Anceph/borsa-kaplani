import getStockPrice from './getStockPrice.js';
import axios from 'axios';

export async function getTotalPortfolioValue(portfolio) {
    try {
        let totalValue = 0;

        try {
            for (const stock of portfolio.stocks) {
                const stockValue = await getStockValue(stock.symbol, stock.quantity);
                totalValue += stockValue;
            }
        } catch (err) {
            console.log(err)
        }

        let naber = parseFloat(totalValue)
        return naber.toFixed(2);
    } catch (err) {
        return console.log(err)
    }
}

export async function getStockValue(symbol, quantity) {
    try {
        const quote = await getStockPrice(`${symbol}`);

        if (quote.exchange === "IST") {
            return parseFloat(quantity) * parseFloat(quote.regularMarketPrice)
        } else {
            const exchangeRate = await getExchangeRate();
            return parseFloat(quantity) * (parseFloat(quote.regularMarketPrice) * exchangeRate)
        }
    } catch (error) {
        console.error('Error in getStockValue:', error);
        throw error;
    }
}

export async function getExchangeRate() {
    try {
        const response = await axios.get('https://magenta-crepe-90ac07.netlify.app/.netlify/functions/usd');
        const exchangeRate = response.data.exchangeRate.replace(',', '.');
        return parseFloat(exchangeRate);
    } catch (error) {
        console.error('Error fetching exchange rate:', error.message);
        throw error;
    }
}