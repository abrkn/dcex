import React from 'react';
import Page from '../components/Page';
import Transaction from '../components/Transaction';

export default class TransactionPage extends React.Component {
  static async getInitialProps({ query }) {
    return { query };
  }

  render() {
    const { query } = this.props;

    return (
      <Page>
        <Transaction {...{ query }} />
      </Page>
    );
  }
}
