import Image from 'next/image';

interface Props {}

const BuyGMFCTokenButton: React.FC<Props> = () => {
  return (
    <button
      className="flex items-center justify-between w-full px-4 py-2 mt-4 overflow-hidden transition-all rounded-md md:mt-0 bg-secondary-500 hover:bg-secondary-600"
      style={{ maxWidth: 280 }}
    >
      <span className="text-xs text-white uppercase">BUY GMFC NOW ON</span>
      <Image width={100} height={30} src="/images/radium_logo.svg" alt="radium logo" />
    </button>
  );
};

export default BuyGMFCTokenButton;
