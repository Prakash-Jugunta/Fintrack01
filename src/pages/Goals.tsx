import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Plus, Target, TrendingUp, Edit, Trash } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import GoalDialog from "@/components/GoalDialog";

export interface Goal {
  id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  deadline: string;
  icon: string;
}

const Goals = () => {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | undefined>(undefined);

  useEffect(() => {
    fetchGoals();
  }, [user]);

  const fetchGoals = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("goals")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setGoals(data || []);
    } catch (error) {
      console.error("Error fetching goals:", error);
      toast.error("Failed to load goals");
    } finally {
      setLoading(false);
    }
  };

  const handleAddGoal = async (goal: Omit<Goal, "id">) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("goals")
        .insert([{ ...goal, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      setGoals([data, ...goals]);
      setDialogOpen(false);
      toast.success("Goal added successfully");
    } catch (error) {
      console.error("Error adding goal:", error);
      toast.error("Failed to add goal");
    }
  };

  const handleEditGoal = async (goal: Goal) => {
    try {
      const { error } = await supabase
        .from("goals")
        .update({
          name: goal.name,
          target_amount: goal.target_amount,
          current_amount: goal.current_amount,
          deadline: goal.deadline,
          icon: goal.icon,
        })
        .eq("id", goal.id);

      if (error) throw error;
      setGoals(goals.map(g => g.id === goal.id ? goal : g));
      setDialogOpen(false);
      setEditingGoal(undefined);
      toast.success("Goal updated successfully");
    } catch (error) {
      console.error("Error updating goal:", error);
      toast.error("Failed to update goal");
    }
  };

  const handleDeleteGoal = async (id: string) => {
    try {
      const { error } = await supabase
        .from("goals")
        .delete()
        .eq("id", id);

      if (error) throw error;
      setGoals(goals.filter(g => g.id !== id));
      toast.success("Goal deleted successfully");
    } catch (error) {
      console.error("Error deleting goal:", error);
      toast.error("Failed to delete goal");
    }
  };

  const openEditDialog = (goal: Goal) => {
    setEditingGoal(goal);
    setDialogOpen(true);
  };

  const openAddDialog = () => {
    setEditingGoal(undefined);
    setDialogOpen(true);
  };

  const getProgress = (current: number, target: number) => {
    return (current / target) * 100;
  };

  const getDaysRemaining = (deadline: string) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Financial Goals</h1>
            <p className="text-muted-foreground">Set and track your savings goals</p>
          </div>
          <Button onClick={openAddDialog} className="gradient-primary hover:opacity-90 transition-opacity">
            <Plus className="w-4 h-4 mr-2" />
            Add Goal
          </Button>
        </div>

        {/* Summary Card */}
        <Card className="glass-card-strong p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-xl gradient-success">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Total Goals Progress</h3>
              <p className="text-sm text-muted-foreground">Keep pushing toward your dreams!</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Saved</p>
              <p className="text-2xl font-bold text-success">
                ${goals.reduce((sum, g) => sum + Number(g.current_amount), 0).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Target</p>
              <p className="text-2xl font-bold">
                ${goals.reduce((sum, g) => sum + Number(g.target_amount), 0).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Overall Progress</p>
              <p className="text-2xl font-bold text-primary">
                {goals.length > 0 ? Math.round(
                  (goals.reduce((sum, g) => sum + Number(g.current_amount), 0) /
                    goals.reduce((sum, g) => sum + Number(g.target_amount), 0)) *
                    100
                ) : 0}%
              </p>
            </div>
          </div>
        </Card>

        {/* Goals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((goal) => {
            const progress = getProgress(Number(goal.current_amount), Number(goal.target_amount));
            const daysRemaining = getDaysRemaining(goal.deadline);
            
            return (
              <Card key={goal.id} className="glass-card p-6 hover:shadow-xl transition-all duration-300">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{goal.icon}</span>
                    <div>
                      <h3 className="font-semibold text-lg">{goal.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {daysRemaining > 0
                          ? `${daysRemaining} days left`
                          : "Deadline passed"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-semibold">{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>

                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-sm text-muted-foreground">Saved</p>
                      <p className="text-xl font-bold text-success">
                        ${Number(goal.current_amount).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Target</p>
                      <p className="text-xl font-bold">
                        ${Number(goal.target_amount).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1 glass-card border-primary/30 hover:bg-primary/10"
                      onClick={() => openEditDialog(goal)}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 glass-card border-expense/30 hover:bg-expense/10"
                      onClick={() => handleDeleteGoal(goal.id)}
                    >
                      <Trash className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {goals.length === 0 && !loading && (
          <Card className="glass-card p-12 text-center">
            <div className="max-w-md mx-auto space-y-4">
              <div className="p-4 rounded-full bg-primary/10 w-20 h-20 mx-auto flex items-center justify-center">
                <Target className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">No goals yet</h3>
              <p className="text-muted-foreground">
                Start setting your financial goals by adding your first goal above
              </p>
            </div>
          </Card>
        )}

        <GoalDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSubmit={editingGoal ? handleEditGoal : handleAddGoal}
          goal={editingGoal}
        />
      </div>
    </DashboardLayout>
  );
};

export default Goals;
