'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Settings, DollarSign, MapPin, Bell, Check } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import {
  Button,
  Input,
  Textarea,
  Card,
  CardContent,
  LoadingScreen,
} from '@/components/ui';

export default function AdminSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [settings, setSettings] = useState({
    serviceFeeRate: 5,
    orderingEnabled: true,
    maxWeeklyOrders: 50,
    pickupInstructionsEn: '',
    pickupInstructionsEs: '',
    pickupInstructionsPt: '',
    businessName: '',
    businessAddress: '',
    businessPhone: '',
    businessEmail: '',
  });

  useEffect(() => {
    const loadSettings = async () => {
      const supabase = createClient();

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/login');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();

      if (!profile?.is_admin) {
        router.push('/');
        return;
      }

      // Load settings
      const { data: settingsData } = await supabase
        .from('settings')
        .select('*');

      if (settingsData) {
        const settingsMap = settingsData.reduce((acc, s) => {
          acc[s.key] = s.value;
          return acc;
        }, {} as Record<string, Record<string, unknown>>);

        setSettings({
          serviceFeeRate: (settingsMap.service_fee_rate?.rate as number || 0.05) * 100,
          orderingEnabled: settingsMap.ordering_enabled?.enabled as boolean ?? true,
          maxWeeklyOrders: settingsMap.max_weekly_orders?.limit as number || 50,
          pickupInstructionsEn: settingsMap.pickup_instructions?.en as string || '',
          pickupInstructionsEs: settingsMap.pickup_instructions?.es as string || '',
          pickupInstructionsPt: settingsMap.pickup_instructions?.pt as string || '',
          businessName: settingsMap.business_info?.name as string || '',
          businessAddress: settingsMap.business_info?.address as string || '',
          businessPhone: settingsMap.business_info?.phone as string || '',
          businessEmail: settingsMap.business_info?.email as string || '',
        });
      }

      setLoading(false);
    };

    loadSettings();
  }, [router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSave = async () => {
    setError('');
    setSaving(true);

    try {
      const supabase = createClient();

      // Update each setting
      const updates = [
        {
          key: 'service_fee_rate',
          value: { rate: settings.serviceFeeRate / 100 },
        },
        {
          key: 'ordering_enabled',
          value: { enabled: settings.orderingEnabled },
        },
        {
          key: 'max_weekly_orders',
          value: { limit: parseInt(String(settings.maxWeeklyOrders)) },
        },
        {
          key: 'pickup_instructions',
          value: {
            en: settings.pickupInstructionsEn,
            es: settings.pickupInstructionsEs,
            pt: settings.pickupInstructionsPt,
          },
        },
        {
          key: 'business_info',
          value: {
            name: settings.businessName,
            address: settings.businessAddress,
            phone: settings.businessPhone,
            email: settings.businessEmail,
          },
        },
      ];

      for (const update of updates) {
        const { error } = await supabase
          .from('settings')
          .upsert({ key: update.key, value: update.value });

        if (error) throw error;
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="py-8">
      <div className="container max-w-3xl">
        <Link
          href="/admin"
          className="inline-flex items-center text-neutral-600 hover:text-pink-600 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Link>

        <h1 className="text-3xl font-bold text-neutral-800 mb-8">Settings</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-600 flex items-center gap-2">
            <Check className="w-5 h-5" />
            Settings saved successfully
          </div>
        )}

        <div className="space-y-8">
          {/* Business Settings */}
          <Card variant="outlined">
            <CardContent>
              <h2 className="text-xl font-semibold text-neutral-800 mb-6 flex items-center gap-2">
                <Settings className="w-5 h-5 text-pink-600" />
                Business Settings
              </h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
                  <div>
                    <p className="font-medium text-neutral-800">
                      Enable Ordering
                    </p>
                    <p className="text-sm text-neutral-500">
                      Allow customers to place new orders
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="orderingEnabled"
                      checked={settings.orderingEnabled}
                      onChange={handleChange}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-600" />
                  </label>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <Input
                    type="number"
                    label="Service Fee Rate (%)"
                    name="serviceFeeRate"
                    value={settings.serviceFeeRate}
                    onChange={handleChange}
                    min={0}
                    max={20}
                  />
                  <Input
                    type="number"
                    label="Max Weekly Orders"
                    name="maxWeeklyOrders"
                    value={settings.maxWeeklyOrders}
                    onChange={handleChange}
                    min={1}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Business Info */}
          <Card variant="outlined">
            <CardContent>
              <h2 className="text-xl font-semibold text-neutral-800 mb-6 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-pink-600" />
                Business Information
              </h2>

              <div className="space-y-4">
                <Input
                  label="Business Name"
                  name="businessName"
                  value={settings.businessName}
                  onChange={handleChange}
                />
                <Input
                  label="Address"
                  name="businessAddress"
                  value={settings.businessAddress}
                  onChange={handleChange}
                />
                <div className="grid sm:grid-cols-2 gap-4">
                  <Input
                    label="Phone"
                    name="businessPhone"
                    value={settings.businessPhone}
                    onChange={handleChange}
                  />
                  <Input
                    type="email"
                    label="Email"
                    name="businessEmail"
                    value={settings.businessEmail}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pickup Instructions */}
          <Card variant="outlined">
            <CardContent>
              <h2 className="text-xl font-semibold text-neutral-800 mb-6 flex items-center gap-2">
                <Bell className="w-5 h-5 text-pink-600" />
                Pickup Instructions
              </h2>

              <div className="space-y-4">
                <Textarea
                  label="English"
                  name="pickupInstructionsEn"
                  value={settings.pickupInstructionsEn}
                  onChange={handleChange}
                  rows={3}
                />
                <Textarea
                  label="Spanish"
                  name="pickupInstructionsEs"
                  value={settings.pickupInstructionsEs}
                  onChange={handleChange}
                  rows={3}
                />
                <Textarea
                  label="Portuguese"
                  name="pickupInstructionsPt"
                  value={settings.pickupInstructionsPt}
                  onChange={handleChange}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button onClick={handleSave} isLoading={saving} size="lg">
              Save Settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
