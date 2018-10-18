import React from 'react';
import App from '../components/App';
import Header from '../components/Header';
import Transaction from '../components/Transaction';

export default class TransactionPage extends React.Component {
  static async getInitialProps({ query }) {
    return { query };
  }

  render() {
    const { query } = this.props;

    return (
      <App>
        <Header />
        <Transaction {...{ query }} />
      </App>
    );
  }
}
