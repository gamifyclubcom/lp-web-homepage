import { createContext, useState } from 'react';
import { IPool, IPoolVoting } from '../sdk/pool/interface';

interface PoolState {
  paginatedPool: PaginateResponse<IPool> | null;
  paginatedPoolVoting: PaginateResponse<IPoolVoting> | null;
  loading: boolean;
  setLoading: (ld: boolean) => void;
  dispatchPaginatedPool: (paginated: PaginateResponse<IPool> | null) => void;
  dispatchPaginatedPoolVoting: (paginated: PaginateResponse<IPoolVoting> | null) => void;
}

const PoolContext = createContext<PoolState>({
  paginatedPool: null,
  paginatedPoolVoting: null,
  loading: false,
  setLoading: () => {},
  dispatchPaginatedPool: () => {},
  dispatchPaginatedPoolVoting: () => {},
});

export const PoolProvider: React.FC = ({ children }) => {
  const [paginatedPool, setPaginatedPool] = useState<PaginateResponse<IPool> | null>(null);
  const [paginatedPoolVoting, setPaginatedPoolVoting] =
    useState<PaginateResponse<IPoolVoting> | null>(null);
  const [loading, setLoading] = useState(false);

  const dispatchPaginatedPool = (paginated: PaginateResponse<IPool> | null) => {
    setPaginatedPool(paginated);
  };

  const dispatchPaginatedPoolVoting = (paginated: PaginateResponse<IPoolVoting> | null) => {
    setPaginatedPoolVoting(paginated);
  };

  return (
    <PoolContext.Provider
      value={{
        paginatedPool,
        paginatedPoolVoting,
        loading,
        setLoading,
        dispatchPaginatedPool,
        dispatchPaginatedPoolVoting,
      }}
    >
      {children}
    </PoolContext.Provider>
  );
};

export default PoolContext;
