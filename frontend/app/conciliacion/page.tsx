import { Suspense } from "react";
import { Loader2, Palette, Loader3, CheckCircle, XCircle, Clipboard, Calendar, Layout, List, Search, } from "lucide-react";
import { Button, Card, CardHeader, CardTitle, Tabs, TabsList, TabsTrigger, Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, Input, Select, SelectTrigger, SelectValue, SelectContent, Option, Switch, Progress, Toast, Toaster, Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetClose, Avatar, Badge, Table, TableRow, TableHeader, TableBody, TableCell, TableFooter, Form, FormControl, FormLabel, FormMessage, useForm, } from "@/components/ui";
import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApi } from "@/lib/api";
import { useReconciliation } from "@/hooks/use-reconciliation";

export const metadata = {
  title: "Conciliación Bancaria - MVP",
  description: "Sistema de conciliación automática de cartolas bancarias y facturas SII",
};

function CurrencyInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <FormControl>
      <Input
        type="text"
        value={value.replace(/[^\d]/g, "")}
        onChange={(e) => onChange(e.target.value.replace(/[^\d]/g, ""))}
        placeholder="0"
        className="max-w-[200px]"
        inputMode="numeric"
      />
    </FormControl>
  );
}

function RUTInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const clean = value.replace(/[^\dkK]/g, "");
  return (
    <FormControl>
      <Input
        value={clean}
        onChange={(e) => onChange(e.target.value)}
        placeholder="76.123.456-7"
        className="max-w-[250px]"
        inputMode="text"
      />
    </FormControl>
  );
}

export default function ConciliacionPage() {
  const router = useRouter();
  const { data: apiData, isLoading, error, mutate } = useApi();
  const { useUploadCartola, useUploadSII, useRunReconciliation, useSummary, useHistory } = useReconciliation();
  const [tab, setTab] = useState<"cartola" | "sii">("cartola");
  const [selectedBank, setSelectedBank] = useState<string>("");

  useEffect(() => {
    // Check auth
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/");
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-background font-sans">
      {/* Header */}
      <header className="border-b border-background/50 backdrop-blassistant-blur bg-background/80 fixed w-full top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <Clipboard className="h-5 w-5"/>
              </div>
              <div>
                <h1 className="text-xl font-bold">MVP Conciliación Bancaria</h1>
                <p className="text-sm text-muted-foreground">Sistema de conciliación automática de cartolas bancarias y facturas SII</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={false}
                onCheckedChange={() => {}}
                className="rounded-md bg-gray-200 dark:bg-gray-700"
              />
              <span className="text-sm text-muted-foreground">Dark</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-20 max-w-7xl mx-auto px-6">
        {/* Tabs */}
        <Tabs defaultValue="cartola" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-background/50 rounded-lg p-2 select-none">
            <TabsTrigger value="cartola" className="flex flex-col items-center py-2 px-2 text-sm font-medium text-muted-foreground rounded-lg hover:bg-primary/5 focus:bg-primary/20 focus:outline-none">
              <svg className="h-4 w-4 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M4 6h16M4 12h16M4 18h16"/></svg>
              Cartola Bancaria
            </TabsTrigger>
            <TabsTrigger value="sii" className="flex flex-col items-center py-2 px-2 text-sm font-medium text-muted-foreground rounded-lg hover:bg-primary/5 focus:bg-primary/20 focus:outline-none">
              <svg className="h-4 w-4 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M9 19v6m5-5v-6m0 0V5m6 3v6m5-5v6m-5-5h6m-5-5H5m5.618-2.333a2.5 2.5 0 0 1 3.535 0L16 4l4 6-4 6L8.382 13.333a2.5 2.5 0 0 1-3.535 0L4 10l6 6z"/></svg>
              Facturas SII
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Content based on tab */}
        <TabsContent value="cartola">
          <Card className="p-6">
            <CardHeader>
              <CardTitle>Subir Cartola Bancaria</CardTitle>
            </CardHeader>
            <p className="text-sm text-muted-foreground mb-4">Formato compatible: BancoEstado, Banco de Chile, Santander, Scotiabank, BCI o Genérico</p>
            
            <div className="space-y-4">
              <BankUploadZone
                onAccept={(files) => handleCartolaUpload(files[0])}
                acceptedFiles=".csv,.xlsx,.xls"
                bankLabel="Seleccionar banco"
                bankOptions={["BancoEstado", "Banco de Chile", "Santander", "Scotiabank", "BCI", "Genérico"]}
              />
              
              {cartolaResult && (
                <Card className="mt-4 p-4">
                  <h3 className="font-medium mb-3">Vista Preliminar (5 filas)</h3>
                  <Table className="w-full text-sm">
                    <TableHeader>
                      <TableRow>
                        <TableColumn>Fecha</TableColumn>
                        <TableColumn>RUT</TableColumn>
                        <TableColumn>Monto</TableColumn>
                        <TableColumn>Tipo</TableColumn>
                        <TableColumn>Descripción</TableColumn>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cartolaResult.Rows.slice(0, 5).map((row, i) => (
                        <TableRow key={i}>
                          <TableCell>{row.Fecha.format("DD/MM/YYYY")}</TableCell>
                          <TableCell>{row.RUT}</TableCell>
                          <TableCell>${formatCurrency(row.Monto)}</TableCell>
                          <TableCell>{row.TipoMovimiento}</TableCell>
                          <TableCell>{row.Descripcion.substring(0, 30)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {cartolaResult.Errors.length > 0 && (
                    <p className="mt-2 text-sm text-destructive">{cartolaResult.Errors.join(", ")}</p>
                  )}
                </Card>
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="sii">
          <Card className="p-6">
            <CardHeader>
              <CardTitle>Subir Facturas SII</CardTitle>
            </CardHeader>
            <p className="text-sm text-muted-foreground mb-4">Formato: CSV con separador punto y coma (;)</p>
            
            <div className="space-y-4">
              <SIIUploadZone
                onAccept={(file) => handleSIIUpload(file)}
                acceptedFiles=".csv"
              />
              
              {siifResult && (
                <Card className="mt-4 p-4">
                  <h3 className="font-medium mb-3">Vista Preliminar (5 filas)</h3>
                  <Table className="w-full text-sm">
                    <TableHeader>
                      <TableRow>
                        <TableColumn>Tipo Doc</TableColumn>
                        <TableColumn>Folio</TableColumn>
                        <TableColumn>RUT Emisor</TableColumn>
                        <TableColumn>Fecha</TableColumn>
                        <TableColumn>Monto Total</TableColumn>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {siifResult.Rows.slice(0, 5).map((row, i) => (
                        <TableRow key={i}>
                          <TableRow>{/* simplified */}</TableRow>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {siifResult.Errors.length > 0 && (
                    <p className="mt-2 text-sm text-destructive">{siifResult.Errors.join(", ")}</p>
                  )}
                </Card>
              )}
            </div>
          </Card>
        </TabsContent>
      </TabsContent>
    </div>
  );
}

function formatCurrency(monto: number): string {
  const formatted = new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
  }).format(monto / 100);
  return formatted;
}

function handleCartolaUpload(file: File) {
  // Handle file upload
  const reader = new FileReader();
  reader.onload = (e) => {
    const data = new Uint8Array(e.target!.result as ArrayBuffer);
    // Parse CSV/Excel
    console.log("Cartola data loaded", data.length);
  };
  reader.readAsArrayBuffer(file);
}

function handleSIIUpload(file: File) {
  // Handle SII file upload
  const reader = new FileReader();
  reader.onload = (e) => {
    const data = new Uint8Array(e.target!.result as ArrayBuffer);
    console.log("SII data loaded", data.length);
  };
  reader.readAsArrayBuffer(file);
}