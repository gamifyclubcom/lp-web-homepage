import { WalletNotConnectedError } from '@solana/wallet-adapter-base';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Transaction } from '@solana/web3.js';
import Decimal from 'decimal.js';
import { IPool } from '../sdk/pool/interface';
import { ERROR_MESSAGES } from '../utils/constants';
import { transformLamportsToSOL } from '../utils/helper';

function useSmartContract() {
  const { connection } = useConnection();
  const { publicKey, signTransaction } = useWallet();

  const handleUserJoinPool = (pool: IPool, amount: number): Promise<string> => {
    return new Promise(async (resolve, reject) => {
      if (!publicKey) {
        throw new WalletNotConnectedError()
      }

      const actions = new Actions(connection);
        const smActions = new SmartContractActions(connection, wallet);
        const walletAddress = wallet!.publicKey!;

        setLoading(true);
        if (
          pool.private_join_enabled &&
          moment
            .unix(now)
            .isBetween(pool.private_join_start, pool.private_join_end)
        ) {
          await handleCloseWrapAccount();
          return actions
            .earlyJoin(
              walletAddress,
              walletAddress,
              new PublicKey(pool.contract_address),
              amount
            )
            .then(({ rawTx }) => {
              return smActions.parseAndSendTransaction(rawTx);
            })
            .then(txId => {
              resolve(txId.toString());
            })
            .catch(err => {
              const error = handleTransactionErrors(err);
              if (error === Errors.TransactionCancelled) {
                reject({ message: error.message });
              } else {
                reject({ message: 'Error while early join pool' });
              }
            })
            .finally(() => {
              setLoading(false);
            });
        } else if (
          pool.exclusive_join_enable &&
          moment
            .unix(now)
            .isBetween(pool.exclusive_join_start, pool.exclusive_join_end)
        ) {
          await handleCloseWrapAccount();
          return actions
            .exclusiveJoin(
              walletAddress,
              walletAddress,
              new PublicKey(pool.contract_address),
              amount
            )
            .then(({ rawTx, txFee }) => {
              return smActions.parseAndSendTransaction(rawTx);
            })
            .then(txId => {
              resolve(txId.toString());
            })
            .catch(err => {
              const error = handleTransactionErrors(err);
              if (error === Errors.TransactionCancelled) {
                reject({ message: error.message });
              } else {
                reject({ message: 'Error while exclusive join pool' });
              }
            })
            .finally(() => {
              setLoading(false);
            });
        } else if (
          pool.fcfs_join_for_staker_enabled &&
          moment
            .unix(now)
            .isBetween(
              pool.fcfs_join_for_staker_start,
              pool.fcfs_join_for_staker_end
            )
        ) {
          await handleCloseWrapAccount();
          return actions
            .fcfsStakeJoin(
              walletAddress,
              walletAddress,
              new PublicKey(pool.contract_address),
              amount
            )
            .then(({ rawTx }) => {
              return smActions.parseAndSendTransaction(rawTx);
            })
            .then(txId => {
              resolve(txId.toString());
            })
            .catch(err => {
              const error = handleTransactionErrors(err);
              if (error === Errors.TransactionCancelled) {
                reject({ message: error.message });
              } else {
                reject({ message: 'Error while fcfs staker join pool' });
              }
            })
            .finally(() => {
              setLoading(false);
            });
        } else if (
          pool.public_join_enabled &&
          moment
            .unix(now)
            .isBetween(pool.public_join_start, pool.public_join_end)
        ) {
          await handleCloseWrapAccount();
          return actions
            .join(
              walletAddress,
              walletAddress,
              new PublicKey(pool.contract_address),
              amount
            )
            .then(({ rawTx, txFee }) => {
              return smActions.parseAndSendTransaction(rawTx);
            })
            .then(txId => {
              resolve(txId.toString());
            })
            .catch(err => {
              const error = handleTransactionErrors(err);
              if (error === Errors.TransactionCancelled) {
                reject({ message: error.message });
              } else {
                reject({ message: 'Error while public join pool' });
              }
            })
            .finally(() => {
              setLoading(false);
            });
        }

        reject({ message: 'Join pool not available' });
    });
  };

  const handleCloseWrapAccount = async () => {
    const actions = new Actions(connection);
    const smActions = new SmartContractActions(connection, wallet);
    const walletAddress = wallet!.publicKey!;
    if (connected) {
      const res = await actions.closeAssociatedTokenAccount(
        walletAddress,
        walletAddress
      );
      if (res.needClose) {
        await smActions.sendAndConfirmTransaction(res.transaction!);
      }
    } else {
      throw new Error(ERROR_MESSAGES.WALLET_NOT_CONNECT);
    }
  };

  const handleUserClaimToken = (
    poolContractAccount: PublicKey
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (connected) {
        const actions = new Actions(connection);
        const smActions = new SmartContractActions(connection, wallet);
        const walletAddress = wallet!.publicKey!;

        setLoading(true);
        return actions
          .claimToken(walletAddress, walletAddress, poolContractAccount)
          .then(({ rawTx }) => {
            return smActions.parseAndSendTransaction(rawTx);
          })
          .then(txId => {
            resolve(txId);
          })
          .catch(err => {
            const error = handleTransactionErrors(err);
            if (error === Errors.TransactionCancelled) {
              reject({ message: error.message });
            } else {
              reject({ message: 'Error while claim token' });
            }
          })
          .finally(() => {
            setLoading(false);
          });
      } else {
        reject({ message: ERROR_MESSAGES.WALLET_NOT_CONNECT });
      }
    });
  };

  const handleUserStake = (amount: number): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (connected) {
        const actions = new Actions(connection);
        const smActions = new SmartContractActions(connection, wallet);
        const walletAddress = wallet!.publicKey!;

        setLoading(true);
        actions
          .stake(walletAddress, walletAddress, amount)
          .then(({ rawTx }) => {
            return smActions.parseAndSendTransaction(rawTx);
          })
          .then(txId => {
            resolve(txId.toString());
          })
          .catch(err => {
            const error = handleTransactionErrors(err);
            if (error === Errors.TransactionCancelled) {
              reject({ message: error.message });
            } else {
              reject({ message: 'Error while stake ISOLA token' });
            }
          })
          .finally(() => {
            setLoading(false);
          });
      } else {
        reject({ message: ERROR_MESSAGES.WALLET_NOT_CONNECT });
      }
    });
  };

  const handleUserUnStake = (amount: number): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (connected) {
        const actions = new Actions(connection);
        const smActions = new SmartContractActions(connection, wallet);
        const walletAddress = wallet!.publicKey!;

        setLoading(true);
        actions
          .unstake(walletAddress, walletAddress, amount)
          .then(({ rawTx }) => {
            return smActions.parseAndSendTransaction(rawTx);
          })
          .then(txId => {
            resolve(txId);
          })
          .catch(err => {
            const error = handleTransactionErrors(err);
            if (error === Errors.TransactionCancelled) {
              reject({ message: error.message });
            } else {
              reject({ message: 'Error while unStake ISOLA' });
            }
          })
          .finally(() => {
            setLoading(false);
          });
      } else {
        reject({ message: ERROR_MESSAGES.WALLET_NOT_CONNECT });
      }
    });
  };

  const getParticipantAddress = async (
    poolAddress: PublicKey
  ): Promise<{
    accountDataWithSeed: PublicKey;
    exists: boolean;
  }> => {
    return new Promise((resolve, reject) => {
      if (connected) {
        const actions = new Actions(connection);
        const walletAddress = wallet!.publicKey!;

        setLoading(true);
        actions
          .getPoolAssociatedAccountInfo(walletAddress, poolAddress)
          .then(data => {
            resolve({
              accountDataWithSeed: data.associatedAddress,
              exists: data.exists,
            });
          })
          .catch(err => {
            if (!err.message || err.message !== 'Transaction cancelled') {
              reject({
                message: 'Can not get participants address',
                err,
              });
            }
          })
          .finally(() => {
            setLoading(false);
          });
      } else {
        reject({ message: ERROR_MESSAGES.WALLET_NOT_CONNECT });
      }
    });
  };

  const getMaxAmountUserCanJoin = async (poolAddress: string) => {
    setLoading(true);
    const actions = new Actions(connection);
    const walletAddress = wallet!.publicKey!;

    try {
      const amount = await actions.getMaxJoinAmount(
        walletAddress,
        new PublicKey(poolAddress)
      );
      setLoading(false);
      return amount;
    } catch (e) {
      console.log(e);
      setLoading(false);
      return 0;
    }
  };

  const getMaxAmountUserCanStake = (tokenDecimal: number): Promise<number> => {
    setLoading(true);
    return getUserTokenBalance(envConfig.ISOLA_TOKEN_ADDRESS)
      .then(data => {
        return Promise.resolve(data);
      })
      .catch(err => {
        console.log({ err });
        return Promise.reject({
          message: 'Can not get max amount user can stake',
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const getMaxAmountUserCanUnStake = (): Promise<number> => {
    setLoading(true);
    return getUserStakeData()
      .then(data => {
        return Promise.resolve(data.total_staked);
      })
      .catch(err => {
        console.log({ err });
        return Promise.reject({
          message: 'Can not get max amount user can unStake',
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const getUserStakeData = async (): Promise<{
    allocation_level: number;
    total_staked: number;
    start_staked: number; // Start stake time in unix
  }> => {
    return new Promise((resolve, reject) => {
      if (connected) {
        const actions = new Actions(connection);
        const walletAddress = wallet!.publicKey!;

        setLoading(true);
        actions
          .readStakeMember(walletAddress)
          .then(data => {
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

              resolve({
                allocation_level: level,
                total_staked: data.amount,
                start_staked,
              });
            } else {
              resolve({
                allocation_level: 0,
                total_staked: 0,
                start_staked: 0,
              });
            }
          })
          .catch(err => {
            console.log({ err });
            reject({ message: 'Can not fetch user allocation level' });
          })
          .finally(() => {
            setLoading(false);
          });
      } else {
        reject({ message: ERROR_MESSAGES.WALLET_NOT_CONNECT });
      }
    });
  };

  const getUserTiersData = async (
    tokenDecimal: number
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
    return new Promise((resolve, reject) => {
      if (connected) {
        const actions = new Actions(connection);

        setLoading(true);
        actions
          .readTiers()
          .then(data => {
            const userStakingAmount = transformUnit(
              data.user_staking_amount,
              tokenDecimal,
              'on-chain-to-token'
            );

            resolve({
              user_staking_amount: userStakingAmount,
              min_days_stake: data.min_days_stake,
              penalty_withdraw: data.penalty_withdraw,
              min_amount_tier5: data.tier5.min_amount,
              tier1: data.tier1,
              tier2: data.tier2,
              tier3: data.tier3,
              tier4: data.tier4,
              tier5: data.tier5,
            });
          })
          .catch(err => {
            console.log({ err });
            reject({ message: 'Can not fetch user allocation level' });
          })
          .finally(() => {
            setLoading(false);
          });
      } else {
        reject({ message: ERROR_MESSAGES.WALLET_NOT_CONNECT });
      }
    });
  };

  const getTokenDecimals = (tokenAddress: PublicKey): Promise<number> => {
    setLoading(true);
    return getTokenInfo(tokenAddress.toString())
      .then(data => {
        return Promise.resolve(data.token_decimals);
      })
      .catch(err => {
        console.log({ err });
        return Promise.reject({ message: 'Can not get token decimals' });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const getUserTokenBalance = (tokenAddress: PublicKey): Promise<number> => {
    return new Promise((resolve, reject) => {
      if (connected) {
        const actions = new Actions(connection);
        const walletAddress = wallet!.publicKey!;

        actions
          .getAssociatedAccountInfo(
            walletAddress,
            envConfig.ISOLA_TOKEN_ADDRESS
          )
          .then(data => {
            if (!data.exists) {
              resolve(0);
            } else {
              return connection
                .getTokenAccountBalance(data.associatedAddress)
                .then(data => {
                  resolve(data.value.uiAmount || 0);
                });
            }
          });
      } else {
        reject({ message: ERROR_MESSAGES.WALLET_NOT_CONNECT });
      }
    });
  };

  const getUserMaxContributeSize = (
    pool: IPool,
    currLevel: number
  ): Promise<number> => {
    return new Promise((resolve, reject) => {
      if (connected) {
        const actions = new Actions(connection);
        let total: Decimal;
        let remain: Decimal;
        let availableSwap: Decimal;
        let totalMaxContributeSize: Decimal;
        let maxIndividualFCFSStakerAlloc: number = 0;

        actions
          .readPool(new PublicKey(pool.contract_address))
          .then(data => {
            const poolResult = mappingPoolOnChainResponse(pool, data, now);
            total = new Decimal(poolResult.token_total_raise);
            remain = new Decimal(poolResult.token_total_raise).minus(
              poolResult.token_current_raise
            );

            if (
              poolResult.private_join_enabled &&
              moment
                .unix(now)
                .isBetween(
                  poolResult.private_join_start,
                  poolResult.private_join_end
                )
            ) {
              totalMaxContributeSize = new Decimal(
                poolResult.campaign.early_join_phase.max_individual_alloc
              );
            } else if (
              poolResult.exclusive_join_enable &&
              moment
                .unix(now)
                .isBetween(
                  poolResult.exclusive_join_start,
                  poolResult.exclusive_join_end
                )
            ) {
              switch (currLevel) {
                case 1:
                  totalMaxContributeSize = new Decimal(
                    poolResult.campaign.exclusive_phase!.level1
                      .max_individual_amount || 0
                  );
                  maxIndividualFCFSStakerAlloc = new Decimal(
                    poolResult.campaign.exclusive_phase!.level1
                      .max_individual_amount || 0
                  ).toNumber();
                  break;
                case 2:
                  totalMaxContributeSize = new Decimal(
                    poolResult.campaign.exclusive_phase!.level2
                      .max_individual_amount || 0
                  );
                  maxIndividualFCFSStakerAlloc = new Decimal(
                    poolResult.campaign.exclusive_phase!.level2
                      .max_individual_amount || 0
                  ).toNumber();
                  break;
                case 3:
                  totalMaxContributeSize = new Decimal(
                    poolResult.campaign.exclusive_phase!.level3
                      .max_individual_amount || 0
                  );
                  maxIndividualFCFSStakerAlloc = new Decimal(
                    poolResult.campaign.exclusive_phase!.level3
                      .max_individual_amount || 0
                  ).toNumber();
                  break;
                case 4:
                  totalMaxContributeSize = new Decimal(
                    poolResult.campaign.exclusive_phase!.level4
                      .max_individual_amount || 0
                  );
                  maxIndividualFCFSStakerAlloc = new Decimal(
                    poolResult.campaign.exclusive_phase!.level4
                      .max_individual_amount || 0
                  ).toNumber();
                  break;
                case 5:
                  totalMaxContributeSize = new Decimal(
                    poolResult.campaign.exclusive_phase!.level5
                      .max_individual_amount || 0
                  );
                  maxIndividualFCFSStakerAlloc = new Decimal(
                    poolResult.campaign.exclusive_phase!.level5
                      .max_individual_amount || 0
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
                .isBetween(
                  poolResult.fcfs_join_for_staker_start,
                  poolResult.fcfs_join_for_staker_end
                )
            ) {
              let multiplicationRate: number = 1;
              if (poolResult.campaign?.fcfs_stake_phase?.is_active) {
                multiplicationRate =
                  poolResult.campaign!.fcfs_stake_phase!.multiplication_rate;
              }
              switch (currLevel) {
                case 1:
                  maxIndividualFCFSStakerAlloc = new Decimal(
                    poolResult.campaign.exclusive_phase!.level1
                      .max_individual_amount || 0
                  ).toNumber();
                  break;
                case 2:
                  maxIndividualFCFSStakerAlloc = new Decimal(
                    poolResult.campaign.exclusive_phase!.level2
                      .max_individual_amount || 0
                  ).toNumber();
                  break;
                case 3:
                  maxIndividualFCFSStakerAlloc = new Decimal(
                    poolResult.campaign.exclusive_phase!.level3
                      .max_individual_amount || 0
                  ).toNumber();
                  break;
                case 4:
                  maxIndividualFCFSStakerAlloc = new Decimal(
                    poolResult.campaign.exclusive_phase!.level4
                      .max_individual_amount || 0
                  ).toNumber();
                  break;
                case 5:
                  maxIndividualFCFSStakerAlloc = new Decimal(
                    poolResult.campaign.exclusive_phase!.level5
                      .max_individual_amount || 0
                  ).toNumber();
                  break;
                default:
                  maxIndividualFCFSStakerAlloc = 0;
                  break;
              }

              totalMaxContributeSize = new Decimal(
                maxIndividualFCFSStakerAlloc
              ).times(multiplicationRate);
            } else {
              totalMaxContributeSize = new Decimal(
                poolResult.campaign.public_phase.max_individual_alloc
              );
            }

            return refreshAllocation(poolResult);
          })
          .then(data => {
            availableSwap = new Decimal(total).minus(data.allocation || 0);
            resolve(
              Decimal.min(remain, availableSwap, totalMaxContributeSize)
                .dividedBy(pool.token_ratio)
                .toNumber()
            );
          });
      } else {
        reject({ message: ERROR_MESSAGES.WALLET_NOT_CONNECT });
      }
    });
  };

  const getUserAllocationLevel = (pool: IPool): Promise<number> => {
    return new Promise((resolve, reject) => {
      if (connected) {
        const actions = new Actions(connection);
        const walletAddress = wallet!.publicKey!;

        setLoading(true);
        actions
          .readStakeMember(walletAddress)
          .then(data => {
            if (data && data.is_initialized) {
              let level = 0;
              if (
                data.level5.is_active &&
                moment(data.level5.active_at).isBefore(
                  pool.campaign.exclusive_phase?.snapshot_at
                )
              ) {
                level = 5;
              } else if (
                data.level4.is_active &&
                moment(data.level4.active_at).isBefore(
                  pool.campaign.exclusive_phase?.snapshot_at
                )
              ) {
                level = 4;
              } else if (
                data.level3.is_active &&
                moment(data.level3.active_at).isBefore(
                  pool.campaign.exclusive_phase?.snapshot_at
                )
              ) {
                level = 3;
              } else if (
                data.level2.is_active &&
                moment(data.level2.active_at).isBefore(
                  pool.campaign.exclusive_phase?.snapshot_at
                )
              ) {
                level = 2;
              } else if (
                data.level1.is_active &&
                moment(data.level1.active_at).isBefore(
                  pool.campaign.exclusive_phase?.snapshot_at
                )
              ) {
                level = 1;
              } else {
                level = 0;
              }

              resolve(level);
            } else {
              resolve(0);
            }
          })
          .catch(err => {
            console.log({ err });
            reject({ message: 'Can not fetch user allocation level' });
          })
          .finally(() => {
            setLoading(false);
          });
      } else {
        reject({ message: ERROR_MESSAGES.WALLET_NOT_CONNECT });
      }
    });
  };

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
    })
    await connection.confirmTransaction(txId);

    return txId;
  };

  return {
    refreshWalletBalance,
  };
}

export default useSmartContract;
