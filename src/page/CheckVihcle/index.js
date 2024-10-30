import React, { useState, useEffect } from 'react'
import { Form, Input, Button, Row, Col, Modal } from 'antd'
import { useHistory, useLocation } from 'react-router-dom'
import './index.scss'
import seriGCN from './../../assets/icons/seriGCN.png'
import { validatorPlateNumber } from '../../helper/validatorPlateNumber'
import PopupMessage from '../BookingPartner/PopupMessage'
import LoadingPopup from '../../components/LoadingPopup'
import { PATH } from '../../constants/router'
import { CheckApiKey } from '../../helper/CheckApiKey'
import LoadFormBookingFailed from '../../components/BasicComponent/LoadFormBookingFailed'
import BookingService from '../../services/addBookingService'

function CheckVihcle() {
  const history=useHistory()
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false)
  const [dataVihcle, setDataVihcle] = useState({})
  const [isModalErrOpen, setIsModalErrOpen] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [form] = Form.useForm()
  const apikey= CheckApiKey()
  const isZaloApp = process.env.REACT_APP_ZALO_AUTH_ENABLE * 1
  const onFinish = (values) => {
    setIsLoading(true)
    let data={
      vehicleIdentity: values.vehicleIdentity,
      certificateSeries: values.certificateSeries
    }
    setDataVihcle((prev) => ({ ...prev, 
      vehicleIdentity: values.vehicleIdentity,
      certificateSeries: values.certificateSeries
    }))
    BookingService.userCheckVehicleInfo(data)
    .then((result) => {
      const {statusCode,error,data} = result
      if(result?.NoPermission || error == 'NoPermission'){
        setErrorMessage('Hệ thống đang bảo trì, vui lòng quay lại sau. Quý khách có thể đặt lịch đăng kiểm để được hệ thống tự động tra cứu mỗi ngày.')
        setIsModalErrOpen(true)
        setIsLoading(false)
        return
      }
      if(statusCode !== 200){
        if(error=="NOT_FOUND"){
          setIsModalErrOpen(true)
          setErrorMessage('Không tìm thấy thông tin phương tiện tại TTDK và cục đăng kiểm')
          setIsLoading(false)
          return
        }
          setErrorMessage('Tra cứu không thành công')
          setIsModalErrOpen(true)
      }else{
        let params={
          ...data,
          certificateSeries:data?.certificateSeries || values.certificateSeries
        }
        setTimeout(() => {
          history.push(`${PATH.BOOKING}${isZaloApp ? '':`?apikey=${apikey}`}`,params)
        }, 500);
      }
      setIsLoading(false)
    })
  }

  useEffect(() => {

  }, [])

  if (isLoading) {
    return (
        <div className="criminal-loading">
          <LoadingPopup type="content"/>
      </div>
    )
  }
  const handleOk = () => {
    setIsOpen(false);
  };

  const handleCancel = () => {
    setIsOpen(false);
  };
  return (
    <>
      {apikey ? 
        (
          <div className="bg-white" style={{ maxWidth: 600, margin: 'auto', padding: '20px 15px' }}>
          <h4 className='mb-3 text-large' style={{textAlign:'center'}}>Thông tin xe</h4>
          <Form
            layout="vertical"
            className="custom-form form-heigh-select-car"
            name="login"
            autoComplete="new-password"
            initialValues={{}}
            form={form}
            onFinish={(values)=>{
              onFinish(values)
            }}
            fields={[
            {
              name: ['vehicleIdentity'],
              value: dataVihcle.vehicleIdentity
            },
            {
              name: ['certificateSeries'],
              value: dataVihcle.certificateSeries
            },
          ]}>
          <Form.Item
            name="vehicleIdentity"
            style={{marginBottom:'10px'}}
            label={'Biển số xe'} 
            required
            rules={[
              {
                required: true,
                validator(_, value) {
                  return validatorPlateNumber(value)
                }
              }
            ]}>
              <Input
                className="login__input"
                placeholder={"Nhập biển số xe. VD: 30A38362"}
                type="text"
                allowClear
                size="large"
                onInput={(e) => (e.target.value = e.target.value.toUpperCase().replace(/\s/g, ''))}
              />
            </Form.Item>

            <Form.Item
              name="certificateSeries"
              extra={<div className='pointer' onClick={()=>{setIsOpen(true)}}>Xem cách lấy số seri tem GCN</div> }
              label={'Số seri tem GCN'}
              className=""
              rules={[
                {
                  required: true,
                  message:'Vui lòng nhập số seri GCN'
                },
                {
                  message: 'Số seri GCN không hợp lệ',
                  pattern: new RegExp(/^([a-zA-Z]{2})+(-(?!-))+([0-9]{7}\b)$/),
                },
              ]}>
              <Input
                className="login__input"
                placeholder="Ví dụ: KA-7461980"
                type="text"
                size="large"
                onInput={(event) => {
                  event.target.value = event.target.value.toUpperCase()
                }}
              />
            </Form.Item>
            <div>
              <div className='text-nomal'>
                Ghi chú:
              </div>
              <div className='text-nomal'>
                -Số seri tem GCN là dãy số  10 ký tự trên tem đăng kiểm hoặc dòng cuối cùng trên sổ đăng kiểm. Ví dụ: KD-3839191
              </div>
            </div>
            <div className="w-100 d-flex justify-content-center">
              <Button
                className="login__button df ps-40 mt-4 custom-default-btn"
                type="primary"
                htmlType="submit"
                size="large"
              >
                Tra cứu
              </Button>
            </div>
          </Form>
          {isModalErrOpen &&
            <PopupMessage isModalOpen={isModalErrOpen} history={history} onClose={() => {setIsModalErrOpen(false)}} text={errorMessage} ></PopupMessage>
          }
          <Modal title={'Cách lấy số seri tem GCN'} open={isOpen} onCancel={handleCancel}
            footer ={<Button className='btn-ok' onClick={handleOk}>Đã hiểu</Button>}
            className="popup-GCNSeri"
            style={{
              maxWidth:'550px',
              padding:'10px'
            }}>
            <div className='text-nomal'>
              <div>
                Về 'Số tem (seri), giấy chứng nhận hiện tại', người tra cứu căn cứ theo số tem kiểm định được dán góc trên bên phải của mặt kính chắn gió phía trước xe.
              </div>
              <div className='GCN_exp'>
                Ví dụ về số tem (seri), giấy chứng nhận hiện tại của hình bên dưới là: <span className='text-danger'>KD-1946305</span>
                <div className='mt-1'>
                  <img className='GCN_img' src={seriGCN} alt="" />
                </div>
              </div>
              <div className='mt-1 mb-1'>
                Hoặc là dòng cuối cùng trên sổ đăng kiểm.
              </div>
              <div className='GCN_exp'>
                Là dòng cuối cùng 'Số seri' trên giấy chứng nhận
                <div className='mt-1'>
                  <img className='GCN_img' src={window.location.origin + '/datlich_soteamgcn.png'} alt="" />
                </div>
              </div>
            </div>
          </Modal>
        </div>
        ):
        (
          <LoadFormBookingFailed></LoadFormBookingFailed>
        )
      }
    </>
  )
}

export default CheckVihcle
