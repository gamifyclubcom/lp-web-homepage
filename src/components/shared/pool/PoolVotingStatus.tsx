import { useMemo } from 'react';
import clsx from 'clsx';
import { PoolVotingStatusType } from '../../../shared/enum';

interface Props {
  status: PoolVotingStatusType;
  loading: boolean;
}

const PoolVotingStatus: React.FC<Props> = ({ status, loading = false }) => {
  const isUpcoming = useMemo(() => status === PoolVotingStatusType.UPCOMING, [status]);
  const isInVoting = useMemo(() => status === PoolVotingStatusType.IN_VOTING, [status]);
  const isValidated = useMemo(() => status === PoolVotingStatusType.VALIDATED, [status]);
  const isDeactivated = useMemo(() => status === PoolVotingStatusType.DEACTIVATED, [status]);

  const content = useMemo(() => {
    if (isUpcoming) {
      return 'Upcoming';
    }

    if (isInVoting) {
      return 'In Voting';
    }

    if (isValidated) {
      return 'Validated';
    }

    return 'Deactivated';
  }, [isInVoting, isUpcoming, isValidated]);

  if (loading) {
    return (
      <div className="flex items-center justify-center px-3 py-1 bg-gray-500 rounded-full">
        <div className="w-2 h-2 mr-2 bg-gray-300 rounded-full animate-ping"></div>
        <span className="text-sm font-medium text-white">Loading</span>
      </div>
    );
  }

  return (
    <div
      className={clsx(`flex items-center justify-center px-3 py-1 rounded-full`, {
        'bg-gray-600': isUpcoming,
        'bg-yellow-500': isInVoting,
        'bg-green-700': isValidated,
        'bg-gray-500': isDeactivated,
      })}
    >
      {!isUpcoming && (
        <div
          className={clsx('w-3 h-3 mr-2 rounded-full', {
            'bg-yellow-300': isInVoting,
            'bg-green-500': isValidated,
            'bg-gray-300': isDeactivated,
          })}
        ></div>
      )}
      <span className="text-sm font-medium text-white">{content}</span>
    </div>
  );
};

export default PoolVotingStatus;
