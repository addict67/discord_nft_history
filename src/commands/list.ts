import { Command } from '../core/command';
import { SlashCommandBuilder } from '@discordjs/builders';
import { Config } from '../core/config';
import { CommandInteraction } from 'discord.js';
import { BotClient } from '../core/client';
import { Address } from '../entities/address';
import { DatabaseErrorEmbed } from '../embeds/database_error_embed';
import { logger } from '../core/logger';
import { ListAddressEmbed } from '../embeds/list_address_embed';

export default class List implements Command {
    public readonly data: SlashCommandBuilder;
    private readonly _config: Config;

    public constructor(private readonly _client: BotClient) {
        this.data = new SlashCommandBuilder()
            .setName('list')
            .setDescription('Lists all the addresses in the pool !');
        this._config = _client?.config;
    }

    async execute(interaction: CommandInteraction): Promise<void> {
        await interaction.deferReply({
            ephemeral: true,
        });

        let addressList: Address[];
        try {
            addressList = await Address.find();
        } catch (e) {
            logger.log({
                message: e,
                level: 'error',
            });
            await interaction.editReply({
                embeds: [new DatabaseErrorEmbed('Check logs for more informations')],
            });
            return;
        }

        await interaction.editReply({
            embeds: [new ListAddressEmbed(addressList)],
        });
    }
}
