import React from 'react';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import ErrorMessage from './ErrorMessage';
import { Link } from '../routes';
// import Link from 'next/link';
// import BlockUpvoter from './BlockUpvoter';
import { Router } from '../routes';
import TxInputsOutputs from './TxInputsOutputs';

export const blockQuery = gql`
  query blocks($hash: String!) {
    blockByHash(hash: $hash) {
      hash
      txesByBlockHash(orderBy: N_ASC) {
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
  }
`;
export const blockQueryVars = {
  // count: 10,
  // skip: 0,
  // first: 10,
};

const BlockTransaction = ({ tx }) => {
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

const BlockTransactions = ({ txs }) => {
  return (
    <div>
      {txs.map(tx => (
        <BlockTransaction key={tx.txId} tx={tx} />
      ))}
    </div>
  );
};

export default function Block({ query: { hash } }) {
  return (
    <Query query={blockQuery} variables={{ hash }}>
      {({ loading, error, data }) => {
        if (error) return <ErrorMessage message="Error loading block." />;
        if (loading) return <div>Loading</div>;

        const { blockByHash: block } = data;

        if (!block) return <ErrorMessage message={`Block ${hash} not found`} />;

        const { txesByBlockHash: txs, height } = block;

        return (
          <section>
            <h1>Block #{block.height}</h1>

            <table>
              <tbody>
                <tr>
                  <th>Hash</th>
                  <td>{block.hash}</td>
                </tr>
                <tr>
                  <th>Height</th>
                  <td>{height}</td>
                </tr>
              </tbody>
            </table>

            {txs && (
              <div>
                <h2>Transactions</h2>
                <BlockTransactions txs={txs.nodes} />
              </div>
            )}
          </section>
        );
      }}
    </Query>
  );
}
