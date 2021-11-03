import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import type { NextPage } from 'next';
import Layout from '../components/shared/Layout';
import { PageTitle } from '../shared/enum';

const Home: NextPage = () => {
  const { visible, setVisible } = useWalletModal();

  return <Layout title={PageTitle.HomePage}>home page</Layout>;
};

export default Home;
