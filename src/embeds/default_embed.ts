import { MessageEmbed } from 'discord.js';

export class DefaultEmbed extends MessageEmbed {
    constructor() {
        super();
        this.setTimestamp();
    }
}
