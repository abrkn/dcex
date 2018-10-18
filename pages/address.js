import React from 'react';
import App from '../components/App';
import Header from '../components/Header';
// import Address from '../components/Address';

export default class AddressPage extends React.Component {
  static async getInitialProps({ query }) {
    return { query };
  }

  render() {
    const { query } = this.props;

    return (
      <App>
        <Header />
        <p>Oops! The address page isnt finished yet</p>
        {/* <Address {...{ query }} /> */}
      </App>
    );
  }
}
