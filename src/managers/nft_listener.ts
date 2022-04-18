import { BotClient } from '../core/client';
import { Address } from '../entities/address';
import fetch from 'node-fetch';
import { oneLineTrim } from 'common-tags';
import { TextChannel } from 'discord.js';
import { NFTTransactionEmbed, CollectionData } from '../embeds/nft_transaction_embed';
import { logger } from '../core/logger';

export class NFTListenerManager {
    private readonly _etherScanToken: string;
    private readonly _openSeaToken: string;
    private readonly _lastAddressTimestamp: Map<string, number>;
    private _addressList: Address[];
    private _channel: TextChannel;
    private _index: number;

    constructor(private readonly _client: BotClient) {
        this._etherScanToken = _client.config.etherScanToken;
        this._openSeaToken = _client.config.openSeaToken;
        this._lastAddressTimestamp = new Map<string, number>();
        this._index = 0;
    }

    async init(): Promise<void> {
        this._channel = this._client.channel;
        this._addressList = await Address.find();
        const timestamp = Math.floor(Date.now() / 1000);
        for (const address of this._addressList) {
            this._lastAddressTimestamp.set(address.value, timestamp);
        }
        await this.loop();
    }

    async loop(): Promise<void> {
        if (this._addressList.length) {
            if (this._index >= this._addressList.length) {
                this._index = 0;
            }
            await this.checkAddressTxs(this._addressList[this._index]);
            this._index += 1;
        }
        setTimeout(() => this.loop(), 250);
    }

    async checkAddressTxs(address: Address): Promise<void> {
        const value = address.value;

        const url = oneLineTrim`
            https://api.etherscan.io/api?module=account&action=tokennfttx
            &address=${value}&page=1&offset=50&sort=desc&apikey=${this._etherScanToken}
        `;
        const res = await fetch(url);
        if (res.status !== 200) return;
        const json = await res.json();

        let history = json.result.sort((previous, next) => {
            const preTimestamp = parseInt(previous.timeStamp);
            const nextTimestamp = parseInt(next.timeStamp);
            return preTimestamp - nextTimestamp;
        });
        history = history.filter((value, index, self) => {
            const selfIndex = self.findIndex((t) => (
                t.blockNumber === value.blockNumber && t.contractAddress === value.contractAddress
            ));
            if (index !== selfIndex) {
                history[selfIndex].amount += 1;
                return false;
            }
            value.amount = 1;
            return true;
        });
        const lastTimestamp = this._lastAddressTimestamp.get(value);
        for (const tx of history) {
            const txTimestamp = parseInt(tx.timeStamp);
            if (txTimestamp > lastTimestamp && tx.to === value) {
                await this.newNFTTransaction(address, tx);
                this._lastAddressTimestamp.set(value, txTimestamp);
            }
        }
    }

    async newNFTTransaction(address: Address, tx: any): Promise<void> {
        const data: CollectionData = {
            contractAddress: tx.contractAddress,
            collectionName: tx.tokenName,
            amount: tx.amount,
            tokenId: tx.tokenID,
        };

        const collectionSlug = await this.getCollectionSlug(tx.contractAddress);
        if (collectionSlug) {
            await this.getCollectionData(collectionSlug, data);
        }

        await this._channel.send({
            content: `<@${address.creatorId}>`,
            embeds: [new NFTTransactionEmbed(address, data)],
        });
    }

    addAddress(address: Address): void {
        this._addressList.push(address);
        this._lastAddressTimestamp.set(address.value, Math.floor(Date.now() / 1000));
    }

    removeAddress(address: Address): void {
        const index = this._addressList.findIndex(value => value.id === address.id);
        this._addressList.splice(index, 1);
        this._lastAddressTimestamp.delete(address.value);
    }

    private async getCollectionSlug(contractAddress: string): Promise<string | null> {
        const url = `https://api.opensea.io/api/v1/asset_contract/${contractAddress}`;

        const res = await fetch(url, {
            headers: {
                'X-API-KEY': this._openSeaToken,
            },
        });
        if (res.status === 200) {
            const json = await res.json();
            return json.collection.slug;
        }
        return null;
    }

    private async getCollectionData(collectionSlug: string, data: CollectionData): Promise<void> {
        const url = `https://api.opensea.io/api/v1/collection/${collectionSlug}`;

        const res = await fetch(url, {
            headers: {
                'X-API-KEY': this._openSeaToken,
            },
        });
        if (res.status === 200) {
            const json = await res.json();
            data.floorPrice = json.collection.stats.floor_price;
            data.collectionImage = json.collection.large_image_url;
            data.collectionName = json.collection.name;
            data.collectionUrl = `https://opensea.io/collection/${collectionSlug}`;
            data.assetImageUrl = await this.getAssetImageUrl(data.contractAddress, data.tokenId);
        }
    }

    private async getAssetImageUrl(contractAddress: string, tokenId: string): Promise<string> {
        const url = `https://api.opensea.io/api/v1/asset/${contractAddress}/${tokenId}`;

        const res = await fetch(url, {
            headers: {
                'X-API-KEY': this._openSeaToken,
            },
        });
        if (res.status === 200) {
            const json = await res.json();
            return json.image_url;
        }
        return '';
    }
}
