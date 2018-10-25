import React from 'react';
import Link from 'next/link';
import { withRouter } from 'next/router';
import logo from '../icons/magnifying-glass.svg';
import { chain } from '../frontendUtils';

// {
//   /* <header className="App-header">
// <img src={logo} className="App-logo" alt="logo" id="logo" />
// <h1 className="App-title">SideShift</h1>
// <div className="App-test">TestDrive</div>
// <div className="App-tagline">
//   Convert your Sidechain One coins to Drivechain mainnet coins without having to wait!
//   <br />
//   <div className="bold">1% fee</div>
// </div>
// </header> */
// }

// {<Link prefetch href="/">
// <a className={pathname === '/' ? 'is-active' : ''}>Home</a>
// </Link>
// <a href="https://github.com/abrkn/dcex" target="_blank">
// Source code (Github)
// </a>}

const Header = ({ router: { pathname } }) => (
  <header>
    <img src={logo} className="logo" alt="Dcex" />

    <h1 className="title">{chain.titlePrefix} Explorer</h1>
    <div className="subtitle">by Drivechain.ai</div>
    <style jsx>{`
      header {
        margin-bottom: 25px;
        text-align: center;
      }
      a {
        font-size: 14px;
        margin-right: 15px;
        text-decoration: none;
      }
      .is-active {
        text-decoration: underline;
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
