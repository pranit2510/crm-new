# VoltFlow CRM - Business Process Flow Documentation

## Overview
VoltFlow is designed to manage the complete electrical services business lifecycle from initial lead capture to final payment collection. This document outlines the logical flow and business rules.

## Core Business Flow

### 1. Lead Management Stage
**Purpose**: Capture and qualify potential customers

**Flow Logic**:
- Lead enters system (website, referral, cold call, etc.)
- Lead Status Progression: `New` → `Contacted` → `Qualified` → `Proposal Sent` → `Negotiation` → Decision
- Decision Outcomes: `Convert to Client` | `Closed-Lost` | `On Hold`

**Business Rules**:
- All leads must have contact information and estimated value
- Follow-up dates are mandatory for active leads
- Leads can only be converted to clients after qualification
- Lost leads should have reason codes for analysis

### 2. Client Management Stage
**Purpose**: Manage active customer relationships

**Flow Logic**:
- Clients created from converted leads OR direct client acquisition
- Client Status: `Active` | `Inactive` | `Prospective`
- Each client has a complete profile with service history

**Business Rules**:
- Converted leads automatically become "Prospective" clients
- Clients become "Active" after first completed job
- Client profiles must include service address and billing information

### 3. Quote/Estimate Stage
**Purpose**: Provide detailed pricing for requested services

**Flow Logic**:
- Quotes created for clients (from leads or existing clients)
- Quote Status: `Draft` → `Sent` → `Reviewed` → `Approved` | `Rejected` | `Expired`
- Approved quotes convert to jobs

**Business Rules**:
- Quotes must be linked to a client
- Quote approval automatically creates a job
- Expired quotes can be renewed with updated pricing
- Quote line items become job tasks

### 4. Job/Work Order Stage
**Purpose**: Execute the actual electrical work

**Flow Logic**:
- Jobs created from approved quotes OR direct service requests
- Job Status: `Scheduled` → `Dispatched` → `In Progress` → `Completed` → `Invoiced`
- Job completion triggers invoice creation

**Business Rules**:
- Jobs must have assigned technicians and scheduled dates
- Materials and labor tracking throughout job lifecycle
- Job completion requires customer sign-off
- Photos and documentation required for insurance/warranty

### 5. Invoice/Billing Stage
**Purpose**: Collect payment for completed work

**Flow Logic**:
- Invoices auto-created from completed jobs
- Invoice Status: `Draft` → `Sent` → `Viewed` → `Paid` | `Overdue` | `Disputed`
- Payment processing and follow-up management

**Business Rules**:
- Invoice line items populated from job data
- Automated payment reminders for overdue invoices
- Payment terms configurable per client
- Disputes require resolution before marking as paid

## Integration Points

### Lead → Client Conversion
```
Lead (Qualified) → [Convert Action] → Client (Prospective)
- Transfers: Contact info, notes, assigned technician
- Creates: Client profile with full address and billing info
- Triggers: Welcome email, initial service consultation scheduling
```

### Client → Quote Flow
```
Client Request → [Create Quote] → Quote (Draft)
- Requires: Service details, client approval
- Includes: Line items, terms, validity period
- Triggers: Quote review process, client notification
```

### Quote → Job Conversion
```
Quote (Approved) → [Auto-Convert] → Job (Scheduled)
- Transfers: All quote line items become job tasks
- Creates: Work order with materials list
- Triggers: Technician assignment, scheduling process
```

### Job → Invoice Flow
```
Job (Completed) → [Auto-Generate] → Invoice (Draft)
- Transfers: Actual materials used, labor hours, additional services
- Creates: Detailed invoice with job reference
- Triggers: Customer approval process, payment collection
```

## Dashboard Logic

### Key Performance Indicators (KPIs)
1. **Lead Conversion Rate**: (Leads Converted / Total Leads) × 100
2. **Quote Win Rate**: (Approved Quotes / Total Quotes) × 100
3. **Average Job Value**: Total Revenue / Number of Jobs
4. **Collection Efficiency**: Payments Received / Invoices Sent
5. **Technician Utilization**: Scheduled Hours / Available Hours

### Status-Based Widgets
- **Leads Requiring Follow-up**: Leads with past due follow-up dates
- **Quotes Pending Response**: Quotes sent but not yet approved/rejected
- **Jobs Scheduled Today**: Today's scheduled work orders
- **Overdue Invoices**: Invoices past payment terms
- **Revenue Pipeline**: Sum of active quotes and scheduled jobs

## Workflow Automation Rules

### Automatic Status Updates
1. **Lead Follow-up Overdue**: Auto-mark leads as "Stale" after 30 days
2. **Quote Expiration**: Auto-expire quotes after validity period
3. **Job Scheduling**: Auto-schedule jobs within 48 hours of quote approval
4. **Invoice Generation**: Auto-create invoices when jobs marked complete
5. **Payment Reminders**: Auto-send reminders for overdue invoices

### Notification Triggers
1. **New Lead Assigned**: Email to assigned technician
2. **Quote Approved**: SMS to customer + email to operations team
3. **Job Completed**: Customer satisfaction survey + invoice notification
4. **Payment Received**: Confirmation email + accounting notification
5. **Follow-up Due**: Daily digest of required follow-ups

## Data Integrity Rules

### Required Information Flow
1. **Lead → Client**: Contact details, address verification, credit check (if applicable)
2. **Client → Quote**: Service requirements, site assessment, material specifications
3. **Quote → Job**: Technical specifications, safety requirements, permit needs
4. **Job → Invoice**: Actual hours worked, materials consumed, additional services

### Validation Rules
1. **Lead Qualification**: Must have contact method, estimated value, and timeline
2. **Quote Approval**: Requires customer signature and deposit (if applicable)
3. **Job Completion**: Requires photos, customer sign-off, and material reconciliation
4. **Invoice Payment**: Must match work performed and quote approved amounts

## Mobile-First Considerations

### Field Technician Flow
1. **Job Assignment**: Push notification with job details
2. **On-Site Check-in**: GPS verification and time tracking
3. **Progress Updates**: Real-time status updates with photos
4. **Completion Process**: Customer signature capture and feedback
5. **Next Job Routing**: Automatic routing to next scheduled job

### Customer Self-Service
1. **Quote Approval**: Mobile-friendly quote review and approval
2. **Schedule Changes**: Easy rescheduling with calendar integration
3. **Payment Processing**: One-click payment options
4. **Service History**: Complete history of services and warranties

## Security and Compliance

### Data Protection
- Customer PII encryption
- Payment data PCI compliance
- GDPR-compliant data handling
- Audit trail for all status changes

### Access Control
- Role-based permissions (Admin, Manager, Technician, Customer)
- Field data encryption
- Secure API endpoints
- Session management and timeouts

This flow ensures that every lead has a clear path to becoming revenue, with proper tracking and automation at each stage. 