import Portfolio from "../db/portfolio.js";

export default async function removeStockFromPortfolio(id, symbol, quantity) {
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

        const existingStock = portfolio.stocks.find((stock) => stock.symbol === symbol);
        if (!existingStock) {
            return "yok";
        }

        const quantityToRemove = parseInt(quantity);

        if (existingStock.quantity < quantityToRemove) {
            console.log("Not enough quantity to remove.");
            return "eksik";
        }

        if (existingStock.quantity === quantityToRemove) {
            const index = portfolio.stocks.indexOf(existingStock);
            portfolio.stocks.splice(index, 1);
        } else {
            existingStock.quantity -= quantityToRemove;
        }

        await portfolio.save();
    } catch (error) {
        console.error(error);
        return null;
    }
}
