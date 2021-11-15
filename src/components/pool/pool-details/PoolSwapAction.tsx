import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import clsx from 'clsx';
import Decimal from 'decimal.js';
import moment from 'moment';
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react';
import { confirmAlert } from 'react-confirm-alert';
import NumberFormat from 'react-number-format';
import { useAlert } from '../../../hooks/useAlert';
import { useGlobal } from '../../../hooks/useGlobal';
import { usePool } from '../../../hooks/usePool';
import useSmartContract from '../../../hooks/useSmartContract';
import { poolAPI } from '../../../sdk/pool';
import { IPool, IPoolStatus } from '../../../sdk/pool/interface';
import { PoolStatusType } from '../../../shared/enum';
import { TOKEN_TO_DECIMALS } from '../../../utils/constants';
import { isEmpty, isInWhitelistRound, roundNumberByDecimal } from '../../../utils/helper';
import BalanceBadge from '../../shared/BalanceBadge';
import MaxButton from '../../shared/MaxButton';
import PoolCardTitle from '../../shared/pool/PoolCardTitle';
import ConfirmJoinModal from './modals/ConfirmJoinModal';
import JoinPoolSuccessModal from './modals/JoinPoolSuccessModal';

interface Props {
  contributionLevel: number;
  guaranteedAllocationExclusiveRound: number;
  maxAllocation: number;
  currentContribution: number;
  allocation: number;
  status: IPoolStatus;
  spinning: boolean;
  pool: IPool;
  participantAddress: string | null;
  allocationLevel: number;
  maxContributeSize: number;
  currentSwap: number;
  joinPoolDates: string[];
  allowContribute: boolean;
  setSpinning: Dispatch<SetStateAction<boolean>>;
  setIsClaimed: Dispatch<SetStateAction<boolean>>;
  setAllocation: Dispatch<SetStateAction<number | null>>;
  setParticipants: Dispatch<SetStateAction<number>>;
  setProgress: Dispatch<SetStateAction<number>>;
  setTokenCurrentRaise: Dispatch<SetStateAction<number>>;
  setMaxContributeSize: Dispatch<SetStateAction<Decimal>>;
  setJoinPoolDates: Dispatch<SetStateAction<string[]>>;
}

const PoolSwapAction: React.FC<Props> = ({
  contributionLevel,
  guaranteedAllocationExclusiveRound,
  maxAllocation,
  currentContribution,
  allocation,
  status,
  spinning,
  pool,
  participantAddress,
  allocationLevel,
  maxContributeSize,
  currentSwap,
  joinPoolDates,
  allowContribute,
  setSpinning,
  setIsClaimed,
  setAllocation,
  setParticipants,
  setProgress,
  setTokenCurrentRaise,
  setMaxContributeSize,
  setJoinPoolDates,
}) => {
  const { connection } = useConnection();
  const { now, balance, setAccountBalance } = useGlobal();
  const { alertSuccess, alertError } = useAlert();
  const {
    refreshWalletBalance,
    refreshAllocation,
    getMaxAmountUserCanJoin,
    getUserMaxContributeSize,
    handleUserJoinPool,
  } = useSmartContract();
  const { getPoolFullInfo } = usePool();
  const { connected, publicKey } = useWallet();
  const { setVisible } = useWalletModal();
  const [amountSwap, setAmountSwap] = useState<{
    value: Decimal;
    formatted: string;
  }>({
    value: new Decimal(0),
    formatted: '0',
  });
  const contributeButtonContent = useMemo(() => {
    if (!connected) {
      return 'Connect Wallet';
    } else {
      return 'Contribute';
    }
  }, [connected]);
  const tokenLeft = useMemo(() => {
    return parseFloat(
      new Decimal(pool.token_total_raise)
        .minus(currentSwap)
        .dividedBy(pool.token_ratio)
        .toFixed(TOKEN_TO_DECIMALS),
    );
  }, [currentSwap, pool.token_total_raise, pool.token_ratio]);

  useEffect(() => {
    const initBalance = async () => {
      try {
        await refreshWalletBalance();
      } catch (err) {
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

  const canSwap = useMemo(() => {
    return [PoolStatusType.OPEN, PoolStatusType.FILLED].includes(status.type);
  }, [status.type]);

  const handleGetMaxValueCanSwap = async () => {
    setSpinning(true);
    try {
      const amount = await getMaxAmountUserCanJoin(pool.contract_address);
      setSpinning(false);

      setAmountSwap({
        value: roundNumberByDecimal(amount.toString(), pool.token_decimals),
        formatted: amount.toString(),
      });
    } catch (err) {
      setAmountSwap({
        value: new Decimal(0),
        formatted: '0',
      });
      setSpinning(false);
    }
  };

  const confirmJoin = () => {
    if (amountSwap.value.toNumber() <= 0) {
      alertError('Please enter a greater amount');
    } else if (amountSwap.value.greaterThan(maxContributeSize)) {
      alertError(
        `Please enter a smaller amount. You enter ${amountSwap.value.toNumber()} ${
          pool.token_to
        }. Your available is ${maxContributeSize.toFixed(TOKEN_TO_DECIMALS)} ${pool.token_to}`,
      );
    } else if (isInWhitelistRound(pool, now) && !Boolean(participantAddress)) {
      alertError('You are not whitelisted. Please wait for the FCFS round.');
    } else {
      confirmAlert({
        customUI: ({ onClose }) => {
          return (
            <ConfirmJoinModal
              onClose={onClose}
              onConfirm={handleJoin}
              swapRatio={pool.token_ratio}
              amountSwap={amountSwap.value.toNumber()}
              mintFrom="SOL"
              mintTo={pool.token_symbol}
              loading={spinning}
              tokenDecimals={pool.token_decimals}
              claimable_percentage={pool.claimable_percentage}
            />
          );
        },
      });
    }
  };

  const handleJoin = async () => {
    let txId: string;
    setSpinning(true);

    try {
      let walletBalance = await refreshWalletBalance();
      if (amountSwap.value.toNumber() >= walletBalance!) {
        alertError('Your SOL balance is not enough.');
        setSpinning(false);
        return;
      }

      let poolFullInfo = await getPoolFullInfo(pool);
      const tokenAvailable = new Decimal(poolFullInfo.token_total_raise)
        .minus(poolFullInfo.token_current_raise)
        .dividedBy(poolFullInfo.token_ratio);
      if (new Decimal(tokenAvailable).lessThan(amountSwap.value)) {
        alertError(
          `Please enter a smaller amount. You enter ${amountSwap.value.toNumber()} ${
            pool.token_to
          }. Pool token available is ${tokenAvailable.toNumber().toFixed(TOKEN_TO_DECIMALS)} ${
            pool.token_to
          }`,
        );
        setSpinning(false);
        return;
      }

      const maxAmountCanJoin = await getMaxAmountUserCanJoin(pool.contract_address);
      if (amountSwap.value.greaterThan(maxAmountCanJoin)) {
        alertError(
          `Please enter a smaller amount. You enter ${amountSwap.value.toNumber()}. Your max contribution is ${maxAmountCanJoin}`,
        );
        setSpinning(false);
        return;
      }

      await poolAPI.userJoinPool(
        publicKey!.toString(),
        pool.contract_address,
        amountSwap.value.toNumber(),
        participantAddress || undefined,
      );
      txId = await handleUserJoinPool(pool, amountSwap.value.toNumber());

      walletBalance = await refreshWalletBalance();

      const { allocation: newAllocation, amountToken } = await refreshAllocation(pool);
      if (newAllocation && newAllocation > 0 && amountToken === 0) {
        setIsClaimed(true);
      }
      setAllocation(newAllocation);
      poolFullInfo = await getPoolFullInfo(pool);
      setTokenCurrentRaise(poolFullInfo.token_current_raise);
      setProgress(poolFullInfo.progress);
      setParticipants(poolFullInfo.participants);

      const newMaxContributeSize = await getUserMaxContributeSize(pool, allocationLevel);
      setMaxContributeSize(new Decimal(newMaxContributeSize));

      const newUserJoinPoolHistories = await poolAPI.getUserJoinPoolHistory(
        publicKey!.toString(),
        pool.contract_address.toString(),
      );
      setJoinPoolDates(newUserJoinPoolHistories);

      setAmountSwap({
        value: new Decimal(0),
        formatted: '0',
      });

      setSpinning(false);

      confirmAlert({
        customUI: ({ onClose }) => {
          return (
            <JoinPoolSuccessModal
              connection={connection}
              onClose={onClose}
              amountSwap={amountSwap.value.toNumber()}
              ratio={pool.token_ratio}
              txId={txId}
              mintFrom={pool.token_to}
              mintTo={pool.token_symbol}
              tokenDecimals={pool.token_decimals}
              claimable_percentage={pool.claimable_percentage}
            />
          );
        },
      });
      alertSuccess('User swap amount success!');
    } catch (err) {
      setAmountSwap({
        value: new Decimal(0),
        formatted: '0',
      });

      setSpinning(false);
      alertError((err as any).message);
    }
  };

  const handleContribute = async () => {
    if (!connected) {
      setVisible(true);
    } else {
      confirmJoin();
    }
  };

  return (
    <div className="w-full">
      <div className="grid grid-cols-2 gap-4">
        <div className="w-full col-span-2 p-4 pr-0 md:col-span-1">
          <div className="w-full">
            <div className="mb-4">
              <PoolCardTitle title="swap tokens" />
            </div>
            <div className="flex items-center my-2">
              <span className="w-40 text-sm font-semibold text-white opacity-30">
                Max Allocation
              </span>
              <BalanceBadge
                variant="basic"
                price={maxAllocation}
                mint={pool.token_to}
                className="text-sm font-light text-white"
              />
            </div>
            <div className="flex items-center my-2">
              <span className="w-40 text-sm font-semibold text-white opacity-30">Have Bought</span>
              <BalanceBadge
                variant="basic"
                price={currentContribution}
                mint={pool.token_to}
                className="text-sm font-light text-white"
              />
            </div>
            <div className="flex items-center my-2">
              <span className="w-40 text-sm font-semibold text-white opacity-30">Remaining</span>
              <BalanceBadge
                variant="basic"
                price={tokenLeft}
                mint={pool.token_to}
                className="text-sm font-light text-white"
              />
            </div>
            <div className="flex items-start my-2">
              <span className="w-40 text-sm font-semibold text-white opacity-30">Buy times</span>
              <ul className="flex flex-col">
                {joinPoolDates.map((item, index) => (
                  <li key={`${item}__${index}`}>
                    <span className="text-sm font-light text-white">
                      {moment.utc(item).format('ddd MMM DD, YYYY LT')} (UTC)
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="w-full col-span-2 p-4 md:col-span-1">
          <div className="flex items-center justify-between w-full mb-1">
            <span className="text-sm text-white">Your Wallet Balance</span>
            <BalanceBadge
              variant="basic"
              mint={pool.token_to}
              price={balance.value || 0}
              className="text-sm font-semibold uppercase text-pool_focus_1"
            />
          </div>

          <div className="relative w-full mb-8">
            <MaxButton isDisabled={!canSwap} onClick={handleGetMaxValueCanSwap} />
            <span className="absolute flex items-center justify-center h-full font-semibold text-white uppercase right-20">
              {pool.token_to}
            </span>
            <NumberFormat
              thousandSeparator={true}
              value={amountSwap.value.toNumber()}
              onValueChange={(values) => {
                const { formattedValue, value } = values;
                if (!isEmpty(value)) {
                  setAmountSwap({
                    value: new Decimal(value),
                    formatted: formattedValue,
                  });
                } else {
                  setAmountSwap({
                    value: new Decimal(0),
                    formatted: '0',
                  });
                }
              }}
              onFocus={(e) => e.target.select()}
              className="flex-1 w-full px-2 py-1 pl-2 pr-32 text-3xl font-medium bg-transparent border border-gray-500 rounded-md text-pool_focus_1 focus:outline-none"
              disabled={!canSwap}
            />
          </div>

          <div>
            <h6 className="mb-2 text-sm font-semibold text-white">You will get approximately</h6>
            <BalanceBadge
              variant="basic"
              mint={pool.token_symbol}
              price={parseFloat(
                new Decimal(amountSwap.value).times(pool.token_ratio).toFixed(pool.token_decimals),
              )}
              className="text-lg font-semibold text-pool_focus_1"
            />
          </div>

          <div className="flex items-center justify-center w-full mt-8">
            {allowContribute && (
              <button
                onClick={handleContribute}
                className={clsx(
                  'hidden w-64 h-12 text-sm text-center text-white rounded-full bg-secondary-500 lg:block',
                  {
                    'bg-secondary-600': !canSwap,
                  },
                )}
                disabled={!canSwap}
              >
                {contributeButtonContent}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PoolSwapAction;
