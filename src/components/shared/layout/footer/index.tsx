import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useMemo } from 'react';
import BuyGMFCTokenButton from '../../BuyGMFCTokenButton';
import { products, projectTargets } from './constants';
import ProductItem from './ProductItem';
import ProjectTarget from './ProjectTarge';

interface Props {}

const Logo: React.FC = () => {
  const router = useRouter();

  return (
    <a className="cursor-pointer" onClick={() => router.push('/')}>
      <Image width={200} height={60} src="/images/gamify_logo.svg" alt="gamify logo" />
    </a>
  );
};

const Footer: React.FC<Props> = () => {
  const router = useRouter();

  const isInHomePage = useMemo(() => {
    return router.pathname === '/';
  }, [router.pathname]);

  return (
    <footer className="flex flex-col">
      <div className="flex flex-col w-full bg-primary-900">
        {isInHomePage && (
          <div className="w-full mx-auto layout-container">
            <div className="flex flex-col items-start justify-between pt-6 pb-6 border-b md:pb-10 border-primary-300 md:flex-row">
              <Logo />
              <BuyGMFCTokenButton />
            </div>

            <div className="w-full py-2">
              <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2">
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  {projectTargets.map((target, index) => (
                    <ProjectTarget
                      key={`${target.title}__${index}`}
                      title={target.title}
                      descriptions={target.descriptions}
                    />
                  ))}
                </div>
                <div className="flex flex-col items-center">
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                    {products.map((product, index) => (
                      <ProductItem
                        key={`${product.name}__${index}`}
                        name={product.name}
                        description={product.description}
                        image={product.image}
                        redirectLink={product.redirectLink}
                      />
                    ))}
                  </div>
                  <div
                    className="w-full p-4 my-6 text-sm font-light text-center text-white border border-white rounded-md"
                    style={{ maxWidth: 450 }}
                  >
                    Gamify Club itself will generate revenue from fees levied on services provided
                    from all 3 main pillars. These fees are generally shared with GMFC stakers to
                    ensure there is a strong incentive to hold and become active ecosystem
                    participants.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {!isInHomePage && (
          <div className="w-full mx-auto layout-container">
            <div className="flex flex-col items-end  pt-6">
            <BuyGMFCTokenButton />
            </div>
            <div className="flex flex-col items-center justify-between pb-3 border-b border-primary-300">
            <Logo />
            </div>
            <div className="flex flex-col items-center my-4">
              <span className="my-4 text-sm text-white opacity-70">
                Launch hand-picked game and help them shine.
              </span>
            </div>
          </div>
        )}

        <div className="hidden w-full py-2 md:block">
          <ul className="flex items-center justify-center">
            <li className="p-1 text-sm font-light text-white opacity-30">Term of Service</li>
            <li className="p-1 text-sm font-light text-white opacity-30">|</li>
            <li className="p-1 text-sm font-light text-white opacity-30">Privacy Policy</li>
            <li className="p-1 text-sm font-light text-white opacity-30">|</li>
            <li className="p-1 text-sm font-light text-white opacity-30">Help Center</li>
            <li className="p-1 text-sm font-light text-white opacity-30">|</li>
            <li className="p-1 text-sm font-light text-white opacity-30">support@gamify.com</li>
          </ul>
        </div>
      </div>

      <div className="flex items-center justify-center py-2 bg-gray-700">
        <span className="text-xs text-center text-gray-500">
          Copyright © 2021. All rights reserved.
        </span>
      </div>
    </footer>
  );
};

export default Footer;
