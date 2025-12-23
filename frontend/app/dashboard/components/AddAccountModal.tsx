'use client';

import { useState } from 'react';
import {
  Card,
  Title,
  Text,
  TextInput,
  Button,
  Select,
  SelectItem,
} from '@tremor/react';
import { accountApi, CloudAccountCreate } from '@/lib/api';

interface AddAccountModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddAccountModal({ onClose, onSuccess }: AddAccountModalProps) {
  const [formData, setFormData] = useState<CloudAccountCreate>({
    account_name: '',
    provider: 'AWS',
    access_key_public: '',
    secret_key: '',
    tenant_id: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (field: keyof CloudAccountCreate) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleProviderChange = (value: string) => {
    setFormData((prev) => ({ ...prev, provider: value as 'AWS' | 'AZURE' | 'GCP' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const submitData: CloudAccountCreate = {
        ...formData,
      };

      if (!formData.tenant_id) {
        delete submitData.tenant_id;
      }

      await accountApi.createAccount(submitData);
      onSuccess();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'Failed to add account. Please try again.');
      } else {
        setError('Failed to add account. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-6">
          <div>
            <Title>Add Cloud Account</Title>
            <Text className="mt-1">
              Connect your cloud provider to start monitoring
            </Text>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={loading}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="account_name" className="block text-sm font-medium text-gray-700 mb-1">
              Account Name <span className="text-red-500">*</span>
            </label>
            <TextInput
              id="account_name"
              type="text"
              placeholder="My Production Account"
              value={formData.account_name}
              onChange={handleChange('account_name')}
              required
              disabled={loading}
            />
            <Text className="text-xs text-gray-500 mt-1">
              A friendly name to identify this account
            </Text>
          </div>

          <div>
            <label htmlFor="provider" className="block text-sm font-medium text-gray-700 mb-1">
              Cloud Provider <span className="text-red-500">*</span>
            </label>
            <Select
              id="provider"
              value={formData.provider}
              onValueChange={handleProviderChange}
              disabled={loading}
            >
              <SelectItem value="AWS">Amazon Web Services (AWS)</SelectItem>
              <SelectItem value="AZURE">Microsoft Azure</SelectItem>
              <SelectItem value="GCP">Google Cloud Platform (GCP)</SelectItem>
            </Select>
          </div>

          <div>
            <label htmlFor="access_key_public" className="block text-sm font-medium text-gray-700 mb-1">
              {formData.provider === 'AWS' ? 'Access Key ID' : 'Client ID'} <span className="text-red-500">*</span>
            </label>
            <TextInput
              id="access_key_public"
              type="text"
              placeholder={
                formData.provider === 'AWS'
                  ? 'AKIAIOSFODNN7EXAMPLE'
                  : 'your-client-id'
              }
              value={formData.access_key_public}
              onChange={handleChange('access_key_public')}
              required
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="secret_key" className="block text-sm font-medium text-gray-700 mb-1">
              {formData.provider === 'AWS' ? 'Secret Access Key' : 'Client Secret'} <span className="text-red-500">*</span>
            </label>
            <TextInput
              id="secret_key"
              type="password"
              placeholder="••••••••••••••••••••"
              value={formData.secret_key}
              onChange={handleChange('secret_key')}
              required
              disabled={loading}
            />
            <Text className="text-xs text-gray-500 mt-1">
              Your secret will be encrypted before storage
            </Text>
          </div>

          {(formData.provider === 'AZURE' || formData.provider === 'GCP') && (
            <div>
              <label htmlFor="tenant_id" className="block text-sm font-medium text-gray-700 mb-1">
                {formData.provider === 'AZURE' ? 'Tenant ID' : 'Project ID'}
              </label>
              <TextInput
                id="tenant_id"
                type="text"
                placeholder={
                  formData.provider === 'AZURE'
                    ? 'your-tenant-id'
                    : 'your-project-id'
                }
                value={formData.tenant_id || ''}
                onChange={handleChange('tenant_id')}
                disabled={loading}
              />
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              <Text className="text-sm">{error}</Text>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 p-4 rounded">
            <Text className="text-sm text-blue-800">
              <strong>Security Note:</strong> Your credentials are encrypted using
              AES-256 encryption before being stored. We use a two-layer encryption
              approach (Key Wrapping) to ensure maximum security.
            </Text>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={loading}
              disabled={loading}
            >
              {loading ? 'Adding Account...' : 'Add Account'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}