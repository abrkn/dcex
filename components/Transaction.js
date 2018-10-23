import React from 'react';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import ErrorMessage from './ErrorMessage';
import { Link } from '../routes';
import TxInputsOutputs from './TxInputsOutputs';

export const txQuery = gql`
  query txs($txId: String!) {
    txByTxId(txId: $txId) {
      n
      hash
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
`;
export const txQueryVars = {
  // count: 10,
  // skip: 0,
  // first: 10,
};

export default function Transaction({ query: { txId } }) {
  return (
    <Query query={txQuery} variables={{ txId }}>
      {({ loading, error, data }) => {
        if (error) return <ErrorMessage message="Error loading transaction." />;
        if (loading) return <div>Loading</div>;

        const { txByTxId: tx } = data;

        if (!tx) return <ErrorMessage message={`Transaction ${txId} not found`} />;

        const { hash, blockHash } = tx;

        return (
          <section>
            <h1>Transaction</h1>

            <p>{hash}</p>

            {blockHash && (
              <p>
                In block{' '}
                <Link route="block" params={{ hash: blockHash }}>
                  <a>{blockHash}</a>
                </Link>
              </p>
            )}

            <TxInputsOutputs tx={tx} />
          </section>
        );
      }}
    </Query>
  );
}
