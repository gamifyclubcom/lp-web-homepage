import React from 'react';
import { useRouter } from 'next/router';

type Props = {
  style?: string;
  link?: string;
};

const Button: React.FC<Props> = ({ style, link, children }) => {
  const router = useRouter();

  return (
    <button
      className={`flex justify-center items-center text-white py-3 pl-9 pr-10 rounded-3xl ${style}`}
      onClick={() => (link ? router.push(link) : {})}
    >
      {children}
    </button>
  );
};

export default Button;
