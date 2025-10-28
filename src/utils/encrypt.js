const HmacMD5 = require(`crypto-js/hmac-md5`)
const AES = require("crypto-js/aes")

const encrypt = (type, message, key) => {
  switch (type) {
    case "MD5":
      return HmacMD5(message, key).toString()
    case "AES":
      return AES.encrypt(message, key).toString()

    default:
      throw Error(`::: CRYPTO: Wrong cypher selection!`)
  }
}

module.exports = encrypt
