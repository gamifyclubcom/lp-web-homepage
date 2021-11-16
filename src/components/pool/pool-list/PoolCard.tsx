import clsx from 'clsx';
import Decimal from 'decimal.js';
import moment from 'moment';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useEffect, useMemo } from 'react';
import NumberFormat from 'react-number-format';
import { useGlobal } from '../../../hooks/useGlobal';
import { usePool } from '../../../hooks/usePool';
import { IPool } from '../../../sdk/pool/interface';
import { TOKEN_TO_DECIMALS } from '../../../utils/constants';
import {
  getDiffWithCurrent,
  getPoolLogo,
  getPoolStatus,
  getPoolThumbnail,
  renderTokenBalance,
} from '../../../utils/helper';
import BalanceBadge from '../../shared/BalanceBadge';
import CompletedPoolBadge from '../../shared/pool/CompletedPoolBadge';
import PoolProgressBar from '../../shared/pool/PoolProgressBar';
import PoolStatus from '../../shared/pool/PoolStatus';

interface Props {
  variant: 'upcoming-pool' | 'feature-pool' | 'completed-pool';
  pool: IPool;
  loading: boolean;
  is_home?: boolean;
  auto_scroll?: boolean;
}

const PoolCard: React.FC<Props> = ({ pool, variant, loading, is_home, auto_scroll }) => {
  const router = useRouter();
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
  const totalRaise = useMemo(() => {
    return renderTokenBalance(
      new Decimal(pool.token_total_raise).dividedBy(pool.token_ratio),
      TOKEN_TO_DECIMALS,
    );
  }, [pool.token_ratio, pool.token_total_raise]);

  const goToPool = () => handleGoToPoolDetails(pool);
  const countdownToOpen = useMemo(() => {
    return getDiffWithCurrent(
      new Date(pool.join_pool_start),
      new Date(moment.unix(now).toISOString()),
    );
  }, [now, pool.join_pool_start]);

  const upcomingPoolBadge = useMemo(() => {
    if (moment.unix(now).isAfter(pool.join_pool_start) || !pool.is_active) {
      return <span className="text-lg font-semibold text-white uppercase">TBA</span>;
    }

    return (
      <div className="flex items-center">
        <span className="text-sm font-light text-white">Pool Open In</span>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img alt="button image" className="mx-2" src="/icons/icon_btn_pool.svg" />

        <span className="text-sm font-semibold text-white uppercase">{countdownToOpen}</span>
      </div>
    );
  }, [countdownToOpen, now, pool.is_active, pool.join_pool_start]);

  useEffect(() => {
    if (countdownToOpen === '1 seconds') {
      if (typeof window === 'undefined') {
        router.reload();
      } else {
        window.location.reload();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countdownToOpen]);

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
              <h6 className="w-full mb-4 text-lg font-semibold text-white truncate">
                {pool.name} ({pool.token_symbol})
              </h6>
              <div className="flex items-center justify-between my-2">
                <span className="text-sm text-white opacity-30">Total Raise</span>
                <BalanceBadge
                  variant="basic"
                  mint={pool.token_to}
                  price={totalRaise}
                  className="text-sm md:text-xs lg:text-sm text-white"
                />
              </div>
              <div className="flex items-center justify-between my-2">
                <span className="text-sm text-white opacity-30">Rate</span>
                <BalanceBadge
                  variant="with-ratio"
                  price={pool.token_ratio}
                  className="text-sm md:text-xs lg:text-sm text-white"
                  mintFrom={pool.token_to}
                  mintTo={pool.token_symbol}
                />
              </div>
              <div className="flex items-center justify-between my-2">
                <span className="text-sm text-white opacity-30">Supported</span>
                <span className="text-sm md:text-xs lg:text-sm text-white">{pool.token_to}</span>
              </div>
            </div>

            <div className="w-full mt-6">
              {is_home ? (
                <PoolStatus loading={loading} status={status} hide_shape={true} />
              ) : (
                <button className="flex items-center justify-center w-full h-12 text-sm text-center text-white transition-all duration-200 bg-gray-500 rounded-full hover:bg-gray-600">
                  {upcomingPoolBadge}
                </button>
              )}
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

            <div className="flex flex-col items-center w-full md:ml-4">
              <h6 className="w-full max-w-md mb-8 text-lg font-semibold text-white truncate">
                {pool.name} ({pool.token_symbol})
              </h6>

              <div className="flex items-center justify-between w-full my-1">
                <span className="text-sm text-white">Total Raise</span>
                <BalanceBadge
                  variant="basic"
                  mint={pool.token_to}
                  price={totalRaise}
                  className="text-sm text-secondary-400"
                />
              </div>
              <div className="flex items-center justify-between w-full my-1">
                <span className="text-sm text-white">Participants</span>
                <span className="text-sm font-semibold text-white">{pool.participants}</span>
              </div>
              <div className="flex items-center justify-between w-full my-1">
                <span className="text-sm text-white">Progress</span>
                <div className="flex items-center text-xs text-white">
                  <span className="mr-2 text-sm">{pool.progress}%</span>
                  <NumberFormat
                    thousandSeparator
                    displayType="text"
                    className="opacity-30"
                    value={pool.token_current_raise}
                  />
                  <span className="opacity-30">/</span>
                  <NumberFormat
                    thousandSeparator
                    displayType="text"
                    className="opacity-30"
                    value={pool.token_total_raise}
                  />
                  <span className="ml-1 opacity-30">{pool.token_symbol}</span>
                </div>
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
                <Image
                  width={16}
                  height={8}
                  src="/images/arrow.svg"
                  alt="arrow"
                  className="cursor-pointer"
                />
              </button>
            </div>
          </div>
        );
      case 'completed-pool':
        const isClaimable = moment.unix(now).isAfter(pool.claim_at);

        return (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="flex items-start">
              <div className="w-8 h-8 mr-4 overflow-hidden rounded-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img alt="Pool Logo" className="w-full h-full" src={logo} />
              </div>

              <div className="relative flex flex-col items-start w-36">
                <div className="absolute top-0 left-0 flex items-start mb-4">
                  <div className="mr-2">
                    <PoolStatus loading={loading} status={status} />
                  </div>
                  {isClaimable && <CompletedPoolBadge variant="claimable" />}
                </div>
                <span className="w-full mt-8 text-lg font-semibold text-white truncate">
                  {pool.name}
                </span>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex flex-col flex-1 mr-4">
                <span className="mb-2 text-sm text-white opacity-30">Total Raise</span>
                <BalanceBadge
                  variant="basic"
                  mint={pool.token_to}
                  price={totalRaise}
                  className="text-sm text-white"
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
                  <span className="text-xs md:text-xss lg:text-xs text-white">
                    ({pool.progress}%)
                  </span>
                  <div className="text-xs md:text-xss lg:text-xs text-white">
                    <NumberFormat
                      thousandSeparator
                      displayType="text"
                      value={pool.token_current_raise}
                    />
                    <span>/</span>
                    <NumberFormat
                      thousandSeparator
                      displayType="text"
                      value={pool.token_total_raise}
                      className="mr-1"
                    />
                    <span>{pool.token_symbol}</span>
                  </div>
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
    loading,
    logo,
    status,
  ]);

  return (
    <div
      onClick={goToPool}
      className={clsx('w-full p-4 overflow-hidden bg-gray-800 rounded-lg cursor-pointer', {
        'w-300p min-w-300px': is_home && auto_scroll,
      })}
    >
      {poolCardMarkup}
    </div>
  );
};

export default PoolCard;
