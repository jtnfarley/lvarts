import nodemailer from 'nodemailer';

export const sendAdminAlert = async (subject: string, text: string) => {
    const transport = nodemailer.createTransport(process.env.EMAIL_SERVER);

    await transport.sendMail({
        to: process.env.SUPPORT_ALERT_EMAIL,
        from: process.env.EMAIL_FROM,
        subject,
        text,
    });
};
