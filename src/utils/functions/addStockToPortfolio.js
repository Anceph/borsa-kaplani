import Portfolio from "../db/portfolio.js";

export default async function addStockToPortfolio(id, symbol, quantity, purchasePrice, exchangeRate) {
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
        let purchasedPrice = parseFloat(purchasePrice)
        const existingStock = portfolio.stocks.find((stock) => stock.symbol === symbol);
        if (existingStock) {
            existingStock.quantity += quantityToAdd;
            existingStock.purchasePrice = ((existingStock.purchasePrice * existingStock.quantity) + (purchasePrice * quantity)) / (existingStock.quantity + quantity)
        } else {
            if (exchangeRate == null) {
                portfolio.stocks.push({ symbol, quantity: quantityToAdd, purchasePrice: purchasedPrice });
            } else {
                portfolio.stocks.push({ symbol, quantity: quantityToAdd, purchasePrice: purchasedPrice, exchangeRate });
            }
        }

        await portfolio.save();
    } catch (error) {
        console.error(error)
        return null
    }
}