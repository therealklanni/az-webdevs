import bug from 'debug'
import mongoose from 'mongoose'
const debug = bug('SIR:mongo')

mongoose.connect(process.env.MONGO_DB || 'mongodb://localhost/azwebdevs')

const db = mongoose.connection

db.on('error', console.error.bind(console, 'connection error: '))

db.once('open', () => {
  debug('MongoDB connected')
})

export default db
