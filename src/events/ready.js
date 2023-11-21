import { ActivityType } from "discord.js";
export default {
	name: 'ready',
	once: true,
	execute(client) {
		client.user.setActivity({ name: 'you', type: ActivityType.Watching })
	}
};
