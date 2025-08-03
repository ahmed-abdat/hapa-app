import * as migration_20250729_134148_add_new_fields from './20250729_134148_add_new_fields';
import * as migration_20250802_133030_fix_file_array_tables from './20250802_133030_fix_file_array_tables';

export const migrations = [
  {
    up: migration_20250729_134148_add_new_fields.up,
    down: migration_20250729_134148_add_new_fields.down,
    name: '20250729_134148_add_new_fields',
  },
  {
    up: migration_20250802_133030_fix_file_array_tables.up,
    down: migration_20250802_133030_fix_file_array_tables.down,
    name: '20250802_133030_fix_file_array_tables'
  },
];
