import { Address } from '../entities/address';
import { DefaultEmbed } from './default_embed';

export class ListAddressEmbed extends DefaultEmbed {
    constructor(addressList: Address[]) {
        super();
        this.setTitle('📜 Address list');
        let description = '';
        if (addressList?.length) {
            for (const address of addressList) {
                const { nickname, value, creatorId} = address;
                const text = nickname ? `**${nickname}** (${value})` : `**${value}**`;
                description += `<@${creatorId}> - ${text}\n`;
            }
        } else {
            description = '**No registered addresses**';
        }
        this.setDescription(description);
    }
}
