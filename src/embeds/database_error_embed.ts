import { ErrorEmbed } from './error_embed';

export class DatabaseErrorEmbed extends ErrorEmbed {
    constructor(message: string) {
        super('Database error', message);
    }
}
