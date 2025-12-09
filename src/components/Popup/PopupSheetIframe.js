import React, { useMemo } from 'react';
import { Box, Sheet, Text } from 'zmp-ui'

const PopupSheetIframe = ({ visible, onClose, title, iframeUrl, styleCss }) => {
  const isEmbeddedView = useMemo(() => iframeUrl?.includes('isEmbeddedView'), [iframeUrl]);

  const iframeStyle = useMemo(() => ({
    ...(styleCss?.style || { border: 'none' }),
    minHeight: isEmbeddedView ? '90vh' : (styleCss?.style?.minHeight || '90vh'),
    height: isEmbeddedView ? '90vh' : (styleCss?.style?.height || 'auto'),
  }), [isEmbeddedView, styleCss]);

  return (
    <Sheet
      visible={visible}
      onClose={onClose}
      autoHeight={!isEmbeddedView}
      className="sheet-zalo"
      mask={true}
      swipeToClose
    >
      <Box py={4} className="custom-bottom-sheet position-relative" flex flexDirection="column">
        <div
          className="position-absolute end-0 p-3"
          style={{ cursor: 'pointer', fontSize: 20, top: -24 }} 
          onClick={onClose} 
        >
          ✖
        </div>
        {/* {title && (
          <Box my={4}>
            <Text.Title>{title}</Text.Title>
          </Box>
        )} */}
        <Box className="bottom-sheet-body" style={{ overflowY: 'auto' }}>
          {
            visible && 
            <iframe
              key={iframeUrl}
              src={iframeUrl}
              width={styleCss?.width || '100%'}
              style={iframeStyle}
              frameBorder={styleCss?.frameBorder || "0"}
              title={styleCss?.title || "Banner Popup"}
            ></iframe>
          }
        </Box>
      </Box>
    </Sheet>
  );
};

export default PopupSheetIframe;
