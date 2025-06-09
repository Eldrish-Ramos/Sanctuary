import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.scss';

const Navbar = () => (
  <nav className="navbar">
    <div className="navbar__logo-area">
      <span className="navbar__incense-smoke" />
      <Link to="/" className="navbar__brand">
        <span className="navbar__brand-glow">🕯️</span> Digital Shrine
      </Link>
    </div>
    <div className="navbar__links">
      <Link to="/shrine-builder" className="navbar__link">
        Build
      </Link>
      <Link to="/explore" className="navbar__link">
        Explore
      </Link>
    </div>
  </nav>
);

export default Navbar;