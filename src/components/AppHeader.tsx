import { Button } from "@/components/ui/button";
import { Satellite, LogOut, LayoutDashboard, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const AppHeader = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      navigate("/auth");
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        <Link to="/" className="flex items-center space-x-3">
          <Satellite className="w-6 h-6 text-primary animate-pulse" />
          <span className="font-bold text-lg">NASA Earth Platform</span>
        </Link>

        <nav className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/dashboard")}
          >
            <LayoutDashboard className="w-4 h-4 mr-2" />
            Dashboard
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/profile")}
          >
            <User className="w-4 h-4 mr-2" />
            Profile
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </nav>
      </div>
    </header>
  );
};

export default AppHeader;
