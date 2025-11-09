import mysql, { FieldPacket, Connection } from "mysql2/promise"

interface ConnectionParameters {
  database: string
  host: string
  port?: number
  user: string
  password: string
  [key: string]: any
}

interface QueryResult {
  rows: any[]
  fields: FieldPacket[]
  error: any
}

async function getData({
  query,
  connectionParameters,
}: {
  query: string
  connectionParameters: ConnectionParameters
}): Promise<QueryResult | undefined> {
  const { database, host, port = 3306, user } = connectionParameters
  let connection: Connection | null = null

  try {
    connection = await mysql.createConnection(connectionParameters)
    console.log(
      `::: MySQL: Connected to server "${host}:${port}" as user "${user}"!`
    )

    const [rows, fields] = (await connection.execute(query)) as [
      any[],
      FieldPacket[]
    ]
    console.log(
      `::: MySQL: Collected ${rows.length} items from the "${database}" database!`
    )

    return { rows, fields, error: null }
  } catch (error) {
    console.error(`::: MySQL: ERROR => ${error}`)
    return { rows: [], fields: [], error }
  } finally {
    if (connection) {
      await connection.end()
      console.log(`::: MySQL: Disconnected from server "${host}:${port}"!`)
    }
  }
}

export default getData
