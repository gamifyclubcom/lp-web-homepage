import React from 'react';
import Image from 'next/image';
import CardText from '../card-text';
import Button from '../button';

const HomeStakePool: React.FC = () => {
  return (
    <div className="layout-container text-center md:flex md:text-left pt-32 lg:pt-64 justify-center items-center">
      <Image width={460} height={411} src="/images/gamify_central.jpeg" alt="gamify central" />
      <CardText
        title={'Staking Pools'}
        description={
          'In order to participate in pools on Intersola, you will need to stake ISOLA tokens. The amount of tokens you hold will dictate how much allocation you will get.'
        }
        style="md:max-w-sm md:ml-16 mt-10 md:mt-0"
      >
        <Button style="bg-3232DC mt-14 mx-auto md:mx-0" link="/">
          Stake now
        </Button>
      </CardText>
    </div>
  );
};

export default HomeStakePool;
