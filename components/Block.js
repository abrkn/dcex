import React from 'react';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import ErrorMessage from './ErrorMessage';
import { Link } from '../routes';
// import Link from 'next/link';
// import BlockUpvoter from './BlockUpvoter';
import { Router } from '../routes';
import TxInputsOutputs from './TxInputsOutputs';
import Head from 'next/head';
import { chain } from '../frontendUtils';

const { titlePrefix } = chain;

export const blockQuery = gql`
  query blocks($hash: String!) {
    blockByHash(hash: $hash) {
      hash
      height
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
    <div className="tx">
      <div className="tx-link-container">
        <Link route="tx" params={{ txId }}>
          <a>{txId}</a>
        </Link>
      </div>
      <div className="outputs-container">
        <TxInputsOutputs tx={tx} />
      </div>
      <style jsx>{`
        .tx {
          border: solid 1px #555;
          margin-bottom: 2rem;
        }

        .tx-link-container {
          background: black;
          padding: 0.5rem;
        }

        .tx-link-container a {
          color: yellow;
        }

        .outputs-container {
          padding: 0.5rem;
        }
      `}</style>
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
          <div>
            <Head>
              <title>
                {titlePrefix}
                Block #{height}
              </title>
            </Head>
            <section>
              <h1>Block #{block.height}</h1>

              <table className="facts">
                <tbody>
                  <tr>
                    <th>Hash</th>
                    <td>{block.hash}</td>
                  </tr>
                  <tr>
                    <th>Height</th>
                    <td>{height}</td>
                  </tr>
                  <tr>
                    <th>Transactions</th>
                    <td>{txs.nodes.length}</td>
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
            <style jsx>{`
              .facts th {
                text-align: left;
              }
            `}</style>
          </div>
        );
      }}
    </Query>
  );
}
