import { Actions } from '@intersola/onchain-program-sdk';
import { MintLayout, u64 } from '@solana/spl-token';
import { useConnection } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
// @ts-ignore
import BN from 'bn.js';
import Decimal from 'decimal.js';
import moment from 'moment';
import { useRouter } from 'next/router';
import { useState } from 'react';
import fetchWrapper from '../sdk/fetch-wrapper';
import { IPool, IPoolVoting } from '../sdk/pool/interface';
import { isInFCFSForStakerRound } from '../utils/helper';
import { mappingPoolOnChainResponse, mappingPoolVotingOnChainResponse } from './../sdk/pool/index';
import { useGlobal } from './useGlobal';

export function usePool() {
  const router = useRouter();
  const { connection } = useConnection();
  const { activePoolMenu, now } = useGlobal();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const CACHE_PRICE_DURATION = 10;

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
  ): number => {
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

      return new Decimal(maxIndividualAlloc).times(multiplicationRate).toNumber();
    }

    return 0;
  };

  return {
    loading,
    refreshing,
    handleGoToPoolDetails,
    handleGoToPoolVotingDetails,
    getTokenInfo,
    getTokenPrice,
    getPoolFullInfo,
    getPoolVotingFullInfo,
    getMaxIndividualAllocationFCFSForStaker,
  };
}
