import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import CardText from '../card-text';
import Button from '../button';
import PoolItem from '../pool-item';

const FeaturePool: React.FC = () => {
  const router = useRouter();

  return (
    <div className="layout-container pt-32">
      <h3 className="text-white text-center text-2xl uppercase mb-20">Feature Game Projects</h3>
      <div className="flex">
        <CardText
          title={'Token Sale Launchpad'}
          description={
            'Gain early access to public and special token sales at a lower price before they hit the market'
          }
          style="w-1/6 mr-6 mt-20"
        >
          <Button style="bg-3232DC mt-14" link="/kkkk">
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
        <div className="grid w-full grid-cols-1 gap-x-2 gap-y-5 md:grid-cols-3 lg:grid-cols-4">
          <PoolItem></PoolItem>
          <PoolItem></PoolItem>
          <PoolItem></PoolItem>
          <PoolItem></PoolItem>
          <PoolItem></PoolItem>
          <PoolItem></PoolItem>
          <PoolItem></PoolItem>
          <PoolItem></PoolItem>
        </div>
      </div>
    </div>
  );
};

export default FeaturePool;
