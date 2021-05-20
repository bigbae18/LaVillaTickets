import { ticketBugs } from '../index';

const fs = require('fs').promises;
const chalk = require('chalk');
const Discord = require('discord.js');
const { toHTML } = require('discord-markdown');
const jsdom = require('jsdom');
const {
    JSDOM
} = jsdom;
const dom = new JSDOM();
const document = dom.window.document;

export const BUGS = async (client, serverInfo, colores, reaction, user) => {
    try {

        await reaction.users.remove(user)

        if (ticketBugs.has(user.id) || reaction.message.guild.channels.cache.find(ch => ticketBugs.has(ch.id))) {
            return user.send({
                embed: {
                    title: '🚧 Error al Abrir un Ticket 🚧',
                    color: colores.red,
                    fields: [{
                        name: 'Parece que tienes un ticket para esta categoría pendiente.',
                        value: 'Espera pacientemente que el Equipo Administrativo te atienda. Si ha pasado demasiado tiempo, cierra el ticket abierto y vuelva a abrir uno de nuevo.'
                    }],
                    timestamp: new Date(),
                    footer: {
                        text: 'ElCiclo RP',
                        iconURL: client.user.avatarURL()
                    }
                }
            });
        }        

        let channel;
        let ticketUser = user;

        await reaction.message.guild.channels.create(`Bugs-${ticketUser.username}`, {
            type: 'text',
            parent: serverInfo.testGuild.ticketParents.bugs,
            permissionOverwrites: [{
                    id: user.id,
                    allow: ["VIEW_CHANNEL", "SEND_MESSAGES", "ADD_REACTIONS"]
                },
                {
                    id: serverInfo.testGuild.roles.god,
                    allow: ["VIEW_CHANNEL", "SEND_MESSAGES", "ADD_REACTIONS"]
                },
                // {
                //     id: serverinfo.GeneralServer.roles.dmod,
                //     allow: ["VIEW_CHANNEL", "SEND_MESSAGES", "ADD_REACTIONS"]
                // },
                // {
                //     id: serverinfo.GeneralServer.roles.fundador,
                //     allow: ["VIEW_CHANNEL", "SEND_MESSAGES", "ADD_REACTIONS"]
                // },
                // {
                //     id: serverinfo.GeneralServer.roles.asistente,
                //     allow: ["VIEW_CHANNEL", "SEND_MESSAGES", "ADD_REACTIONS"]
                // },
                // {
                //     id: serverinfo.GeneralServer.roles.admin,
                //     allow: ["VIEW_CHANNEL", "SEND_MESSAGES", "ADD_REACTIONS"]
                // },
                // {
                //     id: serverinfo.GeneralServer.roles.mod,
                //     allow: ["VIEW_CHANNEL", "SEND_MESSAGES", "ADD_REACTIONS"]
                // },
                // {
                //     id: serverinfo.GeneralServer.roles.lider,
                //     allow: ["VIEW_CHANNEL", "SEND_MESSAGES", "ADD_REACTIONS"]
                // },
                {
                    id: reaction.message.guild.id,
                    deny: ["VIEW_CHANNEL"]
                }
            ]
        }).then(ch => {
            ticketBugs.set(user.id, ch.id);
            channel = ch;
        }).catch(e => console.log(`<> ${chalk.red.bold.underline('Error')}: ${e}`))        

        const aauLogEmbed = {
            title: "️️️️️️️🚧 Bugs y Fallos 🚧",
            description: 'Han abierto un nuevo ticket.',
            color: colores.green,
            fields: [
                {
                    name: 'Abierto por:',
                    value: '<@' + user.id + '>',
                    inline: true
                },
                {
                    name: 'Canal:',
                    value: '<#' + channel.id + '>',
                    inline: true
                }
            ],
            footer: {
                text: client.user.username,
                iconURL: client.user.avatarURL()
            },
            timestamp: new Date()
        }
        const aauChannelEmbed = {
            color: colores.caoba,
            fields: [
                {
                    name: '🚧 Bugs y Fallos 🚧',
                    value: '¡Bienvenido al sistema de tickets de ElCiclo RP!\n\n```Para ser atendido, por favor lee la siguiente instrucciones.```\n:one: **Comparte toda la información sobre tu problema**, para darle seguimiento más rápido. Incluye tu propio nick dentro de los detalles.\n\n:two: **Añade alguna imagen** o algún tipo de prueba para orientar al equipo administrativo.\n\n:three: **Sé respetuoso **y** haz un buen uso del sistema.**'
                },
                {
                    name: '\u200b',
                    value: '*Si tu ticket ha sido resuelto, reacciona al 🔒 para cerrarlo.*'
                }
            ],
            thumbnail: {
                url: user.avatarURL()
            },
            footer: {
                text: "ElCiclo RP",
                iconURL: client.user.avatarURL()
            },
            timestamp: new Date()
        }
        await client.channels.fetch(serverInfo.testGuild.ticketChannels.ticketLogs).then(ch => {
            ch.send(`<@&${serverInfo.testGuild.roles.god}>`, {
                embed: aauLogEmbed
            }).catch(e => console.log(`<> ${chalk.red.bold.underline('Error')}: ${e}`))
        }).catch(e => console.log(`<> ${chalk.red.bold.underline('Error')}: ${e}`));

        await channel.send(`<@${user.id}>`, {
            embed: aauChannelEmbed
        }).then(m => {
                m.react('🔒');
                const filter = (reaction, user) => {
                    return reaction.emoji.name === '🔒' && user.id !== client.user.id
                }
                const collector = m.createReactionCollector(filter, {
                    max: 1
                })

                collector.on('collect', async (reaction, user) => {
                        await reaction.users.remove(user);
                        ticketBugs.delete(ticketUser.id);
                        await m.channel.updateOverwrite(ticketUser.id, {
                            deny: ["VIEW_CHANNEL"]
                        });
                        await client.channels.fetch(serverInfo.testGuild.ticketChannels.ticketLogs).then(async ch => {
                            ch.send({
                                embed: {
                                    title: "️️️️️️️🚧 Bugs y Fallos 🚧",
                                    description: 'Han cerrado un ticket.',
                                    color: colores.red,
                                    fields: [
                                        {
                                            name: 'Ticket de:',
                                            value: '<@' + ticketUser.id + '>',
                                            inline: true
                                        },
                                        {
                                            name: 'Cerrado por:',
                                            value: '<@' + user.id + '>',
                                            inline: true
                                        }
                                    ],
                                    footer: {
                                        text: client.user.username,
                                        iconURL: client.user.avatarURL()
                                    },
                                    timestamp: new Date()
                                }
                            })
                        })
                        await m.channel.setName(`closed-${ticketUser.username}`)
                        await m.channel.send({
                            embed: {
                                title: `🔒 Ticket cerrado 🔒`,
                                color: colores.yellow,
                                fields: [
                                    {
                                        name: 'Cerrado por:',
                                        value: `<@${user.id}>`
                                    },
                                    {
                                        name: 'Guardar copia de conversación',
                                        value: 'Reacciona a "🖨️"',
                                        inline: true
                                    },
                                    {
                                        name: '\u200b',
                                        value: '\u200b',
                                        inline: true
                                    },
                                    {
                                        name: 'Cerrar sin copia',
                                        value: 'Reacciona a "❌"',
                                        inline: true
                                    }
                                ],
                                footer: {
                                    text: client.user.username,
                                    iconURL: client.user.avatarURL()
                                },
                                timestamp: new Date()
                            }
                        }).then(async m => {

                                await m.react("🖨️");
                                await m.react("❌")

                                const filter = (reaction, user) => {
                                    return (reaction.emoji.name === "🖨️" || reaction.emoji.name === "❌") && (user.id !== client.user.id)
                                }
                                const collector = m.createReactionCollector(filter, {
                                    max: 1
                                });

                                collector.on("collect", async (reaction, user) => {
                                    if (reaction.emoji.name === "🖨️") {
                                        
                                        await reaction.users.remove(user);
                                        const ticketEmbedMessage = await reaction.message.channel.send({
                                            embed: {
                                                title: '🖨️ Ticket cerrado con log',
                                                description: 'Guardando una copia del chat. Espere un momento por favor.',
                                                color: colores.naranja
                                            }
                                        })

                                        let messageCollection = new Discord.Collection();
                                        let channelMessages = await reaction.message.channel.messages.fetch({
                                            limit: 100
                                        }).catch(e => console.log(`<> ${chalk.red.bold.underline('Error')}: ${e}`));

                                        messageCollection = messageCollection.concat(channelMessages);

                                        while (channelMessages.size === 100) {
                                            let lastMessageId = channelMessages.lastKey();
                                            channelMessages = await reaction.message.channel.messages.fetch({
                                                limit: 100,
                                                before: lastMessageId
                                            }).catch(e => console.log(`<> ${chalk.red.bold.underline('Error')}: ${e}`));
                                            if (channelMessages) {
                                                messageCollection = messageCollection.concat(channelMessages);
                                            }
                                        }

                                        let msgs = messageCollection.array().reverse();
                                        let peopleInConversation = [];
                                        let data = await fs.readFile('./utils/template.html', 'utf8').catch(e => console.log(`<> ${chalk.red.bold.underline('Error')}: ${e}`))
                                        try {
                                            await fs.writeFile('./utils/index.html', data).catch(e => console.log(`<> ${chalk.red.bold.underline('Error')}: ${e}`))

                                            let guildElement = document.createElement('div');
                                            guildElement.className = 'info';
                                            let guildDivImg = document.createElement('div');
                                            guildDivImg.className = 'info_guild-icon-container';
                                            let guildDivMeta = document.createElement('div');
                                            guildDivMeta.className = 'info_metadata-container';


                                            let guildName = document.createElement('div');
                                            guildName.className = "info_guild-name";
                                            let guildNameText = document.createTextNode(reaction.message.guild.name);
                                            guildName.appendChild(guildNameText);
                                            let channelName = document.createElement('div');
                                            channelName.className = 'info_channel-name';
                                            let channelNameText = document.createTextNode(reaction.message.channel.name);
                                            channelName.appendChild(channelNameText);
                                            let messageCount = document.createElement('div');
                                            messageCount.className = 'info_message-count';
                                            let messageCountText = document.createTextNode(await channelMessages.size + ' mensajes.');
                                            messageCount.appendChild(messageCountText)

                                            let guildImg = document.createElement('img');

                                            guildImg.setAttribute('src', reaction.message.guild.iconURL());
                                            guildImg.className = 'info_guild-icon';

                                            guildDivImg.appendChild(guildImg);
                                            guildDivMeta.appendChild(guildName);
                                            guildDivMeta.appendChild(channelName)
                                            guildDivMeta.appendChild(messageCount);

                                            guildElement.appendChild(guildDivImg);
                                            guildElement.appendChild(guildDivMeta);

                                            await fs.appendFile('./utils/index.html', guildElement.outerHTML).catch(e => console.log(`<> ${chalk.red.bold.underline('Error')}: ${e}`));
                                            let chatlogContainer = document.createElement('div');
                                            chatlogContainer.className = 'chatlog';
                                            msgs.forEach(m => {
                                                if (m.author.id !== client.user.id && !peopleInConversation.includes(m.author.id)) {
                                                    peopleInConversation.push(m.author.id);
                                                }
                                            });
                                            msgs.forEach(async m => {
                                                const messageContent = m.content;

                                                let messageGroup = document.createElement('div');
                                                messageGroup.setAttribute('class', 'chatlog_message-group');

                                                let authorAvatarContainer = document.createElement('div');
                                                authorAvatarContainer.setAttribute('class', 'chatlog_author-avatar-container')

                                                let authorAvatar = document.createElement('img');
                                                authorAvatar.setAttribute('class', 'chatlog_author-avatar');
                                                authorAvatar.setAttribute('src', m.author.avatarURL())

                                                authorAvatarContainer.appendChild(authorAvatar);

                                                messageGroup.appendChild(authorAvatarContainer);

                                                let messagesContainer = document.createElement('div');
                                                messagesContainer.setAttribute('class', 'chatlog_messages');

                                                let authorNameSpan = document.createElement('span');
                                                authorNameSpan.setAttribute('class', 'chatlog_author-name');

                                                let authorNameText = document.createTextNode(m.author.username);
                                                authorNameSpan.appendChild(authorNameText)

                                                messagesContainer.appendChild(authorNameSpan)

                                                if (m.author.bot) {
                                                    let botTagSpan = document.createElement('span');
                                                    botTagSpan.setAttribute('class', 'chatlog_bot-tag');

                                                    let botText = document.createTextNode('BOT');
                                                    botTagSpan.appendChild(botText);

                                                    messagesContainer.appendChild(botTagSpan);
                                                }
                                                
                                                let timestampSpan = document.createElement('span');
                                                timestampSpan.setAttribute('class', 'chatlog_timestamp');

                                                let timestampText = document.createTextNode(`${m.createdAt.toLocaleDateString('es-ES')} ${m.createdAt.getHours()}:${m.createdAt.getMinutes()}:${m.createdAt.getSeconds()}`)
                                                timestampSpan.appendChild(timestampText);

                                                messagesContainer.appendChild(timestampSpan);

                                                let message = document.createElement('div');
                                                message.setAttribute('class', 'chatlog_message');

                                                let content = document.createElement('div');
                                                content.setAttribute('class', 'chatlog_content');

                                                let textSpan = document.createElement('span');
                                                textSpan.setAttribute('class', 'markdown');
                                                textSpan.innerHTML = toHTML(messageContent, {
                                                    discordCallback: {
                                                        user: node => {
                                                            let user = client.users.cache.get(node.id);
                                                            return '@' + user.username;
                                                        },
                                                        channel: node => {
                                                            let channel = client.channels.cache.get(node.id);
                                                            return '#' + channel.name
                                                        }
                                                    }
                                                });

                                                content.appendChild(textSpan);

                                                message.appendChild(content);

                                                let messageAttachments = await (m.attachments).array();

                                                if (messageAttachments) {
                                                    messageAttachments.forEach(async attachment => {
                                                        let attachmentContainer = document.createElement('div');
                                                        attachmentContainer.setAttribute('class', 'chatlog_attachment');

                                                        if (attachment.spoiler) {
                                                            let spoilerContainer = document.createElement('div');
                                                            spoilerContainer.setAttribute('class', 'spoiler spoiler--hidden')
                                                            spoilerContainer.setAttribute('onclick', 'showSpoiler(event, this)')

                                                            let spoilerImageContainer = document.createElement('div');
                                                            spoilerImageContainer.setAttribute('class', 'spoiler-image');

                                                            let attachmentLink = document.createElement('a');
                                                            attachmentLink.href = await attachment.url

                                                            if (attachment.height !== undefined) {
                                                                let image = document.createElement('img');
                                                                image.src = await attachment.url;
                                                                image.alt = `Archivo adjunto: ${attachment.name} - ${attachment.size}B`;
                                                                image.setAttribute('class', 'chatlog_attachment-thumbnail')

                                                                attachmentLink.appendChild(image);
                                                            } else {
                                                                let attachmentText = document.createTextNode(`Archivo adjunto: ${attachment.name} - ${attachment.size}B`);
                                                                attachmentLink.appendChild(attachmentText);
                                                            }

                                                            spoilerImageContainer.appendChild(attachmentLink);

                                                            spoilerContainer.appendChild(spoilerImageContainer);

                                                            attachmentContainer.appendChild(spoilerContainer);
                                                        } else {
                                                            let attachmentLink = document.createElement('a');
                                                            attachmentLink.href = await attachment.url;

                                                            if (attachment.height !== undefined) {
                                                                let image = document.createElement('img');
                                                                image.src = await attachment.url;
                                                                image.alt = `Archivo adjunto: ${attachment.name} - ${attachment.size}B`;
                                                                image.setAttribute('class', 'chatlog_attachment-thumbnail')

                                                                attachmentLink.appendChild(image);
                                                            } else {
                                                                let attachmentText = document.createTextNode(`Archivo adjunto: ${attachment.name} - ${attachment.size}B`);
                                                                attachmentLink.appendChild(attachmentText);
                                                            }

                                                            attachmentContainer.appendChild(attachmentLink);
                                                        }

                                                        message.appendChild(attachmentContainer);
                                                    })
                                                }

                                                let messageEmbeds = await m.embeds;

                                                if (messageEmbeds) {
                                                    messageEmbeds.forEach(async embed => {
                                                        let embedContainer = document.createElement('div');
                                                        embedContainer.setAttribute('class', 'chatlog_embed');

                                                        // Div para el Color del Embed
                                                        if (embed.color !== null) {
                                                            let embedPillContainer = document.createElement('div');
                                                            embedPillContainer.setAttribute('class', 'chatlog_embed-color-pill');
                                                            embedPillContainer.style = `background-color: ${embed.hexColor}`;

                                                            embedContainer.appendChild(embedPillContainer);
                                                        } else {
                                                            let embedPillContainer = document.createElement('div');
                                                            embedPillContainer.setAttribute('class', 'chatlog_embed-color-pill chatlog_embed-color-pill--default');

                                                            embedContainer.appendChild(embedPillContainer);
                                                        }

                                                        // Div para el Texto del Embed

                                                        let embedContentContainer = document.createElement('div');
                                                        embedContentContainer.setAttribute('class', 'chatlog_embed-content-container');

                                                        // Embed Content [Embed Text, Embed Footer]

                                                        let embedContent = document.createElement('div');
                                                        embedContent.setAttribute('class', 'chatlog_embed-content');

                                                        // Embed Text ( = [Author, Title, Description, Fields, Thumbnail]

                                                        let embedText = document.createElement('div');
                                                        embedText.setAttribute('class', 'chatlog_embed-text');

                                                        if (embed.author !== null && embed.author !== undefined) {
                                                            let embedAuthorContainer = document.createElement('div');
                                                            embedAuthorContainer.setAttribute('class', 'chatlog_embed-author');

                                                            let authorIcon = document.createElement('img');
                                                            authorIcon.setAttribute('class', 'chatlog_embed-author-icon');
                                                            authorIcon.src = await embed.author.iconURL;

                                                            embedAuthorContainer.appendChild(authorIcon);
                                                            
                                                            let authorLink = document.createElement('a');
                                                            authorLink.href = await embed.author.url

                                                            let authorNameSpan = document.createElement('span');
                                                            authorNameSpan.setAttribute('class', 'chatlog_embed-author-name');

                                                            let authorName = document.createTextNode(embed.author.name);
                                                            authorNameSpan.appendChild(authorName);

                                                            authorLink.appendChild(authorNameSpan);

                                                            embedAuthorContainer.appendChild(authorLink);

                                                            embedText.appendChild(embedAuthorContainer);
                                                        }
                                                        if (embed.title !== undefined && embed.title !== null) {
                                                            if (embed.title !== ''){
                                                                let embedTitleContainer = document.createElement('div');
                                                                embedTitleContainer.setAttribute('class', 'chatlog_embed-title');

                                                                let embedTitleSpan = document.createElement('span');
                                                                let embedTitle = document.createTextNode(embed.title);

                                                                embedTitleSpan.appendChild(embedTitle);

                                                                embedTitleContainer.appendChild(embedTitleSpan);

                                                                embedText.appendChild(embedTitleContainer);
                                                            }
                                                        }
                                                        if (embed.description !== undefined && embed.description !== '' && embed.description !== null) {
                                                            let embedDescriptionContainer = document.createElement('div');
                                                            embedDescriptionContainer.setAttribute('class', 'chatlog_embed-description');

                                                            let embedDescriptionSpan = document.createElement('span');
                                                            embedDescriptionSpan.innerHTML = toHTML(embed.description, {
                                                                discordCallback: {
                                                                    user: node => {
                                                                        let user = client.users.cache.get(node.id);
                                                                        return '@' + user.username;
                                                                    },
                                                                    channel: node => {
                                                                        let channel = client.channels.cache.get(node.id);
                                                                        return '#' + channel.name
                                                                    }
                                                                }
                                                            });

                                                            embedDescriptionContainer.appendChild(embedDescriptionSpan);

                                                            embedText.appendChild(embedDescriptionContainer);
                                                        }

                                                        let embed_fields = embed.fields;

                                                        if (embed_fields) {
                                                            let embedFieldsContainer = document.createElement('div');
                                                            embedFieldsContainer.setAttribute('class', 'chatlog_embed-fields');

                                                            embed_fields.forEach(async field => {
                                                                if (field.inline) {
                                                                    let fieldContainer = document.createElement('div');
                                                                    fieldContainer.setAttribute('class', 'chatlog_embed-field chatlog_embed-field--inline');

                                                                    let fieldNameContainer = document.createElement('div');
                                                                    fieldNameContainer.setAttribute('class', 'chatlog_embed-field-name');

                                                                    let fieldNameSpan = document.createElement('span');
                                                                    let fieldName = document.createTextNode(field.name);

                                                                    fieldNameSpan.appendChild(fieldName);

                                                                    fieldNameContainer.appendChild(fieldNameSpan);

                                                                    fieldContainer.appendChild(fieldNameContainer);

                                                                    let fieldValueContainer = document.createElement('div');
                                                                    fieldValueContainer.setAttribute('class', 'chatlog_embed-field-value');

                                                                    let fieldValueSpan = document.createElement('span');
                                                                    fieldValueSpan.innerHTML = toHTML(field.value, {
                                                                        discordCallback: {
                                                                            user: node => {
                                                                                let user = client.users.cache.get(node.id);
                                                                                return '@' + user.username;
                                                                            },
                                                                            channel: node => {
                                                                                let channel = client.channels.cache.get(node.id);
                                                                                return '#' + channel.name
                                                                            }
                                                                        }
                                                                    });

                                                                    fieldValueContainer.appendChild(fieldValueSpan);

                                                                    fieldContainer.appendChild(fieldValueContainer);

                                                                    embedFieldsContainer.appendChild(fieldContainer);
                                                                } else {
                                                                    let fieldContainer = document.createElement('div');
                                                                    fieldContainer.setAttribute('class', 'chatlog_embed-field');

                                                                    let fieldNameContainer = document.createElement('div');
                                                                    fieldNameContainer.setAttribute('class', 'chatlog_embed-field-name');

                                                                    let fieldNameSpan = document.createElement('span');
                                                                    let fieldName = document.createTextNode(field.name);

                                                                    fieldNameSpan.appendChild(fieldName);

                                                                    fieldNameContainer.appendChild(fieldNameSpan);

                                                                    fieldContainer.appendChild(fieldNameContainer);

                                                                    let fieldValueContainer = document.createElement('div');
                                                                    fieldValueContainer.setAttribute('class', 'chatlog_embed-field-value');

                                                                    let fieldValueSpan = document.createElement('span');
                                                                    fieldValueSpan.innerHTML = toHTML(field.value, {
                                                                        discordCallback: {
                                                                            user: node => {
                                                                                let user = client.users.cache.get(node.id);
                                                                                return '@' + user.username;
                                                                            },
                                                                            channel: node => {
                                                                                let channel = client.channels.cache.get(node.id);
                                                                                return '#' + channel.name
                                                                            }
                                                                        }
                                                                    })

                                                                    fieldValueContainer.appendChild(fieldValueSpan);

                                                                    fieldContainer.appendChild(fieldValueContainer);

                                                                    embedFieldsContainer.appendChild(fieldContainer);
                                                                }
                                                            })

                                                            embedText.appendChild(embedFieldsContainer);
                                                        }

                                                        embedContent.appendChild(embedText);

                                                        if (embed.thumbnail !== null) {
                                                            let embedThumbnailContainer = document.createElement('div');
                                                            embedThumbnailContainer.setAttribute('class', 'chatlog_embed-thumbnail-container');

                                                            let thumbnailLink = document.createElement('a');
                                                            thumbnailLink.href = await embed.thumbnail.url;
                                                            thumbnailLink.setAttribute('class', 'chatlog_embed-thumbnail-link');


                                                            let thumbnail = document.createElement('img');
                                                            thumbnail.src = await embed.thumbnail.url;
                                                            thumbnail.alt = 'Thumbnail';
                                                            thumbnail.setAttribute('class', 'chatlog_embed-thumbnail');
                                                            
                                                            thumbnailLink.appendChild(thumbnail);

                                                            embedThumbnailContainer.appendChild(thumbnailLink)

                                                            embedContent.appendChild(embedThumbnailContainer);
                                                        }

                                                        embedContentContainer.appendChild(embedContent);

                                                        // Embed Image .then embedContentContainer.appendChild(imageContainer);

                                                        if (embed.image !== null) {
                                                            let embedImageContainer = document.createElement('div');
                                                            embedImageContainer.setAttribute('class', 'chatlog_embed-image-container');

                                                            let embedImage = document.createElement('img');
                                                            embedImage.src = await embed.image.url;
                                                            embedImage.alt = 'embedImage';
                                                            embedImage.setAttribute('class', 'chatlog_embed-image');

                                                            embedImageContainer.appendChild(embedImage);

                                                            embedContentContainer.appendChild(embedImageContainer)
                                                        }
                                                        

                                                        // Embed Footer .then embedContentContainer.appendChild(footerContainer);

                                                        if (embed.footer !== null) {
                                                            let embedFooterContainer = document.createElement('div');
                                                            embedFooterContainer.setAttribute('class', 'chatlog_embed-footer');

                                                            if (embed.footer.iconURL !== undefined && embed.footer.iconURL !== '') {
                                                                let footerImage = document.createElement('img');
                                                                footerImage.src = await embed.footer.iconURL;
                                                                footerImage.alt = 'footerImage';
                                                                footerImage.setAttribute('class', 'chatlog_embed-footer-icon');

                                                                embedFooterContainer.appendChild(footerImage);
                                                            }
                                                            if (embed.footer.text !== '' && embed.footer.text !== undefined) {
                                                                let footerTextSpan = document.createElement('span');
                                                                footerTextSpan.setAttribute('class', 'chatlog_embed-footer-text');

                                                                let footerText = document.createTextNode(embed.footer.text);
                                                                footerTextSpan.appendChild(footerText);
                                                                if (embed.timestamp !== null) {
                                                                    let dot = document.createTextNode(" • ")
                                                                    footerTextSpan.appendChild(dot);

                                                                    let timestamp = document.createTextNode(`${embed.createdAt.toLocaleDateString('es-ES')} ${embed.createdAt.getHours()}:${embed.createdAt.getMinutes()}:${embed.createdAt.getSeconds()}`)

                                                                    footerTextSpan.appendChild(timestamp);
                                                                }

                                                                embedFooterContainer.appendChild(footerTextSpan);
                                                            }
                                                            if (embed.timestamp !== null && embed.footer.text === undefined) {
                                                                let footerTimestampSpan = document.createElement('span');
                                                                footerTimestampSpan.setAttribute('class', 'chatlog_embed-footer-text');

                                                                let timestamp = document.createTextNode(`${embed.createdAt.toLocaleDateString('es-ES')} ${embed.createdAt.getHours()}:${embed.createdAt.getMinutes()}:${embed.createdAt.getSeconds()}`)

                                                                footerTimestampSpan.appendChild(timestamp);
                                                                embedFooterContainer.appendChild(footerTimestampSpan);
                                                            }
                                                            

                                                            embedContentContainer.appendChild(embedFooterContainer);
                                                        }

                                                        embedContainer.appendChild(embedContentContainer);

                                                        message.appendChild(embedContainer);
                                                    })
                                                }

                                                let messageReactions = await m.reactions.cache;

                                                if (messageReactions) {
                                                    let messageReactionsContainer = document.createElement('div');
                                                    messageReactionsContainer.setAttribute('class', 'chatlog_reactions');

                                                    messageReactions.forEach(async reaction => {
                                                        let reactionContainer = document.createElement('div');
                                                        reactionContainer.setAttribute('class', 'chatlog_reaction');

                                                        if (reaction.emoji.url !== null) {
                                                            let img = document.createElement('img');
                                                            img.src = await reaction.emoji.url;
                                                            img.alt = 'Emoji';
                                                            img.setAttribute('class', 'emoji--small');
                                                            reactionContainer.appendChild(img);           
                                                        } else {
                                                            let emojiSpan = document.createElement('span');
                                                            let emojiText = document.createTextNode(reaction.emoji.toString());
                                                            emojiSpan.appendChild(emojiText);
                                                            reactionContainer.appendChild(emojiSpan);
                                                        }
                                                        
                                                        let emojiCount = document.createElement('span');
                                                        emojiCount.setAttribute('class', 'chatlog_reaction-count');

                                                        let count = document.createTextNode(reaction.count);

                                                        emojiCount.appendChild(count);

                                                        reactionContainer.appendChild(emojiCount);

                                                        messageReactionsContainer.appendChild(reactionContainer);
                                                    })

                                                    message.appendChild(messageReactionsContainer);
                                                }

                                                messagesContainer.appendChild(message);

                                                messageGroup.appendChild(messagesContainer);

                                                chatlogContainer.appendChild(messageGroup);
                                            })
                                            
                                            setTimeout(async () => {
                                                await fs.appendFile('./utils/index.html', chatlogContainer.outerHTML);
                                                await ticketEmbedMessage.edit({
                                                    embed: {
                                                        title: '🖨️ Copia terminada',
                                                        description: 'Ticket procesado. Este canal se cerrará en 7 segundos.',
                                                        color: colores.green
                                                    }
                                                })
                                            }, 7000)
                                        } catch (e) {
                                            console.log(`<> ${chalk.red.bold.underline('Error')}: ${e}`)
                                        }
                                        const logEmbed = {
                                            author: {
                                                name: ticketUser.tag + ' - 🖨️ Ticket cerrado',
                                                icon_url: ticketUser.avatarURL()
                                            },
                                            color: colores.red,
                                            fields: [
                                                {
                                                    name: 'Creado por:',
                                                    value: `<@${ticketUser.id}>`,
                                                    inline: true
                                                },
                                                {
                                                    name: 'Categoría:',
                                                    value: '🚧 Bugs y Fallos 🚧',
                                                    inline: true
                                                },
                                                {
                                                    name: 'Cerrado por:',
                                                    value: `<@${user.id}>`,
                                                    inline: true
                                                },
                                                
                                                {
                                                    name: '# Mensajes recogidos:',
                                                    value: `${await channelMessages.size}`,
                                                    inline: true
                                                },
                                                {
                                                    name: '\u200b',
                                                    value: '\u200b',
                                                    inline: true
                                                },
                                                {
                                                    name: 'Participantes:',
                                                    value: `${peopleInConversation.map(id => '<@' + id + '>')}`,
                                                    inline: true
                                                }
                                            ],
                                            footer: {
                                                text: client.user.username,
                                                iconURL: client.user.avatarURL()
                                            },
                                            timestamp: new Date()
                                        }
                                        const finalLog = new Discord.MessageAttachment('./utils/index.html', `ticket-${ticketUser.username}.html`);
                                        await client.channels.fetch(serverInfo.testGuild.ticketChannels.ticketsHtml).then(async ch => {
                                            setTimeout(() => {
                                                ch.send({
                                                    embed: logEmbed,
                                                    files: [finalLog]
                                                }).then(() => {
                                                    setTimeout(() => {
                                                        ticketUser.send({
                                                            embed: {
                                                                footer: {
                                                                    text: "ElCiclo RP",
                                                                    iconURL: client.user.avatarURL()
                                                                },
                                                                color: colores.green,
                                                                description: '**Tu ticket ha sido cerrado.** Este archivo HTML es una copia certificada de la conversación de tu ticket. **Descárgalo** si deseas leer la transcripción completa\n\n**Si necesitas más ayuda**, no dudes en contactarnos a través de nuestro [Discord Oficial](https://discord.gg/q4USsrvesK). **Muchas gracias.**\n\n*Este es un mensaje automatizado y no necesitas responderlo*'
                                                            },
                                                            files: [finalLog]
                                                        })
                                                        reaction.message.channel.delete('Ticket cerrado. Log recogido.')
                                                    }, 7000)
                                                }).catch(e => console.log(`<> ${chalk.red.bold.underline('Error')}: ${e}`));
                                            }, 7000)
                                        }).catch(e => console.log(`<> ${chalk.red.bold.underline('Error')}: ${e}`));
                                    }

                                    if (reaction.emoji.name === "❌") {
                                        await reaction.users.remove(user)
                                        await reaction.message.channel.send({
                                            embed: {
                                                title: '❌ Ticket cerrado sin copia',
                                                description: 'Se cerrará el canal en 7 segundos.',
                                                color: colores.red
                                            }
                                        })
                                        const noLogEmbed = {
                                            author: {
                                                name: ticketUser.tag + ' - ❌ Ticket cerrado',
                                                icon_url: ticketUser.avatarURL()
                                            },
                                            color: colores.red,
                                            fields: [
                                                {
                                                    name: 'Creado por:',
                                                    value: `<@${ticketUser.id}>`,
                                                    inline: true
                                                },
                                                {
                                                    name: '\u200b',
                                                    value: '\u200b',
                                                    inline: true
                                                },
                                                {
                                                    name: 'Cerrado por:',
                                                    value: `<@${user.id}>`,
                                                    inline: true
                                                },
                                                {
                                                    name: 'Categoría:',
                                                    value: '🚧 Bugs y Fallos 🚧'
                                                }
                                            ],
                                            footer: {
                                                text: client.user.username,
                                                iconURL: client.user.avatarURL()
                                            },
                                            timestamp: new Date()
                                        }

                                        await client.channels.fetch(serverInfo.testGuild.ticketChannels.ticketLogs).then(ch => {
                                            ch.send({
                                                embed: noLogEmbed
                                            }).then(() => {
                                                setTimeout(() => {
                                                    ticketUser.send({
                                                        embed: {
                                                            footer: {
                                                                text: "ElCiclo RP",
                                                                iconURL: client.user.avatarURL()
                                                            },
                                                            color: colores.red,
                                                            description: '**Tu ticket ha sido cerrado.** No se ha guardado copia de la conversación.\n\n**Si necesitas más ayuda**, no dudes en contactarnos a través de nuestro [Discord Oficial](https://discord.gg/q4USsrvesK). **Muchas gracias.**\n\n*Este es un mensaje automatizado y no necesitas responderlo*'
                                                        }
                                                    })
                                                    reaction.message.channel.delete('Ticket cerrado.')
                                                }, 7000)
                                            }).catch(e => console.log(`<> ${chalk.red.bold.underline('Error')}: ${e}`));
                                        }).catch(e => console.log(`<> ${chalk.red.bold.underline('Error')}: ${e}`));
                                    }
                                })

                            }).catch(e => console.log(`<> ${chalk.red.bold.underline('Error')}: ${e}`));
                    })
        }).catch(e => console.log(`<> ${chalk.red.bold.underline('Error')}: ${e}`))

    } catch (e) {
        return console.log(`<> ${chalk.red.bold.underline('Error on try/catch')}: ${e}`)
    }
}