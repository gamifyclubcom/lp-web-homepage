import React from 'react';
import { IPool } from '../../../sdk/pool/interface';
import { isInWhitelistRound } from '../../../utils/helper';
import { useGlobal } from '../../../hooks/useGlobal';
import { IPoolStatus } from '../../../sdk/pool/interface';
import { PoolStatusType } from '../../../shared/enum';

interface Props {
  connected: boolean;
  allocationLevel?: number;
  pool: IPool;
  participantAddress: string | null;
  status: IPoolStatus;
}

const PoolUserWhitelist: React.FC<Props> = ({
  connected,
  allocationLevel,
  pool,
  participantAddress,
  status,
}) => {
  const { now } = useGlobal();

  return (
    <div className="w-full overflow-hidden bg-303035 rounded-lg text-white flex flex-col justify-center h-28 px-8 text-sm">
      {connected ? (
        isInWhitelistRound(pool, now) && !Boolean(participantAddress) ? (
          <>
            <div className="">You are not whitelisted!</div>
            {status.type !== PoolStatusType.UPCOMING && (
              <div className="mt-6">{`Allocation of ${allocationLevel} GMFC`}</div>
            )}
          </>
        ) : (
          <>
            <div className="">You are whitelisted!</div>
            {status.type !== PoolStatusType.UPCOMING && (
              <div className="mt-6">{`Allocation of ${allocationLevel} GMFC`}</div>
            )}
          </>
        )
      ) : (
        'Please connect to wallet to continue.'
      )}
    </div>
  );
};

export default PoolUserWhitelist;
