import Image from 'next/image';
import { useRouter } from 'next/router';

interface Props {}

const ViewAllPoolBtn: React.FC<Props> = () => {
  const router = useRouter();
  return (
    <button
      onClick={() => router.push('/pools-dashboard')}
      className="flex items-center justify-center px-8 py-3 text-lg text-white transition-all duration-200 bg-red-700 rounded-full hover:bg-red-800"
    >
      <span className="mr-2">View all projects</span>
      <Image width={16} height={8} src="/images/arrow.svg" alt="arrow" className="cursor-pointer" />
    </button>
  );
};

export default ViewAllPoolBtn;
