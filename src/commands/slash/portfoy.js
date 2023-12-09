import { ActionRowBuilder, ButtonBuilder, SlashCommandBuilder } from "@discordjs/builders";
import User from '../../utils/db/users.js'
import { ButtonStyle, EmbedBuilder } from "discord.js";
import Portfolio from '../../utils/db/portfolio.js'
import createPortfolio from "../../utils/functions/createPortfolio.js";
import { getExchangeRate, getStockValue, getTotalPortfolioValue } from "../../utils/functions/portfolioUtils.js";
import getStockPrice from "../../utils/functions/getStockPrice.js";

export default {
    data: new SlashCommandBuilder()
        .setName("portfoy")
        .setDescription("Portföyünü kontrol et"),
    run: async (client, interaction) => {
        await interaction.reply(`Hesaplanıyor...`)
        const user = interaction.member.user
        const user_id = user.id
        const userData = await User.findOne({ id: user.id }) || new User({ id: user.id })
        const errorEmbed = new EmbedBuilder().setTitle('Hata').setColor('Red')
        userData.save()
        const portfolio = await Portfolio.findOne({ userId: user_id });
        if (!portfolio) {
            try {
                Portfolio.create({ userId: user_id })
                errorEmbed.setDescription(`Portföyün oluşturuldu (galiba) tekrar dene.`)
                return interaction.editReply({ content: '', embeds: [errorEmbed] })
            } catch (err) {
                console.log(err)
            }
        }

        const stocksPerPage = 9
        const totalStocks = await portfolio.stocks.length
        const totalPages = Math.ceil(totalStocks / stocksPerPage)
        
        let currentPage = 1
        const exchangeRate = await getExchangeRate()
        let totalPortfolioValue = await getTotalPortfolioValue(portfolio)
        
        const generateEmbed = async () => {
            let totalValue = 0
            let totalProfitLoss = 0
            const startIndex = (currentPage - 1) * stocksPerPage
            const endIndex = Math.min(startIndex + stocksPerPage, totalStocks)

            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle(`Portföy | ${user.username}`)
                .setFooter({ text: `Hisseler güncel kurdan Türk Lirasına çevirilip değere yansıtılır.\nKur: ${exchangeRate} ₺\nSayfa ${currentPage}/${totalPages}` })

            for (let i = startIndex; i < endIndex; i++) {
                const stock = portfolio.stocks[i]
                const tempStock = await getStockPrice(stock.symbol)

                let stockPrice
                let profitLoss
                let profitLossAmount

                if (tempStock.exchange === "IST") {
                    let naber = stock.purchasePrice * stock.quantity
                    let iyidir = tempStock.regularMarketPrice * stock.quantity
                    profitLossAmount = iyidir - naber
                    profitLoss = `${profitLossAmount >= 0 ? '+' : '-'}${Math.abs(profitLossAmount).toFixed(2)} ₺`
                    stockPrice = `${tempStock.regularMarketPrice.toFixed(2)} ₺`
                } else {
                    let naber = stock.purchasePrice * stock.quantity * stock.exchangeRate
                    let iyidir = tempStock.regularMarketPrice * stock.quantity * exchangeRate
                    profitLossAmount = iyidir - naber
                    profitLoss = `${profitLossAmount >= 0 ? '+' : '-'}${Math.abs(profitLossAmount).toFixed(2)} ₺`
                    stockPrice = `${tempStock.regularMarketPrice.toFixed(2)} $`
                }

                const totalPrice = await getStockValue(stock.symbol, stock.quantity)

                totalProfitLoss += profitLossAmount
                totalValue += totalPrice

                embed.addFields({ name: `${stock.symbol} (${stockPrice})`, value: `Adet: ${stock.quantity}\nDeğer: ${totalPrice.toFixed(2)} ₺\nKar / Zarar: ${profitLoss}`, inline: true })
            }

            let naber = `${totalProfitLoss >= 0 ? '+' : '-'}${Math.abs(totalProfitLoss).toFixed(2)} ₺`
            embed.setDescription(`Detaylı görünüm için /hisse\nToplam Portföy Değeri: ${totalPortfolioValue} ₺\nToplam Kar / Zarar: ${naber}`)

            return embed
        }

        const next_page = new ButtonBuilder()
            .setCustomId('next_page')
            .setLabel('➡️')
            .setStyle(ButtonStyle.Primary)

        const row = new ActionRowBuilder()
            .addComponents(next_page)

        if (await portfolio.stocks.length <= 9) {
            const reply = await interaction.editReply({ content: '', embeds: [await generateEmbed()] });
        } else {
            const reply = await interaction.editReply({ content: '', embeds: [await generateEmbed()], components: [row] });
        }

        const filter = (i) => i.customId === 'next_page';

        const collector = interaction.channel.createMessageComponentCollector({
            filter,
            time: 60000,
        })

        collector.on('collect', async (i) => {
            if (i.customId === 'next_page' && currentPage < totalPages) {
                currentPage++
                let newEmbed = await generateEmbed()
                await i.update({ embeds: [newEmbed] })
            }
        })


        collector.on('end', async () => {
            await interaction.editReply({ components: [] })
        })
    }
}