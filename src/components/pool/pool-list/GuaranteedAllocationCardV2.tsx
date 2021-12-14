import NumberFormat from 'react-number-format';
import clsx from 'clsx';
import { IAllocationLevel } from '../../../shared/interface';
import Image from 'next/image';

interface Props {
  allocationLevel: IAllocationLevel;
  totalLevels: number;
  currentLevel?: number;
}

const GuaranteedAllocationCard: React.FC<Props> = ({
  allocationLevel: { level, rank, minAllocation, allocationRatio, color },
  totalLevels,
  currentLevel,
}) => {
  let imageLevel = '';
  let ovalLevel = '/images/staking/oval.svg';
  switch (level) {
    case 1:
      imageLevel =
        currentLevel && currentLevel >= 1
          ? '/images/staking/circle_active.svg'
          : '/images/staking/circle.svg';
      ovalLevel =
        currentLevel && currentLevel >= 1
          ? '/images/staking/checked_level.svg'
          : '/images/staking/oval.svg';
      break;
    case 2:
      imageLevel =
        currentLevel && currentLevel >= 2
          ? '/images/staking/square_active.svg'
          : '/images/staking/square.svg';
      ovalLevel =
        currentLevel && currentLevel >= 2
          ? '/images/staking/checked_level.svg'
          : '/images/staking/oval.svg';
      break;
    case 3:
      imageLevel =
        currentLevel && currentLevel >= 3
          ? '/images/staking/square_rotate_active.svg'
          : '/images/staking/square_rotate.svg';
      ovalLevel =
        currentLevel && currentLevel >= 3
          ? '/images/staking/checked_level.svg'
          : '/images/staking/oval.svg';
      break;
    case 4:
      imageLevel =
        currentLevel && currentLevel >= 4
          ? '/images/staking/hexagon_active.svg'
          : '/images/staking/hexagon.svg';
      ovalLevel =
        currentLevel && currentLevel >= 4
          ? '/images/staking/checked_level.svg'
          : '/images/staking/oval.svg';
      break;
    case 5:
      imageLevel =
        currentLevel && currentLevel >= 5
          ? '/images/staking/diamond_active.svg'
          : '/images/staking/diamond.svg';
      ovalLevel =
        currentLevel && currentLevel >= 5
          ? '/images/staking/checked_level.svg'
          : '/images/staking/oval.svg';
      break;
    /* default:
      imageLevel = '/images/staking/circle.svg'; */
  }

  return (
    <>
      <li
        className={clsx(
          'flex items-center justify-center w-46p h-46p text-md text-white rounded-full relative',
        )}
        // style={{ backgroundColor: color }}
      >
        {/* <span className="flex items-center justify-center w-full h-full">{level}</span> */}
        <div className="flex items-center justify-center w-full h-full">
          <Image width={46} height={46} src={imageLevel} alt="level" />
          <span
            className={clsx('absolute', {
              '-bottom-1 -right-0.5': level != 2,
              '-bottom-2 -right-1': level === 2,
            })}
          >
            <Image width={15} height={15} src={ovalLevel} alt="archived" />
          </span>
        </div>
        <span
          className={clsx(
            'absolute text-white font-semibold transform translate-y-1/2 top-full text-sm',
            {
              'left-0 text-left -translate-x-0': level === 1,
              'right-0 text-right -translate-x-0': level === 5,
              'left-1/2 text-center -translate-x-1/2': level !== 1 && level !== 5,
            },
          )}
        >
          {rank}
        </span>
        <span
          className={clsx(
            'absolute text-staking_gmfc transform translate-y-8 top-full text-sm md:200p',
            {
              'left-0 text-left -translate-x-0': level === 1,
              'right-0 text-right -translate-x-0': level === 5,
              'left-1/2 text-center -translate-x-1/2': level !== 1 && level !== 5,
            },
          )}
          // style={{ width: '200px' }}
        >
          <NumberFormat
            value={minAllocation}
            displayType={'text'}
            thousandSeparator={true}
            suffix=" GMFC"
            className="mt-2"
          />
        </span>
      </li>
      {level !== totalLevels && (
        <li
          className={clsx('flex-1 h-7p', {
            'bg-B8B8FF z-10': currentLevel && currentLevel > level,
            'bg-44454B': !currentLevel || currentLevel <= level,
          })}
        ></li>
      )}
    </>
  );
};

export default GuaranteedAllocationCard;
