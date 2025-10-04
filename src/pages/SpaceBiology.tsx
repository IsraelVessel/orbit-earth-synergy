import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Database, Search, BookOpen, Users2, Rocket } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

const SpaceBiology = () => {
  const publications = [
    {
      title: "Effects of Microgravity on Human Bone Density During Extended Mars Missions",
      authors: "Johnson, M., Chen, L., Rodriguez, A.",
      year: 2024,
      category: "Human Physiology",
      citations: 127,
      summary: "Long-term microgravity exposure leads to 1-2% bone mass loss per month. Countermeasures including resistance exercise and bisphosphonates show promise."
    },
    {
      title: "Plant Growth Systems for Lunar Habitats: Hydroponic Innovations",
      authors: "Kim, S., Patel, R., O'Brien, K.",
      year: 2024,
      category: "Astrobotany",
      citations: 89,
      summary: "Novel hydroponic systems demonstrate 40% improved yield in simulated lunar gravity with LED optimization."
    },
    {
      title: "Radiation Shielding Through Biological Mechanisms in Deep Space",
      authors: "Thompson, D., Yamamoto, H., Lee, J.",
      year: 2023,
      category: "Radiation Biology",
      citations: 156,
      summary: "Certain extremophile proteins show potential for radiation protection in astronauts during Mars transit."
    },
    {
      title: "Sleep Cycle Disruption and Circadian Rhythm Management in Zero Gravity",
      authors: "Anderson, P., Zhang, W., Martinez, C.",
      year: 2024,
      category: "Human Physiology",
      citations: 98,
      summary: "Blue light therapy and melatonin supplementation restore 85% of normal circadian function in microgravity."
    },
    {
      title: "Microbiome Changes During Long-Duration Space Flight",
      authors: "Williams, T., Kumar, A., Dubois, M.",
      year: 2023,
      category: "Microbiology",
      citations: 143,
      summary: "Gut microbiome diversity decreases by 30% during 6-month missions, requiring probiotic interventions."
    },
  ];

  const categories = [
    { name: "Human Physiology", count: 142, color: "bg-cyan-500/10 text-cyan-500 border-cyan-500/30" },
    { name: "Astrobotany", count: 87, color: "bg-green-500/10 text-green-500 border-green-500/30" },
    { name: "Radiation Biology", count: 64, color: "bg-red-500/10 text-red-500 border-red-500/30" },
    { name: "Microbiology", count: 95, color: "bg-purple-500/10 text-purple-500 border-purple-500/30" },
    { name: "Psychology", count: 58, color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/30" },
  ];

  const researchStats = [
    { label: "Total Publications", value: "500+" },
    { label: "Active Researchers", value: "1,200+" },
    { label: "Ongoing Studies", value: "78" },
    { label: "Citation Index", value: "12.4" },
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
                placeholder="Search publications, authors, or topics..." 
                className="pl-10 bg-background/50"
              />
            </div>
            <Button className="bg-primary hover:bg-primary/90 shadow-[0_0_20px_hsl(189_94%_55%/0.3)]">
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
            Recent Publications
          </h2>
          
          {publications.map((pub, index) => (
            <Card key={index} className="p-6 bg-card/50 backdrop-blur-sm hover:shadow-[0_0_30px_hsl(189_94%_55%/0.2)] transition-all">
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-foreground mb-2 hover:text-primary transition-colors cursor-pointer">
                      {pub.title}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <Users2 className="w-4 h-4" />
                      {pub.authors}
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                    {pub.category}
                  </Badge>
                </div>
                
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {pub.summary}
                </p>
                
                <div className="flex items-center justify-between pt-2 border-t border-border/50">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{pub.year}</span>
                    <span>•</span>
                    <span>{pub.citations} citations</span>
                  </div>
                  <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                    View Full Paper →
                  </Button>
                </div>
              </div>
            </Card>
          ))}
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
