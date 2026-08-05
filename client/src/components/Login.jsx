import React, { useContext, useEffect, useState } from 'react'
import { assets } from '../assets/assets'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { motion } from 'framer-motion'
import { signInWithPopup } from 'firebase/auth'
import { auth, googleProvider } from '../config/firebase'

const Login = () => {

    const [state, setState] = useState('Login')
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [otp, setOtp] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [googleLoading, setGoogleLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    const { backendUrl, setShowLogin, setToken, setUser } = useContext(AppContext)

    const handleGoogleLogin = async () => {
        if (googleLoading) return
        setGoogleLoading(true)
        try {
            const result = await signInWithPopup(auth, googleProvider)
            const user = result.user
            const idToken = await user.getIdToken()

            const { data } = await axios.post(backendUrl + '/api/auth/google-login', {
                email: user.email,
                name: user.displayName,
                idToken
            }, { timeout: 60000 })

            if (data.success) {
                setToken(data.token)
                setUser(data.user)
                localStorage.setItem('token', data.token)
                setShowLogin(false)
                toast.success('Successfully logged in with Google!')
            } else {
                toast.error(data.message || 'Google login failed')
            }
        } catch (error) {
            console.error('Google Auth Error:', error)
            if (error.code === 'auth/popup-closed-by-user') {
                toast.info('Google sign-in popup was closed')
            } else if (error.code === 'auth/cancelled-popup-request') {
                // Ignore duplicate popup requests
            } else {
                toast.error(error.message || 'Failed to sign in with Google')
            }
        } finally {
            setGoogleLoading(false)
        }
    }

    const onSubmitHandler = async (e) => {
        e.preventDefault()

        if (loading) return
        setLoading(true)

        try {

            if (state === 'Login') {

                const { data } = await axios.post(backendUrl + '/api/user/login', { email, password }, { timeout: 60000 })

                if (data.success) {
                    setToken(data.token)
                    setUser(data.user)
                    localStorage.setItem('token', data.token)
                    setShowLogin(false)
                } else {
                    toast.error(data.message)
                }

            } else if (state === 'Sign Up') {

                const { data } = await axios.post(backendUrl + '/api/user/register', { name, email, password }, { timeout: 60000 })

                if (data.success) {
                    setToken(data.token)
                    setUser(data.user)
                    localStorage.setItem('token', data.token)
                    setShowLogin(false)
                } else {
                    toast.error(data.message)
                }

            } else if (state === 'Forgot Password') {

                const { data } = await axios.post(backendUrl + '/api/user/send-reset-otp', { email }, { timeout: 60000 })

                if (data.success) {
                    toast.success(data.message)
                    setState('Reset Password')
                } else {
                    toast.error(data.message)
                }

            } else if (state === 'Reset Password') {

                const { data } = await axios.post(backendUrl + '/api/user/reset-password', { email, otp, newPassword }, { timeout: 60000 })

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

                {(state === 'Login' || state === 'Sign Up') && (
                    <>
                        <button
                            type='button'
                            onClick={handleGoogleLogin}
                            disabled={googleLoading || loading}
                            className='w-full border border-gray-300 py-2 px-4 rounded-full flex items-center justify-center gap-3 text-slate-700 hover:bg-gray-50 transition-colors shadow-sm cursor-pointer select-none font-medium text-sm mb-4'
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                            </svg>
                            {googleLoading ? 'Connecting to Google...' : 'Continue with Google'}
                        </button>

                        <div className='flex items-center my-4 text-xs text-slate-400 uppercase tracking-wider'>
                            <div className='flex-1 border-t border-gray-200'></div>
                            <span className='px-3 font-medium text-slate-400 lowercase'>or continue with email</span>
                            <div className='flex-1 border-t border-gray-200'></div>
                        </div>
                    </>
                )}

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
                    <span onClick={() => setShowPassword(!showPassword)} className='cursor-pointer text-slate-400 hover:text-slate-600 select-none'>
                        {showPassword ? (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        )}
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
                            <span onClick={() => setShowPassword(!showPassword)} className='cursor-pointer text-slate-400 hover:text-slate-600 select-none'>
                                {showPassword ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                )}
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