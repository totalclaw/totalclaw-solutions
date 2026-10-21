// 方案目录签名：ed25519，对 index.json 原始字节签名，签名以 base64 存为 index.json.sig。
import { createPrivateKey, createPublicKey, generateKeyPairSync, sign, verify } from 'node:crypto';

/** @param {Buffer} data @param {Buffer} signature @param {string|Buffer|import('node:crypto').KeyObject} publicKey PEM */
export function verifyIndexSignature(data, signature, publicKey) {
  try {
    return verify(null, data, typeof publicKey === 'object' && publicKey.type ? publicKey : createPublicKey(publicKey), signature);
  } catch {
    return false;
  }
}

/** @returns {string} base64 签名 */
export function signIndex(data, privateKeyPem) {
  return sign(null, data, createPrivateKey(privateKeyPem)).toString('base64');
}

/** 生成 ed25519 密钥对（PEM）。私钥只放发布机 / CI 密钥库，绝不入库。 */
export function generateSigningKeyPair() {
  const { publicKey, privateKey } = generateKeyPairSync('ed25519');
  return {
    publicKey: publicKey.export({ type: 'spki', format: 'pem' }).toString(),
    privateKey: privateKey.export({ type: 'pkcs8', format: 'pem' }).toString(),
  };
}
