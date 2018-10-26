import React from 'react';
import { withRouter } from 'next/router';

const Header = ({ router: { pathname } }) => (
  <footer>
    <div className="columns">
      <div className="logo-column">
        <a className="logo" href="https://drivechian.ai">
          Drivechain.ai
        </a>
        <p className="copyright">© Drivechain.ai 2018</p>
      </div>

      <div className="links-column">
        <h4>Services</h4>
        <ul>
          <li>
            <a href="https://sideshift.ai">SideShift</a>
          </li>
          <li>
            <a href="https://faucet.drivechain.ai">Drivenet Faucet</a>
          </li>
          <li>
            <a href="https://gist.github.com/abrkn/ea3496b675373c93adbf5540487d111e">Auto-Installer</a>
          </li>
          <li>
            <a href="https://driveby.drivechain.ai">Transaction Replayer</a>
          </li>
        </ul>
      </div>

      <div className="links-column">
        <h4>Block Explorers</h4>
        <ul>
          <li>
            <a href="https://dn.drivechain.ai">Drivenet</a>
          </li>
          <li>
            <a href="https://s1.drivechain.ai">Sidechain One</a>
          </li>
          <li>
            <a href="https://pm.drivechain.ai">PayChain</a>
          </li>
        </ul>
      </div>

      <div className="links-column">
        <h4>Drivechain Resources</h4>
        <ul>
          <li>
            <a href="https://t.me/DcInsiders">Telegram Chat</a>
          </li>
          <li>
            <a href="http://www.drivechain.info/">Drivechain.info</a>
          </li>
          <li>
            <a href="https://github.com/DriveNetTESTDRIVE/DriveNet">Drivenet Github</a>
          </li>
          <li>
            <a href="http://bitcoinhivemind.com/">Bitcoin Hivemind</a>
          </li>
        </ul>
      </div>

      <div className="links-column">
        <h4>Stay in touch</h4>
        <ul>
          <li>
            <a href="https://twitter.com/drivechainai">Twitter</a>
          </li>
          <li>
            <a href="https://github.com/abrkn/dcex">Github</a>
          </li>
        </ul>
      </div>
    </div>

    <style jsx>{`
      footer {
        background: black;
        color: #999;
        font-size: 14px;
      }

      .columns {
        display: flex;
      }

      .logo-column .logo {
        text-transform: uppercase;
        font-size: 24px;
        color: yellow;
      }

      .columns > div {
        flex: auto;
      }

      a {
        text-decoration: none;
        color: #999;
      }

      h4 {
        font-weight: normal;
        font-size: 18px;
        color: #eee;
        margin: 0;
        margin-bottom: 6px;
        text-transform: uppercase;
      }

      .links-column ul {
        padding: 0;
        margin: 0;
        // justify-content: space-between;
      }

      .links-column ul li {
        list-style: none;
        padding-top: 4px;
        padding-bottom: 4px;
        // background: yellow;
      }
    `}</style>
  </footer>
);

export default withRouter(Header);
