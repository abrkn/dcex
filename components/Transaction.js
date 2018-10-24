import React from 'react';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import ErrorMessage from './ErrorMessage';
import { Link } from '../routes';
import TxInputsOutputs from './TxInputsOutputs';
import Head from 'next/head';
import { chain } from '../frontendUtils';

const { titlePrefix } = chain;

export const txQuery = gql`
  query txs($txId: String!) {
    txByTxId(txId: $txId) {
      n
      hash
      locktime
      version
      blockByBlockHash {
        hash
        height
      }
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

        const { hash, blockByBlockHash: block, locktime, version } = tx;

        return (
          <div>
            <Head>
              <title>
                {titlePrefix}
                Transaction {txId}
              </title>
            </Head>
            <section>
              <h1>Transaction</h1>

              <table>
                <tbody>
                  <tr>
                    <th>Txid</th>
                    <td>{txId}</td>
                  </tr>
                  {txId !== hash && (
                    <tr>
                      <th>Hash</th>
                      <td>{hash}</td>
                    </tr>
                  )}
                  {locktime > 0 && (
                    <tr>
                      <th>Locktime</th>
                      <td>{locktime}</td>
                    </tr>
                  )}
                  <tr>
                    <th>Version</th>
                    <td>{version}</td>
                  </tr>
                  <tr>
                    <th>In block</th>
                    <td>
                      <Link route="block" params={{ hash: block.hash }}>
                        <a>#{block.height}</a>
                      </Link>
                    </td>
                  </tr>
                </tbody>
              </table>

              <hr />

              <TxInputsOutputs tx={tx} />
            </section>
          </div>
        );
      }}
    </Query>
  );
}
