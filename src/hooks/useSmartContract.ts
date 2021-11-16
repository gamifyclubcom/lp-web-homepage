import { Actions, ITierData, IVoteSetting } from '@gamify/onchain-program-sdk';
import { WalletNotConnectedError } from '@solana/wallet-adapter-base';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, Transaction } from '@solana/web3.js';
import Decimal from 'decimal.js';
import moment from 'moment';
import { useContext, useState } from 'react';
import { envConfig } from '../configs';
import GlobalContext from '../contexts/global';
import { fakeWithClaimablePercentage, mappingPoolOnChainResponse, poolAPI } from '../sdk/pool';
import { IPool, IPoolVoting } from '../sdk/pool/interface';
import { transformLamportsToSOL, transformUnit } from '../utils/helper';
import { useGlobal } from './useGlobal';
import { usePool } from './usePool';

function useSmartContract() {
  const { setAccountBalance } = useContext(GlobalContext);
  const [loading, setLoading] = useState(false);
  const { connection } = useConnection();
  const { publicKey, signTransaction } = useWallet();
  const { now } = useGlobal();
  const { getTokenInfo, getPoolVotingFullInfo } = usePool();

  const handleUserJoinPool = (pool: IPool, amount: number): Promise<string> => {
    return new Promise(async (resolve, reject) => {
      if (!publicKey) {
        throw new WalletNotConnectedError();
      }

      let txId: string;
      const actions = new Actions(connection);

      setLoading(true);
      await handleCloseWrapAccount();

      if (
        pool.private_join_enabled &&
        moment.unix(now).isBetween(pool.private_join_start, pool.private_join_end)
      ) {
        const { rawTx } = await actions.earlyJoin(
          publicKey,
          publicKey,
          new PublicKey(pool.contract_address),
          amount,
        );
        txId = await parseAndSendTransaction(rawTx);
      } else if (
        pool.exclusive_join_enable &&
        moment.unix(now).isBetween(pool.exclusive_join_start, pool.exclusive_join_end)
      ) {
        const { rawTx } = await actions.exclusiveJoin(
          publicKey,
          publicKey,
          new PublicKey(pool.contract_address),
          amount,
        );
        txId = await parseAndSendTransaction(rawTx);
      } else if (
        pool.fcfs_join_for_staker_enabled &&
        moment.unix(now).isBetween(pool.fcfs_join_for_staker_start, pool.fcfs_join_for_staker_end)
      ) {
        const { rawTx } = await actions.fcfsStakeJoin(
          publicKey,
          publicKey,
          new PublicKey(pool.contract_address),
          amount,
        );
        txId = await parseAndSendTransaction(rawTx);
      } else if (
        pool.public_join_enabled &&
        moment.unix(now).isBetween(pool.public_join_start, pool.public_join_end)
      ) {
        const { rawTx } = await actions.join(
          publicKey,
          publicKey,
          new PublicKey(pool.contract_address),
          amount,
        );
        txId = await parseAndSendTransaction(rawTx);
      } else {
        setLoading(false);
        return reject({ message: 'Join pool not available' });
      }

      setLoading(false);

      return resolve(txId);
    });
  };

  const handleCloseWrapAccount = async () => {
    const actions = new Actions(connection);
    if (!publicKey) {
      throw new WalletNotConnectedError();
    }

    const res = await actions.closeAssociatedTokenAccount(publicKey, publicKey);
    if (res.needClose) {
      // TODO: should update send and confirm transaction
      await parseAndSendTransaction(res.transaction!);
    }
  };

  const handleUserClaimToken = (poolContractAccount: PublicKey): Promise<string> => {
    return new Promise(async (resolve, reject) => {
      if (!publicKey) {
        throw new WalletNotConnectedError();
      }

      const actions = new Actions(connection);

      setLoading(true);
      try {
        const { rawTx } = await actions.claimToken(publicKey, publicKey, poolContractAccount);
        const txId = await parseAndSendTransaction(rawTx);
        setLoading(false);
        return resolve(txId);
      } catch (err) {
        setLoading(false);
        return reject({ err });
      }
    });
  };

  const handleUserStake = (amount: number): Promise<string> => {
    return new Promise(async (resolve, reject) => {
      if (!publicKey) {
        throw new WalletNotConnectedError();
      }

      const actions = new Actions(connection);

      setLoading(true);
      try {
        const { rawTx } = await actions.stake(publicKey, publicKey, amount);
        const txId = await parseAndSendTransaction(rawTx);
        setLoading(false);
        return resolve(txId);
      } catch (err) {
        setLoading(false);
        return reject({ err });
      }
    });
  };

  const handleUserUnStake = (amount: number): Promise<string> => {
    return new Promise(async (resolve, reject) => {
      if (!publicKey) {
        throw new WalletNotConnectedError();
      }

      const actions = new Actions(connection);

      setLoading(true);
      try {
        const { rawTx } = await actions.unstake(publicKey, publicKey, amount);
        const txId = await parseAndSendTransaction(rawTx);
        setLoading(false);
        return resolve(txId);
      } catch (err) {
        setLoading(false);
        return reject({ err });
      }
    });
  };

  const getParticipantAddress = async (
    poolAddress: PublicKey,
  ): Promise<{
    accountDataWithSeed: PublicKey;
    exists: boolean;
  }> => {
    return new Promise(async (resolve, reject) => {
      if (!publicKey) {
        throw new WalletNotConnectedError();
      }

      setLoading(true);
      const actions = new Actions(connection);

      try {
        const { associatedAddress, exists } = await actions.getPoolAssociatedAccountInfo(
          publicKey,
          poolAddress,
        );
        setLoading(false);
        return resolve({
          accountDataWithSeed: associatedAddress,
          exists,
        });
      } catch (err) {
        setLoading(false);
        return reject({ err });
      }
    });
  };

  const getMaxAmountUserCanJoin = async (poolAddress: string) => {
    if (!publicKey) {
      throw new WalletNotConnectedError();
    }

    setLoading(true);
    const actions = new Actions(connection);

    setLoading(true);
    try {
      const amount = await actions.getMaxJoinAmount(publicKey, new PublicKey(poolAddress));
      setLoading(false);
      return amount;
    } catch (e) {
      console.log(e);
      setLoading(false);
      return 0;
    }
  };

  const getMaxAmountUserCanStake = async (tokenDecimal: number): Promise<number> => {
    if (!publicKey) {
      throw new WalletNotConnectedError();
    }

    setLoading(true);

    try {
      const data = await getUserTokenBalance();
      setLoading(false);
      return data;
    } catch (err) {
      setLoading(false);
      return 0;
    }
  };

  const getMaxAmountUserCanUnStake = async (): Promise<number> => {
    if (!publicKey) {
      throw new WalletNotConnectedError();
    }

    setLoading(true);
    try {
      const { total_staked } = await getUserStakeData();
      return total_staked;
    } catch (err) {
      setLoading(false);
      return 0;
    }
  };

  const getUserStakeData = async (): Promise<{
    allocation_level: number;
    total_staked: number;
    start_staked: number; // Start stake time in unix
  }> => {
    if (!publicKey) {
      throw new WalletNotConnectedError();
    }

    setLoading(true);
    const actions = new Actions(connection);

    try {
      const data = await actions.readStakeMember(publicKey);
      let result: { allocation_level: number; total_staked: number; start_staked: number } = {
        allocation_level: 0,
        total_staked: 0,
        start_staked: 0,
      };
      if (data && data.is_initialized) {
        const level = data.level5.is_active
          ? 5
          : data.level4.is_active
          ? 4
          : data.level3.is_active
          ? 3
          : data.level2.is_active
          ? 2
          : data.level1.is_active
          ? 1
          : 0;

        const start_staked = data.level5.is_active
          ? moment(data.level5.active_at).unix()
          : data.level4.is_active
          ? moment(data.level4.active_at).unix()
          : data.level3.is_active
          ? moment(data.level3.active_at).unix()
          : data.level2.is_active
          ? moment(data.level2.active_at).unix()
          : data.level1.is_active
          ? moment(data.level1.active_at).unix()
          : 0;

        result = {
          allocation_level: level,
          total_staked: data.amount,
          start_staked,
        };
      }

      setLoading(false);

      return result;
    } catch (err) {
      setLoading(false);
      return {
        allocation_level: 0,
        total_staked: 0,
        start_staked: 0,
      };
    }
  };

  const getUserTiersData = async (
    tokenDecimal: number,
  ): Promise<{
    user_staking_amount: number;
    min_days_stake: number;
    penalty_withdraw: number;
    min_amount_tier5: number;
    tier1: ITierData;
    tier2: ITierData;
    tier3: ITierData;
    tier4: ITierData;
    tier5: ITierData;
  }> => {
    if (!publicKey) {
      throw new WalletNotConnectedError();
    }

    const actions = new Actions(connection);
    try {
      const {
        user_staking_amount,
        min_days_stake,
        penalty_withdraw,
        tier1,
        tier2,
        tier3,
        tier4,
        tier5,
      } = await actions.readTiers();
      return {
        user_staking_amount: transformUnit(user_staking_amount, tokenDecimal, 'on-chain-to-token'),
        min_days_stake: min_days_stake,
        penalty_withdraw: penalty_withdraw,
        min_amount_tier5: tier5.min_amount,
        tier1: tier1,
        tier2: tier2,
        tier3: tier3,
        tier4: tier4,
        tier5: tier5,
      };
    } catch (err) {
      return Promise.reject({ err });
    }
  };

  const getTokenDecimals = async (tokenAddress: PublicKey): Promise<number> => {
    setLoading(true);

    try {
      const { token_decimals } = await getTokenInfo(tokenAddress.toString());
      setLoading(false);
      return token_decimals;
    } catch (err) {
      setLoading(false);
      return Promise.reject({ err });
    }
  };

  const getUserTokenBalance = async (): Promise<number> => {
    if (!publicKey) {
      throw new WalletNotConnectedError();
    }

    const actions = new Actions(connection);

    try {
      const { exists, associatedAddress } = await actions.getAssociatedAccountInfo(
        publicKey,
        envConfig.ISOLA_TOKEN_ADDRESS,
      );

      if (!exists) {
        return 0;
      }

      const data = await connection.getTokenAccountBalance(associatedAddress);

      return data.value.uiAmount || 0;
    } catch (err) {
      return Promise.reject({ err });
    }
  };

  const getUserMaxContributeSize = async (pool: IPool, currLevel: number): Promise<number> => {
    if (!publicKey) {
      throw new WalletNotConnectedError();
    }

    const actions = new Actions(connection);
    let total: Decimal;
    let remain: Decimal;
    let availableSwap: Decimal;
    let totalMaxContributeSize: Decimal;
    let maxIndividualFCFSStakerAlloc: number = 0;

    setLoading(true);

    try {
      const data = await actions.readPool(new PublicKey(pool.contract_address));
      const poolResult = mappingPoolOnChainResponse(pool, data, now);
      total = new Decimal(poolResult.token_total_raise);
      remain = new Decimal(poolResult.token_total_raise).minus(poolResult.token_current_raise);

      if (
        poolResult.private_join_enabled &&
        moment.unix(now).isBetween(poolResult.private_join_start, poolResult.private_join_end)
      ) {
        totalMaxContributeSize = new Decimal(
          poolResult.campaign.early_join_phase.max_individual_alloc,
        );
      } else if (
        poolResult.exclusive_join_enable &&
        moment.unix(now).isBetween(poolResult.exclusive_join_start, poolResult.exclusive_join_end)
      ) {
        switch (currLevel) {
          case 1:
            totalMaxContributeSize = new Decimal(
              poolResult.campaign.exclusive_phase!.level1.max_individual_amount || 0,
            );
            maxIndividualFCFSStakerAlloc = new Decimal(
              poolResult.campaign.exclusive_phase!.level1.max_individual_amount || 0,
            ).toNumber();
            break;
          case 2:
            totalMaxContributeSize = new Decimal(
              poolResult.campaign.exclusive_phase!.level2.max_individual_amount || 0,
            );
            maxIndividualFCFSStakerAlloc = new Decimal(
              poolResult.campaign.exclusive_phase!.level2.max_individual_amount || 0,
            ).toNumber();
            break;
          case 3:
            totalMaxContributeSize = new Decimal(
              poolResult.campaign.exclusive_phase!.level3.max_individual_amount || 0,
            );
            maxIndividualFCFSStakerAlloc = new Decimal(
              poolResult.campaign.exclusive_phase!.level3.max_individual_amount || 0,
            ).toNumber();
            break;
          case 4:
            totalMaxContributeSize = new Decimal(
              poolResult.campaign.exclusive_phase!.level4.max_individual_amount || 0,
            );
            maxIndividualFCFSStakerAlloc = new Decimal(
              poolResult.campaign.exclusive_phase!.level4.max_individual_amount || 0,
            ).toNumber();
            break;
          case 5:
            totalMaxContributeSize = new Decimal(
              poolResult.campaign.exclusive_phase!.level5.max_individual_amount || 0,
            );
            maxIndividualFCFSStakerAlloc = new Decimal(
              poolResult.campaign.exclusive_phase!.level5.max_individual_amount || 0,
            ).toNumber();
            break;
          default:
            totalMaxContributeSize = new Decimal(0);
            maxIndividualFCFSStakerAlloc = 0;
            break;
        }
      } else if (
        poolResult.fcfs_join_for_staker_enabled &&
        moment
          .unix(now)
          .isBetween(poolResult.fcfs_join_for_staker_start, poolResult.fcfs_join_for_staker_end)
      ) {
        let multiplicationRate: number = 1;
        if (poolResult.campaign?.fcfs_stake_phase?.is_active) {
          multiplicationRate = poolResult.campaign!.fcfs_stake_phase!.multiplication_rate;
        }
        switch (currLevel) {
          case 1:
            maxIndividualFCFSStakerAlloc = new Decimal(
              poolResult.campaign.exclusive_phase!.level1.max_individual_amount || 0,
            ).toNumber();
            break;
          case 2:
            maxIndividualFCFSStakerAlloc = new Decimal(
              poolResult.campaign.exclusive_phase!.level2.max_individual_amount || 0,
            ).toNumber();
            break;
          case 3:
            maxIndividualFCFSStakerAlloc = new Decimal(
              poolResult.campaign.exclusive_phase!.level3.max_individual_amount || 0,
            ).toNumber();
            break;
          case 4:
            maxIndividualFCFSStakerAlloc = new Decimal(
              poolResult.campaign.exclusive_phase!.level4.max_individual_amount || 0,
            ).toNumber();
            break;
          case 5:
            maxIndividualFCFSStakerAlloc = new Decimal(
              poolResult.campaign.exclusive_phase!.level5.max_individual_amount || 0,
            ).toNumber();
            break;
          default:
            maxIndividualFCFSStakerAlloc = 0;
            break;
        }

        totalMaxContributeSize = new Decimal(maxIndividualFCFSStakerAlloc).times(
          multiplicationRate,
        );
      } else {
        totalMaxContributeSize = new Decimal(poolResult.campaign.public_phase.max_individual_alloc);
      }

      const { allocation } = await refreshAllocation(poolResult);
      availableSwap = new Decimal(total).minus(allocation || 0);

      setLoading(false);

      return Decimal.min(remain, availableSwap, totalMaxContributeSize)
        .dividedBy(pool.token_ratio)
        .toNumber();
    } catch (err) {
      setLoading(false);
      return Promise.reject({ err });
    }
  };

  const getUserAllocationLevel = async (pool: IPool): Promise<number> => {
    if (!publicKey) {
      throw new WalletNotConnectedError();
    }

    const actions = new Actions(connection);
    setLoading(true);

    try {
      const data = await actions.readStakeMember(publicKey);
      let level = 0;
      if (data && data.is_initialized) {
        if (
          data.level5.is_active &&
          moment(data.level5.active_at).isBefore(pool.campaign.exclusive_phase?.snapshot_at)
        ) {
          level = 5;
        } else if (
          data.level4.is_active &&
          moment(data.level4.active_at).isBefore(pool.campaign.exclusive_phase?.snapshot_at)
        ) {
          level = 4;
        } else if (
          data.level3.is_active &&
          moment(data.level3.active_at).isBefore(pool.campaign.exclusive_phase?.snapshot_at)
        ) {
          level = 3;
        } else if (
          data.level2.is_active &&
          moment(data.level2.active_at).isBefore(pool.campaign.exclusive_phase?.snapshot_at)
        ) {
          level = 2;
        } else if (
          data.level1.is_active &&
          moment(data.level1.active_at).isBefore(pool.campaign.exclusive_phase?.snapshot_at)
        ) {
          level = 1;
        } else {
          level = 0;
        }
      }

      setLoading(false);

      return level;
    } catch (err) {
      setLoading(false);
      return Promise.reject({ err });
    }
  };

  const refreshWalletBalance = async (): Promise<number | null> => {
    if (!publicKey) {
      throw new WalletNotConnectedError();
    }

    try {
      const accInfo = await connection.getAccountInfo(publicKey);
      if (accInfo && accInfo.lamports) {
        const balanceResult = transformLamportsToSOL(accInfo.lamports || 0);

        setAccountBalance(accInfo.lamports);

        return balanceResult;
      } else {
        return Promise.reject({ message: 'Account not found' });
      }
    } catch (err) {
      return Promise.reject({ err });
    }
  };

  const refreshAllocation = async (
    pool: IPool,
  ): Promise<{
    allocation: number | null;
    amountToken: number | null;
  }> => {
    if (!publicKey) {
      throw new WalletNotConnectedError();
    }

    const actions = new Actions(connection);
    setLoading(true);

    try {
      const data = await actions.readInvestorData(publicKey, new PublicKey(pool.contract_address));
      let result: {
        allocation: number | null;
        amountToken: number | null;
      } = {
        allocation: null,
        amountToken: null,
      };
      if (data) {
        const user_allocation = fakeWithClaimablePercentage(
          transformUnit(data.user_allocation, pool.token_decimals, 'on-chain-to-token'),
          pool.claimable_percentage,
        );

        const amount_token = fakeWithClaimablePercentage(
          transformUnit(data.amount_token_y, pool.token_decimals, 'on-chain-to-token'),
          pool.claimable_percentage,
        );

        result = {
          allocation: user_allocation,
          amountToken: amount_token,
        };
      }

      setLoading(false);

      return result;
    } catch (err) {
      setLoading(false);
      return Promise.reject({ err });
    }
  };

  const getUserVoteData = async (
    poolVoting: IPoolVoting,
  ): Promise<{
    isVoteUp: boolean;
    isVoteDown: boolean;
  }> => {
    if (!publicKey) {
      throw new WalletNotConnectedError();
    }

    const actions = new Actions(connection);
    setLoading(true);

    try {
      const userVoteData = await actions.getUserVoteData(
        publicKey,
        new PublicKey(poolVoting.contract_address),
      );
      setLoading(false);
      if (!userVoteData) {
        return {
          isVoteDown: false,
          isVoteUp: false,
        };
      }

      return {
        isVoteUp: userVoteData.is_vote_up,
        isVoteDown: userVoteData.is_vote_down,
      };
    } catch (err) {
      setLoading(false);
      return {
        isVoteDown: false,
        isVoteUp: false,
      };
    }
  };

  const userUpVote = async (poolVoting: IPoolVoting): Promise<string> => {
    if (!publicKey) {
      throw new WalletNotConnectedError();
    }

    let txId: string;
    const actions = new Actions(connection);
    setLoading(true);

    try {
      const userStakeData = await getUserStakeData();
      if (userStakeData.total_staked < poolVoting.voting_power_rate) {
        setLoading(false);
        return Promise.reject({
          message: `Please stake at least ${poolVoting.voting_power_rate} ISOLA to vote`,
        });
      }
      const userVoteData = await getUserVoteData(poolVoting);
      const { rawTx } = await actions.voteUp(
        publicKey,
        publicKey,
        new PublicKey(poolVoting.contract_address),
        !Boolean(userVoteData.isVoteUp),
      );
      txId = await parseAndSendTransaction(rawTx);

      const poolVotingFullInfo = await getPoolVotingFullInfo(poolVoting);
      await poolAPI.userVote(poolVoting.id, {
        total_vote_up: poolVotingFullInfo.voting_total_up,
        total_vote_down: poolVotingFullInfo.voting_total_down,
      });

      setLoading(false);

      return txId;
    } catch (err) {
      setLoading(false);
      return Promise.reject({ err });
    }
  };

  const userDownVote = async (poolVoting: IPoolVoting): Promise<string> => {
    if (!publicKey) {
      throw new WalletNotConnectedError();
    }

    let txId: string;
    const actions = new Actions(connection);
    setLoading(true);

    try {
      const userStakeData = await getUserStakeData();
      if (userStakeData.total_staked < poolVoting.voting_power_rate) {
        setLoading(false);
        return Promise.reject({
          message: `Please stake at least ${poolVoting.voting_power_rate} ISOLA to vote`,
        });
      }
      const userVoteData = await getUserVoteData(poolVoting);
      const { rawTx } = await actions.voteDown(
        publicKey,
        publicKey,
        new PublicKey(poolVoting.contract_address),
        !Boolean(userVoteData.isVoteUp),
      );
      txId = await parseAndSendTransaction(rawTx);

      const poolVotingFullInfo = await getPoolVotingFullInfo(poolVoting);
      await poolAPI.userVote(poolVoting.id, {
        total_vote_up: poolVotingFullInfo.voting_total_up,
        total_vote_down: poolVotingFullInfo.voting_total_down,
      });

      setLoading(false);

      return txId;
    } catch (err) {
      setLoading(false);
      return Promise.reject({ err });
    }
  };

  const getCommonSettings = async (
    version: number,
  ): Promise<{
    version: number;
    fees: number;
    admin: string;
    vote_setting: IVoteSetting;
  }> => {
    const actions = new Actions(connection);

    setLoading(true);
    try {
      const commonSettings = await actions.readCommonSettingByVersion(version);
      setLoading(false);
      return commonSettings;
    } catch (err) {
      setLoading(false);
      return Promise.reject({ err });
    }
  };

  const parseAndSendTransaction = async (rawTransaction: any): Promise<string> => {
    if (!publicKey || !signTransaction) {
      throw new WalletNotConnectedError();
    }

    const transactionBuffer = Buffer.from(rawTransaction, 'base64');
    const transaction = Transaction.from(transactionBuffer);
    const { blockhash } = await connection.getRecentBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = publicKey;

    const signed = await signTransaction(transaction);
    const txId = await connection.sendRawTransaction(signed.serialize(), {
      skipPreflight: false,
      preflightCommitment: 'recent',
    });
    await connection.confirmTransaction(txId);

    return txId;
  };

  return {
    loading,
    refreshWalletBalance,
    handleUserJoinPool,
    handleUserClaimToken,
    handleUserStake,
    handleUserUnStake,
    getParticipantAddress,
    getMaxAmountUserCanJoin,
    getMaxAmountUserCanStake,
    getMaxAmountUserCanUnStake,
    getUserStakeData,
    getUserTiersData,
    getTokenDecimals,
    getUserTokenBalance,
    getUserMaxContributeSize,
    getUserAllocationLevel,
    refreshAllocation,
    getUserVoteData,
    userUpVote,
    userDownVote,
    getCommonSettings,
  };
}

export default useSmartContract;
