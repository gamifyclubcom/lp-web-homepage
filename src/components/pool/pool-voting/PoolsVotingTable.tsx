import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { IPoolVoting } from '../../../sdk/pool/interface';
import Paginations from '../../shared/Paginations';
import Spinner from '../../shared/Spinner';
import PoolsVotingRow from './PoolsVotingRow';

interface Props {
  paginatedPoolVoting: PaginateResponse<IPoolVoting>;
  loading: boolean;
  handleMove: (page: number) => void;
  handleNext: () => void;
  handlePrevious: () => void;
  setPaginatedPoolVoting: Dispatch<SetStateAction<PaginateResponse<IPoolVoting>>>;
}

const PoolsVotingTable: React.FC<Props> = ({
  paginatedPoolVoting,
  loading,
  handleMove,
  handleNext,
  handlePrevious,
  setPaginatedPoolVoting,
}) => {
  const [voteLoading, setVoteLoading] = useState(false);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const { docs: pools, totalPages, page } = paginatedPoolVoting;

  useEffect(() => {
    if (paginatedPoolVoting) {
      setHasNext(() => {
        return paginatedPoolVoting.page < paginatedPoolVoting.totalPages - 1;
      });
      setHasPrevious(() => {
        return paginatedPoolVoting.page >= 1;
      });
    }
  }, [paginatedPoolVoting]);

  return (
    <div>
      <div className="relative w-full mt-8 overflow-hidden border rounded-xl border-fuchsia-500">
        {(loading || voteLoading) && (
          <div className="absolute inset-0 z-40 flex items-center justify-center bg-black bg-opacity-30">
            <Spinner variant="alt" size="medium" />
          </div>
        )}

        <table className="w-full text-white table-fixed">
          <thead className={`border-b border-fuchsia-500 text-fuchsia-400`}>
            <tr className="text-xl font-medium text-left">
              <th className="p-4">Project Name</th>
              <th className="hidden w-32 p-4 lg:w-44 md:table-cell">Vote For</th>
              <th className="hidden w-32 p-4 lg:w-44 md:table-cell ">Vote Against</th>
              <th className="w-56 p-4 lg:w-72">
                <div className="flex flex-col items-center justify-center">
                  <span>Voting Ended In</span>
                  <span className="hidden text-sm font-semibold lg:block">
                    (Days | Hours | Minutes | Seconds)
                  </span>
                </div>
              </th>
              <th className="p-4 w-36">Status</th>
            </tr>
          </thead>
          <tbody>
            {pools.length > 0 &&
              pools.map((p, index) => {
                const key = `${index}`;

                return (
                  <PoolsVotingRow
                    key={key}
                    poolVoting={p}
                    loading={loading}
                    setVoteLoading={setVoteLoading}
                    setPaginatedPoolVoting={setPaginatedPoolVoting}
                  />
                );
              })}
            <tr className="h-16"></tr>
          </tbody>
        </table>
      </div>

      <Paginations
        totalPages={totalPages}
        currentPage={page}
        hasNext={hasNext}
        hasPrevious={hasPrevious}
        handleGoNext={handleNext}
        handleGoPrevious={handlePrevious}
        handleGoToPage={handleMove}
        loading={loading}
      />
    </div>
  );
};

export default PoolsVotingTable;
