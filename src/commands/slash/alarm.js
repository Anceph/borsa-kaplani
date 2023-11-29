import { SlashCommandBuilder } from "@discordjs/builders";
import { EmbedBuilder } from "discord.js";
import User from '../../utils/db/users.js';
import getStockPrice from "../../utils/functions/getStockPrice.js";

export default {
    data: new SlashCommandBuilder()
        .setName("alarm")
        .setDescription("Bir hisse için alarm kur")
        .addStringOption(option =>
            option
                .setName('hisse')
                .setDescription('Alarm kurmak istediğiniz hissenin kodu')
                .setRequired(true)
        )
        .addNumberOption(option =>
            option
                .setName('fiyat')
                .setDescription('Alarm için belirlenen fiyat')
                .setRequired(true)
        ),
    run: async (client, interaction) => {
        const quote = interaction.options.getString('hisse');
        const targetPrice = interaction.options.getNumber('fiyat');
        const user = interaction.member.user;
        const userData = await User.findOne({ id: user.id }) || new User({ id: user.id });

        const errorEmbed = new EmbedBuilder().setTitle('Hata').setColor('Red')

        const quoteInfo = await getStockPrice(quote);
        const currentPrice = quoteInfo.regularMarketPrice
        if (!quoteInfo) {
            errorEmbed.setDescription(`Belirttiğiniz kodda bir hisse bulamadım.`)
            return interaction.reply({ content: '', embeds: [errorEmbed] })
        }
        
        const embed = new EmbedBuilder()
            .setTitle('Fiyat Alarmı')
            .setColor('Blue')

        const existingAlarmIndex = userData.priceAlerts.findIndex(alert => alert.quote === quote)
        if (existingAlarmIndex !== -1) {
            let existingTargetPrice = userData.priceAlerts[existingAlarmIndex].targetPrice
            userData.priceAlerts[existingAlarmIndex].targetPrice = targetPrice;
            userData.priceAlerts[existingAlarmIndex].currentPrice = currentPrice;
            embed.setDescription(`🚨 ${quote} için ${existingTargetPrice} olan hedef fiyatınız ${targetPrice} olarak güncellendi.`)
        } else {
            userData.priceAlerts.push({ quote, targetPrice, currentPrice})
            embed.setDescription(`🚨 ${quote} için ${targetPrice} fiyatına alarm kuruldu.`)
        }

        await userData.save()

        await interaction.reply({ content: '', embeds: [embed] })
    }
};
