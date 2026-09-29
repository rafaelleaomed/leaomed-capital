import './globals.css';
import { Plus_Jakarta_Sans, Outfit } from 'next/font/google';
import { ThemeProvider } from '@/components/ThemeProvider';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

export const metadata = {
  title: 'LeãoMed Capital | Gestão PJ & PF',
  description: 'Controle financeiro médico automatizado, conciliação e otimização de patrimônio com IA',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${plusJakarta.variable} ${outfit.variable} light`}>
      <body className="bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 min-h-screen font-sans antialiased selection:bg-emerald-500 selection:text-white transition-colors duration-200">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
