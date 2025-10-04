import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Database, Search, BookOpen, Users2, Rocket, Loader2, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { getOSDRStudies, searchOSDRStudies, type OSDRStudy } from "@/services/osdrApi";

const SpaceBiology = () => {
  const [studies, setStudies] = useState<OSDRStudy[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    loadStudies();
  }, []);

  const loadStudies = async () => {
    setLoading(true);
    const data = await getOSDRStudies(20);
    setStudies(data);
    setLoading(false);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadStudies();
      return;
    }
    
    setSearching(true);
    const results = await searchOSDRStudies(searchQuery);
    setStudies(results);
    setSearching(false);
  };

  const categories = [
    { name: "Human Physiology", count: studies.filter(s => s.organism.includes("Homo sapiens")).length, color: "bg-cyan-500/10 text-cyan-500 border-cyan-500/30" },
    { name: "Microbiology", count: studies.filter(s => s.factors.some(f => f.includes("microb"))).length, color: "bg-purple-500/10 text-purple-500 border-purple-500/30" },
    { name: "Plant Biology", count: studies.filter(s => s.organism.includes("Arabidopsis") || s.factors.some(f => f.includes("plant"))).length, color: "bg-green-500/10 text-green-500 border-green-500/30" },
    { name: "Model Organisms", count: studies.filter(s => s.organism.includes("Drosophila") || s.organism.includes("Mus")).length, color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/30" },
  ];

  const researchStats = [
    { label: "Total Studies", value: studies.length.toString() },
    { label: "Data Source", value: "NASA OSDR" },
    { label: "Real-Time", value: "Live" },
    { label: "Categories", value: categories.length.toString() },
  ];

  return (
    <div className="min-h-screen p-6">
      <div className="container mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Link to="/">
              <Button variant="ghost" size="sm" className="mb-2">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <h1 className="text-4xl font-bold flex items-center gap-3">
              <Database className="w-10 h-10 text-primary" />
              Space Biology Knowledge Engine
            </h1>
            <p className="text-muted-foreground">Explore NASA's space biology research for mission planning</p>
          </div>
        </div>

        {/* Search Bar */}
        <Card className="p-6 bg-card/50 backdrop-blur-sm">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input 
                placeholder="Search NASA space biology studies..." 
                className="pl-10 bg-background/50"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button 
              className="bg-primary hover:bg-primary/90 shadow-[0_0_20px_hsl(189_94%_55%/0.3)]"
              onClick={handleSearch}
              disabled={searching}
            >
              {searching ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Search className="w-4 h-4 mr-2" />}
              Search
            </Button>
          </div>
        </Card>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6">
          {researchStats.map((stat, index) => (
            <Card key={index} className="p-6 bg-gradient-stellar text-center">
              <div className="text-4xl font-bold text-primary mb-2">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </Card>
          ))}
        </div>

        {/* Categories */}
        <Card className="p-6 bg-card/50 backdrop-blur-sm">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            Research Categories
          </h2>
          <div className="flex flex-wrap gap-3">
            {categories.map((category, index) => (
              <Badge key={index} variant="outline" className={`px-4 py-2 ${category.color} border`}>
                {category.name} ({category.count})
              </Badge>
            ))}
          </div>
        </Card>

        {/* Publications List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Rocket className="w-6 h-6 text-primary" />
            NASA OSDR Studies
          </h2>
          
          {loading ? (
            <Card className="p-12 text-center bg-card/50 backdrop-blur-sm">
              <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Loading NASA OSDR space biology studies...</p>
            </Card>
          ) : studies.length === 0 ? (
            <Card className="p-12 text-center bg-card/50 backdrop-blur-sm">
              <Database className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Studies Found</h3>
              <p className="text-muted-foreground">Try a different search term</p>
            </Card>
          ) : (
            studies.map((study) => (
              <Card key={study.accession} className="p-6 bg-card/50 backdrop-blur-sm hover:shadow-[0_0_30px_hsl(189_94%_55%/0.2)] transition-all">
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                          {study.accession}
                        </Badge>
                        <Badge variant="outline" className="bg-accent/10 border-accent/30">
                          {study.organism}
                        </Badge>
                      </div>
                      <h3 className="text-lg font-bold text-foreground mb-2">
                        {study.title}
                      </h3>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => window.open(`https://osdr.nasa.gov/bio/repo/search?q=${study.accession}`, '_blank')}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View on OSDR
                    </Button>
                  </div>
                  
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {study.description}
                  </p>

                  {study.factors.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {study.factors.slice(0, 5).map((factor, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {factor}
                        </Badge>
                      ))}
                    </div>
                  )}
                  
                  {study.assay_types.length > 0 && (
                    <div className="pt-2 border-t border-border/50">
                      <div className="text-sm text-muted-foreground">
                        <span className="font-semibold">Assay Types:</span> {study.assay_types.join(', ')}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Mission Applications */}
        <Card className="p-8 bg-gradient-nebula/20 border-primary/30">
          <h2 className="text-2xl font-bold mb-4">Mission Applications</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <h3 className="font-bold text-primary">Lunar Missions</h3>
              <p className="text-sm text-muted-foreground">
                Research supporting Artemis program with focus on radiation protection and life support systems.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-bold text-primary">Mars Exploration</h3>
              <p className="text-sm text-muted-foreground">
                Long-duration health studies critical for 2-3 year Mars missions and sustainable habitats.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-bold text-primary">ISS Research</h3>
              <p className="text-sm text-muted-foreground">
                Ongoing experiments providing real-world microgravity data for future deep space missions.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SpaceBiology;
