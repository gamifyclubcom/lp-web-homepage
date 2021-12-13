import { IAllocationLevel } from '../../../shared/interface';
import GuaranteedAllocationCard from './GuaranteedAllocationCard';
import GuaranteedAllocationCardV2 from './GuaranteedAllocationCardV2';
import clsx from 'clsx';

interface Props {
  levels: IAllocationLevel[];
  isNew?: boolean;
  currentLevel?: number;
}

const Guarantees: React.FC<Props> = ({ levels, isNew, currentLevel }) => {
  return (
    <ul
      className={clsx('flex items-center justify-between w-full', {
        'list-stacker-level relative md:px-4': isNew,
        'px-4': !isNew,
      })}
    >
      {isNew
        ? levels.map((lv) => {
            return (
              <GuaranteedAllocationCardV2
                key={lv.level}
                allocationLevel={lv}
                totalLevels={levels.length}
                currentLevel={currentLevel}
              />
            );
          })
        : levels.map((lv) => {
            return (
              <GuaranteedAllocationCard
                key={lv.level}
                allocationLevel={lv}
                totalLevels={levels.length}
              />
            );
          })}
    </ul>
  );
};

export default Guarantees;
