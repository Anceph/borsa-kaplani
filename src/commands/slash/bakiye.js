import { SlashCommandBuilder } from "@discordjs/builders";
import User from '../../utils/db/users.js'
import { EmbedBuilder } from "discord.js";

export default {
    data: new SlashCommandBuilder()
        .setName("bakiye")
        .setDescription("Bakiyeni kontrol et"),
    run: async (client, interaction) => {
        throw new Error('This is a test error');
        const user = interaction.member.user
        const userData = await User.findOne({ id: user.id }) || new User({ id: user.id })
        userData.save()

        const balance = userData.balance.toFixed(2)

        const embed = new EmbedBuilder()
            .setDescription(`${balance} ₺`)
            .setColor('Yellow')
            .setThumbnail(user.displayAvatarURL())

        if (userData.role == 1) {
            embed.setTitle(`💎 ${user.username} Bakiye`)
            embed.setFooter({ text: 'Premium Account' })
        } else if (userData.role == 2) {
            embed.setTitle(`🛠️ ${user.username} Bakiye`)
        } else if (userData.role == 0) {
            embed.setTitle(`${user.username} Bakiye`)
        }

        return interaction.reply({ embeds: [embed] })
    }
};
