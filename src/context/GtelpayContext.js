import { useState, useEffect, useRef } from 'react';
import { initGtelpaySDK, getGtelpayConfig, isFromGtelpayUniversalLink, parseUniversalLinkParams, cleanupUrlParams } from '../helper/gtelpaySDK';
import gtelpayApiService from '../services/gtelpayApiService';

const isGtelpayEnabled = () => {
  const isMiniAppGtelpay = window?._env_?.REACT_APP_MINIAPP_GTELPAY === '1' || process.env.REACT_APP_MINIAPP_GTELPAY === '1';
  return isMiniAppGtelpay && getGtelpayConfig().isEnabled;
};

export const useGtelpayUserData = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isGtelpayWebView, setIsGtelpayWebView] = useState(false);
  const abortController = useRef(null);

  useEffect(() => {
    abortController.current = new AbortController();

    const initGtelpay = async () => {
      if (!isGtelpayEnabled() || !isFromGtelpayUniversalLink()) return;

      try {
        initGtelpaySDK();
        if (!localStorage.getItem('gtelpay_private_key')) {
          throw new Error('Failed to initialize Gtelpay private key');
        }
        setIsGtelpayWebView(true);
        setLoading(true);

        const { encryptedAccessCode, encryptedKey, transactionId } = parseUniversalLinkParams();
        
        const userInfo = await gtelpayApiService.executeGtelpayFlow({
          encryptedAccessCode,
          encryptedKey,
          transactionId
        });

        if (userInfo && !abortController.current?.signal.aborted) {
          setUserData(userInfo);
        }

        cleanupUrlParams();
      } catch (err) {
        if (!abortController.current?.signal.aborted) {
          setError(err.message);
        }
      } finally {
        if (!abortController.current?.signal.aborted) {
          setLoading(false);
        }
      }
    };

    initGtelpay();

    return () => abortController.current?.abort();
  }, []);

  const gtelpayUser = userData ? {
    fullName: userData.fullName || '',
    phoneNumber: userData.phoneNumber || ''
  } : { fullName: '', phoneNumber: '' };

  return { userData, gtelpayUser, loading, error, isGtelpayWebView };
};



