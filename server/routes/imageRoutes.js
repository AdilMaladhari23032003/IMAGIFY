import express from 'express'
import { generateImage, getUserImages } from '../controllers/imageController.js'
import authUser from '../middlewares/auth.js'

const imageRouter = express.Router()

imageRouter.post('/generate-image', authUser, generateImage)
imageRouter.get('/history', authUser, getUserImages)

export default imageRouter