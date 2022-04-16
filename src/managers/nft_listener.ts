import { BotClient } from '../core/client';
import { Address } from '../entities/address';
import fetch from 'node-fetch';
import { oneLine, oneLineTrim } from 'common-tags';
import { TextChannel } from 'discord.js';
import { NFTTransactionEmbed, TxData } from '../embeds/nft_transaction_embed';
import { add } from 'winston';

export class NFTListenerManager {
    private readonly _etherScanToken: string;
    private readonly _lastAddressTimestamp: Map<string, number>;
    private _addressList: Address[];
    private _channel: TextChannel;
    private _index: number;

    constructor(private readonly _client: BotClient) {
        this._etherScanToken = _client.config.etherScanToken;
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
        setTimeout(() => this.loop(), 200);
    }

    async checkAddressTxs(address: Address): Promise<void> {
        const value = address.value;
        const url = oneLineTrim`
            https://api.etherscan.io/api?module=account&action=tokennfttx
            &address=${value}&page=1&offset=50&sort=desc&apikey=${this._etherScanToken}
        `;
        const res = await fetch(url);
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
        const data: TxData = {
            contractAddress: tx.contractAddress,
            collection: tx.tokenName,
            floorPrice: null,
            amount: tx.amount,
        };
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
}
