import './globals.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AppProviders from '../components/providers/AppProviders';

export const metadata = {
  title: 'Farm Fresh Dairy',
  description: 'Farm-to-table natural dairy products',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AppProviders>
          <Navbar />
          {children}
          <Footer />
        </AppProviders>
      </body>
    </html>
  );
}
