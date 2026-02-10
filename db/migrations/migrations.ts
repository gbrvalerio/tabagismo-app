// This file is required for Expo/React Native SQLite migrations - https://orm.drizzle.team/quick-sqlite/expo

import journal from './meta/_journal.json';
import m0000 from './0000_true_gideon';
import m0001 from './0001_add_onboarding_tables';
import m0002 from './0002_add_coins';
import m0003 from './0003_backfill_coins';
import m0004 from './0004_add_coin_transactions';
import m0005 from './0005_backfill_transactions';
import m0006 from './0006_cleanup_old_coin_fields';
import m0007 from './0007_genericize_questions';
import m0008 from './0008_add_onboarding_slides';
import m0009 from './0009_wakeful_the_spike';

export default {
  journal,
  migrations: {
    m0000,
    m0001,
    m0002,
    m0003,
    m0004,
    m0005,
    m0006,
    m0007,
    m0008,
    m0009,
  }
};
