import clsx from 'clsx';
import { useMemo } from 'react';

interface Props {
  variant: 'claimable' | 'ended';
}

const CompletedPoolBadge: React.FC<Props> = ({ variant }) => {
  const text = useMemo(() => {
    switch (variant) {
      case 'claimable':
        return 'claimable';
      case 'ended':
        return 'ended';
    }
  }, [variant]);
  return (
    <span
      className={clsx('uppercase text-white font-semibold text-sm', {
        'text-yellow-500': variant === 'claimable',
        'text-red-700': variant === 'ended',
      })}
    >
      {text}
    </span>
  );
};

export default CompletedPoolBadge;
