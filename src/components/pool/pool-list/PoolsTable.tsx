import { useEffect, useState } from 'react';
import { IPool } from '../../../sdk/pool/interface';
import Paginations from '../../shared/Paginations';
import Spinner from '../../shared/Spinner';
import PoolsRow from './PoolsRow';

interface Props {
  paginatedPools: PaginateResponse<IPool>;
  loading: boolean;
  handleMove: (page: number) => void;
  handleNext: () => void;
  handlePrevious: () => void;
}

const PoolsTable: React.FC<Props> = ({
  paginatedPools,
  loading,
  handleMove,
  handleNext,
  handlePrevious,
}) => {
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const { docs: pools, totalPages, page } = paginatedPools;

  useEffect(() => {
    if (paginatedPools) {
      setHasNext(() => {
        return paginatedPools.page < paginatedPools.totalPages - 1;
      });
      setHasPrevious(() => {
        return paginatedPools.page >= 1;
      });
    }
  }, [paginatedPools]);

  return (
    <div>
      <div className="relative w-full overflow-hidden border border-gray-500 rounded-lg">
        {loading && (
          <div className="absolute inset-0 z-40 flex items-center justify-center bg-black bg-opacity-30">
            <Spinner variant="alt" size="medium" />
          </div>
        )}

        <table className="w-full text-white table-fixed">
          <thead className={`border-b border-gray-500 text-gray-400 bg-gray-900`}>
            <tr className="text-base md:text-xl font-medium text-left">
              <th className="w-32 p-2 md:p-4 md:w-48 lg:w-64">Pool name</th>
              <th className="hidden md:w-48 lg:w-64 p-2 md:p-4 md:table-cell">Ratio</th>
              <th className="hidden p-2 md:p-4 w-36 md:table-cell">Total Raise</th>
              <th className="w-full p-2 md:p-4">Progress</th>
              <th className="p-2 md:p-4 w-32 text-center lg:text-left md:w-36">Status</th>
            </tr>
          </thead>
          <tbody>
            {pools.length > 0 &&
              pools.map((p, index) => {
                const key = `${index}`;

                return (
                  <PoolsRow
                    key={key}
                    pool={p}
                    loading={loading}
                    isLastItem={index === pools.length - 1}
                  />
                );
              })}
            {pools.length <= 0 && <tr className="h-16"></tr>}
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

export default PoolsTable;
