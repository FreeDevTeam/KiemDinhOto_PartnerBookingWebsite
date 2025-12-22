import { useState, useEffect, useRef, useMemo } from 'react';
import gtelpayApiService from '../services/gtelpayApiService';

export const GTELPAY_CONFIG = {
  backendUrl: process.env.REACT_APP_API_URL,
  isEnabled: () => {
    return window?._env_?.REACT_APP_MINIAPP_GTELPAY === '1' ||
           process.env.REACT_APP_MINIAPP_GTELPAY === '1';
  }
};

/** Check if URL has GTEL params */
const isFromGtelpayUniversalLink = () => {
  const params = new URLSearchParams(window.location.search);
  return !!(params.get('access_code') && params.get('key') && params.get('transaction_id'));
};

const gtelpayFlowCache = new Map();

// Initialize Gtelpay consent flow once per session
const initGtelpayFlowOnce = async () => {
  const cacheKey = GTELPAY_CONFIG.backendUrl || 'default';

  if (gtelpayFlowCache.has(cacheKey)) {
    const cached = gtelpayFlowCache.get(cacheKey);
    
    if (cached.error) {
      throw cached.error;
    }
    
    // Return successful result
    if (cached.result) {
      return cached.result;
    }

    // Wait for in-progress promise
    if (cached.promise) {
      return await cached.promise;
    }
  }

  // Skip if not enabled or not a Gtelpay URL
  if (!GTELPAY_CONFIG.isEnabled() || !isFromGtelpayUniversalLink()) {
    const skippedResult = { skipped: true };
    gtelpayFlowCache.set(cacheKey, { result: skippedResult });
    return skippedResult;
  }

  // Create promise and store it to prevent race conditions
  const promise = (async () => {
    try {
      const userInfo = await gtelpayApiService.executeGtelpayFlow();
      
      gtelpayFlowCache.set(cacheKey, { 
        result: userInfo,
        timestamp: Date.now()
      });
      return userInfo;
    } catch (error) {
      gtelpayFlowCache.delete(cacheKey);
      throw error;
    }
  })();

  gtelpayFlowCache.set(cacheKey, { promise });

  return promise;
};

export const useGtelpayUserData = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isGtelpayWebView, setIsGtelpayWebView] = useState(false);

  const hasInitialized = useRef(false);
  const isMounted = useRef(true);

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;
    isMounted.current = true;

    const executeFlow = async () => {
      setIsGtelpayWebView(true);
      setLoading(true);
      try {
        const userInfo = await initGtelpayFlowOnce();
        if (isMounted.current) {
          if (userInfo?.skipped) {
            setUserData(null);
          } else {
            setUserData(userInfo || null);
          }
        }
      } catch (err) {
        if (isMounted.current) {
          setError(err.message || 'Failed to load Gtelpay user data');
          setUserData(null);
        }
      } finally {
        setLoading(false);
        if (isMounted.current) {
          setIsGtelpayWebView(false);
        }
      }
    };

    executeFlow();

    return () => {
      isMounted.current = false;
    };
  }, []);

  const gtelpayUser = useMemo(() => ({
    fullName: userData?.fullName || '',
    phoneNumber: userData?.phoneNumber || ''
  }), [userData]);

  return {
    userData,
    gtelpayUser,
    loading,
    error,
    isGtelpayWebView
  };
};

export const getGtelpayUserName = async () => {
  try {
    const result = await initGtelpayFlowOnce();
    if (result?.error || result?.skipped) {
      return '';
    }
    return result?.fullName || '';
  } catch (error) {
    return '';
  }
};

export const getGtelpayPhoneNumber = async () => {
  try {
    const result = await initGtelpayFlowOnce();
    if (result?.error || result?.skipped) {
      return '';
    }
    return result?.phoneNumber || '';
  } catch (error) {
    return '';
  }
};

export const getGtelpayUserInfo = async () => {
  try {
    const result = await initGtelpayFlowOnce();
    if (result?.error || result?.skipped) {
      return null;
    }
    return result || null;
  } catch (error) {
    return null;
  }
};

export const resetGtelpayFlow = (backendUrl) => {
  const cacheKey = backendUrl || GTELPAY_CONFIG.backendUrl || 'default';
  
  if (backendUrl) {
    gtelpayFlowCache.delete(cacheKey);
  } else {
    gtelpayFlowCache.clear();
  }
};

export const clearExpiredGtelpayCache = (maxAge = 3600000) => {
  const now = Date.now();
  
  for (const [key, value] of gtelpayFlowCache.entries()) {
    if (value.timestamp && (now - value.timestamp) > maxAge) {
      gtelpayFlowCache.delete(key);
    }
  }
};
