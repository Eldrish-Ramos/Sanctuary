import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.scss';

const Navbar = () => (
  <nav className="navbar">
    <Link to="/" className="navbar__brand">
      Digital Shrine
    </Link>
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