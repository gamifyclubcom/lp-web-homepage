import clsx from 'clsx';
import { useMemo } from 'react';
import { IPoolStatus } from '../../../sdk/pool/interface';
import { PoolStatusType } from '../../../shared/enum';

interface Props {
  status: IPoolStatus;
  loading: boolean;
}

const PoolStatus: React.FC<Props> = ({ status, loading }) => {
  const isOpen = useMemo(() => status.type === PoolStatusType.OPEN, [status]);
  const isClosed = useMemo(() => status.type === PoolStatusType.CLOSED, [status]);
  const filled = useMemo(() => status.type === PoolStatusType.FILLED, [status]);
  const isUpcoming = !isOpen && !isClosed && !filled;

  const content = useMemo(() => {
    if (isOpen) {
      return 'Open';
    }
    if (isClosed) {
      return 'Closed';
    }
    if (filled) {
      return 'Filled';
    }

    return 'Upcoming';
  }, [isOpen, isClosed, filled]);

  if (loading) {
    return (
      <div className="flex items-center justify-center px-3 py-1 bg-gray-500 rounded-full">
        <div
          style={{ marginBottom: 4 }}
          className="w-2 h-2 mr-2 bg-gray-300 rounded-full animate-ping"
        />
        <span className="text-sm font-medium text-white">Loading</span>
      </div>
    );
  }

  return (
    <div
      className={clsx(`flex items-center justify-center px-3 py-1 rounded-full`, {
        'bg-secondary-500': isOpen,
        'bg-gray-700': isClosed,
        'bg-green-700': filled,
        'bg-gray-500': isUpcoming,
      })}
    >
      {!isUpcoming && (
        <div
          style={{ marginBottom: 3 }}
          className={clsx('w-3 h-3 mr-2 rounded-full', {
            'bg-secondary-300': isOpen,
            'bg-red-500': isClosed,
            'bg-green-500': filled,
          })}
        />
      )}
      <span className="text-sm font-medium text-white">{content}</span>
    </div>
  );
};

export default PoolStatus;
