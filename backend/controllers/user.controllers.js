import uploadOnCloudinary from "../config/cloudinary.js"
import geminiResponse from "../gemini.js";
import User from "../models/user.model.js"; 
import moment from "moment";
export const getCurrentUser = async (req, res) => {
    try {
        const currentUser = await User.findById(req.userId).select("-password")
        if (!currentUser) {
            return res.status(404).json({ message: "user not found" })
        }

        return res.status(200).json(currentUser)
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "current user error" })
    }
}

export const updateAssistant=async (req,res)=>{
  try {
    const {assistantName,imageUrl}=req.body
    let assistantImage;
    if(req.file){
      assistantImage=await uploadOnCloudinary(req.file.path)
    }else{
      assistantImage=imageUrl
    }

    if (!assistantName || !assistantImage) {
      return res.status(400).json({message:"assistant name and image are required"})
    }

    const user=await User.findByIdAndUpdate(req.userId,{
      assistantName,assistantImage
    },{new:true}).select("-password")
    return res.status(200).json(user)

  } catch (error) {
    return res.status(400).json({message:"updateAssistantError user error"})
  }
}





export const askToAssistant = async (req, res) => {
    try {
        const { command } = req.body;
        const user = await User.findById(req.userId);
        user.history.push(command)
        user.save()
        const userName = user.name;
        const assistantName = user.assistantName;
        
        const result = await geminiResponse(command,assistantName, userName);

        const jsonMatch = result.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            return res.status(400).json({ response: "sorry, i can't understand" });
        }
        
        const gemResult = JSON.parse(jsonMatch[0]);
        const type = gemResult.type;

        switch (type) {
            case 'get_date':
                return res.json({
                    type,
                    userInput: gemResult.userInput,
                    response: `current date is ${moment().format("YYYY-MM-DD")}`
                });
            case 'get_time':
                return res.json({
                    type,
                    userInput: gemResult.userInput,
                    response: `current time is ${moment().format("hh:mm A")}`
                });
            case 'get_day':
                return res.json({
                    type,
                    userInput: gemResult.userInput,
                    response: `today is ${moment().format("dddd")}`
                });
            case 'get_month':
                return res.json({
                    type,
                    userInput: gemResult.userInput,
                    response: `today is ${moment().format("MMMM")}`
                });
            case 'google_search':
            case 'youtube_search':
            case 'youtube_play':
            case 'general':
            case 'calculator_open':
            case 'instagram_open':
            case 'facebook_open':
            case 'open_website':
            case 'weather-show':
                return res.json({
                    type,
                    userInput: gemResult.userInput,
                    response: gemResult.response,
                    url: gemResult.url
                });
            default:
                return res.status(400).json({ response: "I didn't understand that command." });
        }
    } catch (error) {
        return res.status(500).json({ response: "ask assistant error" });
    }
};