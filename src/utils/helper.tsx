import { LAMPORTS_PER_SOL } from '@solana/web3.js';

const isSmallNumber = (val: number) => {
  return val < 0.001 && val > 0;
};

const numberFormatter = new Intl.NumberFormat('en-US', {
  style: 'decimal',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const transformLamportsToSOL = (lamports: number): number => {
  return lamports / LAMPORTS_PER_SOL;
};

export const formatNumber = {
  format: (val?: number, useSmall?: boolean) => {
    if (!val && val !== 0) {
      return '--';
    }
    if (useSmall && isSmallNumber(val)) {
      return 0.001;
    }

    return numberFormatter.format(val);
  },
};
