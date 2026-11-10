import nodemailer from 'nodemailer';

export const sendEmail = async (to: string, subject: string, text: string) => {
    const transport = nodemailer.createTransport(process.env.EMAIL_SERVER);

    await transport.sendMail({
        to,
        from: process.env.EMAIL_FROM,
        subject,
        text,
    });
};

export const sendAdminAlert = async (subject: string, text: string) => {
    const to = process.env.SUPPORT_ALERT_EMAIL;
    if (!to) throw new Error('Missing SUPPORT_ALERT_EMAIL env var');
    await sendEmail(to, subject, text);
};
