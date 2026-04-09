import { useHistory } from 'react-router-dom'
import BaseButton from './components/base/BaseButton'
import FixedBottom from './components/base/FixedBottom'
import './index.scss'
import { Checkbox } from 'antd'
import { useState } from 'react'
import BasePopupTerm from './components/base/BasePopupTerm'
import AutomatedTrafficFineNotificationAuthenticationInfo from './conponents/ConsentMode/ConsentMode2'
// import { PATH } from '../../constants/router'

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
export default function HomeConsent() {
  const history = useHistory()
  const [confirmTerm, setConfirmTerm] = useState(false)
  const [confirmTermSheetVisible, setConfirmTermSheetVisible] = useState(false)
  return (
     <div className="layout2-body" style={{ maxWidth: 600, margin: 'auto',minHeight: '100vh'}}>
      {/* <HeaderPartner title="Xác nhận thông tin" /> */}
      <div className="AutomatedTrafficFineNotificationAuthentication">
        <AutomatedTrafficFineNotificationAuthenticationInfo />
      </div>

      <FixedBottom elementPaddingBottom={'LayoutPartner'}>
        <div style={{ marginBottom: '12px' }}>
          <Checkbox checked={confirmTerm} className="Base_Checkbox" onChange={(e) => setConfirmTerm(e.target.checked)}>
            <span>
              Tôi đã đọc Mục đích chia sẻ, xử lý dữ liệu,{' '}
              <span
                style={{ color: 'var(--brand-primary)' }}
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setConfirmTermSheetVisible(true)
                }}>
                Quyền, nghĩa vụ của chủ thể dữ liệu{' '}
              </span>
              và đồng ý chia sẻ, xử lý dữ liệu cá nhân.
            </span>
          </Checkbox>
        </div>
        <BaseButton disabled={!confirmTerm} onClick={() => {}}>
          Tiếp theo
        </BaseButton>
      </FixedBottom>

      <BasePopupTerm
        isOpen={confirmTermSheetVisible}
        onClose={() => setConfirmTermSheetVisible(false)}
        title="Chi tiết"
        textButton="Đóng"
        onConfirm={() => setConfirmTermSheetVisible(false)}>
        <div className="AutomatedTrafficFineNotificationAuthentication_terms">
          {termsData.map((item, index) => (
            <div key={index} className="terms_item">
              <div className="terms_item_title">{item.title}</div>
              {item.intro.map((intro, index) => (
                <div key={index}>
                  <div className="terms_item_intro">
                    <div className="terms_item_intro_content">{intro.content}</div>
                    <div className="terms_item_intro_details">
                      {intro.details && intro.details.map((detail, index) => <p key={index}>{detail}</p>)}
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
