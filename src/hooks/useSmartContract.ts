import { WalletNotConnectedError } from '@solana/wallet-adapter-base';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Transaction } from '@solana/web3.js';
import { ERROR_MESSAGES } from '../utils/constants';
import { transformLamportsToSOL } from '../utils/helper';

function useSmartContract() {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  const refreshWalletBalance = (): Promise<number | null> => {
    return new Promise(async (resolve, reject) => {
      if (publicKey) {
        try {
          const accInfo = await connection.getAccountInfo(publicKey);
          if (accInfo && accInfo.lamports) {
            const balanceResult = transformLamportsToSOL(accInfo.lamports || 0);

            resolve(balanceResult);
          } else {
            reject({ message: 'Account not found' });
          }
        } catch (err) {}
      } else {
        reject({ message: ERROR_MESSAGES.WALLET_NOT_CONNECT });
      }
    });
  };

  const parseAndSendTransaction = async (
    rawTransaction: any
  ): Promise<string> => {
    if (!publicKey) {
      throw new WalletNotConnectedError();
    }

    const transactionBuffer = Buffer.from(rawTransaction, 'base64');
    const transaction = Transaction.from(transactionBuffer);
    const { blockhash } = await connection.getRecentBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = publicKey;

    const signature = await sendTransaction(transaction, connection);
    const txId = await connection.confirmTransaction(signature, 'recent');
    // return txId;

    return 'txId';
  };

  return {
    refreshWalletBalance,
  };
}

export default useSmartContract;
