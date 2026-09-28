import { useState } from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Download, FileText, Database } from 'lucide-react';
import { UpgradePrompt } from '@/components/subscription/UpgradePrompt';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type DatasetKey = 'workouts' | 'nutrition' | 'wellness' | 'goals' | 'profile';
type ExportFormat = 'json' | 'csv';
type DateRange = 'all' | 'month' | 'year';

type ExportOptions = Record<DatasetKey, boolean>;

// Each entry maps to a table that actually exists in the applied schema. The
// old "Progress Metrics" checkbox is gone: progress_reports and biometric_data
// were dropped in the schema squash, so it had no source to read from.
const DATASETS: { key: DatasetKey; label: string; table: string }[] = [
  { key: 'workouts', label: 'Workouts & Exercises', table: 'workout_sessions' },
  { key: 'nutrition', label: 'Nutrition Logs', table: 'meals' },
  { key: 'wellness', label: 'Wellness Check-ins', table: 'wellness_checkins' },
  { key: 'goals', label: 'Goals & Targets', table: 'user_goals' },
  { key: 'profile', label: 'Profile & Body Stats', table: 'profiles' },
];

const rangeCutoff = (range: DateRange): string | null => {
  if (range === 'all') return null;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - (range === 'month' ? 30 : 365));
  return cutoff.toISOString();
};

// Written as an explicit switch rather than a dynamic table name so the typed
// Supabase client keeps checking the column names — profiles is keyed on `id`
// while every other table is keyed on `user_id`, and each has its own date
// column to filter and sort on.
const fetchDataset = async (
  key: DatasetKey,
  userId: string,
  since: string | null,
): Promise<Record<string, unknown>[]> => {
  switch (key) {
    case 'workouts': {
      let query = supabase.from('workout_sessions').select('*').eq('user_id', userId);
      if (since) query = query.gte('start_time', since);
      const { data, error } = await query.order('start_time', { ascending: false });
      if (error) throw error;
      return data ?? [];
    }
    case 'nutrition': {
      let query = supabase.from('meals').select('*').eq('user_id', userId);
      if (since) query = query.gte('consumed_at', since);
      const { data, error } = await query.order('consumed_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    }
    case 'wellness': {
      let query = supabase.from('wellness_checkins').select('*').eq('user_id', userId);
      if (since) query = query.gte('checked_in_at', since);
      const { data, error } = await query.order('checked_in_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    }
    case 'goals': {
      let query = supabase.from('user_goals').select('*').eq('user_id', userId);
      if (since) query = query.gte('created_at', since);
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    }
    case 'profile': {
      // One row, and the date range doesn't apply to it.
      const { data, error } = await supabase.from('profiles').select('*').eq('id', userId);
      if (error) throw error;
      return data ?? [];
    }
  }
};

const csvCell = (value: unknown): string => {
  if (value === null || value === undefined) return '';
  const text = typeof value === 'object' ? JSON.stringify(value) : String(value);
  return `"${text.replace(/"/g, '""')}"`;
};

const toCsvSection = (table: string, rows: Record<string, unknown>[]): string => {
  if (rows.length === 0) return `# ${table} (no rows)\n`;
  const columns = Object.keys(rows[0]);
  const header = columns.join(',');
  const body = rows.map(row => columns.map(column => csvCell(row[column])).join(',')).join('\n');
  return `# ${table}\n${header}\n${body}\n`;
};

const downloadBlob = (contents: string, filename: string, mimeType: string) => {
  const blob = new Blob([contents], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

export const HealthDataExport = () => {
  const { hasPremiumAccess } = useSubscription();
  const { user } = useAuth();
  const { toast } = useToast();
  const [format, setFormat] = useState<ExportFormat>('json');
  const [dateRange, setDateRange] = useState<DateRange>('all');
  const [exporting, setExporting] = useState(false);
  const [options, setOptions] = useState<ExportOptions>({
    workouts: true,
    nutrition: true,
    wellness: true,
    goals: true,
    profile: true,
  });

  const selectedKeys = DATASETS.filter(dataset => options[dataset.key]).map(dataset => dataset.key);
  const allSelected = selectedKeys.length === DATASETS.length;

  const handleSelectAll = (value: boolean) => {
    setOptions({
      workouts: value,
      nutrition: value,
      wellness: value,
      goals: value,
      profile: value,
    });
  };

  const handleOptionChange = (key: DatasetKey, value: boolean) => {
    setOptions(previous => ({ ...previous, [key]: value }));
  };

  const handleExport = async () => {
    if (selectedKeys.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one data type to export",
        variant: "destructive"
      });
      return;
    }

    if (!user) {
      toast({
        title: "Sign in required",
        description: "Sign in to export your health data.",
        variant: "destructive"
      });
      return;
    }

    setExporting(true);
    try {
      const since = rangeCutoff(dateRange);
      const results = await Promise.all(
        selectedKeys.map(async key => [key, await fetchDataset(key, user.id, since)] as const)
      );

      const byTable = new Map(DATASETS.map(dataset => [dataset.key, dataset.table]));
      const totalRows = results.reduce((total, [, rows]) => total + rows.length, 0);
      const stamp = new Date().toISOString().split('T')[0];

      if (format === 'json') {
        const payload = {
          exported_at: new Date().toISOString(),
          user_id: user.id,
          date_range: dateRange,
          date_range_from: since,
          data: Object.fromEntries(results.map(([key, rows]) => [byTable.get(key)!, rows])),
        };
        downloadBlob(
          JSON.stringify(payload, null, 2),
          `fitmatepro-export-${stamp}.json`,
          'application/json',
        );
      } else {
        // One file with a labelled section per table — the tables have
        // different columns, so they can't share a single header row.
        const sections = results.map(([key, rows]) => toCsvSection(byTable.get(key)!, rows));
        downloadBlob(
          sections.join('\n'),
          `fitmatepro-export-${stamp}.csv`,
          'text/csv;charset=utf-8',
        );
      }

      toast({
        title: "Export complete",
        description: `${totalRows} ${totalRows === 1 ? 'row' : 'rows'} across ${selectedKeys.length} ${selectedKeys.length === 1 ? 'dataset' : 'datasets'}.`,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to export your data';
      toast({
        title: "Export failed",
        description: message,
        variant: "destructive"
      });
    } finally {
      setExporting(false);
    }
  };

  if (!hasPremiumAccess()) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Export Health Data
            <Badge variant="secondary" className="ml-2">Premium</Badge>
          </CardTitle>
          <CardDescription>
            Download your complete health and fitness data in multiple formats
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UpgradePrompt
            trigger="premium_feature_access"
            featureName="Health Data Export"
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="w-5 h-5 text-primary" />
          Export Health Data
          <Badge variant="default" className="ml-2">Premium</Badge>
        </CardTitle>
        <CardDescription>
          Export your fitness journey data for backup, analysis, or transfer
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Export Format. PDF is not offered: nothing in the app can render one. */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">Export Format</Label>
          <Select value={format} onValueChange={(value: ExportFormat) => setFormat(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="json">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4" />
                  JSON (Complete Data)
                </div>
              </SelectItem>
              <SelectItem value="csv">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  CSV (Spreadsheet)
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Date Range */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">Date Range</Label>
          <Select value={dateRange} onValueChange={(value: DateRange) => setDateRange(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="month">Last 30 Days</SelectItem>
              <SelectItem value="year">Last Year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Data Selection */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">Select Data to Export</Label>
          <div className="space-y-3 p-4 rounded-lg border bg-muted/30">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="export-all"
                checked={allSelected}
                onCheckedChange={(checked) => handleSelectAll(checked as boolean)}
              />
              <Label htmlFor="export-all" className="font-semibold cursor-pointer flex-1">
                Select All
              </Label>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 border-t">
              {DATASETS.map((dataset) => (
                <div key={dataset.key} className="flex items-center space-x-2">
                  <Checkbox
                    id={`export-${dataset.key}`}
                    checked={options[dataset.key]}
                    onCheckedChange={(checked) => handleOptionChange(dataset.key, checked as boolean)}
                  />
                  <Label htmlFor={`export-${dataset.key}`} className="cursor-pointer flex-1">
                    {dataset.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="p-4 rounded-lg bg-muted/50 text-sm text-muted-foreground">
          <p>
            <strong>Note:</strong> The export contains the selected records from your account
            within the chosen date range. JSON keeps the full row structure; CSV writes one
            labelled section per table. Your profile is always exported in full.
          </p>
        </div>

        {/* Export Button */}
        <Button onClick={handleExport} disabled={exporting} className="w-full" size="lg">
          <Download className="w-4 h-4 mr-2" />
          {exporting ? 'Preparing export...' : 'Export Health Data'}
        </Button>
      </CardContent>
    </Card>
  );
};
