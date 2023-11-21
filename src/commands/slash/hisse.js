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
        userData.save()
        const portfolio = await Portfolio.findOne({ userId: user.id });
        if (!portfolio) {
            try {
                createPortfolio(user.id)
            } catch (err) {
                console.log(err)
            }
        }
        const quote = interaction.options.getString('hisse')

        const stockInfo = await getStockPrice(`${quote}`)
        return console.log(stockInfo)
        if (stockInfo == null) return interaction.reply(`doğru yaz şunu`)

        const embed = new EmbedBuilder()
            .setTitle(`Hisse Bilgi | ${quote}`)
            .setColor('#0099ff')
            .addFields(
                { name: `Tam İsim`, value: `${stockInfo.longName}`, inline: true},
                { name: `Fiyat ${stockInfo.currency}`, value: `${stockInfo.regularMarketPrice}`, inline: true },
                { name: `` },
            )
    }
};
