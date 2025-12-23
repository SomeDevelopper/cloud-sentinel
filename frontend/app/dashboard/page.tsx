'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  Title,
  Text,
  Metric,
  Grid,
  Button,
  Select,
  SelectItem,
  Table,
  TableHead,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
  Badge,
} from '@tremor/react';
import { accountApi, scanApi, CloudAccount } from '@/lib/api';
import { processResources, aggregateCosts } from '@/lib/process-resources';
import { ProcessedResource, AWS_REGIONS } from '@/lib/types';
import AddAccountModal from './components/AddAccountModal';

export default function DashboardPage() {
  const [accounts, setAccounts] = useState<CloudAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string>('');
  const [resources, setResources] = useState<ProcessedResource[]>([]);
  const [loading, setLoading] = useState(false);
  const [scanLoading, setScanLoading] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState('eu-west-3');
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadAccounts();
  }, []);

  useEffect(() => {
    if (selectedAccount) {
      loadResources();
    }
  }, [selectedAccount]);

  const loadAccounts = async () => {
    try {
      const response = await accountApi.getAccounts();
      const accountList = response.data || [];
      setAccounts(accountList);
      if (accountList.length > 0 && !selectedAccount) {
        setSelectedAccount(accountList[0].id);
      }
    } catch (err) {
      console.error('Error loading accounts:', err);
      setError('Failed to load accounts');
    }
  };

  const loadResources = async () => {
    if (!selectedAccount) return;

    setLoading(true);
    setError('');
    try {
      const response = await accountApi.getResources(selectedAccount);
      const rawResources = response.data || [];
      const processed = processResources(rawResources);
      setResources(processed);
    } catch (err) {
      console.error('Error loading resources:', err);
      setError('Failed to load resources');
    } finally {
      setLoading(false);
    }
  };

  const handleScan = async () => {
    if (!selectedAccount) return;

    setScanLoading(true);
    setError('');

    try {
      const response = await scanApi.scanAccount(selectedAccount, selectedRegion);
      const taskId = response.data?.task_id;

      if (!taskId) {
        throw new Error('No task ID returned');
      }

      const pollInterval = setInterval(async () => {
        try {
          const statusResponse = await scanApi.getTaskStatus(taskId);
          const status = statusResponse.data;

          if (status?.state === 'SUCCESS') {
            clearInterval(pollInterval);
            await loadResources();
            setScanLoading(false);
          } else if (status?.state === 'FAILURE') {
            clearInterval(pollInterval);
            setError('Scan failed: ' + (status.result || 'Unknown error'));
            setScanLoading(false);
          }
        } catch (pollErr) {
          console.error('Error polling task status:', pollErr);
        }
      }, 2000);

      setTimeout(() => {
        clearInterval(pollInterval);
        if (scanLoading) {
          setError('Scan timeout - please refresh to see results');
          setScanLoading(false);
        }
      }, 120000);

    } catch (err) {
      console.error('Error starting scan:', err);
      setError('Failed to start scan');
      setScanLoading(false);
    }
  };

  const handleAccountAdded = () => {
    setShowAddAccount(false);
    loadAccounts();
  };

  const costs = aggregateCosts(resources);

  const getStatusColor = (status: string): 'green' | 'yellow' | 'red' | 'gray' => {
    const normalizedStatus = status.toLowerCase();
    if (normalizedStatus === 'running' || normalizedStatus === 'active') return 'green';
    if (normalizedStatus === 'stopped') return 'yellow';
    if (normalizedStatus === 'terminated') return 'red';
    return 'gray';
  };

  return (
    <>
      {error && (
        <Card className="mb-6 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
          <Text className="text-red-700 dark:text-red-400">{error}</Text>
        </Card>
      )}

      {accounts.length === 0 ? (
        <Card className="text-center p-8">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
            <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
            </svg>
          </div>
          <Title className="mt-4">No Cloud Accounts Configured</Title>
          <Text className="mt-2">Add a cloud account to start monitoring your infrastructure</Text>
          <Button
            size="lg"
            className="mt-6"
            onClick={() => setShowAddAccount(true)}
          >
            Add Your First Account
          </Button>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card>
            <div className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <Text className="mb-2">Cloud Account</Text>
                  <Select
                    value={selectedAccount}
                    onValueChange={setSelectedAccount}
                  >
                    {accounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.account_name} ({account.provider})
                      </SelectItem>
                    ))}
                  </Select>
                </div>

                <div>
                  <Text className="mb-2">Target Region</Text>
                  <Select
                    value={selectedRegion}
                    onValueChange={setSelectedRegion}
                  >
                    {AWS_REGIONS.map((region) => (
                      <SelectItem key={region} value={region}>
                        {region}
                      </SelectItem>
                    ))}
                  </Select>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={handleScan}
                  disabled={scanLoading}
                  loading={scanLoading}
                >
                  {scanLoading ? 'Scanning...' : 'Start Scan'}
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setShowAddAccount(true)}
                >
                  Add Account
                </Button>
              </div>
            </div>
          </Card>

          {loading ? (
            <Card className="text-center p-8">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-200 dark:border-gray-700 border-t-blue-600 dark:border-t-blue-400" />
              <Text className="mt-4">Loading resources...</Text>
            </Card>
          ) : resources.length === 0 ? (
            <Card className="text-center p-8">
              <Text>No resources found. Launch a scan to detect resources.</Text>
            </Card>
          ) : (
            <>
              <Grid numItemsMd={3} className="gap-6">
                <Card decoration="top" decorationColor="blue">
                  <Text>Month-to-Date Cost</Text>
                  <Metric>${costs.totalMtd.toFixed(2)}</Metric>
                  <Text className="text-sm">Spent since beginning of month</Text>
                </Card>

                <Card decoration="top" decorationColor="indigo">
                  <Text>Monthly Forecast</Text>
                  <Metric>${costs.totalForecast.toFixed(2)}</Metric>
                  <Text className="text-sm">If current state continues</Text>
                </Card>

                <Card decoration="top" decorationColor="purple">
                  <Text>Total Resources</Text>
                  <Metric>{costs.totalResources}</Metric>
                  <Text className="text-sm">Across all regions</Text>
                </Card>
              </Grid>

              <Card>
                <Title>Resource Details</Title>
                <Table className="mt-4">
                  <TableHead>
                    <TableRow>
                      <TableHeaderCell>Type</TableHeaderCell>
                      <TableHeaderCell>Name/ID</TableHeaderCell>
                      <TableHeaderCell>Instance Type</TableHeaderCell>
                      <TableHeaderCell>Status</TableHeaderCell>
                      <TableHeaderCell>Region</TableHeaderCell>
                      <TableHeaderCell className="text-right">Size (GB)</TableHeaderCell>
                      <TableHeaderCell className="text-right">Price/Hour</TableHeaderCell>
                      <TableHeaderCell className="text-right">MTD Cost</TableHeaderCell>
                      <TableHeaderCell className="text-right">Monthly Forecast</TableHeaderCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {resources
                      .sort((a, b) => b.cost_forecast - a.cost_forecast)
                      .map((resource, idx) => (
                        <TableRow key={idx}>
                          <TableCell>{resource.resource_type}</TableCell>
                          <TableCell className="max-w-xs truncate">{resource.display_name}</TableCell>
                          <TableCell>{resource.type}</TableCell>
                          <TableCell>
                            <Badge color={getStatusColor(resource.status)}>
                              {resource.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{resource.region}</TableCell>
                          <TableCell className="text-right">
                            {resource.size_gb ? resource.size_gb.toFixed(2) : '-'}
                          </TableCell>
                          <TableCell className="text-right">
                            ${resource.hourly_price.toFixed(4)}
                          </TableCell>
                          <TableCell className="text-right">
                            ${resource.cost_mtd.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            ${resource.cost_forecast.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </Card>
            </>
          )}
        </div>
      )}

      {showAddAccount && (
        <AddAccountModal
          onClose={() => setShowAddAccount(false)}
          onSuccess={handleAccountAdded}
        />
      )}
    </>
  );
}
