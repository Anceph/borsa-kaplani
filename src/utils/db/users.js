import mongoose from 'mongoose'

export default mongoose.model('User', new mongoose.Schema({
    id: { type: String, unique: true, required: true },
    role: { type: Number, default: 0},
    balance: { type: Number, default: 0 },
    cooldowns: {
        daily: { type: Date },
        work: { type: Date },
        command: { type: Date }
    },
    priceAlerts: [
        {
            quote: { type: String, required: true },
            targetPrice: { type: Number, required: true },
            currentPrice: { type: Number, required: true },
        },
    ],
}))