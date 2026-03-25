import { 
  Bell, 
  User, 
  Type, 
  Palette, 
  Image as ImageIcon, 
  CheckCircle, 
  Edit3, 
  Plus, 
  Upload, 
  ArrowRight, 
  Save,
  Layout,
  FileText,
  Sparkles,
  X,
  Loader2,
  RotateCcw,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import React, { useState } from 'react';
import { GoogleGenAI, Type as SchemaType } from "@google/genai";
import { Toaster, toast } from 'sonner';
import Markdown from 'react-markdown';

// --- Gemini Integration ---

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

// --- Components ---

const Sidebar = () => {
  const steps = [
    { id: 'structure', label: 'Estrutura', icon: Layout, active: false },
    { id: 'typography', label: 'Tipografia', icon: Type, active: true },
    { id: 'colors', label: 'Paleta de Cores', icon: Palette, active: false },
    { id: 'imagery', label: 'Imagens', icon: ImageIcon, active: false },
    { id: 'review', label: 'Revisão', icon: CheckCircle, active: false },
  ];

  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-64px)] w-64 bg-white border-r border-brand-medium/10 flex flex-col py-10 z-40">
      <div className="px-8 mb-12">
        <h2 className="text-[10px] uppercase tracking-[0.2em] text-brand-medium font-bold mb-1">Construtor de Sites</h2>
        <p className="text-xs text-brand-accent font-semibold">Passo 2 de 5</p>
      </div>
      
      <nav className="flex-1">
        <ul className="space-y-1">
          {steps.map((step) => (
            <li key={step.id}>
              <a 
                href="#" 
                className={`flex items-center gap-4 px-8 py-4 transition-all duration-300 group ${
                  step.active 
                    ? 'text-brand-accent font-bold border-l-4 border-brand-accent bg-brand-surface-low' 
                    : 'text-brand-medium hover:bg-brand-surface-low'
                }`}
              >
                <step.icon size={18} className={step.active ? 'text-brand-accent' : 'text-brand-medium group-hover:text-brand-dark'} />
                <span className="text-[11px] uppercase tracking-widest">{step.label}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-8">
        <button className="w-full bg-brand-medium text-white py-3 rounded-[4px] font-medium text-xs tracking-wider transition-all hover:bg-brand-dark active:scale-95">
          Salvar Progresso
        </button>
      </div>
    </aside>
  );
};

const Header = () => {
  return (
    <nav className="fixed top-0 w-full h-16 z-50 bg-brand-bg/80 backdrop-blur-md border-b border-brand-medium/5 flex justify-between items-center px-8">
      <div className="flex items-center gap-12">
        <span className="text-xl font-bold tracking-tighter text-brand-dark font-jura">The Silent Architect</span>
        <div className="hidden md:flex gap-8">
          {['Guia', 'Princípios', 'Biblioteca', 'Suporte'].map((item, i) => (
            <a 
              key={item}
              href="#" 
              className={`text-[11px] uppercase tracking-widest font-semibold transition-colors duration-200 ${
                i === 1 ? 'text-brand-accent border-b-2 border-brand-accent pb-1' : 'text-brand-medium hover:text-brand-dark'
              }`}
            >
              {item}
            </a>
          ))}
        </div>
      </div>
      
      <div className="flex items-center gap-6">
        <button className="p-2 text-brand-medium hover:bg-brand-surface transition-colors rounded-full relative">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-brand-accent rounded-full border-2 border-brand-bg"></span>
        </button>
        <div className="w-8 h-8 rounded-full bg-brand-surface overflow-hidden border border-brand-medium/10 cursor-pointer hover:opacity-80 transition-opacity">
          <img 
            src="https://picsum.photos/seed/architect/100/100" 
            alt="Perfil do Usuário" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
      </div>
    </nav>
  );
};

const StepCard = ({ step, title, children, icon: Icon, onSave }: any) => {
  return (
    <motion.section 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white p-10 rounded-[6px] shadow-sm border border-brand-medium/5 relative"
    >
      <div className="flex items-start justify-between mb-8">
        <div>
          <span className="text-[10px] uppercase tracking-[0.2em] text-brand-accent font-bold">Passo {step}</span>
          <h3 className="text-2xl font-bold mt-2 font-jura">{title}</h3>
        </div>
        {Icon && <Icon size={20} className="text-brand-light" />}
      </div>
      
      {children}
      
      <div className="mt-8 pt-8 border-t border-brand-medium/5 flex justify-end">
        <button 
          onClick={onSave}
          className="flex items-center gap-2 bg-brand-dark text-white px-6 py-2 rounded-[4px] font-medium text-[10px] uppercase tracking-widest hover:bg-brand-medium transition-colors"
        >
          <Save size={14} />
          Salvar Passo {step}
        </button>
      </div>
    </motion.section>
  );
};

export default function App() {
  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem('architect_form_data');
    return saved ? JSON.parse(saved) : {
      identity: '',
      structures: ''
    };
  });

  const [visualReferences, setVisualReferences] = useState<string[]>(() => {
    const saved = localStorage.getItem('architect_visual_references');
    return saved ? JSON.parse(saved) : [
      "https://picsum.photos/seed/arch1/600/450?grayscale",
      "https://picsum.photos/seed/arch2/600/450?grayscale"
    ];
  });

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<any>(() => {
    const saved = localStorage.getItem('architect_generated_result');
    return saved ? JSON.parse(saved) : null;
  });

  const [selectedColorIndex, setSelectedColorIndex] = useState<number | null>(null);
  const [tempColor, setTempColor] = useState('#0052FF');
  const [lightness, setLightness] = useState(50);
  const [pointerPos, setPointerPos] = useState({ x: 50, y: 20 }); // Percentage based
  const [isDragging, setIsDragging] = useState(false);
  const wheelRef = React.useRef<HTMLDivElement>(null);

  const handleAddColor = () => {
    setSelectedColorIndex(null);
  };

  const handleEditColor = (index: number) => {
    setSelectedColorIndex(index);
    const color = (generatedResult?.palette || [])[index];
    setTempColor(color);
  };

  const handleWheelInteraction = (e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
    if (!wheelRef.current) return;
    
    const rect = wheelRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    let clientX, clientY;
    if ('touches' in e && (e as TouchEvent).touches.length > 0) {
      clientX = (e as TouchEvent).touches[0].clientX;
      clientY = (e as TouchEvent).touches[0].clientY;
    } else {
      clientX = (e as MouseEvent).clientX;
      clientY = (e as MouseEvent).clientY;
    }
    
    const dx = clientX - centerX;
    const dy = clientY - centerY;
    
    // Calculate distance from center (0 to 1)
    const radius = rect.width / 2;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const normalizedDistance = Math.min(distance / radius, 1);
    
    // Calculate angle (0-360)
    let angle = Math.atan2(dy, dx) * (180 / Math.PI);
    angle = (angle + 90 + 360) % 360; 
    
    // Update pointer position (clamped to circle)
    const limitedDx = (dx / distance) * Math.min(distance, radius);
    const limitedDy = (dy / distance) * Math.min(distance, radius);
    
    const posX = 50 + (limitedDx / rect.width) * 100;
    const posY = 50 + (limitedDy / rect.height) * 100;
    
    setPointerPos({ x: posX, y: posY });
    
    // Convert to HSL
    const h = Math.round(angle);
    const s = Math.round(normalizedDistance * 100);
    
    const hex = hslToHex(h, s, lightness);
    setTempColor(hex);
  };

  const hslToHex = (h: number, s: number, l: number) => {
    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = (n: number) => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
  };

  const handleLightnessChange = (val: number) => {
    setLightness(val);
    // Re-calculate color with new lightness using current pointer pos
    if (wheelRef.current) {
      const rect = wheelRef.current.getBoundingClientRect();
      const dx = (pointerPos.x - 50) * (rect.width / 100);
      const dy = (pointerPos.y - 50) * (rect.height / 100);
      const radius = rect.width / 2;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const normalizedDistance = Math.min(distance / radius, 1);
      let angle = Math.atan2(dy, dx) * (180 / Math.PI);
      angle = (angle + 90 + 360) % 360;
      const h = Math.round(angle);
      const s = Math.round(normalizedDistance * 100);
      setTempColor(hslToHex(h, s, val));
    }
  };

  const setBlack = () => {
    setTempColor('#000000');
    setLightness(0);
    setPointerPos({ x: 50, y: 50 });
  };

  const setWhite = () => {
    setTempColor('#FFFFFF');
    setLightness(100);
    setPointerPos({ x: 50, y: 50 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    handleWheelInteraction(e);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    handleWheelInteraction(e);
  };

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        handleWheelInteraction(e);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isDragging) {
        handleWheelInteraction(e);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    const handleTouchEnd = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging]);

  const handleSubmitColor = () => {
    const currentPalette = [...(generatedResult?.palette || [])];
    
    if (selectedColorIndex !== null) {
      currentPalette[selectedColorIndex] = tempColor;
      setGeneratedResult((prev: any) => ({
        ...(prev || {}),
        palette: currentPalette
      }));
      toast.success("Cor atualizada!");
      setSelectedColorIndex(null);
    } else {
      setGeneratedResult((prev: any) => ({
        ...(prev || {}),
        palette: [...currentPalette, tempColor]
      }));
      toast.success("Cor adicionada à paleta!");
    }
  };

  const handleHexChange = (index: number, newHex: string) => {
    // Basic hex validation
    if (!/^#[0-9A-F]{0,6}$/i.test(newHex)) return;
    
    const currentPalette = [...(generatedResult?.palette || [])];
    currentPalette[index] = newHex;
    setGeneratedResult((prev: any) => ({
      ...(prev || {}),
      palette: currentPalette
    }));
  };

  const handleResetPalette = () => {
    setGeneratedResult((prev: any) => ({
      ...(prev || {}),
      palette: []
    }));
    setTempColor('#0052FF');
    setSelectedColorIndex(null);
    toast.success("Paleta resetada para o padrão");
  };

  React.useEffect(() => {
    localStorage.setItem('architect_form_data', JSON.stringify(formData));
  }, [formData]);

  React.useEffect(() => {
    if (generatedResult) {
      localStorage.setItem('architect_generated_result', JSON.stringify(generatedResult));
    }
  }, [generatedResult]);

  React.useEffect(() => {
    localStorage.setItem('architect_visual_references', JSON.stringify(visualReferences));
  }, [visualReferences]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = (step: string) => {
    console.log(`Saving step ${step}:`, formData);
    toast.success(`Passo ${step} salvo com sucesso!`, {
      description: "Seu rascunho de arquitetura foi atualizado.",
      duration: 3000,
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error("Por favor, selecione apenas imagens.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setVisualReferences(prev => [...prev, reader.result as string]);
        toast.success("Anexo adicionado!");
      };
      reader.readAsDataURL(file);
    }
  };

  const removeReference = (index: number) => {
    setVisualReferences(prev => prev.filter((_, i) => i !== index));
    toast.success("Referência removida");
  };

  const generateDesign = async () => {
    // Allow generation if they have at least identity OR a custom palette
    const hasPalette = generatedResult?.palette && generatedResult.palette.length > 0;
    
    if (!formData.identity && !hasPalette) {
      alert("Por favor, preencha a Identidade ou escolha algumas cores para começar a arquitetura.");
      return;
    }

    setIsGenerating(true);
    try {
      const currentPalette = generatedResult?.palette || [];
      
      const prompt = `Você é um especialista em design e comunicação digital.

Quando o usuário informar um tipo de negócio ou projeto web, gere um 
Guia de Estilo completo com as seguintes seções:

TOM DE VOZ
Como o texto do site deve soar (ex: amigável, sério, divertido)
2 exemplos de frases no estilo correto

PALETA DE CORES
4 cores com nome e código hexadecimal
Breve explicação do porquê de cada cor

TIPOGRAFIA
Uma fonte para títulos e uma para o corpo do texto
Ambas devem ser do Google Fonts (fonts.google.com)

COMPONENTES E LAYOUT
Estilo dos botões (arredondado, quadrado, com sombra…)
Como deve ser o cabeçalho (header) do site
Layout mais minimalista ou mais visual/cheio?

Responda em português, de forma organizada, usando os títulos acima.

Informações do Usuário:
Identidade: ${formData.identity || 'Não informado'}
Estruturas: ${formData.structures || 'Não informado'}
Paleta Atual: ${currentPalette.join(', ')}
`;

      const response = await genAI.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      const text = response.text || '';
      
      setGeneratedResult((prev: any) => ({
        ...(prev || {}),
        styleGuide: text,
      }));
      
      toast.success("Arquitetura gerada com sucesso!");
      
      // Scroll to result section
      setTimeout(() => {
        const resultSection = document.getElementById('result-section');
        if (resultSection) {
          resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } catch (error) {
      console.error("Error generating design:", error);
      alert("Falha ao gerar o design. Por favor, tente novamente.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg">
      <Toaster position="top-right" richColors />
      <Header />
      <Sidebar />
      
      <main className="ml-64 pt-24 pb-20 px-12">
        <div className="max-w-5xl mx-auto">
          
          {/* Hero Header */}
          <header className="mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-surface rounded-full mb-6">
              <span className="w-1.5 h-1.5 bg-brand-accent rounded-full"></span>
              <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-brand-medium">Fase de Design</span>
            </div>
            <h1 className="text-5xl font-bold tracking-tighter text-brand-dark mb-6 max-w-2xl font-jura leading-[1.1]">
              Definindo a Alma da sua Presença Digital.
            </h1>
            <p className="text-lg text-brand-medium max-w-xl leading-relaxed font-light">
              Uma grande arquitetura começa com intenção. Antes de selecionarmos os materiais, devemos entender o propósito do espaço que você está construindo.
            </p>
          </header>

          {/* Grid Content */}
          <div className="grid grid-cols-12 gap-8 mb-12">
            
            {/* Step 01 */}
            <div className="col-span-12 lg:col-span-7">
              <StepCard step="01" title="Manifesto & Intenção" icon={FileText} onSave={() => handleSave('01')}>
                <div className="space-y-8">
                  <div className="space-y-3">
                    <label className="text-[10px] uppercase tracking-widest text-brand-medium font-bold">Identidade e Propósito</label>
                    <textarea 
                      name="identity"
                      value={formData.identity}
                      onChange={handleInputChange}
                      className="w-full bg-brand-surface-low border-0 focus:ring-1 focus:ring-brand-accent p-5 min-h-[120px] rounded-[4px] transition-all placeholder:text-brand-light/50 text-sm font-light resize-none" 
                      placeholder="Defina quem você é e o que pretende alcançar..."
                    ></textarea>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] uppercase tracking-widest text-brand-medium font-bold">Estruturas</label>
                    <textarea 
                      name="structures"
                      value={formData.structures}
                      onChange={handleInputChange}
                      className="w-full bg-brand-surface-low border-0 focus:ring-1 focus:ring-brand-accent p-5 min-h-[120px] rounded-[4px] transition-all placeholder:text-brand-light/50 text-sm font-light resize-none" 
                      placeholder="Seções principais do site..."
                    ></textarea>
                  </div>
                </div>
              </StepCard>
            </div>

            {/* Step 02 */}
            <div className="col-span-12 lg:col-span-5">
              <StepCard step="02" title="Atmosfera Visual" onSave={() => handleSave('02')}>
                <div className="flex flex-col gap-8">
                  <div className="flex justify-between items-center mb-[-20px]">
                    <span className="text-[10px] uppercase tracking-widest text-brand-medium font-bold">Controle de Paleta</span>
                    <button 
                      onClick={handleResetPalette}
                      className="flex items-center gap-1.5 text-[9px] uppercase tracking-widest text-brand-medium hover:text-brand-accent transition-colors"
                    >
                      <RotateCcw size={12} />
                      Resetar Paleta
                    </button>
                  </div>
                  <div className="flex items-center justify-center p-8 bg-brand-surface-low rounded-[6px] border border-brand-medium/5 relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col gap-4">
                      <button 
                        onClick={setWhite}
                        className="w-8 h-8 rounded-full border border-brand-medium/20 bg-white shadow-sm hover:scale-110 transition-transform"
                        title="Branco Puro"
                      ></button>
                      <button 
                        onClick={setBlack}
                        className="w-8 h-8 rounded-full border border-brand-medium/20 bg-black shadow-sm hover:scale-110 transition-transform"
                        title="Preto Puro"
                      ></button>
                    </div>
                    
                    <div className="flex flex-col items-center gap-6">
                      <div className="relative w-40 h-40">
                        <div 
                          ref={wheelRef}
                          className="color-wheel w-full h-full shadow-xl cursor-crosshair rounded-full border-4 transition-colors relative overflow-hidden"
                          style={{ borderColor: tempColor }}
                          onMouseDown={handleMouseDown}
                          onTouchStart={handleTouchStart}
                        >
                          <div 
                            className="absolute w-5 h-5 bg-white rounded-full border-2 border-brand-dark shadow-lg pointer-events-none z-10"
                            style={{
                              left: `${pointerPos.x}%`,
                              top: `${pointerPos.y}%`,
                              transform: `translate(-50%, -50%)`
                            }}
                          >
                            <div className="w-full h-full rounded-full" style={{ backgroundColor: tempColor }}></div>
                          </div>
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <button 
                            className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform pointer-events-auto"
                            style={{ backgroundColor: tempColor }}
                          >
                            <Plus size={20} className={parseInt(tempColor.replace('#', ''), 16) > 0xffffff / 2 ? 'text-black' : 'text-white'} />
                          </button>
                        </div>
                      </div>

                      <div className="w-full max-w-[200px] space-y-2">
                        <div className="flex justify-between text-[8px] uppercase tracking-widest text-brand-medium font-bold">
                          <span>Luminosidade</span>
                          <span>{lightness}%</span>
                        </div>
                        <input 
                          type="range" 
                          min="0" 
                          max="100" 
                          value={lightness}
                          onChange={(e) => handleLightnessChange(parseInt(e.target.value))}
                          className="w-full h-1 bg-brand-surface rounded-lg appearance-none cursor-pointer accent-brand-accent"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-3">
                    {(generatedResult?.palette || []).map((color: string, i: number) => (
                      <div key={i} className="flex flex-col items-center gap-1.5">
                        <div 
                          className={`aspect-square w-full rounded-[4px] shadow-sm cursor-pointer hover:scale-105 transition-all ${selectedColorIndex === i ? 'ring-2 ring-brand-accent ring-offset-2' : ''}`} 
                          style={{ backgroundColor: color }}
                          onClick={() => handleEditColor(i)}
                        ></div>
                        <input 
                          type="text"
                          value={color}
                          onChange={(e) => handleHexChange(i, e.target.value)}
                          className="w-full text-[8px] font-mono text-brand-medium uppercase bg-transparent border-0 p-0 text-center focus:ring-0 focus:text-brand-accent"
                        />
                      </div>
                    ))}
                    <button 
                      onClick={handleAddColor}
                      className="aspect-square w-full rounded-[4px] border-2 border-dashed border-brand-medium/20 flex items-center justify-center hover:bg-brand-surface transition-colors"
                    >
                      <Plus size={18} className="text-brand-medium" />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-3">
                    <button 
                      onClick={handleSubmitColor}
                      className="w-full bg-brand-accent text-white py-4 rounded-[4px] font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-brand-accent/90 transition-colors shadow-lg shadow-brand-accent/20"
                    >
                      {selectedColorIndex !== null ? 'Atualizar Cor' : 'Adicionar à Paleta'}
                    </button>
                    
                    <button 
                      onClick={generateDesign}
                      disabled={isGenerating}
                      className="w-full bg-brand-dark text-white py-4 rounded-[4px] font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-brand-dark/90 transition-colors flex items-center justify-center gap-2"
                    >
                      {isGenerating ? (
                        <>
                          <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                          Arquitetando...
                        </>
                      ) : (
                        <>
                          <Zap size={14} />
                          Iniciar Fase de Arquitetura
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </StepCard>
            </div>

            {/* Step 03 */}
            <div className="col-span-12">
              <motion.section 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-brand-surface-low p-12 rounded-[6px] border border-brand-medium/5"
              >
                <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-8">
                  <div className="max-w-md">
                    <span className="text-[10px] uppercase tracking-[0.2em] text-brand-accent font-bold">Passo 03</span>
                    <h3 className="text-3xl font-bold mt-2 font-jura">Referências Visuais</h3>
                    <p className="text-brand-medium mt-3 text-sm font-light">Cure o clima e a estética do seu espaço. Faça upload de inspirações arquitetônicas, texturas ou visuais chave da marca.</p>
                  </div>
                  <button className="flex items-center gap-2 bg-brand-dark text-white px-8 py-3 rounded-[4px] font-medium text-xs uppercase tracking-widest hover:bg-brand-medium transition-colors">
                    <Upload size={16} />
                    Adicionar Referências
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Upload Placeholder */}
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="relative group cursor-pointer aspect-[4/3] bg-white rounded-[4px] flex flex-col items-center justify-center p-8 text-center border-2 border-dashed border-brand-medium/10 hover:border-brand-accent/30 transition-all"
                  >
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="image/*" 
                      onChange={handleFileUpload}
                    />
                    <ImageIcon size={40} className="text-brand-light mb-4 group-hover:text-brand-accent transition-colors" />
                    <h4 className="font-bold text-sm mb-1 font-jura">Adicionar Anexo</h4>
                    <p className="text-[9px] text-brand-medium uppercase tracking-widest">Painel de Inspiração</p>
                  </div>
                  
                  {/* Dynamic References */}
                  {visualReferences.map((src, index) => (
                    <div key={index} className="relative group aspect-[4/3] rounded-[4px] overflow-hidden bg-brand-medium/10">
                      <img 
                        src={src} 
                        alt={`Referência ${index + 1}`} 
                        className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity duration-500"
                        referrerPolicy="no-referrer"
                      />
                      <button 
                        onClick={() => removeReference(index)}
                        className="absolute top-4 right-4 p-2 bg-white/90 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={12} className="text-brand-dark" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="mt-10 pt-8 border-t border-brand-medium/5 flex justify-end">
                  <button 
                    onClick={() => handleSave('03')}
                    className="flex items-center gap-2 bg-brand-dark text-white px-6 py-2 rounded-[4px] font-medium text-[10px] uppercase tracking-widest hover:bg-brand-medium transition-colors"
                  >
                    <Save size={14} />
                    Salvar Passo 03
                  </button>
                </div>
              </motion.section>
            </div>
          </div>

          {/* Generated Result Section */}
          <AnimatePresence>
            {generatedResult?.styleGuide && (
              <motion.section 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 30 }}
                className="mb-12"
                id="result-section"
              >
                <div className="bg-white p-10 rounded-[6px] border border-brand-accent/20 shadow-2xl">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <Sparkles className="text-brand-accent" size={28} />
                      <h3 className="text-3xl font-bold font-jura uppercase tracking-tighter">Resultado</h3>
                    </div>
                    <button 
                      onClick={() => setGeneratedResult((prev: any) => ({ ...prev, styleGuide: null }))}
                      className="p-2 hover:bg-brand-surface rounded-full transition-colors text-brand-medium hover:text-brand-dark"
                      title="Fechar Resultado"
                    >
                      <X size={24} />
                    </button>
                  </div>
                  
                  <div className="bg-brand-surface-low p-8 rounded-[4px] border border-brand-medium/10 font-light leading-relaxed text-brand-dark max-h-[600px] overflow-y-auto shadow-inner custom-scrollbar">
                    <div className="markdown-body prose prose-slate max-w-none prose-headings:font-jura prose-headings:uppercase prose-headings:tracking-widest prose-headings:text-brand-dark prose-p:text-brand-medium prose-strong:text-brand-accent">
                      <Markdown>{generatedResult.styleGuide}</Markdown>
                    </div>
                  </div>
                </div>
              </motion.section>
            )}
          </AnimatePresence>

          {/* Final Action */}
          <section className="mt-20 pb-12">
            <motion.div 
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="bg-brand-dark p-1 rounded-[8px] bg-gradient-to-r from-brand-accent/20 via-white/5 to-brand-accent/20"
            >
              <button 
                onClick={generateDesign}
                disabled={isGenerating}
                className="w-full bg-brand-dark text-white py-16 rounded-[6px] flex flex-col items-center justify-center gap-6 group transition-all relative overflow-hidden disabled:opacity-80"
              >
                <div className="absolute inset-0 bg-brand-accent/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                {isGenerating ? (
                  <Loader2 size={48} className="text-brand-accent animate-spin mb-2" />
                ) : (
                  <Sparkles size={48} className="text-brand-accent animate-pulse mb-2" />
                )}
                <div className="z-10">
                  <h2 className="text-4xl font-bold tracking-tighter mb-3 font-jura">
                    {isGenerating ? 'Arquitetando...' : 'Gerar Website'}
                  </h2>
                  <p className="text-brand-light text-[10px] font-light uppercase tracking-[0.4em]">
                    {isGenerating ? 'Analisando sua visão e criando um rascunho' : 'Reúna toda a intenção de design e lance o rascunho'}
                  </p>
                </div>
                {!isGenerating && (
                  <div className="flex items-center gap-3 mt-4 px-8 py-3 bg-brand-accent rounded-full text-[10px] font-bold uppercase tracking-widest z-10 group-hover:gap-5 transition-all">
                    Iniciar Fase de Arquitetura
                    <ArrowRight size={14} />
                  </div>
                )}
              </button>
            </motion.div>
          </section>

          {/* Footer */}
          <footer className="mt-20 py-12 border-t border-brand-medium/10 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-[10px] tracking-widest text-brand-medium uppercase">© 2024 The Silent Architect. Guia Editorial.</p>
            <div className="flex gap-10">
              {['Privacidade', 'Termos', 'Acessibilidade'].map((link) => (
                <a key={link} href="#" className="text-[10px] uppercase tracking-widest text-brand-medium hover:text-brand-accent transition-colors">
                  {link}
                </a>
              ))}
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
}
