import { SlashCommandBuilder } from "@discordjs/builders";
import User from '../../utils/db/users.js'
import { EmbedBuilder } from "discord.js";
import getStockPrice from "../../utils/functions/getStockPrice.js";
import Portfolio from "../../utils/db/portfolio.js";

export default {
    data: new SlashCommandBuilder()
        .setName("hisse")
        .setDescription("Belirttiğin bir hisse hakkında her şeyi gör")
        .addStringOption(option =>
            option
                .setName('hisse')
                .setDescription('Bir hisse belirt')
                .setRequired(true)
        ),
    run: async (client, interaction) => {
        await interaction.reply(`Hesaplanıyor...`)
        const user = interaction.member.user
        const userData = await User.findOne({ id: user.id }) || new User({ id: user.id })
        const errorEmbed = new EmbedBuilder().setTitle('Hata').setColor('Red')
        userData.save()
        const portfolio = await Portfolio.findOne({ userId: user.id });
        if (!portfolio) {
            try {
                createPortfolio(user.id)
                errorEmbed.setDescription(`Lütfen tekrar dene`)
                return interaction.editReply({ content:'', embeds: [errorEmbed] })
            } catch (err) {
                console.log(err)
            }
        }
        const quote = interaction.options.getString('hisse')

        const stockInfo = await getStockPrice(`${quote}`)
        console.log(stockInfo)
        if (stockInfo == null) {
            errorEmbed.setDescription(`Belirttiğiniz kodda bir hisse bulunamadı. İstanbul Borsasında ise sonuna '.IS' eklemeyi unutmayın.`)
            return interaction.editReply({ content: '', embeds: [errorEmbed] })
        }
        if (!stockInfo.regularMarketVolume) {
            errorEmbed.setDescription(`Belirttiğiniz kodda bir hisse bulunamadı. İstanbul Borsasında ise sonuna '.IS' eklemeyi unutmayın.`)
            return interaction.editReply({ content: '', embeds: [errorEmbed] })
        }

        let volume = stockInfo.regularMarketVolume.toLocaleString('en-US').replace(/,/g, '.');

        const embed = new EmbedBuilder()
            .addFields(
                { name: `Kısa İsim`, value: `${stockInfo.shortName}`, inline: true },
                { name: `Uzun İsim`, value: `${stockInfo.longName}`, inline: true },
                { name: `Fiyat (${stockInfo.currency})`, value: `${stockInfo.regularMarketPrice}`, inline: true },
                { name: `Açılış Fiyatı`, value: `${stockInfo.regularMarketOpen}`, inline: true },
                { name: `Önceki Kapanış Fiyatı`, value: `${stockInfo.regularMarketPreviousClose}`, inline: true },
                { name: `Günlük Değişim (%)`, value: `%${stockInfo.regularMarketChangePercent.toFixed(4)}`, inline: true },
                { name: `Günlük En Düşük / En Yüksek`, value: `En Düşük: ${stockInfo.regularMarketDayLow}\nEn Yüksek: ${stockInfo.regularMarketDayHigh}`, inline: true },
                { name: `Hacim`, value: `${volume}`, inline: true },
            )

        if (stockInfo.marketState == "REGULAR") {
            embed.setTitle(`🔵 BORSA AÇIK | ${quote}`)
            embed.setColor('#0099ff')
        } else {
            embed.setTitle(`🔴 BORSA KAPALI | ${quote}`)
            embed.setColor('#ff0000')
        }

        return interaction.editReply({ content: '', embeds: [embed] })
    }
};
