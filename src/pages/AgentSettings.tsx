import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Key, Shield, Trash2, Plus, Eye, EyeOff, Check, AlertCircle, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface StoredKey {
  id: string;
  name: string;
  maskedValue: string;
  addedAt: string;
}

const AgentSettings = () => {
  const [keys, setKeys] = useState<StoredKey[]>([]);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyValue, setNewKeyValue] = useState("");
  const [showNewKey, setShowNewKey] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    // Load keys from localStorage (masked for security)
    loadKeys();
  }, []);

  const loadKeys = () => {
    try {
      const storedKeys = localStorage.getItem("agent_api_keys");
      if (storedKeys) {
        setKeys(JSON.parse(storedKeys));
      }
    } catch (e) {
      console.error("Failed to load keys:", e);
    }
  };

  const maskKey = (key: string): string => {
    if (key.length <= 8) return "••••••••";
    return `${key.substring(0, 4)}••••••••${key.substring(key.length - 4)}`;
  };

  const addKey = () => {
    if (!newKeyName.trim() || !newKeyValue.trim()) {
      toast.error("Please provide both a name and API key");
      return;
    }

    if (!newKeyValue.startsWith("AI") && !newKeyValue.includes("-")) {
      toast.warning("This doesn't look like a valid Gemini API key");
    }

    const newKey: StoredKey = {
      id: crypto.randomUUID(),
      name: newKeyName.trim(),
      maskedValue: maskKey(newKeyValue),
      addedAt: new Date().toISOString(),
    };

    // Store the actual key separately (encrypted in production)
    const actualKeys = JSON.parse(localStorage.getItem("agent_api_keys_actual") || "{}");
    actualKeys[newKey.id] = newKeyValue;
    localStorage.setItem("agent_api_keys_actual", JSON.stringify(actualKeys));

    // Store the masked version
    const updatedKeys = [...keys, newKey];
    setKeys(updatedKeys);
    localStorage.setItem("agent_api_keys", JSON.stringify(updatedKeys));

    setNewKeyName("");
    setNewKeyValue("");
    setIsAdding(false);
    toast.success("API key added successfully");
  };

  const removeKey = (id: string) => {
    const updatedKeys = keys.filter(k => k.id !== id);
    setKeys(updatedKeys);
    localStorage.setItem("agent_api_keys", JSON.stringify(updatedKeys));

    // Remove actual key
    const actualKeys = JSON.parse(localStorage.getItem("agent_api_keys_actual") || "{}");
    delete actualKeys[id];
    localStorage.setItem("agent_api_keys_actual", JSON.stringify(actualKeys));

    toast.success("API key removed");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Agent Settings</h1>
              <p className="text-muted-foreground text-sm">Manage your AI agent configuration</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Security Notice */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="flex items-start gap-4 pt-6">
              <Shield className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-foreground mb-1">Security Notice</h3>
                <p className="text-sm text-muted-foreground">
                  API keys are stored locally in your browser. For production use, configure keys as 
                  backend secrets in your Supabase project settings. Keys stored here are for 
                  development and testing purposes only.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* API Keys Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Key className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Gemini API Keys</CardTitle>
                    <CardDescription>
                      Add multiple keys for automatic rotation
                    </CardDescription>
                  </div>
                </div>
                <Badge variant="outline" className="font-mono">
                  {keys.length} key{keys.length !== 1 ? "s" : ""}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Existing Keys */}
              {keys.length > 0 ? (
                <div className="space-y-3">
                  {keys.map((key, index) => (
                    <motion.div
                      key={key.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center justify-between p-4 rounded-xl bg-muted/50 border border-border"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-bold text-primary">{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-medium">{key.name}</p>
                          <p className="text-sm font-mono text-muted-foreground">{key.maskedValue}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeKey(key.id)}
                        className="text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Key className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>No API keys configured</p>
                  <p className="text-sm">Add your first Gemini API key below</p>
                </div>
              )}

              {/* Add New Key */}
              {isAdding ? (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="space-y-4 p-4 rounded-xl border border-dashed border-primary/30 bg-primary/5"
                >
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Key Name</label>
                    <Input
                      placeholder="e.g., Primary Key, Backup Key"
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">API Key</label>
                    <div className="relative">
                      <Input
                        type={showNewKey ? "text" : "password"}
                        placeholder="Enter your Gemini API key"
                        value={newKeyValue}
                        onChange={(e) => setNewKeyValue(e.target.value)}
                        className="pr-10 font-mono"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                        onClick={() => setShowNewKey(!showNewKey)}
                      >
                        {showNewKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Get your API key from{" "}
                      <a 
                        href="https://aistudio.google.com/apikey" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Google AI Studio
                      </a>
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={addKey} className="flex-1">
                      <Check className="h-4 w-4 mr-2" />
                      Save Key
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setIsAdding(false);
                        setNewKeyName("");
                        setNewKeyValue("");
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </motion.div>
              ) : (
                <Button 
                  variant="outline" 
                  className="w-full border-dashed"
                  onClick={() => setIsAdding(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add API Key
                </Button>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Info Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6"
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-muted-foreground" />
                How Key Rotation Works
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>
                When multiple API keys are configured, the system automatically rotates between them:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Round-robin selection for balanced usage</li>
                <li>Automatic switch when rate limits are hit (429 errors)</li>
                <li>Failed keys are temporarily skipped</li>
                <li>Usage statistics track each key's performance</li>
              </ul>
              <p className="pt-2">
                <strong>Tip:</strong> Add 2-3 keys to handle high-volume workflows without interruption.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default AgentSettings;
