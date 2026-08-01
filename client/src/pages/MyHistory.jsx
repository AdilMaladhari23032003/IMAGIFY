import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { motion } from 'framer-motion'

const CACHE_KEY_IMAGES = 'history_images_cache'
const CACHE_KEY_TRANS  = 'history_trans_cache'

const MyHistory = () => {
  const { backendUrl, token } = useContext(AppContext)

  // Load from cache immediately so page renders instantly
  const [images, setImages] = useState(() => {
    try { return JSON.parse(localStorage.getItem(CACHE_KEY_IMAGES)) || [] } catch { return [] }
  })
  const [transactions, setTransactions] = useState(() => {
    try { return JSON.parse(localStorage.getItem(CACHE_KEY_TRANS)) || [] } catch { return [] }
  })
  const [loading, setLoading] = useState(false)   // no spinner on first load
  const [refreshing, setRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState('images')

  const fetchHistory = async (silent = false) => {
    try {
      if (!silent) setLoading(true)
      else setRefreshing(true)

      const [imageRes, transRes] = await Promise.all([
        axios.get(backendUrl + '/api/image/history', { headers: { token } }),
        axios.get(backendUrl + '/api/user/transactions', { headers: { token } })
      ])

      if (imageRes.data.success) {
        const imgs = imageRes.data.images || []
        setImages(imgs)
        try { localStorage.setItem(CACHE_KEY_IMAGES, JSON.stringify(imgs)) } catch(e) {}
      } else {
        toast.error(imageRes.data.message)
      }

      if (transRes.data.success) {
        const trans = transRes.data.transactions || []
        setTransactions(trans)
        try { localStorage.setItem(CACHE_KEY_TRANS, JSON.stringify(trans)) } catch(e) {}
      } else {
        toast.error(transRes.data.message)
      }

    } catch (error) {
      console.log(error)
      // Only show error if there's no cached data to display
      if (images.length === 0 && transactions.length === 0) {
        toast.error('Could not load history. Please try again.')
      }
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    if (token) {
      // If we have cached data, fetch silently in background
      const hasCachedData =
        localStorage.getItem(CACHE_KEY_IMAGES) || localStorage.getItem(CACHE_KEY_TRANS)
      fetchHistory(Boolean(hasCachedData))  // silent=true if cache exists
    }
  }, [token])

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A'
    return new Date(timestamp).toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short'
    })
  }

  const displayTransactions = transactions

  return (
    <motion.div
      className='min-h-[80vh] pt-10 pb-16 px-4 max-w-6xl mx-auto'
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className='text-center mb-8'>
        <button className='border border-gray-400 px-8 py-2 rounded-full text-sm font-medium mb-4'>
          Activity Log
        </button>
        <h1 className='text-3xl sm:text-4xl font-semibold text-gray-800'>My History</h1>
        <p className='text-gray-500 text-sm mt-2'>View your generated images and credit transactions</p>

        {/* Tab Buttons */}
        <div className='flex justify-center items-center gap-3 mt-6'>
          <button
            onClick={() => setActiveTab('images')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
              activeTab === 'images'
                ? 'bg-zinc-900 text-white shadow-md scale-105'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            🎨 Generated Images
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
            💳 Credit Transactions
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              activeTab === 'credits' ? 'bg-zinc-700 text-white' : 'bg-gray-100 text-gray-600'
            }`}>
              {displayTransactions.length}
            </span>
          </button>
        </div>
      </div>

      {/* Subtle refreshing indicator — only shows when silently syncing in background */}
      {refreshing && (
        <div className='flex justify-center items-center gap-2 py-2 mb-2'>
          <div className='w-2 h-2 bg-blue-400 rounded-full animate-pulse'></div>
          <span className='text-xs text-gray-400'>Syncing latest data…</span>
        </div>
      )}

      {loading ? (
        <div className='flex justify-center items-center py-20'>
          <div className='w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin'></div>
        </div>
      ) : (
        <div>
          {/* TAB 1: Generated Images */}
          {activeTab === 'images' && (
            <section>
              {images.length === 0 ? (
                <div className='text-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-300'>
                  <p className='text-gray-500 font-medium'>No history found yet</p>
                  <p className='text-xs text-gray-400 mt-1'>Generate your first image to see it here!</p>
                </div>
              ) : (
                <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
                  {images.map((item, index) => (
                    <div key={item._id || index} className='bg-white border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col'>
                      <div className='aspect-square bg-gray-100 relative overflow-hidden group'>
                        <img src={item.imageUrl} alt={item.prompt} className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-300' />
                        <a href={item.imageUrl} download={`image-${index + 1}.png`} className='absolute bottom-3 right-3 bg-black/70 hover:bg-black text-white text-xs px-3 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200'>
                          Download
                        </a>
                      </div>
                      <div className='p-4 flex-1 flex flex-col justify-between'>
                        <p className='text-sm font-medium text-gray-700 line-clamp-2' title={item.prompt}>
                          "{item.prompt}"
                        </p>
                        <div className='mt-4 pt-3 border-t flex justify-between items-center text-xs text-gray-500'>
                          <span className='bg-blue-50 text-blue-600 px-2 py-0.5 rounded font-medium'>
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

          {/* TAB 2: Credit Transactions */}
          {activeTab === 'credits' && (
            <section>
              {displayTransactions.length === 0 ? (
                <div className='text-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-300'>
                  <p className='text-gray-500 font-medium'>No history found yet</p>
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
                      {displayTransactions.map((item, index) => (
                        <tr key={item._id || index} className='hover:bg-gray-50 transition-colors'>
                          <td className='py-3.5 px-4 font-medium text-gray-900'>{item.plan} Plan</td>
                          <td className='py-3.5 px-4 font-semibold text-blue-600'>+{item.credits}</td>
                          <td className='py-3.5 px-4 font-medium text-gray-800'>₹{item.amount}</td>
                          <td className='py-3.5 px-4'>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item.payment ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                              {item.payment ? 'Paid' : 'Pending'}
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
