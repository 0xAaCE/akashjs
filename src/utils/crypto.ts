import crypto from 'crypto';

export const nodeCrypto = {
    ...crypto.webcrypto.subtle,
    getAlgorithmParameters: (algorithmName: string, operation: string) => ({
        algorithm: algorithmName,
        usages: ["sign", "encrypt", "generateKey", "importKey", "exportKey", "verify"]
    }),
    getRandomValues: crypto.webcrypto.getRandomValues,
}