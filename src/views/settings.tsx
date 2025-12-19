/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Save, RotateCcw, Moon, Sun, Monitor, Key, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface AppSettings {
  theme: "light" | "dark" | "system";
  geminiApiKey: string;
  autoSave: boolean;
  defaultCitationStyle: string;
  defaultTranslationLang: string;
}

const defaultSettings: AppSettings = {
  theme: "system",
  geminiApiKey: "",
  autoSave: true,
  defaultCitationStyle: "apa",
  defaultTranslationLang: "es",
};

const Settings = () => {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [showApiKey, setShowApiKey] = useState(false);

  // Load settings from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("documentiq-settings");
    if (saved) {
      try {
        setSettings({ ...defaultSettings, ...JSON.parse(saved) });
      } catch {
        // Use defaults if parsing fails
      }
    }
  }, []);

  // Apply theme
  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === "dark") {
      root.classList.add("dark");
    } else if (settings.theme === "light") {
      root.classList.remove("dark");
    } else {
      // System preference
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (prefersDark) {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    }
  }, [settings.theme]);

  const handleSave = () => {
    localStorage.setItem("documentiq-settings", JSON.stringify(settings));
    toast.success("Settings saved!");
  };

  const handleReset = () => {
    setSettings(defaultSettings);
    localStorage.removeItem("documentiq-settings");
    toast.info("Settings reset to defaults");
  };

  const handleClearData = () => {
    if (confirm("Are you sure you want to clear all app data? This cannot be undone.")) {
      localStorage.clear();
      setSettings(defaultSettings);
      toast.success("All data cleared");
    }
  };

  return (
    <div className="h-full p-6 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">
          Configure your DocumentIQ preferences
        </p>
      </div>

      <div className="space-y-6">
        {/* Appearance */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Appearance</CardTitle>
            <CardDescription>Customize how DocumentIQ looks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Theme</Label>
                <p className="text-sm text-muted-foreground">
                  Select your preferred color scheme
                </p>
              </div>
              <Select
                value={settings.theme}
                onValueChange={(v) => setSettings({ ...settings, theme: v as AppSettings["theme"] })}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">
                    <div className="flex items-center gap-2">
                      <Sun className="h-4 w-4" /> Light
                    </div>
                  </SelectItem>
                  <SelectItem value="dark">
                    <div className="flex items-center gap-2">
                      <Moon className="h-4 w-4" /> Dark
                    </div>
                  </SelectItem>
                  <SelectItem value="system">
                    <div className="flex items-center gap-2">
                      <Monitor className="h-4 w-4" /> System
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* API Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Key className="h-5 w-5" /> API Configuration
            </CardTitle>
            <CardDescription>
              Configure API keys for AI-powered features
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="api-key">Gemini API Key</Label>
              <div className="flex gap-2">
                <Input
                  id="api-key"
                  type={showApiKey ? "text" : "password"}
                  value={settings.geminiApiKey}
                  onChange={(e) => setSettings({ ...settings, geminiApiKey: e.target.value })}
                  placeholder="Enter your Gemini API key"
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  onClick={() => setShowApiKey(!showApiKey)}
                >
                  {showApiKey ? "Hide" : "Show"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Get your API key from{" "}
                <a
                  href="https://makersuite.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Google AI Studio
                </a>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Defaults */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Default Settings</CardTitle>
            <CardDescription>Set default values for tools</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto-save</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically save drafts
                </p>
              </div>
              <Switch
                checked={settings.autoSave}
                onCheckedChange={(v) => setSettings({ ...settings, autoSave: v })}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Default Citation Style</Label>
                <p className="text-sm text-muted-foreground">
                  For citation generator
                </p>
              </div>
              <Select
                value={settings.defaultCitationStyle}
                onValueChange={(v) => setSettings({ ...settings, defaultCitationStyle: v })}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="apa">APA</SelectItem>
                  <SelectItem value="mla">MLA</SelectItem>
                  <SelectItem value="chicago">Chicago</SelectItem>
                  <SelectItem value="harvard">Harvard</SelectItem>
                  <SelectItem value="ieee">IEEE</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Default Translation Language</Label>
                <p className="text-sm text-muted-foreground">
                  Target language for translator
                </p>
              </div>
              <Select
                value={settings.defaultTranslationLang}
                onValueChange={(v) => setSettings({ ...settings, defaultTranslationLang: v })}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                  <SelectItem value="de">German</SelectItem>
                  <SelectItem value="it">Italian</SelectItem>
                  <SelectItem value="pt">Portuguese</SelectItem>
                  <SelectItem value="zh-CN">Chinese</SelectItem>
                  <SelectItem value="ja">Japanese</SelectItem>
                  <SelectItem value="ko">Korean</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Data Management</CardTitle>
            <CardDescription>Manage your stored data</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="destructive" onClick={handleClearData}>
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All Data
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              This will remove all saved settings and cached data
            </p>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Settings
          </Button>
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset to Defaults
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
