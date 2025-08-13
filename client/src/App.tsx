import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import Catalog from "@/pages/catalog";
import ProductDetail from "@/pages/product-detail";
import Checkout from "@/pages/checkout";
import Dashboard from "@/pages/dashboard";
import Admin from "@/pages/admin";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import CartSidebar from "@/components/cart/cart-sidebar";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <CartSidebar />
      
      <main className="flex-1">
        <Switch>
          {isLoading || !isAuthenticated ? (
            <Route path="/" component={Landing} />
          ) : (
            <>
              <Route path="/" component={Home} />
              <Route path="/catalog" component={Catalog} />
              <Route path="/product/:id" component={ProductDetail} />
              <Route path="/checkout" component={Checkout} />
              <Route path="/dashboard" component={Dashboard} />
              <Route path="/admin" component={Admin} />
            </>
          )}
          <Route component={NotFound} />
        </Switch>
      </main>
      
      <Footer />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
