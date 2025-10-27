"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Settings, User, Bell, Shield, Palette } from "lucide-react";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    name: "John Doe",
    email: "john@example.com",
    company: "Acme Corp",
    role: "admin",
    notifications: {
      email: true,
      push: false,
      sms: true,
    },
    privacy: {
      profilePublic: true,
      showEmail: false,
      showPhone: true,
    },
    theme: "system",
  });

  const roleOptions = [
    { value: "admin", label: "Administrator" },
    { value: "editor", label: "Editor" },
    { value: "viewer", label: "Viewer" },
  ];

  const themeOptions = [
    { value: "light", label: "Light" },
    { value: "dark", label: "Dark" },
    { value: "system", label: "System" },
  ];

  const handleSave = () => {
    alert("Settings saved successfully!");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Settings</h1>
        <p className="text-zinc-600 dark:text-zinc-400">Manage your account settings and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input 
              label="Full Name" 
              value={settings.name}
              onChange={(e) => setSettings({...settings, name: e.target.value})}
            />
            <Input 
              label="Email" 
              type="email"
              value={settings.email}
              onChange={(e) => setSettings({...settings, email: e.target.value})}
            />
            <Input 
              label="Company" 
              value={settings.company}
              onChange={(e) => setSettings({...settings, company: e.target.value})}
            />
            <Select 
              label="Role"
              options={roleOptions}
              value={settings.role}
              onChange={(e) => setSettings({...settings, role: e.target.value})}
            />
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Checkbox 
              label="Email Notifications"
              checked={settings.notifications.email}
              onChange={(e) => setSettings({
                ...settings, 
                notifications: {...settings.notifications, email: e.target.checked}
              })}
            />
            <Checkbox 
              label="Push Notifications"
              checked={settings.notifications.push}
              onChange={(e) => setSettings({
                ...settings, 
                notifications: {...settings.notifications, push: e.target.checked}
              })}
            />
            <Checkbox 
              label="SMS Notifications"
              checked={settings.notifications.sms}
              onChange={(e) => setSettings({
                ...settings, 
                notifications: {...settings.notifications, sms: e.target.checked}
              })}
            />
          </CardContent>
        </Card>

        {/* Privacy Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Privacy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Checkbox 
              label="Public Profile"
              checked={settings.privacy.profilePublic}
              onChange={(e) => setSettings({
                ...settings, 
                privacy: {...settings.privacy, profilePublic: e.target.checked}
              })}
            />
            <Checkbox 
              label="Show Email"
              checked={settings.privacy.showEmail}
              onChange={(e) => setSettings({
                ...settings, 
                privacy: {...settings.privacy, showEmail: e.target.checked}
              })}
            />
            <Checkbox 
              label="Show Phone"
              checked={settings.privacy.showPhone}
              onChange={(e) => setSettings({
                ...settings, 
                privacy: {...settings.privacy, showPhone: e.target.checked}
              })}
            />
          </CardContent>
        </Card>
      </div>

      {/* Theme Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Appearance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-zinc-900 dark:text-zinc-100">Theme</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">Choose your preferred theme</p>
            </div>
            <Select 
              options={themeOptions}
              value={settings.theme}
              onChange={(e) => setSettings({...settings, theme: e.target.value})}
              className="w-32"
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave}>
          Save Settings
        </Button>
      </div>
    </div>
  );
}