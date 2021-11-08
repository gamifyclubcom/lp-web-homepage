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
      <div className="relative w-full mt-8 overflow-hidden border rounded-xl border-fuchsia-500">
        {loading && (
          <div className="absolute inset-0 z-40 flex items-center justify-center bg-black bg-opacity-30">
            <Spinner variant="alt" size="medium" />
          </div>
        )}

        <table className="w-full text-white table-fixed">
          <thead className={`border-b border-fuchsia-500 text-fuchsia-400`}>
            <tr className="text-xl font-medium text-left">
              <th className="w-32 p-4 md:w-64">Pool name</th>
              <th className="hidden w-64 p-4 md:table-cell">Ratio</th>
              <th className="w-full p-4">Progress</th>
              <th className="p-4 w-36">Status</th>
            </tr>
          </thead>
          <tbody>
            {pools.length > 0 &&
              pools.map((p, index) => {
                const key = `${index}`;

                return <PoolsRow key={key} pool={p} loading={loading} />;
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

export default PoolsTable;
