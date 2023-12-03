import mongoose from 'mongoose'

const stockSchema = new mongoose.Schema({
    symbol: {
        type: String,
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
    },
    purchasePrice: {
        type: Number,
        required: true
    },
    exchangeRate: {
        type: Number
    }
});

const portfolioSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        unique: true,
        alias: 'user_id',
    },
    stocks: [stockSchema],
});

const Portfolio = mongoose.model('Portfolio', portfolioSchema);

export default Portfolio;