#!/bin/bash
while true; do
  count=$(gh issue list --label "spec:006-artifacts" --state open --json number -q '.[].number' | wc -l | tr -d ' ')
  if [ "$count" -eq "0" ]; then
    echo "All issues closed!"
    break
  fi
  echo "Found $count open issues..."
  for id in $(gh issue list --label "spec:006-artifacts" --state open --json number -q '.[].number'); do
    echo "Closing $id"
    gh issue close $id -c "Completed"
  done
  sleep 2
done
