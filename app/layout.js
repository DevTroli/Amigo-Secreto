import "./globals.css";

export const metadata = {
  title: "Amigo Secreto",
  description: "Sistema de sorteio de amigo secreto",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <head>
        <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
      </head>
      <body>{children}</body>
    </html>
  );
}
