import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Button from '../button';

const HomeLaunch: React.FC = () => {
  const router = useRouter();

  const games = [
    {
      src: '/images/games/aurory.png',
      title: 'aurory',
      link: '/',
    },
    {
      src: '/images/games/defiland.png',
      title: 'defiland',
      link: '/',
    },
    {
      src: '/images/games/kaiju.png',
      title: 'kaiju',
      link: '/',
    },
    {
      src: '/images/games/magicbeasties.png',
      title: 'magicbeasties',
      link: '/',
    },
    {
      src: '/images/games/ninjaprotocol.png',
      title: 'ninjaprotocol',
      link: '/',
    },
    {
      src: '/images/games/openera.png',
      title: 'openera',
      link: '/',
    },
    {
      src: '/images/games/projectseed.png',
      title: 'projectseed',
      link: '/',
    },
    {
      src: '/images/games/scallop.png',
      title: 'scallop',
      link: '/',
    },
    {
      src: '/images/games/solaknights.png',
      title: 'solaknights',
      link: '/',
    },
    {
      src: '/images/games/solife.png',
      title: 'solife',
      link: '/',
    },
    {
      src: '/images/games/staratlas.png',
      title: 'staratlas',
      link: '/',
    },
  ];

  return (
    <div className="mt-12 text-center layout-container">
      <h3 className="text-white text-4xl mb-3.5">Ready to launch your project on Gamify?</h3>
      <p className="text-white text-15px">
        Built to support the growing Play-To-Earn experiences in the Solana Metaverse
      </p>
      <Button
        style="bg-3232DC mt-9 ml-auto mr-auto"
        link="https://98a54lmwmqy.typeform.com/to/lypkBwld?typeform-source=intersola-dev-web.sotatek.works"
      >
        Apply to launch
      </Button>
      <ul className="mt-6 mb-20 md:mb-64">
        {games.map((game, ind) => (
          <li key={ind} className={`inline-block ${ind !== 0 ? 'ml-1.5' : ''}`}>
            <Image
              width={50}
              height={50}
              src={game.src}
              alt={game.title}
              className="cursor-pointer"
              onClick={() => router.push(game.link)}
            />
          </li>
        ))}
      </ul>
      <ul className="pb-5">
        <li className="inline-block">
          <Link href="https://t.me/gamifyclub" passHref={true}>
            <Image
              width={24}
              height={20}
              src={'/images/socials/telegram.svg'}
              alt={'telegram'}
              className="cursor-pointer"
            />
          </Link>
        </li>
        <li className="inline-block ml-7">
          <Link href="https://twitter.com/gamifyclub" passHref={true}>
            <Image
              width={23}
              height={19}
              src={'/images/socials/twitter.svg'}
              alt={'twitter'}
              className="cursor-pointer"
            />
          </Link>
        </li>
        <li className="inline-block ml-7">
          <Link href="https://intersola.medium.com/" passHref={true}>
            <Image
              width={24}
              height={14}
              src={'/images/socials/medium.svg'}
              alt={'medium'}
              className="cursor-pointer"
            />
          </Link>
        </li>
        <li className="inline-block ml-7">
          <Link href="/" passHref={true}>
            <Image
              width={20}
              height={21}
              src={'/images/socials/about.svg'}
              alt={'about'}
              className="cursor-pointer"
            />
          </Link>
        </li>
        <li className="inline-block ml-7">
          <Link href="http://docs.gamify.io/" passHref={true}>
            <Image
              width={23}
              height={23}
              src={'/images/socials/document.svg'}
              alt={'document'}
              className="cursor-pointer"
            />
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default HomeLaunch;
