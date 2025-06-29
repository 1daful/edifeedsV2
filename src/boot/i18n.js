import { createI18n } from 'vue-i18n';
const messages = {
    en: {
        welcome: 'Welcome',
        hello: 'Hello World'
    },
    fr: {
        welcome: 'Bienvenue',
        hello: 'Bonjour le monde'
    }
};
export default async ({ app }) => {
    const i18n = createI18n({
        locale: 'en',
        fallbackLocale: 'en',
        messages
    });
    app.use(i18n);
};
