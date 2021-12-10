import { EXCLUSIVE_WEIGHTS_CONFIG } from '@gamify/onchain-program-sdk';
import { IAllocationLevel } from '../shared/interface';

export const allocationLevels: IAllocationLevel[] = [
  {
    level: 1,
    title: 'Level 1',
    rank: 'Stone',
    minAllocation: EXCLUSIVE_WEIGHTS_CONFIG.level1.amount,
    allocationRatio: EXCLUSIVE_WEIGHTS_CONFIG.level1.weight,
    color: '#C0B290',
    textColor: '#fff',
  },
  {
    level: 2,
    title: 'Level 2',
    rank: 'Bronze',
    minAllocation: EXCLUSIVE_WEIGHTS_CONFIG.level2.amount,
    allocationRatio: EXCLUSIVE_WEIGHTS_CONFIG.level2.weight,
    color: '#789173',
    textColor: '#fff',
  },
  {
    level: 3,
    title: 'Level 3',
    rank: 'Silver',
    minAllocation: EXCLUSIVE_WEIGHTS_CONFIG.level3.amount,
    allocationRatio: EXCLUSIVE_WEIGHTS_CONFIG.level3.weight,
    color: '#73AA8B',
    textColor: '#fff',
  },
  {
    level: 4,
    title: 'Level 4',
    rank: 'Gold',
    minAllocation: EXCLUSIVE_WEIGHTS_CONFIG.level4.amount,
    allocationRatio: EXCLUSIVE_WEIGHTS_CONFIG.level4.weight,
    color: '#6DC2A3',
    textColor: '#fff',
  },
  {
    level: 5,
    title: 'Level 5',
    rank: 'Plantinum',
    minAllocation: EXCLUSIVE_WEIGHTS_CONFIG.level5.amount,
    allocationRatio: EXCLUSIVE_WEIGHTS_CONFIG.level5.weight,
    color: '#62F3D4',
    textColor: '#fff',
  },
];
