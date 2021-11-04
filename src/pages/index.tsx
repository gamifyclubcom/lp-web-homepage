import type { NextPage } from 'next';
import { useEffect, useMemo, useState } from 'react';
import Layout from '../components/shared/Layout';
import Paginations from '../components/shared/Paginations';
import { PageTitle } from '../shared/enum';

const Home: NextPage = () => {
  const totalPages = useMemo(() => 9, []);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasNext, setHasNext] = useState(true);
  const [hasPrevious, setHasPrevious] = useState(false);

  useEffect(() => {
    setHasPrevious(() => {
      return currentPage >= 1;
    });
    setHasNext(() => {
      return currentPage < totalPages - 1;
    });
  }, [currentPage, totalPages]);

  const handleGoNext = () => {
    setCurrentPage((prev) => prev + 1);
  };

  const handleGoPrevious = () => {
    setCurrentPage((prev) => prev - 1);
  };

  const handleGoPage = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <Layout title={PageTitle.HomePage}>
      home page
      <div className="flex items-center justify-center w-full h-32 bg-gray-800">
        <Paginations
          loading={false}
          totalPages={totalPages}
          currentPage={currentPage}
          hasNext={hasNext}
          hasPrevious={hasPrevious}
          handleGoNext={handleGoNext}
          handleGoPrevious={handleGoPrevious}
          handleGoToPage={handleGoPage}
        />
      </div>
    </Layout>
  );
};

export default Home;
