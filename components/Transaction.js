import React from 'react';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import ErrorMessage from './ErrorMessage';
import { Link } from '../routes';
import TxInputsOutputs from './TxInputsOutputs';

export const txQuery = gql`
  query txs($hash: String!) {
    txByHash(hash: $hash) {
      hash
      blockHash
      inputs {
        vout
        txid
        coinbase
      }
      outputs {
        n
        value
        addresses
      }
    }
  }
`;
export const txQueryVars = {
  // count: 10,
  // skip: 0,
  // first: 10,
};

export default function Transaction({ query: { hash } }) {
  return (
    <Query query={txQuery} variables={{ hash }}>
      {({ loading, error, data }) => {
        if (error) return <ErrorMessage message="Error loading transaction." />;
        if (loading) return <div>Loading</div>;

        const { txByHash: tx } = data;
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
