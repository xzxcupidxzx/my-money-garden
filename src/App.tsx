import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { PrivacyProvider } from "@/hooks/usePrivacy";
import { AppLayout } from "@/components/AppLayout";

// Pages
import Transactions from "./pages/Transactions";
import History from "./pages/History";
import Statistics from "./pages/Statistics";
import Categories from "./pages/Categories";
import Settings from "./pages/Settings";
import AiNote from "./pages/AiNote";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Installments from "./pages/Installments";
import Budgets from "./pages/Budgets";
import RecurringTransactions from "./pages/RecurringTransactions";
import Reconciliation from "./pages/Reconciliation";
import DataBackup from "./pages/DataBackup";
import Management from "./pages/Management";
import Utilities from "./pages/Utilities";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <PrivacyProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route element={<AppLayout />}>
                <Route path="/" element={<Transactions />} />
                <Route path="/history" element={<History />} />
                <Route path="/statistics" element={<Statistics />} />
                <Route path="/management" element={<Management />} />
                <Route path="/categories" element={<Categories />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/ai-note" element={<AiNote />} />
                <Route path="/installments" element={<Installments />} />
                <Route path="/budgets" element={<Budgets />} />
                <Route path="/recurring" element={<RecurringTransactions />} />
                <Route path="/reconciliation" element={<Reconciliation />} />
                <Route path="/backup" element={<DataBackup />} />
                <Route path="/utilities" element={<Utilities />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </PrivacyProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
