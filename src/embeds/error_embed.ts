import { DefaultEmbed } from './default_embed';

export class ErrorEmbed extends DefaultEmbed {
    constructor(title: string, message: string) {
        super();
        this.setColor('RED');
        this.setTitle(`🚫 ${title}`);
        this.setDescription(message);
    }
}
