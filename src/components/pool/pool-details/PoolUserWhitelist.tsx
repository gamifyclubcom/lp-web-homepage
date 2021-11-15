import React, { useMemo } from 'react';
import { usePool } from '../../../hooks/usePool';
import { IPool } from '../../../sdk/pool/interface';

interface Props {
  connected: boolean;
  allocationLevel?: number;
  pool: IPool;
  isWhitelist: boolean;
}

const PoolUserWhitelist: React.FC<Props> = ({ connected, allocationLevel, pool, isWhitelist }) => {
  const { getMaxIndividualAllocationFCFSForStaker } = usePool();

  const childrenMarkup = useMemo(() => {
    if (!connected) {
      return <span>Please connect wallet to continue</span>;
    }

    const { individualStaker } = getMaxIndividualAllocationFCFSForStaker(
      pool,
      allocationLevel || 0,
    );

    return (
      <div className="flex flex-col">
        <span>{isWhitelist ? 'You are whitelisted' : 'You are not whitelisted'}</span>
        <span className="mt-6">
          Your guaranteed allocation for exclusive round: {individualStaker}
        </span>
      </div>
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allocationLevel, connected, pool]);

  return <div className="w-full h-full p-4 text-sm text-white">{childrenMarkup}</div>;
};

export default PoolUserWhitelist;
