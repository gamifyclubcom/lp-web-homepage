import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import Button from '../button';

const HomeLaunch: React.FC = () => {
  const router = useRouter();

  const games = [
    {
      src: '/images/games/aurory.png',
      title: 'aurory',
    },
    {
      src: '/images/games/defiland.png',
      title: 'defiland',
    },
    {
      src: '/images/games/kaiju.png',
      title: 'kaiju',
    },
    {
      src: '/images/games/magicbeasties.png',
      title: 'magicbeasties',
    },
    {
      src: '/images/games/ninjaprotocol.png',
      title: 'ninjaprotocol',
    },
    {
      src: '/images/games/openera.png',
      title: 'openera',
    },
    {
      src: '/images/games/projectseed.png',
      title: 'projectseed',
    },
    {
      src: '/images/games/scallop.png',
      title: 'scallop',
    },
    {
      src: '/images/games/solaknights.png',
      title: 'solaknights',
    },
    {
      src: '/images/games/solife.png',
      title: 'solife',
    },
    {
      src: '/images/games/staratlas.png',
      title: 'staratlas',
    },
  ];

  const handleClickNav = (navLink?: string, newTab: boolean = false) => {
    if (navLink) {
      if (!newTab) {
        router.push(navLink);
      } else {
        window.open(navLink, '_blank');
      }
    }
  };

  return (
    <div className="mt-12 text-center layout-container">
      <h3 className="text-white text-4xl mb-3.5">Ready to launch your project on Gamify?</h3>
      <p className="text-white text-15px">
        Built to support the growing Play-To-Earn experiences in the Solana Metaverse
      </p>
      <Button
        style="bg-3232DC mt-9 ml-auto mr-auto text-sm"
        link="https://98a54lmwmqy.typeform.com/to/lypkBwld?typeform-source=intersola-dev-web.sotatek.works"
      >
        Apply to launch
      </Button>
      <ul className="mt-6 mb-10">
        {games.map((game, ind) => (
          <li key={ind} className={`inline-block ${ind !== 0 ? 'ml-1.5' : ''}`}>
            <Image width={50} height={50} src={game.src} alt={game.title} />
          </li>
        ))}
      </ul>
      <ul className="pb-5">
        <li
          className="inline-block"
          onClick={() => handleClickNav('https://t.me/gamifyclub', true)}
        >
          <Image
            width={24}
            height={20}
            src={'/images/socials/telegram.svg'}
            alt={'telegram'}
            className="cursor-pointer"
          />
        </li>
        <li
          className="inline-block ml-7"
          onClick={() => handleClickNav('https://twitter.com/gamifyclub', true)}
        >
          <Image
            width={23}
            height={19}
            src={'/images/socials/twitter.svg'}
            alt={'twitter'}
            className="cursor-pointer"
          />
        </li>
        <li
          className="inline-block ml-7"
          onClick={() => handleClickNav('https://intersola.medium.com/', true)}
        >
          <Image
            width={24}
            height={14}
            src={'/images/socials/medium.svg'}
            alt={'medium'}
            className="cursor-pointer"
          />
        </li>
        <li className="inline-block ml-7" onClick={() => handleClickNav('/', false)}>
          <Image
            width={20}
            height={21}
            src={'/images/socials/about.svg'}
            alt={'about'}
            className="cursor-pointer"
          />
        </li>
        <li
          className="inline-block ml-7"
          onClick={() => handleClickNav('http://docs.gamify.io/', true)}
        >
          <Image
            width={23}
            height={23}
            src={'/images/socials/document.svg'}
            alt={'document'}
            className="cursor-pointer"
          />
        </li>
      </ul>
    </div>
  );
};

export default HomeLaunch;
