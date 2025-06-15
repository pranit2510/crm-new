'use client';

import React, { useState } from 'react';
import { X, ArrowRight, User, FileText, Briefcase, Receipt } from 'lucide-react';

interface FormField {
  key: string;
  label: string;
  type: 'text' | 'select' | 'textarea' | 'date' | 'number' | 'checkbox';
  required?: boolean;
  options?: string[];
  default?: string;
  placeholder?: string;
  step?: string;
}

interface ConversionConfig {
  title: string;
  icon: React.ReactNode;
  sourceIcon: React.ReactNode;
  targetIcon: React.ReactNode;
  sourceLabel: string;
  targetLabel: string;
  description: string;
  fields: FormField[];
}

interface ConversionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: Record<string, any>) => Promise<void>;
  conversionType: 'leadToClient' | 'quoteToJob' | 'jobToInvoice';
  sourceData: Record<string, any>;
}

const ConversionModal: React.FC<ConversionModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  conversionType,
  sourceData
}) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const getConversionConfig = (): ConversionConfig | null => {
    switch (conversionType) {
      case 'leadToClient':
        return {
          title: 'Convert Lead to Client',
          icon: <User className="h-6 w-6 text-green-500" />,
          sourceIcon: <FileText className="h-5 w-5 text-blue-500" />,
          targetIcon: <User className="h-5 w-5 text-green-500" />,
          sourceLabel: 'Lead',
          targetLabel: 'Client',
          description: 'This will create a new client record from this qualified lead.',
          fields: [
            { key: 'clientType', label: 'Client Type', type: 'select', options: ['Residential', 'Commercial', 'Industrial'], required: true },
            { key: 'notes', label: 'Additional Notes', type: 'textarea', placeholder: 'Any additional information...' },
            { key: 'preferredContact', label: 'Preferred Contact Method', type: 'select', options: ['Phone', 'Email', 'Text', 'In-person'], required: true }
          ]
        };
      case 'quoteToJob':
        return {
          title: 'Create Job from Quote',
          icon: <Briefcase className="h-6 w-6 text-orange-500" />,
          sourceIcon: <FileText className="h-5 w-5 text-purple-500" />,
          targetIcon: <Briefcase className="h-5 w-5 text-orange-500" />,
          sourceLabel: 'Quote',
          targetLabel: 'Job',
          description: 'This will create a work order from the approved quote.',
          fields: [
            { key: 'scheduledDate', label: 'Scheduled Date', type: 'date', required: true },
            { key: 'assignedTo', label: 'Assign to Technician', type: 'select', options: ['Mike Johnson', 'Sarah Davis', 'Team Alpha', 'Emergency Team'], required: true },
            { key: 'priority', label: 'Priority', type: 'select', options: ['Low', 'Medium', 'High', 'Urgent'], required: true, default: 'Medium' },
            { key: 'estimatedDuration', label: 'Estimated Duration', type: 'text', placeholder: 'e.g., 4 hours, 2 days', required: true },
            { key: 'specialInstructions', label: 'Special Instructions', type: 'textarea', placeholder: 'Any special requirements or notes...' }
          ]
        };
      case 'jobToInvoice':
        return {
          title: 'Create Invoice from Job',
          icon: <Receipt className="h-6 w-6 text-emerald-500" />,
          sourceIcon: <Briefcase className="h-5 w-5 text-orange-500" />,
          targetIcon: <Receipt className="h-5 w-5 text-emerald-500" />,
          sourceLabel: 'Job',
          targetLabel: 'Invoice',
          description: 'This will generate an invoice for the completed job.',
          fields: [
            { key: 'actualCost', label: 'Actual Cost', type: 'number', step: '0.01', required: true, placeholder: 'Final amount to invoice' },
            { key: 'paymentTerms', label: 'Payment Terms', type: 'select', options: ['Due on Receipt', 'Net 15', 'Net 30', 'Net 60'], required: true, default: 'Net 30' },
            { key: 'dueDate', label: 'Due Date', type: 'date', required: true },
            { key: 'description', label: 'Invoice Description', type: 'textarea', placeholder: 'Work performed and materials used...', required: true },
            { key: 'includePhotos', label: 'Include Job Photos', type: 'checkbox' }
          ]
        };
      default:
        return null;
    }
  };

  const config = getConversionConfig();
  if (!config) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await onConfirm({
        ...formData,
        sourceId: sourceData.id,
        conversionType
      });
    } catch (error) {
      console.error('Conversion error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (key: string, value: any) => {
    setFormData((prev: Record<string, any>) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            {config.icon}
            <h2 className="text-xl font-semibold text-gray-900">{config.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Conversion Flow Visualization */}
        <div className="p-6 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center justify-center gap-4">
            <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-gray-200">
              {config.sourceIcon}
              <span className="text-sm font-medium text-gray-700">{config.sourceLabel}</span>
              <span className="text-xs text-gray-500">#{sourceData.id}</span>
            </div>
            <ArrowRight className="h-5 w-5 text-gray-400" />
            <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-gray-200">
              {config.targetIcon}
              <span className="text-sm font-medium text-gray-700">{config.targetLabel}</span>
            </div>
          </div>
          <p className="text-sm text-gray-600 text-center mt-3">{config.description}</p>
        </div>

        {/* Source Data Summary */}
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Source Information</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Name:</span>
                <span className="ml-2 font-medium">{sourceData.name || sourceData.clientName}</span>
              </div>
              <div>
                <span className="text-gray-500">ID:</span>
                <span className="ml-2 font-medium">{sourceData.id}</span>
              </div>
              {sourceData.email && (
                <div>
                  <span className="text-gray-500">Email:</span>
                  <span className="ml-2">{sourceData.email}</span>
                </div>
              )}
              {sourceData.phone && (
                <div>
                  <span className="text-gray-500">Phone:</span>
                  <span className="ml-2">{sourceData.phone}</span>
                </div>
              )}
              {sourceData.amount && (
                <div>
                  <span className="text-gray-500">Amount:</span>
                  <span className="ml-2 font-medium">${sourceData.amount.toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Conversion Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {config.fields.map((field) => (
            <div key={field.key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              
              {field.type === 'select' ? (
                <select
                  required={field.required}
                  value={formData[field.key] || field.default || ''}
                  onChange={(e) => handleInputChange(field.key, e.target.value)}
                  className="default-select w-full"
                >
                  <option value="">Select {field.label.toLowerCase()}...</option>
                  {field.options?.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              ) : field.type === 'textarea' ? (
                <textarea
                  required={field.required}
                  value={formData[field.key] || ''}
                  onChange={(e) => handleInputChange(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  rows={3}
                  className="default-input w-full resize-none"
                />
              ) : field.type === 'checkbox' ? (
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData[field.key] || false}
                    onChange={(e) => handleInputChange(field.key, e.target.checked)}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-600">{field.placeholder || field.label}</span>
                </label>
              ) : (
                <input
                  type={field.type}
                  required={field.required}
                  step={field.step}
                  value={formData[field.key] || ''}
                  onChange={(e) => handleInputChange(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  className="default-input w-full"
                />
              )}
            </div>
          ))}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Converting...
                </>
              ) : (
                <>
                  Create {config.targetLabel}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConversionModal; 