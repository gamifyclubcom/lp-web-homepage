import { useRouter } from 'next/router';
import { createContext, useEffect, useState } from 'react';
import { u64 } from '@solana/spl-token';
import { PoolsSectionFilter, PoolsVotingFilter } from '../shared/enum';
import { INavbarPoolMenu } from '../shared/interface';
import Decimal from 'decimal.js';
import moment from 'moment';
import { useConnection } from '@solana/wallet-adapter-react';
import { clockSysvarAccount } from '@intersola/onchain-program-sdk';
import { ClockLayout } from '../sdk/layout';

export const poolMenus: INavbarPoolMenu[] = [
  { label: 'Pools', key: 'all-pools', needConnectWallet: false },
  {
    label: 'Featured',
    key: 'featured-pools',
    section: PoolsSectionFilter.FEATURED,
    needConnectWallet: false,
  },
  {
    label: 'Joined',
    key: 'pools-joined',
    section: PoolsSectionFilter.JOINED,
    needConnectWallet: true,
  },
  {
    label: 'Upcoming',
    key: 'pools-created',
    section: PoolsSectionFilter.UPCOMING,
    needConnectWallet: false,
  },
  {
    label: 'Past',
    key: 'past-pools',
    section: PoolsSectionFilter.PAST,
    needConnectWallet: false,
  },
];

export const poolsVotingMenus: INavbarPoolMenu[] = [
  {
    label: 'Projects',
    key: 'projects',
    section: PoolsVotingFilter.ALL,
    needConnectWallet: false,
  },
  {
    label: 'Upcoming Voting',
    key: 'upcoming-voting',
    section: PoolsVotingFilter.UPCOMING,
    needConnectWallet: false,
  },
  {
    label: 'In Voting',
    key: 'in-voting',
    section: PoolsVotingFilter.IN_VOTING,
    needConnectWallet: false,
  },
  {
    label: 'Deactivated',
    key: 'deactivated',
    section: PoolsVotingFilter.DEACTIVATED,
    needConnectWallet: false,
  },
];

interface GlobalState {
  activePoolMenu: INavbarPoolMenu;
  now: number;
  setActivePoolMenu: (mn: INavbarPoolMenu) => void;
}

const GlobalContext = createContext<GlobalState>({
  activePoolMenu: poolMenus[0],
  now: 0,
  setActivePoolMenu: () => {},
});

export const GlobalProvider: React.FC = ({ children }) => {
  const router = useRouter();
  const { connection } = useConnection();
  const [activePoolMenu, setActivePoolMenu] = useState(() => {
    if (router.pathname === '/pools' && !router.query.section) {
      return poolMenus[0];
    }
    if (router.pathname === '/pools-voting' && !router.query.section) {
      return poolsVotingMenus[0];
    }
    return (
      [...poolMenus, ...poolsVotingMenus].find((menu) => menu.section === router.query.section) ||
      poolMenus[0]
    );
  });
  const [now, setNow] = useState(() => {
    // return moment().unix();
    return new Decimal(moment().unix()).times(1000).toNumber();
  });

  useEffect(() => {
    const fetchNow = () => {
      connection.getAccountInfo(clockSysvarAccount).then((result) => {
        const decoded = ClockLayout.decode(result?.data);
        const unixTimestamp = u64.fromBuffer(decoded.unix_timestamp).toString();

        setNow(new Decimal(unixTimestamp).toNumber());
      });
    };

    fetchNow();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setNow((prev) => prev + 1);
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <GlobalContext.Provider
      value={{
        activePoolMenu,
        now,
        setActivePoolMenu,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export default GlobalContext;
