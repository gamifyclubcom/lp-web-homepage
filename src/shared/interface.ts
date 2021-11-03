import { AccountInfo as TokenAccountInfo } from '@solana/spl-token';
import { AccountInfo, PublicKey } from '@solana/web3.js';

export type TAllocationLevel = 1 | 2 | 3 | 4 | 5;

export interface TokenAccount {
  pubkey: PublicKey;
  account: AccountInfo<Buffer>;
  info: TokenAccountInfo;
}

export interface IAllocationLevel {
  level: TAllocationLevel;
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
