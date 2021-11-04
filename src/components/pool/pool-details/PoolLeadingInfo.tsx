import Image from 'next/image';
import { FaTelegramPlane, FaTwitter } from 'react-icons/fa';
import { generateOnChainUrl, getPoolLogo } from '../../../utils/helper';

interface Props {
  name: string;
  tokenAddress: string;
  tagLine?: string;
  medium?: string;
  telegram?: string;
  twitter?: string;
  image?: string;
}

const PoolLeadingInfo: React.FC<Props> = ({
  name,
  tokenAddress,
  tagLine,
  medium,
  telegram,
  twitter,
  image,
}) => {
  const logo = getPoolLogo(image);
  const tokenAddressUrl = generateOnChainUrl('address', tokenAddress);

  return (
    <div className="flex flex-col items-start">
      <div className="flex items-center w-full">
        <div className="flex items-center justify-center w-16 h-16 mb-4 overflow-hidden rounded-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logo} className="w-full h-full rounded-full" alt="Pool logo" />
        </div>
        <h1
          className="block mb-2 ml-2 overflow-hidden text-3xl font-semibold text-white whitespace-nowrap overflow-ellipsis"
          style={{ width: '60%' }}
        >
          {name}
        </h1>
      </div>
      {tagLine && (
        <span className="text-sm font-medium truncate text-primary-500" style={{ width: '60%' }}>
          {tagLine}
        </span>
      )}

      <ul className="flex items-center mt-6">
        <li className="mr-4">
          <a href={tokenAddressUrl} target="_blank" rel="noreferrer" className="flex items-center">
            <Image src="/icons/contract-icon.svg" width={24} height={24} alt="Token logo" />
          </a>
        </li>
        {twitter && (
          <li className="mr-4">
            <a href={twitter} target="_blank" rel="noreferrer">
              <FaTwitter className="text-2xl text-secondary-500" />
            </a>
          </li>
        )}
        {telegram && (
          <li className="mr-4">
            <a href={telegram} target="_blank" rel="noreferrer">
              <FaTelegramPlane className="text-2xl text-secondary-500" />
            </a>
          </li>
        )}
        {medium && (
          <li className="mr-4">
            <a href={medium} target="_blank" rel="noreferrer" className="flex items-center">
              <Image src="/icons/medium-icon.svg" width={24} height={24} alt="Medium logo" />
            </a>
          </li>
        )}
      </ul>
    </div>
  );
};

export default PoolLeadingInfo;
