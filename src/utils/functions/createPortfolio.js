import Portfolio from "../db/portfolio.js";

export default async function createPortfolio(id) {
    try {
        console.log(id);
        const existingPortfolio = await Portfolio.findOne({ userId: id });
        
        if (!existingPortfolio) {
            try {
                // Create a new portfolio instance
                const newPortfolio = new Portfolio({ userId: id });
                
                // Save the new portfolio to the database
                await newPortfolio.save();
                
                return newPortfolio;
            } catch (err) {
                console.log(err);
                throw err; // Rethrow the error to propagate it further
            }
        }
        
        // If the portfolio already exists, you can return it or handle it accordingly
        return existingPortfolio;
    } catch (error) {
        console.error(error);
        return null;
    }
}
