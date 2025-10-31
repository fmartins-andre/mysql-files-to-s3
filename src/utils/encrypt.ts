import CryptoJS from "crypto-js"

export type EncryptionType = "MD5" | "AES"

export const encrypt = (
  type: EncryptionType,
  message: string,
  key: string
): string => {
  switch (type) {
    case "MD5":
      return CryptoJS.HmacMD5(message, key).toString()
    case "AES":
      return CryptoJS.AES.encrypt(message, key).toString()

    default:
      throw new Error(`::: CRYPTO: Wrong cypher selection!`)
  }
}
