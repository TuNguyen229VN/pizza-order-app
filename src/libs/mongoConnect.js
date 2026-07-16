// libs/mongoConnect.js
import { MongoClient } from "mongodb"

if (!process.env.MONGO_URL) {
  throw new Error('Invalid/Missing environment variable: "MONGO_URL"')
}

const uri = process.env.MONGO_URL
const options = {
  maxPoolSize: 5, // giới hạn pool, quan trọng với M0
}

let client
let clientPromise

// Cache ở CẢ development và production, dùng chung pattern global
if (!global._mongoClientPromise) {
  client = new MongoClient(uri, options)
  global._mongoClientPromise = client.connect()
}
clientPromise = global._mongoClientPromise

export default clientPromise