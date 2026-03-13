import React, { useEffect, useState } from 'react'
import './index.scss'
import PaymentService from '../../services/paymentService'
import { useAppParamsContext } from '../../context/AppParamsContext'

export const PAYMENT_TYPE_CODE = {
  ATM_BANK: 'ATM_BANK',
  MOMO: 'MOMO',
  GTELPAY: 'GTELPAY',
  VNPAY: 'VNPAY',
  ZALOPAY: 'ZALOPAY',
  VIETTEL_PAY: 'VIETTEL_PAY',
  TA_MOVE: 'TA_MOVE',
  SEPAY: 'SEPAY',
  SHOPEEPAY: 'SHOPEEPAY',
  BAOKIM: 'BAOKIM'
}

export const PAYMENT_TYPE = {
  ATM_BANK: 1,
  MOMO_BANK: 2,
  GTEL_PAY: 3,
  VNPAY: 4,
  ZALOPAY: 5,
  VIETTEL_PAY: 6,
  TA_MOVE: 7,
  SEPAY: 8,
  VIETTEL_MONEY: 9,
  SHOPEEPAY: 10,
  BAOKIM: 11
}

// Mapping theo những cái truyền lên params đã gửi khách hàng
export const PAYMENT_TYPE_PARAMS = {
  ATM_BANK: ['bank'],
  MOMO_BANK: ['momo'],
  GTEL_PAY: ['gtelpay'],
  VNPAY: ['vnpay'],
  ZALOPAY: ['zalopay'],
  VIETTEL_PAY: ['viettelpay', 'viettel_pay'],
  TA_MOVE: ['tamove'],
  SEPAY: ['sepay'],
  VIETTEL_MONEY: ['viettelmoney', 'viettel_money'],
  SHOPEEPAY: ['shopeepay', 'shopee_pay'],
  BAOKIM: ['baokim']
}

// Kiểm tra nếu là TaMove thì sẽ ẩn ngân hàng, nếu là Ngân hàng thì sẽ ẩn tamove
export const PAYMENT_METHOD_ID_SHOW_HIDE_WITH_THEME = {
  bank: {
    value: 'bank',
    paymentTypeCode: PAYMENT_TYPE_CODE.ATM_BANK,
    theme: ['TTDK', 'DKON', 'VIPMEMBER', 'IHANOI']
  },
  TAMove: {
    value: 'TAMove',
    paymentTypeCode: PAYMENT_TYPE_CODE.TA_MOVE,
    theme: ['TAMOVE']
  },
  gtelPay: {
    value: 'gtelPay',
    paymentTypeCode: PAYMENT_TYPE_CODE.GTELPAY,
    theme: ['TTDK', 'DKON', 'VIPMEMBER']
  },
  zaloPay: {
    value: 'zaloPay',
    paymentTypeCode: PAYMENT_TYPE_CODE.ZALOPAY,
    theme: ['TTDK', 'DKON', 'VIPMEMBER']
  },
  vnpay: {
    value: 'vnpay',
    paymentTypeCode: PAYMENT_TYPE_CODE.VNPAY,
    theme: ['TTDK', 'DKON', 'VIPMEMBER', 'TAMOVE']
  },
  shopeePay: {
    value: 'shopeePay',
    paymentTypeCode: PAYMENT_TYPE_CODE.SHOPEEPAY,
    theme: ['TTDK', 'DKON', 'VIPMEMBER']
  },
  baoKim: {
    value: 'baoKim',
    paymentTypeCode: PAYMENT_TYPE_CODE.BAOKIM,
    theme: ['TAMOVE']
  }
}

export const checkShowPaymentMethodWithTheme = (paymentMethods = []) => {
  const CURRENT_THEME = process.env.REACT_APP_THEME_NAME || 'TTDK'
  return paymentMethods.filter((method) => {
    // Tìm trong config
    const config = Object.values(PAYMENT_METHOD_ID_SHOW_HIDE_WITH_THEME).find((item) => item.paymentTypeCode === method.paymentTypeCode)

    // Nếu không có config -> mặc định hiển thị
    if (!config) return true

    // Nếu có config, chỉ hiển thị khi theme đúng
    return config.theme.includes(CURRENT_THEME)
  })
}

const PaymentMethodSelection = ({ paymentMethod, setPaymentMethod, setListPaymentMethod = () => {} }) => {
  const [data, setData] = useState({})
  const { paymentMethodType } = useAppParamsContext()

  //   const ICON_PAYMENT_TYPE = {
  //     [PAYMENT_TYPE.ATM_BANK]: {
  //       icon: <BankIcon height={40} />,
  //       text: 'Quét mã QR'
  //     },
  //     [PAYMENT_TYPE.MOMO_BANK]: {
  //       icon: <MomoIcon height={40} />,
  //       text: 'Ví Momo'
  //     },
  //     [PAYMENT_TYPE.GTEL_PAY]: {
  //       icon: <img src={gtelPay} height={40} />,
  //       text: 'GtelPay'
  //     }
  //   }

  // const allowedPaymentMethods = [PAYMENT_TYPE_CODE.ATM_BANK, PAYMENT_TYPE_CODE.GTELPAY, PAYMENT_TYPE_CODE.TA_MOVE, PAYMENT_TYPE_CODE.SHOPEEPAY]

  useEffect(() => {
    ;(async () => {
      try {
        const data = await PaymentService.getPaymentQRMethod({})
        const paymentMethodFromSession = paymentMethodType
        let filteredData = Object.values(data)
        if (paymentMethodFromSession && paymentMethodFromSession !== undefined && paymentMethodFromSession !== null) {
          filteredData = filteredData.filter((item) => item.paymentMethodType == paymentMethodFromSession)
        } else {
          // Phần này sẽ check hiển thị theo đúng theme (phân sách SMoc và TAMove)
          filteredData = checkShowPaymentMethodWithTheme(filteredData)
        }
        // Tạm thời ẩn phương thức GtelPay
        filteredData = filteredData.filter((item) => item.paymentMethodType !== PAYMENT_TYPE.GTEL_PAY && item.paymentMethodType !== PAYMENT_TYPE_CODE.GTELPAY)
        const dataConverted = Object.fromEntries(
          filteredData.map((item) => {
            // tạm thời ẩn đi zalopay, nào cần mở thì xóa 3 dòng dưới là đươc
            // if (item?.paymentMethodType === PAYMENT_TYPE.ZALOPAY) {
            //   item.paymentMethodEnable = 0
            // }
            return [item.paymentMethodId, item]
          })
        )
        setPaymentMethod(Object.values(dataConverted || {})?.[0]?.paymentMethodId)
        setData(dataConverted)
        setListPaymentMethod(dataConverted)
      } catch (err) {
        console.log('fail to get payment methods')
      }
    })()
  }, [])

  return (
    <div className="payment-method-selection">
      <h6 className="mb-0">Phương thức thanh toán</h6>
      <div className="text-primary">Vui lòng chọn 1 hình thức</div>

      <div className="mt-3">
        <div className="d-flex flex-row gap-3 align-items-center flex-wrap">
          {Object.values(data).length > 0 &&
            Object.values(data)?.map(
              (item) =>
                item?.paymentMethodEnable === 1 && (
                  <div
                    key={item?.paymentMethodId}
                    onClick={() => setPaymentMethod(item?.paymentMethodId)}
                    className={`payment-method-selection-item py-3 d-flex flex-column align-items-center justify-content-center gap-3 bg-white ${
                      Object.values(data)?.length === 1 && 'w-100'
                    } ${paymentMethod === item?.paymentMethodId && 'active'}`}>
                    <img
                      height={item?.paymentMethodName === 'ZaloPay' ? 50 : 30}
                      src={item?.paymentMethodImageUrl}
                      alt={item?.paymentMethodReferName}
                    />
                    <div>{item?.paymentMethodName}</div>
                  </div>
                )
            )}
        </div>
      </div>
    </div>
  )
}

export default PaymentMethodSelection
