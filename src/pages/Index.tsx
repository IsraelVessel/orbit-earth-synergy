import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Satellite, Users, Rocket, Wind, Database, LineChart, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
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

  const modules = [
    {
      icon: Users,
      title: "Urban Health & Sustainability",
      description: "Monitor environmental factors impacting healthy cities using NASA Earth observation data",
      color: "from-cyan-500 to-blue-600",
      link: "/urban-health"
    },
    {
      icon: Database,
      title: "Space Biology Knowledge Engine",
      description: "Explore NASA's space biology research for lunar and Mars mission planning",
      color: "from-purple-500 to-pink-600",
      link: "/space-biology"
    },
    {
      icon: Rocket,
      title: "LEO Commercialization",
      description: "Simulate sustainable business models for low Earth orbit operations",
      color: "from-orange-500 to-red-600",
      link: "/leo-commerce"
    },
    {
      icon: Wind,
      title: "Air Quality Prediction",
      description: "Real-time atmospheric forecasting for public health decision-making",
      color: "from-green-500 to-emerald-600",
      link: "/air-quality"
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Logout Button */}
      <div className="absolute top-6 right-6 z-50">
        <Button 
          onClick={handleLogout}
          variant="outline"
          size="sm"
          className="border-primary/30 hover:bg-primary/10"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden px-6 py-20 lg:py-32">
        <div className="absolute inset-0 bg-gradient-nebula opacity-20"></div>
        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="flex flex-col items-center text-center space-y-8">
            <div className="inline-flex items-center space-x-3 bg-card/50 backdrop-blur-sm px-6 py-3 rounded-full border border-primary/30">
              <Satellite className="w-5 h-5 text-primary animate-pulse" />
              <span className="text-sm font-medium">NASA Earth Observation Platform</span>
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-bold tracking-tight max-w-4xl">
              Space Data for
              <span className="block bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-shimmer bg-[length:200%_auto]">
                Earth Solutions
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl">
              Leveraging NASA's Earth observation data, space biology research, and commercial space insights 
              to address global challenges and advance exploration.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button 
                size="lg" 
                className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_30px_hsl(189_94%_55%/0.5)] hover:shadow-[0_0_40px_hsl(189_94%_55%/0.7)] transition-all"
              >
                <LineChart className="w-5 h-5 mr-2" />
                Explore Modules
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="border-primary/30 hover:bg-primary/10"
              >
                View Documentation
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Modules Grid */}
      <section className="px-6 py-20">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Integrated Modules</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Four interconnected systems addressing Earth and space exploration challenges
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {modules.map((module, index) => (
              <Link to={module.link} key={index}>
                <Card className="group relative overflow-hidden bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-all duration-300 h-full p-8 hover:shadow-[0_0_30px_hsl(189_94%_55%/0.3)]">
                  <div className={`absolute inset-0 bg-gradient-to-br ${module.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                  
                  <div className="relative z-10 space-y-4">
                    <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${module.color}`}>
                      <module.icon className="w-8 h-8 text-white" />
                    </div>
                    
                    <h3 className="text-2xl font-bold group-hover:text-primary transition-colors">
                      {module.title}
                    </h3>
                    
                    <p className="text-muted-foreground leading-relaxed">
                      {module.description}
                    </p>
                    
                    <div className="pt-4">
                      <span className="text-primary font-medium inline-flex items-center group-hover:translate-x-2 transition-transform">
                        Explore Module
                        <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="px-6 py-20 bg-gradient-stellar">
        <div className="container mx-auto max-w-7xl">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-5xl font-bold text-primary">10K+</div>
              <div className="text-muted-foreground">Data Points Daily</div>
            </div>
            <div className="space-y-2">
              <div className="text-5xl font-bold text-accent">500+</div>
              <div className="text-muted-foreground">Research Papers</div>
            </div>
            <div className="space-y-2">
              <div className="text-5xl font-bold text-primary">24/7</div>
              <div className="text-muted-foreground">Real-time Monitoring</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
