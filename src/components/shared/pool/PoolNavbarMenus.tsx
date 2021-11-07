import { useWallet } from '@solana/wallet-adapter-react';
import { useMemo } from 'react';
import { poolMenus, poolsVotingMenus } from '../../../utils/constants';
import PoolNavbarMenuItem from './PoolNavbarMenuItem';

interface Props {
  variant: 'pools' | 'pools-voting';
  activeSection: string;
}

const PoolNavbarMenus: React.FC<Props> = ({ variant, activeSection }) => {
  const { publicKey } = useWallet();
  const menus = useMemo(() => {
    if (variant === 'pools') {
      return poolMenus;
    }

    return poolsVotingMenus;
  }, [variant]);

  return (
    <ul className="flex flex-wrap w-full max-w-screen-xl mx-auto mb-4">
      {menus.map((menu) => {
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
