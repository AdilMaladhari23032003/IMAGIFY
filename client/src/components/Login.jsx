import React, { useContext, useEffect, useState } from 'react'
import { assets } from '../assets/assets'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { motion } from 'framer-motion'

const Login = () => {

    const [state, setState] = useState('Login')
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [otp, setOtp] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    const { backendUrl, setShowLogin, setToken, setUser } = useContext(AppContext)

    const onSubmitHandler = async (e) => {
        e.preventDefault()

        if (loading) return
        setLoading(true)

        try {

            if (state === 'Login') {

                const { data } = await axios.post(backendUrl + '/api/user/login', { email, password }, { timeout: 15000 })

                if (data.success) {
                    setToken(data.token)
                    setUser(data.user)
                    localStorage.setItem('token', data.token)
                    setShowLogin(false)
                } else {
                    toast.error(data.message)
                }

            } else if (state === 'Sign Up') {

                const { data } = await axios.post(backendUrl + '/api/user/register', { name, email, password }, { timeout: 15000 })

                if (data.success) {
                    setToken(data.token)
                    setUser(data.user)
                    localStorage.setItem('token', data.token)
                    setShowLogin(false)
                } else {
                    toast.error(data.message)
                }

            } else if (state === 'Forgot Password') {

                const { data } = await axios.post(backendUrl + '/api/user/send-reset-otp', { email }, { timeout: 15000 })

                if (data.success) {
                    toast.success(data.message)
                    setState('Reset Password')
                } else {
                    toast.error(data.message)
                }

            } else if (state === 'Reset Password') {

                const { data } = await axios.post(backendUrl + '/api/user/reset-password', { email, otp, newPassword }, { timeout: 15000 })

                if (data.success) {
                    toast.success(data.message)
                    setState('Login')
                    setOtp('')
                    setNewPassword('')
                } else {
                    toast.error(data.message)
                }
            }

        } catch (error) {
            if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
                toast.error('Request timed out. Please check your connection and try again.')
            } else if (error.code === 'ERR_NETWORK' || !error.response) {
                toast.error('Network error. Please check your internet connection.')
            } else {
                toast.error(error.response?.data?.message || error.message || 'Something went wrong.')
            }
        } finally {
            setLoading(false)
        }
    }



    useEffect(() => {
        // Disable scrolling on body when the login is open
        document.body.style.overflow = 'hidden';

        // Cleanup function to re-enable scrolling
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    return (
        <div className=' absolute top-0 left-0 right-0 bottom-0 z-10 backdrop-blur-sm bg-black/30 flex justify-center items-center'>
            <motion.form onSubmit={onSubmitHandler} className='relative bg-white p-10 rounded-xl text-slate-500 w-96'
                initial={{ opacity: 0.2, y: 50 }}
                transition={{ duration: 0.3 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
            >

                <h1 className='text-center text-2xl text-neutral-700 font-medium'>{state}</h1>

                <p className='text-sm text-center mt-1 mb-6'>
                    {state === 'Login' && 'Welcome back! Please sign in to continue'}
                    {state === 'Sign Up' && 'Create a new account to get started'}
                    {state === 'Forgot Password' && 'Enter your email to receive OTP'}
                    {state === 'Reset Password' && 'Enter the OTP and your new password'}
                </p>

                {state === 'Sign Up' && <div className='border px-6 py-2 flex items-center gap-2 rounded-full mt-5'>
                    <img src={assets.email_icon} alt="" />
                    <input onChange={e => setName(e.target.value)} value={name} className='outline-none text-sm w-full' type="text" placeholder='Full Name' required />
                </div>}

                {(state === 'Login' || state === 'Sign Up' || state === 'Forgot Password' || state === 'Reset Password') && <div className='border px-6 py-2 flex items-center gap-2 rounded-full mt-4'>
                    <img src={assets.email_icon} alt="" />
                    <input onChange={e => setEmail(e.target.value)} value={email} className='outline-none text-sm w-full' type="email" placeholder='Email id' required disabled={state === 'Reset Password'} />
                </div>}

                {(state === 'Login' || state === 'Sign Up') && <div className='border px-6 py-2 flex items-center gap-2 rounded-full mt-4'>
                    <img src={assets.lock_icon} alt="" />
                    <input onChange={e => setPassword(e.target.value)} value={password} className='outline-none text-sm w-full' type={showPassword ? "text" : "password"} placeholder='Password' required />
                    <span onClick={() => setShowPassword(!showPassword)} className='cursor-pointer text-xs text-slate-400 hover:text-slate-600 select-none'>
                        {showPassword ? 'Hide' : 'Show'}
                    </span>
                </div>}

                {state === 'Reset Password' && (
                    <>
                        <div className='border px-6 py-2 flex items-center gap-2 rounded-full mt-4'>
                            <img src={assets.lock_icon} alt="" />
                            <input onChange={e => setOtp(e.target.value)} value={otp} className='outline-none text-sm w-full' type="text" placeholder='6-Digit OTP' required />
                        </div>
                        <div className='border px-6 py-2 flex items-center gap-2 rounded-full mt-4'>
                            <img src={assets.lock_icon} alt="" />
                            <input onChange={e => setNewPassword(e.target.value)} value={newPassword} className='outline-none text-sm w-full' type={showPassword ? "text" : "password"} placeholder='New Password' required />
                            <span onClick={() => setShowPassword(!showPassword)} className='cursor-pointer text-xs text-slate-400 hover:text-slate-600 select-none'>
                                {showPassword ? 'Hide' : 'Show'}
                            </span>
                        </div>
                    </>
                )}

                {state === 'Login' && <p onClick={() => setState('Forgot Password')} className='text-sm text-blue-600 my-4 cursor-pointer'>Forgot password?</p>}

                {state === 'Forgot Password' && <p onClick={() => setState('Login')} className='text-sm text-blue-600 my-4 cursor-pointer'>Back to Login</p>}
                {state === 'Reset Password' && <p onClick={() => setState('Forgot Password')} className='text-sm text-blue-600 my-4 cursor-pointer'>Resend OTP</p>}

                <button
                    disabled={loading}
                    className={`w-full text-white py-2 rounded-full mt-4 transition-opacity ${loading ? 'bg-blue-400 opacity-70 cursor-not-allowed' : 'bg-blue-600'}`}
                >
                    {loading ? 'Please wait...' : (
                        <>
                            {state === 'Login' && 'Login'}
                            {state === 'Sign Up' && 'Create Account'}
                            {state === 'Forgot Password' && 'Send OTP'}
                            {state === 'Reset Password' && 'Reset Password'}
                        </>
                    )}
                </button>

                {state === "Login" && <p className='mt-5 text-center'>Don't have an account? <span onClick={() => setState('Sign Up')} className='text-blue-600 cursor-pointer'>Sign up</span></p>}
                {state === "Sign Up" && <p className='mt-5 text-center'>Already have an account? <span onClick={() => setState('Login')} className='text-blue-600 cursor-pointer'>Login</span></p>}

                <img onClick={() => setShowLogin(false)} className=' absolute top-5 right-5 cursor-pointer' src={assets.cross_icon} alt="" />
            </motion.form>
        </div>
    )
}

export default Login