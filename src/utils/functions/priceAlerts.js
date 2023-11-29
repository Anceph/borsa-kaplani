import User from '../db/users.js'
import getStockPrice from '../functions/getStockPrice.js'
import { EmbedBuilder } from 'discord.js'

const checkPriceAlerts = async (client) => {
    const usersWithAlerts = await User.find({ 'priceAlerts.0': { $exists: true } });

    for (const user of usersWithAlerts) {
        for (const alert of user.priceAlerts) {
            let quote = await getStockPrice(alert.quote);
            let currentPrice = quote.regularMarketPrice

            if (
                (alert.targetPrice > alert.currentPrice && currentPrice >= alert.targetPrice) ||
                (alert.targetPrice < alert.currentPrice && currentPrice <= alert.targetPrice)
            ) {
                const userObject = await client.users.fetch(user.id);

                const embed = new EmbedBuilder()
                    .setTitle('🚨 Fiyat Alarmı!')
                    .setDescription(`Hisse: ${alert.quote}\nBelirlediğiniz Hedef Fiyat: ${alert.targetPrice}\nŞu anki Fiyat: ${currentPrice}`)
                    .setColor('Orange');

                userObject.send({ content: '', embeds: [embed] });

                // Remove the alarm from the user's alerts in the database
                await User.updateOne(
                    { id: user.id },
                    { $pull: { priceAlerts: { quote: alert.quote } } }
                );
            }
        }
    }
};

export default checkPriceAlerts;