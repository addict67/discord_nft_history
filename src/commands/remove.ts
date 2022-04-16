import { Command } from '../core/command';
import { SlashCommandBuilder } from '@discordjs/builders';
import { Config } from '../core/config';
import { CommandInteraction, GuildMember } from 'discord.js';
import { BotClient } from '../core/client';
import { Address } from '../entities/address';
import { CommandErrorEmbed } from '../embeds/command_error_embed';
import { DatabaseErrorEmbed } from '../embeds/database_error_embed';
import { RemoveAddressEmbed } from '../embeds/remove_address_embed';
import { logger } from '../core/logger';
import { StringUtils } from '../utils/string_utils';

export default class Remove implements Command {
    public readonly data: SlashCommandBuilder;
    private readonly _config: Config;

    public constructor(private readonly _client: BotClient) {
        this.data = new SlashCommandBuilder()
            .setName('remove')
            .setDescription('Removes an address from the pool !')
            .addStringOption(option =>
                option.setRequired(true).setName('address').setDescription('The wallet address')
            ) as SlashCommandBuilder;
        this._config = _client?.config;
    }

    async execute(interaction: CommandInteraction): Promise<void> {
        await interaction.deferReply();
        const addressStr = interaction.options.getString('address').toLowerCase();

        if (!StringUtils.isETHAddress(addressStr)) {
            await interaction.editReply({
                embeds: [new CommandErrorEmbed(`**${addressStr}** is not an ETH address.`)],
            });
            return;
        }

        let address = await Address.findOne({
            where: {
                value: addressStr,
            },
        });
        if (address) {
            try {
                address = await address.remove();
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
            this._client.nftListenerManager.removeAddress(address);
            await interaction.editReply({
                embeds: [new RemoveAddressEmbed(interaction.member as GuildMember, address)],
            });
        } else {
            await interaction.editReply({
                embeds: [new CommandErrorEmbed(`The address **${addressStr}** doesn't exists.`)],
            });
        }
    }
}
