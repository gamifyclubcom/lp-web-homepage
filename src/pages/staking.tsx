import clsx from 'clsx';
import Decimal from 'decimal.js';
import moment from 'moment';
import Image from 'next/image';
import Link from 'next/link';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { useEffect, useState } from 'react';
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
import InputRange from '../components/shared/Slider/InputRange';
import { allocationLevels, envConfig } from '../configs';
import { useAlert } from '../hooks/useAlert';
import useSmartContract from '../hooks/useSmartContract';
import { useGlobal } from '../hooks/useGlobal';
import { poolAPI } from '../sdk/pool';
import { IAllocationLevel } from '../shared/interface';
import { getUserAllocationLevel, isEmpty } from '../utils/helper';


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
  const [sliderValue, setSliderValue] = useState(0);
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
  const [amountUnStake, setAmountUnStake] = useState<{
    value: Decimal;
    formatted: string;
  }>({
    value: new Decimal(0),
    formatted: '0',
  });

  useEffect(() => {
    fetchOnChainData();
  }, [connected, isolaDecimals]);

  useEffect(() => {
    fetchInitInfo();
  }, []);

  const fetchInitInfo = () => {
    let decimal: number;
    getTokenDecimals(ISOLA_TOKEN_ADDRESS)
      .then(data => {
        decimal = data;
        setIsolaDecimals(decimal);
        return getUserTiersData(decimal);
      })
      .then(data => {
        setLevels(prev => {
          const result = prev.map(l => {
            let minAllocation: number;
            switch (l.level) {
              case 1:
                minAllocation = data.tier1.min_amount;
                break;
              case 2:
                minAllocation = data.tier2.min_amount;
                break;
              case 3:
                minAllocation = data.tier3.min_amount;
                break;
              case 4:
                minAllocation = data.tier4.min_amount;
                break;
              case 5:
              default:
                minAllocation = data.tier5.min_amount;
                break;
            }
            const newLevel: IAllocationLevel = { ...l, minAllocation };

            return newLevel;
          });

          return result;
        });
      });
  };

  const fetchOnChainData = () => {
    if (connected) {
      let start_staked: number;
      getUserStakeData()
        .then(data => {
          start_staked = data.start_staked;
          setCurrentLevel(data.allocation_level);
          setTotalStaked(data.total_staked);
          return getUserTiersData(isolaDecimals);
        })
        .then(data => {
          const un_stake_time = new Decimal(start_staked)
            .plus(new Decimal(data.min_days_stake).times(24).times(3600))
            .toNumber();
          const un_stake_time_left = moment
            .unix(now)
            .isBefore(moment.unix(un_stake_time))
            ? new Decimal(un_stake_time)
                .minus(moment.unix(now).unix())
                .toNumber()
            : 0;
          const total_time = new Decimal(data.min_days_stake)
            .times(24)
            .times(3600)
            .toNumber();
          setMinDaysStakes(data.min_days_stake);
          setTotalTime(total_time);
          setUnStakeTimeLeft(un_stake_time_left);
          setPenaltyWidthDraw(data.penalty_withdraw);
          setMaturityTime(un_stake_time);
          return getUserTokenBalance();
        })
        .then(isolaBalance => {
          setUnStakeBalance(isolaBalance);
        });
    } else {
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
      setAmountUnStake({
        value: new Decimal(0),
        formatted: '0',
      });
    }
  };

  const getMaxValueStake = () => {
    if (!connected) {
      alertError('Please connect your wallet');
    } else {
      getMaxAmountUserCanStake(isolaDecimals).then(data => {
        setSliderValue(100);
        setAmountStake({
          value: new Decimal(data),
          formatted: data.toString(),
        });
      });
    }
  };

  const getMaxValueUnStake = () => {
    if (!connected) {
      alertError('Please connect your wallet');
    } else {
      getMaxAmountUserCanUnStake().then(data => {
        setAmountUnStake({
          value: new Decimal(data),
          formatted: data.toString(),
        });
      });
    }
  };

  const confirmStake = () => {
    if (amountStake.value.lessThanOrEqualTo(0)) {
      alertError('Please enter greater amount');
    } else {
      const newLevel = getUserAllocationLevel(
        new Decimal(totalStaked).plus(amountStake.value).toNumber(),
        levels
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

  const confirmUnStake = () => {
    if (amountUnStake.value.lessThanOrEqualTo(0)) {
      alertError('Please enter greater amount');
    } else if (amountUnStake.value.greaterThan(totalStaked)) {
      alertError(
        'Please enter a smaller amount. It does not exceed the total staked amount.'
      );
    } else {
      let start_staked: number;
      getUserStakeData()
        .then(stakeData => {
          start_staked = stakeData.start_staked;
          return getUserTiersData(isolaDecimals);
        })
        .then(tierData => {
          const un_stake_time = new Decimal(start_staked)
            .plus(new Decimal(tierData.min_days_stake).times(24).times(3600))
            .toNumber();
          const un_stake_time_left = moment
            .unix(now)
            .isBefore(moment.unix(un_stake_time))
            ? new Decimal(un_stake_time)
                .minus(moment.unix(now).unix())
                .toNumber()
            : 0;

          setUnStakeTimeLeft(un_stake_time_left);
          confirmAlert({
            customUI: ({ onClose }) => {
              return (
                <ConfirmUnStakeModal
                  onClose={onClose}
                  onConfirm={() => handleUnStake(unStakeTimeLeft)}
                  mintTo={ISOLA_TOKEN_NAME}
                  totalAmount={amountUnStake.value.toNumber()}
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
        });
    }
  };

  const handleStake = () => {
    let txId: string;
    setSpinning(true);
    getUserTokenBalance().then(data => {
      // check user balance enough
      if (amountStake.value.greaterThan(new Decimal(data))) {
        alertError(`Your ${ISOLA_TOKEN_NAME} balance is not enough.`);
        setSpinning(false);
        return;
      }

      // TODO: Need update more
      return (
        handleUserStake(amountStake.value.toNumber())
          .then(data => {
            txId = data;
            return fetchOnChainData();
          })
          // TODO: update after API deploy to production
          .then(() => {
            return poolAPI.createUserStakeHistory(
              publicKey!.toString(),
              amountStake.value.toNumber(),
              'stake'
            );
          })
          .then(() => {
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
          })
          .catch(err => {
            if (typeof err.err === 'undefined') {
              alertError(err.message);
            }
          })
          .finally(() => {
            setAmountUnStake({
              value: new Decimal(0),
              formatted: '0',
            });
            setAmountStake({
              value: new Decimal(0),
              formatted: '0',
            });
            setSpinning(false);
          })
      );
    });
  };

  const handleUnStake = (timeLeft: number) => {
    let txId: string;
    setSpinning(true);
    getUserTokenBalance().then(data => {
      // check user balance enough
      if (amountUnStake.value.greaterThan(new Decimal(totalStaked))) {
        alertError(`Your ${ISOLA_TOKEN_NAME} balance is not enough.`);
        setSpinning(false);
        return;
      }

      // TODO: Need update more
      return (
        handleUserUnStake(amountUnStake.value.toNumber())
          .then(data => {
            txId = data;
            return fetchOnChainData();
          })
          // TODO: update after API deploy to production
          .then(() => {
            return poolAPI.createUserStakeHistory(
              publicKey!.toString(),
              amountUnStake.value.toNumber(),
              'unstake'
            );
          })
          .then(() => {
            confirmAlert({
              customUI: ({ onClose }) => {
                return (
                  <UnStakeSuccessModal
                    onClose={onClose}
                    mintTo={ISOLA_TOKEN_NAME}
                    totalAmount={amountUnStake.value.toNumber()}
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
          })
          .catch(err => {
            if (typeof err.err === 'undefined') {
              alertError(err.message);
            }
          })
          .finally(() => {
            setAmountUnStake({
              value: new Decimal(0),
              formatted: '0',
            });
            setAmountStake({
              value: new Decimal(0),
              formatted: '0',
            });
            setSpinning(false);
          })
      );
    });
  };

  return (
    <Layout title={PageTitle.StakingPage}>
      <LoadingScreen loading={loading || spinning} />
      <div className='staking-bg'>
        <div className='flex flex-col items-center w-full max-w-screen-xl px-5 mx-auto text-white xl:px-0'>
          <div className='max-w-screen-lg'>
            <div className='pt-12 text-2xl md:text-3xl text-staking'>
            Stake your GMFC to gain access to the upcoming quality projects
            </div>
            <div className='mt-4 text-lg'>
            In order to participate in pools on Gamify, you will need to stake GMFC tokens. 
            The amount of tokens you hold will dictate how much allocation you will get.
            </div>

            <div className='flex flex-col items-center w-full pt-6 mx-auto my-6'>
              <div className='w-full mb-4 text-xl font-bold tracking-wider text-center text-white'>
                Levels of guaranteed allocation:
              </div>
              <Guarantees levels={allocationLevels} />
            </div>

            <div className='flex flex-col items-center pt-20 mx-auto my-10'>
              <div className='text-xs font-semibold text-white'>
              * W = Pool Weight
              </div>
            </div>
          </div>

          <div className='pt-10'>
          <div className='grid w-full max-w-screen-lg gap-5 has-1-col bg-hero-pattern bg-hero-pattern bg-100% bg-no-repeat bg-center-50%'>
          {currentLevel > 0 && (
            <div className='flex justify-center w-full max-w-screen-lg pt-25 pb-10 ralative '>
              <div className='relative staked-bars'>
                <div className={`lv${currentLevel}-onbar lvl-bar`}>
                  <div className='lvl-dot'>
                    <svg xmlns='http://www.w3.org/2000/svg'>
                      <path data-name='Polygon 4' d='M9.5 0L19 16H0z' />
                    </svg>
                    Your Level
                  </div>
                </div>
              </div>
            </div>
          )}
          
            {(!totalStaked || totalStaked <= 0) && (
              <div className='p-6 text-center border border-white rounded-xl'>
                You have <b>NOT</b> staked any GMFC yet
              </div>
            )}

            <div className='grid grid-cols-1 gap-4 lg:grid-cols-2 mb-6'>
              {/* HAS STAKED ISOLA STATE */}
              {/* %%%%%%%%%%%%%%%% SIDE NOTE: the bg of the header and unstake buttons must match the level of staking color. %%%%%%%%%%%%%%%%% */}
              {/* %%%%%%%%%%%%%%%% level 1: BE0369    level2: 7B11A4   level3: 421BD6   level4:266CDD   level5: 01D8E4 %%%%%%%%%%%%%%%%% */}
              <div className='flex flex-col'>
                <div
                  className={clsx(
                    'flex flex-row justify-between items-center rounded-t-lg p-3 bg-stake_level_1',
                    {
                      'bg-stake_level_1': currentLevel === 1,
                      'bg-stake_level_2': currentLevel === 2,
                      'bg-stake_level_3': currentLevel === 3,
                      'bg-stake_level_4': currentLevel === 4,
                      'bg-stake_level_5': currentLevel === 5,
                    }
                  )}
                >
                  <div>
                    <div className='text-sm'>Total GMFC Staked</div>
                    <div className='text-2xl font-semibold'>
                      <NumberFormat
                        value={totalStaked}
                        thousandSeparator
                        className='bg-transparent'
                        displayType='text'
                      />
                    </div>
                  </div>
                  <div>
                    <div className='px-10 py-2 border border-white rounded-lg'>
                      Level {currentLevel}
                    </div>
                  </div>
                </div>
                <div className='flex flex-col items-center p-3 bg-gray-900 rounded-b-lg'>
                  <div className='relative w-full'>
                    <button
                      className='absolute px-2 py-1 text-xs font-semibold text-white uppercase transform -translate-y-1/2 rounded-md shadow-lg top-1/2 bg-fuchsia-800 left-2'
                      onClick={getMaxValueUnStake}
                    >
                      max
                    </button>
                    <NumberFormat
                      thousandSeparator={true}
                      value={amountUnStake.value.toNumber()}
                      onValueChange={values => {
                        const { formattedValue, value } = values;
                        if (!isEmpty(value)) {
                          setAmountUnStake({
                            value: new Decimal(value),
                            formatted: formattedValue,
                          });
                        } else {
                          setAmountUnStake({
                            value: new Decimal(0),
                            formatted: '0',
                          });
                        }
                      }}
                      onFocus={e => e.target.select()}
                      className='flex-1 w-full px-2 py-3 pl-16 pr-2 text-3xl font-medium text-right bg-black bg-opacity-75 border border-gray-500 rounded-md text-interteal focus:outline-none'
                    />
                  </div>
                  {totalStaked > 0 && (
                    <>
                      <button
                        className={clsx(
                          'mt-3 flex items-center justify-center text-center text-lg h-12 px-2 py-1 text-white rounded-full w-full hover:bg-opacity-60 bg-stake_level_1',
                          {
                            'bg-stake_level_1': currentLevel === 1,
                            'bg-stake_level_2': currentLevel === 2,
                            'bg-stake_level_3': currentLevel === 3,
                            'bg-stake_level_4': currentLevel === 4,
                            'bg-stake_level_5': currentLevel === 5,
                          }
                        )}
                        onClick={confirmUnStake}
                      >
                        Unstake
                      </button>
                      {currentLevel > 0 && (
                        <span className='max-w-xs my-6 text-sm text-center'>
                          You will be able to unstake these tokens on without
                          penalty on{' '}
                          {moment
                            .unix(maturityTime)
                            .utc()
                            .format('MM/DD/YYYY @ LT')}{' '}
                          (UTC)
                        </span>
                      )}
                    </>
                  )}
                </div>
              </div>
              {/* END HAS STAKED ISOLA STATE */}

              {/* STAKED ISOLA BOX */}
              <div>
                <div className='flex flex-col p-3 bg-gray-900 rounded-lg'>
                  <div className='pb-4 text-xl uppercase'>Stake your GMFC</div>
                  <div className='flex flex-col justify-between p-2 bg-black rounded-lg opacity-75'>
                    <div className='grid w-full gap-3 has-1-col md:grid-cols-2'>
                      <div className='flex items-center w-full pb-3 md:pb-0'>
                        <div className='flex items-start'>
                          <div className='flex items-center overflow-hidden justify-items-center bg-1e1945'>
                            <Image
                              width={32}
                              height={32}
                              src='/images/gamify_logo.svg'
                              alt="gamify logo"
                            />
                          </div>
                          <div className='flex flex-col pl-2'>
                            <span className='text-xs text-white opacity-75'>
                              Unstaked Balance
                            </span>
                            <span className='text-sm text-white'>
                              <NumberFormat
                                value={unStakeBalance}
                                thousandSeparator
                                displayType='text'
                                className='bg-transparent'
                              />
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className='relative w-full'>
                        <button
                          className='absolute px-2 py-1 text-xs font-semibold text-white uppercase transform -translate-y-1/2 rounded-md shadow-lg top-1/2 bg-fuchsia-800 left-2'
                          onClick={getMaxValueStake}
                        >
                          max
                        </button>
                        <NumberFormat
                          thousandSeparator={true}
                          value={amountStake.value.toNumber()}
                          onValueChange={values => {
                            const { formattedValue, value } = values;
                            if (!isEmpty(value)) {
                              if(new Decimal(value).toNumber() <= new Decimal(unStakeBalance).toNumber()) {
                                setSliderValue(() => {
                                  return new Decimal(value)
                                    .times(100)
                                    .dividedBy(unStakeBalance)
                                    .toNumber();
                                });
                                setAmountStake({
                                  value: new Decimal(value),
                                  formatted: formattedValue,
                                });
                              }
                            } else {
                              setSliderValue(() => {
                                return new Decimal(0).toNumber();
                              });
                              setAmountStake({
                                value: new Decimal(0),
                                formatted: '0',
                              });
                            }
                          }}
                          onFocus={e => e.target.select()}
                          className='flex-1 w-full px-2 py-1 pl-16 pr-2 text-3xl font-medium text-right bg-transparent border border-gray-500 rounded-md text-interteal focus:outline-none'
                        />
                      </div>
                    </div>

                    <div className='w-full my-12'>
                      <InputRange
                        value={sliderValue}
                        setValue={setSliderValue}
                        min={0}
                        max={100}
                        initValue={0}
                        onChange={currValue => {
                          setAmountStake(() => {
                            const newAmount = new Decimal(unStakeBalance)
                              .times(currValue)
                              .dividedBy(100);
                            return {
                              value: newAmount,
                              formatted: newAmount.toFixed(isolaDecimals),
                            };
                          });
                        }}
                      />
                    </div>
                  </div>
                  <button
                    className='flex items-center justify-center w-full h-12 px-2 py-1 mt-3 text-lg text-center text-white rounded-full bg-staking hover:bg-opacity-60'
                    onClick={confirmStake}
                  >
                    Stake
                  </button>
                </div>
              </div>
              {/* END STAKED ISOLA BOX */}
            </div>

          </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Staking;
