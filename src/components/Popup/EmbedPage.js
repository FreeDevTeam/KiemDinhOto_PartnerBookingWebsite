import React from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import { ReactComponent as LeftIcon } from '../../assets/Booking-icon/ArrowLeft.svg';
import { PATH } from '../../constants/router';
import './EmbedPage.scss';

export const buildEmbedUrl = (url, title) => {
  const cleanedTitle = title.replace(/<br\s*\/?>/gi, ' ');
  return `${PATH.EMBED_PAGE}?url=${encodeURIComponent(url)}&title=${encodeURIComponent(cleanedTitle)}`;
};

const EmbedPage = () => {
  const location = useLocation();
  const history = useHistory();

  // Lấy title và url từ query params hoặc state
  const searchParams = new URLSearchParams(location.search);
  const title = searchParams.get('title');
  const url = searchParams.get('url');

  const isZaloApp = process.env.REACT_APP_ZALO_AUTH_ENABLE * 1 === 1

  const handleBack = () => {
    history.goBack();
  };

  return (
    <div className="embed-page-container">
      <div className="embed-page-page">
        {!isZaloApp && (
          <div className="embed-page-header">
            <button onClick={handleBack} className="back-button">
              <LeftIcon />
            </button>
            <h1 className="page-title">{title}</h1>
          </div>
        )}
        <div className="embed-page-content">
          <iframe
            src={url}
            width="100%"
            height="100%"
            frameBorder="0"
            title={title}
          />
        </div>
      </div>
    </div>
  );
};

export default EmbedPage;