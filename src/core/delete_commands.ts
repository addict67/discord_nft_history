import { Config } from './config';
import { Client } from 'discord.js';
import { resolve } from 'path';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';

function destroy(client: Client): never {
    client.destroy();
    process.exit();
}

(async () => {
    const config = require(resolve(__dirname, '../../config.json')) as Config;
    const client = new Client({ intents: ['GUILDS', 'GUILD_PRESENCES', 'GUILD_MEMBERS'] });

    client.once('ready', async () => {
        const guild = await client.guilds.fetch(config.guildId);

        const rest = new REST({version: '9'}).setToken(config.discordToken);

        const commands = await guild.commands.fetch();
        const commandsId = commands.filter(command => command.applicationId === config.clientId).map(command => command.id);

        const promises = commandsId.map(commandId => {
            const url = `${Routes.applicationGuildCommands(config.clientId, config.guildId)}/${commandId}`;
            // @ts-ignore
            return rest.delete(url);
        });

        await Promise.all(promises);

        destroy(client);
    });

    client.on('error', console.error);

    process
        .once('SIGINT', () => destroy(client))
        .once('SIGHUP', () => destroy(client));

    await client.login(config.discordToken);
})();
