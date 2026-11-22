import React, { useEffect } from 'react'
import { Spin } from 'antd'
import { useHistory } from 'react-router-dom'
import { PATH } from '../../constants/router'

const REDIRECT_DELAY_MS = 3000

function Logout() {
  const history = useHistory()

  useEffect(() => {
    // Xoá toàn bộ dữ liệu đã lưu (token, apiKey, theme, ...)
    try {
      localStorage.clear()
    } catch (e) {}

    const timer = setTimeout(() => {
      history.replace(PATH.HOME)
    }, REDIRECT_DELAY_MS)
    return () => clearTimeout(timer)
  }, [history])

  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
      <Spin size="large" />
    </div>
  )
}

export default Logout
