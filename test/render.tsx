import { type RenderResult, render as rtlRender } from "@testing-library/react";
import userEvent, { type UserEvent } from "@testing-library/user-event";
import type { ReactElement } from "react";

/** Project render: RTL render plus a wired user-event session. */
export function render(ui: ReactElement): RenderResult & { user: UserEvent } {
  return { user: userEvent.setup(), ...rtlRender(ui) };
}
