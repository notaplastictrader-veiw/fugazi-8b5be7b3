import { useState } from "react";
import SEO from "@/components/SEO";
import { educationArticles } from "@/data/educationArticles";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Plus, Edit, Eye, EyeOff, Lock, Unlock } from "lucide-react";
import StatusBadge from "@/components/admin/StatusBadge";

const EducationAdmin = () => {
  const [trackFilter, setTrackFilter] = useState("all");

  const filtered = trackFilter === "all"
    ? educationArticles
    : educationArticles.filter(a => a.track === trackFilter);

  return (
    <div className="space-y-6">
      <SEO title="Education Admin" path="/admin/education" />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Education Articles</h1>
          <p className="text-sm text-muted-foreground">{educationArticles.length} articles across 3 tracks</p>
        </div>
        <Button size="sm" disabled>
          <Plus className="w-4 h-4 mr-1.5" />
          Add Article
        </Button>
      </div>

      <Tabs value={trackFilter} onValueChange={setTrackFilter}>
        <TabsList>
          <TabsTrigger value="all">All ({educationArticles.length})</TabsTrigger>
          <TabsTrigger value="beginner">Beginner</TabsTrigger>
          <TabsTrigger value="intermediate">Intermediate</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value={trackFilter} className="mt-4">
          <div className="space-y-2">
            {filtered.map((article) => (
              <Card key={article.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-4 h-4 text-primary" />
                    <div>
                      <h3 className="font-medium text-sm text-foreground">{article.title}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-mono uppercase text-muted-foreground">{article.track}</span>
                        <span className="text-[10px] text-muted-foreground">·</span>
                        <span className="text-[10px] text-muted-foreground">{article.readTime} min</span>
                        <span className="text-[10px] text-muted-foreground">·</span>
                        <span className="text-[10px] text-muted-foreground">{article.sections.length} sections</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {article.isLocked ? (
                      <span className="text-[10px] font-mono bg-muted px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Lock className="w-3 h-3" /> Locked
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono bg-primary/10 text-primary px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Unlock className="w-3 h-3" /> Free
                      </span>
                    )}
                    <Button variant="ghost" size="sm" disabled>
                      <Edit className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <p className="text-xs text-muted-foreground italic">
        Rich text editing will be available once the education_articles database table is created.
      </p>
    </div>
  );
};

export default EducationAdmin;
