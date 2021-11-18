import { useWallet } from '@solana/wallet-adapter-react';
import moment from 'moment';
import { useRouter } from 'next/router';
import { useMemo } from 'react';
import Countdown from 'react-countdown';
import { useCountDown } from '../../../hooks/useCountDown';
import { useGlobal } from '../../../hooks/useGlobal';
import { usePool } from '../../../hooks/usePool';
import { IPool } from '../../../sdk/pool/interface';
import { IPoolTimes } from '../../../shared/interface';
import PoolCardTitle from '../../shared/pool/PoolCardTitle';
import PoolCountDownItem from '../../shared/pool/PoolCountDownItem';
import PoolTimelines from './PoolTimelines';

interface Props {
  pool: IPool;
  loading: boolean;
  allowContribute: boolean;
  alreadyContribute: boolean;
  poolTimes: IPoolTimes;
  refreshData: () => Promise<void>;
}

const PoolRounds: React.FC<Props> = ({
  pool,
  allowContribute,
  alreadyContribute,
  loading,
  poolTimes,
  refreshData,
}) => {
  const router = useRouter();
  const { renderCountDownValue } = useCountDown();
  const { getPoolTimelines } = usePool();
  const { now } = useGlobal();
  const { connected } = useWallet();
  const timelines = getPoolTimelines(poolTimes);

  const activeKey = useMemo(() => {
    if (!pool.is_active) {
      return 'upcoming';
    }

    for (const tl of timelines) {
      if (
        (!tl.startAt && tl.endAt && moment.unix(now).isBefore(tl.endAt)) ||
        (tl.startAt && !tl.endAt && moment.unix(now).isAfter(tl.startAt)) ||
        moment.unix(now).isBetween(tl.startAt, tl.endAt)
      ) {
        return tl.key;
      }
    }

    if (moment.unix(now).isAfter(pool.join_pool_end)) {
      return 'claimable';
    }

    return null;
  }, [pool.is_active, pool.join_pool_end, now, timelines]);
  const countdownTitle = useMemo(() => {
    switch (activeKey) {
      case null:
      case 'upcoming':
        return 'Opens In:';
      case 'fcfs':
        if (moment.unix(now).isBefore(pool.join_pool_end)) {
          return 'Closes In:';
        }

        return 'Opens In:';
      case 'claimable':
        return null;
      default:
        return 'Closes In:';
    }
  }, [activeKey, now, pool.join_pool_end]);
  const activeTimeline = useMemo(() => {
    if (!pool.is_active) {
      return timelines[0];
    }

    const tl = timelines.find((timeline) => timeline.key === activeKey);
    if (tl) {
      return tl;
    }

    return null;
  }, [activeKey, pool.is_active, timelines]);

  const countdownMarkup = useMemo(() => {
    if (!pool.is_active) {
      return <span className="text-sm font-semibold text-white uppercase">TBA</span>;
    }
    if (activeKey === 'claimable') {
      if (moment.unix(now).isAfter(pool.claim_at)) {
        return <h5 className="mt-8 text-lg font-semibold text-white">Pool is claimable!</h5>;
      } else if (moment.unix(now).isBetween(pool.join_pool_end, pool.claim_at)) {
        return (
          <h5 className="mt-8 text-sm font-semibold text-white">
            {!connected
              ? 'Please connect wallet to continue'
              : alreadyContribute
              ? `Please wait until ${moment(pool.claim_at)
                  .utc()
                  .format('MMM DD, LT')} (UTC) to claim all tokens`
              : 'Your address did not participate in this pool.'}
          </h5>
        );
      }
    }
    const countDownDate = activeTimeline?.endAt;

    return (
      <>
        {loading ? (
          <span className="w-32 h-3 mb-8 bg-gray-500 rounded-full animate-pulse"></span>
        ) : (
          <h5 className="mb-4 font-semibold text-white">{countdownTitle}</h5>
        )}

        {loading ? (
          <div className="h-12 bg-gray-500 rounded-lg w-72 animate-pulse"></div>
        ) : (
          <Countdown
            onComplete={() => {
              refreshData();
            }}
            date={countDownDate}
            renderer={({ days, hours, minutes, seconds, completed }) => {
              const daysValue = renderCountDownValue({
                targetDate: countDownDate,
                isCompleted: completed,
                timeUnit: days,
              });
              const hoursValue = renderCountDownValue({
                targetDate: countDownDate,
                isCompleted: completed,
                timeUnit: hours,
              });
              const minutesValue = renderCountDownValue({
                targetDate: countDownDate,
                isCompleted: completed,
                timeUnit: minutes,
              });
              const secondsValue = renderCountDownValue({
                targetDate: countDownDate,
                isCompleted: completed,
                timeUnit: seconds,
              });

              return (
                <div className="flex items-center justify-between w-full max-w-xs">
                  <PoolCountDownItem label="days" value={daysValue} active={allowContribute} />
                  <PoolCountDownItem label="hours" value={hoursValue} active={allowContribute} />
                  <PoolCountDownItem
                    label="minutes"
                    value={minutesValue}
                    active={allowContribute}
                  />
                  <PoolCountDownItem
                    label="seconds"
                    value={secondsValue}
                    active={allowContribute}
                  />
                </div>
              );
            }}
          />
        )}
      </>
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    activeKey,
    activeTimeline?.endAt,
    allowContribute,
    countdownTitle,
    loading,
    now,
    pool.claim_at,
    pool.is_active,
  ]);

  return (
    <div className="w-full h-full p-4" style={{ minHeight: 200 }}>
      <div className="mb-4">
        <PoolCardTitle title="Pool round timeline" />
      </div>

      <PoolTimelines timelines={timelines} activeKey={activeKey} />

      {Boolean(activeKey) && Boolean(activeTimeline) && (
        <div className="flex flex-col items-center justify-center mt-10">{countdownMarkup}</div>
      )}
    </div>
  );
};

export default PoolRounds;
