import fs from 'fs';
import path from 'path';
import nodemailer from 'nodemailer'
import CryptoJS from "crypto-js";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SendMail = async (UserEmail, body, html, filename="") => {
    const SMTPConfigIntranet = {
        host: process.env.MAIL_HOST,
        port: process.env.MAIL_PORT,
        secure: false,
        auth: {
          user: process.env.MAIL_USERNAME,
          pass: process.env.MAIL_PASSWORD,
        },
        tls: {
          rejectUnauthorized: false,
          minVersion: 'TLSv1.2',
        },
        connectionTimeout: 5 * 60 * 1000,
    };

    const tranporter = await nodemailer.createTransport(SMTPConfigIntranet);
    
    const MailOption = {
        from :  `Nilkanth Diamond <${process.env.MAIL_SENDER}>`,
        to:  UserEmail,
        cc: body?.cc?.length > 0 ? body.cc.map(item => item.email).join(', ') : '',
        bcc: body?.bcc?.length > 0 ? body.bcc.map(item => item.email).join(', ') : '',
        subject: body.subject,
        html: `${html}`,
    }

    tranporter.sendMail(MailOption, (error, info) => {
        if (error) {
          console.error("Error Sending  :->", error);
        } else {
          console.log("Email Sent", info.response);
        }
    });
}

export default SendMail;