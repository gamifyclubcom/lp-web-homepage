import { useWallet } from '@solana/wallet-adapter-react';
import clsx from 'clsx';
import { useMemo } from 'react';
import { poolMenus, poolsVotingMenus } from '../../../utils/constants';
import PoolNavbarMenuItem from './PoolNavbarMenuItem';

interface Props {
  variant: 'pools-dashboard' | 'pools-voting';
  activeSection: string;
}

const PoolNavbarMenus: React.FC<Props> = ({ variant, activeSection }) => {
  const { publicKey } = useWallet();
  const menus = useMemo(() => {
    if (variant === 'pools-dashboard') {
      return poolMenus;
    }

    return poolsVotingMenus;
  }, [variant]);

  return (
    <ul
      className={clsx('flex flex-wrap w-full max-w-screen-xl mx-auto mb-4', {
        'border-b border-gray-500': variant === 'pools-dashboard',
      })}
    >
      {menus.map((menu) => {
        if (menu.needConnectWallet) {
          return (
            Boolean(publicKey) && (
              <PoolNavbarMenuItem
                key={menu.key}
                menu={menu}
                variant={variant}
                active={menu.section === activeSection}
              />
            )
          );
        }
        return (
          <PoolNavbarMenuItem
            key={menu.key}
            menu={menu}
            variant={variant}
            active={menu.section === activeSection}
          />
        );
      })}
    </ul>
  );
};

export default PoolNavbarMenus;
