// Real styles for the browser lane: Vite runs this import through the
// repo's PostCSS config (@tailwindcss/postcss), so Tailwind utilities,
// tokens, and the squircle/round custom utilities all apply. Without it
// the control would have no height and pointer coordinates would be lies.
import "@/app/globals.css";
