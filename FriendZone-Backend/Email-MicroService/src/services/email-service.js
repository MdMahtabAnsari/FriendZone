const nodemailer = require('nodemailer');
const EmailTemplateService = require('./email-template-service');
const NotFoundError = require('../utils/errors/not-found-error');
const AppError = require('../utils/errors/app-error');
const InternalServerError = require('../utils/errors/internal-server-error');
const {SMTP_FROM, SMTP_HOST, SMTP_PASS, SMTP_PORT, SMTP_USER, EMAIL_SECURE} = require('../configs/server-config');

class EmailService {
    static #transporter = null;

    constructor() {
        if (!EmailService.#transporter) {
            EmailService.#transporter = nodemailer.createTransport({
                host: SMTP_HOST,
                port: SMTP_PORT,
                secure: EMAIL_SECURE,
                auth: {
                    user: SMTP_USER,
                    pass: SMTP_PASS,
                },
            });

        }
        this.transporter = EmailService.#transporter;
        this.transporter.verify((error) => {
            if (error) {
                console.error('Error in email configuration');
            } else {
                console.log('Email configuration is correct');
            }
        });
        this.emailTemplateService = new EmailTemplateService();
        this.subjects = {
            welcome: 'Welcome to our platform',
            otp: 'Your OTP',
        };

    }

    async sendEmail({to, templateName, data = null}) {
        try {
            const html = await this.emailTemplateService.getTemplate({templateName, data});
            const mailOptions = {
                from: SMTP_FROM,
                to,
                subject: this.subjects[templateName],
                html,
            };

            await this.transporter.sendMail(mailOptions);
            return true;
        } catch (error) {

            if (error instanceof AppError) {
                throw error;
            } else {
                console.error(error);
                throw new InternalServerError();
            }

        }
    }

}

module.exports = EmailService;