import React, { useEffect, useRef, useState } from 'react'
import "zmp-ui/zaui.min.css";
import BookingService from './../../services/addBookingService'
import { useGlobalContext } from '../../context/GlobalContext'
import { Spin } from 'antd';
import CryptoJS from 'crypto-js';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import MainLogo from '../../components/MainLogo';
import { PATH } from '../../constants/router';
import { SessionStorageManager } from '../../helper/localStorage';
import './index.scss';

const LOGIN_TIMEOUT_MS = 3000
const LOGIN_FAIL_MESSAGE = 'Tải dữ liệu thất bại. Vui lòng liên hệ CSKH để được hỗ trợ'
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const normalizePhone = (phone = '') => String(phone).replace(/\s+/g, '')
const normalizeLogoName = (logo = '') => String(logo || '').trim().replace(/\.png$/i, '')

const getResolvedVnpayAesKey = () => {
  try {
    const params = new URLSearchParams(window.location.search)
    const queryKey = (params.get('aesKey') || '').trim()
    if (queryKey) {
      localStorage.setItem('vnpayAesKey', queryKey)
      return queryKey
    }
  } catch (error) {
    // Ignore URL parsing errors.
  }

  const localKey = (localStorage.getItem('vnpayAesKey') || '').trim()
  if (localKey) {
    return localKey
  }

  const runtimeKey = (window?._env_?.REACT_APP_VNPAY_AES_KEY || '').trim()
  if (runtimeKey) {
    return runtimeKey
  }

  return (process.env.REACT_APP_VNPAY_AES_KEY || '').trim()
}

const parseAesKey = (rawKey = '') => {
  const key = String(rawKey || '').trim()
  if (!key) return null
  if (/^[0-9a-fA-F]{64}$/.test(key)) {
    return CryptoJS.enc.Hex.parse(key)
  }
  const normalized = key.padEnd(32, '0').slice(0, 32)
  return CryptoJS.enc.Utf8.parse(normalized)
}

const parsePayloadFromDataParam = (dataParam = '') => {
  if (!dataParam) {
    throw new Error('Missing data param')
  }

  try {
    return JSON.parse(dataParam)
  } catch (error) {
    // Continue with decoding branches below.
  }

  const safeData = String(dataParam).trim().replace(/ /g, '+')

  let base64Bytes
  try {
    base64Bytes = CryptoJS.enc.Base64.parse(safeData)
  } catch (error) {
    throw new Error('Invalid data format')
  }

  const key = parseAesKey(getResolvedVnpayAesKey())

  if (!key) {
    const decoded = CryptoJS.enc.Utf8.stringify(base64Bytes)
    return JSON.parse(decoded)
  }

  const hexData = base64Bytes.toString(CryptoJS.enc.Hex)
  if (!hexData || hexData.length <= 32) {
    throw new Error('Invalid encrypted data')
  }

  const ivHex = hexData.slice(0, 32)
  const encryptedHex = hexData.slice(32)

  const decrypted = CryptoJS.AES.decrypt(
    { ciphertext: CryptoJS.enc.Hex.parse(encryptedHex) },
    key,
    {
      iv: CryptoJS.enc.Hex.parse(ivHex),
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    }
  )

  const decryptedText = decrypted.toString(CryptoJS.enc.Utf8)
  if (!decryptedText) {
    throw new Error('Cannot decrypt payload')
  }

  return JSON.parse(decryptedText)
}

const decodeBase64ToUint8Array = (base64String = '') => {
  const binary = window.atob(base64String)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

const importRsaPublicKey = async (pem = '', hashName = 'SHA-256') => {
  const pemBody = pem
    .replace('-----BEGIN PUBLIC KEY-----', '')
    .replace('-----END PUBLIC KEY-----', '')
    .replace(/\s+/g, '')

  const keyData = decodeBase64ToUint8Array(pemBody)

  return window.crypto.subtle.importKey(
    'spki',
    keyData.buffer,
    {
      name: 'RSASSA-PKCS1-v1_5',
      hash: { name: hashName },
    },
    false,
    ['verify']
  )
}

const verifyVnpayToken = async (payload = {}) => {
  const rsaPublicKey = (process.env.REACT_APP_VNPAY_RSA_PUBLIC_KEY || '').trim()
  const token = (payload?.token || '').trim()

  // Public key may be configured later by deployment env, skip verification until available.
  if (!rsaPublicKey || !token) {
    return true
  }

  const hashName = (process.env.REACT_APP_VNPAY_RSA_HASH || 'SHA-256').toUpperCase()
  const verifyContent = `${payload?.mobile || ''}${payload?.bankCode || ''}${payload?.bankName || ''}`

  const publicKey = await importRsaPublicKey(rsaPublicKey, hashName)
  const signature = decodeBase64ToUint8Array(token.replace(/ /g, '+'))
  const encodedContent = new TextEncoder().encode(verifyContent)

  return window.crypto.subtle.verify(
    {
      name: 'RSASSA-PKCS1-v1_5',
    },
    publicKey,
    signature,
    encodedContent
  )
}

const HomeLogin = (props) => {
  const history = useHistory()
  const { handleGetUserPhone, globalState } = useGlobalContext();
  const [errorMessage, setErrorMessage] = useState('')
  const timeoutRef = useRef(null)
  const isTimeoutRef = useRef(false)
  const isUnmountedRef = useRef(false)
  const isProcessCompletedRef = useRef(false)
  const startAtRef = useRef(0)

  const clearTimer = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }

  const failAndStop = () => {
    isProcessCompletedRef.current = false
    if (isTimeoutRef.current && !isUnmountedRef.current) {
      setErrorMessage(LOGIN_FAIL_MESSAGE)
    }
  }

  const saveConsentProfile = (phoneNumber, fullName = '') => {
    const profile = {
      uuid: phoneNumber || '',
      phoneNumber: phoneNumber || '',
      fullName: fullName || ''
    }

    localStorage.setItem('vnpayPhoneNumber', profile.phoneNumber)
    localStorage.setItem('vnpayFullName', profile.fullName)
    SessionStorageManager.setItem('consentUserProfile', profile)
  }

  const loginByApikey = async (phoneNumber, firstName) => {
    let value = {
      phoneNumber: normalizePhone(phoneNumber),
      firstName: firstName || undefined
    }
    const result = await BookingService.loginByApikey(value)
    const { isSuccess, data } = result
    if (!isSuccess || !data?.token) {
      throw new Error('Login by api key failed')
    }

    return {
      userToken: data?.token,
      appUserId: data?.appUserId
    }
  }

  useEffect(() => {
    startAtRef.current = Date.now()
    timeoutRef.current = setTimeout(() => {
      if (isProcessCompletedRef.current) {
        return
      }

      isTimeoutRef.current = true
      if (!isUnmountedRef.current) {
        setErrorMessage(LOGIN_FAIL_MESSAGE)
      }
    }, LOGIN_TIMEOUT_MS)

    const handleLogin = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search)
        const encryptedData = urlParams.get('data')
        const logoParam = normalizeLogoName(urlParams.get('logo'))

        if (logoParam) {
          localStorage.setItem('miniappLogo', logoParam)
        }

        if (encryptedData) {
          const payload = parsePayloadFromDataParam(encryptedData)
          const isTokenValid = await verifyVnpayToken(payload)
          if (!isTokenValid) {
            throw new Error('Invalid VNPAY token')
          }

          localStorage.setItem('vnpayWebviewData', JSON.stringify(payload))

          const phoneFromPayload = normalizePhone(payload?.mobile)
          const fullNameFromPayload = (payload?.fname || '').trim()
          if (!phoneFromPayload) {
            throw new Error('Missing phone from payload')
          }

          saveConsentProfile(phoneFromPayload, fullNameFromPayload)

          if (isTimeoutRef.current) {
            return
          }

          const loginResult = await loginByApikey(phoneFromPayload, fullNameFromPayload)
          isProcessCompletedRef.current = true

          const remainingTime = LOGIN_TIMEOUT_MS - (Date.now() - startAtRef.current)
          if (remainingTime > 0) {
            await wait(remainingTime)
          }

          if (isTimeoutRef.current || isUnmountedRef.current) {
            return
          }

          localStorage.setItem('userToken', loginResult.userToken)
          localStorage.setItem('appUserId', loginResult.appUserId)
          clearTimer()
          history.replace(PATH.HOME, { token: loginResult.userToken })
          return
        }

        const phone = globalState?.phoneNumber || await handleGetUserPhone()
        const userName = globalState?.userName

        saveConsentProfile(normalizePhone(phone), userName || '')

        if (isTimeoutRef.current) {
          return
        }

        const loginResult = await loginByApikey(phone, userName)
        isProcessCompletedRef.current = true

        const remainingTime = LOGIN_TIMEOUT_MS - (Date.now() - startAtRef.current)
        if (remainingTime > 0) {
          await wait(remainingTime)
        }

        if (isTimeoutRef.current || isUnmountedRef.current) {
          return
        }

        localStorage.setItem('userToken', loginResult.userToken)
        localStorage.setItem('appUserId', loginResult.appUserId)
        clearTimer()
        history.replace(PATH.HOME, { token: loginResult.userToken })
      } catch (error) {
        failAndStop()
      }
    }

    handleLogin()

    return () => {
      isUnmountedRef.current = true
      clearTimer()
    }
  }, []);


  return (
    <>
      <div className="loading login-loading-container">
        {errorMessage ? (
          <div className="login-loading-message">{errorMessage}</div>
        ) : (
          <div className="login-loading-content">
            <MainLogo height={64} width={64} className="login-loading-logo" />
            <Spin style={{ width: '100%' }} className="mt-3" />
            <div className="login-loading-text">Loading...</div>
          </div>
        )}
      </div>
    </>
  )
}
export default HomeLogin