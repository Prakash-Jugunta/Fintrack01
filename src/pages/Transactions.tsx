import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import TransactionTable from "@/components/TransactionTable";
import TransactionDialog from "@/components/TransactionDialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface Transaction {
  id: string;
  date: string;
  description: string;
  category: string;
  type: "income" | "expense";
  amount: number;
}

const Transactions = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>(undefined);

  useEffect(() => {
    fetchTransactions();
  }, [user]);

  const fetchTransactions = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false });

      if (error) throw error;
      setTransactions((data || []) as Transaction[]);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      toast.error("Failed to load transactions");
    } finally {
      setLoading(false);
    }
  };

  const handleAddTransaction = async (transaction: Omit<Transaction, "id">) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("transactions")
        .insert([{ ...transaction, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      setTransactions([data as Transaction, ...transactions]);
      setDialogOpen(false);
      toast.success("Transaction added successfully");
    } catch (error) {
      console.error("Error adding transaction:", error);
      toast.error("Failed to add transaction");
    }
  };

  const handleEditTransaction = async (transaction: Transaction) => {
    try {
      const { error } = await supabase
        .from("transactions")
        .update({
          date: transaction.date,
          description: transaction.description,
          category: transaction.category,
          type: transaction.type,
          amount: transaction.amount,
        })
        .eq("id", transaction.id);

      if (error) throw error;
      setTransactions(transactions.map(t => t.id === transaction.id ? transaction : t));
      setDialogOpen(false);
      setEditingTransaction(undefined);
      toast.success("Transaction updated successfully");
    } catch (error) {
      console.error("Error updating transaction:", error);
      toast.error("Failed to update transaction");
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    try {
      const { error } = await supabase
        .from("transactions")
        .delete()
        .eq("id", id);

      if (error) throw error;
      setTransactions(transactions.filter(t => t.id !== id));
      toast.success("Transaction deleted successfully");
    } catch (error) {
      console.error("Error deleting transaction:", error);
      toast.error("Failed to delete transaction");
    }
  };

  const openEditDialog = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setDialogOpen(true);
  };

  const openAddDialog = () => {
    setEditingTransaction(undefined);
    setDialogOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Transactions</h1>
            <p className="text-muted-foreground">Track and manage all your financial transactions</p>
          </div>
          <Button onClick={openAddDialog} className="gradient-primary hover:opacity-90 transition-opacity">
            <Plus className="w-4 h-4 mr-2" />
            Add Transaction
          </Button>
        </div>

        <Card className="glass-card p-6">
          <TransactionTable
            transactions={transactions}
            onEdit={openEditDialog}
            onDelete={handleDeleteTransaction}
          />
        </Card>

        <TransactionDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSubmit={editingTransaction ? handleEditTransaction : handleAddTransaction}
          transaction={editingTransaction}
        />
      </div>
    </DashboardLayout>
  );
};

export default Transactions;
