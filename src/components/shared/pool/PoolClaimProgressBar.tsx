import clsx from 'clsx';

interface Props {
  loading: boolean;
  progress: number;
}

const PoolClaimProgressBar: React.FC<Props> = ({ loading, progress }) => {
  if (loading) {
    return (
      <div className="w-full h-1 overflow-hidden bg-gray-300 rounded-full animate-pulse"></div>
    );
  }

  return (
    <div className="relative w-full h-1 bg-gray-500 rounded-full">
      <div
        className={clsx(
          'transition-all duration-500 ease-out rounded-full absolute left-0 flex items-center h-1',
          {
            'bg-secondary-400': progress > 0,
          },
        )}
        style={progress > 0 ? { width: `${progress}%` } : undefined}
      >
        <div
          className={clsx('w-3 h-3 ml-auto overflow-hidden bg-gray-500 rounded-full', {
            'bg-secondary-400': progress > 0,
            'transform -translate-x-1/2': progress === 0,
            'transform translate-x-1/2': progress === 100,
            'bg-gray-500': !progress || progress <= 0,
          })}
        />
      </div>
    </div>
  );
};

export default PoolClaimProgressBar;
