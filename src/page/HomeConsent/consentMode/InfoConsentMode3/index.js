import { Checkbox } from 'antd'
import { useEffect, useState } from 'react'
import './index.scss'
import { AutomatedTrafficFineNotificationAuthenticationHideInfo, AutomatedTrafficFineNotificationAuthenticationShowInfo } from '../../assets/icons'
import Header from '../../../../components/Header'
import { useConsentContext } from '../../../../context/ConsentContext'
import FixedBottom from '../../components/base/FixedBottom'
import BaseButton from '../../components/base/BaseButton'
import BasePopupTerm from '../../components/base/BasePopupTerm'
import { redirectByMiniAppBackUrl } from '../../../../actions/miniAppBackAction'
import { ENV } from '../../../../constants/EnvironmentVariables'
import { useAppParamsContext } from '../../../../context/AppParamsContext'

const termsData = [
  {
    title: 'CHÍNH SÁCH QUYỀN RIÊNG TƯ',
    intro: [
      {
        content:
          'Chính sách Quyền riêng tư này (“Chính sách”) mô tả cách thức Chúng tôi thu thập, sử dụng và bảo vệ thông tin của Người dùng khi sử dụng mini app hoặc dịch vụ do Chúng tôi cung cấp trên các ứng dụng, nền tảng của đối tác (“Ứng dụng đối tác”).'
      },
      {
        content: 'Việc Người dùng tiếp tục sử dụng mini app đồng nghĩa với việc Người dùng đã đọc, hiểu và đồng ý với Chính sách này.'
      }
    ]
  },
  {
    title: '1. Phạm vi thu thập thông tin',
    intro: [
      {
        content: 'Hiện tại, Chúng tôi chỉ thu thập và xử lý các thông tin sau:',
        details: ['● Số điện thoại của Người dùng.']
      },
      {
        content: 'Chúng tôi không chủ động thu thập các dữ liệu cá nhân khác ngoài phạm vi nêu trên.'
      }
    ]
  },
  {
    title: '2. Mục đích sử dụng thông tin',
    intro: [
      {
        content: 'Số điện thoại được sử dụng nhằm:',
        details: [
          '● Xác thực Người dùng.',
          '● Liên hệ khi cần thiết để cung cấp dịch vụ.',
          '● Thực hiện các chức năng của mini app.',
          '● Đảm bảo an toàn hệ thống và phòng chống gian lận.',
          '● Thực hiện nghĩa vụ theo quy định pháp luật (nếu có).'
        ]
      },
      {
        content: 'Chúng tôi không sử dụng số điện thoại cho mục đích bán, trao đổi hoặc khai thác thương mại trái phép.'
      }
    ]
  },
  {
    title: '3. Chia sẻ thông tin',
    intro: [
      {
        content: 'Chúng tôi không bán hoặc chia sẻ số điện thoại của Người dùng cho bên thứ ba, trừ các trường hợp:',
        details: [
          '● Theo yêu cầu của cơ quan nhà nước có thẩm quyền.',
          '● Khi cần thiết để cung cấp dịch vụ theo yêu cầu của Người dùng.',
          '● Khi có sự đồng ý của Người dùng.'
        ]
      },
      {
        content: 'Trong mọi trường hợp, việc chia sẻ (nếu có) đều tuân thủ quy định pháp luật hiện hành.'
      }
    ]
  },
  {
    title: '3. Chia sẻ thông tin',
    intro: [
      {
        content: 'Chúng tôi không bán hoặc chia sẻ số điện thoại của Người dùng cho bên thứ ba, trừ các trường hợp:',
        details: [
          '● Theo yêu cầu của cơ quan nhà nước có thẩm quyền.',
          '● Khi cần thiết để cung cấp dịch vụ theo yêu cầu của Người dùng.',
          '● Khi có sự đồng ý của Người dùng.'
        ]
      },
      {
        content: 'Trong mọi trường hợp, việc chia sẻ (nếu có) đều tuân thủ quy định pháp luật hiện hành.'
      }
    ]
  },
  {
    title: '4. Tách biệt trách nhiệm với Ứng dụng đối tác',
    intro: [
      {
        content: 'Mini app được cung cấp thông qua Ứng dụng đối tác nhưng hoạt động độc lập về mặt xử lý dữ liệu.'
      },
      {
        content:
          'Chúng tôi chỉ chịu trách nhiệm đối với dữ liệu do Chúng tôi trực tiếp thu thập và xử lý trong phạm vi mini app này, cụ thể là số điện thoại như đã nêu tại Chính sách này.'
      },
      {
        content: 'Chúng tôi không chịu trách nhiệm đối với:',
        details: [
          '● Dữ liệu do Ứng dụng đối tác tự thu thập',
          '● Cách thức lưu trữ, xử lý hoặc chia sẻ dữ liệu của Ứng dụng đối tác.',
          '● Bất kỳ hoạt động xử lý dữ liệu nào ngoài phạm vi mini app.'
        ]
      },
      {
        content: 'Trong mọi trường hợp, việc chia sẻ (nếu có) đều tuân thủ quy định pháp luật hiện hành.'
      },
      {
        content: 'Người dùng cần tham khảo Chính sách quyền riêng tư riêng của từng Ứng dụng đối tác để hiểu rõ cách họ xử lý dữ liệu.'
      }
    ]
  },
  {
    title: '5. Lưu trữ và bảo mật',
    intro: [
      {
        content:
          'Chúng tôi áp dụng các biện pháp kỹ thuật và quản lý phù hợp nhằm bảo vệ số điện thoại của Người dùng khỏi truy cập trái phép, mất mát hoặc lạm dụng.'
      },
      {
        content: 'Dữ liệu được lưu trữ trong thời gian cần thiết để cung cấp dịch vụ hoặc theo quy định pháp luật.'
      }
    ]
  },
  {
    title: '6. Quyền của Người dùng',
    intro: [
      {
        content: 'Người dùng có quyền:',
        details: ['● Yêu cầu truy cập thông tin của mình', '● Yêu cầu truy cập thông tin của mình', '● Yêu cầu truy cập thông tin của mình']
      },
      {
        content: 'Yêu cầu có thể được gửi thông qua thông tin liên hệ được hiển thị trong mini app.'
      }
    ]
  },
  {
    title: '7. Cập nhật Chính sách',
    intro: [
      {
        content: 'Chúng tôi có thể cập nhật Chính sách này khi cần thiết. Phiên bản mới nhất sẽ được hiển thị trong mini app.'
      }
    ]
  }
]

const getDisplayValue = (value, hideInfo) => {
  if (!value?.trim()) return ''
  return hideInfo ? '*********' : value
}

export default function InfoConsentMode3() {
  const { isHeaderMiniApp } = useAppParamsContext()
  const { acceptConsentSession, consentUserProfile } = useConsentContext()
  const [hideInfo, setHideInfo] = useState(true)
  const [confirmTerm, setConfirmTerm] = useState(false)
  const [confirmTermSheetVisible, setConfirmTermSheetVisible] = useState(false)
  const isSubmitDisabled = !confirmTerm

  useEffect(() => {
    console.log('[CONSENT][Mode3] consentUserProfile changed', consentUserProfile)
  }, [consentUserProfile])

  return (
    <div>
      {isHeaderMiniApp && <Header title={'Xác nhận thông tin'} onBack={() => redirectByMiniAppBackUrl()} />}
      <div className="HomeConsentLaypout">
        <div className="InfoConsentMode2">
          <img className="InfoConsentMode2_img" src={'/logo.png'} alt="" />
          <div className="InfoConsentMode2_attention">Các dữ liệu sau sẽ được chia sẻ, xử lý với hệ thống tra cứu và thông báo phạt nguội:</div>
          <div className="InfoConsentMode2_carInfo">
            <div className="InfoConsentMode2_carInfo_hideInfo" onClick={() => setHideInfo(!hideInfo)}>
              {hideInfo ? <AutomatedTrafficFineNotificationAuthenticationHideInfo /> : <AutomatedTrafficFineNotificationAuthenticationShowInfo />}
              {hideInfo ? (
                <div className="InfoConsentMode2_carInfo_hideInfo_text">Ẩn thông tin</div>
              ) : (
                <div className="InfoConsentMode2_carInfo_hideInfo_text">Hiện thông tin</div>
              )}
            </div>
            <div className="InfoConsentMode2_carInfo_item">
              <div className="InfoConsentMode2_carInfo_item_label">Họ tên</div>
              <div className="InfoConsentMode2_carInfo_item_value">{getDisplayValue(consentUserProfile?.fullName, hideInfo)}</div>
            </div>
            <div className="InfoConsentMode2_carInfo_item">
              <div className="InfoConsentMode2_carInfo_item_label">Số điện thoại</div>
              <div className="InfoConsentMode2_carInfo_item_value">{getDisplayValue(consentUserProfile?.phoneNumber, hideInfo)}</div>
            </div>
          </div>
          <div className="InfoConsentMode2_purpose">
            <p className="InfoConsentMode2_purpose_title">Mục đích chia sẻ, xử lý dữ liệu:</p>
            <p className="InfoConsentMode2_purpose_content">
              Các trường thông tin trên được chia sẻ để phục vụ đánh giá và cung cấp các sản phẩm, dịch vụ cho Quý khách.
            </p>
          </div>
        </div>
      </div>
      <FixedBottom elementPaddingBottom={'LayoutPartner'}>
        <div style={{ marginBottom: '12px' }}>
          <Checkbox checked={confirmTerm} className="Base_Checkbox" onChange={(event) => setConfirmTerm(event.target.checked)}>
            <span>
              Tôi đã đọc Mục đích chia sẻ, xử lý dữ liệu,{' '}
              <span
                style={{ color: 'var(--brand-primary)' }}
                onClick={(event) => {
                  event.preventDefault()
                  event.stopPropagation()
                  setConfirmTermSheetVisible(true)
                }}>
                Quyền, nghĩa vụ của chủ thể dữ liệu{' '}
              </span>
              và đồng ý chia sẻ, xử lý dữ liệu cá nhân.
            </span>
          </Checkbox>
        </div>
        <BaseButton
          disabled={isSubmitDisabled}
          onClick={() => {
            console.log('[CONSENT][Mode3] Submit click', {
              isSubmitDisabled,
              consentUserProfile
            })
            acceptConsentSession(consentUserProfile)
          }}>
          Tiếp theo
        </BaseButton>
      </FixedBottom>

      <BasePopupTerm
        isOpen={confirmTermSheetVisible}
        onClose={() => setConfirmTermSheetVisible(false)}
        title="Chi tiết"
        textButton="Đóng"
        onConfirm={() => setConfirmTermSheetVisible(false)}>
        <div className="HomeConsent_terms">
          {termsData.map((item, index) => (
            <div key={index} className="terms_item">
              <div className="terms_item_title">{item.title}</div>
              {item.intro.map((intro, childIndex) => (
                <div key={childIndex}>
                  <div className="terms_item_intro">
                    <div className="terms_item_intro_content">{intro.content}</div>
                    <div className="terms_item_intro_details">
                      {intro.details && intro.details.map((detail, detailIndex) => <p key={detailIndex}>{detail}</p>)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </BasePopupTerm>
    </div>
  )
}
