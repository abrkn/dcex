import React from 'react';
import App from '../components/App';
import Header from '../components/Header';
// import Address from '../components/Address';
import Head from 'next/head';
import { chain } from '../frontendUtils';

const { titlePrefix } = chain;

export default class AddressPage extends React.Component {
  static async getInitialProps({ query }) {
    return { query };
  }

  render() {
    const {
      query: { address },
    } = this.props;

    return (
      <App>
        <Header />
        <div>
          <Head>
            <title>
              {titlePrefix} Address {address}
            </title>
          </Head>
        </div>
        <p>Oops! The address page isnt finished yet</p>
        {/* <Address {...{ query }} /> */}
      </App>
    );
  }
}
