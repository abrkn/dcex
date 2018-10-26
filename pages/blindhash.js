import React from 'react';
import Head from 'next/head';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import { chain } from '../frontendUtils';
import { Link } from '../routes';
import Page from '../components/Page';
import ErrorMessage from '../components/ErrorMessage';

const { titlePrefix } = chain;

const blindHashBlocksQuery = gql`
  query blockByBlindHash($blindHash: String!) {
    allBlocks(condition: { blindhash: $blindHash }) {
      nodes {
        hash
        height
      }
    }
  }
`;

class BlindHashContainer extends React.Component {
  render() {
    const { blindHash } = this.props;

    return (
      <Query query={blindHashBlocksQuery} variables={{ blindHash }}>
        {({ loading, error, data }) => {
          if (error) return <ErrorMessage message="Error loading" />;
          if (loading) return <div>Loading</div>;

          const {
            allBlocks: { nodes: blocks },
          } = data;

          const [block] = blocks;

          if (!block) return <ErrorMessage message={`Block with blind hash ${blindHash} not found`} />;

          const { hash, height } = block;

          return (
            <div>
              <h1>Found block from blind hash</h1>
              <p>{blindHash}</p>

              <p>
                <Link route="block" params={{ hash }}>
                  <a>Go to block #{height}</a>
                </Link>
              </p>
            </div>
          );
        }}
      </Query>
    );
  }
}

export default class BlindHashPage extends React.Component {
  static async getInitialProps({ query }) {
    return { query };
  }

  render() {
    const {
      query: { blindHash },
    } = this.props;

    return (
      <Page>
        <Head>
          <title>
            {titlePrefix} Blind hash {blindHash}
          </title>
        </Head>
        <BlindHashContainer blindHash={blindHash} />
      </Page>
    );
  }
}
