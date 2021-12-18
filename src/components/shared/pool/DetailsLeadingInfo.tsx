import Image from 'next/image';
import { FaTelegramPlane, FaTwitter } from 'react-icons/fa';
import { generateOnChainUrl, getPoolLogo, isJSON } from '../../../utils/helper';
import { convertFromRaw } from 'draft-js';
import { stateToHTML } from 'draft-js-export-html';

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

  const parseDescription = () => {
    if (description && isJSON(description)) {
      const options = {
        entityStyleFn: (entity: any) => {
          const entityType = entity.get('type').toLowerCase();
          if (entityType === 'image') {
            const data = entity.getData();
            return {
              element: 'img',
              attributes: {
                src: data.url,
              },
              style: {},
            };
          }
        },
      };

      const descriptionParse = JSON.parse(description);
      const rawDescription = convertFromRaw(descriptionParse);
      return stateToHTML(rawDescription, options);
    }
    return description || '';
  };

  return (
    <div className="flex flex-col items-left">
      <div className="flex mb-2 items-left">
        <div className="flex justify-center w-12 h-12 mr-2 overflow-hidden rounded-full items-left">
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

      {description && (
        <div className="max-w-md mb-4 text-sm font-light text-left text-white truncate">
          <div dangerouslySetInnerHTML={{ __html: parseDescription() }} />
        </div>
      )}

      <ul className="flex justify-start items-left">
        <li className="px-3 pl-0">
          <a href={tokenAddressUrl} target="_blank" rel="noreferrer" className="flex items-center">
            <Image src="/images/socials/document.svg" width={24} height={24} alt="Token logo" />
          </a>
        </li>
        {twitter && (
          <li className="px-3 border-l border-gray-700">
            <a href={twitter} target="_blank" rel="noreferrer">
              <FaTwitter className="text-2xl text-white" />
            </a>
          </li>
        )}
        {telegram && (
          <li className="px-3 border-l border-gray-700">
            <a href={telegram} target="_blank" rel="noreferrer">
              <FaTelegramPlane className="text-2xl text-white" />
            </a>
          </li>
        )}
        {medium && (
          <li className="px-3 border-l border-gray-700">
            <a href={medium} target="_blank" rel="noreferrer" className="flex items-center">
              <Image src="/images/socials/medium.svg" width={24} height={24} alt="Medium logo" />
            </a>
          </li>
        )}
      </ul>
    </div>
  );
};

export default DetailsLeadingInfo;
