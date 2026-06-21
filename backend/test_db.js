import mongoose from "mongoose"
import dotenv from "dotenv"
dotenv.config()
import User from "./models/user.model.js"

mongoose.connect(process.env.MONGODB_URL).then(async () => {
  const users = await User.find({})
  console.log(JSON.stringify(users, null, 2))
  process.exit(0)
})
