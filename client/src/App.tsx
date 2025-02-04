import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { useUser } from "@/hooks/use-user";
import { Loader2 } from "lucide-react";
import AuthPage from "@/pages/auth-page";
import Dashboard from "@/pages/dashboard";
import NewEntry from "@/pages/new-entry";
import Entries from "@/pages/entries";
import Profile from "@/pages/profile";
import AdminPage from "@/pages/admin";
import NotFound from "@/pages/not-found";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

function Router() {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Jeśli użytkownik nie jest zalogowany, pokazujemy stronę logowania
  if (!user) {
    return <AuthPage />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/new-entry" component={NewEntry} />
          <Route path="/entries" component={Entries} />
          <Route path="/profile" component={Profile} />
          {user.isAdmin && <Route path="/admin" component={AdminPage} />}
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}