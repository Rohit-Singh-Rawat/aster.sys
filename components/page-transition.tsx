/// <reference types="react/canary" />
import { type ReactNode, ViewTransition } from "react";

/**
 * Cross-route page transition (View Transitions API via React's
 * <ViewTransition>): the leaving page fades out fast, the arriving page
 * fades in with a slight rise — CSS in globals.css (.page-exit/.page-enter),
 * timed by the motion tokens. `default="none"` keeps unrelated transitions
 * from re-animating the page. No-ops in browsers without support.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <ViewTransition default="none" enter="page-enter" exit="page-exit">
      {children}
    </ViewTransition>
  );
}
