import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.scss';

const HomePage = () => (
  <div className="homepage">
    <div className="homepage__altar">
      <span className="homepage__candle">🕯️</span>
      <span className="homepage__petal homepage__petal--1">🌸</span>
      <span className="homepage__petal homepage__petal--2">🌸</span>
      <span className="homepage__petal homepage__petal--3">🌸</span>
    </div>
    <h1 className="homepage__title">
      Digital Shrine
    </h1>
    <p className="homepage__subtitle">
      Create your own interactive, nostalgic shrine.<br />
      Express your creativity with modular tiles, drag-and-drop editing, and beautiful themes.<br />
      <span className="homepage__subtitle-highlight">A quiet, personal alternative to social media.</span>
    </p>
    <div className="homepage__actions">
      <Link to="/shrine-builder" className="homepage__button homepage__button--primary">
        Start Building
      </Link>
      <Link to="/explore" className="homepage__button homepage__button--secondary">
        Explore Shrines
      </Link>
    </div>
    <div className="homepage__note">
      <span>✨ For artists, memory-keepers, and creative souls ✨</span>
    </div>
  </div>
);

export default HomePage;