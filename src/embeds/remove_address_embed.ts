import { DefaultEmbed } from './default_embed';
import { Address } from '../entities/address';
import { GuildMember } from 'discord.js';

export class RemoveAddressEmbed extends DefaultEmbed {
    constructor(author: GuildMember, address: Address) {
        super();
        this.setColor('ORANGE');
        this.setAuthor({
            name: author.user.tag,
            iconURL: author.displayAvatarURL({ dynamic: true }),
        });
        this.setTitle('🗑️ Address removed');
        this.addFields([{
            name: 'Creator',
            value: `<@${address.creatorId}>`,
            inline: true,
        }, {
            name: 'Address',
            value: address.nickname ? `**${address.nickname}** (${address.value})` : address.value,
            inline: true,
        }]);
    }
}
