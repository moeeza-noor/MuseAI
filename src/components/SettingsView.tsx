import { Settings, Shield, Database, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

export function SettingsView() {
  return (
    <div className="flex-1 p-6 overflow-y-auto">
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Settings</h2>
          <p className="text-muted-foreground">Manage your MuseAI preferences</p>
        </div>

        <Card className="glass">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              <CardTitle>Privacy & Security</CardTitle>
            </div>
            <CardDescription>
              MuseAI is privacy-first. All data stays on your device.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="local-storage" className="cursor-pointer">
                Local Storage Only
              </Label>
              <Switch id="local-storage" checked disabled />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="auto-voice" className="cursor-pointer">
                Auto Voice Response
              </Label>
              <Switch id="auto-voice" defaultChecked />
            </div>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-secondary" />
              <CardTitle>Storage</CardTitle>
            </div>
            <CardDescription>
              Your documents are stored using IndexedDB
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Storage Type</span>
                <span className="font-medium">IndexedDB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Location</span>
                <span className="font-medium">Browser Local Storage</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Info className="w-5 h-5 text-accent" />
              <CardTitle>About MuseAI</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              MuseAI is a voice-enabled, privacy-first knowledge companion that helps you talk to your documents and notes naturally.
            </p>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Version</span>
                <span className="font-medium">1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Built with</span>
                <span className="font-medium">React + TypeScript</span>
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              <h4 className="font-semibold mb-2">Features</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• RAG-based document Q&A</li>
                <li>• Voice input/output</li>
                <li>• Conversational memory</li>
                <li>• Local-first storage</li>
                <li>• Document summarization</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
