import { useMemo } from 'react';

interface Props {
  variant: 'upcoming-pool' | 'feature-pool' | 'completed-pool';
}

const PoolCardLoading: React.FC<Props> = ({ variant }) => {
  const childrenMarkup = useMemo(() => {
    switch (variant) {
      case 'upcoming-pool':
        return [1, 2, 3].map((item) => (
          <div
            key={`upcoming__${item}`}
            className="w-full overflow-hidden bg-gray-800 rounded-lg h-96 animate-pulse"
          />
        ));
      case 'feature-pool':
        return [1, 2].map((item) => (
          <div
            key={`feature__${item}`}
            className="w-full h-64 mx-auto overflow-hidden bg-gray-800 rounded-lg animate-pulse"
            style={{ maxWidth: 800 }}
          />
        ));
      case 'completed-pool':
        return [1, 2].map((item) => (
          <div
            key={`completed__${item}`}
            className="w-full h-32 overflow-hidden bg-gray-800 rounded-lg animate-pulse"
          />
        ));
    }
  }, [variant]);
  return <>{childrenMarkup}</>;
};

export default PoolCardLoading;
