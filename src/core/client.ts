import { Config } from './config';
import { Client, Collection, Guild, TextChannel } from 'discord.js';
import { Connection, createConnection } from 'typeorm';
import { readdirSync } from 'fs';
import Path from 'path';
import { Command } from './command';
import { NFTListenerManager } from '../managers/nft_listener';

export class BotClient extends Client {
    private readonly _config: Config;
    private _guild: Guild;
    private _channel: TextChannel;
    private _connection: Connection;
    private _commands: Collection<string, Command>;
    private _nftListenerManager: NFTListenerManager;

    public constructor(config: Config) {
        super({ intents: ['GUILDS', 'GUILD_MESSAGES'] });

        this._config = config;
        this._nftListenerManager = new NFTListenerManager(this);

        this.once('ready', async () => {
            this._guild = await this.guilds.fetch(config.guildId);
            this._channel = await this._guild.channels.fetch(config.channelId) as TextChannel;
            await this._nftListenerManager.init();
            console.log(`Logged in as ${this.user.tag}! (${this.user.id})`);
        });

        this.on('error', console.error);

        process
            .once('SIGINT', () => this.destroy())
            .once('SIGHUP', () => this.destroy());

        this.on('interactionCreate', async (interaction) => {
            if (!interaction.isCommand()) return;

            const command = this._commands.get(interaction.commandName);

            if (!command) return;

            try {
                await command.execute(interaction);
            } catch (error) {
                console.error(error);
            }
        });
    }

    public async run(): Promise<string> {
        await this.setupCommands();
        this._connection = await createConnection();
        return await this.login(this._config.discordToken);
    }

    public async destroy(): Promise<never> {
        if (this.user) {
            console.log(`Logged out as ${this.user.tag}! (${this.user.id})`);
        } else {
            console.log('Shutting down');
        }
        await this._connection.close();
        super.destroy();
        process.exit();
    }

    public get guild(): Guild {
        return this._guild;
    }

    public get channel(): TextChannel {
        return this._channel;
    }

    public get config(): Config {
        return this._config;
    }

    public get nftListenerManager(): NFTListenerManager {
        return this._nftListenerManager;
    }

    private async setupCommands(): Promise<void> {
        this._commands = new Collection<string, Command>();
        const commandFiles = readdirSync(Path.resolve(__dirname, '../commands')).filter(file => file.endsWith('.js'));

        for (const file of commandFiles) {
            let command = await import(`../commands/${file}`);
            command = new command.default(this);
            this._commands.set(command.data.name, command);
        }
    }
}
