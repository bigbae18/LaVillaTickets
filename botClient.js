const { AkairoClient, CommandHandler } = require('discord-akairo');

export default class AsaltadosClient extends AkairoClient {
    constructor(ownerID, prefix) {
        super({
            ownerID: ownerID
        }, {
            allowedMentions: false
        });
        this.prefix = prefix;
        this.commandHandler = new CommandHandler(this, {
            directory: './commands/',
            prefix: this.prefix,
            allowMention: false,
            handleEdits: true,
            commandUtil: true
        });
    }
    start() {
        this.commandHandler.loadAll();
    }
}