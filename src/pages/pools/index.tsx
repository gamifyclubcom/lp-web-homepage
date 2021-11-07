import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { AiOutlineArrowRight } from 'react-icons/ai';
import PoolCard from '../../components/pool/pool-list/PoolCard';
import PoolCardLoading from '../../components/pool/pool-list/PoolCardLoading';
import Layout from '../../components/shared/Layout';
import LoadingScreen from '../../components/shared/LoadingScreen';
import { useGlobal } from '../../hooks/useGlobal';
import { usePool } from '../../hooks/usePool';
import { mappingPoolServerResponse, poolAPI } from '../../sdk/pool';
import { IPool } from '../../sdk/pool/interface';
import { PageTitle, PoolsSectionFilter } from '../../shared/enum';

interface Props {}

const Pools: React.FC<Props> = () => {
  const router = useRouter();
  const { now } = useGlobal();
  const { getPoolFullInfo } = usePool();
  const [featureLoading, setFeatureLoading] = useState(false);
  const [upcomingLoading, setUpcomingLoading] = useState(false);
  const [completedLoading, setCompletedLoading] = useState(false);
  const [featurePools, setFeaturePools] = useState<IPool[]>([]);
  const [upcomingPools, setUpcomingPools] = useState<IPool[]>([]);
  const [completedPools, setCompletedPools] = useState<IPool[]>([]);

  useEffect(() => {
    const initUpcoming = async () => {
      setUpcomingLoading(true);
      const result = await fetchPoolsBySection(PoolsSectionFilter.UPCOMING);
      setUpcomingLoading(false);
      setUpcomingPools(result);
    };

    initUpcoming();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    const initFeature = async () => {
      setFeatureLoading(true);
      const result = await fetchPoolsBySection(PoolsSectionFilter.FEATURED);
      setFeatureLoading(false);
      setFeaturePools(result);
    };

    initFeature();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    const initCompleted = async () => {
      setCompletedLoading(true);
      const result = await fetchPoolsBySection(PoolsSectionFilter.PAST);
      setCompletedLoading(false);
      setCompletedPools(result);
    };

    initCompleted();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchPoolsBySection = async (section: PoolsSectionFilter) => {
    const { docs } = await poolAPI.getPools({
      section,
    });
    const pools = await Promise.all(
      docs.map(async (doc) => {
        const result = await getPoolFullInfo(mappingPoolServerResponse(doc, now));
        return result;
      }),
    );

    return pools;
  };

  const loading = featureLoading || upcomingLoading || completedLoading;

  return (
    <Layout title={PageTitle.PoolsPage}>
      <LoadingScreen loading={loading} />
      <div className="mx-auto layout-container">
        <div
          className="relative bg-center bg-cover"
          style={{ backgroundImage: "url('/images/gamify_bg_orb.jpeg')", height: 400 }}
        >
          {/* <div className="absolute inset-0 bg-black bg-opacity-30" /> */}
        </div>
        {/* UPCOMING POOL */}
        <div className="flex flex-col items-center w-full p-8">
          <h3 className="mb-8 text-2xl font-light text-center text-white uppercase">
            Upcoming Pools
          </h3>

          <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-3">
            {upcomingLoading && <PoolCardLoading variant="upcoming-pool" />}
            {upcomingPools.length <= 0 && (
              <span className="text-sm text-white">No Pools Founds</span>
            )}
            {upcomingPools.slice(0, 3).map((pool) => (
              <div key={pool.id}>
                <PoolCard variant="upcoming-pool" pool={pool} loading={upcomingLoading} />
              </div>
            ))}
          </div>
        </div>
        {/* FEATURE POOL */}
        <div className="flex flex-col items-center w-full p-8">
          <h3 className="mb-8 text-2xl font-light text-center text-white uppercase">
            Feature Pools
          </h3>

          <div className="grid w-full grid-cols-1 gap-4">
            {featureLoading && <PoolCardLoading variant="feature-pool" />}
            {featurePools.length <= 0 && (
              <span className="text-sm text-white">No Pools Founds</span>
            )}
            {featurePools.slice(0, 5).map((pool) => (
              <div className="w-full mx-auto" style={{ maxWidth: 800 }} key={pool.id}>
                <PoolCard variant="feature-pool" pool={pool} loading={featureLoading} />
              </div>
            ))}
          </div>
        </div>
        {/* COMPLETED POOL */}
        <div className="flex flex-col items-center w-full p-8">
          <h3 className="mb-8 text-2xl font-light text-center text-white uppercase">
            Completed Pools
          </h3>

          <div className="grid w-full grid-cols-1 gap-4">
            {completedLoading && <PoolCardLoading variant="completed-pool" />}
            {completedPools.length <= 0 && (
              <span className="text-sm text-white">No Pools Founds</span>
            )}
            {completedPools.slice(0, 5).map((pool) => (
              <div className="w-full" key={pool.id}>
                <PoolCard variant="feature-pool" pool={pool} loading={completedLoading} />
              </div>
            ))}
          </div>

          <button
            onClick={() => router.push('/pools-dashboard')}
            className="flex items-center justify-center w-64 h-12 px-8 py-2 mt-4 text-sm text-center text-white transition-all duration-200 bg-red-700 rounded-full hover:bg-red-900"
          >
            <span className="mr-4 text-sm">View all pool</span>
            <AiOutlineArrowRight />
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default Pools;
