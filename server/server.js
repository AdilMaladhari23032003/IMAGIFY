import 'dotenv/config';
import express from 'express'
import cors from 'cors'
import dns from 'dns'
import userRouter from './routes/userRoutes.js';
import connectDB from './configs/mongodb.js';
import imageRouter from './routes/imageRoutes.js';

// Force IPv4 for DNS lookup to prevent ENETUNREACH IPv6 errors
if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder('ipv4first');
}

// App Config
const PORT = process.env.PORT || 4000
const app = express();
await connectDB()

// Intialize Middlewares
app.use(express.json())
app.use(cors({
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'token'],
    credentials: true
}))

// API routes
app.use('/api/user',userRouter)
app.use('/api/auth',userRouter)
app.use('/api/image',imageRouter)

app.get('/', (req,res) => res.send("API Working"))

app.listen(PORT, () => console.log('Server running on port ' + PORT));
