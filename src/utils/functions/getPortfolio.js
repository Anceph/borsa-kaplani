import Portfolio from "../db/portfolio.js";

export default async function getPortfolio(id) {
    try {
        const portfolio = await Portfolio.findOne({ userId: id });
    
        if (portfolio) {
          console.log('User portfolio:', portfolio);
          return portfolio;
        } else {
          console.log('Portfolio not found for user:', id);
          return null;
        }
      } catch (error) {
        console.error('Error getting portfolio:', error);
        return null;
      }
}