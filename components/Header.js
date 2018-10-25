import React from 'react';
import Link from 'next/link';
import { withRouter } from 'next/router';
import logo from '../icons/magnifying-glass.svg';
import { chain } from '../frontendUtils';

const Header = ({ router: { pathname } }) => (
  <header>
    <Link prefetch href="/">
      <a>
        <img src={logo} className="logo" alt="Dcex" />

        <h1 className="title">{chain.titlePrefix} Explorer</h1>
      </a>
    </Link>

    <div className="subtitle">
      <a href="https://drivechain.ai">by Drivechain.ai</a>
    </div>
    <style jsx>{`
      header {
        margin-bottom: 25px;
        text-align: center;
      }

      a,
      a:visited {
        font-size: 14px;
        margin-right: 15px;
        text-decoration: none;
        color: #000;
        margin: 0;
      }

      .logo {
        width: 50px;
        margin-top: -0.5rem;
        vertical-align: middle;
        text-align: center;
      }

      .subtitle {
        color: #666;
      }

      .title {
        font-size: 2rem;
        font-weight: 900;
        text-transform: uppercase;
        margin: 0;
        text-align: center;
      }

      .tagline {
        font-size: 2rem;
        max-width: 640px;
        margin: 2rem auto;
        color: #fff;
        padding: 2rem 2rem;
        background: #000;
      }
    `}</style>
  </header>
);

export default withRouter(Header);
