import { DefaultEmbed } from './default_embed';
import { Address } from '../entities/address';
import { add } from 'winston';

export interface CollectionData {
    contractAddress: string;
    collectionName: string;
    amount: number;
    tokenId: string;
    collectionImage?: string;
    floorPrice?: number;
    collectionUrl?: string;
    assetImageUrl?: string;
}

export class NFTTransactionEmbed extends DefaultEmbed {
    constructor(address: Address, data: CollectionData) {
        super();
        this.setTitle('🎉 Congrats');
        const floorPrice = data.floorPrice === undefined ? '?' : data.floorPrice.toString();
        const collection = data.collectionUrl ? `[${data.collectionName}](${data.collectionUrl})` : data.collectionName;
        this.setThumbnail(data.collectionImage);
        this.setImage(data.assetImageUrl);
        this.setFields([{
            name: 'Address',
            value: address.nickname ?? address.value,
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
            value: collection,
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
