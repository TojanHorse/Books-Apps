import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Explore from './pages/Explore';
import Book from './pages/Book';
import MyLibrary from './pages/MyLibrary';
import Chat from './pages/Chat';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-warm-50 flex flex-col">
          <Header />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/book/:id" element={<Book />} />
              <Route path="/library" element={<MyLibrary />} />
              <Route path="/chat" element={<Chat />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;