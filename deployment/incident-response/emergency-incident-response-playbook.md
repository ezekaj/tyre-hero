# TyreHero Emergency Service - Incident Response Playbook

## 🚨 Emergency Contacts & Escalation

**CRITICAL**: For any incident affecting emergency service availability, immediately notify:

### Immediate Response Team (0-5 minutes)
- **Primary On-Call Engineer**: +44-7XXX-XXXXXX (PagerDuty: @primary-oncall)
- **Secondary On-Call Engineer**: +44-7XXX-XXXXXX (PagerDuty: @secondary-oncall)
- **Emergency Slack Channel**: #emergency-incidents
- **War Room**: https://meet.google.com/emergency-war-room

### Escalation Chain (15+ minutes)
- **Engineering Manager**: +44-7XXX-XXXXXX
- **VP Engineering**: +44-7XXX-XXXXXX
- **CEO**: +44-7XXX-XXXXXX (P1 incidents only)

### External Vendors
- **AWS Enterprise Support**: +44-XXXX-XXXXXX (Case Priority: Business Critical)
- **PagerDuty**: support@pagerduty.com
- **Datadog**: support@datadoghq.com

## 🎯 Incident Severity Levels

### P1 - Critical (Customer Safety Impact)
**Response Time**: 5 minutes | **Update Frequency**: Every 15 minutes
- Emergency service completely unavailable
- Database total failure preventing emergency requests
- Payment system down preventing service completion
- Major security breach

### P2 - High (Service Degraded)
**Response Time**: 15 minutes | **Update Frequency**: Every 30 minutes
- Emergency service severely degraded (>50% capacity loss)
- Response time SLA breach (>90 minutes)
- Regional outage affecting significant customer base
- Authentication system failure

### P3 - Medium (Reduced Functionality)
**Response Time**: 1 hour | **Update Frequency**: Every 2 hours
- Non-critical feature failure
- Performance degradation within SLA
- Minor third-party service issues
- Monitoring/dashboard issues

### P4 - Low (Minimal Impact)
**Response Time**: 4 hours | **Update Frequency**: Daily
- Cosmetic issues
- Development environment problems
- Non-urgent security updates

## 🔍 Incident Response Workflow

### Phase 1: Detection & Initial Response (0-5 minutes)

#### 1.1 Alert Acknowledgment
```bash
# Acknowledge in PagerDuty immediately
# Post in #emergency-incidents channel
echo "🚨 INCIDENT ACKNOWLEDGED by [YOUR_NAME]"
echo "📅 Time: $(date)"
echo "🎯 Initial assessment in progress..."
```

#### 1.2 Initial Triage Questions
- **What**: What exactly is failing? (be specific)
- **When**: When did this start? (check monitoring timestamps)
- **Where**: Which region/service/component?
- **Who**: Are customers affected? How many?
- **Impact**: Can customers call for emergencies?

#### 1.3 Create Incident Record
```bash
# Create incident in management system
INCIDENT_ID="INC-$(date +%Y%m%d-%H%M%S)"
echo "📝 Incident ID: $INCIDENT_ID"

# Update status page immediately for P1/P2
curl -X POST https://api.statuspage.io/v1/pages/PAGE_ID/incidents \
    -H "Authorization: OAuth $STATUSPAGE_TOKEN" \
    -d '{
        "incident": {
            "name": "Emergency Service Investigation '$INCIDENT_ID'",
            "status": "investigating",
            "impact": "critical"
        }
    }'
```

### Phase 2: Assessment & Mobilization (5-15 minutes)

#### 2.1 Rapid Diagnostics
```bash
#!/bin/bash
# Emergency Service Health Check Script

echo "🏥 EMERGENCY SERVICE RAPID DIAGNOSTICS"

# Check primary service endpoints
ENDPOINTS=(
    "https://api.tyrehero.com/health"
    "https://emergency.tyrehero.com/health"
    "https://api.tyrehero.com/api/emergency/status"
)

for endpoint in "${ENDPOINTS[@]}"; do
    HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$endpoint" || echo "000")
    if [ "$HTTP_STATUS" == "200" ]; then
        echo "✅ $endpoint: Healthy"
    else
        echo "❌ $endpoint: HTTP $HTTP_STATUS"
        FAILED_ENDPOINTS+=("$endpoint")
    fi
done

# Check database connectivity
if pg_isready -h $DB_HOST -p $DB_PORT; then
    echo "✅ Database: Connected"
else
    echo "❌ Database: Connection failed"
fi

# Check cache connectivity
if redis-cli -h $CACHE_HOST ping | grep -q PONG; then
    echo "✅ Cache: Connected"
else
    echo "❌ Cache: Connection failed"
fi

# Check ECS service health
RUNNING_TASKS=$(aws ecs describe-services \
    --cluster tyrehero-production \
    --services tyrehero-emergency-api \
    --query 'services[0].runningCount' \
    --output text)

DESIRED_TASKS=$(aws ecs describe-services \
    --cluster tyrehero-production \
    --services tyrehero-emergency-api \
    --query 'services[0].desiredCount' \
    --output text)

echo "🚀 ECS Tasks: $RUNNING_TASKS/$DESIRED_TASKS running"
```

#### 2.2 Determine Severity & Mobilize Team
```python
# Severity Assessment Algorithm
def determine_severity():
    factors = {
        'service_available': check_service_availability(),
        'customer_impact': count_affected_customers(),
        'data_integrity': check_data_integrity(),
        'security_breach': check_security_indicators(),
        'emergency_queue': check_emergency_queue_length()
    }
    
    # P1 Criteria
    if (not factors['service_available'] or 
        factors['customer_impact'] > 1000 or
        factors['security_breach'] or
        factors['emergency_queue'] > 10):
        return 'P1'
    
    # P2 Criteria  
    elif (factors['customer_impact'] > 100 or
          factors['emergency_queue'] > 5):
        return 'P2'
    
    else:
        return 'P3'
```

### Phase 3: Containment & Mitigation (15-30 minutes)

#### 3.1 Emergency Containment Actions
```bash
#!/bin/bash
# Emergency Containment Procedures

SEVERITY="$1"  # P1, P2, P3

case $SEVERITY in
    "P1")
        echo "🚨 P1 EMERGENCY CONTAINMENT"
        
        # Immediate actions for service down
        # 1. Try service restart
        aws ecs update-service \
            --cluster tyrehero-production \
            --service tyrehero-emergency-api \
            --force-new-deployment
        
        # 2. Scale up secondary region
        aws ecs update-service \
            --cluster tyrehero-production-secondary \
            --service tyrehero-emergency-api \
            --desired-count 6 \
            --region eu-west-1
        
        # 3. Activate emergency routing
        ./scripts/activate-emergency-routing.sh
        
        # 4. Alert emergency team
        curl -X POST $SLACK_EMERGENCY_WEBHOOK \
            -d '{"text": "🚨 P1 INCIDENT: Emergency containment activated"}'
        ;;
        
    "P2")
        echo "⚠️ P2 HIGH PRIORITY CONTAINMENT"
        
        # Scale up capacity
        aws ecs update-service \
            --cluster tyrehero-production \
            --service tyrehero-emergency-api \
            --desired-count 12
        
        # Enable additional monitoring
        ./scripts/enable-enhanced-monitoring.sh
        ;;
        
    "P3")
        echo "📊 P3 MONITORING AND ASSESSMENT"
        
        # Enhanced logging
        aws logs put-retention-policy \
            --log-group-name /ecs/tyrehero-emergency \
            --retention-in-days 7
        ;;
esac
```

#### 3.2 Customer Communication (P1/P2 Only)
```bash
#!/bin/bash
# Customer Communication Script

INCIDENT_TYPE="$1"
ESTIMATED_RESOLUTION="$2"

# Update status page
curl -X PATCH https://api.statuspage.io/v1/pages/PAGE_ID/incidents/INCIDENT_ID \
    -H "Authorization: OAuth $STATUSPAGE_TOKEN" \
    -d '{
        "incident": {
            "status": "identified",
            "body": "We have identified the issue affecting our emergency service and are implementing a fix. Estimated resolution: '$ESTIMATED_RESOLUTION'."
        }
    }'

# Send SMS to active emergency request customers
python3 scripts/notify_active_customers.py \
    --message "TyreHero Update: We're resolving a technical issue. Your emergency request is still being processed. ETA: $ESTIMATED_RESOLUTION" \
    --incident-id "$INCIDENT_ID"

# Social media update (manual action reminder)
echo "📱 MANUAL ACTION REQUIRED: Update @TyreHeroUK Twitter/Facebook"
echo "Suggested text: We're currently resolving a technical issue affecting our service. All emergency requests continue to be processed. Updates: https://status.tyrehero.com"
```

### Phase 4: Investigation & Resolution (30+ minutes)

#### 4.1 Detailed Investigation
```bash
#!/bin/bash
# Detailed Investigation Tools

echo "🔍 DETAILED INVESTIGATION STARTED"

# Collect logs from last 2 hours
aws logs filter-log-events \
    --log-group-name /ecs/tyrehero-emergency \
    --start-time $(date -d '2 hours ago' +%s)000 \
    --filter-pattern "ERROR" \
    > investigation_logs.txt

# Database performance analysis
psql -h $DB_HOST -U $DB_USER -d $DB_NAME -c "
    SELECT 
        query,
        calls,
        total_time,
        mean_time,
        stddev_time
    FROM pg_stat_statements 
    WHERE total_time > 1000 
    ORDER BY total_time DESC 
    LIMIT 20;
" > db_performance.txt

# Check for infrastructure issues
aws cloudwatch get-metric-statistics \
    --namespace AWS/ECS \
    --metric-name CPUUtilization \
    --dimensions Name=ServiceName,Value=tyrehero-emergency-api \
    --start-time $(date -d '2 hours ago' -u +%Y-%m-%dT%H:%M:%S) \
    --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
    --period 300 \
    --statistics Average,Maximum

# External dependency check
curl -w "@curl-format.txt" -s -o /dev/null https://api.stripe.com/v1/charges
curl -w "@curl-format.txt" -s -o /dev/null https://maps.googleapis.com/maps/api/geocode/json
```

#### 4.2 Root Cause Analysis Framework
```python
# Root Cause Analysis Template
class IncidentAnalysis:
    def __init__(self, incident_id):
        self.incident_id = incident_id
        self.timeline = []
        self.contributing_factors = []
        self.root_causes = []
    
    def analyze_timeline(self):
        """Build incident timeline"""
        events = [
            "First alert received",
            "Customer reports started",
            "Investigation began", 
            "Root cause identified",
            "Fix implemented",
            "Service restored"
        ]
        return events
    
    def five_whys_analysis(self, initial_problem):
        """Conduct 5 Whys analysis"""
        whys = []
        current_question = f"Why did {initial_problem} occur?"
        
        # This would be filled manually during investigation
        return whys
    
    def identify_contributing_factors(self):
        """Identify all contributing factors"""
        categories = {
            'technical': [],
            'process': [],
            'human': [],
            'external': []
        }
        return categories
```

#### 4.3 Common Resolution Patterns
```bash
#!/bin/bash
# Common Resolution Patterns

resolve_database_issues() {
    echo "🗄️ Resolving database issues..."
    
    # Check connections
    psql -h $DB_HOST -c "SELECT count(*) FROM pg_stat_activity;"
    
    # Kill long-running queries
    psql -h $DB_HOST -c "
        SELECT pg_terminate_backend(pid) 
        FROM pg_stat_activity 
        WHERE state = 'active' 
        AND query_start < NOW() - INTERVAL '5 minutes'
        AND query NOT LIKE '%pg_stat_activity%';
    "
    
    # Restart connection pooler
    kubectl rollout restart deployment pgbouncer
}

resolve_application_issues() {
    echo "🚀 Resolving application issues..."
    
    # Rolling restart of application
    aws ecs update-service \
        --cluster tyrehero-production \
        --service tyrehero-emergency-api \
        --force-new-deployment
    
    # Clear application cache
    redis-cli -h $CACHE_HOST FLUSHALL
    
    # Warm critical caches
    curl -X POST https://api.tyrehero.com/admin/cache/warm \
        -H "Authorization: Bearer $ADMIN_TOKEN"
}

resolve_infrastructure_issues() {
    echo "🏗️ Resolving infrastructure issues..."
    
    # Scale up capacity
    aws ecs update-service \
        --cluster tyrehero-production \
        --service tyrehero-emergency-api \
        --desired-count 10
    
    # Check ALB health
    aws elbv2 describe-target-health \
        --target-group-arn $TARGET_GROUP_ARN
}
```

### Phase 5: Recovery & Validation (Resolution)

#### 5.1 Service Recovery Validation
```bash
#!/bin/bash
# Service Recovery Validation

echo "✅ SERVICE RECOVERY VALIDATION"

# 1. Health check all endpoints
for endpoint in "api.tyrehero.com" "emergency.tyrehero.com"; do
    for i in {1..5}; do
        if curl -f "https://$endpoint/health"; then
            echo "✅ $endpoint: Healthy (attempt $i)"
            break
        else
            echo "❌ $endpoint: Still unhealthy (attempt $i)"
            sleep 30
        fi
    done
done

# 2. End-to-end functional test
TEST_RESULT=$(curl -X POST https://api.tyrehero.com/api/emergency/test \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TEST_TOKEN" \
    -d '{
        "customer_name": "Incident Test",
        "phone_number": "+447000000000",
        "location": "Test Location",
        "issue": "flat",
        "test": true
    }')

if echo "$TEST_RESULT" | jq -e '.success'; then
    echo "✅ End-to-end test passed"
else
    echo "❌ End-to-end test failed"
    exit 1
fi

# 3. Performance validation
RESPONSE_TIME=$(curl -w "%{time_total}" -s -o /dev/null https://api.tyrehero.com/health)
if (( $(echo "$RESPONSE_TIME < 1.0" | bc -l) )); then
    echo "✅ Response time acceptable: ${RESPONSE_TIME}s"
else
    echo "⚠️ Response time high: ${RESPONSE_TIME}s"
fi

# 4. Check queue backlog
QUEUE_LENGTH=$(curl -s https://api.tyrehero.com/api/emergency/queue/length)
if [ "$QUEUE_LENGTH" -lt 5 ]; then
    echo "✅ Queue length normal: $QUEUE_LENGTH"
else
    echo "⚠️ Queue backlog exists: $QUEUE_LENGTH requests"
fi
```

#### 5.2 Customer Communication (Resolution)
```bash
#!/bin/bash
# Resolution Communication

echo "📢 COMMUNICATING RESOLUTION"

# Update status page to resolved
curl -X PATCH https://api.statuspage.io/v1/pages/PAGE_ID/incidents/INCIDENT_ID \
    -H "Authorization: OAuth $STATUSPAGE_TOKEN" \
    -d '{
        "incident": {
            "status": "resolved",
            "body": "The issue has been resolved. All emergency services are operating normally."
        }
    }'

# Notify internal teams
curl -X POST $SLACK_WEBHOOK \
    -d '{
        "text": "✅ INCIDENT RESOLVED",
        "attachments": [{
            "color": "good",
            "fields": [
                {"title": "Incident ID", "value": "'$INCIDENT_ID'", "short": true},
                {"title": "Duration", "value": "'$(date -d @$(($(date +%s) - $INCIDENT_START_TIME)) -u +%H:%M:%S)'", "short": true},
                {"title": "Status", "value": "All services operational", "short": false}
            ]
        }]
    }'

# Customer follow-up (if needed)
if [ "$CUSTOMER_IMPACT" = "true" ]; then
    python3 scripts/send_resolution_email.py --incident-id "$INCIDENT_ID"
fi
```

### Phase 6: Post-Incident Activities

#### 6.1 Immediate Post-Incident (Within 2 hours)
```bash
#!/bin/bash
# Immediate Post-Incident Actions

echo "📋 POST-INCIDENT IMMEDIATE ACTIONS"

# 1. Collect all relevant data
mkdir -p incident-data/$INCIDENT_ID
aws logs create-export-task \
    --log-group-name /ecs/tyrehero-emergency \
    --from $(($INCIDENT_START_TIME * 1000)) \
    --to $(($INCIDENT_END_TIME * 1000)) \
    --destination incident-data/$INCIDENT_ID

# 2. Create preliminary incident report
cat > incident-data/$INCIDENT_ID/preliminary-report.md << EOF
# Preliminary Incident Report - $INCIDENT_ID

## Summary
- **Start Time**: $(date -d @$INCIDENT_START_TIME)
- **End Time**: $(date -d @$INCIDENT_END_TIME)
- **Duration**: $(date -d @$((INCIDENT_END_TIME - INCIDENT_START_TIME)) -u +%H:%M:%S)
- **Severity**: $SEVERITY
- **Customer Impact**: $CUSTOMER_IMPACT_COUNT customers affected

## Timeline
- Initial alert: $(date -d @$INCIDENT_START_TIME)
- Investigation started: $(date -d @$((INCIDENT_START_TIME + 300)))
- Root cause identified: $(date -d @$((INCIDENT_START_TIME + 1800)))
- Resolution implemented: $(date -d @$((INCIDENT_END_TIME - 300)))
- Service restored: $(date -d @$INCIDENT_END_TIME)

## Next Steps
- [ ] Detailed post-mortem within 48 hours
- [ ] Action items identified and assigned
- [ ] Follow-up monitoring for 24 hours
EOF

# 3. Schedule post-mortem meeting
echo "📅 Schedule post-mortem meeting within 48 hours"
echo "📧 Send calendar invite to: [incident responders, management, stakeholders]"
```

#### 6.2 Post-Mortem Template
```markdown
# Post-Mortem: [INCIDENT_ID] - [BRIEF_DESCRIPTION]

**Date**: [DATE]
**Facilitator**: [NAME]
**Attendees**: [LIST]

## Executive Summary
[2-3 sentence summary of what happened and impact]

## Timeline
| Time | Event | Action Taken |
|------|-------|--------------|
| 14:32 | First alert received | On-call engineer acknowledged |
| 14:35 | Investigation started | Checked service health |
| 14:45 | Root cause identified | Database connection pool exhausted |
| 15:00 | Fix implemented | Restarted connection pooler |
| 15:10 | Service restored | Verified all endpoints healthy |

## Root Cause Analysis

### What Happened
[Detailed explanation of the incident]

### Why It Happened
[5 Whys analysis or other RCA method]

### Contributing Factors
- **Technical**: [Technical issues that contributed]
- **Process**: [Process gaps that contributed]  
- **Human**: [Human factors that contributed]

## Impact Assessment
- **Duration**: [Total downtime]
- **Customers Affected**: [Number and details]
- **Revenue Impact**: [If applicable]
- **SLA Breach**: [Yes/No and details]

## What Went Well
- [Things that worked well during response]
- [Effective monitoring/alerting]
- [Good communication]

## What Didn't Go Well
- [Areas for improvement]
- [Delays in response]
- [Communication gaps]

## Action Items
| Action | Owner | Due Date | Priority |
|--------|-------|----------|----------|
| Fix connection pool configuration | @engineer | 2025-01-20 | High |
| Improve monitoring for connection exhaustion | @ops | 2025-01-25 | Medium |
| Update runbook with this scenario | @lead | 2025-01-22 | Low |

## Lessons Learned
- [Key takeaways]
- [Process improvements needed]
- [Technical debt to address]
```

## 📞 Emergency Escalation Matrix

### Customer-Facing Incidents
```
P1 Critical Impact:
├── 0-5 min: On-call Engineer + Engineering Manager
├── 15 min: VP Engineering + Customer Success Lead  
├── 30 min: CEO + Board notification (if ongoing)
└── 60 min: External PR support (if needed)

P2 High Impact:
├── 0-15 min: On-call Engineer
├── 30 min: Engineering Manager
└── 2 hours: VP Engineering (if unresolved)
```

### Internal Communication Channels
- **#emergency-incidents**: Real-time updates
- **#leadership**: Executive updates
- **#customer-success**: Customer impact coordination
- **#security**: Security-related incidents

## 🔧 Emergency Toolbox

### Quick Diagnostic Commands
```bash
# Service health
curl -f https://api.tyrehero.com/health

# Database connectivity  
pg_isready -h $DB_HOST

# Cache connectivity
redis-cli -h $CACHE_HOST ping

# ECS service status
aws ecs describe-services --cluster tyrehero-production --services tyrehero-emergency-api

# Recent errors
aws logs filter-log-events --log-group-name /ecs/tyrehero-emergency --filter-pattern "ERROR" --start-time $(date -d '1 hour ago' +%s)000
```

### Emergency Rollback
```bash
# Rollback to previous deployment
aws ecs update-service \
    --cluster tyrehero-production \
    --service tyrehero-emergency-api \
    --task-definition $(aws ecs describe-services --cluster tyrehero-production --services tyrehero-emergency-api --query 'services[0].deployments[1].taskDefinition' --output text)
```

### Emergency Contact Numbers
- **999**: UK Emergency Services (life-threatening situations)
- **AWS Support**: +44-XXXX-XXXXXX
- **Datadog**: Available 24/7 via web chat
- **PagerDuty**: support@pagerduty.com

---

**Remember**: Customer safety is our top priority. When in doubt, escalate quickly and communicate transparently.