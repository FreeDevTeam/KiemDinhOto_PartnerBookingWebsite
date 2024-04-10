import { Button, Spin } from 'antd'
import React, { useState } from 'react'
import { getZaloUserPhone } from '../../helper/zaloSDK'
import { ReactComponent as LogoTTDK } from './../../assets/icons/Logo.svg'
import "./index.scss"
import { resetPassword } from '../../services/ttdkService'
import { notification } from "antd";

const statePage = {
    Default: "default",
    Loading: "loading",
    Success: "Success",
    Error: "Error"

}

const LoadingPage = () => {
    return (
        <div className="loading">
            <Spin style={{ width: '100%' }} />
        </div>
    )
}

const DefaultPage = (props) => {
    return (
        <>
            <p>
                Trong quá trình đặt lại mật khẩu cho tài khoản của mình trên ứng dụng
                <span className='text-blue'> "TTDK - Đặt lịch đăng kiểm" </span>, chúng tôi cần sự xác nhận từ phía bạn để tiếp tục quá trình này một cách bảo mật và chính xác.
            </p>
            <p>
                Xin vui lòng lưu ý rằng chúng tôi sẽ sử dụng số điện thoại đã đăng ký của bạn để tạo lại mật khẩu mới. Để hoàn tất quá trình, vui lòng bấm vào nút "Xác nhận".
            </p>
            <div className="w-100 d-flex justify-content-center">
                <Button onClick={props.handleConfirm} className="login__button df" type="primary" htmlType="submit" size="large">
                    Xác nhận
                </Button>
            </div>
        </>
    )
}

const SuccessPage = () => {
    const handleGetLink = (link) => {
        window.open(link, '_blank');

    }
    return (
        <div>
            <p>Mật khẩu mới cho tài khoản của bạn là "<span className='text-blue'>123456</span>"</p>
            <p>
                Chúng tôi xin gửi lời cảm ơn chân thành đến quý khách về sự hợp tác trong quá trình này.
                Nếu cần hỗ trợ thêm, vui lòng liên hệ với chúng tôi.
            </p>
            <p>
                Chúng tôi rất hân hạnh được phục vụ và chúc quý khách một ngày vui vẻ và thành công.
            </p>
            <div className='d-flex flex-column'>
                <Button className='text-left p-0' type='link' onClick={() => handleGetLink('https://ttdk.com.vn')} >Đặt lịch đăng kiểm</Button>
                <Button className='text-left p-0' type='link' onClick={() => handleGetLink('https://ttdk.com.vn/gia-han-bao-hiem-tnds?title=Gia%20h%E1%BA%A1n%20b%E1%BA%A3o%20hi%E1%BB%83m%20TNDS')}>Gia hạn bảo hiểm TNDS</Button>
                <Button className='text-left p-0' type='link' onClick={() => handleGetLink('https://ttdk.com.vn/kiemtraphatnguoi')}>Tra cứu cảnh báo, phạt nguội</Button>
            </div>
        </div>

    )
}

const ContentPage = (props) => {
    const contentPage = {
        [statePage.Default]: <DefaultPage handleConfirm={props.handleConfirm} />,
        [statePage.Success]: <SuccessPage />,
        [statePage.Loading]: <LoadingPage />,
        [statePage.Error]: <DefaultPage handleConfirm={props.handleConfirm} />,
    }

    return contentPage[props.page]
}

export default function ResetPassword() {
    const [currentStatePage, setCurrentStatePage] = useState(statePage.Default);
    const handleConfirm = async () => {
        try {
            setCurrentStatePage(statePage.Loading)
            const phoneNumber = await getZaloUserPhone()
            if (!phoneNumber) {
                notification.error({
                    message: "Không tìm thấy số điện thoại. Vui lòng thử lại"
                })
                setCurrentStatePage(statePage.Default)
                return

            }
            resetPassword(phoneNumber).then(data => {
                setCurrentStatePage(statePage.Success)
            })
            .catch(err => {
                notification.error({
                    message: "Cập nhật mật khẩu thất bại. Vui lòng thử lại"
                })
                setCurrentStatePage(statePage.Error)
            })

        } catch (error) {
            notification.error({
                message: "Có lỗi phát sinh. Vui lòng thử lại"
            })
            setCurrentStatePage(statePage.Error)
        }
    }
    return (
        <div style={{ maxWidth: 480, margin: 'auto', padding: '10px' }}>
            <ContentPage page={currentStatePage} handleConfirm={handleConfirm} />
            <div style={{ maxWidth: 600, margin: 'auto', padding: '30px 0', textAlign: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
                    <LogoTTDK />
                </div>
                <div className='text-blue mt-3'>Powered by TTDK</div>
            </div>
        </div>
    )
}
