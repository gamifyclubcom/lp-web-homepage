import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import type { NextPage } from 'next';
import Image from 'next/image';
import Banner from '../components/banner';
import FeaturePool from '../components/feature-pool';
import HomeLaunch from '../components/home-launch';
import HomeStakePool from '../components/home-stake-pool';
import Layout from '../components/shared/Layout';
import { PageTitle } from '../shared/enum';

const Home: NextPage = () => {
  const { visible, setVisible } = useWalletModal();

  return (
    <Layout title={PageTitle.HomePage}>
      <div className="bg-1C0045">
        <Banner />
        <FeaturePool />
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

export default Home;
