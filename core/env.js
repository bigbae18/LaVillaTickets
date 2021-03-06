import dotenv from 'dotenv';

dotenv.config();

export const botToken = process.env.BOT_TOKEN
export const ownerId = process.env.OWNER_ID
export const prefix = process.env.PREFIX || '!'