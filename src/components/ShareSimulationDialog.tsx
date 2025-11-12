import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Share2, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface ShareSimulationDialogProps {
  simulationId: string;
  simulationName: string;
}

export const ShareSimulationDialog = ({ simulationId, simulationName }: ShareSimulationDialogProps) => {
  const [email, setEmail] = useState("");
  const [permission, setPermission] = useState<"view" | "edit">("view");
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: shares = [] } = useQuery({
    queryKey: ["simulation-shares", simulationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("simulation_shares")
        .select("*")
        .eq("simulation_id", simulationId);

      if (error) throw error;
      return data;
    },
  });

  const shareMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error: dbError } = await supabase.from("simulation_shares").insert({
        simulation_id: simulationId,
        shared_by: user.id,
        shared_with_email: email,
        permission,
      });

      if (dbError) throw dbError;

      const { error: fnError } = await supabase.functions.invoke("send-share-invitation", {
        body: { email, simulationId, permission, simulationName },
      });

      if (fnError) throw fnError;
    },
    onSuccess: () => {
      toast({ title: "Invitation sent successfully" });
      setEmail("");
      setPermission("view");
      queryClient.invalidateQueries({ queryKey: ["simulation-shares", simulationId] });
    },
    onError: (error: Error) => {
      toast({ title: "Error sharing simulation", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (shareId: string) => {
      const { error } = await supabase.from("simulation_shares").delete().eq("id", shareId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Share removed" });
      queryClient.invalidateQueries({ queryKey: ["simulation-shares", simulationId] });
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Simulation</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="colleague@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="permission">Permission</Label>
            <Select value={permission} onValueChange={(v) => setPermission(v as "view" | "edit")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="view">View only</SelectItem>
                <SelectItem value="edit">Can edit</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => shareMutation.mutate()} disabled={!email || shareMutation.isPending} className="w-full">
            Send Invitation
          </Button>

          {shares.length > 0 && (
            <div className="border-t pt-4 mt-4">
              <h4 className="text-sm font-medium mb-2">Shared with:</h4>
              <div className="space-y-2">
                {shares.map((share) => (
                  <div key={share.id} className="flex items-center justify-between text-sm">
                    <div>
                      <p className="font-medium">{share.shared_with_email}</p>
                      <p className="text-muted-foreground text-xs">{share.permission === "edit" ? "Can edit" : "View only"}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteMutation.mutate(share.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};