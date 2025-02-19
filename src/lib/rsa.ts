export interface RSAKeyPair {
  publicKey: CryptoKey;
  privateKey: CryptoKey;
  publicKeyPEM: string;
  privateKeyPEM: string;
}

/**
 * Convert an ArrayBuffer to a Base64 encoded string.
 */
export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return window.btoa(binary);
}

/**
 * Convert a Base64 encoded string to an ArrayBuffer.
 */
export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Export a public CryptoKey to PEM format.
 */
export async function exportPublicKeyToPEM(publicKey: CryptoKey): Promise<string> {
  const spki = await crypto.subtle.exportKey("spki", publicKey);
  const b64 = arrayBufferToBase64(spki);
  const pemHeader = "-----BEGIN PUBLIC KEY-----\n";
  const pemFooter = "\n-----END PUBLIC KEY-----";
  // Insert line breaks every 64 characters.
  const pemBody = b64.match(/.{1,64}/g)?.join("\n") || b64;
  return pemHeader + pemBody + pemFooter;
}

/**
 * Export a private CryptoKey to PEM format.
 */
export async function exportPrivateKeyToPEM(privateKey: CryptoKey): Promise<string> {
  const pkcs8 = await crypto.subtle.exportKey("pkcs8", privateKey);
  const b64 = arrayBufferToBase64(pkcs8);
  const pemHeader = "-----BEGIN PRIVATE KEY-----\n";
  const pemFooter = "\n-----END PRIVATE KEY-----";
  const pemBody = b64.match(/.{1,64}/g)?.join("\n") || b64;
  return pemHeader + pemBody + pemFooter;
}

/**
 * Helper: Convert a PEM formatted string to an ArrayBuffer.
 */
function pemToArrayBuffer(pem: string): ArrayBuffer {
  // Remove header, footer, and whitespace.
  const b64 = pem
    .replace(/-----BEGIN [^-]+-----/, "")
    .replace(/-----END [^-]+-----/, "")
    .replace(/\s/g, "");
  return base64ToArrayBuffer(b64);
}

/**
 * Import a public key (in PEM format) as a CryptoKey.
 */
export async function importPublicKey(pem: string): Promise<CryptoKey> {
  const binaryDer = pemToArrayBuffer(pem);
  return await crypto.subtle.importKey(
    "spki",
    binaryDer,
    {
      name: "RSA-OAEP",
      hash: "SHA-256",
    },
    true,
    ["encrypt"]
  );
}

/**
 * Import a private key (in PEM format) as a CryptoKey.
 */
export async function importPrivateKey(pem: string): Promise<CryptoKey> {
  const binaryDer = pemToArrayBuffer(pem);
  return await crypto.subtle.importKey(
    "pkcs8",
    binaryDer,
    {
      name: "RSA-OAEP",
      hash: "SHA-256",
    },
    true,
    ["decrypt"]
  );
}

/**
 * Generate an RSA-OAEP key pair.
 * @param keySize - Key modulus length (e.g., 2048 or 4096)
 */
export async function generateRSAKeyPair(keySize: number = 2048): Promise<RSAKeyPair> {
  const keyPair = (await crypto.subtle.generateKey(
    {
      name: "RSA-OAEP",
      modulusLength: keySize,
      publicExponent: new Uint8Array([1, 0, 1]), // 0x10001
      hash: "SHA-256",
    },
    true, // extractable keys
    ["encrypt", "decrypt"]
  )) as CryptoKeyPair;

  const publicKeyPEM = await exportPublicKeyToPEM(keyPair.publicKey);
  const privateKeyPEM = await exportPrivateKeyToPEM(keyPair.privateKey);

  return {
    publicKey: keyPair.publicKey,
    privateKey: keyPair.privateKey,
    publicKeyPEM,
    privateKeyPEM,
  };
}

/**
 * Encrypt a string message with a given public key.
 * Returns the ciphertext as a Base64 encoded string.
 * Throws a descriptive error if the message is too long or encryption fails.
 */
export async function encryptWithPublicKey(publicKey: CryptoKey, message: string): Promise<string> {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(message);

    // Determine the maximum allowed message length.
    const keyAlg = publicKey.algorithm as RsaHashedKeyAlgorithm;
    const modulusLengthBytes = keyAlg.modulusLength / 8;
    let hashLengthBytes: number;
    switch (keyAlg.hash.name) {
      case "SHA-1":
        hashLengthBytes = 20;
        break;
      case "SHA-256":
        hashLengthBytes = 32;
        break;
      case "SHA-384":
        hashLengthBytes = 48;
        break;
      case "SHA-512":
        hashLengthBytes = 64;
        break;
      default:
        hashLengthBytes = 32;
    }
    const maxMessageLength = modulusLengthBytes - 2 * hashLengthBytes - 2;

    if (data.byteLength > maxMessageLength) {
      const errorMsg = `Message is too long for the given key size. Maximum allowed is ${maxMessageLength} bytes, but got ${data.byteLength} bytes.`;
      console.error(errorMsg);
      throw new Error(errorMsg);
    }

    const encrypted = await crypto.subtle.encrypt(
      {
        name: "RSA-OAEP",
      },
      publicKey,
      data
    );
    return arrayBufferToBase64(encrypted);
  } catch (error: any) {
    console.error("Encryption error:", error);
    if (error.message.includes("Message is too long")) {
      throw error;
    }
    throw new Error("Encryption failed. Please verify that you are using the correct public key and that your message is valid.");
  }
}

/**
 * Decrypt a Base64 encoded ciphertext with a given private key.
 * Throws a descriptive error if decryption fails.
 */
export async function decryptWithPrivateKey(privateKey: CryptoKey, ciphertext: string): Promise<string> {
  try {
    const data = base64ToArrayBuffer(ciphertext);
    const decrypted = await crypto.subtle.decrypt(
      {
        name: "RSA-OAEP",
      },
      privateKey,
      data
    );
    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  } catch (error: any) {
    console.error("Decryption error:", error);
    throw new Error("Decryption failed. Please verify that you are using the correct private key and that the ciphertext is valid.");
  }
}
