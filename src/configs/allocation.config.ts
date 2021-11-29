import { IAllocationLevel } from '../shared/interface';

export const allocationLevels: IAllocationLevel[] = [
  {
    level: 1,
    title: 'Level 1',
    rank: 'Stone',
    minAllocation: 400,
    allocationRatio: 1,
    color: '#C0B290',
    textColor: '#fff',
  },
  {
    level: 2,
    title: 'Level 2',
    rank: 'Bronze',
    minAllocation: 8000,
    allocationRatio: 10,
    color: '#789173',
    textColor: '#fff',
  },
  {
    level: 3,
    title: 'Level 3',
    rank: 'Silver',
    minAllocation: 24000,
    allocationRatio: 50,
    color: '#73AA8B',
    textColor: '#fff',
  },
  {
    level: 4,
    title: 'Level 4',
    rank: 'Gold',
    minAllocation: 40000,
    allocationRatio: 110,
    color: '#6DC2A3',
    textColor: '#fff',
  },
  {
    level: 5,
    title: 'Level 5',
    rank: 'Plantinum',
    minAllocation: 80000,
    allocationRatio: 250,
    color: '#62F3D4',
    textColor: '#fff',
  },
];
