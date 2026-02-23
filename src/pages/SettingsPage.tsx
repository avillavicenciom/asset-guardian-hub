import { Settings } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ModelsTab from './settings/ModelsTab';
import StatusesTab from './settings/StatusesTab';
import AssetTypesTab from './settings/AssetTypesTab';
import TechniciansTab from './settings/TechniciansTab';
import HardwarePartsTab from './settings/HardwarePartsTab';
import LocationsTab from './settings/LocationsTab';

export default function SettingsPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Settings className="w-6 h-6 text-primary" />
        <div>
          <h1 className="text-xl font-bold text-foreground">Ajustes</h1>
          <p className="text-sm text-muted-foreground">Gestiona los catálogos del sistema</p>
        </div>
      </div>

      <Tabs defaultValue="models" className="space-y-4">
        <TabsList>
          <TabsTrigger value="models">Modelos</TabsTrigger>
          <TabsTrigger value="statuses">Estados</TabsTrigger>
          <TabsTrigger value="types">Tipos</TabsTrigger>
          <TabsTrigger value="technicians">Técnicos</TabsTrigger>
          <TabsTrigger value="parts">Piezas hardware</TabsTrigger>
          <TabsTrigger value="locations">Ubicaciones</TabsTrigger>
        </TabsList>

        <TabsContent value="models">
          <ModelsTab />
        </TabsContent>
        <TabsContent value="statuses">
          <StatusesTab />
        </TabsContent>
        <TabsContent value="types">
          <AssetTypesTab />
        </TabsContent>
        <TabsContent value="technicians">
          <TechniciansTab />
        </TabsContent>
        <TabsContent value="parts">
          <HardwarePartsTab />
        </TabsContent>
        <TabsContent value="locations">
          <LocationsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}