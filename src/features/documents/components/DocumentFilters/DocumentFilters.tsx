import type { ChangeEvent } from 'react';

import { CATEGORY_LABELS } from '@/shared/constants/document';
import { DocumentCategory } from '@/shared/types/document';

import { DocSortOption } from '../../types/document-query';

import './DocumentFilters.css';

interface DocumentFiltersProps {
  searchQuery: string;
  selectedCategory: DocumentCategory | '';
  sortOption: DocSortOption;
  handleSearchQuery: (event: ChangeEvent<HTMLInputElement>) => void;
  handleSelectedCategory: (event: ChangeEvent<HTMLSelectElement>) => void;
  handleSortOption: (event: ChangeEvent<HTMLSelectElement>) => void;
}

export default function DocumentFilters(props: DocumentFiltersProps) {
  return (
    <section className="filter-block" data-testid="document-filters">
      <div className="filter-block__search">
        <label htmlFor="search">Search</label>

        <div className="filter-block__search-field">
          <svg viewBox="0 0 24 24" aria-hidden="true" className="filter-block__search-icon">
            <circle cx="11" cy="11" r="7" />
            <path d="m16 16 4 4" />
          </svg>

          <input
            id="search"
            type="search"
            data-testid="documents-search"
            value={props.searchQuery}
            onChange={props.handleSearchQuery}
            placeholder="Search documents..."
          />
        </div>
      </div>

      <div className="filter-block__field">
        <label htmlFor="category">Category</label>

        <select
          id="category"
          name="category"
          value={props.selectedCategory}
          onChange={props.handleSelectedCategory}
        >
          <option value="">Select category</option>

          {Object.values(DocumentCategory).map((category) => (
            <option key={category} value={category}>
              {CATEGORY_LABELS[category]}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-block__field">
        <label htmlFor="sort-by">Sort by</label>

        <select
          id="sort-by"
          name="sortBy"
          value={props.sortOption}
          onChange={props.handleSortOption}
        >
          <option value={DocSortOption.Newest}>Newest</option>
          <option value={DocSortOption.Oldest}>Oldest</option>
          <option value={DocSortOption.TitleAsc}>Title A-Z</option>
          <option value={DocSortOption.TitleDesc}>Title Z-A</option>
        </select>
      </div>
    </section>
  );
}
