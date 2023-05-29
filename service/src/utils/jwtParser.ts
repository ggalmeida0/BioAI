const base64UrlDecode = (str: string) => {
  const preProcessedStr =
    str.replace(/-/g, '+').replace(/_/g, '/') +
    '='.repeat((4 - (str.length % 4)) % 4);

  return Buffer.from(preProcessedStr, 'base64').toString();
};

const parseJwt = (token: string) => {
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

export default parseJwt;
