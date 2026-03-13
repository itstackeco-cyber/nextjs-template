const useTranslations = () => (key) => key;
const useLocale = () => "en";
const NextIntlClientProvider = ({ children }) => children;

module.exports = { useTranslations, useLocale, NextIntlClientProvider };
