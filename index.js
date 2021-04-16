import AsaltadosClient from './bot';
import { botToken, ownerId, prefix } from './core/env';
import colores from './utils/colores';
const chalk = require('chalk');

const client = new AsaltadosClient(ownerId, prefix);

const run = async () => {
    try {
        await client.login(botToken);

        await client.start();

        await client.user.setStatus('idle');
        await client.user.setActivity('🖥️ connect 54.37.129.111:30150 || Asaltados Soporte')

    } catch (e) {
        console.log(`${chalk.red.bold.underline('<!> Error')}: ${e}`);
    }
}