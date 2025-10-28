const { MongoClient } = require("mongodb")

async function sendResults(dataToAdd, dataToDelete, mongo) {
  const qtyToAdd = !!dataToAdd ? dataToAdd.length : 0
  const qtyToDelete = !!dataToDelete ? dataToDelete.length : 0

  if (qtyToAdd === 0 && qtyToDelete === 0) {
    console.log(`::: Application: No data to send to MongoDB!`)
    return
  }

  const { db, collection, connectionParameters } = mongo
  const { uri, options } = connectionParameters
  const client = new MongoClient(uri, options)

  try {
    await client.connect()
    console.log(`::: MongoDB: Connected to server!`)

    if (qtyToDelete > 0) {
      await client
        .db(db)
        .collection(collection)
        .deleteMany({ _id: { $in: dataToDelete } })
      console.log(
        `::: MongoDB: Deleted ${dataToDelete.length} items from "${collection}" collection on "${db}" database!`
      )
    }

    if (qtyToAdd > 0) {
      await client
        .db(db)
        .collection(collection)
        .insertMany(dataToAdd, { ordered: false })
      console.log(
        `::: MongoDB: Inserted ${dataToAdd.length} items into "${collection}" collection on "${db}" database!`
      )
    }
  } catch (error) {
    console.error(`::: MongoDB: ERROR => ${error}`)
  } finally {
    await client.close()
    console.log(`::: MongoDB: Disconnected from server!`)
  }
}

module.exports = sendResults
