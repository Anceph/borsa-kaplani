import User from '../../utils/db/users.js'
import Portfolio from '../../utils/db/portfolio.js';
import getPortfolio from '../../utils/functions/getPortfolio.js';
import addStockToPortfolio from '../../utils/functions/addStockToPortfolio.js';
import { getTotalPortfolioValue } from '../../utils/functions/portfolioUtils.js';
import getStockPrice from '../../utils/functions/getStockPrice.js';

export default {
    name: "dev",
    aliases: [],
    cooldown: 0,
    run: async (client, message, args) => {
        if (message.author.id != process.env.OWNER_ID) return
        if (args[0] == "test") {
            // console.log(await getStockPrice('ASTOR.IS'))
            // const portfolio = await Portfolio.findOne({ userId: `${args[1]}` }) || new Portfolio({ userId: args[1] })
            // portfolio.save()
            // const total = await getTotalPortfolioValue(portfolio)
            // console.log(`${total}₺`)

            if (!args[1]) return message.reply(`Provide User ID`)
            if (!args[2]) return message.reply(`Provide a symbol`)
            if (!args[3]) return message.reply(`Provide quantity`)
            const userData = await User.findOne({ id: args[1] }) || new User({ id: args[1] })
            userData.save()
            await addStockToPortfolio(`${args[1]}`, `${args[2]}`, `${args[3]}`)
            await getPortfolio(args[1])

            // const userData = await User.findOne({ id: args[1] }) || new User({ id: args[1] })
            // userData.balance += 10
            // userData.save()
            // return message.reply(`Added 10 to users.${args[1]}.balance (Currently at ${userData.balance})`)
        }
    }
};
