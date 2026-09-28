import '../styles/globals.css';

export const metadata = {
  title: 'Bank Sampah',
  description: 'Aplikasi Manajemen Bank Sampah',
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>
        {children}
      </body>
    </html>
  );
}