import * as migration_20250729_134148_add_new_fields from './20250729_134148_add_new_fields';

export const migrations = [
  {
    up: migration_20250729_134148_add_new_fields.up,
    down: migration_20250729_134148_add_new_fields.down,
    name: '20250729_134148_add_new_fields'
  },
];
