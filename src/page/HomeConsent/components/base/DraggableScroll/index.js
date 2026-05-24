import React, { useRef } from 'react'

const DraggableScroll = ({ children }) => {
  const containerRef = useRef(null)
  const containerChildrenRef = useRef(null)
  const isDragging = useRef(false)
  const startX = useRef(0)
  const scrollLeft = useRef(0)

  const handleMouseDown = (e) => {
    isDragging.current = true
    startX.current = e.pageX - containerRef.current.offsetLeft
    scrollLeft.current = containerRef.current.scrollLeft
    containerRef.current.style.cursor = 'grabbing'

    // Loại bỏ việc chọn văn bản
    document.body.style.userSelect = 'none'
  }

  const handleMouseLeave = () => {
    isDragging.current = false
    containerRef.current.style.cursor = 'default' // Trở về trạng thái mặc định

    // Khôi phục việc chọn văn bản
    document.body.style.userSelect = 'auto'
    containerChildrenRef.current.style.pointerEvents = 'auto'
  }

  const handleMouseUp = () => {
    isDragging.current = false
    containerRef.current.style.cursor = 'default' // Trở về trạng thái mặc định

    // Khôi phục việc chọn văn bản
    document.body.style.userSelect = 'auto'

    containerChildrenRef.current.style.pointerEvents = 'auto'
  }

  const handleMouseMove = (e) => {
    if (!isDragging.current) return
    const x = e.pageX - containerRef.current.offsetLeft
    const walk = (x - startX.current) * 1 // Điều chỉnh tốc độ cuộn
    containerRef.current.scrollLeft = scrollLeft.current - walk

    containerChildrenRef.current.style.pointerEvents = 'none'
  }

  const handleTouchStart = (e) => {
    isDragging.current = true
    startX.current = e.touches[0].pageX - containerRef.current.offsetLeft
    scrollLeft.current = containerRef.current.scrollLeft
  }

  const handleTouchEnd = () => {
    isDragging.current = false
  }

  const handleTouchMove = (e) => {
    if (!isDragging.current) return
    const x = e.touches[0].pageX - containerRef.current.offsetLeft
    const walk = (x - startX.current) * 1 // Điều chỉnh tốc độ cuộn
    containerRef.current.scrollLeft = scrollLeft.current - walk
  }

  return (
    <div
      ref={containerRef}
      style={{
        display: 'flex', // Đảm bảo các phần tử con nằm ngang
        overflow: 'hidden',
        cursor: 'default', // Trạng thái mặc định
        whiteSpace: 'nowrap'
      }}
      onMouseDown={handleMouseDown}
      onMouseLeave={handleMouseLeave}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}>
      <div ref={containerChildrenRef}>{children}</div>
    </div>
  )
}

export default DraggableScroll
