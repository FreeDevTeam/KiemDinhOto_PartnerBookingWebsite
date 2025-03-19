import { Modal } from "antd";
import Countdown from "./../CountDown";
import DefaultButton from "./../elements/button";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ReactComponent as ExpiredWarningIcon } from './../../assets/icons/expired-warning.svg';
import { copyToClipboard } from './../../helper/common';
import { CopyOutlined } from "@ant-design/icons";
import LoadingPopup from "./../LoadingPopup";
import './index.scss';
import PaymentService from "../../services/paymentService";
const ModalPaymentQR = ({ open, onClose, driver, onRefresh, method }) => {
    const { t: translation } = useTranslation();
    const {
        totalPay,
        formatedTotalPay,
        qr,
        expiredInMinutes,
        runTime
    } = driver;

    const [paymentMethod, setPaymentMethod] = useState({});
    const [loading, setLoading] = useState(true);
    const [expiredText, setExpiredText] = useState('Mã QR hết hiệu lực sau');

    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                const data = await PaymentService.getPaymentQRMethod({});
                setPaymentMethod(data);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const onRf = () => {
        setExpiredText('Mã QR hết hiệu lực sau');
        onRefresh();
    };

    const qrUrl = (() => {
        if (loading || !method) return '';
        return method === 'momo' ? paymentMethod[method].paymentMethodQrCodeUrl : driver?.qr?.qrData;
    })();

    return (
        <>
            <Modal title="" open={open} footer={null} closable={false} className="modal-payment-qr text-center" onClose={onClose}>
                {
                    (loading || !method) ? <LoadingPopup type="content" /> : (
                        <div className="d-flex flex-column gap-1">
                            <div className="modal-payment-qr-header mb-3">
                                <h5 className="font-weight-600">Thanh toán</h5>
                                <span>Chuyển khoản hoặc quét mã QR để thanh toán qua tất cả Ví và Ngân hàng</span>
                            </div>

                            <div className="modal-payment-qr-content d-flex align-items-center flex-column px-3 py-3 bg-white">
                                <div>
                                    {paymentMethod[method].paymentMethodImageUrl && (<img src={paymentMethod[method].paymentMethodImageUrl} width={186} alt="paymentMethodImageUrl" />)}
                                </div>
                                <div className="w-100 d-flex flex-column gap-3 mt-4">
                                    <div className="d-flex align-items-start justify-content-between gap-1">
                                        <span className="modal-payment-qr-content-title">Tên tài khoản</span>
                                        <span className="word-break-all text-left w-100"><b>{paymentMethod[method].paymentMethodReferName}</b></span>
                                    </div>
                                    <div className="d-flex align-items-start justify-content-between gap-1">
                                        <span className="modal-payment-qr-content-title">Số tài khoản</span>

                                        <div className="d-flex align-items-start gap-2 w-100">
                                            <span className="word-break-all text-left"><b>{paymentMethod[method].paymentMethodIdentityNumber}</b></span>
                                            <CopyOutlined onClick={() => copyToClipboard(paymentMethod[method].paymentMethodIdentityNumber)} />
                                        </div>
                                    </div>
                                    <div className="d-flex align-items-start justify-content-between gap-1">
                                        <span className="modal-payment-qr-content-title">Số tiền</span>
                                        <div className="d-flex align-items-start gap-2 w-100">
                                            <span className="word-break-all text-blue-ribbon text-left"><b>{formatedTotalPay}đ</b></span>
                                            <CopyOutlined onClick={() => copyToClipboard(formatedTotalPay)} />
                                        </div>
                                    </div>
                                    <div className="d-flex align-items-start justify-content-between gap-1">
                                        <span className="modal-payment-qr-content-title">Nội dung</span>

                                        <div className="d-flex align-items-start gap-2 w-100">
                                            <div className="text-left w-100">
                                                <div className="word-break-all text-blue-ribbon text-left"><b>{qr?.paymentContent || ''}</b></div>
                                                <div className="text-danger">Vui lòng ghi đúng nội dung chuyển khoản</div>
                                            </div>
                                            <CopyOutlined onClick={() => copyToClipboard(qr?.paymentContent || '')} />
                                        </div>
                                    </div>
                                </div>

                                <div className="hr"></div>

                                <div className="modal-payment-qr-footer d-flex align-items-center gap-1 justify-content-center mb-2">
                                    <ExpiredWarningIcon />
                                    &nbsp;
                                    <span className="">{expiredText}</span>
                                    <span className={`modal-payment-qr-expired-in-countdown`}>
                                        <Countdown
                                            formater={(time) => {
                                                const minutes = Math.floor(time / 60);
                                                const seconds = time % 60;
                                                const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

                                                return formattedTime;
                                            }}
                                            seconds={expiredInMinutes * 60}
                                            event={() => {

                                            }}
                                            onEnd={() => {
                                                setExpiredText('Mã QR hết hiệu lực.');
                                                return <span onClick={onRf} className="text-blue-ribbon cursor-pointer font-weight-600">Làm mới</span>;
                                            }}
                                            key={runTime}
                                        />
                                    </span>
                                </div>
                                <div className="modal-payment-qr-img">
                                    <img src={qrUrl} alt='pr' width={186} height={186} />
                                </div>
                                <div className="mt-2">
                                    <a download={'qrcode'} href={qrUrl} className="download-qr py-1 px-3 text-blue-ribbon">Tải ảnh QR</a>
                                </div>
                            </div>

                            <div className="mt-4">
                                <DefaultButton
                                    className="w-100"
                                    colorType="dark"
                                    title='Đóng'
                                    action={onClose}
                                />
                            </div>
                        </div>
                    )
                }

            </Modal>
        </>
    );
};

export default ModalPaymentQR;