// Firebase modules - using require due to potential typing issues
const admin = require("firebase-admin")
const firebase = require("firebase")
require("firebase/storage")

interface FirebaseConfig {
  fileRetention: number
  defaultPrefix: string
  [key: string]: any
}

interface FirebaseServiceAccount {
  [key: string]: any
}

interface FirebaseFile {
  name: string
  getMetadata(): Promise<any>
  delete(): Promise<void>
}

interface FirebaseData {
  retention: number
  prefix: string
  ref: any
  files: {
    items: FirebaseFile[]
  }
  filesNames: string[]
}

const firebaseData = async (
  firebaseConfig: FirebaseConfig,
  firebaseServiceAccount: FirebaseServiceAccount
): Promise<FirebaseData> => {
  const { fileRetention, defaultPrefix, ...config } = firebaseConfig

  try {
    firebase.initializeApp({
      ...config,
      credential: admin.credential.cert(firebaseServiceAccount),
    })
    const data: FirebaseData = {} as FirebaseData
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

export = firebaseData
