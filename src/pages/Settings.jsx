import { useState } from 'react';

import MainLayout from '../layouts/MainLayout';

import SettingsMenu from '../components/settings/SettingsMenu';

import GeneralSettings from '../components/settings/GeneralSettings';
import UserRolesSettings from '../components/settings/UserRolesSettings';
import NotificationSettings from '../components/settings/NotificationSettings';
import SecuritySettings from '../components/settings/SecuritySettings';
import BackupSettings from '../components/settings/BackupSettings';
import SystemInfo from '../components/settings/SystemInfo';

function Settings() {
  const [activeTab, setActiveTab] = useState('General');

  const renderContent = () => {
    switch (activeTab) {
      case 'General':
        return <GeneralSettings />;

      case 'Users & Roles':
        return <UserRolesSettings />;

      case 'Notifications':
        return <NotificationSettings />;

      case 'Security':
        return <SecuritySettings />;

      case 'Backup & Restore':
        return <BackupSettings />;

      case 'System Information':
        return <SystemInfo />;

      default:
        return <GeneralSettings />;
    }
  };

  return (
    <MainLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">
          Settings
        </h1>

        <p className="text-gray-500 mt-1">
          Configure system preferences and administration settings.
        </p>
      </div>

      {/* Content */}
      <div className="grid grid-cols-12 gap-6">

        {/* Left Menu */}
        <div className="col-span-3">
          <SettingsMenu
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        </div>

        {/* Right Content */}
        <div className="col-span-9">
          {renderContent()}
        </div>

      </div>
    </MainLayout>
  );
}

export default Settings;