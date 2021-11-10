import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import { useAlert } from '../../../../hooks/useAlert';
import { useGlobal } from '../../../../hooks/useGlobal';
import useSmartContract from '../../../../hooks/useSmartContract';

const CurrentAccountBadge: React.FC = ({ children }) => {
  const { publicKey, wallet, connected, disconnect } = useWallet();
  const { setVisible } = useWalletModal();
  const { setAccountBalance, balance } = useGlobal();
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const { alertInfo } = useAlert();
  const { refreshWalletBalance } = useSmartContract();

  const base58 = useMemo(() => publicKey?.toBase58(), [publicKey]);
  const content = useMemo(() => {
    if (children) return children;
    if (!wallet || !base58) return null;
    return base58.slice(0, 4) + '..' + base58.slice(-4);
  }, [children, wallet, base58]);

  const copyAddress = useCallback(async () => {
    if (base58) {
      await navigator.clipboard.writeText(base58);
      setCopied(true);
      setTimeout(() => setCopied(false), 400);
    }
  }, [base58]);

  const openModal = useCallback(() => {
    setVisible(true);
  }, [setVisible]);

  useEffect(() => {
    const initBalance = async () => {
      try {
        setLoading(true);
        await refreshWalletBalance();
        setLoading(false);
      } catch (err) {
        setLoading(false);
        setAccountBalance(null);
      }
    };

    if (connected) {
      initBalance();
    } else {
      setAccountBalance(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connected]);

  useEffect(() => {
    if (copied) {
      alertInfo('Copied');
      setTimeout(() => {
        setCopied(false);
      }, 1000);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [copied]);

  if (!wallet) {
    return (
      <button
        onClick={openModal}
        className="w-64 h-9 overflow-hidden text-white rounded-full shadow-md bg-secondary-500 text-sm"
      >
        Connect Wallet
      </button>
    );
  }
  if (!base58) {
    return (
      <button className="w-64 h-9 overflow-hidden text-white rounded-full shadow-md bg-secondary-500 text-sm">
        Connecting...
      </button>
    );
  }

  return (
    <div className="flex items-center justify-between w-64 h-9 overflow-hidden rounded-full shadow-md bg-secondary-500 text-sm">
      <button
        onClick={disconnect}
        className="flex items-center justify-center p-2 mx-2 bg-black rounded-full bg-opacity-30"
      >
        <FaTimes className="z-20 text-white" />
      </button>

      <div className="flex items-center justify-between w-full">
        {loading ? (
          <span className="h-3 bg-gray-300 rounded-full w-14 animate-pulse"></span>
        ) : (
          <span className="ml-auto text-sm text-white">{balance?.formatted} SOL</span>
        )}
        <div
          onClick={copyAddress}
          className="flex items-center justify-center p-2 mx-2 text-sm text-white bg-gray-900 rounded-full cursor-pointer w-28"
        >
          {content}
        </div>
      </div>
    </div>
  );
};

export default CurrentAccountBadge;
