export enum PoolStatusType {
  DRAFT = 'draft',
  OPEN = 'open',
  CLOSED = 'closed',
  FILLED = 'filled',
  UPCOMING = 'upcoming',
}

export enum PoolVotingStatusType {
  UPCOMING = 'upcoming',
  IN_VOTING = 'in-voting',
  VALIDATED = 'validated',
  DEACTIVATED = 'deactivated',
}

export enum PoolsSectionFilter {
  UPCOMING = 'upcoming',
  FEATURED = 'featured',
  JOINED = 'joined',
  CREATED = 'created',
  PAST = 'past',
}

export enum PoolsVotingFilter {
  ALL = 'all',
  UPCOMING = 'upcoming-voting',
  IN_VOTING = 'in-voting',
  DEACTIVATED = 'deactivated',
}

export enum PageTitle {
  HomePage = 'Gamify Club - The All-In-One Hub for the Solana Metaverse',
  PoolsPage = 'Gamify Club | Pools Dashboard',
  PoolsVotingPage = 'Gamify Club | Pools Voting',
  StakingPage = 'Gamify Club | Staking',
}

export enum PoolRoundType {
  Whitelist = 'whitelist',
  Fcfs = 'fcfs',
  Exclusive = 'exclusive',
  FcfsStaker = 'fcfs-staker',
}

export enum PoolCountdownType {
  ToOpen = 'countdown-to-open',
  ToClose = 'countdown-to-close',
}
