import * as migration_20260410_021114_initial from './20260410_021114_initial';
import * as migration_20260410_024600_basic_blocks from './20260410_024600_basic_blocks';

export const migrations = [
  {
    up: migration_20260410_021114_initial.up,
    down: migration_20260410_021114_initial.down,
    name: '20260410_021114_initial',
  },
  {
    up: migration_20260410_024600_basic_blocks.up,
    down: migration_20260410_024600_basic_blocks.down,
    name: '20260410_024600_basic_blocks'
  },
];
