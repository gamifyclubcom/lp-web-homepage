import type { GetServerSideProps } from 'next';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import Banner from '../components/home/banner';
import FeaturePool from '../components/home/feature-pool';
import HomeLaunch from '../components/home/home-launch';
import HomeStakePool from '../components/home/home-stake-pool';
import Layout from '../components/shared/Layout';
import LoadingScreen from '../components/shared/LoadingScreen';
import { useGlobal } from '../hooks/useGlobal';
import { usePool } from '../hooks/usePool';
import { mappingPoolServerResponse, poolAPI } from '../sdk/pool';
import { ServerResponsePool } from '../sdk/pool/interface';
import { PageTitle, PoolsSectionFilter } from '../shared/enum';

interface Props {
  paginatedPools: PaginateResponse<ServerResponsePool>;
}

const Home: React.FC<Props> = ({ paginatedPools }) => {
  const { now } = useGlobal();
  const [loading, setLoading] = useState(false);
  const { dispatchPaginatedPool, paginatedPool, getPoolFullInfo } = usePool();

  useEffect(() => {
    const init = () => {
      setLoading(true);
      Promise.all(
        paginatedPools.docs.map(async (pool) => {
          const onChainPool = await getPoolFullInfo(mappingPoolServerResponse(pool, now));
          return onChainPool;
        }),
      )
        .then((data) => {
          dispatchPaginatedPool({
            ...paginatedPools,
            docs: data,
          });
        })
        .finally(() => {
          setLoading(false);
        });
    };

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pools = paginatedPool?.docs || [];

  return (
    <Layout title={PageTitle.HomePage}>
      <LoadingScreen loading={loading} />
      <div className="bg-1C0045">
        <Banner />
        {pools && pools.length > 0 ? <FeaturePool pools={pools} loading={loading} /> : null}
        {/* <HomeStakePool /> */}
        <div className="pt-40 text-center">
          <Image
            width={548}
            height={380}
            src="/images/solana_phone.png"
            alt="gamify phone"
            className="text-center"
          />
        </div>
        <HomeLaunch />
      </div>
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const paginatedPools = await poolAPI.getPools({
    section: PoolsSectionFilter.FEATURED,
  });

  return {
    props: {
      paginatedPools,
    },
  };
};

export default Home;
