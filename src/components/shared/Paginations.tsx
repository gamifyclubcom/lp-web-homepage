import clsx from 'clsx';
import { useMemo } from 'react';
import { FaAngleLeft, FaAngleRight } from 'react-icons/fa';
import usePagination, { DOTS } from '../../hooks/usePagination';

interface Props {
  loading: boolean;
  totalPages: number;
  currentPage: number;
  hasNext: boolean;
  hasPrevious: boolean;
  handleGoNext: () => void;
  handleGoPrevious: () => void;
  handleGoToPage: (page: number) => void;
}

interface PaginationItemProps {
  active: boolean;
  onClick: () => void;
}

const PaginationItem: React.FC<PaginationItemProps> = ({ active, children, onClick }) => {
  if (children === DOTS) {
    return <li className="flex items-center justify-center w-9 h-9">{children}</li>;
  }

  return (
    <li
      className={clsx(
        'flex items-center justify-center w-9 h-9 mx-2 text-white rounded-full cursor-pointer leading-none',
        {
          'bg-secondary-400': active,
        },
      )}
      onClick={onClick}
    >
      <button className="flex items-center justify-center w-full h-full text-xs font-light">
        {children}
      </button>
    </li>
  );
};

const Paginations: React.FC<Props> = ({
  loading,
  totalPages,
  currentPage,
  hasNext,
  hasPrevious,
  handleGoNext,
  handleGoPrevious,
  handleGoToPage,
}) => {
  const { getPaginationRange } = usePagination();

  const listPage = useMemo(() => {
    const result = getPaginationRange({ totalPages, currentPage });
    if (!result) {
      return [];
    }

    return result;
  }, [currentPage, totalPages, getPaginationRange]);

  if (totalPages === 1) {
    return null;
  }

  if (loading) {
    return <div className="w-64 h-6 bg-gray-400 rounded-full animate-pulse" />;
  }

  return (
    <ul className="flex items-center justify-center mt-4 text-white bg-transparent">
      {hasPrevious && (
        <PaginationItem active={false} onClick={handleGoPrevious}>
          <FaAngleLeft />
        </PaginationItem>
      )}

      {listPage.map((p, index) => (
        <PaginationItem
          key={`page_${p}__${index}`}
          active={p === currentPage + 1}
          onClick={() => {
            if (p !== currentPage + 1 && typeof p === 'number') {
              handleGoToPage(p - 1);
            }
          }}
        >
          {p}
        </PaginationItem>
      ))}

      {hasNext && (
        <PaginationItem active={false} onClick={handleGoNext}>
          <FaAngleRight />
        </PaginationItem>
      )}
    </ul>
  );
};

export default Paginations;
