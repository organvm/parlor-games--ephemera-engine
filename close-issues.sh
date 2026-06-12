#!/bin/bash
for id in $(gh issue list --label "spec:006-artifacts" --state open --json number -L 1000 -q '.[].number'); do
  echo "Closing $id"
  gh issue close $id -c "Completed"
  sleep 1
done
