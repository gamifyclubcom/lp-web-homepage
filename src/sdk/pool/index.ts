import {
  Actions,
  CURRENT_STAKE_ACCOUNT,
  IExtractPoolData,
  IExtractPoolV2Data,
  IPoolV3ContractData,
  IPoolV4ContractData,
  IVotingPhase,
} from '@intersola/onchain-program-sdk';
import { PublicKey } from '@solana/web3.js';
import moment from 'moment';
import queryString from 'query-string';
import { envConfig } from '../../config';
import {
  getPercent,
  isPoolV2Version,
  isPoolV3Version,
  isPoolV4Version,
} from '../../utils/helper';
import fetchWrapper from '../fetch-wrapper';
import {
  IPool,
  IPoolsFilter,
  IPoolVoting,
  ServerResponsePool,
  ServerResponsePoolVoting,
} from './interface';
import { Connection } from '@solana/web3.js';
import Decimal from 'decimal.js';

const baseBackendUrl = `${envConfig.API_URL_BACKEND}/api/pools`;

export const fakeWithClaimablePercentage = (
  amount: number,
  claimable_percentage: number
): number => {
  return new Decimal(amount)
    .times(100)
    .dividedBy(claimable_percentage)
    .toNumber();
};

export const mappingPoolServerResponse = (
  poolServer: ServerResponsePool,
  now: number
): IPool => {
  let participants =
    poolServer.data.campaign.early_join_phase.number_joined_user +
    poolServer.data.campaign.public_phase.number_joined_user;
  let token_current_raise =
    poolServer.data.campaign.early_join_phase.sold_allocation +
    poolServer.data.campaign.public_phase.sold_allocation;
  const token_total_raise = poolServer.data.campaign.max_allocation_all_phases;

  const private_join_enabled =
    poolServer.data.campaign.early_join_phase.is_active;
  const public_join_enabled = poolServer.data.campaign.public_phase.is_active;
  const private_join_start = poolServer.data.campaign.early_join_phase.start_at
    ? new Date(poolServer.data.campaign.early_join_phase.start_at)
    : undefined;
  const private_join_end = poolServer.data.campaign.early_join_phase.end_at
    ? new Date(poolServer.data.campaign.early_join_phase.end_at)
    : undefined;
  const public_join_start = new Date(
    poolServer.data.campaign.public_phase.start_at
  );
  const public_join_end = new Date(
    poolServer.data.campaign.public_phase.end_at
  );
  const exclusive_join_enable =
    poolServer.data.campaign?.exclusive_phase?.is_active || false;
  const exclusive_join_start = poolServer.data.campaign.exclusive_phase
    ? new Date(poolServer.data.campaign?.exclusive_phase?.start_at)
    : new Date();
  const exclusive_join_end = poolServer.data.campaign.exclusive_phase
    ? new Date(poolServer.data.campaign?.exclusive_phase?.end_at)
    : new Date();
  const fcfs_join_for_staker_enabled =
    poolServer.data.campaign?.fcfs_stake_phase?.is_active || false;
  const fcfs_join_for_staker_start = poolServer.data.campaign?.fcfs_stake_phase
    ?.start_at
    ? new Date(poolServer.data.campaign?.fcfs_stake_phase?.start_at)
    : new Date();
  const fcfs_join_for_staker_end = poolServer.data.campaign?.fcfs_stake_phase
    ?.end_at
    ? new Date(poolServer.data.campaign?.fcfs_stake_phase?.end_at)
    : new Date();
  if (exclusive_join_enable) {
    participants +=
      poolServer.data.campaign.exclusive_phase!.number_joined_user || 0;
    token_current_raise +=
      poolServer.data.campaign.exclusive_phase!.sold_allocation || 0;
  }

  const join_pool_start = private_join_enabled
    ? private_join_start?.toISOString()
    : exclusive_join_enable
    ? exclusive_join_start.toISOString()
    : public_join_start.toISOString();
  const join_pool_end = public_join_end.toISOString();

  const is_public =
    private_join_enabled &&
    moment.unix(now).isBetween(private_join_start, private_join_end)
      ? false
      : true;
  const token_max_contribution_size =
    private_join_enabled &&
    moment.unix(now).isBetween(private_join_start, private_join_end)
      ? poolServer.data.campaign.early_join_phase.max_individual_alloc
      : poolServer.data.campaign.public_phase.max_individual_alloc;
  const progress = getPercent(token_current_raise, token_total_raise);
  const claimable_percentage = poolServer.claimable_percentage || 100;

  return {
    id: poolServer._id.toString(),
    pool_id: poolServer.data.id,
    name: poolServer.name,
    slug: poolServer.slug,
    logo: poolServer.logo,
    contract_address: poolServer.contract_address,
    start_date: poolServer.pool_start,
    join_pool_start: join_pool_start!,
    join_pool_end: join_pool_end,
    claim_at: poolServer.data.campaign.claim_at,
    website: poolServer.website,
    audit_link: poolServer.audit_link || '',
    liquidity_percentage: poolServer.liquidity_percentage || '',
    twitter: poolServer.twitter,
    telegram: poolServer.telegram,
    medium: poolServer.medium,
    description: poolServer.description,
    participants,
    token_name: poolServer.token.token_name,
    token_address: poolServer.token.token_address,
    token_symbol: poolServer.token.token_symbol,
    token_to: poolServer.token_to,
    token_decimals: poolServer.token.token_decimals,
    token_max_allocation: fakeWithClaimablePercentage(
      poolServer.data.campaign.max_allocation_all_phases,
      claimable_percentage
    ),
    token_economic: poolServer.token_economic,
    token_total_supply: new Decimal(
      poolServer.token.token_total_supply
    ).toNumber(),
    token_total_raise: fakeWithClaimablePercentage(
      token_total_raise,
      claimable_percentage
    ),
    token_current_raise: fakeWithClaimablePercentage(
      token_current_raise,
      claimable_percentage
    ),
    token_ratio: fakeWithClaimablePercentage(
      poolServer.data.rate,
      claimable_percentage
    ),
    progress,
    token_max_contribution_size: fakeWithClaimablePercentage(
      token_max_contribution_size,
      claimable_percentage
    ),
    number_whitelisted_user: poolServer.data.campaign.number_whitelisted_user,
    campaign: {
      ...poolServer.data.campaign,
      early_join_phase: {
        ...poolServer.data.campaign.early_join_phase,
        max_total_alloc: fakeWithClaimablePercentage(
          poolServer.data.campaign.early_join_phase.max_total_alloc,
          claimable_percentage
        ),
        max_individual_alloc: fakeWithClaimablePercentage(
          poolServer.data.campaign.early_join_phase.max_individual_alloc,
          claimable_percentage
        ),
        sold_allocation: fakeWithClaimablePercentage(
          poolServer.data.campaign.early_join_phase.sold_allocation,
          claimable_percentage
        ),
      },
      public_phase: {
        ...poolServer.data.campaign.public_phase,
        max_total_alloc: fakeWithClaimablePercentage(
          poolServer.data.campaign.public_phase.max_total_alloc,
          claimable_percentage
        ),
        max_individual_alloc: fakeWithClaimablePercentage(
          poolServer.data.campaign.public_phase.max_individual_alloc,
          claimable_percentage
        ),
        sold_allocation: fakeWithClaimablePercentage(
          poolServer.data.campaign.public_phase.sold_allocation,
          claimable_percentage
        ),
      },
    },
    platform: poolServer.data.platform,
    admins: { rootAdmin: new PublicKey(poolServer.data.admins.root_admin) },
    is_active: poolServer.data.is_active,
    data: poolServer.data,
    is_public,
    tag_line: poolServer.tag_line,
    private_join_enabled,
    private_join_start,
    private_join_end,
    public_join_enabled,
    public_join_start,
    public_join_end,
    exclusive_join_enable,
    exclusive_join_start,
    exclusive_join_end,
    claimable_percentage,
    fcfs_join_for_staker_enabled,
    fcfs_join_for_staker_start,
    fcfs_join_for_staker_end,
  };
};

export const mappingPoolOnChainResponse = (
  poolBase: IPool,
  poolOnChain:
    | IExtractPoolData
    | IExtractPoolV2Data
    | IPoolV3ContractData
    | IPoolV4ContractData,
  now: number
): IPool => {
  let participants =
    poolOnChain.campaign.early_join_phase.number_joined_user +
    poolOnChain.campaign.public_phase.number_joined_user;
  let token_current_raise =
    poolOnChain.campaign.early_join_phase.sold_allocation +
    poolOnChain.campaign.public_phase.sold_allocation;
  const token_total_raise = poolOnChain.campaign.max_allocation_all_phases;

  const private_join_enabled = poolOnChain.campaign.early_join_phase.is_active;
  const public_join_enabled = poolOnChain.campaign.public_phase.is_active;
  const private_join_start = poolOnChain.campaign.early_join_phase.start_at
    ? new Date(poolOnChain.campaign.early_join_phase.start_at)
    : undefined;
  const private_join_end = poolOnChain.campaign.early_join_phase.end_at
    ? new Date(poolOnChain.campaign.early_join_phase.end_at)
    : undefined;
  const public_join_start = new Date(
    poolOnChain.campaign.public_phase.start_at
  );
  const public_join_end = new Date(poolOnChain.campaign.public_phase.end_at);

  const exclusive_join_enable =
    isPoolV2Version(poolOnChain) ||
    isPoolV3Version(poolOnChain) ||
    isPoolV4Version(poolOnChain)
      ? poolOnChain.campaign?.exclusive_phase?.is_active || false
      : false;
  const exclusive_join_start =
    isPoolV2Version(poolOnChain) ||
    isPoolV3Version(poolOnChain) ||
    isPoolV4Version(poolOnChain)
      ? new Date(poolOnChain.campaign?.exclusive_phase?.start_at)
      : new Date();
  const exclusive_join_end =
    isPoolV2Version(poolOnChain) ||
    isPoolV3Version(poolOnChain) ||
    isPoolV4Version(poolOnChain)
      ? new Date(poolOnChain.campaign?.exclusive_phase?.end_at)
      : new Date();

  const fcfs_join_for_staker_enabled =
    isPoolV3Version(poolOnChain) || isPoolV4Version(poolOnChain)
      ? poolOnChain.campaign?.fcfs_stake_phase.is_active || false
      : false;
  const fcfs_join_for_staker_start =
    isPoolV3Version(poolOnChain) || isPoolV4Version(poolOnChain)
      ? new Date(poolOnChain.campaign?.fcfs_stake_phase.start_at)
      : new Date();
  const fcfs_join_for_staker_end =
    isPoolV3Version(poolOnChain) || isPoolV4Version(poolOnChain)
      ? new Date(poolOnChain.campaign?.fcfs_stake_phase.end_at)
      : new Date();

  if (
    isPoolV2Version(poolOnChain) ||
    isPoolV3Version(poolOnChain) ||
    isPoolV4Version(poolOnChain)
  ) {
    participants += poolOnChain.campaign.exclusive_phase.number_joined_user;
    token_current_raise += poolOnChain.campaign.exclusive_phase.sold_allocation;
  }
  if (isPoolV3Version(poolOnChain) || isPoolV4Version(poolOnChain)) {
    participants += poolOnChain.campaign.fcfs_stake_phase.number_joined_user;
    token_current_raise +=
      poolOnChain.campaign.fcfs_stake_phase.sold_allocation;
  }

  const is_public =
    private_join_enabled &&
    moment.unix(now).isBetween(private_join_end, private_join_end)
      ? false
      : true;

  const join_pool_start = private_join_enabled
    ? private_join_start?.toISOString()
    : exclusive_join_enable
    ? exclusive_join_start.toISOString()
    : fcfs_join_for_staker_enabled
    ? fcfs_join_for_staker_start.toISOString()
    : public_join_start.toISOString();
  const join_pool_end = public_join_end.toISOString();

  const token_max_contribution_size = is_public
    ? poolOnChain.campaign.public_phase.max_individual_alloc
    : poolOnChain.campaign.early_join_phase.max_individual_alloc;

  const progress = getPercent(token_current_raise, token_total_raise);
  const claimable_percentage = poolBase.claimable_percentage || 100;

  return {
    id: poolBase.id.toString(),
    pool_id: poolBase.pool_id,
    name: poolBase.name,
    slug: poolBase.slug,
    logo: poolBase.logo,
    contract_address: poolBase.contract_address,
    start_date: poolBase.start_date,
    join_pool_start: join_pool_start!,
    join_pool_end,
    claim_at: poolOnChain.campaign.claim_at.toISOString(),
    website: poolBase.website,
    audit_link: poolBase.audit_link || '',
    liquidity_percentage: poolBase.liquidity_percentage || '',
    twitter: poolBase.twitter,
    telegram: poolBase.telegram,
    medium: poolBase.medium,
    description: poolBase.description,
    participants,
    token_name: poolBase.token_name,
    token_address: poolBase.token_address,
    token_symbol: poolBase.token_symbol,
    token_to: poolBase.token_to,
    token_decimals: poolBase.token_decimals,
    token_max_allocation: fakeWithClaimablePercentage(
      poolOnChain.campaign.max_allocation_all_phases,
      claimable_percentage
    ),
    token_economic: poolBase.token_economic,
    token_total_supply: poolBase.token_total_supply,
    token_total_raise: fakeWithClaimablePercentage(
      token_total_raise,
      claimable_percentage
    ),
    token_current_raise: fakeWithClaimablePercentage(
      token_current_raise,
      claimable_percentage
    ),
    token_ratio: fakeWithClaimablePercentage(
      poolOnChain.rate,
      claimable_percentage
    ),
    progress,
    token_max_contribution_size: fakeWithClaimablePercentage(
      token_max_contribution_size,
      claimable_percentage
    ),
    number_whitelisted_user: poolOnChain.campaign.number_whitelisted_user,
    campaign: {
      ...poolOnChain.campaign,
      claim_at: poolOnChain.campaign.claim_at.toISOString(),
      early_join_phase: {
        ...poolOnChain.campaign.early_join_phase,
        max_total_alloc: fakeWithClaimablePercentage(
          poolOnChain.campaign.early_join_phase.max_total_alloc,
          claimable_percentage
        ),
        max_individual_alloc: fakeWithClaimablePercentage(
          poolOnChain.campaign.early_join_phase.max_individual_alloc,
          claimable_percentage
        ),
        sold_allocation: fakeWithClaimablePercentage(
          poolOnChain.campaign.early_join_phase.sold_allocation,
          claimable_percentage
        ),
        start_at: poolOnChain.campaign.early_join_phase.start_at.toISOString(),
        end_at: poolOnChain.campaign.early_join_phase.end_at.toISOString(),
      },
      ...(isPoolV2Version(poolOnChain) && {
        exclusive_phase: {
          ...poolOnChain.campaign.exclusive_phase,
          sold_allocation: fakeWithClaimablePercentage(
            poolOnChain.campaign.exclusive_phase.sold_allocation,
            claimable_percentage
          ),
          max_total_alloc: fakeWithClaimablePercentage(
            poolOnChain.campaign.exclusive_phase.max_total_alloc,
            claimable_percentage
          ),
          level1: {
            ...poolOnChain.campaign.exclusive_phase.level1,
            max_individual_amount: fakeWithClaimablePercentage(
              poolOnChain.campaign.exclusive_phase.level1.max_individual_amount,
              claimable_percentage
            ),
          },
          level2: {
            ...poolOnChain.campaign.exclusive_phase.level2,
            max_individual_amount: fakeWithClaimablePercentage(
              poolOnChain.campaign.exclusive_phase.level2.max_individual_amount,
              claimable_percentage
            ),
          },
          level3: {
            ...poolOnChain.campaign.exclusive_phase.level3,
            max_individual_amount: fakeWithClaimablePercentage(
              poolOnChain.campaign.exclusive_phase.level3.max_individual_amount,
              claimable_percentage
            ),
          },
          level4: {
            ...poolOnChain.campaign.exclusive_phase.level4,
            max_individual_amount: fakeWithClaimablePercentage(
              poolOnChain.campaign.exclusive_phase.level4.max_individual_amount,
              claimable_percentage
            ),
          },
          level5: {
            ...poolOnChain.campaign.exclusive_phase.level5,
            max_individual_amount: fakeWithClaimablePercentage(
              poolOnChain.campaign.exclusive_phase.level5.max_individual_amount,
              claimable_percentage
            ),
          },
        },
      }),
      ...((isPoolV3Version(poolOnChain) || isPoolV4Version(poolOnChain)) && {
        exclusive_phase: {
          ...poolOnChain.campaign.exclusive_phase,
          sold_allocation: fakeWithClaimablePercentage(
            poolOnChain.campaign.exclusive_phase.sold_allocation,
            claimable_percentage
          ),
          max_total_alloc: fakeWithClaimablePercentage(
            poolOnChain.campaign.exclusive_phase.max_total_alloc,
            claimable_percentage
          ),
          level1: {
            ...poolOnChain.campaign.exclusive_phase.level1,
            max_individual_amount: fakeWithClaimablePercentage(
              poolOnChain.campaign.exclusive_phase.level1.max_individual_amount,
              claimable_percentage
            ),
          },
          level2: {
            ...poolOnChain.campaign.exclusive_phase.level2,
            max_individual_amount: fakeWithClaimablePercentage(
              poolOnChain.campaign.exclusive_phase.level2.max_individual_amount,
              claimable_percentage
            ),
          },
          level3: {
            ...poolOnChain.campaign.exclusive_phase.level3,
            max_individual_amount: fakeWithClaimablePercentage(
              poolOnChain.campaign.exclusive_phase.level3.max_individual_amount,
              claimable_percentage
            ),
          },
          level4: {
            ...poolOnChain.campaign.exclusive_phase.level4,
            max_individual_amount: fakeWithClaimablePercentage(
              poolOnChain.campaign.exclusive_phase.level4.max_individual_amount,
              claimable_percentage
            ),
          },
          level5: {
            ...poolOnChain.campaign.exclusive_phase.level5,
            max_individual_amount: fakeWithClaimablePercentage(
              poolOnChain.campaign.exclusive_phase.level5.max_individual_amount,
              claimable_percentage
            ),
          },
        },
        fcfs_stake_phase: {
          ...poolOnChain.campaign.fcfs_stake_phase,
          max_total_alloc: fakeWithClaimablePercentage(
            poolOnChain.campaign.fcfs_stake_phase.max_total_alloc,
            claimable_percentage
          ),
          sold_allocation: fakeWithClaimablePercentage(
            poolOnChain.campaign.fcfs_stake_phase.sold_allocation,
            claimable_percentage
          ),
          start_at: poolOnChain.campaign.fcfs_stake_phase.start_at,
          end_at: poolOnChain.campaign.fcfs_stake_phase.end_at,
        },
      }),
      public_phase: {
        ...poolOnChain.campaign.public_phase,
        max_total_alloc: fakeWithClaimablePercentage(
          poolOnChain.campaign.public_phase.max_total_alloc,
          claimable_percentage
        ),
        max_individual_alloc: fakeWithClaimablePercentage(
          poolOnChain.campaign.public_phase.max_individual_alloc,
          claimable_percentage
        ),
        sold_allocation: fakeWithClaimablePercentage(
          poolOnChain.campaign.public_phase.sold_allocation,
          claimable_percentage
        ),
        start_at: poolOnChain.campaign.public_phase.start_at.toISOString(),
        end_at: poolOnChain.campaign.public_phase.end_at.toISOString(),
      },
    },
    platform: poolOnChain.platform,
    admins: { rootAdmin: new PublicKey(poolOnChain.admins.root_admin) },
    is_active: poolOnChain.is_active,
    data: poolBase.data,
    is_public,
    tag_line: poolBase.tag_line,
    private_join_enabled,
    private_join_start,
    private_join_end,
    public_join_enabled,
    public_join_start,
    public_join_end,
    exclusive_join_enable,
    exclusive_join_start,
    exclusive_join_end,
    claimable_percentage,
    fcfs_join_for_staker_enabled,
    fcfs_join_for_staker_start,
    fcfs_join_for_staker_end,
  };
};

export const mappingPoolVotingServerResponse = (
  poolVotingServer: ServerResponsePoolVoting,
  now: number
): IPoolVoting => {
  const poolVoting = mappingPoolServerResponse(poolVotingServer, now);

  let voting_progress: number = 0;
  const voting_total_up: number = poolVotingServer?.voting?.total_vote_up || 0;
  const voting_total_down: number =
    poolVotingServer?.voting?.total_vote_down || 0;
  const voting_min_can_active: number =
    poolVotingServer?.voting?.required_absolute_vote || 0;
  const voting_start: Date = poolVotingServer?.voting?.start_at
    ? new Date(poolVotingServer?.voting?.start_at)
    : new Date();
  const voting_end: Date = poolVotingServer?.voting?.end_at
    ? new Date(poolVotingServer?.voting?.end_at)
    : new Date();
  const voting_total_users_up =
    poolVotingServer?.voting?.total_users_vote_up || 0;
  const voting_total_users_down =
    poolVotingServer?.voting?.total_users_vote_down || 0;
  let absolute_vote = new Decimal(voting_total_up)
    .minus(voting_total_down)
    .toNumber();
  if (voting_min_can_active <= 0) {
    voting_progress = 0;
  } else {
    voting_progress = new Decimal(absolute_vote)
      .times(100)
      .dividedBy(voting_min_can_active)
      .toNumber();
    if (voting_progress > 100) {
      voting_progress = 100;
    } else if (voting_progress < 0) {
      voting_progress = 0;
    }
  }
  voting_progress = parseFloat(voting_progress.toFixed(2));
  const voting_power_rate =
    poolVotingServer?.voting?.token_voting_power_rate || 0;

  return {
    ...poolVoting,
    voting: poolVotingServer?.data?.voting,
    voting_progress,
    voting_total_up,
    voting_total_down,
    voting_min_can_active,
    voting_start,
    voting_end,
    voting_total_users_up,
    voting_total_users_down,
    voting_absolute_vote: absolute_vote,
    voting_power_rate,
  };
};

export const mappingPoolVotingOnChainResponse = (
  poolVotingBase: IPoolVoting,
  poolVotingOnChain:
    | IExtractPoolData
    | IExtractPoolV2Data
    | IPoolV3ContractData
    | IPoolV4ContractData,
  now: number
): IPoolVoting => {
  const poolVoting = mappingPoolOnChainResponse(
    poolVotingBase,
    poolVotingOnChain,
    now
  );
  let voting_progress: number = 0;
  let voting_total_up: number = 0;
  let voting_total_down: number = 0;
  let voting_min_can_active: number = 0;
  let voting_start: Date = new Date();
  let voting_end: Date = new Date();
  let voting_total_users_up: number = 0;
  let voting_total_users_down: number = 0;
  let absolute_vote: number = 0;
  let voting: IVotingPhase | undefined;
  let voting_power_rate: number = 0;

  if (isPoolV4Version(poolVotingOnChain)) {
    voting = poolVotingOnChain.voting;
    voting_total_up = poolVotingOnChain.voting.total_vote_up;
    voting_total_down = poolVotingOnChain.voting.total_vote_down;
    voting_min_can_active = poolVotingOnChain.voting.required_absolute_vote;
    voting_start = new Date(poolVotingOnChain.voting.start_at);
    voting_end = new Date(poolVotingOnChain.voting.end_at);
    absolute_vote = new Decimal(voting_total_up)
      .minus(voting_total_down)
      .toNumber();
    if (voting_min_can_active <= 0) {
      voting_progress = 0;
    } else {
      voting_progress = new Decimal(absolute_vote)
        .times(100)
        .dividedBy(voting_min_can_active)
        .toNumber();

      if (voting_progress > 100) {
        voting_progress = 100;
      } else if (voting_progress < 0) {
        voting_progress = 0;
      }
    }

    voting_progress = parseFloat(voting_progress.toFixed(2));

    voting_total_users_up = poolVotingOnChain.voting.total_users_vote_up;
    voting_total_users_down = poolVotingOnChain.voting.total_users_vote_down;
    voting_power_rate = poolVotingOnChain.voting.token_voting_power_rate;
  }

  return {
    ...poolVoting,
    voting,
    voting_progress,
    voting_total_up,
    voting_total_down,
    voting_min_can_active,
    voting_start,
    voting_end,
    voting_total_users_up,
    voting_total_users_down,
    voting_absolute_vote: absolute_vote,
    voting_power_rate,
  };
};

export const getPoolFullInfo = async (data: IPool, connection: Connection) => {
  const action = new Actions(connection);
  const poolData = await action.readPool(new PublicKey(data.contract_address));
  const join_pool_start = poolData.campaign.early_join_phase.is_active
    ? poolData.campaign.early_join_phase.start_at
    : poolData.campaign.public_phase.start_at;
  const join_pool_end = poolData.campaign.public_phase.end_at;
  return {
    ...data,
    join_pool_end,
    join_pool_start,
    data: poolData,
  };
};

const getPoolBySlug = async (
  slug: string
): Promise<ServerResponsePool | null> => {
  try {
    const response = await fetchWrapper.get<ServerResponsePool>(
      `${baseBackendUrl}/${slug}`
    );

    return response;
  } catch (err) {
    return null;
  }
};

export const getPools = async (
  filter?: IPoolsFilter
): Promise<PaginateResponse<ServerResponsePool>> => {
  let paginated: PaginateResponse<ServerResponsePool>;

  if (!filter) {
    paginated = await fetchWrapper.get<PaginateResponse<ServerResponsePool>>(
      baseBackendUrl
    );
  } else {
    const query = `${queryString.stringify(filter)}`;
    paginated = await fetchWrapper.get<PaginateResponse<ServerResponsePool>>(
      `${baseBackendUrl}?${query}`
    );
  }

  return paginated;
};

const getPoolVotingBySlug = async (
  slug: string
): Promise<ServerResponsePoolVoting | null> => {
  try {
    const response = await fetchWrapper.get<ServerResponsePoolVoting>(
      `${baseBackendUrl}/voting/${slug}`
    );

    return response;
  } catch (err) {
    return null;
  }
};

const getPoolsVoting = async (
  filter?: IPoolsFilter
): Promise<PaginateResponse<ServerResponsePoolVoting>> => {
  /**
   * TODO: Should uncomment and use this, for now, use fake data
   */
  let paginated: PaginateResponse<ServerResponsePoolVoting>;

  if (!filter) {
    paginated = await fetchWrapper.get<
      PaginateResponse<ServerResponsePoolVoting>
    >(`${baseBackendUrl}/voting`);
  } else {
    const query = `${queryString.stringify(filter)}`;
    paginated = await fetchWrapper.get<
      PaginateResponse<ServerResponsePoolVoting>
    >(`${baseBackendUrl}/voting?${query}`);
  }

  return paginated;
};

const userVote = async (
  poolId: string,
  params: {
    total_vote_up: number;
    total_vote_down: number;
  }
): Promise<boolean> => {
  const result = await fetchWrapper.put<
    { total_vote_up: number; total_vote_down: number },
    boolean
  >(`${baseBackendUrl}/voting/${poolId}`, {
    total_vote_up: params.total_vote_up,
    total_vote_down: params.total_vote_down,
  });

  console.log({ userVoteResult: result });

  return result;
};

export const userJoinPool = async (
  userAddress: string,
  poolAddress: string,
  amount: number,
  participantAddress?: string
): Promise<boolean> => {
  const result = await fetchWrapper.post<
    {
      user_address: string;
      pool_address: string;
      amount: number;
      participant_address?: string;
    },
    boolean
  >(`${baseBackendUrl}/join_pool`, {
    user_address: userAddress,
    pool_address: poolAddress,
    amount,
    participant_address: participantAddress,
  });

  return result;
};

const userClaimToken = async (
  userAddress: string,
  poolAddress: string,
  tokenAddress: string
): Promise<{ claimed: boolean; claimed_at: string } | null> => {
  try {
    const result = await fetchWrapper.post<
      {
        user_address: string;
        pool_address: string;
        token_address: string;
        claimed_at: string;
        is_claimed: boolean;
      },
      any
    >(`${baseBackendUrl}/claim-token/histories`, {
      user_address: userAddress,
      pool_address: poolAddress,
      token_address: tokenAddress,
      claimed_at: new Date().toISOString(),
      is_claimed: true,
    });

    if (result) {
      return {
        claimed: result.claimed,
        claimed_at: result.claimed_at,
      };
    }

    return null;
  } catch (err) {
    return null;
  }
};

const userGetClaimedTokenTime = async (
  userAddress: string,
  poolAddress: string,
  tokenAddress: string
): Promise<string | null> => {
  try {
    const query = `${queryString.stringify({
      user_address: userAddress,
      pool_address: poolAddress,
      token_address: tokenAddress,
    })}`;
    const result = await fetchWrapper.get<any>(
      `${baseBackendUrl}/claim-token/history?${query}`
    );
    if (result) {
      return result.claimed_at;
    }

    return null;
  } catch (err) {
    return null;
  }
};

const createUserStakeHistory = async (
  userAddress: string,
  amount: number,
  actionType: 'stake' | 'unstake'
): Promise<boolean> => {
  const url = `${envConfig.API_URL_BACKEND}/api/user/stake/history`;
  try {
    const result = await fetchWrapper.post<
      {
        user_address: string;
        amount: number;
        stake_member_acount?: string;
        action_type: 'stake' | 'unstake';
        stake_account: string;
      },
      boolean
    >(url, {
      user_address: userAddress,
      amount,
      action_type: actionType,
      stake_account: CURRENT_STAKE_ACCOUNT,
    });

    return true;
  } catch (err) {
    return false;
  }
};

export const poolAPI = {
  userJoinPool,
  getPools,
  getPoolsVoting,
  getPoolVotingBySlug,
  getPoolBySlug,
  userClaimToken,
  userGetClaimedTokenTime,
  createUserStakeHistory,
  userVote,
};
