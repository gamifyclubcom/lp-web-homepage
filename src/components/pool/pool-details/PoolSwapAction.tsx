import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import Decimal from 'decimal.js';
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
import MaxButton from '../../shared/MaxButton';
import AllocationLevel from './AllocationLevel';
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
  setSpinning: Dispatch<SetStateAction<boolean>>;
  setIsClaimed: Dispatch<SetStateAction<boolean>>;
  setAllocation: Dispatch<SetStateAction<number | null>>;
  setParticipants: Dispatch<SetStateAction<number>>;
  setProgress: Dispatch<SetStateAction<number>>;
  setTokenCurrentRaise: Dispatch<SetStateAction<number>>;
  setMaxContributeSize: Dispatch<SetStateAction<Decimal>>;
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
  setSpinning,
  setIsClaimed,
  setAllocation,
  setParticipants,
  setProgress,
  setTokenCurrentRaise,
  setMaxContributeSize,
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
    <div className="p-4">
      <div className="flex flex-col mb-4">
        <div className="flex items-center justify-between">
          <span className="text-xs text-white">Contribution Level</span>
          <AllocationLevel currLevel={contributionLevel} />
        </div>
        <span className="text-xs text-white">Swap Amount: {allocation}</span>
        <span className="text-xs text-white">
          Your guaranteed allocation for exclusive round: {guaranteedAllocationExclusiveRound}
        </span>
        <span className="text-xs text-white">
          Your current contribution: {currentContribution}/{maxAllocation}
        </span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-white">Balance</span>
          <span className="text-sm font-light text-white uppercase">{balance.formatted} SOL</span>
        </div>

        <div className="relative">
          <MaxButton isDisabled={!canSwap} onClick={handleGetMaxValueCanSwap} />
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
            className="flex-1 w-56 px-2 py-1 pl-16 pr-2 text-3xl font-medium text-right bg-transparent border border-gray-500 rounded-md text-secondary-400 focus:outline-none"
            disabled={!canSwap}
          />
        </div>
      </div>

      <div className="mt-4">
        <button
          onClick={handleContribute}
          className="hidden w-full h-12 text-lg font-semibold text-center text-white rounded-full bg-primary-400 lg:block"
        >
          {contributeButtonContent}
        </button>
      </div>
    </div>
  );
};

export default PoolSwapAction;
