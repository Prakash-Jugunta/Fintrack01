import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Target, TrendingUp, PiggyBank, Shield, BarChart3, Wallet } from "lucide-react";
import { useEffect } from "react";

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const features = [
    {
      icon: Wallet,
      title: "Track Expenses",
      description: "Monitor your daily spending and categorize transactions effortlessly"
    },
    {
      icon: Target,
      title: "Set Goals",
      description: "Create financial goals and track your progress towards achieving them"
    },
    {
      icon: TrendingUp,
      title: "Analyze Trends",
      description: "Visualize your income and expenses with interactive charts"
    },
    {
      icon: PiggyBank,
      title: "Manage Loans",
      description: "Keep track of loans, EMIs, and repayment schedules in one place"
    },
    {
      icon: BarChart3,
      title: "Smart Insights",
      description: "Get detailed insights into your spending patterns and habits"
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Your financial data is encrypted and protected at all times"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background" />
        <div className="container relative mx-auto px-4 py-20 md:py-32">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="mb-6 text-5xl font-bold tracking-tight md:text-7xl">
              Take Control of Your
              <span className="block bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Financial Future
              </span>
            </h1>
            <p className="mb-8 text-lg text-muted-foreground md:text-xl">
              Track expenses, set goals, and manage your finances with FinTrack. 
              Your personal financial management solution.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button size="lg" onClick={() => navigate("/auth")} className="text-base">
                Get Started Free
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate("/auth")}>
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">Everything You Need</h2>
          <p className="text-muted-foreground">
            Powerful features to help you manage your money better
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="p-6 transition-all hover:shadow-lg">
                <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </Card>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t bg-muted/50">
        <div className="container mx-auto px-4 py-20 text-center">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">
            Ready to Start Your Financial Journey?
          </h2>
          <p className="mb-8 text-lg text-muted-foreground">
            Join thousands of users managing their finances smarter
          </p>
          <Button size="lg" onClick={() => navigate("/auth")}>
            Create Your Account
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;
