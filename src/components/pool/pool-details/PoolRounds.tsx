import { useMemo } from 'react';
import { usePool } from '../../../hooks/usePool';
import { IPool } from '../../../sdk/pool/interface';
import PoolCardTitle from '../../shared/pool/PoolCardTitle';
import { IRound } from './PoolCountdown';
import PoolTimelines from './PoolTimelines';

interface Props {
  pool: IPool;
  whitelistStatus: string;
  disabled: boolean;
}

const PoolRounds: React.FC<Props> = ({ pool, whitelistStatus, disabled }) => {
  const { getPoolRoundsInfo, getPoolTimelines } = usePool();

  const rounds: IRound[] = getPoolRoundsInfo(pool, whitelistStatus);
  const timelines = getPoolTimelines(pool);

  const private_join_enabled = useMemo(() => {
    return Boolean(pool.campaign.early_join_phase.is_active);
  }, [pool.campaign.early_join_phase.is_active]);

  return (
    <div className="w-full h-full p-4" style={{ minHeight: 200 }}>
      <div className="mb-4">
        <PoolCardTitle title="Pool round timeline" />
      </div>

      <PoolTimelines timelines={timelines} activeKey="test" />

      {/* <div
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
      </div> */}
    </div>
  );
};

export default PoolRounds;
