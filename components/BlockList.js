import React from 'react';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import ErrorMessage from './ErrorMessage';
import { Link } from '../routes';
// import Link from 'next/link';
// import BlockUpvoter from './BlockUpvoter';

export const blocksQuery = gql`
  {
    allBlocks(first: 100, orderBy: HEIGHT_DESC) {
      nodes {
        hash
        height
      }
    }
  }
`;

export const blocksQueryVars = {
  first: 25,
};

export default function BlockList() {
  return (
    <Query query={blocksQuery} variables={blocksQueryVars}>
      {({ loading, error, data, fetchMore }) => {
        if (error) return <ErrorMessage message="Error loading blocks." />;
        if (loading) return <div>Loading</div>;

        const { allBlocks: blocks } = data;

        const areMoreBlocks = true; // blocks.length < _blocksMeta.count;

        return (
          <section>
            <table>
              <thead>
                <tr>
                  <th>Height</th>
                  <th>Hash</th>
                </tr>
              </thead>
              <tbody>
                {blocks.nodes.map(block => (
                  <tr key={block.hash}>
                    <td>
                      <Link route="block" params={{ hash: block.hash }}>
                        <a>{block.height}</a>
                      </Link>
                    </td>
                    <td>{block.hash}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {false && areMoreBlocks ? (
              <button onClick={() => loadMoreBlocks(blocks, fetchMore)}>
                {' '}
                {loading ? 'Loading...' : 'Show More'}{' '}
              </button>
            ) : (
              ''
            )}
            <style jsx>{`
              section {
                display: flex;
                justify-content: center;
                margin-top: 2em;
              }

              thead tr th {
                border-bottom: solid 1px #000;
              }
            `}</style>
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
