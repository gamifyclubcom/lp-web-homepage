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

export interface ITimeline {
  key: string;
  index: number;
  name: string;
  startAt?: Date;
  endAt?: Date;
}

export interface IPoolTimes {
  start_date: Date;
  join_pool_start: Date;
  private_join_enabled: boolean;
  private_join_start?: Date;
  private_join_end?: Date;
  exclusive_join_enabled: boolean;
  exclusive_join_start?: Date;
  exclusive_join_end?: Date;
  fcfs_staker_join_enabled: boolean;
  fcfs_staker_join_start?: Date;
  fcfs_staker_join_end?: Date;
  public_join_enabled: boolean;
  public_join_start?: Date;
  public_join_end?: Date;
  join_pool_end: Date;
  claim_at: Date;
}
