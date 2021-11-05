import { IAllocationLevel } from '../shared/interface';

export const allocationLevels: IAllocationLevel[] = [
  {
    level: 1,
    title: 'Level 1',
    minAllocation: 400,
    allocationRatio: 1,
    color: '#BE0369',
    textColor: '#fff',
  },
  {
    level: 2,
    title: 'Level 2',
    minAllocation: 8000,
    allocationRatio: 10,
    color: '#7B11A4',
    textColor: '#fff',
  },
  {
    level: 3,
    title: 'Level 3',
    minAllocation: 24000,
    allocationRatio: 50,
    color: '#421BD6',
    textColor: '#fff',
  },
  {
    level: 4,
    title: 'Level 4',
    minAllocation: 40000,
    allocationRatio: 110,
    color: '#266CDD',
    textColor: '#fff',
  },
  {
    level: 5,
    title: 'Level 5',
    minAllocation: 80000,
    allocationRatio: 250,
    color: '#01D8E4',
    textColor: '#fff',
  },
];
