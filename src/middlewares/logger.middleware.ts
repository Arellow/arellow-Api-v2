import pino from 'pino';
import dotenv from 'dotenv'
dotenv.config();

const isDev = process.env.NODE_ENV !== 'production';

const logger = pino({
  level: 'info',
  ...(isDev && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname',
      },
    },
  }),
});

export default logger;

