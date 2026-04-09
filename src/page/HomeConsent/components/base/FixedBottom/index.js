import { useEffect, useRef } from 'react'
import './index.scss'

export default function FixedBottom({ children, elementPaddingBottom = 'app' }) {
  const ref = useRef(null)

  useEffect(() => {
    const app = document.getElementById(elementPaddingBottom)
    if (!ref.current || !app) return

    const updatePadding = () => {
      const height = ref.current.offsetHeight
      app.style.paddingBottom = `${height}px`
    }

    updatePadding()
    window.addEventListener('resize', updatePadding)

    return () => {
      app.style.paddingBottom = '0px'
      window.removeEventListener('resize', updatePadding)
    }
  }, [])

  return (
    <div ref={ref} className="FixedBottom">
      {children}
    </div>
  )
}
