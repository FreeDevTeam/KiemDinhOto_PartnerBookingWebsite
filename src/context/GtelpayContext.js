import React, { useState, useEffect } from 'react';
import { GTELPAY_CONFIG } from '../constants/gtelpayConfig';
import GtelpayWebViewSDK from '../helper/gtelpayWebViewSDK';

export const useGtelpayUserData = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isGtelpayWebView, setIsGtelpayWebView] = useState(false);

  useEffect(() => {
    const initializeGtelpayData = async () => {
      try {
        const isMiniAppGtelpay = window?._env_?.REACT_APP_MINIAPP_GTELPAY === '1' ||
                                process.env.REACT_APP_MINIAPP_GTELPAY === '1';
        if (!isMiniAppGtelpay || !GTELPAY_CONFIG.isEnabled) {
          return;
        }
        if (!GtelpayWebViewSDK.isFromGtelpayUniversalLink()) {
          setIsGtelpayWebView(false);
          return;
        }
        let retries = 0;
        const maxRetries = 20;
        const retryDelay = 150;
        while (!localStorage.getItem('gtelpay_private_key') && retries < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          retries++;
        }
        if (!localStorage.getItem('gtelpay_private_key')) {
          throw new Error('Private key không được tải');
        }
        setIsGtelpayWebView(true);
        setLoading(true);
        const userInfo = await GtelpayWebViewSDK.initializeWebView();
        if (userInfo) {
          setUserData(userInfo);
        }
        GtelpayWebViewSDK.cleanupUrlParams();
      } catch (err) {
        console.error('[Gtelpay] Initialize error:', err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    initializeGtelpayData();
  }, []);

  return { userData, loading, error, isGtelpayWebView };
};

