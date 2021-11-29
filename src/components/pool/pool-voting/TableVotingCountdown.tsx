import { useRouter } from 'next/router';
import Countdown from 'react-countdown';
import { useCountDown } from '../../../hooks/useCountDown';
import { PoolVotingStatusType } from '../../../shared/enum';

interface Props {
  date?: string | number | Date;
  loading: boolean;
  status: PoolVotingStatusType;
}

const TableVotingCountdown: React.FC<Props> = ({ date, loading, status }) => {
  const router = useRouter();
  const { renderCountDownValue } = useCountDown();

  if (loading) {
    return <div className="flex w-32 h-3 bg-gray-500 rounded-md animate-pulse" />;
  }

  if (status === PoolVotingStatusType.UPCOMING) {
    return (
      <div>
        <span className="p-1 mx-1">00</span>
        <span className="p-1 mx-1">00</span>
        <span className="p-1 mx-1">00</span>
        <span className="p-1 mx-1">00</span>
      </div>
    );
  }

  return (
    <div>
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
            <div>
              <span className="p-1 mx-1">{daysValue}</span>
              <span className="p-1 mx-1">{hoursValue}</span>
              <span className="p-1 mx-1">{minutesValue}</span>
              <span className="p-1 mx-1">{secondsValue}</span>
            </div>
          );
        }}
      />
    </div>
  );
};

export default TableVotingCountdown;
