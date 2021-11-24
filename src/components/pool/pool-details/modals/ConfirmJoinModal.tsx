import Decimal from 'decimal.js';
import { getClaimableField, renderTokenBalance } from '../../../../utils/helper';
import BalanceBadge from '../../../shared/BalanceBadge';
import ArrowDownIcon from '../../../shared/icons/ArrowDownIcon';
import EvaCloseOutlineIcon from '../../../shared/icons/EvaCloseOutlineIcon';
import BaseModalV2 from './BaseModalV2';
import Image from 'next/image';

interface Props {
  onClose: () => void;
  onConfirm: (...args: any) => void | Promise<void>;
  amountSwap: number;
  swapRatio: number;
  mintFrom: string;
  mintTo: string;
  loading?: boolean;
  tokenDecimals: number;
  claimable_percentage: number;
  logo?: string;
}

const ConfirmJoinModal: React.FC<Props> = ({
  onClose,
  onConfirm,
  amountSwap,
  swapRatio,
  mintFrom,
  mintTo,
  loading = false,
  tokenDecimals,
  claimable_percentage,
  logo,
}) => {
  const tokenBalanceMarkup = renderTokenBalance(
    new Decimal(amountSwap).times(swapRatio).times(claimable_percentage).dividedBy(100),
    tokenDecimals,
  );

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <BaseModalV2
      loading={loading}
      variant="confirm"
      modalName="Swap confirmation"
      confirmText="Confirm"
      title=""
      modalIcon={
        <div onClick={onClose}>
          <EvaCloseOutlineIcon />
        </div>
      }
      // headContent={
      //   <BalanceBadge
      //     variant="basic"
      //     price={tokenBalanceMarkup}
      //     mint={mintTo}
      //     className="text-2xl"
      //   />
      // }
      bodyContents={[
        {
          left: (
            <div className="flex flex-col gap-y-4 h-full justify-between">
              <span>From</span>
              <span>To</span>
            </div>
          ),
          right: (
            <div className="flex flex-col gap-y-4 items-end text-base">
              <div className="flex items-center">
                <BalanceBadge variant="basic" mint={mintFrom} price={amountSwap} />
                <div className="bg-222228 ml-2 rounded-full overflow-hidden w-8 h-8">
                  <Image
                    width={38}
                    height={38}
                    src="/images/solana-sol-logo.svg"
                    alt="solana logo"
                    className="w-full"
                  />
                </div>
              </div>
              <div className="">
                <div className="mb-1">
                  <ArrowDownIcon />
                </div>
                <div className="flex items-center">
                  <BalanceBadge variant="basic" mint={mintTo} price={tokenBalanceMarkup} />
                  <div className="bg-222228 ml-2 rounded-full overflow-hidden w-8 h-8">
                    <img className="w-full" src={logo} alt="logo" />
                  </div>
                </div>
              </div>
            </div>
          ),
        },
        {
          left: (
            <div className="flex flex-col gap-y-2">
              <span>Price</span>
              <span>Inverse Price</span>
            </div>
          ),
          right: (
            <div className="flex flex-col gap-y-2">
              <BalanceBadge
                variant="with-ratio"
                mintFrom={mintFrom}
                mintTo={mintTo}
                price={swapRatio}
              />
              <BalanceBadge
                variant="with-ratio"
                mintFrom={mintTo}
                mintTo={mintFrom}
                price={swapRatio}
                reverse={true}
              />
            </div>
          ),
        },
        /* {
          left: <span>Amount</span>,
          right: <BalanceBadge variant="basic" mint={mintFrom} price={amountSwap} />,
        }, */
        ...getClaimableField(claimable_percentage),
        /* {
          left: <span>Total</span>,
          right: <BalanceBadge variant="basic" price={tokenBalanceMarkup} mint={mintTo} />,
        }, */
      ]}
      preTextFooter={
        <div className="text-white mr-20">
          {`You will received `}
          <BalanceBadge
            variant="basic"
            price={tokenBalanceMarkup}
            mint={mintTo}
            // className="text-2xl"
          />
        </div>
      }
      onClose={onClose}
      handleConfirm={handleConfirm}
    />
  );
};

export default ConfirmJoinModal;
