import clsx from 'clsx';
import { useMemo } from 'react';
import { usePool } from '../../../hooks/usePool';
import { IPool } from '../../../sdk/pool/interface';
import PoolCountdown, { IRound } from './PoolCountdown';

interface Props {
  pool: IPool;
  whitelistStatus: string;
  disabled: boolean;
}

const PoolRounds: React.FC<Props> = ({ pool, whitelistStatus, disabled }) => {
  const { getPoolRoundsInfo } = usePool();

  const rounds: IRound[] = getPoolRoundsInfo(pool, whitelistStatus);

  const private_join_enabled = useMemo(() => {
    return Boolean(pool.campaign.early_join_phase.is_active);
  }, [pool.campaign.early_join_phase.is_active]);

  return (
    <div className="w-full">
      {/* <span className="text-white">Pool round</span> */}
      <div className="p-4 mb-2">
        <span className="text-sm font-semibold text-white uppercase">Pool round timeline</span>
      </div>

      <div
        className={clsx('p-4', {
          'opacity-50': disabled,
        })}
      >
        <div className="grid grid-cols-1 gap-4">
          {rounds.map((round) => {
            if (!round.enabled) {
              return null;
            }

            return (
              <PoolCountdown
                key={round.key}
                round={round}
                poolActive={pool.is_active}
                hasWhitelistRound={private_join_enabled}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PoolRounds;
