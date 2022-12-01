import { CryptoEngine } from 'pkijs';
import crypto from 'crypto';

export default new CryptoEngine({
    crypto: crypto.webcrypto as any,
    name: 'nodeEngine'
});
