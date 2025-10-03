import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Target, Plus, DollarSign } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import ExpenseChart from "@/components/ExpenseChart";
import TrendChart from "@/components/TrendChart";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    balance: 0,
    income: 0,
    expenses: 0,
    savings: 0,
  });
  const [username, setUsername] = useState("there"); // Default name
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;

      try {
        // Fetch user's profile to get their name
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .single();

        if (profile && profile.full_name) {
          setUsername(profile.full_name);
        }

        // Fetch transactions
        const { data: transactions } = await supabase
          .from("transactions")
          .select("*")
          .eq("user_id", user.id);

        // Calculate income and expenses
        const income =
          transactions
            ?.filter((t) => t.type === "income")
            .reduce((sum, t) => sum + Number(t.amount), 0) || 0;

        const expenses =
          transactions
            ?.filter((t) => t.type === "expense")
            .reduce((sum, t) => sum + Number(t.amount), 0) || 0;

        const balance = income - expenses;
        const savings = income > 0 ? (balance / income) * 100 : 0;

        setStats({
          balance,
          income,
          expenses,
          savings: Number(savings.toFixed(1)),
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div>
          <h1 className="text-4xl font-bold mb-2">Welcome back, {username}! 👋</h1>
          <p className="text-muted-foreground">Here's your financial overview for this month</p>
        </div>

        {/* Stats Cards (No changes here) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="glass-card p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl gradient-primary">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-1">Current Balance</p>
            <h3 className="text-3xl font-bold">${stats.balance.toLocaleString()}</h3>
          </Card>
          <Card className="glass-card p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-success/10">
                <TrendingUp className="w-6 h-6 text-success" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-1">Total Income</p>
            <h3 className="text-3xl font-bold text-success">${stats.income.toLocaleString()}</h3>
          </Card>
          <Card className="glass-card p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-expense/10">
                <TrendingDown className="w-6 h-6 text-expense" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-1">Total Expenses</p>
            <h3 className="text-3xl font-bold text-expense">${stats.expenses.toLocaleString()}</h3>
          </Card>
          <Card className="glass-card p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <Target className="w-6 h-6 text-primary" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-1">Savings Rate</p>
            <h3 className="text-3xl font-bold">{stats.savings}%</h3>
          </Card>
        </div>

        {/* Quick Actions (No changes here) */}
        <div className="flex gap-4">
          <Button
            onClick={() => navigate("/transactions")}
            className="gradient-primary hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Transaction
          </Button>
          <Button
            onClick={() => navigate("/goals")}
            variant="outline"
            className="glass-card border-primary/30"
          >
            <Target className="w-4 h-4 mr-2" />
            Set New Goal
          </Button>
        </div>

        {/* Charts (No changes here) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="glass-card p-6">
            <h3 className="text-xl font-semibold mb-6">Expense Breakdown</h3>
            <ExpenseChart />
          </Card>
          <Card className="glass-card p-6">
            <h3 className="text-xl font-semibold mb-6">Income vs Expenses</h3>
            <TrendChart />
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;