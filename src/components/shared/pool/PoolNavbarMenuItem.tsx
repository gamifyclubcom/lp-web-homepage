import clsx from 'clsx';
import { useRouter } from 'next/router';
import queryString from 'query-string';
import { PoolsVotingFilter } from '../../../shared/enum';
import { INavbarPoolMenu } from '../../../shared/interface';
import { isEmpty } from '../../../utils/helper';

interface Props {
  menu: INavbarPoolMenu;
  variant: 'pools-dashboard' | 'pools-voting';
  active: boolean;
}

const PoolNavbarMenuItem: React.FC<Props> = ({ menu, variant, active }) => {
  const router = useRouter();

  const handleMenuChange = () => {
    const query = menu.section ? queryString.stringify({ section: menu.section }) : '';
    let url = `/${variant}${isEmpty(query) ? '' : `?${query}`}`;
    if (variant === 'pools-voting' && menu.section?.toString() === PoolsVotingFilter.ALL) {
      url = '';
    }

    router.push(url, url, { shallow: true });
  };

  return (
    <li
      className={clsx('mx-2 py-1 text-lg font-medium', {
        'border-b-4 text-secondary-400 font-semibold border-secondary-400': active,
        'text-white': !active,
      })}
    >
      <a onClick={handleMenuChange} className="inline-block cursor-pointer">
        {menu.label}
      </a>
    </li>
  );
};

export default PoolNavbarMenuItem;
