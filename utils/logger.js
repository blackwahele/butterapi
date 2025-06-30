import { createLogger, format, transports} from 'winston'
const { combine, timestamp, printf, colorize } = format;

// Custom log format
const logFormat = printf(({ level, message, timestamp }) => {
    return `${timestamp} [${level}]: ${message}`;
});

const Log = createLogger({
    level: 'info', // default level
    format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        logFormat
    ),
    transports: [
        new transports.Console({
            format: combine(colorize(), logFormat)
        }),
        new transports.File({ filename: 'logs/combined.log' }),
        new transports.File({ filename: 'logs/info.log', level: 'info' }),
        new transports.File({ filename: 'logs/error.log', level: 'error' }),
        new transports.File({ filename: 'logs/warn.log', level: 'warn' }),
        new transports.File({ filename: 'logs/debug.log', level: 'debug' }),
    ]
});

export default Log;


/* 
Winston uses npm log levels by default:

Level	    Priority	    Description
error   	0	        Serious errors that need attention
warn	    1	        Warnings that may cause problems
info	    2	        General information (e.g., startup)
http	    3	        HTTP-specific logs (optional)
verbose	    4	        Verbose output for deeper insight
debug	    5	        Debug-level messages (development)
silly	    6	        Very detailed, usually unnecessary 

*/