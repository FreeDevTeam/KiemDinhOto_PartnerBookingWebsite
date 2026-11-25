import React from 'react'
import { render, screen } from '@testing-library/react'
import ModalPaymentQR from './ModalPaymentQR'

jest.mock('../../helper/common', () => ({ copyToClipboard: jest.fn() }))
jest.mock('../../context/AppParamsContext', () => ({ useAppParamsContext: () => ({ isEmbeddedView: false }) }))

const QR_URL = 'https://img.vietqr.io/image/ACB-131321312312-compact.png?accountName=DLYBHAFFINA&addInfo=CSP1&amount=5790000'

function renderModal(bankQR) {
  return render(
    <ModalPaymentQR
      open
      onClose={() => {}}
      onRefresh={() => {}}
      method="bank"
      paymentMethodFullData={{ paymentMethodReceiverName: 'DLYBHAFFINA', paymentMethodIdentityNumber: '131321312312', paymentMethodImageUrl: null }}
      driver={{ totalPay: 5790000, formatedTotalPay: '5,790,000', qr: { bankQR, momoQR: null }, expiredInMinutes: 5, runTime: 1 }}
    />,
  )
}

describe('ModalPaymentQR', () => {
  it('hiển thị QR khi Backend chỉ trả qrCode là link ảnh VietQR (response thật), kèm nội dung chuyển khoản và số tiền', () => {
    renderModal({ qrCode: QR_URL, paymentContent: '8288_1795606630026' })

    expect(screen.getByAltText('QR code').getAttribute('src')).toBe(QR_URL)
    expect(screen.getByText('8288_1795606630026')).toBeTruthy()
    expect(screen.getByText('5,790,000đ')).toBeTruthy()
    expect(screen.getByText('131321312312')).toBeTruthy()
  })

  it('hiển thị QR khi Backend trả qrData (ảnh base64)', () => {
    renderModal({ qrData: 'data:image/png;base64,AAAA', qrCode: '000201...', paymentContent: 'ND' })
    expect(screen.getByAltText('QR code').getAttribute('src')).toBe('data:image/png;base64,AAAA')
  })
})
