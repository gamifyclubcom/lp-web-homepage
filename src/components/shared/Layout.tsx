import { useWallet } from '@solana/wallet-adapter-react';
import clsx from 'clsx';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useMemo } from 'react';
import { useGlobal } from '../../hooks/useGlobal';
import useSmartContract from '../../hooks/useSmartContract';
import { PageTitle } from '../../shared/enum';
import Footer from './layout/footer';
import Header from './layout/header';
import ScrollTop from './ScrollTop';

interface Props {
  title?: string;
}

const Layout: React.FC<Props> = ({ title = PageTitle.HomePage, children }) => {
  const router = useRouter();
  const { setTotalStaked, setAllocationLevel, setLoading } = useGlobal();
  const { getUserStakeData } = useSmartContract();
  const { connected } = useWallet();

  const isInPoolVotingPage = useMemo(() => {
    return router.pathname === '/pools-voting';
  }, [router.pathname]);
  const isInPoolsDashboardPage = useMemo(() => {
    return router.pathname === '/pools-dashboard';
  }, [router.pathname]);

  useEffect(() => {
    const init = async () => {
      try {
        if (connected) {
          setLoading(true);
          const userStakeData = await getUserStakeData();
          setLoading(false);
          setTotalStaked(userStakeData.total_staked);
          setAllocationLevel(userStakeData.allocation_level);
        } else {
          setTotalStaked(0);
          setAllocationLevel(0);
        }
      } catch (err) {
        setTotalStaked(0);
        setAllocationLevel(0);
      }
    };

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connected]);

  return (
    <>
      <Head>
        <title>{title}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />

      <main
        className={clsx('bg-primary-500', {
          'bg-pools-voting-list bg-center bg-cover': isInPoolVotingPage,
          'bg-pools-dashboard bg-center bg-cover': isInPoolsDashboardPage,
        })}
      >
        {children}
      </main>
      <ScrollTop />
      <Footer />
    </>
  );
};

export default Layout;
