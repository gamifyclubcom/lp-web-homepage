import { IPoolFcfsStakerPhase, IPoolWeight, IVotingPhase } from '@gamify/onchain-program-sdk';
import { PublicKey } from '@solana/web3.js';
import { PoolsSectionFilter, PoolStatusType, PoolsVotingFilter } from '../../shared/enum';

export interface ServerResponseToken {
  token_address: string;
  token_decimals: number;
  token_name: string;
  token_symbol: string;
  token_total_supply: string;
}

export interface ServerResponseSMData {
  is_initialized: boolean;
  nonce: number;
  id: string;
  token_x: string;
  token_y: string;
  rate: number;
  fees: IFees;
  campaign: IPoolCampaign;
  is_active: boolean;
  platform: string;
  admins: { root_admin: string };
  voting?: IVotingPhase;
}

export interface ServerResponsePool {
  _id: string;
  join_pool_start: string;
  join_pool_end: string;
  pool_start: string;
  logo?: string;
  thumbnail?: string;
  tag_line?: string;
  name: string;
  website: string;
  liquidity_percentage?: string;
  audit_link?: string;
  token: ServerResponseToken;
  token_economic: string;
  twitter?: string;
  telegram?: string;
  medium?: string;
  description?: string;
  token_to: string;
  slug: string;
  contract_address: string;
  program_id: string;
  data: ServerResponseSMData;
  token_to_decimal: number;
  createdAt: string;
  updatedAt: string;
  claimable_percentage?: number;
}

export interface IVoting {
  start_at: string;
  end_at: string;
  total_vote_up: number;
  total_vote_down: number;
  required_absolute_vote: number;
  token_voting_power_rate: number;
  total_users_vote_up: 0;
  total_users_vote_down: 0;
}

export interface ServerResponsePoolVoting extends ServerResponsePool {
  voting: IVoting;
}

export interface IPoolVoting extends IPool {
  voting_progress: number;
  voting_total_up: number;
  voting_total_down: number;
  voting_min_can_active: number;
  voting_start: Date;
  voting_end: Date;
  voting_total_users_up: number;
  voting_total_users_down: number;
  voting_absolute_vote: number;
  voting_power_rate: number;
}

export interface IPool {
  id: string;
  pool_id: string;
  name: string;
  slug: string;
  logo?: string;
  thumbnail?: string;
  contract_address: string;
  start_date: string;
  join_pool_start: string;
  join_pool_end: string;
  claim_at: string;
  website: string;
  audit_link?: string;
  liquidity_percentage?: string;
  twitter?: string;
  telegram?: string;
  medium?: string;
  description?: string;
  participants: number;

  token_name: string;
  token_address: string;
  token_symbol: string;
  token_to: string;
  token_decimals: number;
  token_max_allocation: number;
  token_economic: string;
  token_total_supply: number;
  token_total_raise: number;
  token_current_raise: number;
  token_ratio: number;
  progress: number;
  token_max_contribution_size: number;
  number_whitelisted_user?: number;

  campaign: IPoolCampaign;
  platform: string;
  admins: IPoolAdministrators;
  voting?: IVotingPhase;

  is_active: boolean;
  data: ServerResponseSMData;
  is_public: boolean;
  tag_line?: string;

  private_join_enabled: boolean;
  private_join_start?: Date;
  private_join_end?: Date;

  public_join_enabled: boolean;
  public_join_start: Date;
  public_join_end: Date;

  exclusive_join_enable: boolean;
  exclusive_join_start: Date;
  exclusive_join_end: Date;

  fcfs_join_for_staker_enabled: boolean;
  fcfs_join_for_staker_start: Date;
  fcfs_join_for_staker_end: Date;

  version?: number;
  claimable_percentage: number;
}

export interface TokenInfo {
  name: string;
  value: number;
}

export interface IRate {
  numerator: number;
  denominator: number;
}

export interface IFees {
  numerator: number;
  denominator: number;
}

export interface IPoolAdministrators {
  rootAdmin: PublicKey;
}

export interface IPoolCampaign {
  claim_at: string;
  claimed_allocation: number;
  max_allocation_all_phases: number;
  number_whitelisted_user: number;
  early_join_phase: IPoolPhase;
  public_phase: IPoolPhase;
  exclusive_phase?: {
    is_active: boolean;
    max_total_alloc: number;
    sold_allocation: number;
    number_joined_user: number;
    start_at: Date;
    end_at: Date;
    level1: IPoolWeight;
    level2: IPoolWeight;
    level3: IPoolWeight;
    level4: IPoolWeight;
    level5: IPoolWeight;
    snapshot_at?: Date;
  };
  fcfs_stake_phase?: IPoolFcfsStakerPhase;
}

export interface IPoolPhase {
  is_active: boolean;
  max_total_alloc: number;
  max_individual_alloc: number;
  sold_allocation: number;
  number_joined_user: number;
  start_at: string;
  end_at: string;
}

export interface IPoolStatus {
  type: PoolStatusType;
  diff: string;
  message: string;
}

export interface IPoolsFilter {
  section?: PoolsSectionFilter | PoolsVotingFilter;
  searchTerm?: string;
  page?: number;
  walletAddress?: string;
}
