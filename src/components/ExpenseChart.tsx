import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const ExpenseChart = () => {
  const { user } = useAuth();
  const [data, setData] = useState<Array<{ name: string; value: number; color: string }>>([]);

  const categoryColors: Record<string, string> = {
    "Food & Dining": "hsl(160, 84%, 45%)",
    "Transportation": "hsl(262, 83%, 58%)",
    "Shopping": "hsl(220, 90%, 58%)",
    "Utilities": "hsl(0, 84%, 65%)",
    "Entertainment": "hsl(280, 70%, 60%)",
    "Other": "hsl(40, 80%, 55%)",
  };

  useEffect(() => {
    const fetchExpenseData = async () => {
      if (!user) return;

      try {
        const { data: transactions, error } = await supabase
          .from("transactions")
          .select("*")
          .eq("user_id", user.id)
          .eq("type", "expense");

        if (error) throw error;

        // Aggregate expenses by category
        const categoryTotals: Record<string, number> = {};
        transactions?.forEach((transaction) => {
          const category = transaction.category;
          categoryTotals[category] = (categoryTotals[category] || 0) + Number(transaction.amount);
        });

        // Convert to chart data format
        const chartData = Object.entries(categoryTotals).map(([name, value]) => ({
          name,
          value,
          color: categoryColors[name] || "hsl(200, 70%, 50%)",
        }));

        setData(chartData);
      } catch (error) {
        console.error("Error fetching expense data:", error);
      }
    };

    fetchExpenseData();
  }, [user]);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
        No expense data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default ExpenseChart;
