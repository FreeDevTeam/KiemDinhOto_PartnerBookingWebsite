import React, { useCallback, useState, useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { debounce } from 'lodash'
import { Spin, message } from 'antd'

import { ReactComponent as ArrowIcon } from "../../assets/Booking-icon/ArrowRight.svg"
import FeatureInDevelopment from '../Popup/FeatureInDevelopment'
import { useGlobalContext } from '../../context/GlobalContext'
import { IS_ZALO_MINI_APP } from '../../constants/global'

function ListServiceLayout({ data = [] }) {
  // Sử dụng useTranslation để lấy các bản dịch
  const { t: translation } = useTranslation()
  // Lấy history từ react-router-dom để điều hướng
  const history = useHistory()
  // state hiển thị popup
  const [isOpenPopup, setIsOpenPopup] = useState(false)
  // state loading khi kiểm tra authentication
  const [isCheckingAuth, setIsCheckingAuth] = useState(false)
  // Lấy global state từ GlobalContext (chứa thông tin user từ Zalo)
  const { globalState, handleZaloAuthorize, handleGetUserPhone } = useGlobalContext()

  // Kiểm tra authentication trước khi chuyển hướng
  const checkAuthenticationStatus = useCallback(async () => {
    // Nếu đang chạy trên Zalo Mini App
    if (IS_ZALO_MINI_APP && process.env.REACT_APP_ZALO_AUTH_ENABLE * 1 === 1) {
      setIsCheckingAuth(true)
      try {
        // Nếu chưa được authorize, yêu cầu authorize
        if (!globalState?.isAuthorize) {
          await handleZaloAuthorize()
        }
        // Lấy số điện thoại nếu chưa có
        if (!globalState?.phoneNumber) {
          await handleGetUserPhone()
        }
      } catch (error) {
        message.error('Không thể lấy thông tin người dùng. Vui lòng thử lại.')
        console.error('Authentication error:', error)
      } finally {
        setIsCheckingAuth(false)
      }
    }
  }, [globalState?.isAuthorize, globalState?.phoneNumber, handleZaloAuthorize, handleGetUserPhone])

  // Debounce để tránh spam click liên tục
  const debouncedNavigation = useCallback((_item) => {
    const navigate = debounce(() => {
      // Kiểm tra nếu dịch vụ yêu cầu xác thực
      if (_item?.isAuthNessary === true) {
        // Trên Zalo Mini App: kiểm tra xem đã authorize chưa
        if (IS_ZALO_MINI_APP && !globalState?.isAuthorize) {
          message.warning('Vui lòng cấp quyền truy cập để tiếp tục')
          return checkAuthenticationStatus()
        }
        // Trên Web: luôn cho phép (không yêu cầu đăng nhập)
      }

      return history.push(_item.path)
    }, 800)
    navigate()
  }, [history, globalState?.isAuthorize, checkAuthenticationStatus])

  // Hàm xử lý click item
  const handleClick = useCallback(
    (_item) => {
      if (_item?.disabled) {
        message.info('Dịch vụ này tạm thời không khả dụng')
        return
      }

      if (_item?.path) {
        debouncedNavigation(_item)
      } else {
        setIsOpenPopup(true)
      }
    },
    [debouncedNavigation]
  )

  // Kiểm tra authentication khi component mount (cho Zalo Mini App)
  useEffect(() => {
    if (IS_ZALO_MINI_APP && process.env.REACT_APP_ZALO_AUTH_ENABLE * 1 === 1) {
      checkAuthenticationStatus()
    }
  }, [checkAuthenticationStatus])

  return (
    <>
      {isCheckingAuth && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '200px'
        }}>
          <Spin tip="Đang xác thực..." />
        </div>
      )}
      {!isCheckingAuth && (
        <div className="askadvice-service">
          <div className="login__title__text">
            Vui lòng chọn loại dịch vụ
          </div>
          {data && data.length > 0 ? (
            data.map((_item) => {
              return (
                <div
                  className="askadvice-service-item"
                  key={_item.id}
                  style={_item.disabled ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                  onClick={() => {
                    handleClick(_item)
                  }}>
                  <div className="content-left">
                    {_item.icon ? (
                      _item.icon
                    ) : (
                      <img 
                        style={{ width: '40px', height: '40px', borderRadius: '4px', display: 'inline' }} 
                        src={_item?.imageUrl} 
                        alt={_item?.title || 'service'} />
                    )}
                  </div>
                  <div className="content-right">
                    <div className="title text-normal">{translation(_item.title)}</div>
                    <div className="subTitle text-small">{translation(_item.subTitle)}</div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <ArrowIcon></ArrowIcon>
                  </div>
                </div>
              )
            })
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#999' }}>
              {translation('no-service-available') || 'Không có dịch vụ nào'}
            </div>
          )}
        </div>
      )}
      <FeatureInDevelopment
        visible={isOpenPopup}
        title={translation("featureUnderDevelop")}
        footer={null}
        closable={true}
        style={{ padding: 0 }}
        subtitle={translation("combackLater")}
        confirmAction={() => setIsOpenPopup(false)}
      />
    </>
  )
}

export default ListServiceLayout