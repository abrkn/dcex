import React from 'react';
import Header from './Header';
import Footer from './Footer';
import Head from 'next/head';
import { chain } from '../frontendUtils';

const { titlePrefix } = chain;

export default ({ children }) => (
  <page>
    <Head>
      <title>
        {titlePrefix}
        Explorer by Drivechain.ai
      </title>
    </Head>
    <Header />
    <main>{children}</main>
    <Footer />
  </page>
);
