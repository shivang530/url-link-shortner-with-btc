import React, { useState, useEffect } from 'react';
import { Link, Lock, Unlock, Moon, Sun, ExternalLink, Copy } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

interface ShortenedLink {
  originalUrl: string;
  shortUrl: string;
  btcAddress: string;
  price: number;
  paid: boolean;
  created: number;
  shortId: string;
}

const DEMO_BTC_ADDRESS = 'tb1qw508d6qejxtdg4y5r3zarvary0c5xw7kxpjzsx';
const PRICE_PER_LINK = 0.0001;
const PREMIUM_PRICE = 0.001;

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : true;
  });
  const [url, setUrl] = useState('');
  const [isPremium, setIsPremium] = useState(false);
  const [customAlias, setCustomAlias] = useState('');
  const [links, setLinks] = useState<ShortenedLink[]>(() => {
    const saved = localStorage.getItem('links');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('links', JSON.stringify(links));
  }, [links]);

  const generateShortId = () => {
    return Math.random().toString(36).substring(2, 8);
  };

  const shortenUrl = async () => {
    if (!url) {
      toast.error('Please enter a URL');
      return;
    }

    try {
      // Add protocol if missing
      const formattedUrl = url.startsWith('http') ? url : `https://${url}`;
      const shortId = isPremium && customAlias ? customAlias : generateShortId();
      
      // Check if custom alias is already taken
      if (isPremium && customAlias) {
        const exists = links.some(link => link.shortId === customAlias);
        if (exists) {
          toast.error('This custom alias is already taken');
          return;
        }
      }

      const shortUrl = `${window.location.origin}/v/${shortId}`;
      
      const newLink: ShortenedLink = {
        originalUrl: formattedUrl,
        shortUrl,
        shortId,
        btcAddress: DEMO_BTC_ADDRESS,
        price: isPremium ? PREMIUM_PRICE : PRICE_PER_LINK,
        paid: false,
        created: Date.now(),
      };

      setLinks(prev => [newLink, ...prev]);
      setUrl('');
      setCustomAlias('');
      setIsPremium(false);
      
      // Copy the shortened URL to clipboard
      await navigator.clipboard.writeText(shortUrl);
      toast.success('URL shortened and copied to clipboard!');
    } catch {
      toast.error('Failed to shorten URL');
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const validateUrl = (input: string) => {
    if (!input) return true;
    try {
      new URL(input.startsWith('http') ? input : `https://${input}`);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <Toaster position="top-right" />
      
      <nav className="border-b dark:border-gray-700">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Link className="w-6 h-6" />
            <span className="text-xl font-bold">BitShorten</span>
          </div>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8">
            Secure Your Links with Bitcoin
          </h1>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg mb-8">
            <div className="mb-4">
              <input
                type="url"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  if (!validateUrl(e.target.value)) {
                    toast.error('Please enter a valid URL');
                  }
                }}
                placeholder="Enter your long URL (e.g., https://example.com)"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center mb-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPremium}
                  onChange={(e) => setIsPremium(e.target.checked)}
                  className="mr-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span>
                  Premium ({PREMIUM_PRICE} BTC) - Custom branded links
                </span>
              </label>
            </div>

            {isPremium && (
              <div className="mb-4">
                <input
                  type="text"
                  value={customAlias}
                  onChange={(e) => setCustomAlias(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  placeholder="Custom alias (e.g., my-brand)"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  pattern="[a-z0-9-]+"
                />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Only lowercase letters, numbers, and hyphens allowed
                </p>
              </div>
            )}

            <button
              onClick={shortenUrl}
              disabled={!validateUrl(url)}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              Shorten & Lock ({isPremium ? PREMIUM_PRICE : PRICE_PER_LINK} BTC)
            </button>
          </div>

          <div className="space-y-4">
            {links.map((link) => (
              <div
                key={link.shortUrl}
                className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    {link.paid ? (
                      <Unlock className="w-5 h-5 text-green-500" />
                    ) : (
                      <Lock className="w-5 h-5 text-red-500" />
                    )}
                    <span className="font-semibold">
                      {link.paid ? 'Unlocked' : 'Locked'}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(link.created).toLocaleDateString()}
                  </span>
                </div>

                <div className="mb-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-sm font-medium">Original URL:</span>
                    <a
                      href={link.originalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-600 flex items-center truncate"
                    >
                      {link.originalUrl}
                      <ExternalLink className="w-4 h-4 ml-1 flex-shrink-0" />
                    </a>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">Short URL:</span>
                    <a
                      href={link.shortUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-600"
                    >
                      {link.shortUrl}
                    </a>
                    <button
                      onClick={() => copyToClipboard(link.shortUrl)}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                      title="Copy to clipboard"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Price: {link.price} BTC
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;