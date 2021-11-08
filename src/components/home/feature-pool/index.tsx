import React from 'react';
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
          style="text-center mr-6 mt-20 mb-12 md:w-52 md:text-left"
        >
          <Button style="bg-3232DC mt-14 mx-auto md:mx-0" link="/">
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
        {pools.length === 0 && <span className="font-medium text-white">No Pools Found</span>}
        {pools && pools.length > 0 && (
          <div className="grid w-full grid-cols-1 gap-x-2 gap-y-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
        )}
      </div>
    </div>
  );
};

export default FeaturePool;
