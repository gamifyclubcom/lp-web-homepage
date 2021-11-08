import { useMemo } from 'react';
import { useGlobal } from '../../../hooks/useGlobal';
import { usePool } from '../../../hooks/usePool';
import { IPool } from '../../../sdk/pool/interface';
import { getPoolLogo, getPoolStatus } from '../../../utils/helper';
import BalanceBadge from '../../shared/BalanceBadge';
import PoolProgressBar from '../../shared/pool/PoolProgressBar';
import PoolStatus from '../../shared/pool/PoolStatus';

interface Props {
  pool: IPool;
  loading: boolean;
}

const PoolsRow: React.FC<Props> = ({ pool, loading }) => {
  const { handleGoToPoolDetails } = usePool();
  const { now } = useGlobal();
  const goToPoolDetails = () => handleGoToPoolDetails(pool);

  const logo = useMemo(() => getPoolLogo(pool.logo), [pool.logo]);

  const status = useMemo(() => {
    return getPoolStatus({
      start_date: pool.start_date,
      join_pool_start: pool.join_pool_start,
      join_pool_end: pool.join_pool_end,
      is_active: pool.is_active,
      progress: pool.progress,
      now,
    });
  }, [
    now,
    pool.is_active,
    pool.join_pool_end,
    pool.join_pool_start,
    pool.progress,
    pool.start_date,
  ]);

  const renderProgress = useMemo(() => {
    return pool.progress ? `${pool.progress}%` : pool.progress === 0 ? '0%' : 'Loading';
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <tr
      onClick={goToPoolDetails}
      className="text-xl font-medium text-left text-white border-b opacity-75 cursor-pointer border-fuchsia-500 hover:bg-gray-900"
    >
      <td className="px-4 py-2">
        <div className="flex items-center w-full">
          <div className="hidden w-10 h-10 mr-4 overflow-hidden border border-gray-500 rounded-full shadow-sm lg:block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logo} className="w-full h-full rounded-full" alt="Pool Logo" />
          </div>
          <p className="flex-1 overflow-hidden text-sm whitespace-nowrap overflow-ellipsis">
            {pool.name}
          </p>
        </div>
      </td>
      <td className="hidden w-1/4 px-4 py-2 md:table-cell">
        <div className="flex items-center w-full">
          <span className="uppercase">
            <BalanceBadge
              variant="with-ratio"
              mintFrom={pool.token_to}
              mintTo={pool.token_symbol}
              price={pool.token_ratio}
              className="text-sm"
            />
          </span>
        </div>
      </td>
      <td className="px-4 py-2">
        <div className="flex items-center w-full">
          <span className="mr-2 text-sm" style={{ minWidth: 36 }}>
            {renderProgress}
          </span>
          <div className="block w-full sm:hidden lg:block">
            <PoolProgressBar
              variant="complex"
              total={pool.token_total_raise}
              current={pool.token_current_raise}
              loading={loading}
            />
          </div>
        </div>
      </td>
      <td className="px-4 py-2">
        <div className="flex items-center ">
          <PoolStatus status={status} loading={loading} />
        </div>
      </td>
    </tr>
  );
};

export default PoolsRow;
