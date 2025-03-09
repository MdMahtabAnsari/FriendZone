const handlebars = require('handlebars');
const fs = require('fs').promises;
const path = require('path');
const mjml = require('mjml');
const NotFoundError = require('../utils/errors/not-found-error');
const InternalServerError = require('../utils/errors/internal-server-error');
const AppError = require('../utils/errors/app-error');

class EmailTemplateService {
    constructor() {
        this.templatePath = path.join(__dirname, '../utils/templates');
        this.templates = {
            welcome: 'welcome-template',
            otp: 'otp-template',
        };
        this.compiledTemplates = {};
    }

    async getTemplate({templateName, data = null}) {
        try {
            if (!this.templates[templateName]) {
                throw new NotFoundError(`Template ${templateName}`);
            }

            if (!this.compiledTemplates[templateName]) {
                const templatePath = `${this.templatePath}/${this.templates[templateName]}.mjml`;
                const template = await fs.readFile(templatePath, 'utf8');
                this.compiledTemplates[templateName] = handlebars.compile(template);
            }

            const mjmlTemplate = this.compiledTemplates[templateName](data);
            return mjml(mjmlTemplate).html;
        } catch (error) {
            console.error(error);
            if (error instanceof AppError) {
                throw error;
            } else {
                throw new InternalServerError();
            }
        }
    }
}

module.exports = EmailTemplateService;