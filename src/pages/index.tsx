import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import type { NextPage, GetServerSideProps } from 'next';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Banner from '../components/banner';
import FeaturePool from '../components/feature-pool';
import HomeLaunch from '../components/home-launch';
import HomeStakePool from '../components/home-stake-pool';
import Layout from '../components/shared/Layout';
import { PageTitle } from '../shared/enum';
import { mappingPoolServerResponse, poolAPI } from '../sdk/pool';
import { usePool } from '../hooks/usePool';
import { useGlobal } from '../hooks/useGlobal';
import { ServerResponsePool } from '../sdk/pool/interface';
import LoadingScreen from '../components/shared/LoadingScreen';

interface Props {
  paginatedPools: PaginateResponse<ServerResponsePool>;
}

const Home: React.FC<Props> = ({ paginatedPools }) => {
  const { visible, setVisible } = useWalletModal();

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
  }, []);

  const pools = paginatedPool?.docs || [];

  return (
    <Layout title={PageTitle.HomePage}>
      <LoadingScreen loading={loading} />
      <div className="bg-1C0045">
        <Banner />
        <FeaturePool pools={pools} />
        <HomeStakePool />
        <div className="text-center pt-40">
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
  const paginatedPools = await poolAPI.getPools(query);

  return {
    props: {
      paginatedPools,
    },
  };
};

export default Home;
