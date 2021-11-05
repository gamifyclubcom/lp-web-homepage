import Decimal from 'decimal.js';
import moment from 'moment';
import { useEffect, useMemo, useState } from 'react';
import { usePool } from '../../../hooks/usePool';
import { IPool } from '../../../sdk/pool/interface';
import { TOKEN_TO_DECIMALS } from '../../../utils/constants';
import {
  generateOnChainUrl,
  getPoolAccess,
  renderTokenBalance,
  tokenToSOL,
} from '../../../utils/helper';
import Accordion from '../../shared/Accordion';
import BalanceBadge from '../../shared/BalanceBadge';

interface Props {
  pool: IPool;
}

const PoolDetailsMainInfo: React.FC<Props> = ({ pool }) => {
  const { getTokenInfo } = usePool();
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
    return `${new Decimal(1).dividedBy(pool.token_ratio).toFixed(TOKEN_TO_DECIMALS)} ${
      pool.token_to
    }`;
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

  return (
    <div className="p-8">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white uppercase opacity-30">Pool details</h3>
        {pool.description && <span className="text-xs text-white">{pool.description}</span>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* left */}
        <div className="col-span-2 lg:col-span-1">
          <div className="flex flex-col">
            <div className="flex items-center my-4 text-sm text-white">
              <div className="w-1/3">Token Swap Time</div>
              <div className="w-2/3">{tokenSwapTime}</div>
            </div>
            <div className="flex items-center my-4 text-sm text-white">
              <div className="w-1/3">Type</div>
              <div className="w-2/3">Claimable {pool.claimable_percentage}%</div>
            </div>
            <div className="flex items-center my-4 text-sm text-white">
              <div className="w-1/3">Website</div>
              <div className="w-2/3">{pool.website}</div>
            </div>
            <div className="flex items-center my-4 text-sm text-white">
              <div className="w-1/3">Token Distribution</div>
              <div className="w-2/3">{tokenDistribution}</div>
            </div>
            <div className="flex items-center my-4 text-sm text-white">
              <div className="w-1/3">Symbol</div>
              <div className="w-2/3">{pool.token_symbol}</div>
            </div>
            <div className="flex items-center my-4 text-sm text-white">
              <Accordion title={<div>FCFS round</div>}>
                <ul className="pl-6 text-sm">
                  <li className="flex items-center justify-between py-2">
                    <span>Max contribution size</span>
                    <span>{`${tokenToSOL(
                      pool.campaign.public_phase.max_individual_alloc,
                      pool.token_ratio,
                    )} ${pool.token_to}`}</span>
                  </li>
                </ul>
              </Accordion>
            </div>
          </div>
        </div>

        {/* right */}
        <div className="col-span-2 lg:col-span-1">
          <div className="flex flex-col">
            <div className="flex items-center my-4 text-sm text-white">
              <div className="w-1/3">Access</div>
              <div className="w-2/3">{poolAccess}</div>
            </div>
            <div className="flex items-center my-4 text-sm text-white">
              <div className="w-1/3">Total Raise</div>
              <div className="w-2/3">
                <BalanceBadge variant="basic" price={totalRaise} mint={pool.token_to} />
              </div>
            </div>
            <div className="flex items-center my-4 text-sm text-white">
              <div className="w-1/3">Lock Schedule</div>
              <div className="w-2/3">TBA</div>
            </div>
            <div className="flex items-center my-4 text-sm text-white">
              <div className="w-1/3">Liquidity Percentage</div>
              <div className="w-2/3">{pool.liquidity_percentage}%</div>
            </div>
            <div className="flex items-center my-4 text-sm text-white">
              <div className="w-1/3">Address</div>
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
            <div className="flex items-center my-4 text-sm text-white">
              <div className="w-1/3">Supply</div>
              <div className="w-2/3">
                {tokenInfo.loading ? (
                  <div className="w-12 h-3 rounded-lg animate-pulse" />
                ) : (
                  tokenInfo.total_supply
                )}
              </div>
            </div>
            <div className="flex items-center my-4 text-sm text-white">
              <div className="w-1/3">Token Price</div>
              <div className="w-2/3">{tokenPrice}</div>
            </div>
            <div className="flex items-center my-4 text-sm text-white">
              <div className="w-1/3">Token Economics</div>
              <div className="w-2/3">
                <a
                  className="underline cursor-pointer"
                  rel="noreferrer"
                  href={pool.token_economic}
                  target="_blank"
                >
                  See more
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PoolDetailsMainInfo;
