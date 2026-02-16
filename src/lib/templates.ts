export interface Template {
  id: string;
  title: string;
  category: "closet" | "pantry" | "laundry" | "garage" | "more";
  imageUrl: string;
}

export const CATEGORIES = ["All", "Closet", "Pantry", "Laundry", "Garage", "More Spaces"] as const;

export const TEMPLATES: Template[] = [
  // Closet
  { id: "1", title: "Modern Walk-in Closet", category: "closet", imageUrl: "https://images.unsplash.com/photo-1649361811423-a55616f7ab11?w=400&h=300&fit=crop" },
  { id: "2", title: "Minimalist Reach-in", category: "closet", imageUrl: "https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=400&h=300&fit=crop" },
  { id: "3", title: "Luxury Wardrobe", category: "closet", imageUrl: "https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?w=400&h=300&fit=crop" },
  { id: "10", title: "His & Hers Walk-in", category: "closet", imageUrl: "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=400&h=300&fit=crop" },
  { id: "11", title: "Kids' Reach-in Closet", category: "closet", imageUrl: "https://images.unsplash.com/photo-1616486029423-aaa4789e8c9a?w=400&h=300&fit=crop" },
  { id: "12", title: "Boutique-Style Closet", category: "closet", imageUrl: "https://images.unsplash.com/photo-1614631446501-abcf76949eca?w=400&h=300&fit=crop" },

  // Pantry
  { id: "4", title: "Organized Pantry", category: "pantry", imageUrl: "https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=400&h=300&fit=crop" },
  { id: "5", title: "Pull-out Pantry Shelves", category: "pantry", imageUrl: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop" },
  { id: "13", title: "Butler's Pantry", category: "pantry", imageUrl: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop" },

  // Laundry
  { id: "6", title: "Laundry Room Storage", category: "laundry", imageUrl: "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=400&h=300&fit=crop" },
  { id: "7", title: "Compact Laundry Nook", category: "laundry", imageUrl: "https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=400&h=300&fit=crop" },
  { id: "14", title: "Laundry + Mudroom Combo", category: "laundry", imageUrl: "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=400&h=300&fit=crop" },

  // Garage
  { id: "8", title: "Garage Wall System", category: "garage", imageUrl: "https://images.unsplash.com/photo-1635108198322-18c814f9b70f?w=400&h=300&fit=crop" },
  { id: "9", title: "Garage Ceiling Storage", category: "garage", imageUrl: "https://images.unsplash.com/photo-1635108198165-1773945e506e?w=400&h=300&fit=crop" },
  { id: "15", title: "Workshop Garage", category: "garage", imageUrl: "https://images.unsplash.com/photo-1635108198395-82a67cd5eaec?w=400&h=300&fit=crop" },

  // More Spaces
  { id: "16", title: "Mudroom Entryway", category: "more", imageUrl: "https://images.unsplash.com/photo-1616486029423-aaa4789e8c9a?w=400&h=300&fit=crop" },
  { id: "17", title: "Home Office Storage", category: "more", imageUrl: "https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=400&h=300&fit=crop" },
  { id: "18", title: "Craft Room Organizer", category: "more", imageUrl: "https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?w=400&h=300&fit=crop" },
];
