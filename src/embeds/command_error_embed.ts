import { ErrorEmbed } from './error_embed';

export class CommandErrorEmbed extends ErrorEmbed {
    constructor(message: string) {
        super('Command failed', message);
    }
}
