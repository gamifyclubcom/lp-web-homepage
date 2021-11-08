import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import Decimal from 'decimal.js';
import moment from 'moment';
import React, { Dispatch, SetStateAction } from 'react';
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
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const tokenBalanceMarkup = renderTokenBalance(userAllocation, pool.token_decimals);
  const tokenBalanceClaimableMarkup = renderTokenBalance(
    new Decimal(userAllocation || 0).times(pool.claimable_percentage).dividedBy(100),
    pool.token_decimals,
  );

  const renderClaimAction = () => {
    let msg = '';
    let disabled = false;
    if (
      moment.unix(now).isAfter(pool.claim_at) &&
      status.type === PoolStatusType.CLOSED &&
      userAllocation !== 0 &&
      !isClaimed
    ) {
      msg =
        pool.claimable_percentage === 100
          ? `You can now claim your ${pool.token_symbol} tokens!`
          : `You can now claim your ${tokenBalanceClaimableMarkup} ${pool.token_symbol}`;
    } else if (isClaimed) {
      msg = `You've claimed ${tokenBalanceClaimableMarkup} ${pool.token_symbol} on ${moment(
        userClaimedAt,
      )
        .utc()
        .format('MM/DD/YYYY @ LT')} (UTC)`;
    } else {
      disabled = true;
      msg =
        pool.claimable_percentage === 100
          ? `This is how much ${pool.token_symbol} you be able to claim at
      ${moment(pool.claim_at).utc().format('MMM DD, LT')} (UTC)`
          : `You can claim ${tokenBalanceClaimableMarkup} ${pool.token_symbol} at ${moment(
              pool.claim_at,
            )
              .utc()
              .format('MMM DD, LT')} (UTC)`;
    }

    return (
      <div className="flex-col items-center justify-center hidden w-full lg:flex">
        <span className="text-center text-white opacity-75" style={{ maxWidth: 300 }}>
          {msg}
        </span>
        {isClaimed ? (
          <div className="flex items-center justify-center px-12 py-4 mt-6 overflow-hidden text-green-500 bg-transparent border border-green-500 rounded-full cursor-pointer h-14">
            Already Claimed <AiOutlineCheck className="ml-3 text-lg" />
          </div>
        ) : moment.unix(now).isBefore(pool.join_pool_end) ? null : (
          <button
            className="w-48 h-12 mt-6 overflow-hidden text-white transition-all duration-300 bg-green-700 rounded-full hover:bg-green-900"
            disabled={disabled || isClaimed}
            onClick={confirmClaim}
          >
            Claim token
          </button>
        )}
      </div>
    );
  };

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

  return (
    <div className="p-4">
      <div className="flex flex-col items-center py-2">
        {loading || spinning ? (
          <span className="w-24 h-6 bg-gray-600 animate-pulse"></span>
        ) : userAllocation || (!userAllocation && moment.unix(now).isBefore(pool.claim_at)) ? (
          <>
            <p className="mb-4 text-4xl font-medium text-white">
              <NumberFormat
                thousandSeparator
                displayType="text"
                value={tokenBalanceMarkup}
                className="mr-2"
              />
              <span className="text-2xl font-medium uppercase">{pool.token_symbol}</span>
            </p>
            {renderClaimAction()}
          </>
        ) : (
          <p className="text-lg text-center text-white opacity-60">
            Your address did not participate in this pool.
          </p>
        )}
      </div>
    </div>
  );
};

export default SecuredAllocation;
