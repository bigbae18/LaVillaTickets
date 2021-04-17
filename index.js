import { Collection } from 'discord.js';
import AsaltadosClient from './botClient';
import { botToken, ownerId, prefix } from './core/env';
import colores from './utils/colores';

import { SANCIONES } from './categories/sanciones';
import { SOPORTE } from './categories/soporte';
import { BUGS } from './categories/bugs';
import { CK } from './categories/ck';

const serverInfo = require('./serverInfo.json');
const tickets = require('./tickets.json');
const chalk = require('chalk');

const client = new AsaltadosClient(ownerId, prefix);

const events = {
    MESSAGE_REACTION_ADD: "messageReactionAdd",
    MESSAGE_REACTION_REMOVE: "messageReactionRemove"
}

client.on('raw', async event => {
    if (!events.hasOwnProperty(event.t)) return;

    const { d: data } = event;

    const user = await client.users.fetch(data.user_id);
    if (user.id === client.user.id) return;
    const channel = await client.channels.fetch(data.channel_id) || await user.createDM();
    
    if (channel.messages.cache.has(data.message_id)) return;

    const message = await channel.messages.fetch(data.message_id);
    const emojiKey = (data.emoji.id) ? `${data.emoji.name}:${data.emoji.id}` : data.emoji.name;
    const reaction = message.reactions.cache.get(emojiKey);

    client.emit(events[event.t], reaction, user)
})

const run = async () => {
    try {
        await client.login(botToken);

        client.start();

        await client.guilds.fetch(serverInfo.testGuild.id);
        await client.guilds.fetch(serverInfo.prodGuild.id);

        if (tickets.channelId) {
            await client.channels.cache.get(tickets.channelId).messages.fetch(m => m.id === tickets.messageId);
        }

        await client.user.setStatus('idle');
        await client.user.setActivity('🖥️ connect 54.37.129.111:30150 || Asaltados Soporte');

    } catch (e) {
        console.log(`${chalk.red.bold.underline('<!>')} ${chalk.red.bold.underline('Error')}: ${e}`);
    }
}

run();

client.once('ready', async () => {
    console.log(`${chalk.bold.cyan.underline('<i>')} ${chalk.bold.cyan.underline('Asaltados Tickets')}`);
    console.log(`${chalk.bold.green.underline('<i>')} ${chalk.bold.green.underline('El bot está en línea')}`);
})

client.on('messageReactionAdd', (reaction, user) => {

    if (reaction.message.id !== tickets.messageId || reaction.message.channel.id !== tickets.channelId) {
        return null
    }

    if (reaction.emoji.name === "📝" && reaction.message.id === tickets.messageId && user.id !== client.user.id) {
        SANCIONES(client, serverInfo, colores, reaction, user);
    }
    if (reaction.emoji.name === "📫" && reaction.message.id === tickets.messageId && user.id !== client.user.id) {
        SOPORTE(client, serverInfo, colores, reaction, user);
    }
    if (reaction.emoji.name === "🚧" && reaction.message.id === tickets.messageId && user.id !== client.user.id) {
        BUGS(client, serverInfo, colores, reaction, user);
    }
    if (reaction.emoji.name === "🗡️" && reaction.message.id === tickets.messageId && user.id !== client.user.id) {
        CK(client, serverInfo, colores, reaction, user);
    }

})

process.on('uncaughtException', (e, p) => {
    console.log(`${chalk.red.bold.underline('<!>')} ${chalk.red.bold.underline('Excepción encontrada')}: ${e} && ${p}`);
    client.destroy();
    process.exit(1);
})

export const ticketSanciones = new Collection();
export const ticketSoporte = new Collection();
export const ticketBugs = new Collection();
export const ticketKills = new Collection();