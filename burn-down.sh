#!/bin/bash
issues=$(gh issue list --label "spec:005-engine" --state open --json number -q '.[].number')

for num in $issues; do
  echo "Closing issue $num..."
  gh issue close $num -c "Completed"
done
