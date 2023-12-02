import { SlashCommandBuilder } from "@discordjs/builders";
import { EmbedBuilder } from "discord.js";

export default {
    data: new SlashCommandBuilder()
        .setName("yardim")
        .setDescription("neyi yardın?"),
    run: async (client, interaction) => {
        const embed = new EmbedBuilder()
            .setTitle('Yardım')
            .setColor('Blue')
            .setThumbnail(client.user.displayAvatarURL())
            .setDescription(`adım 1) benim sana para vermemi bekliyon\nadım 2) /emir ile hisse alıyon\nadım 3) /portföy ile durumuna bakıyon\nadım 4) daha detaylı görünüm istiyorsan /hisse diyon\nadım 5) /alarm ile alarm kuruyon`)

        await interaction.reply({ content: '', embeds: [embed] })
    }
};
