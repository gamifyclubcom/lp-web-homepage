import * as BufferLayout from 'buffer-layout';

const int64 = (property = 'int64') => {
  return BufferLayout.blob(8, property);
};

const uint64 = (property = 'uint64') => {
  return BufferLayout.blob(8, property);
};

export const ClockLayout = BufferLayout.struct([
  uint64('slot'),
  int64('epoch_start_timestamp'),
  uint64('epoch'),
  uint64('leader_schedule_epoch'),
  int64('unix_timestamp'),
]);
