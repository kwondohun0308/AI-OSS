#!/usr/bin/env bash
# CloudWatch alarm helper for week10 ECS service
set -euo pipefail
if [ -z "${CLUSTER:-}" ] || [ -z "${SERVICE:-}" ] || [ -z "${AWS_REGION:-}" ]; then
  echo "Usage: CLUSTER=... SERVICE=... AWS_REGION=... ./create-cloudwatch-alarms.sh"
  exit 2
fi
ALARM_NAME_CPU="week10-${SERVICE}-cpu-high"
aws cloudwatch put-metric-alarm \
  --alarm-name ${ALARM_NAME_CPU} \
  --metric-name CPUUtilization \
  --namespace AWS/ECS \
  --statistic Average \
  --period 300 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold \
  --dimensions Name=ClusterName,Value=${CLUSTER} Name=ServiceName,Value=${SERVICE} \
  --evaluation-periods 2 \
  --alarm-actions "" \
  --region ${AWS_REGION}
echo "Created alarm: ${ALARM_NAME_CPU}"
