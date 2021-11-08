import React from 'react';
import { IPool } from '../../sdk/pool/interface';
import { getPoolLogo, getPoolStatus, tokenToSOL } from '../../utils/helper';
import { useGlobal } from '../../hooks/useGlobal';
import PoolStatus from '../shared/PoolStatus';
import { usePool } from '../../hooks/usePool';

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
      className="flex flex-col bg-222228 rounded-3xl pt-8 px-5 pb-5 text-base text-white text-center hover:bg-interpurp hover:bg-opacity-20 cursor-pointer"
      onClick={() => handleGoToPoolDetails(pool)}
    >
      <div className="h-40 overflow-hidden">
        <img src={logo} alt={pool.name} className="w-full object-contain max-h-full" />
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
      <PoolStatus status={status} />
    </div>
  );
};

export default PoolItem;
