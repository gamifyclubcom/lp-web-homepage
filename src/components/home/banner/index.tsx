import React from 'react';
import ViewAllPoolBtn from '../../shared/ViewAllPoolBtn';

interface Props {}

const Banner: React.FC<Props> = () => {
  return (
    <div className="h-100v md:h-60v lg:h-80v">
      <div className="bg-hero-pattern bg-100% bg-no-repeat bg-center-50%">
        <div className="flex items-center justify-center h-100v md:h-60v lg:h-80v layout-container-full">
          <div className="flex flex-col items-center justify-center px-5 text-center md:w-2/3 2xl:w-auto">
            <h1 className="pb-3 text-4xl font-medium text-white lg:text-5xl md:pb-5">
              The All-In-One Hub for the Solana Metaverse
            </h1>
            <span className="pb-3 font-medium text-white md:text-2xl">
              Metaverse Marketplace | Guild Integrator | Game Launchpad
            </span>
            <p className="text-lg font-light text-white text-normal">
              Welcome to Gamify Club, a single platform to enhance your play-to-earn gaming
              experience: For players, guilds, investors & project owners. Your club for game
              finance.
            </p>
            <div className="mt-4 md:mt-14">
              <ViewAllPoolBtn link="/pools" content="View All Pools" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Banner;
