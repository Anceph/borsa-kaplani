import Portfolio from "../db/portfolio.js";

export default async function addStockToPortfolio(id, symbol, quantity) {
    try {
        const portfolio = await Portfolio.findOne({ userId: id });
        if (!portfolio) {
            try {
                const newPortfolio = new Portfolio({ userId: id })
                return await newPortfolio.save()
            } catch (err) {
                console.log(err)
            }
        }

        let quantityToAdd = parseInt(quantity)
        const existingStock = portfolio.stocks.find((stock) => stock.symbol === symbol);
        if (existingStock) {
            existingStock.quantity += quantityToAdd;
        } else {
            portfolio.stocks.push({ symbol, quantity });
        }

        await portfolio.save();
    } catch (error) {
        console.error(error)
        return null
    }
}