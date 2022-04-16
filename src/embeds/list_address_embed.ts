import { Address } from '../entities/address';
import { DefaultEmbed } from './default_embed';

export class ListAddressEmbed extends DefaultEmbed {
    constructor(addressList: Address[]) {
        super();
        this.setTitle('📜 Address list');
        let description = '';
        if (addressList?.length) {
            for (const address of addressList) {
                const {value, creatorId} = address;
                description += `<@${creatorId}> - **${value}**\n`;
            }
        } else {
            description = '**No registered addresses**';
        }
        this.setDescription(description);
    }
}
