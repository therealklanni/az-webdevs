import bug from 'debug'
const debug = bug('SIR:db')

// import mongo from './mongo'
import users from './models/user'

const paths = { users }

// Create
const create = (path, data) => {
  const Model = paths[path]

  return new Promise((res, rej) => {
    Model.create(data)
      .then(res)
      .onReject(rej)
  })
}

// Read
const read = (path, id) => {
  const Model = paths[path]

  return new Promise((res, rej) => {
    if (id) {
      Model.findById(id, (err, doc) => {
        if (err) return rej(err)
        res(doc)
      })
    } else {
      Model.find((err, docs) => {
        if (err) return rej(err)
        res(docs)
      })
    }
  })
}

// Update
const update = (path, id, data) => {
  debug(data)
  return new Promise((res, rej) => {
    paths[path].findByIdAndUpdate(id, data, { new: true }, (err, doc) => {
      if (err) return rej(err)
      res(doc)
    })
  })
}

// Delete
const del = (path, id) => {
  return new Promise((res, rej) => {
    paths[path].findByIdAndRemove(id, (err, doc) => {
      if (err) return rej(err)
      res(doc)
    })
  })
}

export default { create, read, update, del }
