import { ActionRowBuilder, ButtonBuilder, SlashCommandBuilder } from "@discordjs/builders";
import User from '../../utils/db/users.js'
import { ButtonStyle, EmbedBuilder } from "discord.js";
import Portfolio from '../../utils/db/portfolio.js'
import createPortfolio from "../../utils/functions/createPortfolio.js";
import { getExchangeRate, getStockValue } from "../../utils/functions/portfolioUtils.js";
import getStockPrice from "../../utils/functions/getStockPrice.js";

export default {
    data: new SlashCommandBuilder()
        .setName("portfoy")
        .setDescription("Portföyünü kontrol et"),
    run: async (client, interaction) => {
        await interaction.reply({ content: 'Hesaplanıyor...' })
        const user = interaction.member.user
        const user_id = user.id
        const userData = await User.findOne({ id: user.id }) || new User({ id: user.id })
        userData.save()
        const portfolio = await Portfolio.findOne({ userId: user_id });
        if (!portfolio) {
            try {
                createPortfolio(user_id)
            } catch (err) {
                console.log(err)
            }
        }

        const stocksPerPage = 9;
        const totalStocks = await portfolio.stocks.length;
        const totalPages = Math.ceil(totalStocks / stocksPerPage);

        let currentPage = 1;

        const generateEmbed = async () => {
            let totalValue = 0;
            const startIndex = (currentPage - 1) * stocksPerPage;
            const endIndex = Math.min(startIndex + stocksPerPage, totalStocks);

            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle(`Portföy | ${user.username}`)
                .setFooter({ text: 'Hisseler güncel kurdan Türk Lirasına çevirilip değere yansıtılır' })

            for (let i = startIndex; i < endIndex; i++) {
                const stock = portfolio.stocks[i];
                const tempStock = await getStockPrice(stock.symbol)
                let stockPrice
                if (tempStock.exchange === "IST") {
                    stockPrice = `${tempStock.regularMarketPrice.toFixed(2)}₺`
                } else {
                    stockPrice = `${tempStock.regularMarketPrice.toFixed(2)}$`
                }
                const totalPrice = await getStockValue(stock.symbol, stock.quantity);

                totalValue += totalPrice;

                embed.addFields({ name: `${stock.symbol} (${stockPrice})`, value: `Adet: ${stock.quantity}\nDeğer: ${totalPrice.toFixed(2)}₺`, inline: true });
            }

            embed.setDescription(`Detaylı görünüm için /hisse\nToplam Portföy Değeri: ${totalValue.toFixed(2)}₺`)

            return embed
        };

        const prev_page = new ButtonBuilder()
            .setCustomId('prev_page')
            .setLabel('⬅️')
            .setStyle(ButtonStyle.Primary)

        const next_page = new ButtonBuilder()
            .setCustomId('next_page')
            .setLabel('➡️')
            .setStyle(ButtonStyle.Primary)

        const row = new ActionRowBuilder()
            .addComponents(prev_page, next_page)

        const reply = await interaction.editReply({ content: '', embeds: [await generateEmbed()], components: [row] });

        const filter = (i) => i.customId === 'prev_page' || i.customId === 'next_page';

        const collector = interaction.channel.createMessageComponentCollector({
            filter,
            time: 60000,
        });

        collector.on('collect', async (i) => {
            if (i.customId === 'prev_page' && currentPage > 1) {
                currentPage--;
            } else if (i.customId === 'next_page' && currentPage < totalPages) {
                currentPage++;
            }

            await i.update({ embeds: [generateEmbed()] });
        });

        collector.on('end', async () => {
            await interaction.editReply({ components: [] })
        });
    }
};

