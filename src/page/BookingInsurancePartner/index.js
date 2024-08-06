import React, { useEffect, useState } from 'react'
import { Form, Tabs, Spin, notification } from 'antd'
import './index.scss'
import BookingInsurancePartnerForm from './BookingInsurancePartnerForm'
import { useLocation } from 'react-router-dom'
import LoadFormBookingFailed from '../../components/BasicComponent/LoadFormBookingFailed'
import { CheckApiKey } from '../../helper/CheckApiKey'
import { ReactComponent as LogoTTDK } from './../../assets/icons/Logo.svg'
import { TTDK_PARTNER } from '../../components/BasicComponent/CheckLogoPartner'
import { getZaloUserName, getZaloUserPhone } from '../../helper/zaloSDK'
import { useGlobalContext } from '../../context/GlobalContext'
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
  let apikey = CheckApiKey()

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
                  <div className='booking-title title-small'>ĐẶT LỊCH TƯ VẤN MUA BH TNDS</div>
                  <div className='mt-4'>
                    <BookingInsurancePartnerForm zaloUserPhone={globalState.phoneNumber} zaloUserName={globalState.userName} setTabKey={setTabKey} form={form} />
                  </div>
                </div>
                <div style={{ maxWidth: 600, margin: 'auto', padding: '30px 0', textAlign: 'center' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
                    <LogoTTDK></LogoTTDK>
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
export default BookingInsurancePartner
