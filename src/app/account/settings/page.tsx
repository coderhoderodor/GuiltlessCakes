'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Lock, Check } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import {
  Button,
  Input,
  Select,
  Card,
  CardContent,
  LoadingScreen,
} from '@/components/ui';
import { SUPPORTED_LANGUAGES } from '@/lib/constants';
import { validatePhoneNumber } from '@/lib/utils';

export default function SettingsPage() {
  const router = useRouter();
  const { user, profile, loading, isAuthenticated, updateProfile, updatePassword } =
    useAuth();

  const [profileData, setProfileData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    preferred_language: 'en' as 'en' | 'es' | 'pt',
  });

  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: '',
  });

  const [profileSaving, setProfileSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth/login?redirectTo=/account/settings');
    }
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    if (profile) {
      setProfileData({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        phone: profile.phone || '',
        preferred_language: profile.preferred_language || 'en',
      });
    }
  }, [profile]);

  const handleProfileChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setProfileData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess(false);

    if (!validatePhoneNumber(profileData.phone)) {
      setProfileError('Please enter a valid phone number');
      return;
    }

    setProfileSaving(true);

    try {
      await updateProfile(profileData);
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err) {
      setProfileError(
        err instanceof Error ? err.message : 'Failed to update profile'
      );
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess(false);

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return;
    }

    setPasswordSaving(true);

    try {
      await updatePassword(passwordData.newPassword);
      setPasswordSuccess(true);
      setPasswordData({ newPassword: '', confirmPassword: '' });
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (err) {
      setPasswordError(
        err instanceof Error ? err.message : 'Failed to update password'
      );
    } finally {
      setPasswordSaving(false);
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="py-20 lg:py-32">
      <div className="container max-w-2xl">
        <h1 className="text-3xl font-bold text-neutral-800 mb-14">
          Account Settings
        </h1>

        <div className="space-y-12">
          {/* Profile Information */}
          <Card variant="outlined">
            <CardContent>
              <h2 className="text-xl font-semibold text-neutral-800 mb-10 flex items-center gap-3">
                <User className="w-5 h-5 text-pink-600" />
                Profile Information
              </h2>

              {profileError && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                  {profileError}
                </div>
              )}

              {profileSuccess && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-600 text-sm flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  Profile updated successfully
                </div>
              )}

              <form onSubmit={handleProfileSubmit} className="space-y-14">
                <div className="grid sm:grid-cols-2 gap-10">
                  <Input
                    label="First Name"
                    name="first_name"
                    value={profileData.first_name}
                    onChange={handleProfileChange}
                    required
                  />
                  <Input
                    label="Last Name"
                    name="last_name"
                    value={profileData.last_name}
                    onChange={handleProfileChange}
                    required
                  />
                </div>

                <Input
                  label="Email"
                  type="email"
                  value={user?.email || ''}
                  disabled
                  helperText="Email cannot be changed"
                />

                <Input
                  label="Phone Number"
                  name="phone"
                  value={profileData.phone}
                  onChange={handleProfileChange}
                  required
                  placeholder="(555) 123-4567"
                  helperText="Used for pickup coordination"
                />

                <Select
                  label="Preferred Language"
                  name="preferred_language"
                  value={profileData.preferred_language}
                  onChange={handleProfileChange}
                  options={SUPPORTED_LANGUAGES.map((lang) => ({
                    value: lang.code,
                    label: `${lang.flag} ${lang.label}`,
                  }))}
                />

                <div className="pt-4">
                  <Button type="submit" isLoading={profileSaving}>
                    Save Changes
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Change Password */}
          <Card variant="outlined">
            <CardContent>
              <h2 className="text-xl font-semibold text-neutral-800 mb-10 flex items-center gap-3">
                <Lock className="w-5 h-5 text-pink-600" />
                Change Password
              </h2>

              {passwordError && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                  {passwordError}
                </div>
              )}

              {passwordSuccess && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-600 text-sm flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  Password updated successfully
                </div>
              )}

              <form onSubmit={handlePasswordSubmit} className="space-y-14">
                <Input
                  type="password"
                  label="New Password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  required
                  minLength={8}
                />

                <Input
                  type="password"
                  label="Confirm New Password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  required
                />

                <p className="text-xs text-neutral-500 leading-relaxed pt-2">
                  Password must be at least 8 characters long.
                </p>

                <div className="pt-4">
                  <Button type="submit" isLoading={passwordSaving}>
                    Update Password
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Account Information */}
          <Card variant="outlined">
            <CardContent>
              <h2 className="text-lg font-semibold text-neutral-800 mb-8">
                Account Information
              </h2>
              <div className="text-sm text-neutral-600 space-y-4">
                <p>
                  <strong>Member since:</strong>{' '}
                  {profile?.created_at
                    ? new Date(profile.created_at).toLocaleDateString()
                    : 'N/A'}
                </p>
                <p>
                  <strong>Account ID:</strong> {user?.id?.slice(0, 8)}...
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
