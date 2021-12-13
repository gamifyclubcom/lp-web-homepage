import clsx from 'clsx';
import Decimal from 'decimal.js';
import moment from 'moment';
import Image from 'next/image';
// import Link from 'next/link';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { useEffect, useMemo, useState } from 'react';
import { confirmAlert } from 'react-confirm-alert';
import NumberFormat from 'react-number-format';
import Layout from '../components/shared/Layout';
import { PageTitle } from '../shared/enum';
import ConfirmStakeModal from '../components/pool/pool-details/modals/ConfirmStakeModal';
import ConfirmUnStakeModal from '../components/pool/pool-details/modals/ConfirmUnStakeModal';
import StakeSuccessModal from '../components/pool/pool-details/modals/StakeSuccessModal';
import UnStakeSuccessModal from '../components/pool/pool-details/modals/UnStakeSuccessModal';
import Guarantees from '../components/pool/pool-list/Guarantees';
import LoadingScreen from '../components/shared/LoadingScreen';
// import InputRange from '../components/shared/Slider/InputRange';
import { allocationLevels, envConfig } from '../configs';
import { useAlert } from '../hooks/useAlert';
import useSmartContract from '../hooks/useSmartContract';
import { useGlobal } from '../hooks/useGlobal';
import { poolAPI } from '../sdk/pool';
import { IAllocationLevel } from '../shared/interface';
import { getUserAllocationLevel, isEmpty } from '../utils/helper';
// import VideoGameIcon from '../components/shared/icons/VideoGameIcon';

const { ISOLA_TOKEN_ADDRESS, ISOLA_TOKEN_NAME } = envConfig;

const Staking: React.FC = () => {
  const { publicKey } = useWallet();
  const { now } = useGlobal();
  const { alertError, alertSuccess } = useAlert();
  const { connected } = useWallet();
  const {
    getUserStakeData,
    getUserTiersData,
    handleUserStake,
    handleUserUnStake,
    getMaxAmountUserCanStake,
    getMaxAmountUserCanUnStake,
    getTokenDecimals,
    getUserTokenBalance,
    loading,
  } = useSmartContract();
  // const [sliderValue, setSliderValue] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [levels, setLevels] = useState<IAllocationLevel[]>(allocationLevels);
  const [penaltyWidthDraw, setPenaltyWidthDraw] = useState(0);
  const [maturityTime, setMaturityTime] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [unStakeTimeLeft, setUnStakeTimeLeft] = useState(0);
  const [currentLevel, setCurrentLevel] = useState<number>(0);
  const [totalStaked, setTotalStaked] = useState(0);
  const [unStakeBalance, setUnStakeBalance] = useState(0);
  const [isolaDecimals, setIsolaDecimals] = useState(0);
  const [minDaysStakes, setMinDaysStakes] = useState(0);
  const [amountStake, setAmountStake] = useState<{
    value: Decimal;
    formatted: string;
  }>({
    value: new Decimal(0),
    formatted: '0',
  });
  /* const [amountUnStake, setAmountUnStake] = useState<{
    value: Decimal;
    formatted: string;
  }>({
    value: new Decimal(0),
    formatted: '0',
  }); */
  const [tierUserTab, setTierUserTab] = useState<number>(0);
  const unStakeDisabled = useMemo(() => {
    return Boolean(totalStaked <= 0);
  }, [totalStaked]);

  useEffect(() => {
    fetchOnChainData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connected, isolaDecimals]);

  useEffect(() => {
    const fetchInitInfo = async () => {
      try {
        const tokenDecimals = await getTokenDecimals(ISOLA_TOKEN_ADDRESS);
        setIsolaDecimals(tokenDecimals);

        const { tier1, tier2, tier3, tier4, tier5 } = await getUserTiersData(tokenDecimals);
        setLevels((prev) => {
          const result = prev.map((l) => {
            let minAllocation: number;
            switch (l.level) {
              case 1:
                minAllocation = tier1.min_amount;
                break;
              case 2:
                minAllocation = tier2.min_amount;
                break;
              case 3:
                minAllocation = tier3.min_amount;
                break;
              case 4:
                minAllocation = tier4.min_amount;
                break;
              case 5:
              default:
                minAllocation = tier5.min_amount;
                break;
            }
            const newLevel: IAllocationLevel = { ...l, minAllocation };

            return newLevel;
          });

          return result;
        });
      } catch (err) {
        console.log({ err });
      }
    };

    fetchInitInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchOnChainData = async () => {
    if (!connected) {
      setMinDaysStakes(0);
      setPenaltyWidthDraw(0);
      setMaturityTime(0);
      setCurrentLevel(0);
      setTotalStaked(0);
      setUnStakeBalance(0);
      setAmountStake({
        value: new Decimal(0),
        formatted: '0',
      });
      /* setAmountUnStake({
        value: new Decimal(0),
        formatted: '0',
      }); */
    } else {
      try {
        const { start_staked, allocation_level, total_staked } = await getUserStakeData();
        setCurrentLevel(allocation_level);
        setTotalStaked(total_staked);

        const { min_days_stake, penalty_withdraw } = await getUserTiersData(isolaDecimals);
        const un_stake_time = new Decimal(start_staked)
          .plus(new Decimal(min_days_stake).times(24).times(3600))
          .toNumber();
        const un_stake_time_left = moment.unix(now).isBefore(moment.unix(un_stake_time))
          ? new Decimal(un_stake_time).minus(moment.unix(now).unix()).toNumber()
          : 0;
        const total_time = new Decimal(min_days_stake).times(24).times(3600).toNumber();

        setMinDaysStakes(min_days_stake);
        setTotalTime(total_time);
        setUnStakeTimeLeft(un_stake_time_left);
        setPenaltyWidthDraw(penalty_withdraw);
        setMaturityTime(un_stake_time);

        const userTokenBalance = await getUserTokenBalance();
        setUnStakeBalance(userTokenBalance);
      } catch (err) {
        console.log({ err });
      }
    }
  };

  const getMaxValueStake = async () => {
    if (!connected) {
      alertError('Please connect your wallet');
    } else {
      try {
        const max = await getMaxAmountUserCanStake(isolaDecimals);
        setAmountStake({
          value: new Decimal(max),
          formatted: max.toString(),
        });
      } catch (err) {
        console.log({ err });
      }
    }
  };

  const getMaxValueUnStake = async () => {
    if (!connected) {
      alertError('Please connect your wallet');
    } else {
      try {
        const max = await getMaxAmountUserCanUnStake();
        setAmountStake({
          value: new Decimal(max),
          formatted: max.toString(),
        });
      } catch (err) {
        console.log({ err });
      }
    }
  };

  const confirmStake = () => {
    if (amountStake.value.lessThanOrEqualTo(0)) {
      alertError('Please enter greater amount');
    } else {
      const newLevel = getUserAllocationLevel(
        new Decimal(totalStaked).plus(amountStake.value).toNumber(),
        levels,
      );
      confirmAlert({
        customUI: ({ onClose }) => {
          return (
            <ConfirmStakeModal
              onClose={onClose}
              onConfirm={handleStake}
              amount={amountStake.value.toNumber()}
              mintTo={ISOLA_TOKEN_NAME}
              level={newLevel}
              tokenDecimals={isolaDecimals}
              minDaysStake={minDaysStakes}
              penaltyPercent={penaltyWidthDraw}
              now={now}
            />
          );
        },
      });
    }
  };

  const confirmUnStake = async () => {
    if (amountStake.value.lessThanOrEqualTo(0)) {
      alertError('Please enter greater amount');
    } else if (amountStake.value.greaterThan(totalStaked)) {
      alertError('Please enter a smaller amount. It does not exceed the total staked amount.');
    } else {
      try {
        const { start_staked } = await getUserStakeData();
        const { min_days_stake } = await getUserTiersData(isolaDecimals);

        const un_stake_time = new Decimal(start_staked)
          .plus(new Decimal(min_days_stake).times(24).times(3600))
          .toNumber();

        const un_stake_time_left = moment.unix(now).isBefore(moment.unix(un_stake_time))
          ? new Decimal(un_stake_time).minus(moment.unix(now).unix()).toNumber()
          : 0;
        setUnStakeTimeLeft(un_stake_time_left);

        confirmAlert({
          customUI: ({ onClose }) => {
            return (
              <ConfirmUnStakeModal
                onClose={onClose}
                onConfirm={() => handleUnStake(unStakeTimeLeft)}
                mintTo={ISOLA_TOKEN_NAME}
                totalAmount={amountStake.value.toNumber()}
                penaltyPercent={penaltyWidthDraw}
                maturityTime={maturityTime}
                tokenDecimals={isolaDecimals}
                timeLeft={un_stake_time_left}
                totalTime={totalTime}
                start_staked={start_staked}
                now={now}
              />
            );
          },
        });
      } catch (err) {
        console.log({ err });
      }
    }
  };

  const handleStake = async () => {
    setSpinning(true);
    try {
      const userTokenBalance = await getUserTokenBalance();
      if (amountStake.value.greaterThan(new Decimal(userTokenBalance))) {
        alertError(`Your ${ISOLA_TOKEN_NAME} balance is not enough.`);
        setSpinning(false);
        return;
      }

      const txId = await handleUserStake(amountStake.value.toNumber());
      await fetchOnChainData();
      await poolAPI.createUserStakeHistory(
        publicKey!.toString(),
        amountStake.value.toNumber(),
        'stake',
      );

      confirmAlert({
        customUI: ({ onClose }) => {
          return (
            <StakeSuccessModal
              onClose={onClose}
              amount={amountStake.value.toNumber()}
              mintTo={ISOLA_TOKEN_NAME}
              txId={txId}
              tokenDecimals={isolaDecimals}
            />
          );
        },
      });
      alertSuccess('User stake success');
    } catch (err) {
      if ((err as any).name !== 'WalletSignTransactionError') {
        alertError((err as any).message);
      }
    } finally {
      /*  setAmountUnStake({
        value: new Decimal(0),
        formatted: '0',
      }); */
      setAmountStake({
        value: new Decimal(0),
        formatted: '0',
      });
      setSpinning(false);
    }
  };

  const handleUnStake = async (timeLeft: number) => {
    setSpinning(true);
    try {
      if (amountStake.value.greaterThan(new Decimal(totalStaked))) {
        alertError(`Your ${ISOLA_TOKEN_NAME} balance is not enough.`);
        setSpinning(false);
        return;
      }

      const txId = await handleUserUnStake(amountStake.value.toNumber());
      await fetchOnChainData();
      await poolAPI.createUserStakeHistory(
        publicKey!.toString(),
        amountStake.value.toNumber(),
        'unstake',
      );

      confirmAlert({
        customUI: ({ onClose }) => {
          return (
            <UnStakeSuccessModal
              onClose={onClose}
              mintTo={ISOLA_TOKEN_NAME}
              totalAmount={amountStake.value.toNumber()}
              penaltyPercent={penaltyWidthDraw}
              txId={txId}
              tokenDecimals={isolaDecimals}
              totalTime={totalTime}
              timeLeft={timeLeft}
            />
          );
        },
      });
      alertSuccess('User unStake success!');
    } catch (err) {
      if ((err as any).name !== 'WalletSignTransactionError') {
        alertError((err as any).message);
      }
    } finally {
      /* setAmountUnStake({
        value: new Decimal(0),
        formatted: '0',
      }); */
      setAmountStake({
        value: new Decimal(0),
        formatted: '0',
      });
      setSpinning(false);
    }
  };

  const onClickTierUserTab = (tab: number) => {
    if (tab !== tierUserTab) {
      setTierUserTab(tab);
    }
  };

  const currentRank = useMemo(() => {
    if (levels && currentLevel) {
      const foundRank = levels.find((level) => level.level === currentLevel);
      if (foundRank) return foundRank.rank;
    }
    return connected ? 'N/A' : 'Please connect wallet';
  }, [levels, currentLevel, connected]);

  const gmfcNextTier = useMemo(() => {
    let html: JSX.Element = <span>Please connect wallet</span>;
    if (connected) {
      let checkFound = 0;
      if (levels && currentLevel) {
        if (currentLevel === 5) {
          checkFound = levels[4].minAllocation;
        } else {
          const foundRank = levels.find((level) => level.level === currentLevel + 1);
          if (foundRank) checkFound = foundRank.minAllocation;
        }
      } else {
        checkFound = levels[0].minAllocation;
      }
      html = <NumberFormat value={checkFound} displayType={'text'} thousandSeparator={true} />;
    }

    return html;
  }, [levels, currentLevel, connected]);

  const getAmountMessageForNextLevel = useMemo(() => {
    let html = '';
    if (connected && currentLevel !== 0) {
      if (currentLevel === 5) {
        html = 'Congratulations for reaching Platinum!';
      } else {
        const foundNextRank = levels.find((level) => level.level === currentLevel + 1);
        if (foundNextRank) {
          const { minAllocation, rank } = foundNextRank;
          html = `You will be level ${rank} with ${minAllocation - totalStaked} GMFC more`;
        }
      }
    }
    return html;
  }, [connected, currentLevel, totalStaked, levels]);

  return (
    <Layout title={PageTitle.StakingPage}>
      <LoadingScreen loading={loading || spinning} />
      <div className="staking-bg">
        <div className="flex flex-col items-center w-full max-w-screen-xl px-5 mx-auto text-white xl:px-0">
          <div className="max-w-screen-lg">
            <div className="pt-12 text-2xl md:text-3xl text-staking text-center">
              Stake your GMFC to gain access to the upcoming quality projects
            </div>
            <div className="mt-8 text-lg text-center md:max-w-2xl mx-auto">
              In order to participate in pools on Gamify, you will need to stake GMFC tokens. The
              amount of tokens you hold will dictate how much allocation you will get.
            </div>
          </div>

          <div className="mt-20 mb-40 bg-303035 px-4 pt-6 md:px-9 pb-9 max-w-screen-lg w-full rounded-xl">
            <div className="text-white">
              <h4 className="uppercase text-base">Your Tier</h4>
              <div className="grid bg-191920 grid-cols-3 rounded-lg mt-3.5">
                <div className="text-center border-r border-white border-opacity-10 p-4">
                  <div className="text-sm font-bold">Current Tier</div>
                  <div className="text-pool_focus_1 text-xl mt-3.5">{currentRank}</div>
                </div>
                <div className="text-center border-r border-white border-opacity-10 p-4">
                  <div className="text-sm font-bold">Total staked GMFC</div>
                  <div className="text-pool_focus_1 text-xl mt-3.5 w-full truncate">
                    <NumberFormat
                      value={totalStaked}
                      displayType={'text'}
                      thousandSeparator={true}
                    />
                  </div>
                </div>
                <div className="text-center p-4 text-base">
                  <div className="text-sm font-bold">GMFC left to next tier</div>
                  <div className="text-pool_focus_1 text-xl mt-3.5 w-full truncate">
                    {gmfcNextTier}
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <div className="border-white border-opacity-10 border-b w-full flex items-center justify-center gap-x-16">
                <span
                  className={clsx('cursor-pointer border-b-4 px-5 py-2', {
                    'text-pool_focus_1 border-6398FF': tierUserTab === 0,
                    'border-transparent': tierUserTab !== 0,
                  })}
                  onClick={() => onClickTierUserTab(0)}
                >
                  Overview
                </span>
                <span
                  className={clsx('cursor-pointer border-b-4 px-5 py-2', {
                    'text-pool_focus_1 border-6398FF': tierUserTab === 1,
                    'border-transparent': tierUserTab !== 1,
                  })}
                  onClick={() => onClickTierUserTab(1)}
                >
                  Tier details
                </span>
              </div>

              {tierUserTab === 0 && (
                <div className="mt-10">
                  <div className="h-28">
                    <Guarantees
                      levels={allocationLevels}
                      isNew={true}
                      currentLevel={currentLevel}
                    />
                  </div>
                  <div className="mt-8">
                    <div className="text-white">Staking Information</div>
                    {connected ? (
                      <>
                        <div className="overflow-x-auto">
                          <div className="table border-collapse text-white rounded-lg text-sm bg-222228 mt-3 mx-auto w-full">
                            <div className="table-row overflow-visible font-bold bg-191920">
                              <div className="table-cell px-6 py-3 rounded-tl-lg"></div>
                              <div className="table-cell px-6 py-3">Balance GMFC</div>
                              <div className="table-cell px-6 py-3">Notice</div>
                              <div className="table-cell px-6 py-3"></div>
                            </div>
                            <div className="table-row border-37373D border-b">
                              <div className="table-cell px-6 py-3">Wallet Balance</div>
                              <div className="table-cell px-6 py-3">
                                <NumberFormat
                                  value={unStakeBalance}
                                  displayType={'text'}
                                  thousandSeparator={true}
                                />
                              </div>
                              <div className="table-cell px-6 py-3">
                                {getAmountMessageForNextLevel}
                              </div>
                              <div className="table-cell px-6 py-3">
                                <button
                                  className="px-4 py-1 text-xs text-white uppercase rounded-md shadow-lg top-1/2 bg-secondary-500"
                                  onClick={getMaxValueStake}
                                >
                                  max
                                </button>
                              </div>
                            </div>
                            {currentLevel !== 0 && (
                              <div className="table-row">
                                <div className="table-cell px-6 py-3">Staked GMFC</div>
                                <div className="table-cell px-6 py-3">
                                  <NumberFormat
                                    value={totalStaked}
                                    displayType={'text'}
                                    thousandSeparator={true}
                                  />
                                </div>
                                <div className="table-cell px-6 py-3">
                                  Prematurely unstaking GMFC (before{' '}
                                  {moment.unix(maturityTime).utc().format('MM/DD/YYYY @ LT')} (UTC))
                                  will lead to 5% penalty.
                                </div>
                                <div className="table-cell px-6 py-3">
                                  <button
                                    className="px-4 py-1 text-xs text-white uppercase rounded-md shadow-lg top-1/2 bg-secondary-500"
                                    onClick={getMaxValueUnStake}
                                  >
                                    max
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="mt-8 flex flex-col items-center">
                          <NumberFormat
                            thousandSeparator={true}
                            value={amountStake.value.toNumber()}
                            onValueChange={(values) => {
                              const { formattedValue, value } = values;
                              if (!isEmpty(value)) {
                                if (
                                  new Decimal(value).toNumber() <=
                                  new Decimal(unStakeBalance).toNumber()
                                ) {
                                  /* setSliderValue(() => {
                              return new Decimal(value)
                                .times(100)
                                .dividedBy(unStakeBalance)
                                .toNumber();
                            }); */
                                  setAmountStake({
                                    value: new Decimal(value),
                                    formatted: formattedValue,
                                  });
                                } else {
                                  setAmountStake({
                                    value: new Decimal(unStakeBalance),
                                    formatted: formattedValue,
                                  });
                                }
                              } else {
                                /* setSliderValue(() => {
                            return new Decimal(0).toNumber();
                          }); */
                                setAmountStake({
                                  value: new Decimal(0),
                                  formatted: '0',
                                });
                              }
                            }}
                            onFocus={(e) => e.target.select()}
                            className="flex-1 px-2 py-2 text-2xl text-right bg-transparent border border-gray-500 rounded-md text-interteal focus:outline-none w-full md:max-w-xl"
                          />
                          <div className="flex mt-8 gap-2 flex-col md:flex-row">
                            <button
                              className="h-12 px-2 py-1 text-base text-center text-white rounded-full bg-8A2020 hover:bg-opacity-60 w-48"
                              onClick={confirmStake}
                            >
                              Stake
                            </button>
                            <button
                              className={clsx(
                                'text-center text-base h-12 px-2 py-1 text-staking_btn rounded-full w-48 bg-transparent border border-8A2020',
                                {
                                  'hover:border-white hover:text-white': !unStakeDisabled,
                                  'cursor-not-allowed': unStakeDisabled,
                                },
                              )}
                              onClick={confirmUnStake}
                              disabled={unStakeDisabled}
                            >
                              Unstake
                            </button>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="mt-8 text-center text-base">
                        Please connect wallet to show details
                      </div>
                    )}
                  </div>
                </div>
              )}
              {tierUserTab === 1 && (
                <div className="overflow-x-auto">
                  <div className="table border-collapse text-white rounded-lg text-sm bg-222228 mt-7 mx-auto">
                    <div className="table-row overflow-visible font-bold bg-191920">
                      <div className="table-cell px-6 py-3 rounded-tl-lg"></div>
                      <div className="table-cell px-6 py-3">Stone</div>
                      <div className="table-cell px-6 py-3">Bronze</div>
                      <div className="table-cell px-6 py-3">Silver</div>
                      <div className="table-cell px-6 py-3">Gold</div>
                      <div className="table-cell px-6 py-3 rounded-tr-lg">Platinum</div>
                    </div>
                    <div className="table-row border-37373D border-b">
                      <div className="table-cell px-6 py-3">Minimum GMFC required</div>
                      <div className="table-cell px-6 py-3">1,500</div>
                      <div className="table-cell px-6 py-3">15,000</div>
                      <div className="table-cell px-6 py-3">50,000</div>
                      <div className="table-cell px-6 py-3">65,000</div>
                      <div className="table-cell px-6 py-3">80,000</div>
                    </div>
                    <div className="table-row border-37373D border-b">
                      <div className="table-cell px-6 py-3">Minimum stalking time required</div>
                      <div className="table-cell px-6 py-3 text-center">
                        <Image width={14} height={14} src="/images/staking/close.svg" alt="close" />
                      </div>
                      <div className="table-cell px-6 py-3 text-center">
                        <Image width={14} height={14} src="/images/staking/close.svg" alt="close" />
                      </div>
                      <div className="table-cell px-6 py-3 text-center">
                        <Image width={14} height={14} src="/images/staking/close.svg" alt="close" />
                      </div>
                      <div className="table-cell px-6 py-3 text-center">
                        <Image width={14} height={14} src="/images/staking/close.svg" alt="close" />
                      </div>
                      <div className="table-cell px-6 py-3 text-center">
                        <Image width={14} height={14} src="/images/staking/close.svg" alt="close" />
                      </div>
                    </div>
                    <div className="table-row border-37373D border-b">
                      <div className="table-cell px-6 py-3">Unstaking prematurely</div>
                      <div className="table-cell px-6 py-3 text-center">
                        <Image width={14} height={14} src="/images/staking/close.svg" alt="close" />
                      </div>
                      <div className="table-cell px-6 py-3 text-center">
                        <Image width={14} height={14} src="/images/staking/close.svg" alt="close" />
                      </div>
                      <div className="table-cell px-6 py-3 text-center">
                        <Image width={14} height={14} src="/images/staking/close.svg" alt="close" />
                      </div>
                      <div className="table-cell px-6 py-3 text-center">
                        <Image width={14} height={14} src="/images/staking/close.svg" alt="close" />
                      </div>
                      <div className="table-cell px-6 py-3 text-center">
                        <Image width={14} height={14} src="/images/staking/close.svg" alt="close" />
                      </div>
                    </div>
                    <div className="table-row border-37373D border-b">
                      <div className="table-cell px-6 py-3">Guaranteed allocation</div>
                      <div className="table-cell px-6 py-3 text-center">
                        <Image
                          width={14}
                          height={14}
                          src="/images/staking/checked.svg"
                          alt="checked"
                        />
                      </div>
                      <div className="table-cell px-6 py-3 text-center">
                        <Image
                          width={14}
                          height={14}
                          src="/images/staking/checked.svg"
                          alt="checked"
                        />
                      </div>
                      <div className="table-cell px-6 py-3 text-center">
                        <Image
                          width={14}
                          height={14}
                          src="/images/staking/checked.svg"
                          alt="checked"
                        />
                      </div>
                      <div className="table-cell px-6 py-3 text-center">
                        <Image
                          width={14}
                          height={14}
                          src="/images/staking/checked.svg"
                          alt="checked"
                        />
                      </div>
                      <div className="table-cell px-6 py-3 text-center">
                        <Image
                          width={14}
                          height={14}
                          src="/images/staking/checked.svg"
                          alt="checked"
                        />
                      </div>
                    </div>
                    <div className="table-row border-37373D border-b">
                      <div className="table-cell px-6 py-3">Levels of guaranteed allocation</div>
                      <div className="table-cell px-6 py-3 text-center">1</div>
                      <div className="table-cell px-6 py-3 text-center">13</div>
                      <div className="table-cell px-6 py-3 text-center">50</div>
                      <div className="table-cell px-6 py-3 text-center">70</div>
                      <div className="table-cell px-6 py-3 text-center">100</div>
                    </div>
                    <div className="table-row border-37373D border-b">
                      <div className="table-cell px-6 py-3">Exclusive Stakers rounds</div>
                      <div className="table-cell px-6 py-3 text-center">
                        <Image
                          width={14}
                          height={14}
                          src="/images/staking/checked.svg"
                          alt="checked"
                        />
                      </div>
                      <div className="table-cell px-6 py-3 text-center">
                        <Image
                          width={14}
                          height={14}
                          src="/images/staking/checked.svg"
                          alt="checked"
                        />
                      </div>
                      <div className="table-cell px-6 py-3 text-center">
                        <Image
                          width={14}
                          height={14}
                          src="/images/staking/checked.svg"
                          alt="checked"
                        />
                      </div>
                      <div className="table-cell px-6 py-3 text-center">
                        <Image
                          width={14}
                          height={14}
                          src="/images/staking/checked.svg"
                          alt="checked"
                        />
                      </div>
                      <div className="table-cell px-6 py-3 text-center">
                        <Image
                          width={14}
                          height={14}
                          src="/images/staking/checked.svg"
                          alt="checked"
                        />
                      </div>
                    </div>
                    <div className="table-row">
                      <div className="table-cell px-6 py-3">Private prosperity allocation</div>
                      <div className="table-cell px-6 py-3 text-center">
                        <Image width={14} height={14} src="/images/staking/close.svg" alt="close" />
                      </div>
                      <div className="table-cell px-6 py-3 text-center">
                        <Image width={14} height={14} src="/images/staking/close.svg" alt="close" />
                      </div>
                      <div className="table-cell px-6 py-3 text-center">
                        <Image width={14} height={14} src="/images/staking/close.svg" alt="close" />
                      </div>
                      <div className="table-cell px-6 py-3 text-center">
                        <Image width={14} height={14} src="/images/staking/close.svg" alt="close" />
                      </div>
                      <div className="table-cell px-6 py-3 text-center">
                        <Image
                          width={14}
                          height={14}
                          src="/images/staking/checked.svg"
                          alt="checked"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Staking;
