import mongoose from 'mongoose'
import { Schema } from 'mongoose'
import findOrCreate from 'mongoose-findorcreate'

const required = type => ({ type, required: true })

const userSchema = new Schema({
  githubId: Schema.Types.String,
  login: required(Schema.Types.String),
  name: required(Schema.Types.String),
  email: required(Schema.Types.String),
  avatar_url: String,
  bio: String,
  blog: String,
  location: String,
  hireable: String,
  company: String,
  html_url: String,
  type: required(Schema.Types.String),
  site_admin: required(Schema.Types.Boolean),
  public_repos: required(Schema.Types.Number),
  public_gists: required(Schema.Types.Number),
  followers: required(Schema.Types.Number),
  following: required(Schema.Types.Number),
  disk_usage: required(Schema.Types.Number),
  collaborators: required(Schema.Types.Number),
  created_at: required(Schema.Types.Date),
  updated_at: required(Schema.Types.Date)
})

userSchema.plugin(findOrCreate)

const User = mongoose.model('User', userSchema)

export default User
