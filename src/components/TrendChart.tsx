import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const TrendChart = () => {
  const { user } = useAuth();
  const [data, setData] = useState<Array<{ month: string; income: number; expenses: number }>>([]);

  useEffect(() => {
    const fetchTrendData = async () => {
      if (!user) return;

      try {
        const { data: transactions, error } = await supabase
          .from("transactions")
          .select("*")
          .eq("user_id", user.id)
          .order("date", { ascending: true });

        if (error) throw error;

        // Aggregate by month
        const monthlyData: Record<string, { income: number; expenses: number }> = {};
        
        transactions?.forEach((transaction) => {
          const date = new Date(transaction.date);
          const monthKey = date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
          
          if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = { income: 0, expenses: 0 };
          }

          if (transaction.type === "income") {
            monthlyData[monthKey].income += Number(transaction.amount);
          } else {
            monthlyData[monthKey].expenses += Number(transaction.amount);
          }
        });

        // Convert to chart data format and get last 6 months
        const chartData = Object.entries(monthlyData)
          .map(([month, values]) => ({
            month: month.split(" ")[0], // Just the month name
            income: values.income,
            expenses: values.expenses,
          }))
          .slice(-6);

        setData(chartData);
      } catch (error) {
        console.error("Error fetching trend data:", error);
      }
    };

    fetchTrendData();
  }, [user]);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
        No transaction data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
        <Legend />
        <Line
          type="monotone"
          dataKey="income"
          stroke="hsl(160, 84%, 45%)"
          strokeWidth={3}
          name="Income"
        />
        <Line
          type="monotone"
          dataKey="expenses"
          stroke="hsl(0, 84%, 65%)"
          strokeWidth={3}
          name="Expenses"
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default TrendChart;
