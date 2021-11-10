import React from 'react';
import { ITimeline } from '../../../shared/interface';
import PoolTimelineItem from './PoolTimelineItem';

interface Props {
  timelines: ITimeline[];
  activeKey: string | null;
}

const PoolTimelines: React.FC<Props> = ({ timelines, activeKey }) => {
  return (
    <ul className="flex items-center justify-between w-full px-4">
      {timelines.map((timeline, index) => (
        <PoolTimelineItem
          key={`${timeline.key}__${index}`}
          timeline={timeline}
          active={timeline.key === activeKey}
          totalTimelines={timelines.length}
        />
      ))}
    </ul>
  );
};

export default PoolTimelines;
