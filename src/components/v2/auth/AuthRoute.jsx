import { Suspense } from "react";
import AuthPage from "./AuthPage";

/**
 * The Suspense boundary the standalone auth routes need.
 *
 * `AuthPage` reads `?next=` with `useSearchParams`. The site is a static export
 * (`output: 'export'`), so that value only exists in the browser and Next
 * requires the boundary at build time rather than failing the page at runtime.
 * The fallback is the card at its own size so nothing shifts when it fills in.
 */
export default function AuthRoute({ mode }) {
  return (
    <Suspense fallback={<AuthCardSkeleton />}>
      <AuthPage mode={mode} />
    </Suspense>
  );
}

function AuthCardSkeleton() {
  return (
    <main className="mx-auto flex w-full max-w-[var(--v2-container)] flex-1 flex-col items-center px-4 py-14 md:px-8 md:py-20">
      <div className="w-full max-w-[460px]">
        <div
          aria-hidden="true"
          className="h-[520px] rounded-v2-4xl bg-white"
        />
      </div>
    </main>
  );
}
