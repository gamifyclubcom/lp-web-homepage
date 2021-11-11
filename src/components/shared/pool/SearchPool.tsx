import { Dispatch, SetStateAction } from 'react';
import { VscSearch } from 'react-icons/vsc';

interface Props {
  inputSearch: string;
  variant: 'pool-voting' | 'pool-dashboard';
  setInputSearch: Dispatch<SetStateAction<string>>;
}

const SearchPool: React.FC<Props> = ({ inputSearch, variant, setInputSearch }) => {
  if (variant === 'pool-dashboard') {
    return (
      <div className="flex items-center w-full h-12 px-4 py-1 text-white border border-gray-500 rounded-lg">
        <input
          placeholder="Search by Pool ID, Pool Name, Token Contract Address or Symbol"
          className="flex-1 w-full px-4 py-1 pl-2 text-white bg-transparent border-none outline-none focus:outline-none"
          value={inputSearch}
          onChange={(e) => setInputSearch(e.target.value)}
        />
        <VscSearch className="my-1 ml-2 mr-1 text-lg" />
      </div>
    );
  }

  return (
    <div className="flex items-center w-full px-4 py-2 text-white border rounded-xl border-secondary-400">
      <VscSearch className="my-1 ml-1 mr-2 text-2xl" />
      <input
        placeholder="Search by Pool ID, Pool Name, Token Contract Address or Symbol"
        className="flex-1 w-full px-4 py-2 text-white bg-transparent border-none outline-none focus:outline-none"
        value={inputSearch}
        onChange={(e) => setInputSearch(e.target.value)}
      />
    </div>
  );
};

export default SearchPool;
