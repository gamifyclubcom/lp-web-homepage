import moment from 'moment';
import { PoolVotingStatusType } from '../../../shared/enum';
import PoolProgressBar from '../../shared/pool/PoolProgressBar';
import PoolVotingStatus from '../../shared/pool/PoolVotingStatus';

interface Props {
  status: PoolVotingStatusType;
  loading: boolean;
  joinPoolStart: string | Date;
  totalVote: number;
  currentVote: number;
  absoluteVote: number;
  remainVoteForActive: number;
  votingProgress: number;
}

const PoolVotingInfo: React.FC<Props> = ({
  status,
  loading,
  joinPoolStart,
  votingProgress,
  currentVote,
  absoluteVote,
  remainVoteForActive,
  totalVote,
}) => {
  const progressExtraMarkup = `${currentVote} / ${totalVote} vote`;

  return (
    <div className="flex flex-col p-4">
      <div className="flex items-start justify-between mb-8">
        <h1 className="text-lg font-semibold text-white uppercase">Voting Info</h1>
        <PoolVotingStatus status={status} loading={loading} />
      </div>

      <div className="flex items-start justify-between">
        <div className="flex flex-col">
          <h6 className="mb-4 text-sm font-light text-white">Estimated time for opening</h6>
          <span className="text-2xl font-semibold text-secondary-400">
            {moment(joinPoolStart).utc().format('MMM DD YYYY')} (UTC)
          </span>
        </div>
      </div>

      <div className="flex flex-col mt-8 mb-4">
        <span className="mb-4 text-sm text-white">Voting Progress</span>
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-white">{votingProgress}%</span>
            <span className="text-xs text-white">{progressExtraMarkup}</span>
          </div>
          <PoolProgressBar
            current={currentVote}
            total={totalVote}
            loading={loading}
            variant="simple"
          />
        </div>
      </div>

      <div className="flex flex-col mt-8">
        <span className="text-sm font-light text-white">Absolute vote: {absoluteVote}</span>
        <span className="text-sm font-light text-white">
          {remainVoteForActive} votes more to activate this pool!
        </span>
      </div>
    </div>
  );
};

export default PoolVotingInfo;
