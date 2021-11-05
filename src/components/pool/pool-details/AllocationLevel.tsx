import clsx from 'clsx';
import { allocationLevels } from '../../../configs';

interface Props {
  currLevel?: number;
}

const AllocationLevel: React.FC<Props> = ({ currLevel }) => {
  return (
    <div className="flex items-center">
      {allocationLevels.map((al) => {
        return (
          <div
            key={al.level}
            className={clsx('w-3 h-3 mx-1 overflow-hidden rounded-full bg-gray-900', {
              'bg-secondary-400': currLevel && al.level <= currLevel,
            })}
          />
        );
      })}
    </div>
  );
};

export default AllocationLevel;
