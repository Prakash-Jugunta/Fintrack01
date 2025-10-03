import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Users, TrendingUp, DollarSign, Target, Activity, Calendar } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface UserData {
  id: string;
  full_name: string | null;
  email: string | null;
  created_at: string;
  role: string;
}

interface Transaction {
  id: string;
  amount: number;
  type: string;
  category: string;
  description: string;
  date: string;
  user_id: string;
  profiles?: {
    full_name: string | null;
    email: string | null;
  };
}

interface Stats {
  totalUsers: number;
  totalTransactions: number;
  totalGoals: number;
  totalLoans: number;
  totalIncome: number;
  totalExpenses: number;
  recentSignups: number;
}

const Admin = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalTransactions: 0,
    totalGoals: 0,
    totalLoans: 0,
    totalIncome: 0,
    totalExpenses: 0,
    recentSignups: 0,
  });
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      // Fetch users with roles
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, full_name, email, created_at");

      const { data: rolesData } = await supabase
        .from("user_roles")
        .select("user_id, role");

      // Combine profiles with roles
      const usersWithRoles =
        profilesData?.map((profile) => ({
          ...profile,
          role:
            rolesData?.find((r) => r.user_id === profile.id)?.role || "user",
        })) || [];

      setUsers(usersWithRoles);

      // Fetch stats
      const { count: transactionsCount } = await supabase
        .from("transactions")
        .select("*", { count: "exact", head: true });

      const { count: goalsCount } = await supabase
        .from("goals")
        .select("*", { count: "exact", head: true });

      const { count: loansCount } = await supabase
        .from("loans")
        .select("*", { count: "exact", head: true });

      // Fetch financial data
      const { data: allTransactions } = await supabase
        .from("transactions")
        .select("amount, type");

      const totalIncome = allTransactions
        ?.filter((t) => t.type === "income")
        .reduce((sum, t) => sum + Number(t.amount), 0) || 0;

      const totalExpenses = allTransactions
        ?.filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + Number(t.amount), 0) || 0;

      // Get recent signups (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const recentSignups = usersWithRoles.filter(
        (user) => new Date(user.created_at) >= thirtyDaysAgo
      ).length;

      // Fetch recent transactions
      const { data: recentTxns } = await supabase
        .from("transactions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);

      // Fetch user profiles for recent transactions
      if (recentTxns && recentTxns.length > 0) {
        const userIds = [...new Set(recentTxns.map(t => t.user_id))];
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name, email")
          .in("id", userIds);

        // Join profiles with transactions
        const transactionsWithProfiles = recentTxns.map(txn => ({
          ...txn,
          profiles: profiles?.find(p => p.id === txn.user_id) || null
        }));

        setRecentTransactions(transactionsWithProfiles as Transaction[]);
      }

      setStats({
        totalUsers: usersWithRoles.length,
        totalTransactions: transactionsCount || 0,
        totalGoals: goalsCount || 0,
        totalLoans: loansCount || 0,
        totalIncome,
        totalExpenses,
        recentSignups,
      });

      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
            <p className="mt-4 text-muted-foreground">Loading admin data...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage users and view platform statistics
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="glass-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <h3 className="text-2xl font-bold">{stats.totalUsers}</h3>
              </div>
            </div>
          </Card>

          <Card className="glass-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-success/10">
                <DollarSign className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Income</p>
                <h3 className="text-2xl font-bold">${stats.totalIncome.toFixed(2)}</h3>
              </div>
            </div>
          </Card>

          <Card className="glass-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-expense/10">
                <TrendingUp className="w-6 h-6 text-expense" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Expenses</p>
                <h3 className="text-2xl font-bold">${stats.totalExpenses.toFixed(2)}</h3>
              </div>
            </div>
          </Card>

          <Card className="glass-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">New Users (30d)</p>
                <h3 className="text-2xl font-bold">{stats.recentSignups}</h3>
              </div>
            </div>
          </Card>
        </div>

        {/* Additional Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="glass-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <Activity className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Transactions</p>
                <h3 className="text-2xl font-bold">{stats.totalTransactions}</h3>
              </div>
            </div>
          </Card>

          <Card className="glass-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <Target className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Goals</p>
                <h3 className="text-2xl font-bold">{stats.totalGoals}</h3>
              </div>
            </div>
          </Card>

          <Card className="glass-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-expense/10">
                <TrendingUp className="w-6 h-6 text-expense" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Loans</p>
                <h3 className="text-2xl font-bold">{stats.totalLoans}</h3>
              </div>
            </div>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="glass-card p-6">
          <h2 className="text-2xl font-semibold mb-6">Recent Transactions</h2>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-medium">
                      {transaction.profiles?.full_name || transaction.profiles?.email || "N/A"}
                    </TableCell>
                    <TableCell>{transaction.description}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{transaction.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={transaction.type === "income" ? "default" : "secondary"}
                        className={
                          transaction.type === "income"
                            ? "bg-success"
                            : "bg-expense"
                        }
                      >
                        {transaction.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-semibold">
                      ${Number(transaction.amount).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      {format(new Date(transaction.date), "MMM dd, yyyy")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>

        {/* Users Table */}
        <Card className="glass-card p-6">
          <h2 className="text-2xl font-semibold mb-6">Registered Users</h2>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Full Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Registration Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.full_name || "N/A"}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge
                        variant={user.role === "admin" ? "default" : "secondary"}
                        className={
                          user.role === "admin"
                            ? "bg-primary"
                            : "bg-secondary"
                        }
                      >
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(user.created_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Admin;
