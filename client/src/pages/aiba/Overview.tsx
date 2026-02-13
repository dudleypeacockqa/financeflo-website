import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowRight,
  BarChart3,
  BrainCircuit,
  Cog,
  Database,
  LineChart,
  Search,
  Shield,
  Target,
  Zap,
} from "lucide-react";
import { Link } from "wouter";

const engines = [
  {
    name: "Revenue Engine",
    icon: LineChart,
    color: "text-teal",
    bg: "bg-teal/10",
    description: "Sales pipelines, pricing models, customer acquisition, retention, and growth strategies.",
    constraints: ["Pipeline velocity", "Conversion rates", "Customer lifetime value", "Revenue concentration"],
  },
  {
    name: "Operations Engine",
    icon: Cog,
    color: "text-amber",
    bg: "bg-amber/10",
    description: "Processes, workflows, resource allocation, capacity planning, and operational efficiency.",
    constraints: ["Manual bottlenecks", "Process redundancy", "Resource utilisation", "Throughput limits"],
  },
  {
    name: "Compliance Engine",
    icon: Shield,
    color: "text-blue-400",
    bg: "bg-blue-400/10",
    description: "Regulatory requirements, risk management, audit readiness, and governance frameworks.",
    constraints: ["Regulatory gaps", "Risk exposure", "Audit preparation time", "Policy currency"],
  },
  {
    name: "Data Engine",
    icon: Database,
    color: "text-purple-400",
    bg: "bg-purple-400/10",
    description: "Data infrastructure, analytics capabilities, reporting, and decision intelligence.",
    constraints: ["Data silos", "Reporting latency", "Data quality", "Analytics maturity"],
  },
];

const aibaSteps = [
  { letter: "A", title: "Analyse", description: "Map operations across 4 Engines to understand current state and identify constraints.", icon: Search },
  { letter: "I", title: "Identify", description: "Classify constraints as Capacity, Knowledge, Process, or Scale using the CKPS framework.", icon: Target },
  { letter: "B", title: "Build", description: "Develop recommendations using QDOAA: Quick wins, Departmental, Organisational, AI Automation, Advanced AI.", icon: Zap },
  { letter: "A", title: "Advise", description: "Map implementation to AI types: ML for prediction, Agentic for automation, RL for optimisation.", icon: BrainCircuit },
];

export default function AIBAOverview() {
  return (
    <div className="min-h-screen bg-background pt-20">
      {/* Hero */}
      <section className="container py-16 text-center">
        <Badge className="bg-teal/20 text-teal border-0 mb-4">FinanceFlo Methodology</Badge>
        <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: "var(--font-heading)" }}>
          AIBA: AI Business Analysis
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
          A structured diagnostic methodology that analyses your business operations, identifies the real
          constraints holding you back, and builds an AI-powered roadmap for transformation.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/aiba/diagnostic">
            <Button className="bg-teal hover:bg-teal/90 gap-2">
              Start Diagnostic <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link href="/assessment">
            <Button variant="outline" className="border-teal/30 text-teal hover:bg-teal/10">
              Take Quick Assessment
            </Button>
          </Link>
        </div>
      </section>

      {/* AIBA Process */}
      <section className="container py-16">
        <h2 className="text-2xl font-bold text-center mb-10" style={{ fontFamily: "var(--font-heading)" }}>
          The AIBA Process
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {aibaSteps.map((step, i) => (
            <Card key={i} className="bg-navy-light border-border/30 text-center">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-full bg-teal/20 flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold text-teal">{step.letter}</span>
                </div>
                <h3 className="font-bold text-lg mb-2" style={{ fontFamily: "var(--font-heading)" }}>
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* 4 Engines */}
      <section className="container py-16">
        <h2 className="text-2xl font-bold text-center mb-4" style={{ fontFamily: "var(--font-heading)" }}>
          The 4 Engines Framework
        </h2>
        <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-10">
          Every business runs on four operational engines. AIBA analyses each one to find where
          constraints are limiting growth and where AI can create the most impact.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {engines.map((engine) => (
            <Card key={engine.name} className="bg-navy-light border-border/30">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg ${engine.bg} flex items-center justify-center`}>
                    <engine.icon className={`w-5 h-5 ${engine.color}`} />
                  </div>
                  <CardTitle className="text-lg" style={{ fontFamily: "var(--font-heading)" }}>
                    {engine.name}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">{engine.description}</p>
                <div className="flex flex-wrap gap-1">
                  {engine.constraints.map((constraint) => (
                    <Badge key={constraint} className={`${engine.bg} ${engine.color} border-0 text-xs`}>
                      {constraint}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Constraint Types */}
      <section className="container py-16">
        <h2 className="text-2xl font-bold text-center mb-4" style={{ fontFamily: "var(--font-heading)" }}>
          Constraint Classification (CKPS)
        </h2>
        <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-10">
          Every constraint falls into one of four categories. Understanding the type determines the solution.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { name: "Capacity", color: "bg-teal/20 text-teal", description: "Not enough people, time, or resources to handle demand." },
            { name: "Knowledge", color: "bg-amber/20 text-amber", description: "Lacking expertise, training, or information to execute effectively." },
            { name: "Process", color: "bg-blue-500/20 text-blue-400", description: "Inefficient workflows, manual steps, or poor system integration." },
            { name: "Scale", color: "bg-purple-500/20 text-purple-400", description: "Current approach doesn't scale with growth. Infrastructure ceiling." },
          ].map((constraint) => (
            <Card key={constraint.name} className="bg-navy-light border-border/30 text-center">
              <CardContent className="p-6">
                <Badge className={`${constraint.color} border-0 mb-3`}>{constraint.name}</Badge>
                <p className="text-sm text-muted-foreground">{constraint.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container py-16 text-center">
        <Card className="bg-navy-light border-teal/30 max-w-2xl mx-auto">
          <CardContent className="p-8">
            <BrainCircuit className="w-12 h-12 text-teal mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: "var(--font-heading)" }}>
              Ready to Diagnose Your Business?
            </h2>
            <p className="text-muted-foreground mb-6">
              Start with our deep diagnostic to map your 4 Engines, identify constraints,
              and get AI-powered recommendations tailored to your business.
            </p>
            <Link href="/aiba/diagnostic">
              <Button className="bg-teal hover:bg-teal/90 gap-2">
                Start AIBA Diagnostic <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
