import { SlashCommandBuilder } from "@discordjs/builders";
import User from '../../utils/db/users.js'
import { EmbedBuilder } from "discord.js";
import addStockToPortfolio from "../../utils/functions/addStockToPortfolio.js";
import { getExchangeRate } from "../../utils/functions/portfolioUtils.js";
import removeStockFromPortfolio from "../../utils/functions/removeStockFromPortfolio.js";
import Portfolio from "../../utils/db/portfolio.js";
import getStockPrice from "../../utils/functions/getStockPrice.js";
import createPortfolio from "../../utils/functions/createPortfolio.js";

export default {
    data: new SlashCommandBuilder()
        .setName("emir")
        .setDescription("Alış / Satış emiri ver")
        .addStringOption(option =>
            option
                .setName('emir')
                .setDescription('Emir türü')
                .setRequired(true)
                .addChoices(
                    { name: 'Alış', value: 'alis' },
                    { name: 'Satış', value: 'satis' },
                )
        )
        .addStringOption(option =>
            option
                .setName('hisse')
                .setDescription('Emiri vereceğin hisseyi belirt')
                .setRequired(true)
        )
        .addNumberOption(option =>
            option
                .setName('adet')
                .setDescription('Adet belirt')
                .setRequired(true)
        ),
    run: async (client, interaction) => {
        await interaction.reply(`Hesaplanıyor...`)
        const orderType = interaction.options.getString('emir')
        const quote = interaction.options.getString('hisse')
        const quantity = interaction.options.getNumber('adet')
        const user = interaction.member.user
        const userData = await User.findOne({ id: user.id }) || new User({ id: user.id })
        const errorEmbed = new EmbedBuilder().setTitle('Hata').setColor('Red')
        userData.save()
        const portfolio = await Portfolio.findOne({ userId: user.id });
        if (!portfolio) {
            try {
                await createPortfolio(user.id)
                errorEmbed.setDescription(`Lütfen tekrar dene`)
                return interaction.editReply({ content:'', embeds: [errorEmbed] })
            } catch (err) {
                console.log(err)
            }
        }

        if (orderType == "alis") {
            let quoteInfo = await getStockPrice(`${quote}`)
            if (quoteInfo == null) {
                errorEmbed.setDescription(`Belirttiğiniz kodda bir hisse bulunamadı. İstanbul Borsasında ise sonuna '.IS' eklemeyi unutmayın.`)
                return interaction.editReply({ content: '', embeds: [errorEmbed] })
            }

            if (quoteInfo.marketState !== "REGULAR" && quoteInfo.marketState !== "POST" && quoteInfo.marketState !== "PRE") {
                errorEmbed.setDescription(`${quote} hissesinin bulunduğu market şu an kapalı`);
                return interaction.editReply({ content: '', embeds: [errorEmbed] });
            }

            if (quoteInfo.exchange === "IST") {
                let price = quoteInfo.regularMarketPrice
                if (userData.balance < (quantity * price)) {
                    errorEmbed.setDescription(`${quantity} adet ${quote} alabilmek için ${(quantity * price).toFixed(2)} ₺'ye ihtiyacın var`)
                    return interaction.editReply({ content: '', embeds: [errorEmbed] })
                } else {
                    await addStockToPortfolio(user.id, quote, quantity, price)
                    userData.balance -= quantity * price
                    await userData.save()

                    const embed = new EmbedBuilder()
                        .setTitle('Alış Emri')
                        .setDescription(`${quantity} adet ${quote} alış emriniz ${price.toFixed(2)} ₺ fiyattan gerçekleşmiştir`)
                        .setColor('Green')

                    return interaction.editReply({ content: '', embeds: [embed] })
                }
            } else {
                let price = quoteInfo.regularMarketPrice
                let exchangeRate = await getExchangeRate()
                if (userData.balance < (quantity * price * exchangeRate)) {
                    errorEmbed.setDescription(`${quantity} adet ${quote} alabilmek için ${(quantity * price).toFixed(2)} $ (${(quantity * price * exchangeRate).toFixed(2)} ₺) 'a ihtiyacın var`)
                    return interaction.editReply({ content: '', embeds: [errorEmbed] })
                } else {
                    await addStockToPortfolio(user.id, quote, quantity, price, exchangeRate)
                    userData.balance -= quantity * price * exchangeRate
                    await userData.save()

                    const embed = new EmbedBuilder()
                        .setTitle('Alış Emri')
                        .setDescription(`${quantity} adet ${quote} alış emriniz ${price.toFixed(2)} $ (${(price * exchangeRate).toFixed(2)} ₺) fiyattan gerçekleşmiştir`)
                        .setColor('Green')

                    return interaction.editReply({ content: '', embeds: [embed] })
                }
            }
        } else if (orderType == "satis") {
            let quoteInfo = await getStockPrice(`${quote}`)
            if (quoteInfo == null) {
                errorEmbed.setDescription(`Belirttiğiniz kodda bir hisse bulunamadı. İstanbul Borsasında ise sonuna '.IS' eklemeyi unutmayın.`)
                return interaction.editReply({ content: '', embeds: [errorEmbed] })
            }
            
            if (quoteInfo.marketState !== "REGULAR" && quoteInfo.marketState !== "POST" && quoteInfo.marketState !== "PRE") {
                errorEmbed.setDescription(`${quote} hissesinin bulunduğu market şu an kapalı`);
                return interaction.editReply({ content: '', embeds: [errorEmbed] });
            }

            if (quoteInfo.exchange === "IST") {
                let price = quoteInfo.regularMarketPrice
                const sell = await removeStockFromPortfolio(user.id, quote, quantity)
                if (sell == "eksik") {
                    errorEmbed.setDescription(`Belirttiğiniz adette ${quote} portföyünüzde bulunmuyor`)
                    return interaction.editReply({ content: '', embeds: [errorEmbed] })
                } if (sell == "yok") {
                    errorEmbed.setDescription(`Portföyünüzde ${quote} bulunmuyor`)
                    return interaction.editReply({ content: '', embeds: [errorEmbed] })
                }
                userData.balance += quantity * price
                await userData.save()

                const embed = new EmbedBuilder()
                    .setTitle('Satış Emri')
                    .setDescription(`${quantity} adet ${quote} satış emriniz ${price.toFixed(2)} ₺ fiyattan gerçekleşmiştir`)
                    .setColor('Green')

                return interaction.editReply({ content: '', embeds: [embed] })
            } else {
                let price = quoteInfo.regularMarketPrice
                let exchangeRate = await getExchangeRate()
                const sell = await removeStockFromPortfolio(user.id, quote, quantity)
                if (sell == "eksik") {
                    errorEmbed.setDescription(`Belirttiğiniz adette ${quote} portföyünüzde bulunmuyor`)
                    return interaction.editReply({ content: '', embeds: [errorEmbed] })
                } if (sell == "yok") {
                    errorEmbed.setDescription(`Portföyünüzde ${quote} bulunmuyor`)
                    return interaction.editReply({ content: '', embeds: [errorEmbed] })
                }
                userData.balance += quantity * price * exchangeRate
                await userData.save()

                const embed = new EmbedBuilder()
                    .setTitle('Satış Emri')
                    .setDescription(`${quantity} adet ${quote} satış emriniz ${price.toFixed(2)} $ (${(price * exchangeRate).toFixed(2)} ₺) fiyattan gerçekleşmiştir`)
                    .setColor('Green')

                return interaction.editReply({ content: '', embeds: [embed] })
            }
        }
    }
}
