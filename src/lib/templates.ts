export interface Template {
  id: string;
  title: string;
  category: "closet" | "pantry" | "laundry" | "garage";
  imageUrl: string;
}

export const CATEGORIES = ["All", "Closet", "Pantry", "Laundry", "Garage"] as const;

export const TEMPLATES: Template[] = [
  { id: "1", title: "Modern Walk-in Closet", category: "closet", imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=300&fit=crop" },
  { id: "2", title: "Minimalist Reach-in", category: "closet", imageUrl: "https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=400&h=300&fit=crop" },
  { id: "3", title: "Luxury Wardrobe", category: "closet", imageUrl: "https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?w=400&h=300&fit=crop" },
  { id: "4", title: "Organized Pantry", category: "pantry", imageUrl: "https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=400&h=300&fit=crop" },
  { id: "5", title: "Pull-out Pantry Shelves", category: "pantry", imageUrl: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop" },
  { id: "6", title: "Laundry Room Storage", category: "laundry", imageUrl: "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=400&h=300&fit=crop" },
  { id: "7", title: "Compact Laundry Nook", category: "laundry", imageUrl: "https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=400&h=300&fit=crop" },
  { id: "8", title: "Garage Wall System", category: "garage", imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=300&fit=crop" },
  { id: "9", title: "Garage Ceiling Storage", category: "garage", imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=300&fit=crop" },
];
