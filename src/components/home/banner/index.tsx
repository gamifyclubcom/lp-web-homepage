import React from 'react';
import { useRouter } from 'next/router';
import ViewAllPoolBtn from '../../shared/ViewAllPoolBtn';

interface Props {}

const Banner: React.FC<Props> = () => {
  const router = useRouter();

  return (
    <div className="h-100v md:h-60v lg:h-80v">
      <div className="bg-hero-pattern bg-100% bg-no-repeat bg-center-50%">
        <div className="flex items-center justify-center h-100v md:h-60v lg:h-80v layout-container-full">
          <div className="flex flex-col items-center justify-center px-5 text-center">
            <h1 className="text-white text-4xl xl:text-5xl 2xl:text-4.25xl pb-3 md:pb-9">
              The All-In-One Hub for the Solana Metaverse
            </h1>
            <span className="text-white lg:text-1.5xl pb-9">
              Metaverse Marketplace | Guild Integrator | Game Launchpad
            </span>
            <p className="text-base text-white md:max-w-658px">
              Welcome to Gamify Club, a single platform to enhance your play-to-earn gaming
              experience: For players, guilds, investors & project owners. Your club for game
              finance.
            </p>
            <div className="mt-4 md:mt-14">
              <ViewAllPoolBtn />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Banner;
