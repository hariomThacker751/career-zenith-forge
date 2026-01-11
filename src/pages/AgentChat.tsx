import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Send, 
  Bot, 
  User, 
  Loader2, 
  Settings, 
  Zap, 
  Brain, 
  CheckCircle2, 
  XCircle,
  ArrowLeft,
  Sparkles,
  ListTodo
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  reasoning?: string[];
  taskCount?: number;
}

interface ReasoningStep {
  step: string;
  timestamp: Date;
}

const AgentChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [agenticMode, setAgenticMode] = useState(true);
  const [reasoning, setReasoning] = useState<ReasoningStep[]>([]);
  const [showReasoning, setShowReasoning] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, reasoning]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setReasoning([]);

    try {
      if (agenticMode) {
        await handleAgenticChat(userMessage.content);
      } else {
        await handleSimpleChat(userMessage.content);
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to send message");
      console.error("Chat error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAgenticChat = async (userContent: string) => {
    const response = await supabase.functions.invoke("agentic-chat", {
      body: {
        messages: [{ role: "user", content: userContent }],
        mode: "agentic",
        stream: true,
      },
    });

    if (response.error) {
      throw new Error(response.error.message);
    }

    // Handle streaming response
    const reader = response.data.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let taskCount = 0;
    const reasoningSteps: string[] = [];
    let finalContent = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.startsWith("event:")) continue;
        if (!line.startsWith("data:")) continue;

        const data = line.slice(5).trim();
        if (!data) continue;

        try {
          const parsed = JSON.parse(data);
          
          if (parsed.goal) {
            taskCount = parsed.tasks || 0;
          }

          if (parsed.step) {
            reasoningSteps.push(parsed.step);
            setReasoning(prev => [...prev, { step: parsed.step, timestamp: new Date() }]);
          }

          if (parsed.output) {
            finalContent = parsed.output;
          }

          if (parsed.message && parsed.message.includes("error")) {
            throw new Error(parsed.message);
          }
        } catch (e) {
          // Non-JSON line, skip
        }
      }
    }

    const assistantMessage: Message = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: finalContent || "Task completed.",
      timestamp: new Date(),
      reasoning: reasoningSteps,
      taskCount,
    };

    setMessages(prev => [...prev, assistantMessage]);
  };

  const handleSimpleChat = async (userContent: string) => {
    const { data, error } = await supabase.functions.invoke("agentic-chat", {
      body: {
        messages: messages.map(m => ({ role: m.role, content: m.content })).concat([
          { role: "user", content: userContent }
        ]),
        mode: "simple",
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data.success) {
      throw new Error(data.error || "Failed to generate response");
    }

    const assistantMessage: Message = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: data.content,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, assistantMessage]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10">
                  <Bot className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h1 className="font-bold">Agentic Chat</h1>
                  <p className="text-xs text-muted-foreground">Powered by Gemini 2.5 Flash</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Mode Toggle */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 border border-border">
                <Label htmlFor="agentic-mode" className="text-xs cursor-pointer">
                  {agenticMode ? (
                    <span className="flex items-center gap-1.5 text-primary">
                      <Brain className="h-3.5 w-3.5" />
                      Agentic
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5">
                      <Zap className="h-3.5 w-3.5" />
                      Simple
                    </span>
                  )}
                </Label>
                <Switch
                  id="agentic-mode"
                  checked={agenticMode}
                  onCheckedChange={setAgenticMode}
                />
              </div>

              <Link to="/agent-settings">
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            <div className="max-w-3xl mx-auto space-y-4">
              {messages.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-12"
                >
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                    <Sparkles className="h-8 w-8 text-primary" />
                  </div>
                  <h2 className="text-xl font-semibold mb-2">Start a Conversation</h2>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    {agenticMode 
                      ? "In Agentic mode, I'll break down complex tasks, execute them step-by-step, and verify the results."
                      : "In Simple mode, I'll respond directly without task planning."}
                  </p>
                  <div className="mt-6 flex flex-wrap gap-2 justify-center">
                    {[
                      "Write a detailed blog post about AI agents",
                      "Create a project roadmap for a startup",
                      "Explain quantum computing simply",
                    ].map((prompt, i) => (
                      <Button
                        key={i}
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={() => setInput(prompt)}
                      >
                        {prompt}
                      </Button>
                    ))}
                  </div>
                </motion.div>
              )}

              <AnimatePresence mode="popLayout">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`flex gap-3 ${message.role === "user" ? "justify-end" : ""}`}
                  >
                    {message.role === "assistant" && (
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Bot className="h-4 w-4 text-primary" />
                      </div>
                    )}
                    
                    <Card className={`max-w-[80%] p-4 ${
                      message.role === "user" 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-card"
                    }`}>
                      {message.taskCount && message.taskCount > 0 && (
                        <Badge variant="secondary" className="mb-2 text-xs">
                          <ListTodo className="h-3 w-3 mr-1" />
                          {message.taskCount} tasks executed
                        </Badge>
                      )}
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      </div>
                    </Card>

                    {message.role === "user" && (
                      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                        <User className="h-4 w-4" />
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-3"
                >
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Loader2 className="h-4 w-4 text-primary animate-spin" />
                  </div>
                  <Card className="p-4 bg-card">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <span className="text-sm">
                        {agenticMode ? "Planning and executing..." : "Thinking..."}
                      </span>
                    </div>
                  </Card>
                </motion.div>
              )}
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="border-t border-border bg-card/50 backdrop-blur-sm p-4">
            <div className="max-w-3xl mx-auto">
              <div className="relative">
                <Textarea
                  ref={inputRef}
                  placeholder={agenticMode 
                    ? "Describe a complex task... I'll break it down and execute it step by step"
                    : "Type your message..."
                  }
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="min-h-[60px] max-h-[200px] pr-14 resize-none"
                  disabled={isLoading}
                />
                <Button
                  size="icon"
                  className="absolute right-2 bottom-2"
                  onClick={sendMessage}
                  disabled={!input.trim() || isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Press Enter to send, Shift+Enter for new line
              </p>
            </div>
          </div>
        </div>

        {/* Reasoning Panel */}
        {agenticMode && showReasoning && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="border-l border-border bg-muted/30 flex flex-col"
          >
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <Brain className="h-4 w-4 text-primary" />
                Live Reasoning
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowReasoning(false)}
              >
                Hide
              </Button>
            </div>
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-2">
                <AnimatePresence mode="popLayout">
                  {reasoning.map((step, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-start gap-2 text-sm"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                      <span className="text-muted-foreground">{step.step}</span>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {reasoning.length === 0 && !isLoading && (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Reasoning steps will appear here during agentic execution
                  </p>
                )}

                {isLoading && reasoning.length === 0 && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span>Initializing agent...</span>
                  </div>
                )}
              </div>
            </ScrollArea>
          </motion.div>
        )}

        {/* Toggle Reasoning Button (when hidden) */}
        {agenticMode && !showReasoning && (
          <Button
            variant="outline"
            size="sm"
            className="fixed right-4 top-20"
            onClick={() => setShowReasoning(true)}
          >
            <Brain className="h-4 w-4 mr-2" />
            Show Reasoning
          </Button>
        )}
      </div>
    </div>
  );
};

export default AgentChat;
