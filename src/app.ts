import 'reflect-metadata';
import { Config } from './core/config';
import { BotClient } from './core/client';
import { resolve } from 'path';

(async () => {
    try {
        const config = require(resolve(__dirname, '../config.json')) as Config;
        const bot = new BotClient(config);
        await bot.run();
    } catch (e) {
        console.error(e);
    }
})();
