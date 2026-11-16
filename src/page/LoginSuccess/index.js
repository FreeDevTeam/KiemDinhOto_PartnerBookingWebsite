import React, { useEffect, useState } from 'react'
import { Spin } from 'antd'
import { useHistory, useLocation } from 'react-router-dom'
import { PATH } from '../../constants/router'
import { setAuthToken } from '../../helper/authToken'
import BasicResultMessage from '../../components/BasicComponent/BasicResultMessage'

function LoginSuccess() {
  const history = useHistory()
  const location = useLocation()
  const [isFailed, setIsFailed] = useState(false)

  useEffect(() => {
    const token = (new URLSearchParams(location.search).get('token') || '').trim()
    if (!token) {
      setIsFailed(true)
      return
    }
    try {
      setAuthToken(token)
    } catch (e) {
      setIsFailed(true)
      return
    }
    history.replace(PATH.HOME)
  }, [location.search, history])

  if (isFailed) {
    return (
      <BasicResultMessage
        message="Xác thực thông tin thất bại"
        ctaTitle="Quay lại trang chủ"
        onCtaClick={() => history.replace(PATH.HOME)}
      />
    )
  }

  return (
    <div className="d-flex justify-content-center" style={{ padding: '60px 15px' }}>
      <Spin />
    </div>
  )
}

export default LoginSuccess
