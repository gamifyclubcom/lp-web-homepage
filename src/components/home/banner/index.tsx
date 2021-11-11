import React from 'react';
import ViewAllPoolBtn from '../../shared/ViewAllPoolBtn';

interface Props {}

const Banner: React.FC<Props> = () => {
  return (
    <div className="h-100v md:h-60v lg:h-80v">
      <div className="bg-hero-pattern bg-100% bg-no-repeat bg-center-50%">
        <div className="flex items-center justify-center h-100v md:h-60v lg:h-80v layout-container-full">
          <div className="flex flex-col items-center justify-center text-center md:w-2/3 px-5 2xl:w-auto">
            <h1 className="text-white text-4xl lg:text-5xl font-medium pb-3 md:pb-5">
              The All-In-One Hub for the Solana Metaverse
            </h1>
            <span className="text-gcpurp-200 font-medium md:text-2xl pb-3">
              Metaverse Marketplace | Guild Integrator | Game Launchpad
            </span>
            <p className="text-gcpurp-200 font-light text-normal text-lg">
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
