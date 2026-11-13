#!/usr/bin/env node

import { runCli } from '../dist/packages/cli/index.js';

runCli().catch((err) => {
  console.error('Fatal auteur-ui error:', err);
  process.exit(1);
});
