import { IAllocationLevel } from '../../../shared/interface';
import GuaranteedAllocationCard from './GuaranteedAllocationCard';

interface Props {
  levels: IAllocationLevel[];
}

const Guarantees: React.FC<Props> = ({ levels }) => {
  return (
    <ul className="flex items-center justify-between w-full px-4">
      {levels.map(lv => {
        return <GuaranteedAllocationCard 
        key={lv.level} 
        allocationLevel={lv} 
        totalLevels={levels.length}
        />;
      })}
    </ul>
  );
};

export default Guarantees;
