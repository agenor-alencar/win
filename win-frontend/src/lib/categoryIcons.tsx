import {
  Wrench,
  Zap,
  Sparkles,
  Package,
  Car,
  Hammer,
  Paintbrush,
  Home,
  Lightbulb,
  Wrench as WrenchTool,
  HardHat,
  Bolt,
  Plug,
  Scissors,
  Package2 as Boxes,
  ShoppingBag,
  Factory,
  Settings,
  type LucideIcon,
} from "lucide-react";

// Mapa de nomes de ícones para componentes Lucide
export const iconMap: Record<string, LucideIcon> = {
  wrench: Wrench,
  zap: Zap,
  sparkles: Sparkles,
  package: Package,
  car: Car,
  hammer: Hammer,
  paintbrush: Paintbrush,
  home: Home,
  lightbulb: Lightbulb,
  tool: WrenchTool,
  hardhat: HardHat,
  bolt: Bolt,
  plug: Plug,
  scissors: Scissors,
  boxes: Boxes,
  shoppingbag: ShoppingBag,
  factory: Factory,
  settings: Settings,
};

// Lista de ícones disponíveis para o dropdown do admin
export const availableIcons = [
  { value: "wrench", label: "Chave (Ferragens)", icon: Wrench },
  { value: "zap", label: "Raio (Elétricos)", icon: Zap },
  { value: "sparkles", label: "Brilho (Limpeza)", icon: Sparkles },
  { value: "package", label: "Pacote (Embalagens)", icon: Package },
  { value: "car", label: "Carro (Autopeças)", icon: Car },
  { value: "hammer", label: "Martelo (Ferramentas)", icon: Hammer },
  { value: "paintbrush", label: "Pincel (Tintas)", icon: Paintbrush },
  { value: "home", label: "Casa (Construção)", icon: Home },
  { value: "lightbulb", label: "Lâmpada (Iluminação)", icon: Lightbulb },
  { value: "tool", label: "Ferramenta", icon: WrenchTool },
  { value: "hardhat", label: "Capacete (Segurança)", icon: HardHat },
  { value: "bolt", label: "Parafuso", icon: Bolt },
  { value: "plug", label: "Tomada", icon: Plug },
  { value: "scissors", label: "Tesoura", icon: Scissors },
  { value: "boxes", label: "Caixas", icon: Boxes },
  { value: "shoppingbag", label: "Sacola", icon: ShoppingBag },
  { value: "factory", label: "Fábrica (Industrial)", icon: Factory },
  { value: "settings", label: "Engrenagem (Peças)", icon: Settings },
];

interface CategoryIconProps {
  iconName?: string;
  className?: string;
  fallback?: LucideIcon;
}

/**
 * Componente que renderiza o ícone da categoria dinamicamente
 */
export const CategoryIcon: React.FC<CategoryIconProps> = ({ 
  iconName, 
  className = "h-5 w-5",
  fallback: FallbackIcon = Package 
}) => {
  const IconComponent = iconName ? iconMap[iconName.toLowerCase()] : null;
  const Icon = IconComponent || FallbackIcon;
  
  return <Icon className={className} />;
};
