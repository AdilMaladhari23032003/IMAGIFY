import axios from 'axios'
import fs from 'fs'
import FormData from 'form-data'
import userModel from '../models/userModel.js'
import imageModel from '../models/imageModel.js'

// Controller function to generate image from prompt
// http://localhost:4000/api/image/generate-image
export const generateImage = async (req, res) => {

  try {

    const { userId, prompt } = req.body

    // Fetching User Details Using userId
    const user = await userModel.findById(userId)
    
    if (!user || !prompt) {
      return res.json({ success: false, message: 'Missing Details' })
    }

    // Checking User creditBalance
    if (user.creditBalance === 0 || userModel.creditBalance < 0) {
      return res.json({ success: false, message: 'No Credit Balance', creditBalance: user.creditBalance })
    }

    // Creation of new multi/part formdata
    const formdata = new FormData()
    formdata.append('prompt', prompt)

    // Calling Clipdrop API
    const { data } = await axios.post('https://clipdrop-api.co/text-to-image/v1', formdata, {
      headers: {
        'x-api-key': process.env.CLIPDROP_API,
      },
      responseType: "arraybuffer"
    })

    // Convertion of arrayBuffer to base64
    const base64Image = Buffer.from(data, 'binary').toString('base64');
    const resultImage = `data:image/png;base64,${base64Image}`

    // Save generated image record
    await imageModel.create({
      userId: user._id,
      prompt,
      imageUrl: resultImage,
      creditsUsed: 1
    })

    // Deduction of user credit 
    await userModel.findByIdAndUpdate(user._id, { creditBalance: user.creditBalance - 1 })

    // Sending Response
    res.json({ success: true, message: "Image Generated", resultImage, creditBalance: user.creditBalance - 1 })

  } catch (error) {
    console.log(error.message)
    if (error.response && error.response.data) {
      try {
        const errorText = Buffer.from(error.response.data).toString();
        console.log("Clipdrop API Error Details:", errorText);
      } catch (e) {
        // ignore conversion error
      }
    }
    res.json({ success: false, message: error.message })
  }
}

// Controller function to get image history for logged-in user
export const getUserImages = async (req, res) => {
  try {
    const { userId } = req.body
    const images = await imageModel.find({ userId }).sort({ date: -1 }).lean()
    res.json({ success: true, images })
  } catch (error) {
    console.log(error.message)
    res.json({ success: false, message: error.message })
  }
}