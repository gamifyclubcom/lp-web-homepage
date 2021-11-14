import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { PublicKey } from '@solana/web3.js';
import clsx from 'clsx';
import Decimal from 'decimal.js';
import moment from 'moment';
import React, { Dispatch, SetStateAction, useMemo } from 'react';
import { confirmAlert } from 'react-confirm-alert';
import { AiOutlineCheck } from 'react-icons/ai';
import NumberFormat from 'react-number-format';
import { useAlert } from '../../../hooks/useAlert';
import { useGlobal } from '../../../hooks/useGlobal';
import { usePool } from '../../../hooks/usePool';
import useSmartContract from '../../../hooks/useSmartContract';
import { poolAPI } from '../../../sdk/pool';
import { IPool, IPoolStatus } from '../../../sdk/pool/interface';
import { PoolStatusType } from '../../../shared/enum';
import { renderTokenBalance } from '../../../utils/helper';
import BalanceBadge from '../../shared/BalanceBadge';
import PoolCardTitle from '../../shared/pool/PoolCardTitle';
import PoolClaimProgressBar from '../../shared/pool/PoolClaimProgressBar';
import ClaimSuccessModal from './modals/ClaimSuccessModal';
import ConfirmClaimTokenModal from './modals/ConfirmClaimTokenModal';

interface Props {
  status: IPoolStatus;
  loading: boolean;
  isClaimed: boolean;
  userClaimedAt?: Date | string;
  pool: IPool;
  spinning: boolean;
  userAllocation: number | null;
  setSpinning: Dispatch<SetStateAction<boolean>>;
  setIsClaimed: Dispatch<SetStateAction<boolean>>;
  setParticipants: Dispatch<SetStateAction<number>>;
  setProgress: Dispatch<SetStateAction<number>>;
  setTokenCurrentRaise: Dispatch<SetStateAction<number>>;
  setUserClaimedAt: Dispatch<SetStateAction<string | undefined>>;
}

const SecuredAllocation: React.FC<Props> = ({
  status,
  loading,
  isClaimed,
  userClaimedAt,
  pool,
  spinning,
  userAllocation,
  setSpinning,
  setIsClaimed,
  setTokenCurrentRaise,
  setParticipants,
  setProgress,
  setUserClaimedAt,
}) => {
  const { now } = useGlobal();
  const { alertSuccess, alertError } = useAlert();
  const { handleUserClaimToken, refreshAllocation, refreshWalletBalance } = useSmartContract();
  const { getPoolFullInfo } = usePool();
  const { publicKey, connected } = useWallet();
  const { setVisible } = useWalletModal();
  const { connection } = useConnection();
  const tokenBalanceMarkup = renderTokenBalance(userAllocation, pool.token_decimals);
  const tokenBalanceClaimableMarkup = renderTokenBalance(
    new Decimal(userAllocation || 0).times(pool.claimable_percentage).dividedBy(100),
    pool.token_decimals,
  );
  const claimTokenProgress = useMemo(() => {
    if (isClaimed) {
      return 100;
    }

    return 0;
  }, [isClaimed]);

  const claimContent = useMemo(() => {
    if (!connected) {
      return 'Connect Wallet';
    } else {
      return 'Claim Tokens';
    }
  }, [connected]);

  const canClaim = useMemo(() => {
    return moment.unix(now).isAfter(pool.claim_at) && !isClaimed;
  }, [isClaimed, now, pool.claim_at]);

  const handleClaimToken = async () => {
    let txId: string;
    let amountToken: number;

    setSpinning(true);

    try {
      txId = await handleUserClaimToken(new PublicKey(pool.contract_address));
      const { allocation: newAllocation, amountToken: newAmountToken } = await refreshAllocation(
        pool,
      );
      if (newAllocation && newAllocation > 0 && newAmountToken === 0) {
        setIsClaimed(true);
      }
      amountToken = newAllocation || 0;

      const poolFullInfo = await getPoolFullInfo(pool);
      setTokenCurrentRaise(poolFullInfo.token_current_raise);
      setProgress(poolFullInfo.progress);
      setParticipants(poolFullInfo.participants);
      setIsClaimed(true);

      const userClaimTokenResponse = await poolAPI.userClaimToken(
        publicKey!.toString(),
        pool.contract_address,
        pool.token_address,
      );
      setUserClaimedAt(userClaimTokenResponse?.claimed_at);
      setSpinning(false);

      confirmAlert({
        customUI: ({ onClose }) => {
          return (
            <ClaimSuccessModal
              connection={connection}
              onClose={onClose}
              amount={amountToken}
              ratio={pool.token_ratio!}
              txId={txId}
              mintFrom={pool.token_to}
              mintTo={pool.token_symbol}
              tokenDecimals={pool.token_decimals}
              claimable_percentage={pool.claimable_percentage}
            />
          );
        },
      });
      alertSuccess('User claim token success!');
    } catch (err) {
      setSpinning(false);
      alertError((err as any).message);
    }
  };

  const confirmClaim = () => {
    confirmAlert({
      customUI: ({ onClose }) => {
        return (
          <ConfirmClaimTokenModal
            onClose={onClose}
            onConfirm={handleClaimToken}
            mintFrom={pool.token_to}
            mintTo={pool.token_symbol}
            ratio={pool.token_ratio}
            loading={spinning}
            allocation={userAllocation!}
            tokenDecimals={pool.token_decimals}
            claimable_percentage={pool.claimable_percentage}
          />
        );
      },
    });
  };

  const handleClaim = async () => {
    if (!connected) {
      setVisible(true);
    } else {
      confirmClaim();
    }
  };

  return (
    <div className="w-full p-4">
      <div className="mb-4">
        <PoolCardTitle title="Token Claim" />
      </div>

      <div className="mb-4">
        <div className="flex items-center my-2">
          <span className="w-40 text-sm font-semibold text-white opacity-30">
            Total Bought Tokens
          </span>
          <BalanceBadge
            variant="basic"
            price={tokenBalanceMarkup}
            mint={pool.token_symbol}
            className="text-sm font-semibold text-pool_focus_1"
          />
        </div>
        <div className="flex items-center my-2">
          <span className="w-40 text-sm font-semibold text-white opacity-30">Have Bought</span>
          <div className="flex items-center text-sm font-light text-white">
            <NumberFormat
              thousandSeparator
              value={new Decimal(tokenBalanceMarkup).dividedBy(pool.token_ratio).toNumber()}
              displayType="text"
              className="mr-1"
            />
            <span className="mr-1">/</span>
            <NumberFormat
              thousandSeparator
              value={new Decimal(tokenBalanceMarkup).dividedBy(pool.token_ratio).toNumber()}
              displayType="text"
              className="mr-1"
            />
            <span>{pool.token_to}</span>
          </div>
          {/* <span className="text-sm font-light text-white">123</span> */}
        </div>
        <div className="flex items-center my-2">
          <span className="w-40 text-sm font-semibold text-white opacity-30">Claim Policy</span>
          <span className="text-sm font-light text-white">
            You can claim all token after {moment(pool.claim_at).utc().format('MMM DD, LT')} (UTC)
          </span>
        </div>
        <div className="flex items-center my-2">
          <span className="w-40 text-sm font-semibold text-white opacity-30">You have claimed</span>
          <BalanceBadge
            variant="basic"
            price={isClaimed ? tokenBalanceMarkup : 0}
            mint={pool.token_symbol}
            className="text-sm font-semibold text-pool_focus_1"
          />
        </div>
      </div>

      <div className="w-full mt-8">
        <PoolClaimProgressBar progress={claimTokenProgress} loading={loading} />
        <div className="flex items-start justify-between w-full mt-4">
          <span className="text-sm text-pool_focus_1">{claimTokenProgress}%</span>
          <div className="flex flex-col items-end">
            <div className="flex items-center text-sm font-light text-white">
              <span className="mr-1 text-sm">100%</span>
              <span>(</span>
              <NumberFormat
                thousandSeparator
                value={tokenBalanceMarkup}
                displayType="text"
                className="text-sm font-light text-white"
              />

              <span>{pool.token_symbol})</span>
            </div>
            {isClaimed && (
              <span className="text-sm font-light text-white opacity-30">
                {moment(userClaimedAt).utc().format('MM/DD/YYYY @ LT')} (UTC)
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8">
        <button
          onClick={handleClaim}
          className={clsx(
            'hidden w-64 h-12 text-sm text-center text-white rounded-full bg-secondary-500 lg:block',
            {
              'bg-secondary-600': !canClaim,
            },
          )}
          disabled={!canClaim}
        >
          {claimContent}
        </button>
      </div>
    </div>
  );
};

export default SecuredAllocation;
