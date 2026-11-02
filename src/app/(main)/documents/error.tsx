'use client';

type ErrorPageProps = {
  reset: () => void;
};

export default function ErrorPage({ reset }: ErrorPageProps) {
  return (
    <main className="errorPage">
      <p className="eyebrow">SOMETHING WENT WRONG</p>
      <h1>We lost contact with this dimension.</h1>
      <p>The characters could not be loaded. Please try again.</p>
      <button type="button" className="retryButton" onClick={reset}>
        Try again
      </button>
    </main>
  );
}
