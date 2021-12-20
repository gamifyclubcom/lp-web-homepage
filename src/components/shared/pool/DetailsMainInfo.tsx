import Decimal from 'decimal.js';
import moment from 'moment';
import { useEffect, useMemo, useState } from 'react';
import NumberFormat from 'react-number-format';
import ShowMoreText from 'react-show-more-text';
import { usePool } from '../../../hooks/usePool';
import { IPool } from '../../../sdk/pool/interface';
import { TOKEN_TO_DECIMALS } from '../../../utils/constants';
import {
  generateOnChainUrl,
  getPoolAccess,
  renderTokenBalance,
  tokenToSOL,
  isJSON,
} from '../../../utils/helper';
import Accordion from '../Accordion';
import BalanceBadge from '../BalanceBadge';
import { convertFromRaw } from 'draft-js';
import { stateToHTML } from 'draft-js-export-html';

interface Props {
  pool: IPool;
  allocationLevel?: number;
  participantAddress: string | null;
}

const DetailsMainInfo: React.FC<Props> = ({ pool, allocationLevel, participantAddress }) => {
  const { getTokenInfo, getMaxIndividualAllocationForStaker } = usePool();
  const poolAccess = getPoolAccess(pool);
  const totalRaise = useMemo(() => {
    return renderTokenBalance(
      new Decimal(pool.token_total_raise).dividedBy(pool.token_ratio),
      TOKEN_TO_DECIMALS,
    );
  }, [pool.token_total_raise, pool.token_ratio]);
  const tokenDistribution = useMemo(() => {
    return `${moment(new Date(pool.claim_at)).utc().format('MMM Do YYYY, LT')} UTC`;
  }, [pool.claim_at]);
  const tokenSwapTime = useMemo(() => {
    return `${moment(new Date(pool.join_pool_start)).utc().format('MMM Do YYYY, LT')} UTC`;
  }, [pool.join_pool_start]);
  const tokenAddressUrl = useMemo(() => {
    return generateOnChainUrl('address', pool.token_address);
  }, [pool.token_address]);
  const tokenPrice = useMemo(() => {
    const result = parseFloat(
      new Decimal(1).dividedBy(pool.token_ratio).toFixed(TOKEN_TO_DECIMALS),
    );

    return `${result} ${pool.token_to}`;
  }, [pool.token_ratio, pool.token_to]);
  const [tokenInfo, setTokenInfo] = useState<{
    loading: boolean;
    total_supply: number;
  }>({
    loading: false,
    total_supply: 0,
  });

  useEffect(() => {
    const initTokenInfo = async () => {
      if (pool.token_address) {
        setTokenInfo({ ...tokenInfo, loading: true });
        try {
          const data = await getTokenInfo(pool.token_address);
          setTokenInfo({
            ...tokenInfo,
            total_supply: data.token_total_supply,
            loading: false,
          });
        } catch (err) {
          setTokenInfo({ ...tokenInfo, total_supply: 0, loading: false });
        }
      }
    };

    initTokenInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pool.token_address]);

  const maxIndividualAllocExclusive = useMemo(() => {
    if (!pool.exclusive_join_enable) {
      return 0;
    }
    const { individualStaker } = getMaxIndividualAllocationForStaker(pool, allocationLevel || 0);
    return `${parseFloat(
      new Decimal(Decimal.min(pool.token_total_raise, individualStaker))
        .dividedBy(pool.token_ratio)
        .toFixed(TOKEN_TO_DECIMALS),
    )} ${pool.token_to}`;

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pool, allocationLevel]);
  const maxIndividualAllocFCFSStaker = useMemo(() => {
    if (!pool.fcfs_join_for_staker_enabled) {
      return 0;
    }
    const { totalStaker } = getMaxIndividualAllocationForStaker(pool, allocationLevel || 0);
    return `${parseFloat(
      new Decimal(Decimal.min(totalStaker, pool.token_total_raise))
        .dividedBy(pool.token_ratio)
        .toFixed(TOKEN_TO_DECIMALS),
    )} ${pool.token_to}`;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pool, allocationLevel]);
  const maxIndividualAllocFCFS = useMemo(() => {
    return `${parseFloat(
      new Decimal(pool.campaign.public_phase.max_individual_alloc)
        .dividedBy(pool.token_ratio)
        .toFixed(TOKEN_TO_DECIMALS),
    )} ${pool.token_to}`;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pool, allocationLevel]);
  const maxIndividualAllocWhitelist = useMemo(() => {
    if (!Boolean(participantAddress)) {
      return 0;
    }
    return `${parseFloat(
      new Decimal(pool.campaign.early_join_phase.max_individual_alloc)
        .dividedBy(pool.token_ratio)
        .toFixed(TOKEN_TO_DECIMALS),
    )} ${pool.token_to}`;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pool, allocationLevel, participantAddress]);

  return (
    <div className="p-8">
      <div className="mb-4">
        <h3 className="text-base text-white uppercase opacity-30">Pool details</h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* left */}
        <div className="col-span-2 lg:col-span-1">
          <div className="flex flex-col text-white">
            <div className="flex items-center mt-4 text-sm">
              <div className="w-1/3 opacity-30">Token Swap Time</div>
              <div className="w-2/3">{tokenSwapTime}</div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              <div className="w-1/3 opacity-30">Type</div>
              <div className="w-2/3">Claimable {pool.claimable_percentage}%</div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              <div className="w-1/3 opacity-30">Website</div>
              <div className="w-2/3 break-all">
                <a className="block w-full truncate" rel="noreferrer" href={pool.website}>
                  {pool.website}
                </a>
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              <div className="w-1/3 opacity-30">Token Distribution</div>
              <div className="w-2/3">{tokenDistribution}</div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              <div className="w-1/3 opacity-30">Symbol</div>
              <div className="w-2/3">{pool.token_symbol}</div>
            </div>
            <div className="flex flex-col mt-4 text-sm">
              <div className="opacity-30">Personal Allocations</div>
              <ul className="pl-6 text-sm">
                {pool.private_join_enabled && (
                  <li className="flex items-center justify-between py-2">
                    <span className="opacity-30">Whitelist round</span>
                    <span>{maxIndividualAllocWhitelist}</span>
                  </li>
                )}
                {pool.exclusive_join_enable && (
                  <li className="flex items-center justify-between py-2">
                    <span className="opacity-30">Stakers Round 1</span>
                    <span>{maxIndividualAllocExclusive}</span>
                  </li>
                )}
                {pool.fcfs_join_for_staker_enabled && (
                  <li className="flex items-center justify-between py-2">
                    <span className="opacity-30">Stakers Round 2</span>
                    <span>{maxIndividualAllocFCFSStaker}</span>
                  </li>
                )}

                <li className="flex items-center justify-between py-2">
                  <span className="opacity-30">Public Round</span>
                  <span>{maxIndividualAllocFCFS}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* right */}
        <div className="col-span-2 lg:col-span-1">
          <div className="flex flex-col text-white">
            <div className="flex items-center text-sm">
              <div className="w-1/3 opacity-30">Access</div>
              <div className="w-2/3 text-pool_focus_1">{poolAccess}</div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              <div className="w-1/3 opacity-30">Total Raise</div>
              <div className="w-2/3">
                <BalanceBadge variant="basic" price={totalRaise} mint={pool.token_to} />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              <div className="w-1/3 opacity-30">Lock Schedule</div>
              <div className="w-2/3 text-pool_focus_1">TBA</div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              <div className="w-1/3 opacity-30">Liquidity Percentage</div>
              <div className="w-2/3">{pool.liquidity_percentage}%</div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              <div className="w-1/3 opacity-30">Address</div>
              <div className="w-2/3">
                <a
                  className="block w-full underline truncate"
                  rel="noreferrer"
                  href={tokenAddressUrl}
                  target="_blank"
                >
                  {pool.token_address}
                </a>
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm text-white">
              <div className="w-1/3 opacity-30">Supply</div>
              {tokenInfo.loading ? (
                <div className="w-12 h-3 rounded-lg animate-pulse" />
              ) : (
                <NumberFormat
                  thousandSeparator={true}
                  value={tokenInfo.total_supply}
                  displayType="text"
                  className="w-2/3 text-sm"
                />
              )}
            </div>
            <div className="flex items-center mt-4 text-sm text-white">
              <div className="w-1/3 opacity-30">Token Price</div>
              <div className="w-2/3">{tokenPrice}</div>
            </div>
            <div className="flex items-center mt-4 text-sm text-white">
              <div className="w-1/3 opacity-30">Token Economics</div>
              <div className="w-2/3">
                {pool.token_economic ? (
                  <a
                    className="underline cursor-pointer"
                    rel="noreferrer"
                    href={pool.token_economic}
                    target="_blank"
                  >
                    See more
                  </a>
                ) : (
                  'See more'
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailsMainInfo;
