import { Dispatch, SetStateAction } from 'react';
import { VscSearch } from 'react-icons/vsc';

interface Props {
  inputSearch: string;
  setInputSearch: Dispatch<SetStateAction<string>>;
}

const SearchPool: React.FC<Props> = ({ inputSearch, setInputSearch }) => {
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
