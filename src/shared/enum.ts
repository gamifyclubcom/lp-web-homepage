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
