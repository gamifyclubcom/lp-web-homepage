import { PublicKey } from '@solana/web3.js';

export const ERROR_MESSAGES = {
  WALLET_NOT_CONNECT: 'Wallet is not connected',
  PLEASE_CONNECT_WALLET: 'Please connect to your wallet',
};

export const FETCH_INTERVAL = 20 * 1000;
export const MAX_PROGRESS = 100;
export const MIN_PROGRESS_PASS_FULL = 99.98;
export const WALLET_PROVIDER_KEY = 'WALLET_PROVIDER_KEY';
export const ISOLA_TOKEN_ADDRESS = new PublicKey(
  'GmaaWjPmqrXqNDEULZqVpC3g5QzHDuTzhYYYJ5MLVEKj'
);
export const ISOLA_TOKEN_NAME = 'ISOLA';

export const TOKEN_TO_DECIMALS = 9;
export const SOL_DECIMALS = 9;
