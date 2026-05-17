// libs/mailer.js
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.GMAIL_USER,        // your@gmail.com
        pass: process.env.GMAIL_APP_PASSWORD, // App password 16 ký tự
    },
});

export default transporter;