"use strict"
/**
 * @module logger Provides logging
 */

const { createLogger, format, transports } = require("winston");
const { combine, timestamp, printf, splat } = format;

/**
 * @constant LOG_FORMAT Custom format for winston logger
 */
const LOG_FORMAT = printf(({ level, message, timestamp }) => {
    return `[${level}] ${timestamp} - ${message}`;
});

module.exports = createLogger({
    level: "debug",
    format: combine(splat(), timestamp(), LOG_FORMAT),
    transports: [new transports.Console()],
});
