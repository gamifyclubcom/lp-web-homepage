import { Account, Connection, PublicKey, Transaction } from '@solana/web3.js';
import { WalletAdapter } from '../../contexts/wallet';

export default class SmartContractActions {
  private connection: Connection;
  private wallet: WalletAdapter;
  private walletAddress: PublicKey;

  constructor(connection: Connection, wallet: WalletAdapter | undefined) {
    if (!wallet || !wallet.publicKey) {
      throw new Error('Wallet is not connected');
    }

    this.wallet = wallet;
    this.connection = connection;
    this.walletAddress = wallet.publicKey;
  }

  async parseAndSendTransaction(rawTransaction: any): Promise<string> {
    const transactionBuffer = Buffer.from(rawTransaction, 'base64');
    const transaction = Transaction.from(transactionBuffer);
    const txId = await this.sendAndConfirmTransaction(transaction);
    return txId;
  }

  /**
   * Confirm and send transaction
   *
   * @param transaction Transaction
   * @returns Promise<string> (transaction id)
   */
  public async sendAndConfirmTransaction(
    transaction: Transaction,
    ...signers: Account[]
  ): Promise<string> {
    const { blockhash } = await this.connection.getRecentBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = this.walletAddress;
    if (signers.length > 0) {
      transaction.sign(...signers);
    }

    const signed = await this.wallet.signTransaction(transaction);
    const txId = await this.connection.sendRawTransaction(signed.serialize(), {
      skipPreflight: false,
      preflightCommitment: 'recent',
    });
    await this.connection.confirmTransaction(txId);

    return txId;
  }
}
