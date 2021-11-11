import NumberFormat from 'react-number-format';
import clsx from 'clsx';
import { IAllocationLevel } from '../../../shared/interface';

interface Props {
  allocationLevel: IAllocationLevel;
  totalLevels: number;
}

const GuaranteedAllocationCard: React.FC<Props> = ({
  allocationLevel: {
    level,
    rank,
    minAllocation,
    allocationRatio,
    color,
  },
  totalLevels,
}) => {
  return (
    <>
      <li
        className={clsx(
          'flex items-center justify-center w-12 h-12 text-md font-semibold text-white rounded-full relative',
        )}
        style={{ backgroundColor: color}}
      >
        <span className="flex items-center justify-center w-full h-full">{level}</span>
        <span
          className={clsx(
            'absolute text-center text-white transform -translate-x-1/2 translate-y-1/2 top-full left-1/2 text-xm',
          )}
        >
          {rank}
        </span>
        <span
          className={clsx(
            'absolute text-center text-white transform -translate-x-1/2 translate-y-12 top-full left-1/2 text-xl',
          )}
          style={{width: '200px'}}
        >
          <NumberFormat
          value={minAllocation}
          displayType={'text'}
          thousandSeparator={true}
          suffix=' GMFC'
          className='mt-2 font-semibold'
        />
        </span>
        <div
          className={clsx(
            'absolute w-20 text-center text-white transform -translate-x-1/2 translate-y-20 top-full left-1/2 text-xl',
          )}
          style={{width: '200px',}}
        >
          {`W : ${allocationRatio}`}<br></br>
          {level === 5 && (
        <span
          className={clsx(
            'font-semibold text-center text-white text-xs',
          )}
          style={{ color: '#10B981',}}
        >
          Plus private allocation
        </span>
        )}
        </div>
      </li>
      {level !== totalLevels && <li className="flex-1 h-3 bg-gray-600"></li>}
    </>
  );
};

export default GuaranteedAllocationCard;
