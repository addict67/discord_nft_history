import { DefaultEmbed } from './default_embed';
import { Address } from '../entities/address';
import { GuildMember, User } from 'discord.js';

export interface TxData {
    contractAddress: string;
    collection: string;
    floorPrice: number | null;
    amount: number;
}

export class NFTTransactionEmbed extends DefaultEmbed {
    constructor(address: Address, data: TxData) {
        super();
        this.setTitle('🎉 Congrats');
        const floorPrice = data.floorPrice === null ? '?' : data.floorPrice.toString();
        this.setFields([{
            name: 'Address',
            value: address.value,
            inline: true,
        }, {
            name: 'Contract',
            value: data.contractAddress,
            inline: true,
        }, {
            name: '\u200b',
            value: '\u200b',
            inline: false,
        }, {
            name: 'Collection',
            value: data.collection,
            inline: true,
        }, {
            name: 'Amount',
            value: data.amount.toString(),
            inline: true,
        }, {
            name: 'Floor price',
            value: `${floorPrice} Ξ`,
            inline: true,
        }]);
    }
}
