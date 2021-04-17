import { Command } from 'discord-akairo';
import colores from '../utils/colores';
import fs from 'fs';

export default class TicketCommand extends Command {
    constructor() {
        super('tickets', {
            aliases: ['tickets'],
            args: [
                {
                    id: 'channel',
                    type: 'textChannel'
                }
            ]
        })
    }

    async exec(message, args) {
        
        await message.delete();

        const channel = (args.channel ? args.channel : message.channel)

        const ticketEmbed = {
            color: colores.naranja,
            fields: [
                {
                    name: '🛡️ Sistema de Reporte 🛡️',
                    value: 'Para abrir un ticket y recibir ayuda, reacciona a alguna de las siguientes reacciones de acuerdo al tipo de soporte que necesites.\nSi necesitas ayuda sobre el formato antes de abrir el ticket, porfavor ves a <#818976053505556480>\n\n\u200b'
                },
                {
                    name: '📝 Apelación de Sanciones 📝',
                    value: 'Reacciona al emoji "📝" para reportar algún jugador usando trampas.\n\u200b'
                },
                {
                    name: '📫 Soporte al Usuario 📫',
                    value: 'Reacciona al emoji "📫" para cualquier duda ajena a las categorías, o simplemente porque necesitas atención personalizada de la administración.\n\u200b'
                },
                {
                    name: '🚧 Bugs y Fallos 🚧',
                    value: 'Reacciona al emoji "🚧" para reportar algún bug dentro de nuestro servidor.\n\u200b'
                },
                {
                    name: '🗡️ CK 🗡️',
                    value: 'Reacciona al emoji "🗡️" si quieres realizar un CK, a alguien más o a ti mismo.\n\n\u200b'
                }
            ],
            footer: {
                text: "Asaltados RP",
                iconURL: this.client.user.avatarURL()
            }
        }

        await channel.send({
            embed: ticketEmbed
        }).then(m => {
            m.react('📝');
            m.react('📫');
            m.react('🚧');
            m.react('🗡️');

            const ticketData = {
                "channelId": channel.id,
                "messageId": m.id
            }

            fs.writeFileSync('./tickets.json', JSON.stringify(ticketData, null, 4));

            // setTimeout(() => {
            //     m.delete()
            // }, 10000)            
        }).catch(e => {
            console.error(e);
        })

    }
}