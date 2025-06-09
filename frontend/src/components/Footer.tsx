import React from 'react';
import './Footer.scss';

const Footer = () => (
  <footer className="footer">
    <div className="footer__shrine-base">
      <span className="footer__heart-glow">♥</span>
    </div>
    <span className="footer__text">
      © {new Date().getFullYear()} Digital Shrine &mdash; Crafted with love and memory
    </span>
  </footer>
);

export default Footer;