import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Clock, RotateCcw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";

interface VersionHistoryDialogProps {
  simulationId: string;
  onRestore: (parameters: any, results: any) => void;
}

export const VersionHistoryDialog = ({ simulationId, onRestore }: VersionHistoryDialogProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: versions = [] } = useQuery({
    queryKey: ["simulation-versions", simulationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("simulation_versions")
        .select("*")
        .eq("simulation_id", simulationId)
        .order("version_number", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const restoreMutation = useMutation({
    mutationFn: async (version: any) => {
      const { error } = await supabase
        .from("simulations")
        .update({
          parameters: version.parameters,
          results: version.results,
        })
        .eq("id", simulationId);

      if (error) throw error;
      return version;
    },
    onSuccess: (version) => {
      onRestore(version.parameters, version.results);
      toast({ title: "Version restored successfully" });
      queryClient.invalidateQueries({ queryKey: ["simulations"] });
    },
    onError: (error: Error) => {
      toast({ title: "Error restoring version", description: error.message, variant: "destructive" });
    },
  });

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Clock className="h-4 w-4 mr-2" />
          Version History
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Version History</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-96">
          <div className="space-y-2">
            {versions.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-8">No version history available</p>
            ) : (
              versions.map((version) => (
                <div key={version.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">Version {version.version_number}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(version.created_at), "PPp")}
                      </p>
                      {version.notes && (
                        <p className="text-sm mt-1">{version.notes}</p>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => restoreMutation.mutate(version)}
                      disabled={restoreMutation.isPending}
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Restore
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};