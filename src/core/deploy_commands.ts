import { readdirSync } from 'fs';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import Path, { resolve } from 'path';
import { Config } from './config';

try {
    (async () => {
        const config = require(resolve(__dirname, '../../config.json')) as Config;
        const commandFiles = readdirSync(Path.resolve(__dirname, '../commands')).filter(file => file.endsWith('.js'));
        const commandsData = [];

        for (const file of commandFiles) {
            let command = await import(`../commands/${file}`);
            command = new command.default();
            commandsData.push(command.data.toJSON());
        }

        const rest = new REST({version: '9'}).setToken(config.discordToken);

        await rest.put(
            Routes.applicationGuildCommands(config.clientId, config.guildId),
            {body: commandsData},
        );
    })();
} catch (err) {
    console.error(err);
}