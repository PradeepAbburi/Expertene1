import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
// import Landing from "./pages/Landing"; // Unused
import Index from "./pages/Index";
import ExpNotebook from "./pages/ExpNotebook";
import About from "./pages/About";
import AboutOverview from "./pages/about/AboutOverview";
import AboutFeatures from "./pages/about/Features";
import AboutQuickStart from "./pages/about/QuickStart";
import AboutBestPractices from "./pages/about/BestPractices";
import AboutFAQ from "./pages/about/FAQ";
import AboutSupport from "./pages/about/Support";
import FoundingTeam from "./pages/about/FoundingTeam";
import APIPage from "./pages/API";
import Careers from "./pages/Careers";
import Contact from "./pages/Contact";
import ResetPassword from "./pages/ResetPassword";
import Auth from "./pages/Auth";
import Feed from "./pages/Feed";
import CreatePage from "./pages/CreatePage";
import Page from "./pages/Page";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import Analytics from "./pages/Analytics";
import Bookmarks from "./pages/Bookmarks";
import Liked from "./pages/Liked";
import Archive from "./pages/Archive";
import Community from "./pages/Community";
import Explore from "./pages/Explore";
import Leaderboard from "./pages/Leaderboard";
import NotFound from "./pages/NotFound";
import Offline from "./pages/Offline";
import { useOnline } from "./hooks/useOnline";
import { supabase } from '@/integrations/supabase/client';
import Admin from "./pages/Admin";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminLeaderboards from "./pages/admin/AdminLeaderboards";
import AdminReports from "./pages/admin/AdminReports";
import AdminContent from "@/pages/admin/AdminContent";
import AdminAnnouncements from "./pages/admin/AdminAnnouncements";
import AdminPayments from "./pages/admin/AdminPayments";
import TermsAndConditions from "./pages/TermsAndConditions";
// import Services from "./pages/Services"; // Unused
// import APIPage from "./pages/API"; // Unused
import "./styles/landing.css";
import { Layout } from "./components/Layout";

const queryClient = new QueryClient();

export default function App() {
  const online = useOnline();
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);

  React.useEffect(() => {
    const token = localStorage.getItem('auth_token');
    setIsLoggedIn(!!token);
  }, []);

  // keep isLoggedIn in sync with supabase auth state (so signing out updates layout)
  React.useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setIsLoggedIn(!!session?.user);
      try {
        if (session?.access_token) {
          localStorage.setItem('auth_token', session.access_token);
        } else {
          localStorage.removeItem('auth_token');
        }
      } catch (e) {
        // ignore
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          {online ? (
            isLoggedIn ? (
              <Layout>
                <Routes>
                  <Route path="/feed" element={<Feed />} />
                  <Route path="/about" element={<About />}>
                    <Route index element={<AboutOverview />} />
                    <Route path="features" element={<AboutFeatures />} />
                    <Route path="quick-start" element={<AboutQuickStart />} />
                    <Route path="best-practices" element={<AboutBestPractices />} />
                    <Route path="faq" element={<AboutFAQ />} />
                    <Route path="support" element={<AboutSupport />} />
                    <Route path="founding-team" element={<FoundingTeam />} />
                  </Route>
                  <Route path="/create" element={<CreatePage />} />
                  <Route path="/page/:id" element={<Page />} />
                  <Route path="/shared/:token" element={<Page />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/profile/:username" element={<Profile />} />
                  <Route path="/edit-profile" element={<EditProfile />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/bookmarks" element={<Bookmarks />} />
                  <Route path="/liked" element={<Liked />} />
                  <Route path="/archive" element={<Archive />} />
                  <Route path="/community" element={<Community />} />
                  <Route path="/explore" element={<Explore />} />
                  <Route path="/leaderboard" element={<Leaderboard />} />
                  <Route path="/terms" element={<TermsAndConditions />} />
                  <Route path="/privacy" element={<TermsAndConditions />} />
                  <Route path="/admin" element={<Admin />} />
                  <Route path="/admin/users" element={<AdminUsers />} />
                  <Route path="/admin/leaderboards" element={<AdminLeaderboards />} />
                  <Route path="/admin/reports" element={<AdminReports />} />
                  <Route path="/admin/content" element={<AdminContent />} />
                  <Route path="/admin/announcements" element={<AdminAnnouncements />} />
                  <Route path="/admin/payments" element={<AdminPayments />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Layout>
            ) : (
              <Layout>
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/about" element={<About />}>
        <Route index element={<AboutOverview />} />
        <Route path="features" element={<AboutFeatures />} />
        <Route path="quick-start" element={<AboutQuickStart />} />
        <Route path="best-practices" element={<AboutBestPractices />} />
        <Route path="faq" element={<AboutFAQ />} />
        <Route path="support" element={<AboutSupport />} />
        <Route path="founding-team" element={<FoundingTeam />} />
      </Route>
                        <Route path="/api" element={<APIPage />} />
                        <Route path="/careers" element={<Careers />} />
                        <Route path="/contact" element={<Contact />} />
                        <Route path="/exp-notebook" element={<ExpNotebook />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/feed" element={<Feed />} />
                  <Route path="/create" element={<CreatePage />} />
                  <Route path="/page/:id" element={<Page />} />
                  <Route path="/shared/:token" element={<Page />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/profile/:username" element={<Profile />} />
                  <Route path="/edit-profile" element={<EditProfile />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/bookmarks" element={<Bookmarks />} />
                  <Route path="/liked" element={<Liked />} />
                  <Route path="/archive" element={<Archive />} />
                  <Route path="/community" element={<Community />} />
                  <Route path="/explore" element={<Explore />} />
                  <Route path="/leaderboard" element={<Leaderboard />} />
                  <Route path="/terms" element={<TermsAndConditions />} />
                  <Route path="/privacy" element={<TermsAndConditions />} />
                  <Route path="/admin" element={<Admin />} />
                  <Route path="/admin/users" element={<AdminUsers />} />
                  <Route path="/admin/leaderboards" element={<AdminLeaderboards />} />
                  <Route path="/admin/reports" element={<AdminReports />} />
                  <Route path="/admin/content" element={<AdminContent />} />
                  <Route path="/admin/announcements" element={<AdminAnnouncements />} />
                  <Route path="/admin/payments" element={<AdminPayments />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Layout>
            )
          ) : (
            <Offline />
          )}
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
