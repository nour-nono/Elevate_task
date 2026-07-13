import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const keysDir = path.resolve(process.cwd(), 'keys');
const privatePath = path.join(keysDir, 'private.pem');
const publicKeyPath = path.join(keysDir, 'public.pem');

function main(): void {
  if (fs.existsSync(privatePath) && fs.existsSync(publicKeyPath)) {
    console.log('RSA keypair already exists at:');
    console.log(`  ${privatePath}`);
    console.log(`  ${publicKeyPath}`);
    console.log('Remove them and re-run this script to regenerate.');
    return;
  }

  fs.mkdirSync(keysDir, { recursive: true });

  const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  });

  fs.writeFileSync(privatePath, privateKey, { mode: 0o600 });
  fs.writeFileSync(publicKeyPath, publicKey, { mode: 0o644 });

  console.log('\nKeypair generated successfully:');
  console.log(`  Private key: ${privatePath}`);
  console.log(`  Public key : ${publicKeyPath}`);
}

main();
