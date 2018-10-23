import getConfig from 'next/config';
import chains from './chains';

const { publicRuntimeConfig } = getConfig();
const { CHAIN } = publicRuntimeConfig;

export const chain = chains[CHAIN];
