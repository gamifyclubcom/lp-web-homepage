import clsx from 'clsx';

interface Props {
  label: string;
  value: string;
  active: boolean;
  variant?: 'dark' | 'light';
}

const PoolCountDownItem: React.FC<Props> = ({ label, value, active, variant = 'dark' }) => {
  return (
    <div
      className={clsx('flex flex-col items-center text-white w-14', {
        'relative ': !active,
      })}
    >
      <span
        className={clsx('mb-2 text-sm uppercase opacity-75', {
          'opacity-30': !active,
        })}
      >
        {label}
      </span>
      <span
        suppressHydrationWarning
        className={clsx(
          'w-full p-2 text-lg font-semibold text-center rounded-md relative overflow-hidden',
          {
            'text-secondary-300': active,
            'opacity-50': !active,
            'bg-gray-900': variant === 'dark',
            'bg-gray-700': variant === 'light',
          },
        )}
      >
        {!active && <span className="absolute inset-0 bg-white opacity-50" />}
        {value}
      </span>
    </div>
  );
};

export default PoolCountDownItem;
