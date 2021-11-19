import { Actions } from '@gamify/onchain-program-sdk';
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
import fetchWrapper from '../sdk/fetch-wrapper';
import { IPool, IPoolVoting } from '../sdk/pool/interface';
import { ITimeline } from '../shared/interface';
import { isInExclusiveRound, isInFCFSForStakerRound } from '../utils/helper';
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
    if (isInFCFSForStakerRound(pool, now) || isInExclusiveRound(pool, now)) {
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
        totalStaker: new Decimal(maxIndividualAlloc).times(multiplicationRate).toNumber(),
        individualStaker: maxIndividualAlloc,
      };

      // return new Decimal(maxIndividualAlloc).times(multiplicationRate).toNumber();
    }

    return {
      totalStaker: 0,
      individualStaker: 0,
    };
  };

  const getPoolTimelines = (pool: IPool): ITimeline[] => {
    let index = 2;
    let result: ITimeline[] = [
      {
        key: 'upcoming',
        index: 1,
        name: 'Upcoming',
        endAt: new Date(pool.join_pool_start),
      },
    ];
    if (pool.private_join_enabled) {
      result.push({
        key: 'whitelist',
        index,
        name: 'Whitelist',
        startAt: pool.private_join_start,
        endAt: pool.private_join_end,
      });
      index += 1;
    }
    if (pool.exclusive_join_enable) {
      result.push({
        key: 'exclusive',
        index,
        name: 'Exclusive',
        startAt: pool.exclusive_join_start,
        endAt: pool.exclusive_join_end,
      });
      index += 1;
    }
    if (pool.fcfs_join_for_staker_enabled) {
      result.push({
        key: 'fcfs-staker',
        index,
        name: 'FCFS Staker',
        startAt: pool.fcfs_join_for_staker_start,
        endAt: pool.fcfs_join_for_staker_end,
      });
      index += 1;
    }
    if (pool.public_join_enabled) {
      result.push({
        key: 'fcfs',
        index,
        name: 'FCFS',
        startAt: pool.public_join_start,
        endAt: pool.public_join_end,
      });
      index += 1;
    }
    result.push({
      key: 'claimable',
      index,
      name: 'Claimable',
      startAt: new Date(pool.claim_at),
    });

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
    getPoolTimelines,
  };
}
