import clsx from 'clsx';
import moment from 'moment';
import { renderTokenBalance } from '../../../../utils/helper';
import BalanceBadge from '../../../shared/BalanceBadge';
import BaseModal from './BaseModal';

interface Props {
  amount: number;
  mintTo: string;
  level: number;
  tokenDecimals: number;
  minDaysStake: number;
  penaltyPercent: number;
  now: number;
  onClose: () => void;
  onConfirm: (...args: any[]) => void | Promise<void>;
}

const ConfirmStakeModal: React.FC<Props> = ({
  amount,
  mintTo,
  level,
  tokenDecimals,
  minDaysStake,
  penaltyPercent,
  now,
  onClose,
  onConfirm,
}) => {
  const amountMarkup = renderTokenBalance(amount, tokenDecimals);
  const maturityTime = moment.unix(now).unix() + minDaysStake * 24 * 3600;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <BaseModal
      variant="confirm"
      loading={false}
      modalName="Confirmation"
      title="Please confirm staking amount"
      titleSize="medium"
      customSubtitle={
        <div className="flex items-center justify-between p-4 mb-4 bg-gray-900 border border-gray-500 rounded-md">
          <span className="text-lg text-gray-500">Stake</span>
          <span className="text-lg text-white">
            <BalanceBadge variant="basic" price={amountMarkup} mint={mintTo} />
          </span>
        </div>
      }
      headContent={
        <BalanceBadge variant="basic" price={amountMarkup} mint={mintTo} className="text-2xl" />
      }
      customBody={
        <div className="flex flex-col mb-4">
          <div className="flex items-center justify-center mb-4">
            <span className="text-lg font-light text-center text-white">
              After staking, you will be on
            </span>
          </div>
          <div
            className={clsx(
              'flex items-center justify-center p-4 mb-4 text-white rounded-md cursor-pointer bg-stake_level_1',
              {
                'bg-stake_level_1': level === 1,
                'bg-stake_level_2': level === 2,
                'bg-stake_level_3': level === 3,
                'bg-stake_level_4': level === 4,
                'bg-stake_level_5': level === 5,
              },
            )}
          >
            Level {level}
          </div>
          {level !== 5 && (
            <div className="flex flex-col items-center justify-center mb-4">
              <span className="text-xs font-light text-gray-500">
                Open up higher levels of allocation by staking more ISOLA.
              </span>
              <span className="text-xs font-light text-gray-500 underline cursor-pointer">
                <a
                  href="https://trade.dexlab.space/#/market/42QVcMqoXmHT94zaBXm9KeU7pqDfBuAPHYN9ADW8weCF"
                  target="_blank"
                  rel="noreferrer"
                >
                  You can purchase GMFC here.
                </a>
              </span>
            </div>
          )}

          <div className="flex flex-col items-center justify-center px-4 py-3 bg-transparent border border-gray-500 rounded-md">
            <span className="mb-3 text-sm font-semibold text-center text-modal_stake_maturity_time">
              Staking maturity time: {moment.unix(maturityTime).utc().format('MMM DD YYYY LT')}{' '}
              (UTC)
            </span>
            <span className="max-w-xs text-xs text-center text-gray-300 font-extralight">
              Unstaking these tokens prior to the maturity time will result in a
              {` ${penaltyPercent}`}% penalty charge
            </span>
          </div>
        </div>
      }
      bodyContents={[
        {
          left: <span>Maturity time</span>,
          right: <span>{moment.unix(maturityTime).utc().format('MMM DD YYYY LT')} (UTC)</span>,
        },
        {
          left: <span>Total staked amount</span>,
          right: <BalanceBadge variant="basic" price={amountMarkup} mint={mintTo} />,
        },
        {
          left: <span>Your level after staking</span>,
          right: <span>{level}</span>,
        },
      ]}
      onClose={onClose}
      handleConfirm={handleConfirm}
    />
  );
};

export default ConfirmStakeModal;
