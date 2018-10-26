import React from 'react';
import Head from 'next/head';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import { chain } from '../frontendUtils';
import { Link } from '../routes';
import Page from '../components/Page';
import ErrorMessage from '../components/ErrorMessage';
import TxInputsOutputs from '../components/TxInputsOutputs';

const { titlePrefix } = chain;

const addressTxsQuery = gql`
  query addressTxs($address: String!) {
    getAddressTxs(_address: $address, first: 100) {
      nodes {
        txId
        hash
        n
        vinsByTxId(orderBy: N_ASC) {
          nodes {
            prevTxId
            n
            coinbase
            vout
            scriptSig
            value
            address
          }
        }
        voutsByTxId(orderBy: N_ASC) {
          nodes {
            n
            scriptPubKey
            value
            spendingTxId
          }
        }
      }
    }
  }
`;

const AddressTransaction = ({ tx }) => {
  const { txId } = tx;
  return (
    <div style={{ border: 'solid 1px black' }}>
      <div style={{ backgroundColor: '#eee' }}>
        <Link route="tx" params={{ txId }}>
          <a>{txId}</a>
        </Link>
      </div>
      <TxInputsOutputs tx={tx} />
    </div>
  );
};

class AddressContainer extends React.Component {
  render() {
    const { address } = this.props;

    return (
      <Query query={addressTxsQuery} variables={{ address }}>
        {({ loading, error, data }) => {
          if (error) return <ErrorMessage message="Error loading address data." />;
          if (loading) return <div>Loading</div>;

          const {
            getAddressTxs: { nodes: txs },
          } = data;

          if (!txs.length) return <ErrorMessage message={`Address ${address} never seen`} />;

          return (
            <div>
              <h1>{address}</h1>
              {txs.map(tx => (
                <AddressTransaction key={tx.txId} tx={tx} />
              ))}
            </div>
          );
        }}
      </Query>
    );
  }
}

export default class AddressPage extends React.Component {
  static async getInitialProps({ query }) {
    return { query };
  }

  render() {
    const {
      query: { address },
    } = this.props;

    return (
      <Page>
        <Head>
          <title>
            {titlePrefix} Address {address}
          </title>
        </Head>
        <AddressContainer address={address} />
      </Page>
    );
  }
}
