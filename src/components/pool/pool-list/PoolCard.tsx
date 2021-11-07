import { useMemo } from 'react';
import { AiOutlineArrowRight } from 'react-icons/ai';
import { useGlobal } from '../../../hooks/useGlobal';
import { usePool } from '../../../hooks/usePool';
import { IPool } from '../../../sdk/pool/interface';
import { getPoolLogo, getPoolStatus, getPoolThumbnail } from '../../../utils/helper';
import BalanceBadge from '../../shared/BalanceBadge';
import PoolProgressBar from '../../shared/pool/PoolProgressBar';
import PoolStatus from '../../shared/pool/PoolStatus';

interface Props {
  variant: 'upcoming-pool' | 'feature-pool' | 'completed-pool';
  pool: IPool;
  loading: boolean;
}

const PoolCard: React.FC<Props> = ({ pool, variant, loading }) => {
  const { now } = useGlobal();
  const { handleGoToPoolDetails } = usePool();
  const thumbnail = useMemo(() => getPoolThumbnail(pool.thumbnail), [pool.thumbnail]);
  const logo = useMemo(() => getPoolLogo(pool.logo), [pool.logo]);
  const status = useMemo(
    () =>
      getPoolStatus({
        start_date: pool.start_date,
        join_pool_start: pool.join_pool_start,
        join_pool_end: pool.join_pool_end,
        is_active: pool.is_active,
        progress: pool.progress,
        now: now,
      }),
    [now, pool.is_active, pool.join_pool_end, pool.join_pool_start, pool.progress, pool.start_date],
  );

  const progressExtraContent = useMemo(() => {
    return `${pool.token_current_raise} / ${pool.token_total_raise} (${pool.token_symbol})`;
  }, [pool.token_current_raise, pool.token_symbol, pool.token_total_raise]);

  const goToPool = () => handleGoToPoolDetails(pool);

  const poolCardMarkup = useMemo(() => {
    switch (variant) {
      case 'upcoming-pool':
        return (
          <div className="flex flex-col w-full">
            <div
              className="relative w-full h-48 mb-4 overflow-hidden bg-center bg-cover rounded-lg cursor-pointer md:h-32 lg:h-48"
              style={{ backgroundImage: `url(${thumbnail})` }}
            >
              <div className="absolute inset-0 bg-black bg-opacity-30" />
            </div>

            <div className="w-full">
              <h6 className="mb-4 text-lg font-semibold text-white truncate">
                {pool.token_name} ({pool.token_symbol})
              </h6>
              <div className="flex items-center justify-between my-2">
                <span className="text-sm text-white opacity-30">Total Raise</span>
                <BalanceBadge
                  variant="basic"
                  mint={pool.token_to}
                  price={pool.token_total_raise}
                  className="text-sm text-white"
                />
              </div>
              <div className="flex items-center justify-between my-2">
                <span className="text-sm text-white opacity-30">Rate</span>
                <BalanceBadge
                  variant="with-ratio"
                  price={pool.token_ratio}
                  className="text-sm text-white"
                  mintFrom={pool.token_symbol}
                  mintTo={pool.token_to}
                />
              </div>
              <div className="flex items-center justify-between my-2">
                <span className="text-sm text-white opacity-30">Supported</span>
                <span className="text-sm text-white uppercase">{pool.token_symbol}</span>
              </div>
            </div>

            <div className="w-full mt-6">
              <button className="flex items-center justify-center w-full h-12 text-sm text-center text-white transition-all duration-200 bg-gray-500 rounded-full hover:bg-gray-600">
                Whitelist end in TBA hours
              </button>
            </div>
          </div>
        );
      case 'feature-pool':
        return (
          <div className="flex items-start justify-between w-full">
            <div
              className="relative hidden h-48 overflow-hidden bg-center bg-cover rounded-lg md:block"
              style={{ backgroundImage: `url(${thumbnail})`, width: 500 }}
            >
              <div className="absolute inset-0 bg-black bg-opacity-30" />
            </div>

            <div className="flex flex-col items-center w-full ml-4">
              <h6 className="mb-8 text-sm font-semibold text-white">
                {pool.name} ({pool.token_symbol})
              </h6>

              <div className="flex items-center justify-between w-full my-1">
                <span className="text-sm text-white">Total Raise</span>
                <BalanceBadge
                  variant="basic"
                  mint={pool.token_to}
                  price={pool.token_total_raise}
                  className="text-sm text-secondary-400"
                />
              </div>
              <div className="flex items-center justify-between w-full my-1">
                <span className="text-sm text-white">Participants</span>
                <span className="text-sm font-semibold text-white">{pool.participants}</span>
              </div>
              <div className="flex items-center justify-between w-full my-1">
                <span className="text-sm text-white">Progress</span>
                <span className="text-sm text-white">
                  {pool.progress}%<span className="ml-2 opacity-30">{progressExtraContent}</span>
                </span>
              </div>

              <div className="w-full my-2">
                <PoolProgressBar
                  loading={loading}
                  variant="complex"
                  current={pool.token_current_raise}
                  total={pool.token_total_raise}
                />
              </div>
              <button
                onClick={goToPool}
                className="flex items-center justify-center h-10 px-8 py-2 mt-2 ml-auto transition-all duration-200 bg-transparent border rounded-full border-secondary-400 hover:bg-secondary-400 text-secondary-400 hover:text-white"
              >
                <span className="mr-4">View Pool</span>
                <AiOutlineArrowRight />
              </button>
            </div>
          </div>
        );
      case 'completed-pool':
        return (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="flex items-start">
              <div className="w-8 h-8 mr-4 overflow-hidden rounded-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img alt="Pool Logo" className="w-full h-full" src={logo} />
              </div>

              <div className="relative flex flex-col items-start w-36">
                <div className="absolute top-0 left-0 mb-4">
                  <PoolStatus loading={loading} status={status} />
                </div>
                <span className="mt-8 text-sm font-light text-white truncate">{pool.name}</span>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex flex-col flex-1 mr-4">
                <span className="mb-2 text-sm text-white opacity-30">Total Raise</span>
                <BalanceBadge
                  variant="basic"
                  mint={pool.token_to}
                  price={pool.token_total_raise}
                  className="text-sm text-white uppercase"
                />
              </div>
              <div className="flex flex-col flex-1">
                <span className="mb-2 text-sm text-white opacity-30">Participants</span>
                <span className="text-sm text-white">{pool.participants}</span>
              </div>
            </div>

            <div>
              <div className="flex flex-col flex-1">
                <span className="mb-2 text-sm text-white opacity-30">Progress</span>
                <PoolProgressBar
                  loading={loading}
                  current={pool.token_current_raise}
                  total={pool.token_total_raise}
                  variant="complex"
                />
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-white">({pool.progress}%)</span>
                  <span className="text-xs text-white opacity-30">{progressExtraContent}</span>
                </div>
              </div>
            </div>
          </div>
        );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    variant,
    thumbnail,
    pool.token_name,
    pool.token_symbol,
    pool.token_to,
    pool.token_total_raise,
    pool.token_ratio,
    pool.name,
    pool.participants,
    pool.progress,
    pool.token_current_raise,
    progressExtraContent,
    loading,
    logo,
    status,
  ]);

  return (
    <div
      onClick={goToPool}
      className="w-full p-4 overflow-hidden bg-gray-800 rounded-lg cursor-pointer"
    >
      {poolCardMarkup}
    </div>
  );
};

export default PoolCard;
