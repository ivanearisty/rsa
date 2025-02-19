import RSAEncryptionApp from "@/components/rsa-encryption-app"

export default function Home() {
  return (
    <main className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">RSA Encryption</h1>
      <RSAEncryptionApp />
    </main>
  )
}

