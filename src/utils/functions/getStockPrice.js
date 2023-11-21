import Portfolio from "../db/portfolio.js";
import yahooFinance from 'yahoo-finance2';

export default async function getStockPrice(symbol) {
    try {
        const quote = await yahooFinance.quote(`${symbol}`);
        return quote
    } catch (error) {
        console.error(error);
        return null
    }
}
