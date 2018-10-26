import React from 'react';
import Page from '../components/Page';
import Block from '../components/Block';

export default class BlockPage extends React.Component {
  static async getInitialProps({ query }) {
    return { query };
  }

  render() {
    const { query } = this.props;

    return (
      <Page>
        <Block {...{ query }} />
      </Page>
    );
  }
}
