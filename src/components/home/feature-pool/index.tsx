import React from 'react';
import clsx from 'clsx';
import Image from 'next/image';
import { useRouter } from 'next/router';
import CardText from '../card-text';
import Button from '../button';
import { IPool } from '../../../sdk/pool/interface';
import PoolCard from '../../pool/pool-list/PoolCard';

interface Props {
  pools: IPool[];
  loading: boolean;
}

const FeaturePool: React.FC<Props> = ({ pools, loading }) => {
  const router = useRouter();

  return (
    <div className="pt-16 layout-container md:pt-32">
      <h3 className="mb-20 text-2xl text-center text-white uppercase">Feature Game Projects</h3>
      <div className="md:flex">
        <CardText
          title={'Token Sale Launchpad'}
          description={
            'Gain early access to public and special token sales at a lower price before they hit the market'
          }
          style="text-center mr-6 mt-20 mb-12 md:mb-0 md:w-72 md:text-left md:self-end"
        >
          <Button style="bg-3232DC mt-24 mx-auto md:mx-0 text-sm" link="/pools">
            <span className="mr-2">Join now</span>
            <Image
              width={16}
              height={8}
              src="/images/arrow.svg"
              alt="arrow"
              className="cursor-pointer"
              onClick={() => router.push('/')}
            />
          </Button>
        </CardText>
        <div className="hidden-overlay-2side relative overflow-hidden w-full flex-1">
          <div
            className={clsx('flex items-center w-full gap-x-2 gap-y-5', {
              'animate-hk_wiggle': pools.length > 3,
            })}
          >
            {pools.map((pool, idx) => (
              <PoolCard
                key={idx}
                variant="upcoming-pool"
                pool={pool}
                loading={loading}
                is_home={true}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturePool;
