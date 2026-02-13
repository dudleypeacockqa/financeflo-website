import { cn } from "@/lib/utils";
import {
  BarChart3,
  BookOpen,
  BrainCircuit,
  ClipboardList,
  Clock,
  Cog,
  FileText,
  FolderOpen,
  FolderSearch,
  Layers,
  LayoutDashboard,
  Library,
  Link2,
  Mail,
  MessageSquare,
  Milestone,
  PanelLeftClose,
  PanelLeftOpen,
  PieChart,
  Send,
  Target,
  Users,
  Webhook,
  Workflow,
  Zap,
} from "lucide-react";
import { useLocation, Link } from "wouter";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    title: "Overview",
    items: [
      { label: "Dashboard", path: "/admin", icon: LayoutDashboard },
    ],
  },
  {
    title: "Lead Generation",
    items: [
      { label: "Leads", path: "/admin/leads", icon: Users },
      { label: "Lead Research", path: "/admin/lead-research", icon: FolderSearch },
      { label: "Batch Monitor", path: "/admin/batch-monitor", icon: Layers },
      { label: "Assessments", path: "/admin/assessments", icon: ClipboardList },
    ],
  },
  {
    title: "Outreach",
    items: [
      { label: "Campaigns", path: "/admin/campaigns", icon: Send },
      { label: "Message Queue", path: "/admin/campaign-builder", icon: MessageSquare },
    ],
  },
  {
    title: "Sales Pipeline",
    items: [
      { label: "Pipeline", path: "/admin/pipeline", icon: Target },
      { label: "Metrics", path: "/admin/pipeline-metrics", icon: PieChart },
      { label: "AIBA Diagnostics", path: "/admin/aiba-diagnostics", icon: BrainCircuit },
      { label: "Proposals", path: "/admin/proposals", icon: FileText },
    ],
  },
  {
    title: "Marketing",
    items: [
      { label: "Workflows", path: "/admin/workflows", icon: Workflow },
      { label: "Email Templates", path: "/admin/email-templates", icon: Mail },
      { label: "Analytics", path: "/admin/marketing-metrics", icon: BarChart3 },
      { label: "Workshops", path: "/admin/workshops", icon: BookOpen },
    ],
  },
  {
    title: "Delivery",
    items: [
      { label: "Projects", path: "/admin/projects", icon: FolderOpen },
      { label: "Timesheets", path: "/admin/timesheets", icon: Clock },
    ],
  },
  {
    title: "System",
    items: [
      { label: "Knowledge Base", path: "/admin/knowledge-base", icon: Library },
      { label: "Prompt Manager", path: "/admin/prompt-manager", icon: Zap },
      { label: "Background Jobs", path: "/admin/jobs", icon: Cog },
      { label: "Webhooks", path: "/admin/webhooks", icon: Webhook },
    ],
  },
];

export default function AdminSidebar() {
  const [location] = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "h-[calc(100vh-64px)] sticky top-16 bg-navy-light border-r border-border/30 transition-all duration-200 flex flex-col",
        collapsed ? "w-16" : "w-56"
      )}
    >
      <div className="flex items-center justify-end p-2 border-b border-border/20">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-foreground"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </Button>
      </div>

      <ScrollArea className="flex-1 py-2">
        <nav className="space-y-4 px-2">
          {navGroups.map((group) => (
            <div key={group.title}>
              {!collapsed && (
                <p className="px-2 mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                  {group.title}
                </p>
              )}
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = location === item.path ||
                    (item.path !== "/admin" && location.startsWith(item.path));

                  return (
                    <li key={item.path}>
                      <Link
                        href={item.path}
                        className={cn(
                          "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
                          isActive
                            ? "bg-teal/15 text-teal font-medium"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/40",
                          collapsed && "justify-center px-0"
                        )}
                        title={collapsed ? item.label : undefined}
                      >
                        <item.icon className="h-4 w-4 flex-shrink-0" />
                        {!collapsed && <span className="truncate">{item.label}</span>}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </ScrollArea>
    </aside>
  );
}
