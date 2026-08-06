"use client";

import { useState, useEffect, useRef } from "react";
import { TiptapEditor } from "@/components/admin/tiptap-editor";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TiltCard } from "@/components/tilt-card";
import { Save, Plus, Target, Compass, Zap, Flame, X, Edit2, Check } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";

type CardData = {
  id: string;
  x: number;
  y: number;
  rotate: number;
  title: string;
  subtitle: string;
  content: string;
  color: string;
  iconName: string;
};

const defaultCards: CardData[] = [
  {
    id: "card-1",
    x: 50,
    y: 50,
    rotate: -2,
    title: "The Anchor",
    subtitle: "6-Month Sprint",
    content: "1. Master Rust: Build actual projects.\n2. Scale Zamir: Deep work blocks.",
    color: "var(--ink)",
    iconName: "Target",
  },
  {
    id: "card-2",
    x: 450,
    y: 120,
    rotate: 3,
    title: "Daily Engine",
    subtitle: "8-10 Hours",
    content: "Morning: Mind, Body, French\nDeep 1: Rust Mastery\nDeep 2: Zamir Scaling\nLate Aft: Write/Tweet\nEvening: Heavy Iron",
    color: "#f59e0b",
    iconName: "Zap",
  },
  {
    id: "card-3",
    x: 100,
    y: 350,
    rotate: -4,
    title: "Basecamp",
    subtitle: "Geographical Strategy",
    content: "📍 Lagos\nOnike/Alagomeji: High networking.\nGbagada: Quiet coding spot.",
    color: "#10b981",
    iconName: "Compass",
  },
  {
    id: "card-4",
    x: 550,
    y: 400,
    rotate: 1,
    title: "The Long Game",
    subtitle: "Years 1-3",
    content: "Y1: Foundation. Zamir 1k users.\nY2: Expansion. Public Speaking.\nY3: Polymath. Law, Economics.",
    color: "#8b5cf6",
    iconName: "Flame",
  },
];

const defaultBlueprintHTML = `
  <h1>The Unilag Titan Blueprint</h1>
  <p>Your preamble and overarching strategy goes here...</p>
`;

export default function VisionBoardPage() {
  const [boardId, setBoardId] = useState<string | null>(null);
  const [content, setContent] = useState<string>("");
  const [cards, setCards] = useState<CardData[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchBoard = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
         // Fallback to defaults if not logged in
         setContent(defaultBlueprintHTML);
         setCards(defaultCards);
         setIsMounted(true);
         return;
      }
      
      const { data, error } = await supabase
        .from('vision_board')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle(); // Use maybeSingle to avoid error if no row exists
        
      if (data) {
        setBoardId(data.id);
        setContent(data.intro_html || defaultBlueprintHTML);
        setCards(data.cards ? data.cards : defaultCards);
      } else {
        setContent(defaultBlueprintHTML);
        setCards(defaultCards);
      }
      setIsMounted(true);
    };
    
    fetchBoard();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("You must be logged in to save.");
        setIsSaving(false);
        return;
      }
      
      if (boardId) {
        const { error } = await supabase.from('vision_board').update({
          intro_html: content,
          cards: cards,
          updated_at: new Date().toISOString()
        }).eq('id', boardId);
        
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from('vision_board').insert({
          user_id: user.id,
          intro_html: content,
          cards: cards
        }).select().single();
        
        if (error) throw error;
        if (data) setBoardId(data.id);
      }
      
      toast.success("Vision board synced!", {
        description: "Your life blueprint and visual canvas have been securely saved to Supabase.",
      });
    } catch (e: any) {
      console.error(e);
      toast.error("Failed to save", {
        description: e.message || "An error occurred while saving.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDragEnd = (id: string, info: any) => {
    setCards(prev => prev.map(c => {
      if (c.id === id) {
        return { ...c, x: c.x + info.offset.x, y: c.y + info.offset.y };
      }
      return c;
    }));
  };

  const addCard = () => {
    const newCard: CardData = {
      id: `card-${Date.now()}`,
      x: 200,
      y: 200,
      rotate: (Math.random() - 0.5) * 10,
      title: "New Goal",
      subtitle: "Focus Area",
      content: "Write your goal details here...",
      color: "var(--ink)",
      iconName: "Target",
    };
    setCards([...cards, newCard]);
    setEditingCardId(newCard.id);
  };

  const updateCard = (id: string, updates: Partial<CardData>) => {
    setCards(prev => prev.map(c => (c.id === id ? { ...c, ...updates } : c)));
  };

  const deleteCard = (id: string) => {
    setCards(prev => prev.filter(c => c.id !== id));
  };

  const renderIcon = (name: string, color: string) => {
    const props = { className: "w-5 h-5" };
    switch (name) {
      case "Zap": return <Zap {...props} />;
      case "Compass": return <Compass {...props} />;
      case "Flame": return <Flame {...props} />;
      case "Target":
      default:
        return <Target {...props} />;
    }
  };

  if (!isMounted) return null;

  return (
    <div className="v3-container max-w-6xl mx-auto py-12 v3-page-enter">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-[var(--rule)] pb-8">
        <div className="space-y-4">
          <div className="v3-eyebrow">
            <span className="dot"></span>
            <b>Living Strategy</b>
          </div>
          <h1 className="text-5xl md:text-7xl fvs-display tracking-tight text-[var(--ink)] m-0 leading-[0.9]">
            The Titan <em className="text-[var(--v3-accent)]">Vision</em>
          </h1>
          <p className="text-[var(--ink-2)] text-lg max-w-xl leading-relaxed font-sans">
            Your ultimate execution manual. Time is your most valuable asset—protect your deep work blocks, scale Zamir, and master Rust.
          </p>
        </div>
        
        <button 
          onClick={handleSave} 
          disabled={isSaving} 
          className="v3-btn v3-btn-primary self-start md:self-end"
        >
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? "Saving..." : "Save to Cloud"}
        </button>
      </div>

      <Tabs defaultValue="visual" className="w-full">
        <div className="flex items-center justify-between mb-8">
          <TabsList className="bg-[var(--bg-2)] p-1 border border-[var(--rule)]">
            <TabsTrigger 
              value="visual" 
              className="font-sans data-[state=active]:bg-[var(--paper)] data-[state=active]:text-[var(--ink)] data-[state=active]:shadow-sm"
            >
              Visual Canvas
            </TabsTrigger>
            <TabsTrigger 
              value="text"
              className="font-sans data-[state=active]:bg-[var(--paper)] data-[state=active]:text-[var(--ink)] data-[state=active]:shadow-sm"
            >
              Text Blueprint
            </TabsTrigger>
          </TabsList>
        </div>

        {/* --- VISUAL CANVAS TAB --- */}
        <TabsContent value="visual" className="mt-0 outline-none">
          <div className="mb-4 flex justify-end">
             <button onClick={addCard} className="v3-btn v3-btn-sm v3-btn-ghost">
                <Plus className="w-4 h-4 mr-1.5" />
                Add Goal Card
             </button>
          </div>
          
          <div className="w-full overflow-x-auto rounded-2xl border border-[var(--rule)] bg-[var(--bg-2)] custom-scrollbar">
            <div 
              ref={canvasRef} 
              className="w-[1200px] lg:w-full h-[75vh] min-h-[600px] relative overflow-hidden"
              style={{
                backgroundImage: 'radial-gradient(var(--rule) 1px, transparent 1px)',
                backgroundSize: '40px 40px',
                backgroundPosition: '-19px -19px'
              }}
            >
              {cards.map(card => {
                const isEditing = editingCardId === card.id;

                return (
                  <motion.div 
                    key={card.id}
                    drag={!isEditing}
                    dragConstraints={canvasRef}
                    dragElastic={0.2}
                    dragMomentum={false}
                    initial={{ x: card.x, y: card.y, rotate: card.rotate }}
                    onDragEnd={(e, info) => handleDragEnd(card.id, info)}
                    whileDrag={{ scale: 1.05, cursor: "grabbing", zIndex: 50 }}
                    className={`absolute z-10 ${isEditing ? '' : 'cursor-grab'}`}
                    style={{ touchAction: 'none' }}
                  >
                  <TiltCard intensity={isEditing ? 0 : 25}>
                    <div className="w-80 h-auto bg-[var(--paper)] p-6 rounded-xl border border-[var(--rule)] shadow-2xl flex flex-col gap-4 relative group">
                      
                      {!isEditing && (
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                          <button onClick={() => setEditingCardId(card.id)} className="p-1.5 bg-[var(--bg)] border border-[var(--rule)] rounded-md text-[var(--ink-2)] hover:text-[var(--ink)]">
                             <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => deleteCard(card.id)} className="p-1.5 bg-[var(--bg)] border border-[var(--rule)] rounded-md text-red-500 hover:bg-red-500/10">
                             <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}

                      <div className="flex items-center gap-3 border-b border-[var(--rule)] pb-4">
                        <div 
                           className="w-10 h-10 rounded-full flex items-center justify-center text-white flex-shrink-0"
                           style={{ backgroundColor: card.color === 'var(--ink)' ? '#333' : card.color }}
                        >
                          {renderIcon(card.iconName, card.color)}
                        </div>
                        
                        <div className="flex-1">
                          {isEditing ? (
                            <input 
                              type="text" 
                              value={card.title}
                              onChange={e => updateCard(card.id, { title: e.target.value })}
                              className="w-full bg-[var(--bg)] border border-[var(--rule)] rounded px-2 py-1 text-sm mb-1 text-[var(--ink)] outline-none"
                            />
                          ) : (
                            <h3 className="v3-serif text-xl leading-none m-0 text-[var(--ink)]">{card.title}</h3>
                          )}

                          {isEditing ? (
                            <input 
                              type="text" 
                              value={card.subtitle}
                              onChange={e => updateCard(card.id, { subtitle: e.target.value })}
                              className="w-full bg-[var(--bg)] border border-[var(--rule)] rounded px-2 py-1 text-[9px] text-[var(--ink)] outline-none"
                            />
                          ) : (
                            <span className="v3-eyebrow text-[9px] block mt-1">{card.subtitle}</span>
                          )}
                        </div>
                      </div>

                      <div className="font-sans text-sm text-[var(--ink-2)]">
                        {isEditing ? (
                          <textarea 
                            value={card.content}
                            onChange={e => updateCard(card.id, { content: e.target.value })}
                            className="w-full bg-[var(--bg)] border border-[var(--rule)] rounded p-2 text-sm text-[var(--ink)] outline-none min-h-[100px] resize-none"
                          />
                        ) : (
                          <div className="whitespace-pre-wrap">{card.content}</div>
                        )}
                      </div>

                      {isEditing && (
                         <div className="flex justify-between items-center pt-2 border-t border-[var(--rule)] mt-2">
                           <div className="flex gap-2">
                              {['var(--ink)', '#f59e0b', '#10b981', '#8b5cf6', '#ef4444', '#3b82f6'].map(color => (
                                 <button 
                                    key={color}
                                    onClick={() => updateCard(card.id, { color })}
                                    className={`w-5 h-5 rounded-full border-2 ${card.color === color ? 'border-[var(--ink)]' : 'border-transparent'}`}
                                    style={{ backgroundColor: color === 'var(--ink)' ? '#333' : color }}
                                 />
                              ))}
                           </div>
                           <button onClick={() => setEditingCardId(null)} className="v3-btn v3-btn-primary py-1.5 px-3 text-xs">
                             <Check className="w-3.5 h-3.5 mr-1" /> Done
                           </button>
                         </div>
                      )}

                    </div>
                  </TiltCard>
                </motion.div>
              );
            })}
            </div>
          </div>
          <p className="text-center text-[var(--ink-3)] text-xs mt-4 font-sans">
            Drag cards to arrange. Hover over a card and click the edit icon to customize it. Remember to save to the cloud!
          </p>
        </TabsContent>

        {/* --- TEXT BLUEPRINT TAB (HYBRID) --- */}
        <TabsContent value="text" className="mt-0 outline-none">
          <div className="bg-[var(--bg)] rounded-2xl overflow-hidden shadow-sm border border-[var(--rule)] mb-12">
            <div className="p-6 border-b border-[var(--rule)] bg-[var(--paper)]">
               <h2 className="v3-serif text-3xl text-[var(--ink)] m-0">Strategy Preamble</h2>
               <p className="text-[var(--ink-3)] text-sm mt-2 font-sans">Use this free-form space to write out your long-form thoughts, principles, and daily routines.</p>
            </div>
            <TiptapEditor 
              content={content} 
              onChange={(html) => setContent(html)} 
            />
          </div>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-[var(--rule)] pb-4">
              <div>
                 <h2 className="v3-serif text-3xl text-[var(--ink)] m-0">Structured Goals</h2>
                 <p className="text-[var(--ink-3)] text-sm mt-2 font-sans">Changes made here instantly sync with the 3D cards on your Visual Canvas.</p>
              </div>
              <button onClick={addCard} className="v3-btn v3-btn-sm v3-btn-ghost flex-shrink-0">
                <Plus className="w-4 h-4 mr-1.5" />
                Add Goal
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {cards.map(card => (
                 <div key={card.id} className="bg-[var(--paper)] rounded-xl border border-[var(--rule)] p-6 shadow-sm flex flex-col gap-6 transition-all hover:border-[var(--v3-accent-soft)]">
                   <div className="flex-1 space-y-4">
                      <input 
                        className="w-full bg-transparent border-b border-[var(--rule)] pb-2 text-2xl v3-serif text-[var(--ink)] outline-none focus:border-[var(--v3-accent)] transition-colors"
                        value={card.title}
                        onChange={e => updateCard(card.id, { title: e.target.value })}
                        placeholder="Goal Title"
                      />
                      <input 
                        className="w-full bg-transparent text-sm v3-eyebrow text-[var(--ink-2)] outline-none"
                        value={card.subtitle}
                        onChange={e => updateCard(card.id, { subtitle: e.target.value })}
                        placeholder="Subtitle (e.g. 6-Month Sprint)"
                      />
                      <textarea
                        className="w-full bg-[var(--bg)] border border-[var(--rule)] rounded-md p-4 text-sm text-[var(--ink)] outline-none min-h-[140px] resize-y mt-2 font-sans leading-relaxed"
                        value={card.content}
                        onChange={e => updateCard(card.id, { content: e.target.value })}
                        placeholder="Goal details..."
                      />
                   </div>
                   
                   <div className="flex flex-wrap items-end justify-between gap-4 border-t border-[var(--rule)] pt-4">
                      <div className="flex gap-4">
                         <div>
                            <div className="text-xs v3-eyebrow text-[var(--ink-3)] mb-2">Color</div>
                            <div className="flex gap-1">
                               {['var(--ink)', '#f59e0b', '#10b981', '#8b5cf6', '#ef4444', '#3b82f6'].map(color => (
                                  <button 
                                     key={color}
                                     onClick={() => updateCard(card.id, { color })}
                                     className={`w-6 h-6 rounded-full border-2 ${card.color === color ? 'border-[var(--ink)]' : 'border-transparent'}`}
                                     style={{ backgroundColor: color === 'var(--ink)' ? '#333' : color }}
                                  />
                               ))}
                            </div>
                         </div>
                         <div>
                            <div className="text-xs v3-eyebrow text-[var(--ink-3)] mb-2">Icon</div>
                            <select 
                              className="bg-[var(--bg)] border border-[var(--rule)] rounded-md py-1 px-2 text-xs text-[var(--ink)] outline-none font-sans"
                              value={card.iconName}
                              onChange={e => updateCard(card.id, { iconName: e.target.value })}
                            >
                               <option value="Target">Target</option>
                               <option value="Zap">Lightning</option>
                               <option value="Compass">Compass</option>
                               <option value="Flame">Flame</option>
                            </select>
                         </div>
                      </div>
                      
                      <button onClick={() => deleteCard(card.id)} className="text-red-500 text-xs font-sans font-medium hover:underline flex items-center bg-red-500/10 py-1.5 px-3 rounded-md">
                         <X className="w-3 h-3 mr-1" /> Remove
                      </button>
                   </div>
                 </div>
               ))}
            </div>
          </div>
        </TabsContent>
        
      </Tabs>
    </div>
  );
}
