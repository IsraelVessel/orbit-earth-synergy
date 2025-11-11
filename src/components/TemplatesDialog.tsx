import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookTemplate, Trash2, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Template {
  id: string;
  template_name: string;
  business_model: string;
  parameters: any;
  description: string;
  created_at: string;
}

interface TemplatesDialogProps {
  currentModel: string;
  currentParams: any;
  onLoadTemplate: (params: any) => void;
}

const TemplatesDialog = ({ currentModel, currentParams, onLoadTemplate }: TemplatesDialogProps) => {
  const [open, setOpen] = useState(false);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [saving, setSaving] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [description, setDescription] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchTemplates();
    }
  }, [open]);

  const fetchTemplates = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("simulation_templates")
        .select("*")
        .eq("user_id", user.id)
        .eq("business_model", currentModel)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const saveTemplate = async () => {
    if (!templateName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a template name",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("simulation_templates").insert([{
        user_id: user.id,
        template_name: templateName,
        business_model: currentModel,
        parameters: currentParams,
        description: description,
      }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Template saved successfully",
      });

      setTemplateName("");
      setDescription("");
      fetchTemplates();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const deleteTemplate = async (id: string) => {
    try {
      const { error } = await supabase
        .from("simulation_templates")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Template deleted",
      });

      fetchTemplates();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const loadTemplate = (template: Template) => {
    onLoadTemplate(template.parameters);
    toast({
      title: "Template Loaded",
      description: `"${template.template_name}" parameters applied`,
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <BookTemplate className="w-4 h-4 mr-2" />
          Templates
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Simulation Templates</DialogTitle>
          <DialogDescription>
            Save and reuse parameter configurations for {currentModel}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Save Current Config */}
          <Card className="p-4 bg-muted/50">
            <h3 className="font-semibold mb-3">Save Current Configuration</h3>
            <div className="space-y-3">
              <div>
                <Label htmlFor="template-name">Template Name</Label>
                <Input
                  id="template-name"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="e.g., High Growth Scenario"
                />
              </div>
              <div>
                <Label htmlFor="template-desc">Description (Optional)</Label>
                <Textarea
                  id="template-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe this configuration..."
                  rows={2}
                />
              </div>
              <Button onClick={saveTemplate} disabled={saving} className="w-full">
                {saving ? "Saving..." : "Save as Template"}
              </Button>
            </div>
          </Card>

          {/* Saved Templates */}
          <div>
            <h3 className="font-semibold mb-3">Saved Templates ({templates.length})</h3>
            {templates.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No templates saved yet. Save your first configuration above!
              </p>
            ) : (
              <div className="space-y-2">
                {templates.map((template) => (
                  <Card key={template.id} className="p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{template.template_name}</h4>
                          <Badge variant="outline" className="text-xs">
                            {new Date(template.created_at).toLocaleDateString()}
                          </Badge>
                        </div>
                        {template.description && (
                          <p className="text-sm text-muted-foreground mb-2">{template.description}</p>
                        )}
                        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                          <span>Launch: ${(template.parameters.launchCost / 1000000).toFixed(0)}M</span>
                          <span>•</span>
                          <span>OpEx: ${(template.parameters.operationalCost / 1000000).toFixed(0)}M</span>
                          <span>•</span>
                          <span>Market: {(template.parameters.marketShare * 100).toFixed(1)}%</span>
                          <span>•</span>
                          <span>Growth: {template.parameters.growthRate}%</span>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => loadTemplate(template)}
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Load
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteTemplate(template.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TemplatesDialog;
