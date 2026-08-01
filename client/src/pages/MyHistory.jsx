import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { motion } from 'framer-motion'

const MyHistory = () => {
  const { backendUrl, token } = useContext(AppContext)

  // Initialize state from localStorage cache for INSTANT loading (0ms wait)
  const [images, setImages] = useState(() => {
    try {
      const saved = localStorage.getItem('imagify_cached_images')
      return saved ? JSON.parse(saved) : []
    } catch (e) {
      return []
    }
  })

  const [transactions, setTransactions] = useState(() => {
    try {
      const saved = localStorage.getItem('imagify_cached_transactions')
      return saved ? JSON.parse(saved) : []
    } catch (e) {
      return []
    }
  })

  // Tab State: 'images' or 'credits'
  const [activeTab, setActiveTab] = useState('images')

  // Loading state: false if cache exists, true only if no cache is found
  const [loading, setLoading] = useState(() => {
    try {
      return !localStorage.getItem('imagify_cached_images')
    } catch (e) {
      return true
    }
  })

  const fetchHistory = async () => {
    if (!token) return

    // Asynchronous non-blocking background fetch
    try {
      const [imageRes, transRes] = await Promise.allSettled([
        axios.get(backendUrl + '/api/image/history', { headers: { token } }),
        axios.get(backendUrl + '/api/user/transactions', { headers: { token } })
      ])

      if (imageRes.status === 'fulfilled' && imageRes.value.data.success) {
        const fetchedImages = imageRes.value.data.images || []
        setImages(fetchedImages)
        try {
          localStorage.setItem('imagify_cached_images', JSON.stringify(fetchedImages))
        } catch (e) {
          // LocalStorage limit safety
        }
      }

      if (transRes.status === 'fulfilled' && transRes.value.data.success) {
        const fetchedTransactions = transRes.value.data.transactions || []
        setTransactions(fetchedTransactions)
        try {
          localStorage.setItem('imagify_cached_transactions', JSON.stringify(fetchedTransactions))
        } catch (e) {
          // LocalStorage limit safety
        }
      }

    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (token) {
      fetchHistory()
    } else {
      setLoading(false)
    }
  }, [token])

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A'
    return new Date(timestamp).toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short'
    })
  }

  // Filter transactions to only show purchased (paid) plans
  const purchasedTransactions = transactions.filter(item => item.payment === true)

  return (
    <motion.div 
      className='min-h-[80vh] pt-10 pb-16 px-4 max-w-6xl mx-auto'
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className='text-center mb-8'>
        <button className='border border-gray-400 px-8 py-2 rounded-full text-sm font-medium mb-4 text-gray-700 bg-white shadow-sm'>
          Activity Log
        </button>
        <h1 className='text-3xl sm:text-4xl font-semibold text-gray-800'>My History</h1>
        <p className='text-gray-500 text-sm mt-2'>View your generated images and purchased credits history</p>

        {/* Tab Buttons Navigation */}
        <div className='flex justify-center items-center gap-3 mt-6'>
          <button 
            onClick={() => setActiveTab('images')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
              activeTab === 'images' 
                ? 'bg-zinc-900 text-white shadow-md scale-105' 
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <span>🎨</span> Generated Images
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              activeTab === 'images' ? 'bg-zinc-700 text-white' : 'bg-gray-100 text-gray-600'
            }`}>
              {images.length}
            </span>
          </button>

          <button 
            onClick={() => setActiveTab('credits')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
              activeTab === 'credits' 
                ? 'bg-zinc-900 text-white shadow-md scale-105' 
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <span>💳</span> Purchased Credits
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              activeTab === 'credits' ? 'bg-zinc-700 text-white' : 'bg-gray-100 text-gray-600'
            }`}>
              {purchasedTransactions.length}
            </span>
          </button>
        </div>
      </div>

      {loading && images.length === 0 && transactions.length === 0 ? (
        /* Skeleton Grid Loader for cold starts */
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 py-8'>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div key={n} className='bg-white border rounded-xl overflow-hidden shadow-sm animate-pulse'>
              <div className='aspect-square bg-gray-200'></div>
              <div className='p-4 space-y-3'>
                <div className='h-4 bg-gray-200 rounded w-3/4'></div>
                <div className='h-3 bg-gray-100 rounded w-1/2'></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div>
          {/* TAB 1: Generated Images View */}
          {activeTab === 'images' && (
            <section className='mt-4'>
              {images.length === 0 ? (
                <div className='text-center py-16 bg-white/60 backdrop-blur rounded-2xl border border-dashed border-gray-300 shadow-sm'>
                  <p className='text-4xl mb-3'>🎨</p>
                  <p className='text-gray-700 font-medium text-lg'>No generated images found yet</p>
                  <p className='text-xs text-gray-400 mt-1'>Generate your first image to see it here!</p>
                </div>
              ) : (
                <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
                  {images.map((item, index) => (
                    <div key={item._id || index} className='bg-white border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col group'>
                      <div className='aspect-square bg-gray-100 relative overflow-hidden'>
                        <img 
                          src={item.imageUrl} 
                          alt={item.prompt} 
                          loading="lazy" 
                          className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-300' 
                        />
                        <a 
                          href={item.imageUrl} 
                          download={`image-${index + 1}.png`} 
                          className='absolute bottom-3 right-3 bg-black/75 hover:bg-black text-white text-xs px-3 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg'
                        >
                          Download
                        </a>
                      </div>
                      <div className='p-4 flex-1 flex flex-col justify-between'>
                        <p className='text-sm font-medium text-gray-700 line-clamp-2' title={item.prompt}>
                          "{item.prompt}"
                        </p>
                        <div className='mt-4 pt-3 border-t flex justify-between items-center text-xs text-gray-500'>
                          <span className='bg-blue-50 text-blue-600 px-2.5 py-0.5 rounded-full font-medium border border-blue-100'>
                            {item.creditsUsed || 1} credit{item.creditsUsed > 1 ? 's' : ''}
                          </span>
                          <span>{formatDate(item.date)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* TAB 2: Purchased Credits View */}
          {activeTab === 'credits' && (
            <section className='mt-4'>
              {purchasedTransactions.length === 0 ? (
                <div className='text-center py-16 bg-white/60 backdrop-blur rounded-2xl border border-dashed border-gray-300 shadow-sm'>
                  <p className='text-4xl mb-3'>💳</p>
                  <p className='text-gray-700 font-medium text-lg'>No purchase history found</p>
                  <p className='text-xs text-gray-400 mt-1'>Purchased plan transactions will appear here.</p>
                </div>
              ) : (
                <div className='overflow-x-auto border rounded-xl shadow-sm bg-white'>
                  <table className='w-full text-left text-sm text-gray-600 border-collapse'>
                    <thead className='bg-gray-50 text-gray-700 uppercase text-xs border-b'>
                      <tr>
                        <th className='py-3.5 px-4 font-semibold'>Plan Name</th>
                        <th className='py-3.5 px-4 font-semibold'>Credits Added</th>
                        <th className='py-3.5 px-4 font-semibold'>Amount Paid</th>
                        <th className='py-3.5 px-4 font-semibold'>Status</th>
                        <th className='py-3.5 px-4 font-semibold'>Date & Time</th>
                      </tr>
                    </thead>
                    <tbody className='divide-y divide-gray-100'>
                      {purchasedTransactions.map((item, index) => (
                        <tr key={item._id || index} className='hover:bg-gray-50 transition-colors'>
                          <td className='py-3.5 px-4 font-medium text-gray-900'>{item.plan} Plan</td>
                          <td className='py-3.5 px-4 font-semibold text-blue-600'>+{item.credits}</td>
                          <td className='py-3.5 px-4 font-medium text-gray-800'>₹{item.amount}</td>
                          <td className='py-3.5 px-4'>
                            <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200'>
                              Paid
                            </span>
                          </td>
                          <td className='py-3.5 px-4 text-gray-500 whitespace-nowrap'>{formatDate(item.date)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}
        </div>
      )}
    </motion.div>
  )
}

export default MyHistory
