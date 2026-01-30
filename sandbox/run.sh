#!/bin/sh
set -eu

# Expected mounted files:
# /sandbox/main.cpp
# /sandbox/input.txt
# Writes:
# /sandbox/compile_stderr.txt
# /sandbox/run_stderr.txt
# /sandbox/output.txt
# /sandbox/meta.txt

rm -f /sandbox/main /sandbox/output.txt /sandbox/compile_stderr.txt /sandbox/run_stderr.txt /sandbox/meta.txt

# Compile
if ! g++ /sandbox/main.cpp -std=c++20 -O2 -pipe -o /sandbox/main 2> /sandbox/compile_stderr.txt; then
  echo "VERDICT=CE" > /sandbox/meta.txt
  exit 0
fi

# Run (2s wall timeout)
# `timeout` is provided by coreutils
if ! timeout 2s /sandbox/main < /sandbox/input.txt > /sandbox/output.txt 2> /sandbox/run_stderr.txt; then
  code=$?
  # 124 is timeout exit code from coreutils timeout
  if [ "$code" -eq 124 ]; then
    echo "VERDICT=TLE" > /sandbox/meta.txt
  else
    echo "VERDICT=RE" > /sandbox/meta.txt
  fi
  exit 0
fi

echo "VERDICT=OK" > /sandbox/meta.txt
exit 0
