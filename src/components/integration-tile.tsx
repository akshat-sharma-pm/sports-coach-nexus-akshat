import { useState } from "react";
import type { Provider } from "@/data/integrations";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Settings2, Plug } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

export function IntegrationTile({ provider }: { provider: Provider }) {
  const [p, setP] = useState(provider);
  const [syncing, setSyncing] = useState(false);

  function sync() {
    setSyncing(true);
    setP({ ...p, status: "Syncing" });
    setTimeout(() => {
      setSyncing(false);
      setP({ ...p, status: "Connected", lastSync: new Date().toISOString() });
      toast.success(`${p.name} synced · ${p.deviceCount} devices`);
    }, 1100);
  }
  function disconnect() {
    setP({ ...p, status: "Disconnected" });
    toast(`${p.name} disconnected`);
  }

  const tone = p.status === "Connected" ? "text-[color:var(--success)]" :
               p.status === "Syncing" ? "text-primary" :
               p.status === "Error" ? "text-[color:var(--danger)]" : "text-muted-foreground";

  return (
    <div className="surface p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Plug className="w-3.5 h-3.5 text-primary" />
            <span className="text-[13px] font-medium">{p.name}</span>
          </div>
          <div className="text-[10px] text-muted-foreground font-mono mt-0.5">{p.category} · {p.apiVersion}</div>
        </div>
        <Badge variant="outline" className={`text-[10px] ${tone}`}>{p.status}</Badge>
      </div>

      <div className="grid grid-cols-3 gap-2 text-[11px]">
        <Stat label="Devices" value={`${p.deviceCount}`} />
        <Stat label="Error rate" value={`${(p.errorRate * 100).toFixed(2)}%`} />
        <Stat label="Last sync" value={formatDistanceToNow(new Date(p.lastSync), { addSuffix: true })} />
      </div>

      <div>
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Data streams</div>
        <div className="flex flex-wrap gap-1">
          {p.streams.map(s => <span key={s} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-secondary/60 border border-border">{s}</span>)}
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <Button size="sm" variant="outline" className="h-7 text-[11px] flex-1 gap-1" onClick={sync} disabled={syncing}>
          <RefreshCw className={`w-3 h-3 ${syncing ? "animate-spin" : ""}`} /> Sync now
        </Button>
        <Button size="sm" variant="ghost" className="h-7 text-[11px] gap-1" onClick={() => toast("Configuration opened")}>
          <Settings2 className="w-3 h-3" />
        </Button>
        <Button size="sm" variant="ghost" className="h-7 text-[11px]" onClick={disconnect}>Disconnect</Button>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-card/60 border border-border rounded p-1.5">
      <div className="text-[9px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="font-mono text-[12px] truncate">{value}</div>
    </div>
  );
}
