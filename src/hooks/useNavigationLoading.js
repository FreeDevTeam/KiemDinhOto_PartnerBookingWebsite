import { useState, useEffect, useRef, useCallback } from 'react'
import ReactDOM from 'react-dom'
import { Spin } from 'antd'

/**
 * Hook quản lý loading state khi navigate ra trang ngoài (window.location.href).
 * Tự động reset loading khi user quay lại trang qua bfcache hoặc tab switch.
 * Cover: Android, iOS, PC — dùng cả pageshow + visibilitychange.
 *
 * @param {number} delay - Thời gian delay trước khi hiện loading overlay (ms). Default: 800
 * @returns {{ isNavigating, showNavigating, startNavigating, NavigationLoadingOverlay }}
 */
const useNavigationLoading = (delay = 0) => {
  const [isNavigating, setIsNavigating] = useState(false)
  const [showNavigating, setShowNavigating] = useState(false)
  const navigatingTimerRef = useRef(null)

  const resetNavigating = useCallback(() => {
    clearTimeout(navigatingTimerRef.current)
    navigatingTimerRef.current = null
    setIsNavigating(false)
    setShowNavigating(false)
  }, [])

  // Bắt đầu navigating: lock click + sau `delay` ms sẽ hiện loading overlay
  const startNavigating = useCallback(() => {
    setIsNavigating(true)
    navigatingTimerRef.current = setTimeout(() => {
      setShowNavigating(true)
    }, delay)
  }, [delay])

  // Reset loading state khi user quay lại trang (bfcache / tab switch / focus)
  // - pageshow: reset khi trang được load lại (bỏ check persisted vì iOS đôi khi set persisted=false dù dùng bfcache)
  // - visibilitychange: reset khi tab/app chuyển từ hidden → visible
  // - focus: fallback cho iOS WebView (Zalo Mini App) nơi 2 event trên có thể không fire
  useEffect(() => {
    const handlePageShow = () => {
      resetNavigating()
    }
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') resetNavigating()
    }
    const handleFocus = () => {
      resetNavigating()
    }
    window.addEventListener('pageshow', handlePageShow)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleFocus)
    return () => {
      window.removeEventListener('pageshow', handlePageShow)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
      clearTimeout(navigatingTimerRef.current)
    }
  }, [resetNavigating])

  // Component portal hiển thị loading overlay
  const NavigationLoadingOverlay = showNavigating
    ? ReactDOM.createPortal(
        <div className="loading">
          <div className="text-center">
            <Spin />
          </div>
        </div>,
        document.body
      )
    : null

  return {
    isNavigating,
    showNavigating,
    startNavigating,
    resetNavigating,
    NavigationLoadingOverlay,
  }
}

export default useNavigationLoading
