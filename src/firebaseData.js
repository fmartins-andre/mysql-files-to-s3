const admin = require("firebase-admin")
const firebase = require("firebase")
require("firebase/storage")

const firebaseData = async (firebaseConfig, firebaseServiceAccount) => {
  const { fileRetention, defaultPrefix, ...config } = firebaseConfig

  try {
    firebase.initializeApp({
      ...config,
      credential: admin.credential.cert(firebaseServiceAccount),
    })
    const data = {}
    data.retention = fileRetention
    data.prefix = defaultPrefix
    data.ref = firebase.storage().ref()
    data.files = await data.ref.child(data.prefix).list()
    data.filesNames = data.files.items.map(item => item.name)

    return data
  } catch (error) {
    console.log(
      `::: Firebase: ERROR => Error getting firebase up: ${JSON.stringify(
        error
      )}`
    )
    process.exit()
  }
}

module.exports = firebaseData
