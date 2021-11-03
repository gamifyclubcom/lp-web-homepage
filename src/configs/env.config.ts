import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PublicKey } from '@solana/web3.js';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
const API_URL_BACKEND =
  process.env.NEXT_PUBLIC_API_URL_BACKEND || 'http://localhost:3000';
const API_URL_SMART_CONTRACT =
  process.env.NEXT_PUBLIC_API_URL_SMART_CONTRACT || 'http://localhost:8899';
const SOLLET_ENV =
  (process.env.NEXT_PUBLIC_SOLLET_ENV as WalletAdapterNetwork) ||
  WalletAdapterNetwork.Devnet;
const SOLANA_EXPLORER_URL = 'https://explorer.solana.com';
const ISOLA_TOKEN_ADDRESS = new PublicKey(
  process.env.NEXT_PUBLIC_ISOLA_TOKEN_ADDRESS!
);
const ISOLA_TOKEN_NAME = process.env.NEXT_PUBLIC_ISOLA_TOKEN_NAME as string;

export const envConfig = {
  BASE_URL,
  API_URL_BACKEND,
  API_URL_SMART_CONTRACT,
  SOLLET_ENV,
  SOLANA_EXPLORER_URL,
  ISOLA_TOKEN_ADDRESS,
  ISOLA_TOKEN_NAME,
};
