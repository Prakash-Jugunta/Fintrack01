import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Plus, Building2, CreditCard, TrendingDown } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import LoanDialog from "@/components/LoanDialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface Loan {
  id: string;
  lender_name: string;
  principal_amount: number;
  interest_rate: number;
  total_paid: number;
  monthly_payment: number;
  start_date: string;
  icon: string;
}

const Loans = () => {
  const { user } = useAuth();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLoan, setEditingLoan] = useState<Loan | undefined>(undefined);

  useEffect(() => {
    fetchLoans();
  }, [user]);

  const fetchLoans = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("loans")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setLoans(data || []);
    } catch (error) {
      console.error("Error fetching loans:", error);
      toast.error("Failed to load loans");
    } finally {
      setLoading(false);
    }
  };

  const handleAddLoan = async (loan: Omit<Loan, "id">) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("loans")
        .insert([{ ...loan, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      setLoans([data, ...loans]);
      setDialogOpen(false);
      toast.success("Loan added successfully");
    } catch (error) {
      console.error("Error adding loan:", error);
      toast.error("Failed to add loan");
    }
  };

  const handleEditLoan = async (loan: Loan) => {
    try {
      const { error } = await supabase
        .from("loans")
        .update({
          lender_name: loan.lender_name,
          principal_amount: loan.principal_amount,
          interest_rate: loan.interest_rate,
          total_paid: loan.total_paid,
          monthly_payment: loan.monthly_payment,
          start_date: loan.start_date,
          icon: loan.icon,
        })
        .eq("id", loan.id);

      if (error) throw error;
      setLoans(loans.map((l) => (l.id === loan.id ? loan : l)));
      setDialogOpen(false);
      setEditingLoan(undefined);
      toast.success("Loan updated successfully");
    } catch (error) {
      console.error("Error updating loan:", error);
      toast.error("Failed to update loan");
    }
  };

  const handleDeleteLoan = async (id: string) => {
    try {
      const { error } = await supabase
        .from("loans")
        .delete()
        .eq("id", id);

      if (error) throw error;
      setLoans(loans.filter((l) => l.id !== id));
      toast.success("Loan deleted successfully");
    } catch (error) {
      console.error("Error deleting loan:", error);
      toast.error("Failed to delete loan");
    }
  };

  const openEditDialog = (loan: Loan) => {
    setEditingLoan(loan);
    setDialogOpen(true);
  };

  const openAddDialog = () => {
    setEditingLoan(undefined);
    setDialogOpen(true);
  };

  const totalLoanBalance = loans.reduce((sum, loan) => sum + Number(loan.principal_amount), 0);
  const totalPaid = loans.reduce((sum, loan) => sum + Number(loan.total_paid), 0);
  const totalRemaining = totalLoanBalance - totalPaid;
  const monthlyPaymentTotal = loans.reduce((sum, loan) => sum + Number(loan.monthly_payment), 0);

  const getProgress = (totalPaid: number, principal: number) => {
    return (totalPaid / principal) * 100;
  };

  const getRemainingAmount = (principal: number, totalPaid: number) => {
    return principal - totalPaid;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Loan Management</h1>
            <p className="text-muted-foreground">Track and manage all your loans in one place</p>
          </div>
          <Button onClick={openAddDialog} className="gradient-primary hover:opacity-90 transition-opacity">
            <Plus className="w-4 h-4 mr-2" />
            Add Loan
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="glass-card-strong p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-expense/10">
                <Building2 className="w-6 h-6 text-expense" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Loan Amount</p>
                <h3 className="text-2xl font-bold text-expense">
                  ${totalLoanBalance.toLocaleString()}
                </h3>
              </div>
            </div>
          </Card>

          <Card className="glass-card-strong p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-success/10">
                <TrendingDown className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Paid</p>
                <h3 className="text-2xl font-bold text-success">
                  ${totalPaid.toLocaleString()}
                </h3>
              </div>
            </div>
          </Card>

          <Card className="glass-card-strong p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <CreditCard className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Remaining Balance</p>
                <h3 className="text-2xl font-bold">
                  ${totalRemaining.toLocaleString()}
                </h3>
              </div>
            </div>
          </Card>

          <Card className="glass-card-strong p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl gradient-primary">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Monthly Payment</p>
                <h3 className="text-2xl font-bold">
                  ${monthlyPaymentTotal.toLocaleString()}
                </h3>
              </div>
            </div>
          </Card>
        </div>

        {/* Loans Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {loans.map((loan) => {
            const progress = getProgress(Number(loan.total_paid), Number(loan.principal_amount));
            const remaining = getRemainingAmount(Number(loan.principal_amount), Number(loan.total_paid));
            const monthsElapsed = Math.floor(
              (new Date().getTime() - new Date(loan.start_date).getTime()) /
                (1000 * 60 * 60 * 24 * 30)
            );

            return (
              <Card
                key={loan.id}
                className="glass-card p-6 hover:shadow-xl transition-all duration-300"
              >
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-4xl">{loan.icon}</span>
                      <div>
                        <h3 className="font-semibold text-lg">{loan.lender_name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Started {monthsElapsed} months ago
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Progress */}
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Repayment Progress</span>
                      <span className="font-semibold">{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Principal Amount</p>
                      <p className="font-semibold">
                        ${Number(loan.principal_amount).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Interest Rate</p>
                      <p className="font-semibold">{Number(loan.interest_rate)}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Total Paid</p>
                      <p className="font-semibold text-success">
                        ${Number(loan.total_paid).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Remaining</p>
                      <p className="font-semibold text-expense">
                        ${remaining.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Monthly Payment */}
                  <div className="pt-2 border-t border-border/50">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Monthly Payment</span>
                      <span className="text-lg font-bold">
                        ${Number(loan.monthly_payment).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      className="flex-1 glass-card border-primary/30 hover:bg-primary/10"
                      onClick={() => openEditDialog(loan)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 glass-card border-expense/30 hover:bg-expense/10"
                      onClick={() => handleDeleteLoan(loan.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {loans.length === 0 && (
          <Card className="glass-card p-12 text-center">
            <div className="max-w-md mx-auto space-y-4">
              <div className="p-4 rounded-full bg-primary/10 w-20 h-20 mx-auto flex items-center justify-center">
                <CreditCard className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">No loans yet</h3>
              <p className="text-muted-foreground">
                Start tracking your loans by adding your first loan above
              </p>
            </div>
          </Card>
        )}

        <LoanDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSubmit={editingLoan ? handleEditLoan : handleAddLoan}
          loan={editingLoan}
        />
      </div>
    </DashboardLayout>
  );
};

export default Loans;
