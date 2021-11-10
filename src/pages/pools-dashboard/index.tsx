import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import PoolsTable from '../../components/pool/pool-list/PoolsTable';
import Layout from '../../components/shared/Layout';
import PoolNavbarMenus from '../../components/shared/pool/PoolNavbarMenus';
import SearchPool from '../../components/shared/pool/SearchPool';
import { useDebounce } from '../../hooks/useDebounce';
import { useGlobal } from '../../hooks/useGlobal';
import { usePool } from '../../hooks/usePool';
import { mappingPoolServerResponse, poolAPI } from '../../sdk/pool';
import { ServerResponsePool } from '../../sdk/pool/interface';
import { PageTitle, PoolsSectionFilter } from '../../shared/enum';

interface Props {
  paginated: PaginateResponse<ServerResponsePool>;
}

const PoolsDashboard: React.FC<Props> = ({ paginated }) => {
  const router = useRouter();
  const { now } = useGlobal();
  const { getPoolFullInfo } = usePool();
  const [loading, setLoading] = useState(false);
  const [paginatedPools, setPaginatedPools] = useState(() => {
    return {
      ...paginated,
      docs: paginated.docs.map((doc) => mappingPoolServerResponse(doc, now)),
    };
  });
  const [inputSearch, setInputSearch] = useState('');
  const searchTerm = useDebounce(inputSearch, 700);

  const activeSection = useMemo(() => {
    const section = router.query.section;
    switch (section) {
      // case PoolsSectionFilter.CREATED:
      //   return PoolsSectionFilter.CREATED;
      // case PoolsSectionFilter.FEATURED:
      //   return PoolsSectionFilter.FEATURED;
      // case PoolsSectionFilter.JOINED:
      //   return PoolsSectionFilter.JOINED;
      // case PoolsSectionFilter.PAST:
      //   return PoolsSectionFilter.PAST;
      // case PoolsSectionFilter.UPCOMING:
      //   return PoolsSectionFilter.UPCOMING;
      default:
        return PoolsSectionFilter.ALL;
    }
  }, [router.query.section]);

  useEffect(() => {
    fetchPaginatedPools({ section: activeSection, searchTerm });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSection, searchTerm]);

  const fetchPaginatedPools = async (params: {
    section?: PoolsSectionFilter;
    searchTerm?: string;
    page?: number;
  }) => {
    setLoading(true);
    try {
      const paginatedPoolServerResponse = await poolAPI.getPools({
        section: params.section === PoolsSectionFilter.ALL ? undefined : params.section,
        searchTerm: params.searchTerm,
        page: params.page,
      });
      const poolsOnChains = await Promise.all(
        paginatedPoolServerResponse.docs.map(async (doc) => {
          return getPoolFullInfo(mappingPoolServerResponse(doc, now));
        }),
      );
      setPaginatedPools(() => {
        return {
          ...paginatedPoolServerResponse,
          docs: poolsOnChains,
        };
      });

      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  };

  const handleMove = (page: number) => {
    fetchPaginatedPools({ section: activeSection, searchTerm, page });
  };

  const handleNext = () => {
    fetchPaginatedPools({
      section: activeSection,
      searchTerm,
      page: paginatedPools.page + 1,
    });
  };

  const handlePrevious = () => {
    fetchPaginatedPools({
      section: activeSection,
      searchTerm,
      page: paginatedPools.page - 1,
    });
  };

  return (
    <Layout title={PageTitle.PoolsPage}>
      <div className="relative py-8">
        <div className="absolute inset-0 z-10 bg-black bg-opacity-30" />

        <div className="mx-auto layout-container">
          <div className="flex flex-col w-full">
            <div className="z-20 flex flex-col items-center mt-8 mb-12">
              <h1 className="mb-4 text-4xl text-center text-white">Pools Dashboard</h1>
              <span className="text-lg text-center text-white">
                Find some of the latest projects coming to Solana
              </span>
            </div>

            <div className="z-20 w-full">
              <PoolNavbarMenus variant="pools-dashboard" activeSection={activeSection} />
              <h1 className="text-3xl font-light text-white">List Pools</h1>
            </div>

            <div className="z-20 flex my-6">
              <div className="w-full mr-auto" style={{ maxWidth: 600 }}>
                <SearchPool
                  variant="pool-dashboard"
                  inputSearch={inputSearch}
                  setInputSearch={setInputSearch}
                />
              </div>
            </div>

            <div className="z-20">
              {paginatedPools && (
                <PoolsTable
                  paginatedPools={paginatedPools}
                  loading={loading}
                  handleMove={handleMove}
                  handleNext={handleNext}
                  handlePrevious={handlePrevious}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  if (
    query &&
    query.section &&
    (query.section === PoolsSectionFilter.JOINED || query.section === PoolsSectionFilter.ALL)
  ) {
    return { redirect: { destination: '/pools-dashboard', permanent: false } };
  }

  const paginatedPools = await poolAPI.getPools({
    section: query.section as PoolsSectionFilter,
  });

  return {
    props: {
      paginated: paginatedPools,
    },
  };
};

export default PoolsDashboard;
