import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  TrendingDown,
  Target,
  Plus,
  DollarSign,
  Sparkles,
  Loader2,
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import ExpenseChart from "@/components/ExpenseChart";
import TrendChart from "@/components/TrendChart";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

// ---
// 1. The 'generateDynamicInsight' function has been REMOVED.
//    Your backend server now handles all AI logic.
// ---

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    balance: 0,
    income: 0,
    expenses: 0,
    savings: 0,
  });
  const [username, setUsername] = useState("there");
  const [loading, setLoading] = useState(true);

  // ---
  // 2. These state variables are correct. They store the AI insight.
  // ---
  const [aiInsight, setAiInsight] = useState("");
  const [analysisLoading, setAnalysisLoading] = useState(false);

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

  // ---
  // 3. THIS IS THE UPDATED 'handleAiAnalysis' FUNCTION
  //    It fetches data from Supabase and sends it to your backend.
  // ---
  const handleAiAnalysis = async () => {
    setAnalysisLoading(true);
    setAiInsight(""); // Clear previous insight

    if (!user) {
      setAnalysisLoading(false);
      return;
    }

    try {
      // 1. "Fetch" transaction data from Supabase
      const { data: transactions, error } = await supabase
        .from("transactions")
        .select("category, type, amount, created_at") // Get recent data
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }); // Order by most recent

      if (error) throw error;

      // 2. Call your NEW backend server (which calls Ollama)
      //    This passes the 'stats' from state and 'transactions' from Supabase
      const response = await fetch(
        "http://localhost:4000/api/generate-insight",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            transactions: transactions || [],
            stats: stats, // Send the stats from your component's state
          }),
        }
      );

      if (!response.ok) {
        // If the API call fails, throw an error to be caught by the catch block
        const errorData = await response.json();
        throw new Error(errorData.insight || "Failed to fetch AI insight");
      }

      // 3. Get the insight from the API response
      const data = await response.json();
      setAiInsight(data.insight);
    } catch (error) {
      console.error("Error during AI analysis:", error);
      setAiInsight(
        error.message || "Sorry, I couldn't run the analysis right now."
      );
    } finally {
      setAnalysisLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div>
          <h1 className="text-4xl font-bold mb-2">
            Welcome back, {username}! 👋
          </h1>
          <p className="text-muted-foreground">
            Here's your financial overview for this month
          </p>
        </div>

        {/* Stats Cards (No changes) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="glass-card p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl gradient-primary">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-1">
              Current Balance
            </p>
            <h3 className="text-3xl font-bold">
              ${stats.balance.toLocaleString()}
            </h3>
          </Card>
          <Card className="glass-card p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-success/10">
                <TrendingUp className="w-6 h-6 text-success" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-1">Total Income</p>
            <h3 className="text-3xl font-bold text-success">
              ${stats.income.toLocaleString()}
            </h3>
          </Card>
          <Card className="glass-card p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-expense/10">
                <TrendingDown className="w-6 h-6 text-expense" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-1">Total Expenses</p>
            <h3 className="text-3xl font-bold text-expense">
              ${stats.expenses.toLocaleString()}
            </h3>
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

        {/* Quick Actions (No changes to layout) */}
        <div className="flex flex-wrap gap-4">
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
          
          {/* This button correctly calls the new handleAiAnalysis */}
          <Button
            onClick={handleAiAnalysis}
            variant="outline"
            className="glass-card border-primary/30"
            disabled={analysisLoading}
          >
            {analysisLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 mr-2" />
            )}
            {analysisLoading ? "Analyzing..." : "Get AI Insight"}
          </Button>
        </div>

        {/* AI Analysis Result Card (No changes to layout) */}
        {/* This card correctly displays the 'aiInsight' state */}
        {(analysisLoading || aiInsight) && (
          <Card className="glass-card p-6 transition-all duration-300">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <Sparkles className="w-5 h-5 mr-2 text-primary" />
              AI Financial Insight
            </h3>
            {analysisLoading ? (
              <div className="flex items-center justify-center h-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <p className="text-lg text-muted-foreground">{aiInsight}</p>
            )}
          </Card>
        )}

        {/* Charts (No changes) */}
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