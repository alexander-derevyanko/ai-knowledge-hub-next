import './DocumentsSkeleton.css';

const SKELETON_ITEMS = Array.from({ length: 5 }, (_, index) => index);

export default function DocumentsSkeleton() {
  return (
    <div className="documents documents-skeleton" aria-busy="true" aria-label="Loading documents">
      <header className="documents__header">
        <div className="skeleton skeleton__title" />
        <div className="skeleton skeleton__description" />
      </header>

      <div className="documents__toolbar">
        <div className="skeleton skeleton__button" />
      </div>

      <section className="filter-block">
        <div className="filter-block__search">
          <div className="skeleton skeleton__label" />
          <div className="skeleton skeleton__input" />
        </div>

        <div className="filter-block__field">
          <div className="skeleton skeleton__label" />
          <div className="skeleton skeleton__select" />
        </div>

        <div className="filter-block__field">
          <div className="skeleton skeleton__label" />
          <div className="skeleton skeleton__select" />
        </div>
      </section>

      <section className="document-list">
        <div className="document-list__toolbar">
          <div className="skeleton skeleton__count" />
          <div className="skeleton skeleton__hint" />
        </div>

        <div className="document-list__items">
          {SKELETON_ITEMS.map((item) => (
            <div className="document-skeleton-card" key={item}>
              <div className="document-skeleton-card__icon skeleton" />

              <div className="document-skeleton-card__content">
                <div className="skeleton document-skeleton-card__title" />

                <div className="document-skeleton-card__meta">
                  <div className="skeleton document-skeleton-card__tag" />
                  <div className="skeleton document-skeleton-card__text" />
                  <div className="skeleton document-skeleton-card__text document-skeleton-card__text--short" />
                </div>
              </div>

              <div className="skeleton document-skeleton-card__status" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
