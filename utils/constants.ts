import * as LucideIcons from "lucide-react";
import { LucideIcon } from "lucide-react";

export const CATEGORY_COLORS: Record<string, string> = {
    Food: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    Fuel: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    Rent: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    Shopping: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
    Travel: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    Medical: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    Entertainment: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
    Bills: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
    Education: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    Stationery: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400",
    EMI: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
    Investment: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    Misc: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
};

export const PRESET_COLORS = [
    "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    "bg-lime-100 text-lime-700 dark:bg-lime-900/30 dark:text-lime-400",
    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400",
    "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
    "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400",
    "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
    "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
    "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    "bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/30 dark:text-fuchsia-400",
    "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
    "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
    "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400",
    "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
    "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400",
];

// 1. Define Semantic Mappings (for default categories)
const SEMANTIC_MAPPINGS: Record<string, LucideIcon> = {
    Food: LucideIcons.Utensils,
    Fuel: LucideIcons.Fuel,
    Rent: LucideIcons.Home,
    Shopping: LucideIcons.ShoppingBag,
    Travel: LucideIcons.Plane,
    Medical: LucideIcons.Stethoscope,
    Entertainment: LucideIcons.Film,
    Bills: LucideIcons.Receipt,
    Education: LucideIcons.GraduationCap,
    Stationery: LucideIcons.PencilRuler,
    EMI: LucideIcons.Landmark,
    Investment: LucideIcons.TrendingUp,
    Misc: LucideIcons.MoreHorizontal,
};

// 2. Export a Unified Map
// This allows CATEGORY_ICONS['Food'] to work, AND CATEGORY_ICONS['Zap'] to work.
export const CATEGORY_ICONS: Record<string, LucideIcon> = {
    ...LucideIcons as unknown as Record<string, LucideIcon>,
    ...SEMANTIC_MAPPINGS,
};

// 3. Export List for Picker
// Filter out non-component exports from lucide-react
export const PRESET_ICONS = Object.keys(LucideIcons)
    .filter(key => key !== 'createLucideIcon' && key !== 'default' && key !== 'icons' && /^[A-Z]/.test(key))
    .sort()
    .map(name => ({
        name,
        icon: (LucideIcons as any)[name] as LucideIcon
    }));

export function getExpenseIcon(category: string, notes?: string): LucideIcon {
    return CATEGORY_ICONS[category] || CATEGORY_ICONS.Misc;
}
