import React from 'react';
import InstagramIcon from './icons/InstagramIcon';
import TwitterIcon from './icons/TwitterIcon';

const socialLinks = [
  {
    name: 'Twitter / X',
    href: 'https://x.com/ottakokun', // Replace with actual Ottako-kun Twitter
    icon: (props: React.SVGProps<SVGSVGElement>) => <TwitterIcon {...props} />,
  },
  {
    name: 'Reddit',
    href: 'https://www.reddit.com/r/OTTAKOKUN/',
    icon: (props: React.SVGProps<SVGSVGElement>) => (
       <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
           <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm-5.02 11.23c-.15.22-.19.49-.07.74.12.25.35.42.61.42h8.96c.26 0 .49-.17.61-.42.12-.25.08-.52-.07-.74-.15-.22-.39-.35-.65-.35H7.67c-.26 0-.5.13-.65.35zM7.5 9.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5.67-1.5 1.5-1.5zm9 0c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5.67-1.5 1.5-1.5z"/>
       </svg>
    ),
  },
  {
    name: 'Telegram',
    href: 'https://t.me/OTTAKOKUN', 
    icon: (props: React.SVGProps<SVGSVGElement>) => (
       <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
         <path d="M20.665 3.717l-17.73 6.837c-1.21.486-1.203 1.161-.222 1.462l4.552 1.42 10.532-6.645c.498-.303.953-.14.579.192l-8.533 7.701h-.002l-.002.001-.314 4.692c.46 0 .663-.211.921-.46l2.211-2.15 4.599 3.397c.848.467 1.457.227 1.668-.785l3.019-14.228c.309-1.239-.473-1.8-1.282-1.434z"/>
       </svg>
    ),
  }
];

const Footer: React.FC = () => {
  return (
    <footer className="bg-black border-t border-gray-900 mt-16 pb-8">
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col items-center justify-center">
          <h3 className="text-3xl font-black text-white mb-2 tracking-widest uppercase" style={{ fontFamily: '"Orbitron", sans-serif' }}>
             OTTAKO-KUN
          </h3>
          <p className="text-gray-600 text-sm mb-8 uppercase tracking-widest">Est. 2025</p>
          
          <div className="flex space-x-8 mb-10">
            {socialLinks.map((item) => (
              <a
                key={item.name}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-pink-500 transition-colors duration-300 transform hover:scale-110"
                aria-label={`Follow on ${item.name}`}
              >
                <span className="sr-only">{item.name}</span>
                <item.icon className="w-6 h-6" />
              </a>
            ))}
          </div>
          
          <div className="w-full max-w-xs h-px bg-gradient-to-r from-transparent via-gray-800 to-transparent mb-8"></div>

          <div className="flex flex-col md:flex-row items-center gap-4 text-xs text-gray-700 uppercase tracking-wider">
            <span>&copy; {new Date().getFullYear()} OTAKU-X.</span>
            <span className="hidden md:inline text-gray-800">|</span>
            <span>For mature audiences only</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;