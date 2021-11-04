import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import Button from '../button';

interface Props {}

const Banner: React.FC<Props> = () => {
  const router = useRouter();

  return (
    <div className="h-100v md:h-80v">
      <div className="bg-hero-pattern bg-100% bg-no-repeat bg-center-60%">
        <div className="h-100v md:h-80v flex items-center justify-center layout-container">
          <div className="flex flex-col items-center justify-center text-center px-5">
            <h1 className="text-white text-4xl lg:text-4.25xl pb-3 md:pb-5">
              The All-In-One Hub for the Solana Metaverse
            </h1>
            <span className="text-white md:text-1.5xl pb-3">
              Metaverse Marketplace | Guild Integrator | Game Launchpad
            </span>
            <p className="text-white text-base md:w-2/3">
              Welcome to Gamify Club, a single platform to enhance your play-to-earn gaming
              experience: For players, guilds, investors & project owners. Your club for game
              finance.
            </p>
            <Button style="bg-D01F36 mt-14">
              <span className="mr-2">View all projects</span>
              <Image
                width={16}
                height={8}
                src="/images/arrow.svg"
                alt="arrow"
                className="cursor-pointer"
                onClick={() => router.push('/')}
              />
            </Button>
            {/* <button className="flex justify-center items-center text-white bg-D01F36 mt-14 py-3 pl-9 pr-10 rounded-3xl"></button> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Banner;
