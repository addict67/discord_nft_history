import { Command } from '../core/command';
import { SlashCommandBuilder } from '@discordjs/builders';
import { Config } from '../core/config';
import { CommandInteraction, GuildMember } from 'discord.js';
import { BotClient } from '../core/client';
import { Address } from '../entities/address';
import { AddAddressEmbed } from '../embeds/add_address_embed';
import { CommandErrorEmbed } from '../embeds/command_error_embed';
import { DatabaseErrorEmbed } from '../embeds/database_error_embed';
import { logger } from '../core/logger';
import { StringUtils } from '../utils/string_utils';

export default class Add implements Command {
    public readonly data: SlashCommandBuilder;
    private readonly _config: Config;

    public constructor(private readonly _client: BotClient) {
        this.data = new SlashCommandBuilder()
            .setName('add')
            .setDescription('Adds a new address to the pool !')
            .addStringOption(option =>
                option.setRequired(true).setName('address').setDescription('The wallet address')
            )
            .addStringOption(option =>
                option.setRequired(false).setName('nickname').setDescription('The wallet nickname')
            ) as SlashCommandBuilder;
        this._config = _client?.config;
    }

    async execute(interaction: CommandInteraction): Promise<void> {
        await interaction.deferReply();
        const addressStr = interaction.options.getString('address').toLowerCase();
        const nickname = interaction.options.getString('nickname') ?? undefined;

        if (!StringUtils.isETHAddress(addressStr)) {
            await interaction.editReply({
                embeds: [new CommandErrorEmbed(`**${addressStr}** is not an ETH address.`)],
            });
            return;
        }

        const addressExists = await Address.findOne({
            where: {
                value: addressStr,
            },
        });
        if (!addressExists) {
            let address = new Address({
                value: addressStr,
                creatorId: interaction.user.id,
                nickname,
            });
            try {
                address = await address.save();
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
            this._client.nftListenerManager.addAddress(address);
            await interaction.editReply({
                embeds: [new AddAddressEmbed(interaction.member as GuildMember, address)],
            });
        } else {
            await interaction.editReply({
                embeds: [new CommandErrorEmbed(`The address **${addressStr}** is already registered.`)],
            });
        }
    }
}
