import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { Lock, Unlock, ExternalLink, Copy } from 'lucide-react';
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

function VisitorView() {
  const { shortId } = useParams();
  const navigate = useNavigate();
  const [link, setLink] = useState<ShortenedLink | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaying, setIsPaying] = useState(false);

  useEffect(() => {
    const links = JSON.parse(localStorage.getItem('links') || '[]');
    const foundLink = links.find((l: ShortenedLink) => l.shortId === shortId);
    
    if (foundLink) {
      setLink(foundLink);
      if (foundLink.paid) {
        window.location.href = foundLink.originalUrl;
      }
    }
    setIsLoading(false);
  }, [shortId]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const simulatePayment = () => {
    setIsPaying(true);
    // Simulate blockchain confirmation
    setTimeout(() => {
      const links = JSON.parse(localStorage.getItem('links') || '[]');
      const updatedLinks = links.map((l: ShortenedLink) =>
        l.shortId === shortId ? { ...l, paid: true } : l
      );
      localStorage.setItem('links', JSON.stringify(updatedLinks));
      
      setLink(prev => prev ? { ...prev, paid: true } : null);
      setIsPaying(false);
      toast.success('Payment confirmed! Redirecting...');
      
      // Redirect to original URL after payment
      setTimeout(() => {
        if (link?.originalUrl) {
          window.location.href = link.originalUrl;
        }
      }, 2000);
    }, 2000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!link) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl mb-4">Link not found</div>
          <button
            onClick={() => navigate('/')}
            className="text-blue-400 hover:text-blue-300"
          >
            Go back home
          </button>
        </div>
      </div>
    );
  }

  if (link.paid) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="bg-gray-800 rounded-lg p-8 max-w-md w-full text-center">
          <Unlock className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Link Unlocked!</h2>
          <p className="mb-6">Redirecting to your destination...</p>
          <a
            href={link.originalUrl}
            className="text-blue-400 hover:text-blue-300 flex items-center justify-center"
          >
            Click here if not redirected
            <ExternalLink className="w-4 h-4 ml-1" />
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
      <Toaster position="top-right" />
      
      <div className="bg-gray-800 rounded-lg p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <Lock className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Locked Content</h2>
          <p className="text-gray-400">
            Pay a small fee to access this link
          </p>
        </div>

        <div className="text-center mb-8">
          <p className="text-lg mb-2">Send exactly</p>
          <p className="text-3xl font-bold text-blue-500 mb-2">
            {link.price} BTC
          </p>
          <p className="text-sm text-gray-400 mb-4">
            to unlock this content
          </p>
          
          <div className="bg-white p-4 rounded-lg mb-4">
            <QRCodeSVG
              value={`bitcoin:${link.btcAddress}?amount=${link.price}`}
              size={200}
              className="mx-auto"
            />
          </div>
          
          <div className="mb-6">
            <p className="text-sm text-gray-400 mb-2">Bitcoin Address:</p>
            <div className="flex items-center justify-center space-x-2">
              <code className="text-xs bg-gray-700 p-2 rounded break-all">
                {link.btcAddress}
              </code>
              <button
                onClick={() => copyToClipboard(link.btcAddress)}
                className="p-1 hover:bg-gray-700 rounded"
                title="Copy address"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>

          <button
            onClick={simulatePayment}
            disabled={isPaying}
            className={`w-full py-2 px-4 rounded-lg transition-colors ${
              isPaying
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isPaying ? 'Processing Payment...' : 'Simulate Payment (Demo)'}
          </button>
        </div>

        <div className="text-center text-sm text-gray-400">
          <p>This is a demo implementation.</p>
          <p>In production, payment verification would be done via blockchain.</p>
        </div>
      </div>
    </div>
  );
}

export default VisitorView;