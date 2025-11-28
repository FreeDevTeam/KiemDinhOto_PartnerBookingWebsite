import React from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import { ReactComponent as LeftIcon } from '../../assets/Booking-icon/ArrowLeft.svg';
import './Functional.scss';

const Functional = () => {
  const location = useLocation();
  const history = useHistory();

  // Lấy title và url từ query params hoặc state
  const searchParams = new URLSearchParams(location.search);
  const title = searchParams.get('title');
  const url = searchParams.get('url');

  const handleBack = () => {
    history.goBack();
  };

  return (
    <div className="functional-container">
      <div className="functional-page">
        <div className="functional-header">
          <button onClick={handleBack} className="back-button">
            <LeftIcon />
          </button>
          <h1 className="page-title">{title}</h1>
        </div>
        <div className="functional-content">
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

export default Functional;