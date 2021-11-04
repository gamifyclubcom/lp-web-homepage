import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';

interface Props {}

const PoolItem: React.FC<Props> = () => {
  const router = useRouter();

  return (
    <div className="pool-item bg-222228 rounded-3xl pt-8 px-5 pb-5 text-base text-white">
      <Image width={234} height={159} src="/images/234x159.png" alt="Pool item" />
      <div className="text-1.5xl2 my-4">
        GamifyClub <span>(GMFC)</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-500">Total Raise</span>
        <span className="text-1.125lg">146,985.3 SOL</span>
      </div>
      <div className="flex justify-between mt-2.5">
        <span className="text-gray-500">Rate</span>
        <span className="text-1.125lg">1 SOL = 312 GMFC</span>
      </div>
      <div className="flex justify-between mt-2.5">
        <span className="text-gray-500">Supported</span>
        <span className="text-1.125lg">SOL</span>
      </div>
      <button className="w-full bg-38383D text-1.125lg py-2 mt-5 rounded-full">Closed</button>
    </div>
  );
};

export default PoolItem;
