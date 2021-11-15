import moment from 'moment';
import Decimal from 'decimal.js';
import React, { useMemo } from 'react';
import { useGlobal } from '../../../hooks/useGlobal';
import { usePool } from '../../../hooks/usePool';
import { IPool } from '../../../sdk/pool/interface';
import {
  isInExclusiveRound,
  isInFCFSForStakerRound,
  isInWhitelistRound,
} from '../../../utils/helper';
import { TOKEN_TO_DECIMALS } from '../../../utils/constants';

interface Props {
  connected: boolean;
  allocationLevel?: number;
  pool: IPool;
  participantAddress: string | null;
}

const PoolUserWhitelist: React.FC<Props> = ({
  connected,
  allocationLevel,
  pool,
  participantAddress,
}) => {
  const { now } = useGlobal();
  const { getMaxIndividualAllocationFCFSForStaker } = usePool();

  const childrenMarkup = useMemo(() => {
    if (!connected) {
      return <span>Please connect wallet to continue</span>;
    }

    const { individualStaker } = getMaxIndividualAllocationFCFSForStaker(
      pool,
      allocationLevel || 0,
    );
    let isShowWhitelistStatus: boolean = false;
    let isShowGuaranteedAllocationExclusiveRound: boolean = false;
    let msg: string;
    if (pool.is_active) {
      if (
        moment.unix(now).isBefore(pool.join_pool_start) || // pool active and is not open yet
        isInExclusiveRound(pool, now) || // in exclusive round
        isInFCFSForStakerRound(pool, now) || // in fcfs staker round
        (isInWhitelistRound(pool, now) && Boolean(participantAddress)) // in private round and has participant address
      ) {
        isShowWhitelistStatus = true;
        if (moment.unix(now).isBefore(pool.join_pool_start)) {
          msg = 'You are not whitelisted';
        } else if (
          (isInExclusiveRound(pool, now) || isInFCFSForStakerRound(pool, now)) &&
          allocationLevel &&
          allocationLevel > 0
        ) {
          msg = 'You are whitelisted';
        } else if (isInWhitelistRound(pool, now) && Boolean(participantAddress)) {
          msg = 'You are whitelisted';
        } else {
          msg = 'You are not whitelisted';
        }

        if (isInExclusiveRound(pool, now)) {
          isShowGuaranteedAllocationExclusiveRound = true;
        }
      } else {
        msg = 'You are not whitelisted';
      }
    } else {
      msg = 'You are not whitelisted';
    }

    return (
      <>
        {(isShowWhitelistStatus || isShowGuaranteedAllocationExclusiveRound) && (
          <div className="w-full h-full p-4 overflow-hidden text-sm text-white rounded-lg bg-303035">
            <div className="flex flex-col">
              {isShowWhitelistStatus && <span>{msg}</span>}
              {isShowGuaranteedAllocationExclusiveRound && (
                <span className="mt-6">
                  Your guaranteed allocation for exclusive round:{' '}
                  {`${new Decimal(individualStaker)
                    .dividedBy(pool.token_ratio)
                    .toFixed(TOKEN_TO_DECIMALS)} ${pool.token_to}`}
                </span>
              )}
            </div>
          </div>
        )}
      </>
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allocationLevel, connected, pool]);

  return <>{childrenMarkup}</>;
};

export default PoolUserWhitelist;
