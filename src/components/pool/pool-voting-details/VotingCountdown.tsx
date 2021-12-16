import clsx from 'clsx';
import moment from 'moment';
import { useRouter } from 'next/router';
import Countdown from 'react-countdown';
import { useCountDown } from '../../../hooks/useCountDown';
import { useGlobal } from '../../../hooks/useGlobal';
import PoolCountDownItem from '../../shared/pool/PoolCountDownItem';

interface Props {
  date: string;
  active: boolean;
}

const VotingCountdown: React.FC<Props> = ({ date, active }) => {
  const router = useRouter();
  const { now } = useGlobal();
  const { renderCountDownValue } = useCountDown();

  return (
    <div className="flex flex-col items-center px-8 py-4">
      <h3 className={clsx('mb-6 text-sm font-semibold text-white')}>Voting ended in</h3>
      <Countdown
        onComplete={() => {
          if (typeof window === 'undefined') {
            router.reload();
          } else {
            window.location.reload();
          }
        }}
        date={date}
        now={() => new Date(moment.unix(now).toISOString()).getTime()}
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
              <PoolCountDownItem label="days" value={daysValue} active={active} variant="light" />
              <PoolCountDownItem label="hours" value={hoursValue} active={active} variant="light" />
              <PoolCountDownItem
                label="minutes"
                value={minutesValue}
                active={active}
                variant="light"
              />
              <PoolCountDownItem
                label="seconds"
                value={secondsValue}
                active={active}
                variant="light"
              />
            </div>
          );
        }}
      />
    </div>
  );
};

export default VotingCountdown;
