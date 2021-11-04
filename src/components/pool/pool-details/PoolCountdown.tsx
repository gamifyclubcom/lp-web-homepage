import clsx from 'clsx';
import moment from 'moment';
import { useRouter } from 'next/router';
import Countdown from 'react-countdown';
import { useCountDown } from '../../../hooks/useCountDown';
import { useGlobal } from '../../../hooks/useGlobal';
import { PoolCountdownType, PoolRoundType } from '../../../shared/enum';
import PoolCountDownItem from '../../shared/pool/PoolCountDownItem';

export interface IRound {
  key: PoolRoundType;
  enabled: boolean;
  active: boolean;
  countdownActive: boolean;
  title: string;
  description: string;
  date: Date | string;
  startRound: Date | string;
  variant: PoolCountdownType;
}

interface Props {
  round: IRound;
  poolActive: boolean;
  hasWhitelistRound: boolean;
}

const PoolCountdown: React.FC<Props> = ({ round, poolActive, hasWhitelistRound }) => {
  const router = useRouter();
  const { now } = useGlobal();
  const { renderCountDownValue } = useCountDown();
  const { key, active, countdownActive, title, description, date, startRound, variant } = round;

  const renderCountDownMarkup = () => {
    // if (key === 'FCFS' && variant === 'countdown-to-open' && hasWhitelistRound) {
    //   return null;
    // }

    // if (
    //   (key === 'FCFS' || key === 'exclusive' || key === 'fcfs-staker') &&
    //   countdownActive === false
    // ) {
    //   return null;
    // }

    const countDownTitle = variant === PoolCountdownType.ToClose ? 'Closes In:' : 'Opens In:';

    return (
      <div className="flex flex-col items-center px-8 py-4">
        <h3
          className={clsx('mb-4 text-sm font-semibold text-white', {
            'opacity-30': !active || !poolActive,
          })}
        >
          {countDownTitle}
        </h3>
        <Countdown
          onComplete={() => {
            if (typeof window === 'undefined') {
              router.reload();
            } else {
              window.location.reload();
            }
          }}
          date={date}
          renderer={({ days, hours, minutes, seconds, completed }) => {
            const daysValue = renderCountDownValue({
              targetDate: date,
              isCompleted: completed,
              timeUnit: days,
            });
            const hoursValue = renderCountDownValue({
              targetDate: date,
              isCompleted: completed,
              timeUnit: hours,
            });
            const minutesValue = renderCountDownValue({
              targetDate: date,
              isCompleted: completed,
              timeUnit: minutes,
            });
            const secondsValue = renderCountDownValue({
              targetDate: date,
              isCompleted: completed,
              timeUnit: seconds,
            });

            return (
              <div className="flex items-center justify-between w-full max-w-xs">
                <PoolCountDownItem label="days" value={daysValue} active={active} />
                <PoolCountDownItem label="hours" value={hoursValue} active={active} />
                <PoolCountDownItem label="minutes" value={minutesValue} active={active} />
                <PoolCountDownItem label="seconds" value={secondsValue} active={active} />
              </div>
            );
          }}
        />
      </div>
    );
  };

  return (
    <div
      key={key}
      className={clsx('flex flex-col rounded-md border overflow-hidden', {
        'border-primary-300': active && countdownActive,
        'border-gray-500': !active || !poolActive || !countdownActive,
      })}
    >
      <div
        className={clsx('flex items-start justify-between p-4 text-white', {
          'opacity-30': !active || !poolActive || !countdownActive,
        })}
      >
        <div className="flex flex-col items-start">
          <h3 className="text-lg font-semibold">{title}</h3>
          <span className="text-xs opacity-75">{description}</span>
        </div>

        <div>
          <span className="text-sm font-semibold opacity-75">
            {moment(startRound).utc().format('DD MMM LT')} (UTC)
          </span>
        </div>
      </div>
      {poolActive &&
        (key === 'whitelist' || key === 'exclusive') &&
        moment.unix(now).isBefore(date) && (
          <div className="w-11/12 m-auto border-b border-gray-500" />
        )}

      {poolActive && moment.unix(now).isBefore(date) && renderCountDownMarkup()}
    </div>
  );
};

export default PoolCountdown;
