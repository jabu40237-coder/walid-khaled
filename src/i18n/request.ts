import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ locale }) => {
  // Dynamically import locale messages
  const messages = (await import(`./messages/${locale}.json`)).default;
  return { messages };
});
