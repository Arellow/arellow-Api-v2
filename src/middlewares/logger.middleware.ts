
import pino from 'pino';
import dotenv from 'dotenv'
dotenv.config();


const isDev = process.env.NODE_ENV !== 'production';

const logger = isDev
  ? pino({
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      },
      level: 'info',
    })
  : pino({
      level: 'info',
    });

export default logger;

