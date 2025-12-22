import React, { useEffect, useState } from 'react'
import { Form, Tabs, Spin, notification } from 'antd'
import './index.scss'
import BookingPartnerForm from './bookingPartnerForm'
import { useGtelpayUserData } from '../../context/GtelpayContext'
import { useLocation } from 'react-router-dom'
import LoadFormBookingFailed from '../../components/BasicComponent/LoadFormBookingFailed'
import { CheckApiKey } from '../../helper/CheckApiKey'
import { TTDK_PARTNER } from '../../components/BasicComponent/CheckLogoPartner'
import { getZaloUserName, getZaloUserPhone } from '../../helper/zaloSDK'
import { useGlobalContext } from '../../context/GlobalContext'
import { SCHEDULE_TYPE, WEBVIEW_TYPES } from '../../constants/global'
import MainLogo from '../../components/MainLogo'
import addKeyLocalStorage from '../../helper/localStorage'
function BookingPartner() {
  const { globalState, handleGetUserPhone, handleGetUserName, setGlobalState } = useGlobalContext();
  const { gtelpayUser } = useGtelpayUserData()
  const [isVisible, setIsVisible] = useState(false)
  const [nextTab, setNextTab] = useState('partner')
  const [tabKey, setTabKey] = useState()
  const [form] = Form.useForm()
  const location = useLocation();
  const searchparam = location.search
  const params = new URLSearchParams(searchparam)
  let partner = params.get('partner')?.toLowerCase()
  const isWebView = params.get('isWebView')
  let apikey = CheckApiKey()
  const localLogo = (JSON.parse(localStorage.getItem(addKeyLocalStorage('dataTheme'))) || {})?.stationsLogo


  const handleGetUserInfor = async () => {
    try {
      handleGetUserName()
    } catch (error) {
      
    }
    try {
      await handleGetUserPhone()
    } catch (error) {
      setIsVisible(false)
      notification.error({
        message: "Có lỗi phát sinh. Vui lòng thử lại."
      })
    }
    setIsVisible(false)
  }

  useEffect(() => {
    setIsVisible(true)
    handleGetUserInfor()
  }, [])

  const getTitleName = (searchParam) => {
    const splitSearchParam = searchParam?.split('=')
    const scheduleType = Number(splitSearchParam[splitSearchParam.length - 1])
    const title = SCHEDULE_TYPE.find((item) => item.value === scheduleType)?.label
    return "THÔNG TIN LỊCH HẸN"
    // return title === undefined 
    //   ? 'ĐẶT LỊCH ĐĂNG KIỂM' 
    //   : title?.toUpperCase()
  }

  return (
    <>
      {apikey ?
        (
          <div className={`partner app-container ${nextTab === 'otp' ? 'py-0 px-2' : 'pd-30-15'}`} style={{ maxWidth: 480, margin: 'auto', padding: '10px' }}>
            {isVisible ? (
              <div className="loading">
                <Spin style={{ width: '100%' }} />
              </div>
            ) : (
              <>
                <div
                  className={`
                partner-container 
                ${nextTab === 'partner' ? 'small' : 'full'}
                ${nextTab === 'success' ? 'd-flex justify-content-center align-items-center' : ''}
                `}>
                  {/* <Tabs activeKey={nextTab}>
                <Tabs.TabPane tab="" key="partner">
                  <div className="h-100">
                    <div className="partner-select">
                      <Tabs activeKey={tabKey}>
                        <Tabs.TabPane tab="Đặt lịch" key="booking"> */}
                  {
                    Number(isWebView) !== WEBVIEW_TYPES.WEBVIEW ? <div className='booking-title title-normal'>{getTitleName(searchparam)}</div> : null
                  }
                  <div className='mt-4'>
                    <BookingPartnerForm gtelpayUser={gtelpayUser} zaloUserPhone={globalState.phoneNumber} zaloUserName={globalState.userName} setTabKey={setTabKey} form={form} />
                  </div>
                  {/* </Tabs.TabPane>
                        <Tabs.TabPane tab="Lịch hẹn" key="bookingList">
                          <BookingPartnerHistory setTabKey={setTabKey} tabKey={tabKey} form={form} />
                        </Tabs.TabPane>
                      </Tabs>
                    </div>
                  </div>
                </Tabs.TabPane>
              </Tabs> */}
                </div>
                <div style={{ maxWidth: 600, margin: 'auto', padding: '30px 0', textAlign: 'center' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
                    <MainLogo height={60} width={60}></MainLogo>
                    {TTDK_PARTNER.map(item => {
                      if (item.name == partner) {
                        return (<div style={{ maxHeight: '58px',maxWidth:'150px' }}>
                          {item.icon}
                        </div>)
                      }
                    })}
                  </div>
                  {
                    !localLogo &&
                    <div style={{ color: 'var(--primary-button-color)', marginTop: '0.5rem' }}>Powered by TTDK</div>
                  }
                </div>
              </>
            )
            }
          </div>
        ) :
        (
          <>
            <LoadFormBookingFailed></LoadFormBookingFailed>
            <div style={{ maxWidth: 600, margin: 'auto', padding: '30px 0', textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                {TTDK_PARTNER.map(item => {
                  if (item.name == partner) {
                    return (<div style={{ maxHeight: '58px',maxWidth:'150px' }}>
                      {item.icon}
                    </div>)
                  }
                })}
              </div>
              <div style={{ color: 'var(--primary-button-color)', marginTop: '0.5rem' }}>Powered by TTDK</div>
            </div>
          </>
        )
      }
    </>
  )
}
export default BookingPartner
