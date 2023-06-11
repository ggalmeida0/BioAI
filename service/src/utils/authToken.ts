import { APIGatewayProxyEventV2 } from 'aws-lambda';
import UnauthorizedError from '../errors/UnauthorizedError';

const authorizedIssuers = [
  'https://cognito-idp.eu-west-1.amazonaws.com/eu-west-1_123456789',
];

const base64UrlDecode = (str: string) => {
  const preProcessedStr =
    str.replace(/-/g, '+').replace(/_/g, '/') +
    '='.repeat((4 - (str.length % 4)) % 4);

  return Buffer.from(preProcessedStr, 'base64').toString();
};
export const parseJwt = (token: string) => {
  try {
    const [headerEncoded, payloadEncoded] = token.split('.');

    const headerStr = base64UrlDecode(headerEncoded);
    const payloadStr = base64UrlDecode(payloadEncoded);

    const header = JSON.parse(headerStr);
    const payload = JSON.parse(payloadStr);

    return { header, payload };
  } catch (error) {
    console.error('Error decoding JWT', error);
    return null;
  }
};

export const getTokenFromAPIGWEvent = (event: APIGatewayProxyEventV2) => {
  const token = event.headers.authorization ?? event.headers.Authorization;
  if (!token) {
    throw new UnauthorizedError('No token found in request');
  }
  return token;
};
