import { FieldLabel } from "@/components/field-label"
import RSAEncryptionApp from "@/components/rsa-encryption-app"

export default function Home() {
  return (
    <main className="container mx-auto p-4">
      <div className="flex justify-center">
      <FieldLabel
        label="RSA Encryption"
        info={`
          1. Generate a public and private key pair.
          2. Send your public key to a friend.
          3. Your friend encrypts their message with your public key.
          4. Your friend sends you the encrypted message.
          5. Decrypt the message with your private key.
          `}
        className="text-3xl font-bold mb-6 text-center"
      />
      </div>
      <RSAEncryptionApp />
    </main>
  )
}
