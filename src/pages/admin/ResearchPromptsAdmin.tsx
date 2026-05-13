import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, ArrowRight, FileJson } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { ENTITIES } from "@/lib/researchPrompts";
import SEO from "@/components/SEO";

const ResearchPromptsAdmin = () => {
  const [name, setName] = useState("Bullwaves");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copy = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopiedKey(null), 1800);
  };

  return (
    <div className="space-y-6">
      <SEO title="Research Prompts | NAFT Admin" />

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-condensed uppercase tracking-tight">Research Prompts</h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            Copy a strict-JSON research prompt, paste it into ChatGPT / Claude / DeepSeek, then bring the JSON to{" "}
            <Link to="/admin/import-json" className="text-primary underline underline-offset-4">
              Import JSON
            </Link>{" "}
            to insert as a draft.
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link to="/admin/import-json">
            <FileJson className="h-4 w-4 mr-2" />
            Open Importer
            <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </Button>
      </div>

      <Card className="p-4">
        <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
          Subject name (replaces [NAME] in every prompt)
        </Label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Bullwaves, Exness, FTMO, US CPI..."
          className="mt-2 font-mono"
        />
      </Card>

      <Tabs defaultValue={ENTITIES[0].key} className="w-full">
        <TabsList className="flex flex-wrap h-auto gap-1 bg-muted/40 p-1">
          {ENTITIES.map((e) => (
            <TabsTrigger key={e.key} value={e.key} className="text-xs">
              {e.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {ENTITIES.map((entity) => {
          const promptText = entity.prompt(name || "[NAME]");
          const exampleText = JSON.stringify(entity.example, null, 2);
          const requiredFields = Object.entries(entity.schema.fields)
            .filter(([, s]) => s.required)
            .map(([k]) => k);

          return (
            <TabsContent key={entity.key} value={entity.key} className="mt-6 space-y-4">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <h2 className="text-xl font-condensed uppercase">{entity.label}</h2>
                  <p className="text-sm text-muted-foreground">{entity.description}</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Badge variant="outline" className="font-mono text-xs">
                    table: {entity.table}
                  </Badge>
                  <Badge variant="outline" className="font-mono text-xs">
                    required: {requiredFields.length}
                  </Badge>
                </div>
              </div>

              {/* Prompt */}
              <Card className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                    Research Prompt
                  </Label>
                  <Button size="sm" variant="secondary" onClick={() => copy(promptText, `${entity.key}-prompt`)}>
                    {copiedKey === `${entity.key}-prompt` ? (
                      <Check className="h-3.5 w-3.5 mr-1.5" />
                    ) : (
                      <Copy className="h-3.5 w-3.5 mr-1.5" />
                    )}
                    Copy Prompt
                  </Button>
                </div>
                <Textarea readOnly value={promptText} className="min-h-[280px] font-mono text-xs leading-relaxed" />
              </Card>

              {/* Schema + Example */}
              <div className="grid lg:grid-cols-2 gap-4">
                <Card className="p-4">
                  <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-2 block">
                    Schema ({Object.keys(entity.schema.fields).length} fields)
                  </Label>
                  <div className="space-y-1.5 max-h-[320px] overflow-auto pr-2">
                    {Object.entries(entity.schema.fields).map(([key, s]) => (
                      <div key={key} className="flex items-center justify-between text-xs gap-2">
                        <span className="font-mono">{key}</span>
                        <div className="flex items-center gap-1.5">
                          {s.required && <Badge variant="destructive" className="h-4 text-[9px] px-1.5">REQ</Badge>}
                          <span className="text-muted-foreground font-mono">
                            {s.type}
                            {s.enum ? ` (${s.enum.length})` : ""}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                      Example Output
                    </Label>
                    <Button size="sm" variant="ghost" onClick={() => copy(exampleText, `${entity.key}-example`)}>
                      {copiedKey === `${entity.key}-example` ? (
                        <Check className="h-3.5 w-3.5" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </div>
                  <pre className="text-[11px] font-mono leading-relaxed bg-muted/30 p-3 rounded-md max-h-[320px] overflow-auto">
                    {exampleText}
                  </pre>
                </Card>
              </div>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
};

export default ResearchPromptsAdmin;
