#!/usr/bin/env bash
set -u
cd /Users/thomasek/Kode/McAllisterAlarm/com.mccallister.guard
{
  echo "=== tsc ==="
  npx tsc --noEmit
  echo "tsc-exit=$?"
  echo "=== vitest ==="
  npm test --silent 2>&1 | tail -30
  echo "vitest-exit=${PIPESTATUS[0]}"
  echo "=== homey app validate --level publish ==="
  homey app validate --level publish 2>&1 | tail -30
  echo "validate-exit=${PIPESTATUS[0]}"
} > /tmp/aug-validate.log 2>&1
echo done
