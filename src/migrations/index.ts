import * as migration_20260105_092239 from './20260105_092239';

export const migrations = [
  {
    up: migration_20260105_092239.up,
    down: migration_20260105_092239.down,
    name: '20260105_092239'
  },
];
