import { useMemo } from 'react';
import Decimal from 'decimal.js';
import clsx from 'clsx';

interface Props {
  current: number;
  total: number;
  loading: boolean;
  variant: 'complex' | 'simple';
}

const PoolProgressBar: React.FC<Props> = ({ current, total, loading, variant }) => {
  const progress = useMemo(() => {
    const result = new Decimal(current).times(100).dividedBy(total).toFixed(2);

    return parseFloat(result);
  }, [current, total]);

  if (loading) {
    return (
      <div className="w-full h-2 overflow-hidden bg-gray-300 rounded-full animate-pulse"></div>
    );
  }

  return (
    <div className="relative w-full h-2 bg-gray-500 rounded-full">
      <div
        className={clsx(
          'transition-all duration-500 ease-out rounded-full absolute left-0 flex items-center h-2',
          {
            'bg-pool_focus_1': variant === 'simple',
            'bg-red-700': variant === 'complex',
          },
        )}
        style={{ width: `${progress}%` }}
      >
        {variant === 'complex' && progress > 0 && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src="/icons/icon_progress.svg" alt="Icon progress" className="w-6 h-6 ml-auto" />
        )}
      </div>
    </div>
  );
};

export default PoolProgressBar;
