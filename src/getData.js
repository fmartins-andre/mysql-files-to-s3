const mysql = require("mysql2/promise")

async function getData({ query, connectionParameters }) {
  const { database, host } = connectionParameters
  try {
    const connection = await mysql.createConnection(connectionParameters)
    console.log(`::: MySQL: Connected to server "${host}"!`)

    const [rows, fields, error] = await connection.execute(query)
    if (error) throw Error(error)
    console.log(
      `::: MySQL: Collected ${rows.length} items from the "${database}" database!`
    )

    return { rows, fields, error }
  } catch (error) {
    console.error(`::: MySQL: ERROR => ${error}`)
  } finally {
    console.log(`::: MySQL: Disconnected from server "${host}"!`)
  }
}

module.exports = getData
