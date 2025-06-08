import React from 'react';
import './Footer.scss';

const Footer = () => (
  <footer className="footer">
    <span>
      © {new Date().getFullYear()} Digital Shrine &mdash; Made with <span className="footer__heart">♥</span>
    </span>
  </footer>
);

export default Footer;