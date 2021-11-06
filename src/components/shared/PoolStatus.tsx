import { useMemo } from 'react';
import clsx from 'clsx';
import { IPoolStatus } from '../../sdk/pool/interface';
import { PoolStatusType } from '../../shared/enum';

interface Props {
  status: IPoolStatus;
  autoRight?: boolean;
  loading?: boolean;
}

const PoolStatus: React.FC<Props> = ({ status, loading = false }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center px-3 py-2 mt-5 bg-gray-500 rounded-full mt-auto">
        <span className="text-sm font-medium text-white">Loading</span>
      </div>
    );
  }

  const isOpen = status.type === PoolStatusType.OPEN;
  const isClosed = status.type === PoolStatusType.CLOSED;
  const filled = status.type === PoolStatusType.FILLED;
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
  }, [status]);

  return (
    <div
      className={clsx(`flex items-center justify-center px-3 py-2 mt-5 rounded-full mt-auto`, {
        'bg-primary-500': isOpen,
        'bg-38383D': isClosed,
        'bg-success-900': filled,
        'bg-gray-500': isUpcoming,
      })}
    >
      <span className="text-white text-1.125lg">{content}</span>
    </div>
  );
};

export default PoolStatus;
