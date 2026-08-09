import React, { useMemo, useState } from 'react'

const AVATAR_COLORS = [
    '#F87171', '#FBBF24', '#34D399', '#60A5FA', '#818CF8',
    '#A78BFA', '#F472B6', '#FB923C', '#2DD4BF', '#38BDF8',
    '#4ADE80', '#E879F9', '#10B981', '#6366F1', '#EC4899'
]

const getBackgroundColor = (identifier) => {
    if (!identifier) return AVATAR_COLORS[0]
    let hash = 0
    for (let i = 0; i < identifier.length; i++) {
        hash = identifier.charCodeAt(i) + ((hash << 5) - hash)
    }
    return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

const UserAvatar = ({ user, className = 'w-10 h-10', textClassName = 'text-base font-semibold' }) => {
    const [imgError, setImgError] = useState(false)
    const photoUrl = user?.photoURL || user?.avatar || user?.profileImage || user?.picture || user?.image

    const letter = useMemo(() => {
        const source = user?.name || user?.displayName || user?.email || ''
        return source.trim() ? source.trim().charAt(0).toUpperCase() : '?'
    }, [user])

    const bgColor = useMemo(() => {
        const identifier = user?.email || user?.name || user?.displayName || user?.uid || user?._id || 'user'
        return getBackgroundColor(identifier)
    }, [user])

    if (photoUrl && !imgError) {
        return (
            <img
                src={photoUrl}
                alt={user?.name || user?.displayName || 'User Avatar'}
                onError={() => setImgError(true)}
                className={`${className} rounded-full object-cover border border-gray-200 shadow-sm cursor-pointer`}
            />
        )
    }

    return (
        <div
            className={`${className} rounded-full flex items-center justify-center text-white shadow-sm cursor-pointer uppercase select-none transition-transform hover:scale-105`}
            style={{ backgroundColor: bgColor }}
            title={user?.name || user?.email || 'User'}
        >
            <span className={textClassName}>{letter}</span>
        </div>
    )
}

export default UserAvatar
