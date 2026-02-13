import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  ArrowRight,
  BrainCircuit,
  Cog,
  Database,
  LineChart,
  Loader2,
  Shield,
} from "lucide-react";
import { useState } from "react";

type EngineRating = 1 | 2 | 3 | 4 | 5;

interface DiagnosticState {
  // Company info
  company: string;
  industry: string;
  companySize: string;
  role: string;
  // Engine ratings
  revenueRating: EngineRating | null;
  revenueNotes: string;
  operationsRating: EngineRating | null;
  operationsNotes: string;
  complianceRating: EngineRating | null;
  complianceNotes: string;
  dataRating: EngineRating | null;
  dataNotes: string;
  // Constraints
  biggestChallenge: string;
  currentTools: string;
  aiExperience: string;
  budget: string;
  timeline: string;
}

const initialState: DiagnosticState = {
  company: "", industry: "", companySize: "", role: "",
  revenueRating: null, revenueNotes: "",
  operationsRating: null, operationsNotes: "",
  complianceRating: null, complianceNotes: "",
  dataRating: null, dataNotes: "",
  biggestChallenge: "", currentTools: "", aiExperience: "", budget: "", timeline: "",
};

const steps = ["Company Info", "Revenue Engine", "Operations Engine", "Compliance Engine", "Data Engine", "Context & Goals"];

function RatingSelector({ value, onChange }: { value: EngineRating | null; onChange: (v: EngineRating) => void }) {
  const labels = ["Very Poor", "Below Average", "Average", "Good", "Excellent"];
  return (
    <div className="flex gap-2">
      {[1, 2, 3, 4, 5].map((rating) => (
        <Button
          key={rating}
          variant={value === rating ? "default" : "outline"}
          className={`flex-1 h-12 flex flex-col gap-0.5 ${
            value === rating ? "bg-teal text-white" : "border-border/30 hover:bg-teal/10"
          }`}
          onClick={() => onChange(rating as EngineRating)}
        >
          <span className="text-lg font-bold">{rating}</span>
          <span className="text-[9px]">{labels[rating - 1]}</span>
        </Button>
      ))}
    </div>
  );
}

export default function AIBADiagnostic() {
  const [step, setStep] = useState(0);
  const [state, setState] = useState<DiagnosticState>(initialState);
  const [submitted, setSubmitted] = useState(false);

  const progress = ((step + 1) / steps.length) * 100;

  function update(partial: Partial<DiagnosticState>) {
    setState((prev) => ({ ...prev, ...partial }));
  }

  function handleSubmit() {
    setSubmitted(true);
    // In Phase 4 this will call the AIBA diagnostic endpoint
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-background pt-20">
        <div className="container py-16 max-w-2xl text-center">
          <BrainCircuit className="w-16 h-16 text-teal mx-auto mb-6" />
          <h1 className="text-3xl font-bold mb-4" style={{ fontFamily: "var(--font-heading)" }}>
            Diagnostic Submitted
          </h1>
          <p className="text-muted-foreground mb-6">
            Your AIBA diagnostic has been submitted. Our team will analyse your responses using
            the 4 Engines framework and generate a comprehensive report with AI-powered recommendations.
          </p>
          <p className="text-sm text-muted-foreground">
            You will receive your report within 24 hours via email.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="container py-8 max-w-2xl">
        <div className="mb-8">
          <Badge className="bg-teal/20 text-teal border-0 mb-2">AIBA Diagnostic</Badge>
          <h1 className="text-2xl font-bold mb-2" style={{ fontFamily: "var(--font-heading)" }}>
            AI Business Analysis
          </h1>
          <p className="text-sm text-muted-foreground">
            Step {step + 1} of {steps.length}: {steps[step]}
          </p>
          <Progress value={progress} className="mt-3 h-1.5" />
        </div>

        <Card className="bg-navy-light border-border/30">
          <CardContent className="p-6 space-y-4">
            {/* Step 0: Company Info */}
            {step === 0 && (
              <>
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Company Name</label>
                  <Input value={state.company} onChange={(e) => update({ company: e.target.value })} className="bg-navy border-border/30" />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Industry</label>
                  <Select value={state.industry} onValueChange={(v) => update({ industry: v })}>
                    <SelectTrigger className="bg-navy border-border/30"><SelectValue placeholder="Select industry" /></SelectTrigger>
                    <SelectContent>
                      {["Financial Services", "Professional Services", "Insurance", "Capital Markets", "Investment Banking", "Healthcare", "Construction", "E-commerce", "Subscription Business", "Other"].map(i => (
                        <SelectItem key={i} value={i}>{i}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Company Size (employees)</label>
                  <Select value={state.companySize} onValueChange={(v) => update({ companySize: v })}>
                    <SelectTrigger className="bg-navy border-border/30"><SelectValue placeholder="Select size" /></SelectTrigger>
                    <SelectContent>
                      {["1-10", "11-50", "51-200", "201-500", "500+"].map(s => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Your Role</label>
                  <Input value={state.role} onChange={(e) => update({ role: e.target.value })} placeholder="e.g. CFO, Operations Director" className="bg-navy border-border/30" />
                </div>
              </>
            )}

            {/* Step 1: Revenue Engine */}
            {step === 1 && (
              <>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-teal/10 flex items-center justify-center">
                    <LineChart className="w-5 h-5 text-teal" />
                  </div>
                  <h3 className="font-bold text-lg">Revenue Engine</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  How effectively does your business generate, convert, and grow revenue?
                </p>
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Rate your Revenue Engine (1-5)</label>
                  <RatingSelector value={state.revenueRating} onChange={(v) => update({ revenueRating: v })} />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Describe your revenue challenges</label>
                  <Textarea value={state.revenueNotes} onChange={(e) => update({ revenueNotes: e.target.value })} rows={4} placeholder="Pipeline visibility, conversion rates, pricing, customer retention..." className="bg-navy border-border/30" />
                </div>
              </>
            )}

            {/* Step 2: Operations Engine */}
            {step === 2 && (
              <>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-amber/10 flex items-center justify-center">
                    <Cog className="w-5 h-5 text-amber" />
                  </div>
                  <h3 className="font-bold text-lg">Operations Engine</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  How efficiently do your internal processes, workflows, and teams operate?
                </p>
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Rate your Operations Engine (1-5)</label>
                  <RatingSelector value={state.operationsRating} onChange={(v) => update({ operationsRating: v })} />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Describe your operational challenges</label>
                  <Textarea value={state.operationsNotes} onChange={(e) => update({ operationsNotes: e.target.value })} rows={4} placeholder="Manual processes, bottlenecks, resource constraints, workflow gaps..." className="bg-navy border-border/30" />
                </div>
              </>
            )}

            {/* Step 3: Compliance Engine */}
            {step === 3 && (
              <>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-blue-400/10 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-blue-400" />
                  </div>
                  <h3 className="font-bold text-lg">Compliance Engine</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  How well do you manage regulatory requirements, risk, and governance?
                </p>
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Rate your Compliance Engine (1-5)</label>
                  <RatingSelector value={state.complianceRating} onChange={(v) => update({ complianceRating: v })} />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Describe your compliance challenges</label>
                  <Textarea value={state.complianceNotes} onChange={(e) => update({ complianceNotes: e.target.value })} rows={4} placeholder="Regulatory burden, audit prep, risk visibility, policy management..." className="bg-navy border-border/30" />
                </div>
              </>
            )}

            {/* Step 4: Data Engine */}
            {step === 4 && (
              <>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-purple-400/10 flex items-center justify-center">
                    <Database className="w-5 h-5 text-purple-400" />
                  </div>
                  <h3 className="font-bold text-lg">Data Engine</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  How effectively do you collect, manage, analyse, and act on data?
                </p>
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Rate your Data Engine (1-5)</label>
                  <RatingSelector value={state.dataRating} onChange={(v) => update({ dataRating: v })} />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Describe your data challenges</label>
                  <Textarea value={state.dataNotes} onChange={(e) => update({ dataNotes: e.target.value })} rows={4} placeholder="Data silos, reporting gaps, analytics capability, data quality..." className="bg-navy border-border/30" />
                </div>
              </>
            )}

            {/* Step 5: Context & Goals */}
            {step === 5 && (
              <>
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">What is your single biggest business challenge right now?</label>
                  <Textarea value={state.biggestChallenge} onChange={(e) => update({ biggestChallenge: e.target.value })} rows={3} className="bg-navy border-border/30" />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">What tools/systems do you currently use?</label>
                  <Textarea value={state.currentTools} onChange={(e) => update({ currentTools: e.target.value })} rows={2} placeholder="ERP, CRM, accounting software, spreadsheets..." className="bg-navy border-border/30" />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">What is your experience with AI so far?</label>
                  <Select value={state.aiExperience} onValueChange={(v) => update({ aiExperience: v })}>
                    <SelectTrigger className="bg-navy border-border/30"><SelectValue placeholder="Select experience level" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No experience</SelectItem>
                      <SelectItem value="exploring">Exploring / Learning</SelectItem>
                      <SelectItem value="piloting">Running pilots</SelectItem>
                      <SelectItem value="using">Using AI in some areas</SelectItem>
                      <SelectItem value="integrated">AI deeply integrated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">What is your ideal timeline for improvement?</label>
                  <Select value={state.timeline} onValueChange={(v) => update({ timeline: v })}>
                    <SelectTrigger className="bg-navy border-border/30"><SelectValue placeholder="Select timeline" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">Immediate (this month)</SelectItem>
                      <SelectItem value="quarter">This quarter</SelectItem>
                      <SelectItem value="half-year">Next 6 months</SelectItem>
                      <SelectItem value="year">Within a year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={() => setStep(Math.max(0, step - 1))}
            disabled={step === 0}
            className="border-border/40 gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Previous
          </Button>

          {step < steps.length - 1 ? (
            <Button
              onClick={() => setStep(step + 1)}
              className="bg-teal hover:bg-teal/90 gap-2"
            >
              Next <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              className="bg-teal hover:bg-teal/90 gap-2"
            >
              Submit Diagnostic <BrainCircuit className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
