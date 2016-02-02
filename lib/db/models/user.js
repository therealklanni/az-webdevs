import mongoose from 'mongoose'
import { Schema } from 'mongoose'
import findOrCreate from 'mongoose-findorcreate'

const userSchema = new Schema({
  githubId: Schema.Types.String,
  username: Schema.Types.String,
  name: Schema.Types.String,
  email: Schema.Types.String,
  avatar_url: String,
  bio: String,
  blog: String,
  location: String,
  hireable: String,
  company: String,
  html_url: String,
  type: Schema.Types.String,
  site_admin: Schema.Types.Boolean,
  public_repos: Schema.Types.Number,
  public_gists: Schema.Types.Number,
  followers: Schema.Types.Number,
  following: Schema.Types.Number,
  disk_usage: Schema.Types.Number,
  collaborators: Schema.Types.Number,
  created_at: Schema.Types.Date,
  updated_at: Schema.Types.Date
})

userSchema.plugin(findOrCreate)

const User = mongoose.model('User', userSchema)

export default User
