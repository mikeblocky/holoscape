import { fontFamily } from 'tailwindcss/defaultTheme';

/***********************************************
 * Tailwind configuration keeps tokens scoped
 * to the new React surface.
 ***********************************************/
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        heading: ['MS Sans Serif', 'Tahoma', 'Segoe UI', ...fontFamily.sans],
        sans: ['MS Sans Serif', 'Tahoma', 'Segoe UI', ...fontFamily.sans]
      }
    }
  }
};
