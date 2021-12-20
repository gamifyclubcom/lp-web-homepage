import {
  IExtractPoolData,
  IExtractPoolV2Data,
  IPoolV3ContractData,
  IPoolV4ContractData,
} from '@gamify/onchain-program-sdk';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import Decimal from 'decimal.js';
import moment from 'moment';
import { envConfig } from '../configs';
import { IPool, IPoolStatus, IPoolVoting } from '../sdk/pool/interface';
import {
  PoolCountdownType,
  PoolRoundType,
  PoolStatusType,
  PoolVotingStatusType,
} from '../shared/enum';
import { IAllocationLevel } from '../shared/interface';
import { MIN_PROGRESS_PASS_FULL, SOL_DECIMALS } from './constants';

const { SOLLET_ENV, SOLANA_EXPLORER_URL } = envConfig;

export const isEmpty = (str?: string | null): boolean => {
  if (!str) {
    return true;
  }
  return str.trim() === '';
};

export const getPoolLogo = (logo?: string): string => {
  const image = !isEmpty(logo) ? logo! : '/images/placeholder_circle.svg';

  return image;
};

export const getPoolThumbnail = (thumbnail?: string): string => {
  const image = !isEmpty(thumbnail) ? thumbnail! : '/images/placeholder_thumbnail.png';

  return image;
};

export const getPercent = (curr: number, total: number): number => {
  return parseFloat(((curr * 100) / total).toFixed(2));
};

// incoming: current_date --> start_date --> end_date
// open: start_date --> current_date --> end_date
// closed: start_date --> end_date --> current_date
// timeline: start_date -> join_pool_start -> join_pool_end
export const getDiffWithCurrent = (futureDate: Date, passDate: Date): string => {
  let diff: number;

  if (moment(futureDate).diff(passDate, 'days') > 0) {
    diff = moment(futureDate).diff(passDate, 'days');
    return `${diff} days`;
  }

  if (moment(futureDate).diff(passDate, 'hours') > 0) {
    diff = moment(futureDate).diff(passDate, 'hours');
    return `${diff} hours`;
  }

  if (moment(futureDate).diff(passDate, 'seconds') > 0) {
    diff = moment(futureDate).diff(passDate, 'seconds');
    return `${diff} seconds`;
  }

  return 'now';
};

export const getPoolStatus = ({
  start_date,
  join_pool_start,
  join_pool_end,
  is_active,
  progress,
  now,
}: {
  start_date: string;
  join_pool_start: string;
  join_pool_end: string;
  is_active: boolean;
  progress: number;
  now: number;
}): IPoolStatus => {
  let type: PoolStatusType;
  let diff: string;
  let message: string;

  /* console.log(
    {
      start_date: moment(start_date).format('DD/MM/YYYY hh:mm:ss'),
      join_pool_start: moment(join_pool_start).format('DD/MM/YYYY hh:mm:ss'),
      join_pool_end: moment(join_pool_end).format('DD/MM/YYYY hh:mm:ss'),
      is_active,
      progress,
      now,
    },
    '123',
  ); */

  if (!is_active) {
    // DRAFT
    type = PoolStatusType.UPCOMING;
    diff = '';
    message = '';
  } else if (
    moment(start_date).isBetween(new Date(moment.unix(now).toISOString()), join_pool_start)
  ) {
    // DRAFT
    type = PoolStatusType.DRAFT;
    diff = '';
    message = '';
  } else if (moment.unix(now).isBetween(start_date, join_pool_start)) {
    // UPCOMING
    type = PoolStatusType.UPCOMING;
    diff = getDiffWithCurrent(new Date(join_pool_start), new Date(moment.unix(now).toISOString()));
    message = `Open in ${getDiffWithCurrent(
      new Date(join_pool_start),
      new Date(moment.unix(now).toISOString()),
    )}`;
  } else if (moment.unix(now).isBetween(join_pool_start, join_pool_end)) {
    // OPEN | FILL
    diff = getDiffWithCurrent(new Date(moment.unix(now).toISOString()), new Date(start_date));
    message = `Published ${getDiffWithCurrent(
      new Date(moment.unix(now).toISOString()),
      new Date(start_date),
    )} ago`;

    if (progress >= MIN_PROGRESS_PASS_FULL) {
      // filled
      type = PoolStatusType.FILLED;
    } else {
      // open
      type = PoolStatusType.OPEN;
    }
  } else {
    // CLOSE
    // if (pool.progress === 100) {
    //   // filled
    //   type = PoolStatusType.FILLED;
    // } else {
    //   // closed
    //   type = PoolStatusType.CLOSED;
    // }
    type = PoolStatusType.CLOSED;

    diff = getDiffWithCurrent(new Date(moment.unix(now).toISOString()), new Date(join_pool_end));
    message = `Closed ${getDiffWithCurrent(
      new Date(moment.unix(now).toISOString()),
      new Date(join_pool_end),
    )} ago`;
  }

  return { type, diff, message };
};

export const getPoolVotingStatus = (poolVoting: IPoolVoting, now: number): PoolVotingStatusType => {
  if (moment.unix(now).isBefore(poolVoting.voting_start)) {
    return PoolVotingStatusType.UPCOMING;
  }

  if (moment.unix(now).isBetween(poolVoting.voting_start, poolVoting.voting_end)) {
    if (
      poolVoting.voting_total_up - poolVoting.voting_total_down >=
      poolVoting.voting_min_can_active
    ) {
      return PoolVotingStatusType.VALIDATED;
    }

    return PoolVotingStatusType.IN_VOTING;
  }

  return PoolVotingStatusType.DEACTIVATED;
};

/**
 * Get pool access based on pool phase times and pool phase enabled
 * @param pool
 */
export const getPoolAccess = (pool: IPool): string => {
  let result = [];
  if (pool.campaign.early_join_phase.is_active) {
    result.push('Whitelist');
  }
  if (pool.campaign.exclusive_phase?.is_active) {
    result.push('Stakers Round 1');
  }
  if (pool.campaign.fcfs_stake_phase?.is_active) {
    result.push('Stakers Round 2');
  }
  if (pool.campaign.public_phase.is_active) {
    result.push('Public Round');
  }

  return result.join('/');
};

export const tokenToSOL = (value: number, rate: number): number => {
  return parseFloat((value / rate).toFixed(SOL_DECIMALS));
};

export const convertUnixTimestampToDate = (timestamp: number, format?: string): string => {
  return `${moment
    .unix(timestamp)
    .utc()
    .format(format || 'ddd MMM DD, YYYY LT')} (UTC)`;
};

export const generateOnChainUrl = (variant: 'tx' | 'address', value: string): string => {
  return `${SOLANA_EXPLORER_URL}/${variant}/${value}?cluster=${SOLLET_ENV}`;
};

const isSmallNumber = (val: number) => {
  return val < 0.001 && val > 0;
};

const numberFormatter = new Intl.NumberFormat('en-US', {
  style: 'decimal',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const transformLamportsToSOL = (lamports: number): number => {
  return lamports / LAMPORTS_PER_SOL;
};

export const formatNumber = {
  format: (val?: number, useSmall?: boolean) => {
    if (!val && val !== 0) {
      return '--';
    }
    if (useSmall && isSmallNumber(val)) {
      return 0.001;
    }

    return numberFormatter.format(val);
  },
};

export function renderTokenBalance(
  balance: string | number | Decimal | null | undefined,
  tokenDecimals: number,
): number {
  if (balance === null || balance === undefined) {
    return 0;
  }

  if (typeof balance === 'string') {
    return parseFloat(parseFloat(balance).toFixed(tokenDecimals));
  }

  return new Decimal(parseFloat(balance.toString()).toFixed(tokenDecimals)).toNumber();
}

export function isPoolV2Version(
  pool: IExtractPoolV2Data | IPoolV3ContractData | IExtractPoolData,
): pool is IExtractPoolV2Data {
  if ((pool as IExtractPoolV2Data).version === 2) {
    return true;
  }

  return false;
}

export function isPoolV3Version(
  pool: IExtractPoolV2Data | IPoolV3ContractData | IExtractPoolData,
): pool is IPoolV3ContractData {
  if ((pool as IPoolV3ContractData).version === 3) {
    return true;
  }

  return false;
}

export function isPoolV4Version(
  pool: IExtractPoolV2Data | IPoolV3ContractData | IExtractPoolData | IPoolV4ContractData,
): pool is IPoolV4ContractData {
  if ((pool as IPoolV4ContractData).version === 4) {
    return true;
  }

  return false;
}

export const getUserAllocationLevel = (
  userTokenAllocation: number,
  levels: IAllocationLevel[],
): number => {
  let result: number = 0;

  levels.forEach((lv) => {
    if (userTokenAllocation >= lv.minAllocation) {
      result = lv.level;
    }
  });

  return result;
};

export const getClaimableField = (
  claimable_percentage: number,
): {
  left: JSX.Element;
  right: JSX.Element;
}[] => {
  if (claimable_percentage !== 100) {
    return [
      {
        left: <span>Claimable</span>,
        right: <span>{claimable_percentage}%</span>,
      },
    ];
  }
  return [];
};

export const roundNumberByDecimal = (
  input: number | string | Decimal,
  decimal: number,
): Decimal => {
  return new Decimal(
    parseInt(new Decimal(input).times(Decimal.pow(10, decimal)).toString()),
  ).dividedBy(Decimal.pow(10, decimal));
};

export const getTimesFromDate = (date?: Date): number => {
  // return in seconds unit
  if (!date) {
    return 0;
  }

  const result = new Decimal(date.getTime() || 0).dividedBy(1000);

  return new Decimal(roundNumberByDecimal(result, 0)).times(1000).toNumber();
};

export const isInWhitelistRound = (pool: IPool, now: number): boolean => {
  return (
    Boolean(pool?.campaign?.early_join_phase?.is_active) &&
    Boolean(
      moment
        .unix(now)
        .isBetween(
          pool.campaign?.early_join_phase?.start_at,
          pool.campaign?.early_join_phase?.end_at,
        ),
    )
  );
};
export const isInExclusiveRound = (pool: IPool, now: number): boolean => {
  return (
    Boolean(pool.campaign?.exclusive_phase?.is_active) &&
    Boolean(
      moment
        .unix(now)
        .isBetween(
          pool.campaign?.exclusive_phase?.start_at,
          pool.campaign?.exclusive_phase?.end_at,
        ),
    )
  );
};
export const isInFCFSForStakerRound = (pool: IPool, now: number): boolean => {
  return (
    Boolean(pool.campaign?.fcfs_stake_phase?.is_active) &&
    Boolean(
      moment
        .unix(now)
        .isBetween(
          pool.campaign?.fcfs_stake_phase?.start_at,
          pool.campaign?.fcfs_stake_phase?.end_at,
        ),
    )
  );
};
export const isInFCFSRound = (pool: IPool, now: number): boolean => {
  return (
    Boolean(pool.campaign?.public_phase?.is_active) &&
    Boolean(
      moment
        .unix(now)
        .isBetween(pool.campaign?.public_phase?.start_at, pool.campaign?.public_phase?.end_at),
    )
  );
};

/**
 * Convert on chain unit to number of token
 * Or number of token to on chain unit
 *
 * @param value number
 * @param decimals number
 * @param variant 'on-chain-to-token' | 'token-to-on-chain'
 * @returns number
 */
export const transformUnit = (
  value: number,
  decimals: number,
  variant: 'on-chain-to-token' | 'token-to-on-chain',
): number => {
  if (variant === 'on-chain-to-token') {
    return new Decimal(value).dividedBy(Decimal.pow(10, decimals)).toNumber();
    // return value / Math.pow(10, decimals);
  }

  return new Decimal(value).times(Decimal.pow(10, decimals)).toNumber();
  // return value * Math.pow(10, decimals);
};

export const isRoundActive = (params: {
  poolActive: boolean;
  poolProgress: number;
  start: Date;
  end: Date;
  now: number;
}): boolean => {
  const { poolActive, poolProgress, now, start, end } = params;
  return poolActive && moment.unix(now).isBetween(start, end) && poolProgress < 100;
};

export const isBeforeCountdownDate = (now: number, countdownDate: Date): boolean => {
  return moment.unix(now).isBefore(countdownDate);
};

export const getPoolRoundCountdownDate = (now: number, start: Date, end: Date): Date => {
  if (isBeforeCountdownDate(now, start)) {
    return start;
  }

  return end;
};

export const getPoolRoundCountdownVariant = (now: number, start: Date): PoolCountdownType => {
  if (isBeforeCountdownDate(now, start)) {
    return PoolCountdownType.ToOpen;
  }

  return PoolCountdownType.ToClose;
};

export const getCurrCountDown = (pool: IPool, now: number): PoolRoundType | null => {
  if (pool.private_join_enabled) {
    if (
      moment.unix(now).isBefore(pool.private_join_start) ||
      moment.unix(now).isBetween(pool.private_join_start, pool.private_join_end)
    ) {
      return PoolRoundType.Whitelist;
    }
  }

  if (pool.exclusive_join_enable) {
    if (
      moment.unix(now).isBefore(pool.exclusive_join_start) ||
      moment.unix(now).isBetween(pool.exclusive_join_start, pool.exclusive_join_end)
    ) {
      return PoolRoundType.Exclusive;
    }
  }

  if (pool.fcfs_join_for_staker_enabled) {
    if (
      moment.unix(now).isBefore(pool.fcfs_join_for_staker_start) ||
      moment.unix(now).isBetween(pool.fcfs_join_for_staker_start, pool.fcfs_join_for_staker_end)
    ) {
      return PoolRoundType.FcfsStaker;
    }
  }

  if (pool.public_join_enabled) {
    if (
      moment.unix(now).isBefore(pool.public_join_start) ||
      moment.unix(now).isBetween(pool.public_join_start, pool.public_join_end)
    ) {
      return PoolRoundType.Fcfs;
    }
  }

  return null;
};
