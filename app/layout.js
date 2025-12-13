import "./globals.css";

export const metadata = {
  title: "Amigo Secreto",
  description: "Sistema de sorteio de amigo secreto",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <head />
      <body>{children}</body>
    </html>
  );
}
