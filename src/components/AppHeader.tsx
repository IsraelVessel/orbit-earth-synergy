import { Button } from "@/components/ui/button";
import { Satellite, LogOut, LayoutDashboard, User, Search, Keyboard } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import BreadcrumbNav from "./BreadcrumbNav";
import GlobalSearch from "./GlobalSearch";
import KeyboardShortcutsDialog from "./KeyboardShortcutsDialog";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";

const AppHeader = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchOpen, setSearchOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);

  useKeyboardShortcuts({
    onSearchOpen: () => setSearchOpen(true),
    onHelpOpen: () => setShortcutsOpen(true),
  });

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
    <>
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
              onClick={() => setSearchOpen(true)}
            >
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>

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
              variant="ghost"
              size="sm"
              onClick={() => setShortcutsOpen(true)}
              title="Keyboard shortcuts"
            >
              <Keyboard className="w-4 h-4" />
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
        
        <div className="container mx-auto px-6 py-2 border-t border-border/30">
          <BreadcrumbNav />
        </div>
      </header>

      <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
      <KeyboardShortcutsDialog open={shortcutsOpen} onOpenChange={setShortcutsOpen} />
    </>
  );
};

export default AppHeader;
