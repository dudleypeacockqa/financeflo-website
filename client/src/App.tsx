import { lazy, Suspense, useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import PageSkeleton from "./components/PageSkeleton";
import { isFloSynqHost, replaceBrandInTitle } from "./lib/siteBrand";
import { routes } from "./routes";

const FloSynqHome = lazy(() => import("./pages/ipaas/FloSynq"));

function Router() {
  const showFloSynqHome = isFloSynqHost();

  return (
    <Suspense fallback={<PageSkeleton />}>
      <Switch>
        {routes.map((r) => {
          const component = showFloSynqHome && r.path === "/" ? FloSynqHome : r.component;

          return <Route key={r.path} path={r.path} component={component} />;
        })}
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function BrandAwareTitleSync() {
  const [location] = useLocation();

  useEffect(() => {
    if (!isFloSynqHost()) {
      return;
    }

    const syncTitle = () => {
      const nextTitle = replaceBrandInTitle(document.title);

      if (nextTitle && nextTitle !== document.title) {
        document.title = nextTitle;
      }
    };

    syncTitle();
    const frame = window.requestAnimationFrame(syncTitle);

    return () => window.cancelAnimationFrame(frame);
  }, [location]);

  return null;
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <BrandAwareTitleSync />
          <Navbar />
          <Router />
          <Footer />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
