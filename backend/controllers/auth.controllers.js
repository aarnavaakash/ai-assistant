import genToken from "../config/token.js"
import User from "../models/user.model.js"
import bcrypt from "bcryptjs"
export const signUp=async(req,res)=>{
    try {
        const {name,email,password}=req.body

        const existEmail=await User.findOne({email})
        if(existEmail){
            return res.status(400).json({message:"email already exists!"})
        }
        if(password.length<6){
            return res.status(400).json({message:"password atleast 6 char!"})
        }

        const hashedPassword=await bcrypt.hash(password,10)

        const newUser=await User.create({
            name,password:hashedPassword,email
        })
        const token=await genToken(newUser._id)

        res.cookie("token",token,{
            httpOnly:true,
            maxAge:7*24*60*60*1000,
            sameSite:"None",
            secure:true

        })
        return res.status(201).json(newUser)
    } catch (error) {
         return res.status(500).json({message:`signup error ${error.message}`})
    }
}

export const Login=async(req,res)=>{
    try {
        const {email,password}=req.body

        const existingUser=await User.findOne({email})
        if(!existingUser){
            return res.status(400).json({message:"email doesnot exists!"})
        }

        const isMach=await bcrypt.compare(password,existingUser.password)

        if(!isMach){
            return res.status(400).json({message:"incorrect password!"})
        }

        const token=await genToken(existingUser._id)

        res.cookie("token",token,{
            httpOnly:true,
            maxAge:7*24*60*60*1000,
            sameSite:"strict",
            secure:false

        })
        return res.status(200).json(existingUser)
    } catch (error) {
         return res.status(500).json({message:`login error ${error.message}`})
    }
}

export const logOut=async(req,res)=>{
    try {
        res.clearCookie("token",{
            httpOnly:true,
            sameSite:"strict",
            secure:false
        })
        return res.status(200).json({message:"Logout sucess"})
    } catch (error) {
        return res.status(500).json({message:"logout error"})
    }
}
