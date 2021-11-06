import { PublicKey } from '@solana/web3.js';
import { PoolsSectionFilter, PoolsVotingFilter } from '../shared/enum';
import { INavbarPoolMenu } from '../shared/interface';

export const ERROR_MESSAGES = {
  WALLET_NOT_CONNECT: 'Wallet is not connected',
  PLEASE_CONNECT_WALLET: 'Please connect to your wallet',
};

export const FETCH_INTERVAL = 20 * 1000;
export const MAX_PROGRESS = 100;
export const MIN_PROGRESS_PASS_FULL = 99.98;
export const WALLET_PROVIDER_KEY = 'WALLET_PROVIDER_KEY';
export const ISOLA_TOKEN_ADDRESS = new PublicKey('GmaaWjPmqrXqNDEULZqVpC3g5QzHDuTzhYYYJ5MLVEKj');
export const ISOLA_TOKEN_NAME = 'ISOLA';

export const TOKEN_TO_DECIMALS = 9;
export const SOL_DECIMALS = 9;

export const poolMenus: INavbarPoolMenu[] = [
  { label: 'Pools', key: 'all-pools', needConnectWallet: false },
  {
    label: 'Featured',
    key: 'featured-pools',
    section: PoolsSectionFilter.FEATURED,
    needConnectWallet: false,
  },
  {
    label: 'Joined',
    key: 'pools-joined',
    section: PoolsSectionFilter.JOINED,
    needConnectWallet: true,
  },
  {
    label: 'Upcoming',
    key: 'pools-created',
    section: PoolsSectionFilter.UPCOMING,
    needConnectWallet: false,
  },
  {
    label: 'Past',
    key: 'past-pools',
    section: PoolsSectionFilter.PAST,
    needConnectWallet: false,
  },
];

export const poolsVotingMenus: INavbarPoolMenu[] = [
  {
    label: 'Projects',
    key: 'projects',
    section: PoolsVotingFilter.ALL,
    needConnectWallet: false,
  },
  {
    label: 'Upcoming Voting',
    key: 'upcoming-voting',
    section: PoolsVotingFilter.UPCOMING,
    needConnectWallet: false,
  },
  {
    label: 'In Voting',
    key: 'in-voting',
    section: PoolsVotingFilter.IN_VOTING,
    needConnectWallet: false,
  },
  {
    label: 'Deactivated',
    key: 'deactivated',
    section: PoolsVotingFilter.DEACTIVATED,
    needConnectWallet: false,
  },
];
