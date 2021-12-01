import Image from 'next/image';
import { useRouter } from 'next/router';
import { useMemo, useState } from 'react';
import { AiOutlineMenu, AiOutlineClose } from 'react-icons/ai';
import { useGlobal } from '../../../../hooks/useGlobal';
import BuyGMFCTokenButton from '../../BuyGMFCTokenButton';
import { navbarMenu } from './constants';
import CurrentAccountBadge from './CurrentAccountBadge';
import NavBarMenuItem from './NavBarMenuItem';

interface Props {}

const Logo = () => {
  const router = useRouter();

  return (
    <Image
      width={112}
      height={35}
      src="/images/gamify_logo.svg"
      alt="gamify club logo"
      className="cursor-pointer"
      onClick={() => router.push('/')}
    />
  );
};

const Header: React.FC<Props> = () => {
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const { isEnabledVotingFeature } = useGlobal();

  const menus = useMemo(() => {
    return navbarMenu.filter((mn) => {
      if (mn.key === 'pools-voting') {
        if (isEnabledVotingFeature) {
          return true;
        }

        return false;
      }
      if (mn.key === 'staking' || mn.key === 'buy-gmfc') {
        return false;
      }

      return true;
    });
  }, [isEnabledVotingFeature]);

  const handleOpenSidebar = () => {
    setSidebarVisible(true);
  };

  const handleCloseSidebar = () => {
    setSidebarVisible(false);
  };

  return (
    <div className="py-4 bg-primary-500">
      <div className="flex items-center justify-between layout-container">
        <div className="flex items-center">
          <Logo />
          <ul className="hidden md:flex">
            {menus.map((menu, index) => (
              <NavBarMenuItem
                key={menu.key}
                name={menu.name}
                link={menu.link}
                externalLink={menu.externalLink}
                variant="vertical"
              />
            ))}
          </ul>
        </div>

        <div className="flex items-center">
          <div className="hidden lg:block">
            <CurrentAccountBadge />
          </div>

          <div className="block lg:hidden">
            <button className="p-2 text-white" onClick={handleOpenSidebar}>
              <AiOutlineMenu className="text-3xl font-light" />
            </button>

            {sidebarVisible && (
              <div className="fixed inset-0 z-50 flex flex-col px-4 bg-primary-500">
                <div className="flex items-center justify-between py-4">
                  <div>
                    <Logo />
                  </div>

                  <div>
                    <button className="p-2 text-white" onClick={handleCloseSidebar}>
                      <AiOutlineClose className="text-3xl font-light" />
                    </button>
                  </div>
                </div>

                <div className="mt-6">
                  <ul className="flex flex-col">
                    {menus
                      .filter((menu) => menu.key !== 'buy-gmfc')
                      .map((menu, index) => (
                        <NavBarMenuItem
                          key={menu.key}
                          name={menu.name}
                          link={menu.link}
                          externalLink={menu.externalLink}
                          variant="horizontal"
                          onClick={handleCloseSidebar}
                        />
                      ))}
                  </ul>

                  {/* <div className="p-4">
                    <BuyGMFCTokenButton />
                  </div> */}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
