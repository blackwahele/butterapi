import dotenv from 'dotenv';
import { Error } from 'mongoose';
import { exec } from 'node:child_process'
import fs from 'node:fs';

let [arg1, arg2 , arg3, arg4] = process.argv;

if(process.argv.length > 4 || !arg4){
    throw Error("Invalid argument");
}

if(arg3 == 'model' && arg4){
    const filePath = `models/${arg4}.model.js`;
    const startedPath = `started_code/modelCode.js`;
    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            const startedData = fs.readFileSync(startedPath, 'utf8'); 
            fs.appendFileSync(filePath, startedData, { flag: 'w' });
        } else {
            console.log('File Already Exists.');
        }
    });
}

if(arg3 == 'controller' && arg4){
    const filePath = `controllers/${arg4}.controller.js`;
    const startedPath = `started_code/controllerCode.js`;
    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            const startedData = fs.readFileSync(startedPath, 'utf8'); 
            fs.appendFileSync(filePath, startedData, { flag: 'w' });
        } else {
            console.log('File Already Exists.');
        }
    });
}

if(arg3 == 'route' && arg4){
    const filePath = `routes/${arg4}.route.js`;
    const startedPath = `started_code/routeCode.js`;
    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            const startedData = fs.readFileSync(startedPath, 'utf8'); 
            fs.appendFileSync(filePath, startedData, { flag: 'w' });
        } else {
            console.log('File Already Exists.');
        }
    });
}

if(arg3 == 'service' && arg4){
    const filePath = `services/${arg4}.service.js`;
    const startedPath = `started_code/serviceCode.js`;
    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            const startedData = fs.readFileSync(startedPath, 'utf8'); 
            fs.appendFileSync(filePath, startedData, { flag: 'w' });
        } else {
            console.log('File Already Exists.');
        }
    });
}

if(arg3 == 'middleware' && arg4){
    const filePath = `middlewares/${arg4}.middleware.js`;
    const startedPath = `started_code/middlewareCode.js`;
    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            const startedData = fs.readFileSync(startedPath, 'utf8'); 
            fs.appendFileSync(filePath, startedData, { flag: 'w' });
        } else {
            console.log('File Already Exists.');
        }
    });
}

// // exec('mkdir navin')
// // exec('echo > sd.txt')
// let [arg1, arg2 , arg3, arg4] = process.argv;

// if(arg3 == 'model' && arg4){
//     // exec(`echo > models/${arg4}.model.js`)
//     exec(`type nul > models/${arg4}.model.js`)
// }

// console.log(process.argv)