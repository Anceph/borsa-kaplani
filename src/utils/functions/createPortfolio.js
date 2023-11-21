import Portfolio from "../db/portfolio.js";

export default async function createPortfolio(id) {
    try {
        const existingPortfolio = await Portfolio.findOne({ id });
        if (!existingPortfolio) {
            try {
                const newPortfolio = new Portfolio({ userId: id })
                await newPortfolio.save()
            } catch (err) {
                console.log(err)
            }
        }
    } catch (error) {
        console.error(error)
        return null
    }
}