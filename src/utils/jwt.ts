import fs from 'fs';
import path from 'path';
import jwt, { SignOptions, JwtPayload } from 'jsonwebtoken';
import ApiError from './apiError';
import HttpStatus from './httpStatus';
import env from '../config/env';

let cachedPrivateKey: string | null = null;
let cachedPublicKey: string | null = null;

const projectRoot = process.cwd();

function loadKey(absolutePath: string, label: string): string {
  try {
    return fs.readFileSync(absolutePath, 'utf8');
  } catch {
    throw new Error(
      `Unable to read ${label} at ${absolutePath}. Run "npm run keys" first to generate the RSA keypair.`,
    );
  }
}

export function getPrivateKey(): string {
  if (cachedPrivateKey) return cachedPrivateKey;
  cachedPrivateKey = loadKey(path.resolve(projectRoot, env.jwt.privateKeyPath), 'JWT private key');
  return cachedPrivateKey;
}

export function getPublicKey(): string {
  if (cachedPublicKey) return cachedPublicKey;
  cachedPublicKey = loadKey(path.resolve(projectRoot, env.jwt.publicKeyPath), 'JWT public key');
  return cachedPublicKey;
}

export interface TokenPayload {
  userId: string;
  email: string;
}

export interface DecodedToken extends JwtPayload, TokenPayload {}

export function signAccessToken(payload: TokenPayload, jti: string): string {
  const privateKey = getPrivateKey();
  const signOptions: SignOptions = {
    algorithm: 'RS256',
    expiresIn: env.jwt.accessTokenTtl,
    issuer: env.jwt.issuer,
    audience: env.jwt.audience,
  };

  return jwt.sign({ ...payload, jti }, privateKey, signOptions);
}

export function verifyAccessToken(token: string): DecodedToken {
  const publicKey = getPublicKey();
  try {
    const decoded = jwt.verify(token, publicKey, {
      algorithms: ['RS256'],
      issuer: env.jwt.issuer,
      audience: env.jwt.audience,
    }) as DecodedToken;
    return decoded;
  } catch (err) {
    const message = err instanceof jwt.TokenExpiredError ? 'Token expired' : 'Invalid token';
    throw new ApiError(message, HttpStatus.UNAUTHORIZED);
  }
}

export function decodeTokenSafely(token: string): JwtPayload | null {
  try {
    return jwt.decode(token) as JwtPayload;
  } catch {
    return null;
  }
}
