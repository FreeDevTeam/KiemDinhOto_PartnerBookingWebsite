import { useCallback, useMemo } from 'react';
import MiniAppBridgeIHANOI from './ihanoi/miniappBridge';

// Custom hook to unify partner SDK bridges using switch-case for clarity.
const themeName = process.env.REACT_APP_THEME_NAME;

function usePartnerBridge() {
  const bridge = useMemo(() => {
    switch (themeName) {
      case 'IHANOI':
        return MiniAppBridgeIHANOI;
      // case 'ANOTHER_THEME':
      //   return AnotherThemeBridge;
      default:
        return null;
    }
  }, []);

  const init = useCallback(
    (options) => {
      switch (themeName) {
        case 'IHANOI': {
          if (!MiniAppBridgeIHANOI?.init) return { mode: 'UNSUPPORTED', targetOrigin: '*' };
          // Format y như IHANOI: targetOrigin mặc định '*', cho phép override.
          return MiniAppBridgeIHANOI.init({
            targetOrigin: '*',
            ...options,
          });
        }
        // case 'ANOTHER_THEME':
        //   return AnotherThemeBridge.init({...});
        default:
          return { mode: 'UNSUPPORTED', targetOrigin: '*' };
      }
    },
    []
  );

  const exit = useCallback(
    (action, data) => {
      switch (themeName) {
        case 'IHANOI': {
          if (!MiniAppBridgeIHANOI?.exit) return Promise.resolve();
          return MiniAppBridgeIHANOI.exit(
            action ?? 'GO_BACK',
            data ?? { success: true, reason: 'user_click_exit' }
          );
        }
        // case 'ANOTHER_THEME':
        //   return AnotherThemeBridge.exit(...);
        default:
          return Promise.resolve();
      }
    },
    []
  );

  return {
    init,
    exit,
    bridge,
    isSupported: Boolean(bridge),
  };
}

export default usePartnerBridge;
