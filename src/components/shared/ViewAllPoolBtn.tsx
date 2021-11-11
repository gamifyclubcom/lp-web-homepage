import Image from 'next/image';
import { useRouter } from 'next/router';
import { useMemo } from 'react';

interface Props {
  link?: string;
  content?: string;
}

const ViewAllPoolBtn: React.FC<Props> = ({ link, content }) => {
  const router = useRouter();
  const btnContent = useMemo(() => {
    if (content) {
      return content;
    }

    return 'View All Project';
  }, [content]);

  const handleBtnClick = () => {
    if (link) {
      router.push(link);
    } else {
      router.push('/pools-dashboard');
    }
  };

  return (
    <button
      onClick={handleBtnClick}
      className="flex items-center justify-center px-8 py-3 text-sm text-white transition-all duration-200 bg-red-700 rounded-full hover:bg-red-800"
    >
      <span className="mr-2">{btnContent}</span>
      <Image width={16} height={8} src="/images/arrow.svg" alt="arrow" className="cursor-pointer" />
    </button>
  );
};

export default ViewAllPoolBtn;
