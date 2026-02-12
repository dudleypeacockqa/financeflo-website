import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Assessment from "./pages/Assessment";
import Solutions from "./pages/Solutions";
import ADAPTFramework from "./pages/ADAPTFramework";
import LeadMagnet from "./pages/LeadMagnet";
import Results from "./pages/Results";
import Delivery from "./pages/Delivery";
import Workshop from "./pages/Workshop";
import Admin from "./pages/Admin";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/assessment" component={Assessment} />
      <Route path="/solutions" component={Solutions} />
      <Route path="/adapt-framework" component={ADAPTFramework} />
      <Route path="/lead-magnet" component={LeadMagnet} />
      <Route path="/results" component={Results} />
      <Route path="/delivery" component={Delivery} />
      <Route path="/workshop" component={Workshop} />
      <Route path="/admin" component={Admin} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Navbar />
          <Router />
          <Footer />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
