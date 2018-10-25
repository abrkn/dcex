import React from 'react';
import App from '../components/App';
import Header from '../components/Header';
import Block from '../components/Block';

export default class BlockPage extends React.Component {
  static async getInitialProps({ query }) {
    return { query };
  }

  render() {
    const { query } = this.props;

    return (
      <App>
        <Header />
        <Block {...{ query }} />
      </App>
    );
  }
}
