import { clockSysvarAccount } from '@intersola/onchain-program-sdk';
import { u64 } from '@solana/spl-token';
import { useConnection } from '@solana/wallet-adapter-react';
import Decimal from 'decimal.js';
import moment from 'moment';
import { createContext, Dispatch, SetStateAction, useEffect, useState } from 'react';
import { ClockLayout } from '../sdk/layout';
import { formatNumber, transformLamportsToSOL } from '../utils/helper';

interface GlobalState {
  now: number;
  balance: {
    value: number | null;
    formatted: string | null;
  };
  totalStaked: number;
  allocationLevel: number;
  loading: boolean;
  setTotalStaked: Dispatch<SetStateAction<number>>;
  setAllocationLevel: Dispatch<SetStateAction<number>>;
  setLoading: Dispatch<SetStateAction<boolean>>;
  setAccountBalance: (balance: number | null) => void;
}

const GlobalContext = createContext<GlobalState>({
  now: 0,
  balance: {
    value: null,
    formatted: null,
  },
  totalStaked: 0,
  allocationLevel: 0,
  loading: false,
  setTotalStaked: () => {},
  setAllocationLevel: () => {},
  setLoading: () => {},
  setAccountBalance: () => {},
});

export const GlobalProvider: React.FC = ({ children }) => {
  const { connection } = useConnection();
  const [loading, setLoading] = useState(false);
  const [now, setNow] = useState(() => {
    return new Decimal(moment().unix()).times(1000).toNumber();
  });
  const [balance, setBalance] = useState<{
    value: number | null;
    formatted: string | null;
  }>({
    value: null,
    formatted: null,
  });
  const [totalStaked, setTotalStaked] = useState(0);
  const [allocationLevel, setAllocationLevel] = useState(0);

  useEffect(() => {
    const fetchNow = () => {
      connection.getAccountInfo(clockSysvarAccount).then((result) => {
        const decoded = ClockLayout.decode(result?.data);
        const unixTimestamp = u64.fromBuffer(decoded.unix_timestamp).toString();

        setNow(new Decimal(unixTimestamp).toNumber());
      });
    };

    fetchNow();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setNow((prev) => prev + 1);
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const setAccountBalance = (accBalance: number | null) => {
    const balanceResult = transformLamportsToSOL(accBalance || 0);

    setBalance({
      value: balanceResult,
      formatted: formatNumber.format(balanceResult) as string,
    });
  };

  return (
    <GlobalContext.Provider
      value={{
        now,
        balance,
        totalStaked,
        allocationLevel,
        loading,
        setTotalStaked,
        setAllocationLevel,
        setLoading,
        setAccountBalance,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export default GlobalContext;
