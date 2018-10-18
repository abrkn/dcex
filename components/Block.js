import React from 'react';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import ErrorMessage from './ErrorMessage';
import { Link } from '../routes';
// import Link from 'next/link';
// import BlockUpvoter from './BlockUpvoter';
import { Router } from '../routes';

export const blockQuery = gql`
  query blocks($hash: String!) {
    blockByHash(hash: $hash) {
      hash
      height
      txs {
        hash
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
  }
`;
export const blockQueryVars = {
  // count: 10,
  // skip: 0,
  // first: 10,
};

const BlockTransactionInput = ({ input }) => {
  const { txid, coinbase, vout } = input;

  if (coinbase) {
    return <div>Mined</div>;
  }

  if (txid) {
    return (
      <div>
        <Link route="tx" params={{ hash: txid }}>
          <a>
            {txid}:{vout}
          </a>
        </Link>
      </div>
    );
  }

  return <div>Unknown</div>;
};

const BlockTransactionOutput = ({ output }) => {
  const { value, addresses, n } = output;

  const address = addresses && addresses.length && addresses[0];

  return (
    <div>
      {address && (
        <span>
          <Link route="address" params={{ address }}>
            <a>{address}</a>
          </Link>
          <span> </span>
        </span>
      )}
      {value} BTC
    </div>
  );
};

const BlockTransaction = ({ tx }) => {
  const { hash, inputs, outputs } = tx;
  return (
    <div>
      <Link route="tx" params={{ hash }}>
        <a>{hash}</a>
      </Link>
      <div>
        <h3>Inputs</h3>
        {inputs.map(input => (
          <BlockTransactionInput key={input.vout} input={input} />
        ))}
      </div>
      <div>
        <h3>Outputs</h3>
        {outputs.map(output => (
          <BlockTransactionOutput key={output.n} output={output} />
        ))}
      </div>
    </div>
  );
};

const BlockTransactions = ({ txs }) => {
  return (
    <div>
      {txs.map(tx => (
        <BlockTransaction key={tx.hash} tx={tx} />
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
        const { txs, height } = block;

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
                <BlockTransactions txs={txs} />
              </div>
            )}
          </section>
        );
      }}
    </Query>
  );
}
