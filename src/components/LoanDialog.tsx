import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loan } from "@/pages/Loans";

interface LoanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (loan: Loan | Omit<Loan, "id">) => void;
  loan?: Loan;
}

const LoanDialog = ({ open, onOpenChange, onSubmit, loan }: LoanDialogProps) => {
  const [formData, setFormData] = useState({
    lender_name: "",
    principal_amount: "",
    interest_rate: "",
    total_paid: "",
    monthly_payment: "",
    start_date: "",
    icon: "🏦",
  });

  useEffect(() => {
    if (loan) {
      setFormData({
        lender_name: loan.lender_name,
        principal_amount: loan.principal_amount.toString(),
        interest_rate: loan.interest_rate.toString(),
        total_paid: loan.total_paid.toString(),
        monthly_payment: loan.monthly_payment.toString(),
        start_date: loan.start_date,
        icon: loan.icon,
      });
    } else {
      setFormData({
        lender_name: "",
        principal_amount: "",
        interest_rate: "",
        total_paid: "0",
        monthly_payment: "",
        start_date: new Date().toISOString().split("T")[0],
        icon: "🏦",
      });
    }
  }, [loan, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const loanData = {
      lender_name: formData.lender_name,
      principal_amount: parseFloat(formData.principal_amount),
      interest_rate: parseFloat(formData.interest_rate),
      total_paid: parseFloat(formData.total_paid),
      monthly_payment: parseFloat(formData.monthly_payment),
      start_date: formData.start_date,
      icon: formData.icon,
    };

    if (loan) {
      onSubmit({ ...loanData, id: loan.id });
    } else {
      onSubmit(loanData);
    }
  };

  const loanIcons = ["🏦", "🎓", "🚗", "🏠", "💳", "📱"];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card-strong max-w-md">
        <DialogHeader>
          <DialogTitle>{loan ? "Edit Loan" : "Add New Loan"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="lenderName">Lender Name</Label>
            <Input
              id="lenderName"
              value={formData.lender_name}
              onChange={(e) =>
                setFormData({ ...formData, lender_name: e.target.value })
              }
              placeholder="e.g., Bank of America"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="principalAmount">Principal Amount ($)</Label>
            <Input
              id="principalAmount"
              type="number"
              step="0.01"
              value={formData.principal_amount}
              onChange={(e) =>
                setFormData({ ...formData, principal_amount: e.target.value })
              }
              placeholder="25000.00"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="interestRate">Interest Rate (%)</Label>
              <Input
                id="interestRate"
                type="number"
                step="0.1"
                value={formData.interest_rate}
                onChange={(e) =>
                  setFormData({ ...formData, interest_rate: e.target.value })
                }
                placeholder="4.5"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="monthlyPayment">Monthly Payment ($)</Label>
              <Input
                id="monthlyPayment"
                type="number"
                step="0.01"
                value={formData.monthly_payment}
                onChange={(e) =>
                  setFormData({ ...formData, monthly_payment: e.target.value })
                }
                placeholder="450.00"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="totalPaid">Total Paid So Far ($)</Label>
            <Input
              id="totalPaid"
              type="number"
              step="0.01"
              value={formData.total_paid}
              onChange={(e) =>
                setFormData({ ...formData, total_paid: e.target.value })
              }
              placeholder="5000.00"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              id="startDate"
              type="date"
              value={formData.start_date}
              onChange={(e) =>
                setFormData({ ...formData, start_date: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Icon</Label>
            <div className="flex gap-2">
              {loanIcons.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  className={`text-2xl p-2 rounded-lg transition-all ${
                    formData.icon === icon
                      ? "bg-primary/20 ring-2 ring-primary"
                      : "bg-muted hover:bg-muted/70"
                  }`}
                  onClick={() => setFormData({ ...formData, icon })}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1 gradient-primary">
              {loan ? "Save Changes" : "Add Loan"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LoanDialog;
