// All your TypeScript interfaces go here
export interface NomineeResult {
  name: string;
  votes: number;
}
export interface CategoryResult {
  category: string;
  nominees: NomineeResult[];
}
export interface CategoryInfo {
  id: string;
  title: string;
  nominees: { id: string; name: string; imageUrl?: string }[];
}
export interface DepartmentInfo {
  id: string;
  title: string;
  subcategories: SubCategoryInfo[];
}
export interface SubCategoryInfo {
    id: string;
    title: string;
    nominees: [];
}
export interface Nomination {
  _id: string;
  fullName: string;
  popularName?: string;
  category: string;
  imageUrl?: string;
}
export interface ModalState {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  confirmText: string;
}