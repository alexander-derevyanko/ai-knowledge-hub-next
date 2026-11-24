import { DocumentCategory, type Document } from '../types/document';

export const CATEGORY_LABELS: Record<Document['category'], string> = {
  [DocumentCategory.Architecture]: 'Architecture',
  [DocumentCategory.Development]: 'Development',
  [DocumentCategory.AI]: 'AI',
  [DocumentCategory.Product]: 'Product',
  [DocumentCategory.Business]: 'Business',
  [DocumentCategory.Security]: 'Security',
};
