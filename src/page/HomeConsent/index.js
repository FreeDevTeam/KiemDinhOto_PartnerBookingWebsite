import BaseButton from './components/base/BaseButton'
import FixedBottom from './components/base/FixedBottom'
import './index.scss'
import { Checkbox } from 'antd'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import BasePopupTerm from './components/base/BasePopupTerm'
import { useConsentContext } from '../../context/ConsentContext'
import { useGlobalContext } from '../../context/GlobalContext'
import { useAppParamsContext } from '../../context/AppParamsContext'
import InfoConsentMode1 from './conponents/ConsentMode/InfoConsentMode1'
import InfoConsentMode2 from './conponents/ConsentMode/InfoConsentMode2'
import InfoConsentMode3 from './conponents/ConsentMode/InfoConsentMode3'
import { EMPTY_MODE2_USER_PROFILE, getActiveMode2PartnerFlow, resetMode2PartnerFlow, resolveMode2PartnerData } from './mode2PartnerFlow'
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

const CONSENT_MODE_1 = 1
const CONSENT_MODE_2 = 2
const CONSENT_MODE_3 = 3

const MODE2_FIELD_LABELS = {
  fullName: 'Họ tên',
  phoneNumber: 'Số điện thoại',
  uuid: 'UUID'
}

const createInitialMode2ConsentState = () => {
  return {
    partnerKey: '',
    partnerLabel: '',
    userProfile: {
      ...EMPTY_MODE2_USER_PROFILE
    },
    requiredParams: {},
    missingUserProfileFields: [],
    missingRequiredParams: [],
    errorMessage: '',
    hasLoaded: false,
    isComplete: false
  }
}

const normalizeProfileValue = (value) => {
  if (typeof value === 'string') return value
  return ''
}

const getTrimmedConsentUserProfile = (value) => {
  return {
    uuid: normalizeProfileValue(value?.uuid).trim(),
    phoneNumber: normalizeProfileValue(value?.phoneNumber).trim(),
    fullName: normalizeProfileValue(value?.fullName).trim()
  }
}

export default function HomeConsent() {
  const [confirmTerm, setConfirmTerm] = useState(false)
  const [confirmTermSheetVisible, setConfirmTermSheetVisible] = useState(false)
  const [submitError, setSubmitError] = useState(false)
  const [mode2ConsentState, setMode2ConsentState] = useState(() => createInitialMode2ConsentState())
  const latestMode2ContextRef = useRef(null)
  const mode2RequestIdRef = useRef(0)

  const appParams = useAppParamsContext()
  const { globalState, handleGetUserPhone, handleGetUserName } = useGlobalContext()
  const { acceptConsentSession, consentSessionState, consentUserProfile, updateConsentSessionState, updateConsentUserProfile } = useConsentContext()

  const consentMode = consentSessionState?.consentMode
  const isConsentMode1 = consentMode === CONSENT_MODE_1
  const isConsentMode2 = consentMode === CONSENT_MODE_2
  const isConsentMode3 = consentMode === CONSENT_MODE_3
  const isConsentLoading = consentSessionState?.isLoading === true

  useEffect(() => {
    latestMode2ContextRef.current = {
      appParams,
      globalState,
      handleGetUserName,
      handleGetUserPhone,
      search: window.location.search
    }
  }, [appParams, globalState, handleGetUserName, handleGetUserPhone])

  useEffect(() => {
    return () => {
      mode2RequestIdRef.current += 1
    }
  }, [])

  const loadMode2PartnerInfo = useCallback(
    async ({ shouldResetFlow = false } = {}) => {
      const requestId = mode2RequestIdRef.current + 1
      const activeFlow = getActiveMode2PartnerFlow()

      mode2RequestIdRef.current = requestId
      setSubmitError(false)
      setMode2ConsentState((prev) => ({
        ...prev,
        errorMessage: ''
      }))
      updateConsentSessionState({ isLoading: true })

      try {
        if (shouldResetFlow) {
          await resetMode2PartnerFlow()
        }

        const result = await resolveMode2PartnerData(latestMode2ContextRef.current || {})

        if (mode2RequestIdRef.current !== requestId) {
          return false
        }

        setMode2ConsentState({
          partnerKey: result.flow.key,
          partnerLabel: result.flow.label,
          userProfile: result.userProfile,
          requiredParams: result.requiredParams,
          missingUserProfileFields: result.missingUserProfileFields,
          missingRequiredParams: result.missingRequiredParams,
          errorMessage: '',
          hasLoaded: true,
          isComplete: result.isComplete
        })
        updateConsentUserProfile(result.userProfile)

        return true
      } catch (error) {
        console.error('HomeConsent: failed to load consent mode 2 partner info', error)

        if (mode2RequestIdRef.current !== requestId) {
          return false
        }

        setMode2ConsentState({
          ...createInitialMode2ConsentState(),
          partnerKey: activeFlow.key,
          partnerLabel: activeFlow.label,
          hasLoaded: true,
          errorMessage: activeFlow.label
            ? `Không thể lấy thông tin từ ${activeFlow.label}. Vui lòng thử lại.`
            : 'Không thể lấy thông tin từ đối tác. Vui lòng thử lại.'
        })
        updateConsentUserProfile({
          ...EMPTY_MODE2_USER_PROFILE
        })

        return false
      } finally {
        if (mode2RequestIdRef.current === requestId) {
          updateConsentSessionState({ isLoading: false })
        }
      }
    },
    [updateConsentSessionState, updateConsentUserProfile]
  )

  useEffect(() => {
    if (!isConsentMode2) {
      mode2RequestIdRef.current += 1
      setMode2ConsentState(createInitialMode2ConsentState())
      updateConsentSessionState({ isLoading: false })
      return
    }

    loadMode2PartnerInfo()
  }, [isConsentMode2, loadMode2PartnerInfo, updateConsentSessionState])

  const trimmedConsentUserProfile = useMemo(() => {
    return getTrimmedConsentUserProfile(consentUserProfile)
  }, [consentUserProfile])

  const isMode2SubmitEnabled = useMemo(() => {
    if (!isConsentMode2) return false
    return mode2ConsentState.isComplete && confirmTerm
  }, [confirmTerm, isConsentMode2, mode2ConsentState.isComplete])

  const isMode3SubmitEnabled = useMemo(() => {
    if (!isConsentMode3) return false

    return !!trimmedConsentUserProfile.fullName && !!trimmedConsentUserProfile.phoneNumber && confirmTerm
  }, [confirmTerm, isConsentMode3, trimmedConsentUserProfile.fullName, trimmedConsentUserProfile.phoneNumber])

  const mode2StatusMessage = useMemo(() => {
    if (!isConsentMode2 || !mode2ConsentState.hasLoaded || isConsentLoading || mode2ConsentState.isComplete) {
      return ''
    }

    const partnerLabel = mode2ConsentState.partnerLabel ? ` từ ${mode2ConsentState.partnerLabel}` : ' từ đối tác'

    if (mode2ConsentState.errorMessage) {
      return mode2ConsentState.errorMessage
    }

    const missingFields = [
      ...mode2ConsentState.missingUserProfileFields.map((field) => MODE2_FIELD_LABELS[field] || field),
      ...mode2ConsentState.missingRequiredParams
    ]

    if (missingFields.length > 0) {
      return `Thiếu dữ liệu bắt buộc${partnerLabel}: ${missingFields.join(', ')}.`
    }

    return `Không thể lấy đầy đủ thông tin${partnerLabel}. Vui lòng thử lại.`
  }, [
    isConsentLoading,
    isConsentMode2,
    mode2ConsentState.errorMessage,
    mode2ConsentState.hasLoaded,
    mode2ConsentState.isComplete,
    mode2ConsentState.partnerLabel,
    mode2ConsentState.missingRequiredParams,
    mode2ConsentState.missingUserProfileFields
  ])

  const shouldShowMode2Retry = isConsentMode2 && mode2ConsentState.hasLoaded && !isConsentLoading && !mode2ConsentState.isComplete

  const handleRetryMode2 = useCallback(() => {
    loadMode2PartnerInfo({ shouldResetFlow: true })
  }, [loadMode2PartnerInfo])

  const handleChangeConsentProfileField = (field, value) => {
    setSubmitError(false)
    updateConsentUserProfile({
      [field]: value
    })
  }

  const handleSubmitConsent = () => {
    setSubmitError(false)
    let isSuccess = false

    if (isConsentMode1) {
      if (!confirmTerm) {
        return
      }

      isSuccess = acceptConsentSession()
    }

    if (isConsentMode2) {
      if (!isMode2SubmitEnabled) {
        return
      }

      isSuccess = acceptConsentSession(mode2ConsentState.userProfile)
    }

    if (isConsentMode3) {
      if (!isMode3SubmitEnabled) {
        return
      }

      isSuccess = acceptConsentSession(trimmedConsentUserProfile)
    }

    if (!isSuccess) {
      setSubmitError(true)
    }
  }

  const renderConsentModeInfo = () => {
    if (isConsentMode2) {
      return <InfoConsentMode2 sdkUserProfile={mode2ConsentState.userProfile} isLoading={isConsentLoading} />
    }

    if (isConsentMode3) {
      return (
        <InfoConsentMode3
          consentUserProfile={consentUserProfile}
          isLoading={false}
          onChangeFullName={(value) => handleChangeConsentProfileField('fullName', value)}
          onChangePhoneNumber={(value) => handleChangeConsentProfileField('phoneNumber', value)}
        />
      )
    }

    return <InfoConsentMode1 />
  }

  const isSubmitDisabled = isConsentMode2 ? !isMode2SubmitEnabled : isConsentMode3 ? !isMode3SubmitEnabled : !confirmTerm

  return (
    <div style={{ maxWidth: 600, margin: 'auto', minHeight: '100vh' }}>
      {/* <HeaderPartner title="Xác nhận thông tin" /> */}
      {/* <div className="AutomatedTrafficFineNotificationAuthentication"> */}
        {renderConsentModeInfo()}
        {shouldShowMode2Retry && (
          <div className="AutomatedTrafficFineNotificationAuthentication_retry">
            {mode2StatusMessage && <div className="AutomatedTrafficFineNotificationAuthentication_retryMessage">{mode2StatusMessage}</div>}
            <BaseButton onClick={handleRetryMode2}>Thử lại</BaseButton>
          </div>
        )}
      {/* </div> */}

      {/* <FixedBottom elementPaddingBottom={'LayoutPartner'}>
        {!isConsentLoading && (
          <>
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
            {submitError && (
              <div style={{ marginBottom: '12px', color: 'var(--error-color, #ff4d4f)' }}>
                Không thể lưu xác nhận. Vui lòng thử lại.
              </div>
            )}
            <BaseButton disabled={isSubmitDisabled} onClick={handleSubmitConsent}>
              Tiếp theo
            </BaseButton>
          </>
        )}
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
      </BasePopupTerm> */}
    </div>
  )
}
