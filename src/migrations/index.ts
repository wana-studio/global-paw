import * as migration_20260105_092239 from './20260105_092239';
import * as migration_20260106_133102 from './20260106_133102';
import * as migration_20260202_093712 from './20260202_093712';
import * as migration_20260205_074731 from './20260205_074731';

export const migrations = [
  {
    up: migration_20260105_092239.up,
    down: migration_20260105_092239.down,
    name: '20260105_092239',
  },
  {
    up: migration_20260106_133102.up,
    down: migration_20260106_133102.down,
    name: '20260106_133102',
  },
  {
    up: migration_20260202_093712.up,
    down: migration_20260202_093712.down,
    name: '20260202_093712',
  },
  {
    up: migration_20260205_074731.up,
    down: migration_20260205_074731.down,
    name: '20260205_074731'
  },
];
