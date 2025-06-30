import cronJob from 'node-cron';
import { AutoSetCardRevealTime, AutoCardReveal, AutoStartNewGameTime } from '../scheduler/sessionTask.js';

export function generateUniqueImageName(ext) {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8); // Generates a random string of length 6
    // return `image_${timestamp}_${randomString}`;
    return `${timestamp}${randomString}.${ext}`;
}

export function SetCardRevealTimeCronJob () {
    // '*/1 * * * *' = 1 minutes
    // '* * * * * *' = 1 second
    cronJob.schedule(`* * * * * *`, () => {
        AutoSetCardRevealTime();
        // console.log('⏰ Task is running every 1 second at', new Date());
    });
}

export function SetWinningCardCronJob () {
    // '*/1 * * * *' = 1 minutes
    // '* * * * * *' = 1 second
    cronJob.schedule(`* * * * * *`, () => {
        AutoCardReveal();
        // console.log('⏰ Task is running every 1 second at', new Date());
    });
}

export function StartNewGameJob () {
    // '*/1 * * * *' = 1 minutes
    // '* * * * * *' = 1 second
    cronJob.schedule(`* * * * * *`, () => {
        AutoStartNewGameTime();
        // console.log('⏰ Task is running every 1 second at', new Date());
    });
}