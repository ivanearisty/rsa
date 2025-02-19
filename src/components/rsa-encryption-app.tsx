"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Copy } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  generateRSAKeyPair,
  importPublicKey,
  importPrivateKey,
  encryptWithPublicKey,
  decryptWithPrivateKey,
} from "@/lib/rsa";
import { FieldLabel } from "./field-label";

export default function RSAEncryptionApp() {
  const [keySize, setKeySize] = useState("2048");
  const [publicKeyPEM, setPublicKeyPEM] = useState("");
  const [privateKeyPEM, setPrivateKeyPEM] = useState("");
  const [encryptText, setEncryptText] = useState("");
  const [encryptedText, setEncryptedText] = useState("");
  const [decryptText, setDecryptText] = useState("");
  const [decryptedText, setDecryptedText] = useState("");
  const { toast } = useToast();

  const decryptedTextAreaRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    if (decryptedTextAreaRef.current) {
      decryptedTextAreaRef.current.style.height = "auto";
      decryptedTextAreaRef.current.style.height = `${decryptedTextAreaRef.current.scrollHeight}px`;
    }
  }, [decryptedText]);
  
  const handleGenerateKeys = async () => {
    try {
      const keys = await generateRSAKeyPair(parseInt(keySize, 10));
      setPublicKeyPEM(keys.publicKeyPEM);
      setPrivateKeyPEM(keys.privateKeyPEM);
      toast({ title: "Keys generated successfully" });
    } catch (error: any) {
      console.error("Key generation failed:", error);
      toast({
        title: "Key Generation Error",
        description: error.message || "Error generating keys",
        variant: "destructive",
      });
    }
  };

  const handleEncrypt = async () => {
    try {
      const publicKey = await importPublicKey(publicKeyPEM);
      const ciphertext = await encryptWithPublicKey(publicKey, encryptText);
      setEncryptedText(ciphertext);
      toast({ title: "Encryption successful" });
    } catch (error: any) {
      console.error("Encryption failed:", error);
      toast({
        title: "Encryption Error",
        description: error.message || "Encryption error",
        variant: "destructive",
      });
    }
  };

  const handleDecrypt = async () => {
    try {
      const privateKey = await importPrivateKey(privateKeyPEM);
      const decrypted = await decryptWithPrivateKey(privateKey, decryptText);
      setDecryptedText(decrypted);
      toast({ title: "Decryption successful" });
    } catch (error: any) {
      console.error("Decryption failed:", error);
      toast({
        title: "Decryption Error",
        description: error.message || "Decryption error",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "The text has been copied to your clipboard.",
    });
  };

  return (
    <div>
      <div className="flex justify-center items-center gap-4 p-10">
        <FieldLabel
          label="Encryption Strength"
          info="The higher the key size, the more secure the encryption is."
        />
        <Select value={keySize} onValueChange={setKeySize}>
          <SelectTrigger id="keySize" className="w-[180px]">
            <SelectValue placeholder="Select key size" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1024">1024</SelectItem>
            <SelectItem value="2048">2048</SelectItem>
            <SelectItem value="4096">4096</SelectItem>
          </SelectContent>
        </Select>
        <Button
          onClick={handleGenerateKeys}
          className="active:scale-95 transition-transform"
        >
          Generate Keys
        </Button>
        <ThemeToggle />
      </div>
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="publicKey">Public RSA Key</Label>
            <div className="flex gap-2 items-start">
              <Textarea
                id="publicKey"
                value={publicKeyPEM}
                onChange={(e) => setPublicKeyPEM(e.target.value)}
                placeholder="Public RSA Key"
                className="h-40 border border-black dark:border-white"
              />
              <Button
                size="icon"
                variant="ghost"
                className="self-start active:scale-95 transition-transform"
                onClick={() => copyToClipboard(publicKeyPEM)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div>
            <Label htmlFor="encryptText">Text to Encrypt</Label>
            <Textarea
              id="encryptText"
              value={encryptText}
              onChange={(e) => setEncryptText(e.target.value)}
              placeholder="Enter text to encrypt"
            />
          </div>
          <Button onClick={handleEncrypt} className="active:scale-95 transition-transform">
            Encrypt
          </Button>
          <div>
            <Label htmlFor="encryptedText">Encrypted Text</Label>
            <div className="flex gap-2 items-start">
              <Textarea
                id="encryptedText"
                value={encryptedText}
                readOnly
                placeholder="Encrypted text will appear here"
                className="border border-black dark:border-white"
              />
              <Button
                size="icon"
                variant="ghost"
                className="self-start active:scale-95 transition-transform"
                onClick={() => copyToClipboard(encryptedText)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <Label htmlFor="privateKey">Private RSA Key</Label>
            <Textarea
              id="privateKey"
              value={privateKeyPEM}
              onChange={(e) => setPrivateKeyPEM(e.target.value)}
              placeholder="Private RSA Key"
              className="h-40 border border-black dark:border-white"
            />
          </div>
          <div>
            <Label 
              htmlFor="decryptText"
              className="text-sm"
              >Text to Decrypt</Label>
            <Textarea
              id="decryptText"
              value={decryptText}
              onChange={(e) => setDecryptText(e.target.value)}
              placeholder="Enter text to decrypt"
            />
          </div>
          <Button onClick={handleDecrypt} className="active:scale-95 transition-transform">
            Decrypt
          </Button>
          <div>
            <Label htmlFor="decryptedText">Decrypted Text</Label>
            <div className="flex gap-2 items-start">
              <Textarea
                id="decryptedText"
				        ref={decryptedTextAreaRef}
                value={decryptedText}
                readOnly
                placeholder="Decrypted text will appear here"
                className="border border-black dark:border-white"
              />
              <Button
                size="icon"
                variant="ghost"
                className="self-start active:scale-95 transition-transform"
                onClick={() => copyToClipboard(decryptedText)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
