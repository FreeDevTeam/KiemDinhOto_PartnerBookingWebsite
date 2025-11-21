import React, { useEffect } from 'react';
import { Box, Sheet, Text } from 'zmp-ui'

const PopupSheetIframe = ({ visible, onClose, title, iframeUrl, styleCss }) => {
  // Reset iframe khi component unmount hoặc visible thay đổi
  useEffect(() => {
    if (!visible) {
      // Clear iframe src khi popup đóng
      const iframe = document.querySelector('.bottom-sheet-body iframe')
      if (iframe) {
        iframe.src = 'about:blank'
      }
    }
  }, [visible])

  if (!iframeUrl) {
    return null
  }

  return (
    <Sheet
      visible={visible}
      onClose={onClose}
      autoHeight
      className="sheet-zalo"
      mask={true}
      swipeToClose
    >
      <Box p={4} className="custom-bottom-sheet" flex flexDirection="column">
        {title && (
          <Box my={4}>
            <Text.Title>{title}</Text.Title>
          </Box>
        )}
        <Box className="bottom-sheet-body" style={{ overflowY: 'auto' }}>
          {iframeUrl && iframeUrl.startsWith('data:') ? (
            // Render HTML trực tiếp cho data: URLs
            <div dangerouslySetInnerHTML={{ __html: decodeURIComponent(iframeUrl.split(',')[1]) }} />
          ) : (
            // Render iframe cho URLs thường
            <iframe
              key={iframeUrl}
              src={iframeUrl}
              width={styleCss?.width || '100%'}
              style={styleCss?.style || { minHeight: '70vh', border: 'none' }}
              frameBorder={styleCss?.frameBorder || "0"}
              title={styleCss?.title || "Banner Popup"}
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
            ></iframe>
          )}
        </Box>
      </Box>
    </Sheet>
  );
};

export default PopupSheetIframe;
