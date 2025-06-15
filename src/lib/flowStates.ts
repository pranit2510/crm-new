// Central flow states management for VoltFlow CRM
// This file defines all possible statuses and valid transitions between them

export type LeadStatus = 'New' | 'Contacted' | 'Qualified' | 'Proposal Sent' | 'Negotiation' | 'Closed-Won' | 'Closed-Lost' | 'On Hold';
export type ClientStatus = 'Prospective' | 'Active' | 'Inactive' | 'VIP';
export type QuoteStatus = 'Draft' | 'Sent' | 'Reviewed' | 'Approved' | 'Rejected' | 'Expired' | 'Revised';
export type JobStatus = 'Scheduled' | 'Dispatched' | 'In Progress' | 'On Hold' | 'Completed' | 'Cancelled' | 'Needs Invoicing';
export type InvoiceStatus = 'Draft' | 'Sent' | 'Viewed' | 'Paid' | 'Overdue' | 'Disputed' | 'Cancelled';

export interface FlowStage {
  id: string;
  name: string;
  description: string;
  allowedTransitions: string[];
  requiredFields: string[];
  color: string;
  icon: string;
}

export interface FlowTransition {
  fromStage: string;
  toStage: string;
  action: string;
  description: string;
  confirmationRequired: boolean;
  validation?: () => boolean;
}

export interface NextAction {
  id: string;
  label: string;
  action: string;
  priority: 'high' | 'medium' | 'low';
  icon: string;
  href?: string;
  onClick?: () => void;
}

// Lead flow configuration
export const leadStages: Record<LeadStatus, FlowStage> = {
  'New': {
    id: 'new',
    name: 'New Lead',
    description: 'Recently received lead requiring initial contact',
    allowedTransitions: ['contacted', 'closed-lost'],
    requiredFields: ['leadName', 'contactPhone', 'estimatedJobValue'],
    color: 'bg-blue-100 text-blue-700',
    icon: 'UserPlus'
  },
  'Contacted': {
    id: 'contacted',
    name: 'Contacted',
    description: 'Lead has been contacted, awaiting response',
    allowedTransitions: ['qualified', 'proposal-sent', 'closed-lost', 'on-hold'],
    requiredFields: ['leadName', 'contactPhone', 'estimatedJobValue', 'contactNotes'],
    color: 'bg-sky-100 text-sky-700',
    icon: 'Phone'
  },
  'Qualified': {
    id: 'qualified',
    name: 'Qualified',
    description: 'Lead meets criteria and is ready for proposal',
    allowedTransitions: ['proposal-sent', 'closed-won', 'closed-lost'],
    requiredFields: ['leadName', 'contactPhone', 'estimatedJobValue', 'descriptionOfNeeds'],
    color: 'bg-green-100 text-green-700',
    icon: 'CheckCircle'
  },
  'Proposal Sent': {
    id: 'proposal-sent',
    name: 'Proposal Sent',
    description: 'Quote has been sent to potential client',
    allowedTransitions: ['negotiation', 'closed-won', 'closed-lost'],
    requiredFields: ['leadName', 'contactPhone', 'estimatedJobValue', 'proposalSentDate'],
    color: 'bg-indigo-100 text-indigo-700',
    icon: 'FileText'
  },
  'Negotiation': {
    id: 'negotiation',
    name: 'Negotiation',
    description: 'In active negotiation with potential client',
    allowedTransitions: ['closed-won', 'closed-lost', 'on-hold'],
    requiredFields: ['leadName', 'contactPhone', 'estimatedJobValue', 'negotiationNotes'],
    color: 'bg-yellow-100 text-yellow-700',
    icon: 'MessageSquare'
  },
  'Closed-Won': {
    id: 'closed-won',
    name: 'Closed-Won',
    description: 'Successfully converted to client',
    allowedTransitions: [],
    requiredFields: ['leadName', 'contactPhone', 'estimatedJobValue', 'clientId'],
    color: 'bg-green-100 text-green-700',
    icon: 'Trophy'
  },
  'Closed-Lost': {
    id: 'closed-lost',
    name: 'Closed-Lost',
    description: 'Did not convert to client',
    allowedTransitions: [],
    requiredFields: ['leadName', 'contactPhone', 'estimatedJobValue', 'lossReason'],
    color: 'bg-red-100 text-red-700',
    icon: 'XCircle'
  },
  'On Hold': {
    id: 'on-hold',
    name: 'On Hold',
    description: 'Temporarily paused for future follow-up',
    allowedTransitions: ['contacted', 'qualified', 'closed-lost'],
    requiredFields: ['leadName', 'contactPhone', 'estimatedJobValue', 'followUpDate'],
    color: 'bg-gray-100 text-gray-700',
    icon: 'Pause'
  }
};

// Client flow configuration
export const clientStages: Record<ClientStatus, FlowStage> = {
  'Prospective': {
    id: 'prospective',
    name: 'Prospective',
    description: 'New client, no completed jobs yet',
    allowedTransitions: ['active', 'inactive'],
    requiredFields: ['clientName', 'contactPhone', 'serviceAddress'],
    color: 'bg-blue-100 text-blue-700',
    icon: 'UserCheck'
  },
  'Active': {
    id: 'active',
    name: 'Active',
    description: 'Client with completed or ongoing jobs',
    allowedTransitions: ['inactive', 'vip'],
    requiredFields: ['clientName', 'contactPhone', 'serviceAddress', 'lastJobDate'],
    color: 'bg-green-100 text-green-700',
    icon: 'Users'
  },
  'Inactive': {
    id: 'inactive',
    name: 'Inactive',
    description: 'No recent activity or jobs',
    allowedTransitions: ['active', 'prospective'],
    requiredFields: ['clientName', 'contactPhone', 'serviceAddress'],
    color: 'bg-gray-100 text-gray-700',
    icon: 'UserX'
  },
  'VIP': {
    id: 'vip',
    name: 'VIP',
    description: 'High-value client requiring priority service',
    allowedTransitions: ['active', 'inactive'],
    requiredFields: ['clientName', 'contactPhone', 'serviceAddress', 'vipReason'],
    color: 'bg-purple-100 text-purple-700',
    icon: 'Crown'
  }
};

// Quote flow configuration
export const quoteStages: Record<QuoteStatus, FlowStage> = {
  'Draft': {
    id: 'draft',
    name: 'Draft',
    description: 'Quote being prepared',
    allowedTransitions: ['sent', 'cancelled'],
    requiredFields: ['clientId', 'lineItems', 'totalAmount'],
    color: 'bg-gray-100 text-gray-700',
    icon: 'Edit'
  },
  'Sent': {
    id: 'sent',
    name: 'Sent',
    description: 'Quote sent to client',
    allowedTransitions: ['reviewed', 'expired', 'revised'],
    requiredFields: ['clientId', 'lineItems', 'totalAmount', 'sentDate'],
    color: 'bg-blue-100 text-blue-700',
    icon: 'Send'
  },
  'Reviewed': {
    id: 'reviewed',
    name: 'Reviewed',
    description: 'Client has viewed the quote',
    allowedTransitions: ['approved', 'rejected', 'revised'],
    requiredFields: ['clientId', 'lineItems', 'totalAmount', 'sentDate', 'viewedDate'],
    color: 'bg-yellow-100 text-yellow-700',
    icon: 'Eye'
  },
  'Approved': {
    id: 'approved',
    name: 'Approved',
    description: 'Quote approved by client',
    allowedTransitions: [],
    requiredFields: ['clientId', 'lineItems', 'totalAmount', 'approvedDate', 'jobId'],
    color: 'bg-green-100 text-green-700',
    icon: 'CheckCircle'
  },
  'Rejected': {
    id: 'rejected',
    name: 'Rejected',
    description: 'Quote rejected by client',
    allowedTransitions: ['revised'],
    requiredFields: ['clientId', 'lineItems', 'totalAmount', 'rejectedDate', 'rejectionReason'],
    color: 'bg-red-100 text-red-700',
    icon: 'XCircle'
  },
  'Expired': {
    id: 'expired',
    name: 'Expired',
    description: 'Quote validity period has passed',
    allowedTransitions: ['revised'],
    requiredFields: ['clientId', 'lineItems', 'totalAmount', 'expiryDate'],
    color: 'bg-gray-100 text-gray-700',
    icon: 'Clock'
  },
  'Revised': {
    id: 'revised',
    name: 'Revised',
    description: 'Quote has been updated',
    allowedTransitions: ['sent', 'cancelled'],
    requiredFields: ['clientId', 'lineItems', 'totalAmount', 'revisionNotes'],
    color: 'bg-orange-100 text-orange-700',
    icon: 'RefreshCw'
  }
};

// Job flow configuration
export const jobStages: Record<JobStatus, FlowStage> = {
  'Scheduled': {
    id: 'scheduled',
    name: 'Scheduled',
    description: 'Job scheduled with technician assigned',
    allowedTransitions: ['dispatched', 'on-hold', 'cancelled'],
    requiredFields: ['clientId', 'scheduledDate', 'assignedTechnicians', 'description'],
    color: 'bg-blue-100 text-blue-700',
    icon: 'Calendar'
  },
  'Dispatched': {
    id: 'dispatched',
    name: 'Dispatched',
    description: 'Technician en route to job site',
    allowedTransitions: ['in-progress', 'cancelled'],
    requiredFields: ['clientId', 'scheduledDate', 'assignedTechnicians', 'dispatchTime'],
    color: 'bg-teal-100 text-teal-700',
    icon: 'Truck'
  },
  'In Progress': {
    id: 'in-progress',
    name: 'In Progress',
    description: 'Work is currently being performed',
    allowedTransitions: ['completed', 'on-hold', 'cancelled'],
    requiredFields: ['clientId', 'scheduledDate', 'assignedTechnicians', 'startTime'],
    color: 'bg-yellow-100 text-yellow-700',
    icon: 'Wrench'
  },
  'On Hold': {
    id: 'on-hold',
    name: 'On Hold',
    description: 'Job temporarily paused',
    allowedTransitions: ['scheduled', 'in-progress', 'cancelled'],
    requiredFields: ['clientId', 'scheduledDate', 'assignedTechnicians', 'holdReason'],
    color: 'bg-gray-100 text-gray-700',
    icon: 'Pause'
  },
  'Completed': {
    id: 'completed',
    name: 'Completed',
    description: 'Work finished, awaiting invoice generation',
    allowedTransitions: ['needs-invoicing'],
    requiredFields: ['clientId', 'scheduledDate', 'assignedTechnicians', 'completionTime', 'customerSignature'],
    color: 'bg-green-100 text-green-700',
    icon: 'CheckCircle'
  },
  'Cancelled': {
    id: 'cancelled',
    name: 'Cancelled',
    description: 'Job was cancelled',
    allowedTransitions: [],
    requiredFields: ['clientId', 'scheduledDate', 'assignedTechnicians', 'cancellationReason'],
    color: 'bg-red-100 text-red-700',
    icon: 'XCircle'
  },
  'Needs Invoicing': {
    id: 'needs-invoicing',
    name: 'Needs Invoicing',
    description: 'Job completed, invoice needs to be generated',
    allowedTransitions: [],
    requiredFields: ['clientId', 'scheduledDate', 'assignedTechnicians', 'completionTime', 'invoiceId'],
    color: 'bg-purple-100 text-purple-700',
    icon: 'Receipt'
  }
};

// Invoice flow configuration
export const invoiceStages: Record<InvoiceStatus, FlowStage> = {
  'Draft': {
    id: 'draft',
    name: 'Draft',
    description: 'Invoice being prepared',
    allowedTransitions: ['sent', 'cancelled'],
    requiredFields: ['clientId', 'jobId', 'lineItems', 'totalAmount'],
    color: 'bg-gray-100 text-gray-700',
    icon: 'Edit'
  },
  'Sent': {
    id: 'sent',
    name: 'Sent',
    description: 'Invoice sent to client',
    allowedTransitions: ['viewed', 'overdue', 'cancelled'],
    requiredFields: ['clientId', 'jobId', 'lineItems', 'totalAmount', 'sentDate'],
    color: 'bg-blue-100 text-blue-700',
    icon: 'Send'
  },
  'Viewed': {
    id: 'viewed',
    name: 'Viewed',
    description: 'Client has viewed the invoice',
    allowedTransitions: ['paid', 'disputed', 'overdue'],
    requiredFields: ['clientId', 'jobId', 'lineItems', 'totalAmount', 'viewedDate'],
    color: 'bg-yellow-100 text-yellow-700',
    icon: 'Eye'
  },
  'Paid': {
    id: 'paid',
    name: 'Paid',
    description: 'Invoice has been paid in full',
    allowedTransitions: [],
    requiredFields: ['clientId', 'jobId', 'lineItems', 'totalAmount', 'paidDate', 'paymentMethod'],
    color: 'bg-green-100 text-green-700',
    icon: 'CheckCircle'
  },
  'Overdue': {
    id: 'overdue',
    name: 'Overdue',
    description: 'Invoice payment is past due',
    allowedTransitions: ['paid', 'disputed', 'cancelled'],
    requiredFields: ['clientId', 'jobId', 'lineItems', 'totalAmount', 'dueDate'],
    color: 'bg-red-100 text-red-700',
    icon: 'AlertTriangle'
  },
  'Disputed': {
    id: 'disputed',
    name: 'Disputed',
    description: 'Client has disputed the invoice',
    allowedTransitions: ['paid', 'cancelled'],
    requiredFields: ['clientId', 'jobId', 'lineItems', 'totalAmount', 'disputeReason'],
    color: 'bg-orange-100 text-orange-700',
    icon: 'MessageSquare'
  },
  'Cancelled': {
    id: 'cancelled',
    name: 'Cancelled',
    description: 'Invoice has been cancelled',
    allowedTransitions: [],
    requiredFields: ['clientId', 'jobId', 'lineItems', 'totalAmount', 'cancellationReason'],
    color: 'bg-gray-100 text-gray-700',
    icon: 'XCircle'
  }
};

// Flow transitions between modules
export const crossModuleTransitions: FlowTransition[] = [
  {
    fromStage: 'closed-won',
    toStage: 'prospective',
    action: 'Convert to Client',
    description: 'Convert qualified lead to prospective client',
    confirmationRequired: true
  },
  {
    fromStage: 'prospective',
    toStage: 'draft',
    action: 'Create Quote',
    description: 'Create new quote for client',
    confirmationRequired: false
  },
  {
    fromStage: 'approved',
    toStage: 'scheduled',
    action: 'Create Job',
    description: 'Create job from approved quote',
    confirmationRequired: true
  },
  {
    fromStage: 'completed',
    toStage: 'draft',
    action: 'Generate Invoice',
    description: 'Generate invoice from completed job',
    confirmationRequired: false
  }
];

// Helper functions
export function getStageInfo(module: string, status: string): FlowStage | undefined {
  const stages = {
    leads: leadStages,
    clients: clientStages,
    quotes: quoteStages,
    jobs: jobStages,
    invoices: invoiceStages
  };
  
  // @ts-expect-error - Dynamic key access
  return stages[module]?.[status];
}

export function getNextActions(module: string, status: string): NextAction[] {
  const stage = getStageInfo(module, status);
  if (!stage) return [];
  
  const actions: NextAction[] = [];
  
  // Add module-specific actions based on current status
  switch (module) {
    case 'leads':
      if (status === 'qualified') {
        actions.push({
          id: 'convert-to-client',
          label: 'Convert to Client',
          action: 'convertToClient',
          priority: 'high',
          icon: 'UserPlus'
        });
      }
      break;
    case 'clients':
      if (status === 'prospective' || status === 'active') {
        actions.push({
          id: 'create-quote',
          label: 'Create Quote',
          action: 'createQuote',
          priority: 'medium',
          icon: 'FileText'
        });
      }
      break;
    case 'quotes':
      if (status === 'approved') {
        actions.push({
          id: 'create-job',
          label: 'Create Job',
          action: 'createJob',
          priority: 'high',
          icon: 'Briefcase'
        });
      }
      break;
    case 'jobs':
      if (status === 'completed') {
        actions.push({
          id: 'generate-invoice',
          label: 'Generate Invoice',
          action: 'generateInvoice',
          priority: 'high',
          icon: 'Receipt'
        });
      }
      break;
  }
  
  return actions;
}

export function validateTransition(module: string, fromStatus: string, toStatus: string): boolean {
  const stage = getStageInfo(module, fromStatus);
  if (!stage) return false;
  
  return stage.allowedTransitions.includes(toStatus);
}

export function getStatusColor(module: string, status: string): string {
  const stage = getStageInfo(module, status);
  return stage?.color || 'bg-gray-100 text-gray-700';
} 