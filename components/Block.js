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
    }
  }
`;
export const blockQueryVars = {
  // count: 10,
  // skip: 0,
  // first: 10,
};

export default function Block({ query: { hash } }) {
  return (
    <Query query={blockQuery} variables={{ hash }}>
      {({ loading, error, data: { blockByHash: block }, fetchMore }) => {
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
                  <td>{block.height}</td>
                </tr>
              </tbody>
            </table>
          </section>
        );
      }}
    </Query>
  );
}

function loadMoreBlocks(blocks, fetchMore) {
  fetchMore({
    variables: {
      skip: blocks.length,
    },
    updateQuery: (previousResult, { fetchMoreResult }) => {
      if (!fetchMoreResult) {
        return previousResult;
      }
      return Object.assign({}, previousResult, {
        // Append the new blocks results to the old one
        blocks: [...previousResult.blocks, ...fetchMoreResult.blocks],
      });
    },
  });
}
