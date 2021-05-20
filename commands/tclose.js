import { Command } from 'discord-akairo';

export default class TicketClose extends Command {
    constructor() {
        super('tclose', {
            aliases: ["tclose"]
        })
    }

    async exec(message) {
        await message.delete();
        // await message

        // CloseTicket(null, )
    }
}