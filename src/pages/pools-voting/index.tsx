import { useWallet } from '@solana/wallet-adapter-react';
import Decimal from 'decimal.js';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import PoolsVotingTable from '../../components/pool/pool-voting/PoolsVotingTable';
import SearchPoolVoting from '../../components/shared/pool/SearchPool';
import Layout from '../../components/shared/Layout';
import PoolNavbarMenus from '../../components/shared/pool/PoolNavbarMenus';
import { useDebounce } from '../../hooks/useDebounce';
import { useGlobal } from '../../hooks/useGlobal';
import { usePool } from '../../hooks/usePool';
import useSmartContract from '../../hooks/useSmartContract';
import { mappingPoolVotingServerResponse, poolAPI } from '../../sdk/pool';
import { ServerResponsePoolVoting } from '../../sdk/pool/interface';
import { PageTitle, PoolsVotingFilter } from '../../shared/enum';
import { roundNumberByDecimal } from '../../utils/helper';

interface Props {
  paginated: PaginateResponse<ServerResponsePoolVoting>;
}

const PoolsVoting: React.FC<Props> = ({ paginated }) => {
  const router = useRouter();
  const { connected } = useWallet();
  const { now, totalStaked, loading: fetchTotalStakedLoading } = useGlobal();
  const { getPoolVotingFullInfo } = usePool();
  const { getCommonSettings } = useSmartContract();
  const [loading, setLoading] = useState(false);
  const [paginatedPoolVoting, setPaginatedPoolVoting] = useState(() => {
    return {
      ...paginated,
      docs: paginated.docs.map((doc) => mappingPoolVotingServerResponse(doc, now)),
    };
  });
  const [votingPower, setVotingPower] = useState(0);
  const [fetchVotingPowerLoading, setFetchVotingPowerLoading] = useState(false);
  const [inputSearch, setInputSearch] = useState('');
  const searchTerm = useDebounce(inputSearch, 700);

  const activeSection = useMemo(() => {
    const section = router.query.section;
    switch (section) {
      case PoolsVotingFilter.IN_VOTING:
        return PoolsVotingFilter.IN_VOTING;
      case PoolsVotingFilter.DEACTIVATED:
        return PoolsVotingFilter.DEACTIVATED;
      case PoolsVotingFilter.UPCOMING:
        return PoolsVotingFilter.UPCOMING;
      default:
        return PoolsVotingFilter.ALL;
    }
  }, [router.query.section]);

  useEffect(() => {
    fetchPaginatedPoolsVoting({ section: activeSection, searchTerm });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSection, searchTerm]);

  useEffect(() => {
    const init = async () => {
      if (connected) {
        setFetchVotingPowerLoading(true);

        try {
          const commonSettings = await getCommonSettings(4);
          setFetchVotingPowerLoading(false);
          setVotingPower(() => {
            const result = roundNumberByDecimal(
              new Decimal(totalStaked).dividedBy(
                commonSettings.vote_setting.token_voting_power_rate,
              ),
              0,
            ).toNumber();
            return result;
          });
        } catch (err) {
          setFetchVotingPowerLoading(false);
          setVotingPower(0);
        }
      } else {
        setVotingPower(0);
      }
    };

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connected, totalStaked]);

  const fetchPaginatedPoolsVoting = async (params: {
    section?: PoolsVotingFilter;
    searchTerm?: string;
    page?: number;
  }) => {
    setLoading(true);
    try {
      const paginatedPoolVotingServerResponse = await poolAPI.getPoolsVoting({
        section: params.section === PoolsVotingFilter.ALL ? undefined : params.section,
        searchTerm: params.searchTerm,
        page: params.page,
      });
      const poolsVotingOnChains = await Promise.all(
        paginatedPoolVotingServerResponse.docs.map(async (doc) => {
          return getPoolVotingFullInfo(mappingPoolVotingServerResponse(doc, now));
        }),
      );
      setPaginatedPoolVoting(() => {
        return {
          ...paginatedPoolVotingServerResponse,
          docs: poolsVotingOnChains,
        };
      });

      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  };

  const handleMove = (page: number) => {
    fetchPaginatedPoolsVoting({ section: activeSection, searchTerm, page });
  };

  const handleNext = () => {
    fetchPaginatedPoolsVoting({
      section: activeSection,
      searchTerm,
      page: paginatedPoolVoting.page + 1,
    });
  };

  const handlePrevious = () => {
    fetchPaginatedPoolsVoting({
      section: activeSection,
      searchTerm,
      page: paginatedPoolVoting.page - 1,
    });
  };

  return (
    <Layout title={PageTitle.PoolsVotingPage}>
      <div className="relative py-8">
        <div className="absolute inset-0 z-10 bg-black bg-opacity-30" />

        <div className="mx-auto layout-container">
          <div className="flex flex-col w-full">
            <div className="z-20 flex flex-col items-center mt-8 mb-12">
              <h1 className="mb-4 text-4xl text-center text-white">Pool Voting</h1>
              <span className="text-lg text-center text-white">
                Vote for some potential games to have it available in the future!
              </span>
            </div>

            <div className="z-20 w-full mb-4">
              <PoolNavbarMenus variant="pools-voting" activeSection={activeSection} />
            </div>

            <div className="z-20 grid grid-cols-3 gap-4">
              <div className="col-span-3 md:col-span-1">
                <div className="z-20 flex items-start justify-between w-full mr-4">
                  <div className="flex flex-col text-sm text-white">
                    <span>Your GMFC staked</span>
                    {fetchTotalStakedLoading ? (
                      <span className="h-3 mt-2 bg-gray-600 rounded-md w-14 animate-pulse"></span>
                    ) : (
                      <span>{totalStaked} GMFC</span>
                    )}
                  </div>
                  <div className="flex flex-col text-sm text-white">
                    <span>Voting power</span>
                    {fetchVotingPowerLoading ? (
                      <span className="h-3 mt-2 bg-gray-600 rounded-md w-14 animate-pulse"></span>
                    ) : (
                      <span>{votingPower} vote/project</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="col-span-3 md:col-span-2">
                <div className="w-full" style={{ maxWidth: 800 }}>
                  <SearchPoolVoting inputSearch={inputSearch} setInputSearch={setInputSearch} />
                </div>
              </div>
            </div>

            <div className="z-20">
              {paginatedPoolVoting && (
                <PoolsVotingTable
                  paginatedPoolVoting={paginatedPoolVoting}
                  loading={loading}
                  handleMove={handleMove}
                  handleNext={handleNext}
                  handlePrevious={handlePrevious}
                  setPaginatedPoolVoting={setPaginatedPoolVoting}
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
  const paginatedPoolVoting = await poolAPI.getPoolsVoting({
    section: query.section as PoolsVotingFilter,
  });

  return {
    props: {
      paginated: paginatedPoolVoting,
    },
  };
};

export default PoolsVoting;
