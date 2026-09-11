import nodemailer from 'nodemailer';

const host = process.env.EMAIL_HOST;
const user = process.env.EMAIL_USER;
const pass = process.env.EMAIL_PASSWORD;

let transporter: nodemailer.Transporter;
if (host && user && pass) {
  transporter = nodemailer.createTransport({ host, auth: { user, pass } });
} else {
  // mock transporter that logs to console
  transporter = nodemailer.createTransport({ jsonTransport: true } as any);
}

export async function sendMail(opts: { to: string; subject: string; text?: string; html?: string; attachments?: any[] }) {
  const info = await transporter.sendMail({ from: process.env.EMAIL_FROM || 'noreply@skypakistan.test', to: opts.to, subject: opts.subject, text: opts.text, html: opts.html, attachments: opts.attachments });
  console.log('Mail sent:', info && (info as any).messageId ? (info as any).messageId : JSON.stringify(info));
  return info;
}
