import { AccountInfo as TokenAccountInfo } from '@solana/spl-token';
import { AccountInfo, PublicKey } from '@solana/web3.js';
import { PoolsSectionFilter, PoolsVotingFilter } from './enum';

export type TAllocationLevel = 1 | 2 | 3 | 4 | 5;

export interface TokenAccount {
  pubkey: PublicKey;
  account: AccountInfo<Buffer>;
  info: TokenAccountInfo;
}

export interface IAllocationLevel {
  level: TAllocationLevel;
  rank: string;
  color: string;
  textColor: string;
  title: string;
  minAllocation: number;
  allocationRatio: number;
}

export interface IFounder {
  avatar: string;
  name: string;
  occupation: string;
  socials?: {
    icon: JSX.Element;
    link: string;
  }[];
}

export interface INavbarPoolMenu {
  label: string;
  key: string;
  section?: PoolsSectionFilter | PoolsVotingFilter;
  needConnectWallet: boolean;
}