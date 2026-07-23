import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { motion } from 'framer-motion'

const MyHistory = () => {
  const { backendUrl, token } = useContext(AppContext)

  const [images, setImages] = useState([])
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchHistory = async () => {
    try {
      setLoading(true)

      const [imageRes, transRes] = await Promise.all([
        axios.get(backendUrl + '/api/image/history', { headers: { token } }),
        axios.get(backendUrl + '/api/user/transactions', { headers: { token } })
      ])

      if (imageRes.data.success) {
        setImages(imageRes.data.images || [])
      } else {
        toast.error(imageRes.data.message)
      }

      if (transRes.data.success) {
        setTransactions(transRes.data.transactions || [])
      } else {
        toast.error(transRes.data.message)
      }

    } catch (error) {
      console.log(error)
      toast.error(error.message)
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
      initial={{ opacity: 0.2, y: 50 }}
      transition={{ duration: 0.8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      <div className='text-center mb-10'>
        <button className='border border-gray-400 px-8 py-2 rounded-full text-sm font-medium mb-4'>
          Activity Log
        </button>
        <h1 className='text-3xl sm:text-4xl font-semibold text-gray-800'>My History</h1>
        <p className='text-gray-500 text-sm mt-2'>View your generated images and credit transactions</p>
      </div>

      {loading ? (
        <div className='flex justify-center items-center py-20'>
          <div className='w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin'></div>
        </div>
      ) : (
        <div className='space-y-16'>
          {/* Section 1: Image Generation History */}
          <section>
            <h2 className='text-xl sm:text-2xl font-semibold text-gray-800 mb-6 border-b pb-2 flex items-center gap-2'>
              <span>🎨</span> Image Generation History
            </h2>

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

          {/* Section 2: Credits Purchase History */}
          <section>
            <h2 className='text-xl sm:text-2xl font-semibold text-gray-800 mb-6 border-b pb-2 flex items-center gap-2'>
              <span>💳</span> Credits Purchase History
            </h2>

            {purchasedTransactions.length === 0 ? (
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
                    {purchasedTransactions.map((item, index) => (
                      <tr key={item._id || index} className='hover:bg-gray-50 transition-colors'>
                        <td className='py-3.5 px-4 font-medium text-gray-900'>{item.plan} Plan</td>
                        <td className='py-3.5 px-4 font-semibold text-blue-600'>+{item.credits}</td>
                        <td className='py-3.5 px-4 font-medium text-gray-800'>₹{item.amount}</td>
                        <td className='py-3.5 px-4'>
                          <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800'>
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
        </div>
      )}
    </motion.div>
  )
}

export default MyHistory
