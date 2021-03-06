import Image from 'next/image';
import { FaTelegramPlane, FaTwitter } from 'react-icons/fa';
import { generateOnChainUrl, getPoolLogo, isJSON } from '../../../utils/helper';
import { convertFromRaw } from 'draft-js';
import { stateToHTML } from 'draft-js-export-html';
import ShowMoreText from 'react-show-more-text';

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

  const matchYoutubeUrl = (url: any) => {
    var p =
      /^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/;
    if (url && url.match(p)) {
      return url.match(p)[1];
    }
    return false;
  };

  const parseDescription = () => {
    if (description && isJSON(description)) {
      const options = {
        entityStyleFn: (entity: any) => {
          const entityType = entity.get('type').toLowerCase();
          if (entityType === 'image') {
            const data = entity.getData();
            if (data?.type && data.type === 'video') {
              let attElement = 'video';
              let attUrl = data.src;
              if (matchYoutubeUrl(data.src)) {
                attElement = 'iframe';
                attUrl = `https://www.youtube.com/embed/${matchYoutubeUrl(data.src)}`;
              }
              return {
                element: attElement,
                attributes: {
                  src: attUrl,
                  controls: true,
                },
              };
            }
            return {
              element: 'img',
              attributes: {
                src: data.src,
              },
              style: {},
            };
          }
        },
        inlineStyleFn: (styles: any) => {
          let key = 'color-';
          let key_bg = 'bgcolor-';
          let color = styles.filter((value: any) => value.startsWith(key)).first();
          let bgcolor = styles.filter((value: any) => value.startsWith(key_bg)).first();

          if (
            color &&
            !color.replace(key, '').includes('rgb(0,0,0') &&
            !color.replace(key, '').includes('rgba(0,0,0')
          ) {
            return {
              element: 'span',
              style: {
                color: color.replace(key, ''),
              },
            };
          }
          if (bgcolor) {
            return {
              element: 'span',
              style: {
                backgroundColor: bgcolor.replace(key, ''),
              },
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
        <div className="w-full mb-4 text-sm font-light text-left text-white">
          <ShowMoreText
            lines={5}
            more="see more"
            less="see less"
            // className="content-css"
            anchorClass="text-pool_focus_1"
            expanded={false}
            // width={280}
            truncatedEndingComponent={'... '}
          >
            <span dangerouslySetInnerHTML={{ __html: parseDescription() }} />
          </ShowMoreText>
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
