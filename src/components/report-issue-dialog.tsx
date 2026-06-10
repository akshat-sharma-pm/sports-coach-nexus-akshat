import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCases } from "@/store/cases";
import { athletes, type BodyRegion } from "@/data/seed";
import { toast } from "sonner";
import { AlertTriangle } from "lucide-react";

const REGIONS: BodyRegion[] = [
  "hamstring_l","hamstring_r","knee_l","knee_r","ankle_l","ankle_r","shoulder_l","shoulder_r","back_lower","calf_l","calf_r","quad_l","quad_r","hip_l","hip_r","wrist_l","wrist_r",
];

export function ReportIssueDialog({ athleteId, trigger }: { athleteId?: string; trigger?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [aid, setAid] = useState(athleteId ?? athletes[0].id);
  const [site, setSite] = useState<BodyRegion>("hamstring_l");
  const [pain, setPain] = useState(4);
  const [severity, setSeverity] = useState<"Minor" | "Moderate" | "Severe">("Moderate");
  const [symptoms, setSymptoms] = useState("");
  const report = useCases(s => s.reportIssue);

  function submit() {
    const id = report({ athleteId: aid, site, painScale: pain, severity, symptoms: symptoms || "Athlete-reported issue" });
    toast.success(`Issue reported · case ${id} routed to physio inbox`);
    setOpen(false);
    setSymptoms(""); setPain(4);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm" variant="destructive" className="h-7 text-[12px] gap-1">
            <AlertTriangle className="w-3.5 h-3.5" /> Report Issue
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="bg-card">
        <DialogHeader>
          <DialogTitle className="text-[14px]">Report new medical issue</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 text-[12px]">
          {!athleteId && (
            <Field label="Athlete">
              <Select value={aid} onValueChange={setAid}>
                <SelectTrigger className="h-8 text-[12px]"><SelectValue /></SelectTrigger>
                <SelectContent className="max-h-[280px]">
                  {athletes.slice(0, 40).map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
          )}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Body region">
              <Select value={site} onValueChange={(v) => setSite(v as BodyRegion)}>
                <SelectTrigger className="h-8 text-[12px]"><SelectValue /></SelectTrigger>
                <SelectContent>{REGIONS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Severity">
              <Select value={severity} onValueChange={(v) => setSeverity(v as typeof severity)}>
                <SelectTrigger className="h-8 text-[12px]"><SelectValue /></SelectTrigger>
                <SelectContent>{["Minor","Moderate","Severe"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
          </div>
          <Field label={`Pain scale (VAS): ${pain}/10`}>
            <input type="range" min={0} max={10} value={pain} onChange={(e) => setPain(Number(e.target.value))} className="w-full accent-primary" />
          </Field>
          <Field label="Symptoms / notes">
            <Textarea value={symptoms} onChange={(e) => setSymptoms(e.target.value)} className="text-[12px] min-h-[70px]" placeholder="When did it start? What aggravates it?" />
          </Field>
        </div>
        <DialogFooter>
          <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
          <Button size="sm" onClick={submit}>Submit to physio</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
