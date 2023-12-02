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
            // console.log(await getStockPrice(`${args[1]}`))
            // // const portfolio = await Portfolio.findOne({ userId: `${args[1]}` }) || new Portfolio({ userId: args[1] })
            // // portfolio.save()
            // // const total = await getTotalPortfolioValue(portfolio)
            // // console.log(`${total}₺`)

            // if (!args[1]) return message.reply(`Provide User ID`)
            // if (!args[2]) return message.reply(`Provide a symbol`)
            // if (!args[3]) return message.reply(`Provide quantity`)
            // const userData = await User.findOne({ id: args[1] }) || new User({ id: args[1] })
            // userData.save()
            // if (args[5]) {
            //     await addStockToPortfolio(`${args[1]}`, `${args[2]}`, `${args[3]}`, `${args[4]}`, `${args[5]}`)
            // } else {
            //     await addStockToPortfolio(`${args[1]}`, `${args[2]}`, `${args[3]}`, `${args[4]}`)
            // }
            // await getPortfolio(args[1])

            const userData = await User.findOne({ id: args[1] }) || new User({ id: args[1] })
            userData.balance += parseFloat(args[2])
            userData.save()
            return message.reply(`Added ${args[2]} to users.${args[1]}.balance (Currently at ${userData.balance})`)
        }
        if (args[0] == "role") {
            if (args[2] != 0) {
                if (args[2] != 1) {
                    if (args[2] != 2) {
                        return
                    }
                }
            }
            const data = await User.findOne({ id: args[1] })
            await data.updateOne({ $set: { role: `${args[2]}` } })
            return message.reply(`Changed users.${args[1]}.role to ${args[2]}`)
        }
        if (args[0] == "give") {
            const data = await User.findOne({ id: args[1] })
            const giveBalance = parseFloat(args[2])
            if (!data) {
                data = new User({ id: args[1] })
                return message.reply(`Created database entry for the user, try again`)
            }
            data.balance += giveBalance
            await data.save()
            return message.reply(`Added ${giveBalance} to users.${args[2]}.balance (Currently at ${data.balance})`)
        }

        if (args[0] == "take") {
            const data = await User.findOne({ id: args[1] })
            const giveBalance = parseFloat(args[2])
            if (!data) {
                data = new User({ id: args[1] })
                return message.reply(`Created database entry for the user, try again`)
            }
            data.balance -= giveBalance
            await data.save()
            return message.reply(`Removed ${giveBalance} from users.${args[2]}.balance (Currently at ${data.balance})`)
        }
    }
};
