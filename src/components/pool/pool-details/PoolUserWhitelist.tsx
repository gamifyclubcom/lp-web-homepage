import Decimal from 'decimal.js';
import moment from 'moment';
import React, { useMemo } from 'react';
import { useGlobal } from '../../../hooks/useGlobal';
import { usePool } from '../../../hooks/usePool';
import { IPool, IPoolStatus } from '../../../sdk/pool/interface';
import { PoolStatusType } from '../../../shared/enum';
import { TOKEN_TO_DECIMALS } from '../../../utils/constants';
import {
  isInExclusiveRound,
  isInFCFSForStakerRound,
  isInWhitelistRound,
} from '../../../utils/helper';

interface Props {
  connected: boolean;
  allocationLevel?: number;
  pool: IPool;
  participantAddress: string | null;
  status: IPoolStatus;
  loading: boolean;
}

const PoolUserWhitelist: React.FC<Props> = ({
  connected,
  allocationLevel,
  pool,
  participantAddress,
  status,
  loading,
}) => {
  const { now } = useGlobal();
  const { getMaxIndividualAllocationForStaker } = usePool();

  const whitelistStatus = useMemo((): string => {
    if (!connected) {
      return 'Connect wallet';
    }

    let isWhitelisted = false;
    if (
      pool.private_join_enabled &&
      moment.unix(now).isBefore(pool.private_join_end) &&
      Boolean(participantAddress)
    ) {
      isWhitelisted = true;
    }

    if (
      pool.exclusive_join_enable &&
      moment.unix(now).isBefore(pool.exclusive_join_end) &&
      allocationLevel &&
      allocationLevel > 0
    ) {
      isWhitelisted = true;
    }

    if (
      pool.fcfs_join_for_staker_enabled &&
      moment.unix(now).isBefore(pool.fcfs_join_for_staker_end) &&
      allocationLevel &&
      allocationLevel > 0
    ) {
      isWhitelisted = true;
    }

    if (status.type === PoolStatusType.UPCOMING) {
      if (!pool.is_active) {
        return '';
      }

      if (isWhitelisted) {
        return 'You are whitelisted 🎉';
      }

      return 'You are not in the whitelist';
    }

    if (
      pool.private_join_enabled ||
      pool.exclusive_join_enable ||
      pool.fcfs_join_for_staker_enabled
    ) {
      if (isWhitelisted) {
        return 'You are whitelisted 🎉';
      }

      return 'You are not in the whitelist';
    }

    return 'N/A';
  }, [
    allocationLevel,
    connected,
    now,
    participantAddress,
    pool.exclusive_join_enable,
    pool.exclusive_join_end,
    pool.fcfs_join_for_staker_enabled,
    pool.fcfs_join_for_staker_end,
    pool.is_active,
    pool.private_join_enabled,
    pool.private_join_end,
    status.type,
  ]);

  const childrenMarkup = useMemo(() => {
    const { individualStaker } = getMaxIndividualAllocationForStaker(
      pool,
      allocationLevel || 0,
      true,
    );
    let isShowWhitelistStatus: boolean = false;
    let isShowGuaranteedAllocationExclusiveRound: boolean = false;
    if (
      pool.is_active &&
      (moment.unix(now).isBefore(pool.join_pool_start) || // pool active and is not open yet
        isInExclusiveRound(pool, now) || // in exclusive round
        isInFCFSForStakerRound(pool, now) || // in fcfs staker round
        isInWhitelistRound(pool, now)) // in private round and has participant address
    ) {
      isShowWhitelistStatus = true;

      if (isInExclusiveRound(pool, now)) {
        isShowGuaranteedAllocationExclusiveRound = true;
      }
    }

    const guaranteed = parseFloat(
      new Decimal(individualStaker).dividedBy(pool.token_ratio).toFixed(TOKEN_TO_DECIMALS),
    );

    return (
      <>
        {(isShowWhitelistStatus || isShowGuaranteedAllocationExclusiveRound) && (
          <div className="w-full min-h-115p p-4 overflow-hidden text-sm text-white rounded-lg bg-303035">
            <div className="flex flex-col justify-center min-h-115p">
              {!connected ? (
                <span>Please connect wallet to continue</span>
              ) : loading ? (
                <span className="w-32 h-3 bg-gray-500 rounded-full animate-pulse"> </span>
              ) : (
                <>
                  {isShowWhitelistStatus && <span className="text-base">{whitelistStatus}</span>}
                  {isShowGuaranteedAllocationExclusiveRound && (
                    <span className="mt-6">
                      Your guaranteed allocation for tokens stakers round:{' '}
                      {`${guaranteed} ${pool.token_to}`}
                    </span>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </>
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allocationLevel, connected, pool, whitelistStatus]);

  return <>{childrenMarkup}</>;
};

export default PoolUserWhitelist;
