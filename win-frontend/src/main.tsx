import React from "react";
import "./global.css";

import { NotificationToaster } from "@/components/ui/NotificationToaster";
import { createRoot } from "react-dom/client";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { CartProvider } from "./contexts/CartContext";
import { AuthProvider } from "./contexts/AuthContext";
import { SearchProvider } from "./contexts/SearchContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import ProtectedRoute from "./auth/ProtectedRoute";

// Páginas compartilhadas
import Index from "./pages/shared/Index";
import Login from "./pages/shared/Login";
import ForgotPassword from "./pages/shared/ForgotPassword";
import ResetPassword from "./pages/shared/ResetPassword";
import Categories from "./pages/shared/Categories";
import Product from "./pages/shared/Product";
import SearchResults from "./pages/shared/SearchResults";
import Help from "./pages/shared/Help";
import Terms from "./pages/shared/Terms";
import Privacy from "./pages/shared/Privacy";
import BecomeASeller from "./pages/shared/BecomeASeller";
import BecomeMerchant from "./pages/shared/BecomeMerchant";
import TrackOrder from "./pages/shared/TrackOrder";
import Deals from "./pages/shared/Deals";
import NewArrivals from "./pages/shared/NewArrivals";
import NotFound from "./pages/shared/NotFound";
import Unauthorized from "./pages/shared/Unauthorized";

// Páginas da loja/merchant
import MerchantDashboard from "./pages/merchant/MerchantDashboardImproved";
import ProductsPage from "./pages/merchant/ProductsPage";
import ProductFormPage from "./pages/merchant/ProductFormPage";
import MerchantOrders from "./pages/merchant/MerchantOrders";
import MerchantProfile from "./pages/merchant/MerchantProfile";
import MerchantAuth from "./pages/merchant/MerchantAuth";
import MerchantReturns from "./pages/merchant/MerchantReturns";
import MerchantFinancial from "./pages/merchant/MerchantFinancial";
import MerchantSettings from "./pages/merchant/MerchantSettings";

// Páginas do admin
import AdminIndex from "./pages/admin/AdminIndex";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminStores from "./pages/admin/AdminStores";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminDeliveries from "./pages/admin/AdminDeliveries";
import AdminFinances from "./pages/admin/AdminFinances";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminProfile from "./pages/admin/AdminProfile";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <CartProvider>
      <SearchProvider>
        <NotificationProvider>
          <TooltipProvider>
            <Toaster />
            <NotificationToaster />
            <Sonner />
            <BrowserRouter>
              <AuthProvider>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/categories" element={<Categories />} />
                  <Route path="/category/:category" element={<Categories />} />
                  <Route path="/search" element={<SearchResults />} />
                  <Route path="/product/:id" element={<Product />} />
                  <Route path="/help" element={<Help />} />
                  <Route path="/terms" element={<Terms />} />
                  <Route path="/privacy" element={<Privacy />} />
                  <Route path="/sell" element={<BecomeASeller />} />
                  <Route path="/become-merchant" element={<BecomeMerchant />} />
                  <Route path="/track" element={<TrackOrder />} />
                  <Route path="/deals" element={<Deals />} />
                  <Route path="/new-arrivals" element={<NewArrivals />} />

                  {/* Merchant Routes */}
                  <Route path="/merchant/login" element={<MerchantAuth />} />
                  <Route path="/merchant/auth" element={<MerchantAuth />} />
                  <Route
                    path="/merchant/dashboard"
                    element={
                      <ProtectedRoute requiredRoles={["merchant"]}>
                        <MerchantDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/merchant/products"
                    element={
                      <ProtectedRoute requiredRoles={["merchant"]}>
                        <ProductsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/merchant/products/new"
                    element={
                      <ProtectedRoute requiredRoles={["merchant"]}>
                        <ProductFormPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/merchant/products/edit/:id"
                    element={
                      <ProtectedRoute requiredRoles={["merchant"]}>
                        <ProductFormPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/merchant/orders"
                    element={
                      <ProtectedRoute requiredRoles={["merchant"]}>
                        <MerchantOrders />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/merchant/returns"
                    element={
                      <ProtectedRoute requiredRoles={["merchant"]}>
                        <MerchantReturns />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/merchant/financial"
                    element={
                      <ProtectedRoute requiredRoles={["merchant"]}>
                        <MerchantFinancial />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/merchant/settings"
                    element={
                      <ProtectedRoute requiredRoles={["merchant"]}>
                        <MerchantSettings />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/merchant/profile"
                    element={
                      <ProtectedRoute requiredRoles={["merchant"]}>
                        <MerchantProfile />
                      </ProtectedRoute>
                    }
                  />

                  {/* Admin Routes */}
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute requiredRoles={["admin"]}>
                        <AdminDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/dashboard"
                    element={
                      <ProtectedRoute requiredRoles={["admin"]}>
                        <AdminDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/users"
                    element={
                      <ProtectedRoute requiredRoles={["admin"]}>
                        <AdminUsers />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/stores"
                    element={
                      <ProtectedRoute requiredRoles={["admin"]}>
                        <AdminStores />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/categories"
                    element={
                      <ProtectedRoute requiredRoles={["admin"]}>
                        <AdminCategories />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/products"
                    element={
                      <ProtectedRoute requiredRoles={["admin"]}>
                        <AdminProducts />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/orders"
                    element={
                      <ProtectedRoute requiredRoles={["admin"]}>
                        <AdminOrders />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/deliveries"
                    element={
                      <ProtectedRoute requiredRoles={["admin"]}>
                        <AdminDeliveries />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/finances"
                    element={
                      <ProtectedRoute requiredRoles={["admin"]}>
                        <AdminFinances />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/settings"
                    element={
                      <ProtectedRoute requiredRoles={["admin"]}>
                        <AdminSettings />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/profile"
                    element={
                      <ProtectedRoute requiredRoles={["admin"]}>
                        <AdminProfile />
                      </ProtectedRoute>
                    }
                  />

                  {/* Unauthorized Route */}
                  <Route path="/unauthorized" element={<Unauthorized />} />

                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </AuthProvider>
            </BrowserRouter>
          </TooltipProvider>
        </NotificationProvider>
      </SearchProvider>
    </CartProvider>
  </QueryClientProvider >
);

createRoot(document.getElementById("root")!).render(<App />);
