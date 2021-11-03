import { useRouter } from 'next/router';
import { createContext, useState } from 'react';
import { PoolsSectionFilter, PoolsVotingFilter } from '../shared/enum';
import { INavbarPoolMenu } from '../shared/interface';

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
  setActivePoolMenu: (mn: INavbarPoolMenu) => void;
}

const GlobalContext = createContext<GlobalState>({
  activePoolMenu: poolMenus[0],
  setActivePoolMenu: () => {},
});

export const GlobalProvider: React.FC = ({ children }) => {
  const router = useRouter();
  const [activePoolMenu, setActivePoolMenu] = useState(() => {
    if (router.pathname === '/pools' && !router.query.section) {
      return poolMenus[0];
    }
    if (router.pathname === '/pools-voting' && !router.query.section) {
      return poolsVotingMenus[0];
    }
    return (
      [...poolMenus, ...poolsVotingMenus].find(
        menu => menu.section === router.query.section
      ) || poolMenus[0]
    );
  });

  return (
    <GlobalContext.Provider
      value={{
        activePoolMenu,
        setActivePoolMenu,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export default GlobalContext;
