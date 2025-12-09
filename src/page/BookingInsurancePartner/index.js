import React, { useEffect, useState } from 'react'
import { Form, Tabs, Spin, notification } from 'antd'
import './index.scss'
import BookingInsurancePartnerForm from './BookingInsurancePartnerForm'
import { useLocation } from 'react-router-dom'
import LoadFormBookingFailed from '../../components/BasicComponent/LoadFormBookingFailed'
import { CheckApiKey } from '../../helper/CheckApiKey'
import { TTDK_PARTNER } from '../../components/BasicComponent/CheckLogoPartner'
import { getZaloUserName, getZaloUserPhone } from '../../helper/zaloSDK'
import { useGlobalContext } from '../../context/GlobalContext'
import MainLogo from '../../components/MainLogo'
function BookingInsurancePartner() {
  const { globalState, handleGetUserPhone, handleGetUserName, setGlobalState } = useGlobalContext();
  const [isVisible, setIsVisible] = useState(false)
  const [nextTab, setNextTab] = useState('partner')
  const [tabKey, setTabKey] = useState()
  const [form] = Form.useForm()
  const location = useLocation();
  const searchparam = location.search
  const params = new URLSearchParams(searchparam)
  let partner = params.get('partner')?.toLowerCase()
  let apiKey = CheckApiKey()

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
  return (
    <>
      {apiKey ?
        (
          <div className={`partner app-container ${nextTab === 'otp' ? 'py-0 px-2' : 'pd-30-15'}`} style={{ maxWidth: 600, margin: 'auto', padding: '12px' }}>
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
                  <div className='booking-title title-normal'>ĐẶT LỊCH TƯ VẤN MUA BH TNDS</div>
                  <div className='mt-4'>
                    <BookingInsurancePartnerForm zaloUserPhone={globalState.phoneNumber} zaloUserName={globalState.userName} setTabKey={setTabKey} form={form} />
                  </div>
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
                  <div style={{ color: 'var(--primary-button-color)', marginTop: '0.5rem' }}>Powered by {process.env.REACT_APP_THEME_NAME}</div>
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
              <div style={{ color: 'var(--primary-button-color)', marginTop: '0.5rem' }}>Powered by {process.env.REACT_APP_THEME_NAME}</div>
            </div>
          </>
        )
      }
    </>
  )
}
export default BookingInsurancePartner
