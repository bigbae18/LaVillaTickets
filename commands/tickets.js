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
                    value: 'Para abrir un ticket y recibir ayuda, reacciona a alguna de las siguientes reacciones de acuerdo al tipo de soporte que necesites.\nSi necesitas más ayuda, asegúrate de haber leído las normativas:\n\n- <#842030350440071215>\n- <#842030350258929670>\n- <#842030350645067798>\n- <#842030350645067799>\n- <#842030350645067800>\n\n\u200b'
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
                },
                {
                    name: '🏪 Negocios 🏪',
                    value: 'Reacciona al emoji "🏪" si quieres pedir información o empezar un negocio.\n\n\u200b'
                },
                {
                    name: '⚜️ Bandas/Mafias ⚜️',
                    value: 'Reacciona al emoji "⚜️" si quieres pedir entrar o empezar una banda/mafia, o información sobre las que hay disponibles.\n\n\u200b'
                }
            ],
            footer: {
                text: "ElCiclo RP",
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
            m.react('🏪');
            m.react('⚜️');

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