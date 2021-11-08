import React from 'react';
import { IPool } from '../../../sdk/pool/interface';
import { getPoolLogo, getPoolStatus, tokenToSOL } from '../../../utils/helper';
import { useGlobal } from '../../../hooks/useGlobal';
import PoolStatus from '../../shared/pool/PoolStatus';
import { usePool } from '../../../hooks/usePool';

interface Props {
  pool: IPool;
}

const PoolItem: React.FC<Props> = ({ pool }) => {
  const { handleGoToPoolDetails } = usePool();
  const logo = getPoolLogo(pool.logo);
  const { now } = useGlobal();

  const status = getPoolStatus({
    ...pool,
    now,
  });

  return (
    <div
      className="flex flex-col px-5 pt-8 pb-5 text-base text-center text-white rounded-lg cursor-pointer bg-222228"
      onClick={() => handleGoToPoolDetails(pool)}
    >
      <div className="h-40 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logo} alt={pool.name} className="object-contain w-full max-h-full" />
      </div>
      <div className="text-1.5xl2 my-4 text-left">
        {pool.name} <span>({pool.token_name})</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-500">Total Raise</span>
        <span className="text-1.125lg md:text-base xl:text-1.125lg">
          {tokenToSOL(pool.token_total_raise, pool.token_ratio)} {pool.token_to}
        </span>
      </div>
      <div className="flex justify-between mt-2.5">
        <span className="text-gray-500">Rate</span>
        <span className="text-1.125lg md:text-base xl:text-1.125lg">
          1 {pool.token_to} = {pool.token_ratio} {pool.token_symbol}
        </span>
      </div>
      <div className="flex justify-between mt-2.5 mb-5">
        <span className="text-gray-500">Supported</span>
        <span className="text-1.125lg">{pool.token_to}</span>
      </div>
      <PoolStatus loading={false} status={status} />
    </div>
  );
};

export default PoolItem;
