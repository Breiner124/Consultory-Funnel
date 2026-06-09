import "./globals.css";

export const metadata = {
  title: "Formulario de Aplicación — Consultoría E-commerce",
  description: "Aplica a la consultoría de e-commerce. Solo por aplicación.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&family=Sora:wght@600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans">
        <div className="glow" />
        {children}
      </body>
    </html>
  );
}
