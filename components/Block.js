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
        }
        outputs {
          n
          value
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
  return <div>TODO</div>;
};

const BlockTransactionOutput = ({ output }) => {
  const { value } = output;

  return <div>{value} BTC</div>;
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
      {({ loading, error, data: { blockByHash: block } }) => {
        const { txs, height } = block;
        if (error) return <ErrorMessage message="Error loading block." />;
        if (loading) return <div>Loading</div>;

        // const areMoreBlocks = true; // blocks.length < _blocksMeta.count;

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
