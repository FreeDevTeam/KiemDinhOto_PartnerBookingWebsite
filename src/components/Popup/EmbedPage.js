import React from 'react';
import { useLocation } from 'react-router-dom';
import { PATH } from '../../constants/router';
import './EmbedPage.scss';

export const buildEmbedUrl = (url, title) => {
  const cleanedTitle = title.replace(/<br\s*\/?>/gi, ' ');
  return `${PATH.EMBED_PAGE}?url=${encodeURIComponent(url)}&title=${encodeURIComponent(cleanedTitle)}`;
};

const EmbedPage = () => {
  const location = useLocation();

  // Lấy title và url từ query params hoặc state
  const searchParams = new URLSearchParams(location.search);
  const title = searchParams.get('title');
  const url = searchParams.get('url');

  return (
    <div className="embed-page-container">
      <div className="embed-page-page">
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