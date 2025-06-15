'use client';

import React, { useState } from 'react';
import { ArrowRight, Send, CheckCircle, DollarSign, Clock, AlertTriangle, UserPlus, FileText, Briefcase, MoreVertical } from 'lucide-react';
import { leadStages, clientStages, quoteStages, jobStages, invoiceStages } from '@/lib/flowStates';
import type { LeadStatus, ClientStatus, QuoteStatus, JobStatus, InvoiceStatus } from '@/lib/flowStates';
import ConversionModal from '@/components/flow/ConversionModal';

interface FlowActionsProps {
  module: 'leads' | 'clients' | 'quotes' | 'jobs' | 'invoices';
  status: LeadStatus | ClientStatus | QuoteStatus | JobStatus | InvoiceStatus;
  entityId: string;
  onAction: (action: string, id: string) => void;
}

const FlowActions: React.FC<FlowActionsProps> = ({ module, status, entityId, onAction }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [conversionModal, setConversionModal] = useState<{
    isOpen: boolean;
    type: 'leadToClient' | 'quoteToJob' | 'jobToInvoice' | null;
    sourceData: any;
  }>({
    isOpen: false,
    type: null,
    sourceData: null
  });

  const handleAction = (action: string) => {
    setIsOpen(false);
    onAction(action, entityId);
  };

  const getActions = () => {
    switch (module) {
      case 'leads':
        return [
          { label: 'Convert to Client', action: 'convertToClient' },
          { label: 'Schedule Follow-up', action: 'scheduleFollowUp' },
          { label: 'Mark as Lost', action: 'markAsLost' }
        ];
      case 'clients':
        return [
          { label: 'Create Quote', action: 'createQuote' },
          { label: 'Schedule Job', action: 'scheduleJob' },
          { label: 'Send Invoice', action: 'sendInvoice' }
        ];
      case 'quotes':
        return [
          { label: 'Convert to Job', action: 'convertToJob' },
          { label: 'Send to Client', action: 'sendToClient' },
          { label: 'Mark as Lost', action: 'markAsLost' }
        ];
      case 'jobs':
        return [
          { label: 'Create Invoice', action: 'createInvoice' },
          { label: 'Update Status', action: 'updateStatus' },
          { label: 'Add Note', action: 'addNote' }
        ];
      case 'invoices':
        return [
          { label: 'Send Reminder', action: 'sendReminder' },
          { label: 'Mark as Paid', action: 'markAsPaid' },
          { label: 'View Details', action: 'viewDetails' }
        ];
      default:
        return [];
    }
  };

  const getVariantClasses = (variant: string) => {
    switch (variant) {
      case 'primary':
        return 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100';
      case 'success':
        return 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100';
      case 'warning':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100';
      case 'secondary':
        return 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100';
    }
  };

  const handleConversionConfirm = async (data: any) => {
    try {
      console.log('Conversion data:', data);
      // Here you would call the actual conversion API
      // await conversionService.convert(data);
      
      setConversionModal({ isOpen: false, type: null, sourceData: null });
      
      // Notify parent component of successful conversion
      onAction(data.conversionType, entityId);
    } catch (error) {
      console.error('Conversion failed:', error);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1 hover:bg-gray-100 rounded-full transition-colors"
      >
        <MoreVertical size={16} />
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-50 border border-gray-200">
          {getActions().map((action) => (
            <button
              key={action.action}
              onClick={() => handleAction(action.action)}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center justify-between"
            >
              {action.label}
              <ArrowRight size={14} className="text-gray-400" />
            </button>
          ))}
        </div>
      )}

      <ConversionModal
        isOpen={conversionModal.isOpen}
        onClose={() => setConversionModal({ isOpen: false, type: null, sourceData: null })}
        onConfirm={handleConversionConfirm}
        conversionType={conversionModal.type!}
        sourceData={conversionModal.sourceData}
      />
    </div>
  );
};

export default FlowActions; 