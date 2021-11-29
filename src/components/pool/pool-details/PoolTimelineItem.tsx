import clsx from 'clsx';
import { ITimeline } from '../../../shared/interface';

interface Props {
  timeline: ITimeline;
  active: boolean;
  totalTimelines: number;
}

const PoolTimelineItem: React.FC<Props> = ({ timeline, totalTimelines, active }) => {
  return (
    <>
      <li
        className={clsx(
          'flex items-center justify-center w-8 h-8 text-sm font-semibold text-white rounded-full cursor-pointer relative',
          {
            'bg-pool_focus_1': active,
            'bg-gray-600': !active,
          },
        )}
      >
        <span className="flex items-center justify-center w-full h-full">{timeline.index}</span>
        <span
          className={clsx(
            'absolute text-center text-gray-500 transform -translate-x-1/2 translate-y-1/2 top-full left-1/2 text-xs',
            {
              'text-pool_focus_1': active,
            },
          )}
          style={{ minWidth: 80 }}
        >
          {timeline.name}
        </span>
      </li>
      {timeline.index !== totalTimelines && <li className="flex-1 h-1 bg-gray-600"></li>}
    </>
  );
};

export default PoolTimelineItem;
