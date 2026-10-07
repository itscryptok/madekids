import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { setAuthTokenGetter } from "@workspace/api-client-react";
import SplashScreen from "@/components/SplashScreen";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Subscribe from "@/pages/Subscribe";
import Dashboard from "@/pages/Dashboard";
import MKBox from "@/pages/MKBox";
import RecordingPage from "@/pages/RecordingPage";
import Progress from "@/pages/Progress";
import Leaderboard from "@/pages/Leaderboard";
import Rewards from "@/pages/Rewards";
import Settings from "@/pages/Settings";
import AccountPage from "@/pages/AccountPage";
import ParentZone from "@/pages/ParentZone";
import Admin from "@/pages/Admin";
import Addy from "@/pages/Addy";
import CoachRegister from "@/pages/CoachRegister";
import CoachDashboard from "@/pages/CoachDashboard";
import CoachSignup from "@/pages/CoachSignup";
import CoachListing from "@/pages/CoachListing";
import CoachProfile from "@/pages/CoachProfile";
import Join from "@/pages/Join";
import Gallery from "@/pages/Gallery";
import HowItWorks from "@/pages/HowItWorks";
import ReviewsPage from "@/pages/ReviewsPage";

setAuthTokenGetter(() => localStorage.getItem("mk_token"));

const terms = `Last updated: ${new Date().getFullYear()}

Made Kids ("we", "us") provides a daily children's development program. By using this service you agree to these terms.

1. Membership & Billing — Subscriptions are billed at $5/month or $50/year via Stripe. Cancel any time from your account settings. No refunds for partial billing periods.

2. Content — All video content is intended for children ages 5-16 under parental supervision. You may not copy or redistribute our content.

3. Recordings — Voice recordings you submit are stored securely and reviewed by your assigned coach. We do not share recordings with third parties.

4. Rewards — Quarterly trip rewards are awarded at our sole discretion to the most improved participants based on engagement and points. Rewards are non-transferable.

5. Coach Programme — Coaches earn 70% of membership fees from referred families. Earnings are tracked in your coach dashboard and can be withdrawn via Stripe.

6. Termination — We reserve the right to suspend accounts for abuse, fraud, or violation of these terms.

Contact: support@madekidsmk.com`;

const privacy = `Last updated: ${new Date().getFullYear()}

Made Kids respects your privacy. This policy explains how we collect, use, and protect your information.

1. Information We Collect — Name, email address, child profile details (name, age), voice recordings, video watch history, and payment information (processed by Stripe — we never see your card number).

2. How We Use It — To deliver daily content, track your child's progress, calculate points and streaks, award quarterly rewards, and process payments.

3. Voice Recordings — Recordings are stored encrypted on our servers. Only you and your assigned coach can access them.

4. Data Sharing — We do not sell your data. We share data only with: Stripe (payment processing) and our hosting providers under strict data agreements.

5. Children's Privacy — We are COPPA-aware. All child data is managed through the parent account. Parents may delete all child data at any time by contacting support.

6. Data Retention — Account data is retained while your subscription is active and for 90 days after cancellation, then deleted.

7. Your Rights — You may request access, correction, or deletion of your data at any time.

Contact: support@madekidsmk.com`;

function LegalPage({ title, content }: { title: string; content: string }) {
  return (
    <div className="min-h-screen bg-secondary flex flex-col">
      <div className="max-w-3xl mx-auto px-6 py-16 flex-1">
        <div className="flex items-center gap-3 mb-8">
          <a href="/" className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors">←</a>
          <h1 className="text-3xl font-black text-white">{title}</h1>
        </div>
        <div className="bg-card rounded-3xl p-8 shadow-xl">
          <pre className="text-foreground text-sm leading-relaxed whitespace-pre-wrap font-sans">{content}</pre>
        </div>
      </div>
    </div>
  );
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30000,
    },
  },
});

function ProtectedRoute({ component: Component, ...props }: { component: React.ComponentType<any>; [key: string]: any }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/login" />;
  }

  return <Component {...props} />;
}

function PremiumRoute({ component: Component, ...props }: { component: React.ComponentType<any>; [key: string]: any }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/login" />;
  }

  if (user.subscriptionStatus !== "active") {
    return <Redirect to="/subscribe" />;
  }

  return <Component {...props} />;
}

function AppRoutes() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/subscribe">
        {() => <ProtectedRoute component={Subscribe} />}
      </Route>
      <Route path="/dashboard">
        {() => <ProtectedRoute component={Dashboard} />}
      </Route>
      <Route path="/account">
        {() => <ProtectedRoute component={AccountPage} />}
      </Route>
      <Route path="/mk-box">
        {() => <PremiumRoute component={MKBox} />}
      </Route>
      <Route path="/record/recitation">
        {() => <PremiumRoute component={RecordingPage} type="recitation" />}
      </Route>
      <Route path="/record/challenge">
        {() => <PremiumRoute component={RecordingPage} type="challenge" />}
      </Route>
      <Route path="/progress">
        {() => <ProtectedRoute component={Progress} />}
      </Route>
      <Route path="/leaderboard">
        {() => <ProtectedRoute component={Leaderboard} />}
      </Route>
      <Route path="/rewards">
        {() => <ProtectedRoute component={Rewards} />}
      </Route>
      <Route path="/settings">
        {() => <ProtectedRoute component={Settings} />}
      </Route>
      <Route path="/parent-zone">
        {() => <ProtectedRoute component={ParentZone} />}
      </Route>
      <Route path="/gallery">
        {() => <ProtectedRoute component={Gallery} />}
      </Route>
      <Route path="/admin">
        {() => <ProtectedRoute component={Admin} />}
      </Route>
      <Route path="/addy" component={Addy} />
      <Route path="/join" component={Join} />
      <Route path="/coaches" component={CoachListing} />
      <Route path="/coaches/:slug">
        {(params) => <CoachProfile slug={params.slug} />}
      </Route>
      <Route path="/coach/signup" component={CoachSignup} />
      <Route path="/coach/register">
        {() => <ProtectedRoute component={CoachRegister} />}
      </Route>
      <Route path="/coach/:slug">
        {(params) => <ProtectedRoute component={CoachDashboard} slug={params.slug} />}
      </Route>
      <Route path="/how-it-works" component={HowItWorks} />
      <Route path="/reviews" component={ReviewsPage} />
      <Route path="/terms" component={() => <LegalPage title="Terms of Service" content={terms} />} />
      <Route path="/privacy" component={() => <LegalPage title="Privacy Policy" content={privacy} />} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <SplashScreen>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <AppRoutes />
            </WouterRouter>
            <Toaster />
          </SplashScreen>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
