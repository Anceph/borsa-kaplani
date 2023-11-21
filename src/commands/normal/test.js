import yahooFinance from 'yahoo-finance2';

export default {
    name: "test",
    aliases: [],
    cooldown: 0,
    run: async (client, message, args) => {
        if (message.author.id != process.env.OWNER_ID) return
        if (!args[0]) return message.reply('onun yanına bir şeyler daha yazarsan belki çalışırım')

        const symbol = await yahooFinance.quote(`${args[0]}`)
        if (symbol.exchange == "IST") {
            message.reply(`${args[0]}: ${symbol.regularMarketPrice} ₺`)
        } else {
            message.reply(`${args[0]}: ${symbol.regularMarketPrice} $`)
        }
    }
};