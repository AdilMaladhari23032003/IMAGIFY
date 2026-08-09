import React, { useContext } from 'react'
import { assets } from '../assets/assets'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import UserAvatar from './UserAvatar'

const Navbar = () => {
    const { setShowLogin, user, credit, logout } = useContext(AppContext)
    const navigate = useNavigate()
    const location = useLocation()

    const isHomePage = location.pathname === '/'

    const handleLogout = () => {
        logout()
    }

    return (
        <div className='flex items-center justify-between py-4 animate-fade-in-scale'>
            {/* Left side: Logo & conditional "Back" button */}
            <div className='flex items-center gap-3 sm:gap-4'>
                <Link to='/'><img className='w-28 sm:w-32 lg:w-40 hover:opacity-90 transition-opacity' src={assets.logo} alt="Imagify Logo" /></Link>

                {!isHomePage && (
                    <button 
                        onClick={() => navigate('/')}
                        className='flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-gray-200/80 text-gray-700 hover:text-black hover:border-gray-300 hover:shadow-xs active:scale-95 transition-all duration-200 text-xs font-medium group cursor-pointer'
                    >
                        <svg className="w-3.5 h-3.5 text-gray-500 group-hover:text-black transition-transform group-hover:-translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                        </svg>
                        <span>Back</span>
                    </button>
                )}
            </div>

            {/* Right side: Full Navbar options on all pages */}
            <div>
                {user ? (
                    <div className='flex items-center gap-2 sm:gap-3'>
                        <button onClick={() => navigate('/my-history')} className='text-xs sm:text-sm font-medium text-gray-600 hover:text-black transition-colors px-2 py-1.5 sm:py-3 cursor-pointer'>
                            My History
                        </button>
                        <button onClick={() => navigate('/buy')} className='flex items-center gap-2 bg-blue-100 px-4 sm:px-6 py-1.5 sm:py-3 rounded-full hover:scale-105 transition-all duration-300 cursor-pointer'>
                            <img className='w-5' src={assets.credit_star} alt="" />
                            <p className='text-xs sm:text-sm font-medium text-gray-600'>Credits left : {credit}</p>
                        </button>
                        <p className='text-gray-600 max-sm:hidden pl-4'>Hi, {user.name}</p>
                        <div className='relative group flex items-center py-1'>
                            <UserAvatar user={user} className='w-10 h-10 ring-2 ring-transparent group-hover:ring-blue-100 transition-all duration-200' />
                            <div className='absolute hidden group-hover:block top-full right-0 z-50 text-black pt-2 w-60'>
                                <div className='bg-white/95 backdrop-blur-md rounded-2xl border border-gray-100 shadow-xl shadow-gray-200/60 p-4 flex flex-col transition-all duration-200'>
                                    <div className='flex flex-col gap-1 pb-3 border-b border-gray-100'>
                                        <span className='text-xs font-medium text-gray-400'>Signed in as</span>
                                        <span className='text-sm font-bold text-gray-900 truncate' title={user.email || user.name}>
                                            {user.email || user.name}
                                        </span>
                                    </div>
                                    <div className='pt-2'>
                                        <button 
                                            onClick={handleLogout} 
                                            className='w-full text-left px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-red-50/80 transition-all duration-150 flex items-center justify-between group/btn cursor-pointer'
                                        >
                                            <span>Logout</span>
                                            <svg className="w-4 h-4 text-gray-400 group-hover/btn:text-red-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className='flex items-center gap-2 sm:gap-5'>
                        <p onClick={() => navigate('/buy')} className='cursor-pointer text-sm text-gray-700 hover:text-black transition-colors'>Pricing</p>
                        <button onClick={() => setShowLogin(true)} className='bg-zinc-800 text-white px-7 py-2 sm:px-10 sm:py-2 text-sm rounded-full hover:bg-black transition-colors cursor-pointer'>
                            Login
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Navbar