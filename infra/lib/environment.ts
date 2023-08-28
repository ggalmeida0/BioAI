export type Environment = {
  googleClientId: string;
  isDevEnv: boolean;
  oAuthCallbackUrls: string[];
  openAiOrgId: string;
};

export function getFromEnvironment(): Environment {
  const googleClientId = process.env['GOOGLE_CLIENT_ID'];
  const isDevEnv = !!process.env.IS_DEV_ENV;
  const openAiOrgId = process.env.OPENAI_ORG_ID;
  const oAuthCallbackUrls = process.env.OAUTH_CALLBACK_URLS?.split(',');
  if (googleClientId == null) {
    throw new Error('Please set GOOGLE_CLIENT_ID. More details in README.md');
  }
  if (oAuthCallbackUrls == null) {
    throw new Error('Please set OAUTH_CALLBACK_URL. More details in README.md');
  }
  if (openAiOrgId == null) {
    throw new Error('Please set OPENAI_ORG_ID. More details in README.md');
  }
  return { googleClientId, isDevEnv, oAuthCallbackUrls, openAiOrgId };
}
