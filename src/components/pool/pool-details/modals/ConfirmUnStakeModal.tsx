import Decimal from 'decimal.js';
import moment from 'moment';
import Countdown from 'react-countdown';
import { AiOutlineWarning } from 'react-icons/ai';
import { useCountDown } from '../../../../hooks/useCountDown';
import { renderTokenBalance } from '../../../../utils/helper';
import BalanceBadge from '../../../shared/BalanceBadge';
import BaseModal from './BaseModal';

interface Props {
  totalAmount: number;
  penaltyPercent: number;
  mintTo: string;
  maturityTime: number; // unix timestamp
  tokenDecimals: number;
  totalTime: number;
  timeLeft: number;
  start_staked: number;
  now: number;
  onClose: () => void | Promise<void>;
  onConfirm: (...args: any[]) => void;
}

const ConfirmUnStakeModal: React.FC<Props> = ({
  penaltyPercent,
  totalAmount,
  mintTo,
  maturityTime,
  tokenDecimals,
  totalTime,
  timeLeft,
  start_staked,
  now,
  onClose,
  onConfirm,
}) => {
  const { renderCountDownValue } = useCountDown();
  const penaltyAmount = new Decimal(totalAmount)
    .times(penaltyPercent)
    .times(timeLeft)
    .dividedBy(totalTime)
    .dividedBy(100);
  const receivedAmount = new Decimal(totalAmount).minus(penaltyAmount);
  const penaltyMarkup = renderTokenBalance(penaltyAmount, tokenDecimals);
  const totalAmountMarkup = renderTokenBalance(totalAmount, tokenDecimals);
  const receivedAmountMarkup = renderTokenBalance(receivedAmount, tokenDecimals);

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const timeInfo =
    start_staked === 0
      ? []
      : [
          {
            left: <span>Maturity time</span>,
            right: <span>{moment.unix(maturityTime).utc().format('MMM DD YYYY LT')} (UTC)</span>,
          },
          {
            left: <span>Remaining time to maturity</span>,
            right: (
              <Countdown
                date={moment.unix(maturityTime).toLocaleString()}
                renderer={({ days, hours, minutes, seconds, completed }) => {
                  const daysValue = renderCountDownValue({
                    targetDate: maturityTime,
                    isCompleted: completed,
                    timeUnit: days,
                  });
                  const hoursValue = renderCountDownValue({
                    targetDate: maturityTime,
                    isCompleted: completed,
                    timeUnit: hours,
                  });
                  const minutesValue = renderCountDownValue({
                    targetDate: maturityTime,
                    isCompleted: completed,
                    timeUnit: minutes,
                  });

                  return (
                    <span>{`${daysValue} days ${hoursValue} hours ${minutesValue} minutes`}</span>
                  );
                }}
              />
            ),
          },
        ];

  return (
    <BaseModal
      dense={true}
      modalSize="large"
      loading={false}
      variant="confirm"
      modalName={
        moment.unix(now).isBefore(moment.unix(maturityTime))
          ? 'Penalty Notice'
          : 'Unstake Gamify'
      }
      modalIcon={
        moment.unix(now).isBefore(moment.unix(maturityTime)) ? <AiOutlineWarning /> : undefined
      }
      title={
        moment.unix(now).isBefore(moment.unix(maturityTime))
          ? `Are you sure to perform premature withdrawal with ${penaltyPercent}% penalty?`
          : 'You will unstake the following:'
      }
      customTitle={
        moment.unix(now).isBefore(moment.unix(maturityTime)) ? (
          <div className="flex items-center justify-center px-8 py-3 mt-2 mb-4 rounded-md bg-modal_header_color1">
            <span className="max-w-md text-xl text-center text-modal_header_color2">
              {`Are you sure you want to prematurely Unstake your ${mintTo}? There will be a ${penaltyPercent}% penalty fee on the amount you Unstake.`}
            </span>
          </div>
        ) : undefined
      }
      customSubtitle={
        moment.unix(now).isBefore(moment.unix(maturityTime)) ? (
          <div className="w-full px-4 py-3 mb-6 bg-gray-900 border border-gray-500 rounded-md">
            <ul className="w-full">
              <li className="flex items-center justify-between w-full px-4 py-3">
                <span className="text-lg font-semibold text-gray-500">Unstake</span>
                <span className="text-lg font-semibold text-white uppercase">
                  <BalanceBadge variant="basic" price={totalAmountMarkup} mint={mintTo} />
                </span>
              </li>
              <li className="flex items-center justify-between w-full px-4 py-3 rounded-md bg-modal_unstake_header">
                <span className="text-lg font-semibold text-gray-500">Penalty</span>
                <span className="text-lg font-semibold text-white uppercase">
                  <BalanceBadge variant="basic" price={penaltyMarkup} mint={mintTo} />
                </span>
              </li>
            </ul>
          </div>
        ) : undefined
      }
      titleSize="medium"
      headContent={
        <BalanceBadge
          variant="basic"
          price={
            moment.unix(now).isBefore(moment.unix(maturityTime))
              ? receivedAmountMarkup
              : totalAmountMarkup
          }
          mint={mintTo}
        />
      }
      bodyContents={[
        ...timeInfo,
        {
          left: <span>Total unstake amount</span>,
          right: <BalanceBadge variant="basic" price={totalAmountMarkup} mint={mintTo} />,
        },
        {
          left: <span>Penalty charge ({penaltyPercent}%)</span>,
          right: <BalanceBadge variant="basic" price={penaltyMarkup} mint={mintTo} />,
        },
        {
          left: <span>Received amount after unstaking</span>,
          right: <BalanceBadge variant="basic" price={receivedAmountMarkup} mint={mintTo} />,
        },
      ]}
      onClose={onClose}
      handleConfirm={handleConfirm}
    />
  );
};

export default ConfirmUnStakeModal;
