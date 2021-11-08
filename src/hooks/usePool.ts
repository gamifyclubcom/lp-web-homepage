import { Actions } from '@intersola/onchain-program-sdk';
import { MintLayout, u64 } from '@solana/spl-token';
import { useConnection } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
// @ts-ignore
import BN from 'bn.js';
import Decimal from 'decimal.js';
import moment from 'moment';
import { useRouter } from 'next/router';
import { useContext, useEffect, useState } from 'react';
import PoolContext from '../contexts/pool';
import { IRound } from '../components/pool/pool-details/PoolCountdown';
import fetchWrapper from '../sdk/fetch-wrapper';
import { IPool, IPoolVoting } from '../sdk/pool/interface';
import { PoolRoundType } from '../shared/enum';
import {
  getCurrCountDown,
  getPoolRoundCountdownDate,
  getPoolRoundCountdownVariant,
  isEmpty,
  isInFCFSForStakerRound,
  isRoundActive,
} from '../utils/helper';
import { mappingPoolOnChainResponse, mappingPoolVotingOnChainResponse } from './../sdk/pool/index';
import { useGlobal } from './useGlobal';

export function usePool() {
  const router = useRouter();

  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [poolVotingHasNext, setPoolVotingHasNext] = useState(false);
  const [poolVotingHasPrevious, setPoolVotingHasPrevious] = useState(false);
  const {
    paginatedPool,
    paginatedPoolVoting,
    loading,
    setLoading,
    dispatchPaginatedPool,
    dispatchPaginatedPoolVoting,
  } = useContext(PoolContext);
  const { connection } = useConnection();
  const { now } = useGlobal();
  const [refreshing, setRefreshing] = useState(false);
  const CACHE_PRICE_DURATION = 10;

  useEffect(() => {
    if (paginatedPool) {
      setHasNext(() => {
        return paginatedPool.page < paginatedPool.totalPages - 1;
      });
      setHasPrevious(() => {
        return paginatedPool.page >= 1;
      });
    }
  }, [paginatedPool]);

  useEffect(() => {
    if (paginatedPoolVoting) {
      setPoolVotingHasNext(() => {
        return paginatedPoolVoting.page < paginatedPoolVoting.totalPages - 1;
      });

      setPoolVotingHasPrevious(() => {
        return paginatedPoolVoting.page >= 1;
      });
    }
  }, [paginatedPoolVoting]);

  const getTokenPrice = async (ratio: number): Promise<any> => {
    const priceCacheAt = localStorage.getItem('solana-price-at');
    const priceCache = localStorage.getItem('solana-price');
    const usePriceCache =
      priceCacheAt &&
      moment(priceCacheAt).add(CACHE_PRICE_DURATION, 'minutes').isAfter(moment.unix(now));
    if (usePriceCache && priceCache) return parseFloat(priceCache);

    const response = await fetchWrapper.get<any>(
      `https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd`,
    );
    const price = parseFloat(((response?.solana?.usd || 0) / ratio).toFixed(8));
    localStorage.setItem('solana-price-at', moment.unix(now).toString());
    localStorage.setItem('solana-price', price.toString());

    return price;
  };

  const handleGoToPoolDetails = (pool: IPool) => {
    router.push(`/pools/${pool.slug}`);
  };

  const handleGoToPoolVotingDetails = (poolVoting: IPoolVoting) => {
    router.push(`/pools-voting/${poolVoting.slug}`);
  };

  const getTokenInfo = async (
    tokenAddress: string,
  ): Promise<{ token_total_supply: number; token_decimals: number }> => {
    setLoading(true);
    try {
      const result = await connection.getAccountInfo(new PublicKey(tokenAddress));
      if (!result) {
        return Promise.reject({ message: 'Can not fetch token info' });
      }

      const token = MintLayout.decode(Buffer.from(result.data));

      setLoading(false);

      return {
        token_total_supply: parseFloat(
          new Decimal(u64.fromBuffer(token.supply).toString())
            .div(new Decimal(10).pow(new BN(token.decimals).toString()))
            .toString(),
        ),
        token_decimals: token.decimals,
      };
    } catch (err) {
      setLoading(false);
      return Promise.reject({ err });
    }
  };

  const getPoolFullInfo = async (data: IPool): Promise<IPool> => {
    const action = new Actions(connection);
    setLoading(true);
    try {
      const poolData = await action.readPool(new PublicKey(data.contract_address));
      setLoading(false);
      return mappingPoolOnChainResponse(data, poolData, now);
    } catch (err) {
      setLoading(false);
      return Promise.reject({ err });
    }
  };

  const getPoolVotingFullInfo = async (data: IPoolVoting): Promise<IPoolVoting> => {
    const action = new Actions(connection);
    setLoading(true);

    try {
      const poolData = await action.readPool(new PublicKey(data.contract_address));
      setLoading(false);
      return mappingPoolVotingOnChainResponse(data, poolData, now);
    } catch (err) {
      setLoading(false);
      return Promise.reject({ err });
    }
  };

  const getMaxIndividualAllocationFCFSForStaker = (
    pool: IPool,
    currentUserLevel: number,
  ): { totalStaker: number; individualStaker: number } => {
    if (isInFCFSForStakerRound(pool, now)) {
      let maxIndividualAlloc: number = 0;
      let multiplicationRate: number = 1;

      switch (currentUserLevel) {
        case 1:
          maxIndividualAlloc = pool.campaign.exclusive_phase
            ? pool.campaign.exclusive_phase.level1.max_individual_amount
            : 0;
          break;
        case 2:
          maxIndividualAlloc = pool.campaign.exclusive_phase
            ? pool.campaign.exclusive_phase.level2.max_individual_amount
            : 0;
          break;
        case 3:
          maxIndividualAlloc = pool.campaign.exclusive_phase
            ? pool.campaign.exclusive_phase.level3.max_individual_amount
            : 0;
          break;
        case 4:
          maxIndividualAlloc = pool.campaign.exclusive_phase
            ? pool.campaign.exclusive_phase.level4.max_individual_amount
            : 0;
          break;
        case 5:
          maxIndividualAlloc = pool.campaign.exclusive_phase
            ? pool.campaign.exclusive_phase.level5.max_individual_amount
            : 0;
          break;
        default:
          maxIndividualAlloc = 0;
          break;
      }
      if (pool.campaign.fcfs_stake_phase) {
        multiplicationRate = pool.campaign.fcfs_stake_phase.multiplication_rate;
      }

      return {
        totalStaker: maxIndividualAlloc,
        individualStaker: new Decimal(maxIndividualAlloc).times(multiplicationRate).toNumber(),
      };

      // return new Decimal(maxIndividualAlloc).times(multiplicationRate).toNumber();
    }

    return {
      totalStaker: 0,
      individualStaker: 0,
    };
  };

  const getPoolRoundsInfo = (pool: IPool, whitelistStatus: string): IRound[] => {
    const currCountdown = getCurrCountDown(pool, now);
    const fcfs_join_for_staker_enabled = Boolean(pool.campaign.fcfs_stake_phase?.is_active);
    const exclusive_join_enable = Boolean(pool.campaign?.exclusive_phase?.is_active);
    const private_join_enabled = Boolean(pool.campaign.early_join_phase.is_active);
    const public_join_enabled = Boolean(pool.campaign.public_phase.is_active);

    const fcfs_join_for_staker_start = fcfs_join_for_staker_enabled
      ? new Date(pool.campaign.fcfs_stake_phase!.start_at)
      : new Date();
    const fcfs_join_for_staker_end = fcfs_join_for_staker_enabled
      ? new Date(pool.campaign.fcfs_stake_phase!.end_at)
      : new Date();
    const exclusive_join_start = exclusive_join_enable
      ? new Date(pool.campaign.exclusive_phase!.start_at)
      : new Date();
    const exclusive_join_end = exclusive_join_enable
      ? new Date(pool.campaign.exclusive_phase!.end_at)
      : new Date();
    const private_join_pool_start = new Date(pool.campaign.early_join_phase.start_at);
    const private_join_pool_end = new Date(pool.campaign.early_join_phase.end_at);
    const public_join_pool_start = new Date(pool.campaign.public_phase.start_at);
    const public_join_pool_end = new Date(pool.campaign.public_phase.end_at);

    const result: IRound[] = [
      {
        key: PoolRoundType.Whitelist,
        enabled: private_join_enabled,
        active: isRoundActive({
          poolActive: pool.is_active,
          poolProgress: pool.progress,
          start: private_join_pool_start,
          end: private_join_pool_end,
          now,
        }),
        countdownActive: currCountdown === PoolRoundType.Whitelist,
        title: `Whitelist ${isEmpty(whitelistStatus) ? '' : `- ${whitelistStatus}`}`,
        description: 'Prequalified addresses only',
        date: getPoolRoundCountdownDate(now, private_join_pool_start, private_join_pool_end),
        startRound: private_join_pool_start,
        variant: getPoolRoundCountdownVariant(now, private_join_pool_start),
      },
      {
        key: PoolRoundType.Exclusive,
        enabled: exclusive_join_enable,
        active: isRoundActive({
          poolActive: pool.is_active,
          poolProgress: pool.progress,
          start: exclusive_join_start,
          end: exclusive_join_end,
          now,
        }),
        countdownActive: currCountdown === PoolRoundType.Exclusive,
        title: `Exclusive ${isEmpty(whitelistStatus) ? '' : `- ${whitelistStatus}`}`,
        description: 'Exclusive round',
        date: getPoolRoundCountdownDate(now, exclusive_join_start, exclusive_join_end),
        startRound: exclusive_join_start,
        variant: getPoolRoundCountdownVariant(now, exclusive_join_start),
      },
      {
        key: PoolRoundType.FcfsStaker,
        enabled: fcfs_join_for_staker_enabled,
        active: isRoundActive({
          poolActive: pool.is_active,
          poolProgress: pool.progress,
          start: fcfs_join_for_staker_start,
          end: fcfs_join_for_staker_end,
          now,
        }),
        countdownActive: currCountdown === PoolRoundType.FcfsStaker,
        title: `FCFS staker ${isEmpty(whitelistStatus) ? '' : `- ${whitelistStatus}`}`,
        description: 'FCFS for staker round',
        date: getPoolRoundCountdownDate(now, fcfs_join_for_staker_start, fcfs_join_for_staker_end),
        startRound: fcfs_join_for_staker_start,
        variant: getPoolRoundCountdownVariant(now, fcfs_join_for_staker_start),
      },
      {
        key: PoolRoundType.Fcfs,
        enabled: public_join_enabled,
        active: isRoundActive({
          poolActive: pool.is_active,
          poolProgress: pool.progress,
          start: public_join_pool_start,
          end: public_join_pool_end,
          now,
        }),
        countdownActive: currCountdown === PoolRoundType.Fcfs,
        title: 'FCFS',
        description: 'First come, first serve',
        date: getPoolRoundCountdownDate(now, public_join_pool_start, public_join_pool_end),
        startRound: public_join_pool_start,
        variant: getPoolRoundCountdownVariant(now, public_join_pool_start),
      },
    ];

    return result;
  };

  return {
    paginatedPool,
    paginatedPoolVoting,
    hasNext,
    hasPrevious,
    poolVotingHasNext,
    poolVotingHasPrevious,
    loading,
    refreshing,
    dispatchPaginatedPool,
    handleGoToPoolDetails,
    handleGoToPoolVotingDetails,
    getTokenInfo,
    getTokenPrice,
    getPoolFullInfo,
    getPoolVotingFullInfo,
    getMaxIndividualAllocationFCFSForStaker,
    getPoolRoundsInfo,
  };
}
