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
  description?: string;
}

const DetailsLeadingInfo: React.FC<Props> = ({
  name,
  tokenAddress,
  tagLine,
  medium,
  telegram,
  twitter,
  image,
  description,
}) => {
  const logo = getPoolLogo(image);
  const tokenAddressUrl = generateOnChainUrl('address', tokenAddress);

  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center mb-4">
        <div className="flex items-center justify-center w-16 h-16 mr-2 overflow-hidden rounded-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logo} className="w-full h-full rounded-full" alt="Pool logo" />
        </div>

        <h1
          className="overflow-hidden text-3xl font-semibold text-white truncate"
          style={{ maxWidth: 400 }}
        >
          {name}
        </h1>
      </div>

      <ul className="flex items-center justify-between mb-4">
        <li className="mx-4">
          <a href={tokenAddressUrl} target="_blank" rel="noreferrer" className="flex items-center">
            <Image src="/icons/contract-icon.svg" width={24} height={24} alt="Token logo" />
          </a>
        </li>
        {twitter && (
          <li className="mx-4">
            <a href={twitter} target="_blank" rel="noreferrer">
              <FaTwitter className="text-2xl text-secondary-500" />
            </a>
          </li>
        )}
        {telegram && (
          <li className="mx-4">
            <a href={telegram} target="_blank" rel="noreferrer">
              <FaTelegramPlane className="text-2xl text-secondary-500" />
            </a>
          </li>
        )}
        {medium && (
          <li className="mx-4">
            <a href={medium} target="_blank" rel="noreferrer" className="flex items-center">
              <Image src="/icons/medium-icon.svg" width={24} height={24} alt="Medium logo" />
            </a>
          </li>
        )}
      </ul>

      {description && (
        <span className="max-w-md text-xs font-light text-center text-white truncate">
          {description}
        </span>
      )}
    </div>
  );
};

export default DetailsLeadingInfo;
