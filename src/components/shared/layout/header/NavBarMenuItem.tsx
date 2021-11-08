import { useRouter } from 'next/router';
import clsx from 'clsx';
import { useMemo } from 'react';

interface Props {
  name: string;
  link?: string;
  externalLink?: string;
  variant: 'horizontal' | 'vertical';
  onClick?: (...args: any[]) => void;
}

const NavBarMenuItem: React.FC<Props> = ({ name, link, externalLink, variant, onClick }) => {
  const router = useRouter();

  const isRouteActive = useMemo(() => {
    return router.pathname === link;
  }, [router.pathname, link]);

  const handleNavBarMenuItemClick = () => {
    if (externalLink) {
      window.open(externalLink, '_blank');
    } else if (link) {
      router.push(link);
    }

    if (onClick) {
      onClick();
    }
  };

  return (
    <li
      className={clsx('text-white cursor-pointer', {
        'w-full p-4 hover:bg-secondary-400 transition-all rounded-md': variant === 'horizontal',
        'px-4 py-2': variant === 'vertical',
        'text-secondary-400 hover:text-white': isRouteActive,
      })}
      onClick={handleNavBarMenuItemClick}
    >
      <a className="text-sm font-semibold">{name}</a>
    </li>
  );
};

export default NavBarMenuItem;
