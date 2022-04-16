import { DefaultEmbed } from './default_embed';
import { Address } from '../entities/address';
import { GuildMember } from 'discord.js';

export class AddAddressEmbed extends DefaultEmbed {
    constructor(author: GuildMember, address: Address) {
        super();
        this.setColor('GREEN');
        this.setAuthor({
            name: author.user.tag,
            iconURL: author.displayAvatarURL({ dynamic: true }),
        });
        this.setTitle('📡 New address added');
        this.addFields([{
            name: 'Creator',
            value: `<@${address.creatorId}>`,
            inline: true,
        }, {
            name: 'Address',
            value: address.value,
            inline: true,
        }]);
    }
}
