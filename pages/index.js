import React from 'react';
import App from '../components/App';
import Header from '../components/Header';
import BlockList from '../components/BlockList';
import Head from 'next/head';
import { chain } from '../frontendUtils';

const { titlePrefix } = chain;

export default () => (
  <App>
    <Head>
      <title>
        {titlePrefix}
        Explorer
      </title>
    </Head>
    <Header />
    <BlockList />
  </App>
);
