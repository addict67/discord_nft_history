import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';

export interface Command {
    readonly data: SlashCommandBuilder;

    execute(interaction: CommandInteraction): Promise<void>;
}
