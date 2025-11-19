import React from 'react';
import { Box, Sheet, Text } from 'zmp-ui'

const PopupSheetIframe = ({ visible, onClose, title, iframeUrl, styleCss }) => {
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
          <iframe
            src={iframeUrl}
            width={styleCss?.width || '100%'}
            style={styleCss?.style || { minHeight: '70vh', border: 'none' }}
            frameBorder={styleCss?.frameBorder || "0"}
            title={styleCss?.title || "Banner Popup"}
          ></iframe>
        </Box>
      </Box>
    </Sheet>
  );
};

export default PopupSheetIframe;
