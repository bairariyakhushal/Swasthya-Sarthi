import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="  bg-[#1b4a1d] text-gray-200 mt-20 rounded-t-[32px] pt-8 md:pt-12">
      
      {/* Top White Card Section */}
      <div className="max-w-7xl mx-auto bg-gray-200 text-gray-800 rounded-3xl p-6 md:p-10 shadow-lg">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">

          {/* Company */}
          <div>
            <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4 text-gray-900">Company</h3>
            <ul className="space-y-2 text-sm md:text-base text-gray-600">
              <li><Link to="/about" className="hover:text-[#0F2B10] transition">About</Link></li>
              <li><Link to="/careers" className="hover:text-[#0F2B10] transition">Careers</Link></li>
              <li><Link to="/contact" className="hover:text-[#0F2B10] transition">Contact</Link></li>
            </ul>
          </div>


          {/* Support */}
          <div>
            <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4 text-gray-900">Support</h3>
            <ul className="space-y-2 text-sm md:text-base text-gray-600">
              <li><Link to="/help" className="hover:text-[#0F2B10] transition">Help Topics</Link></li>
              <li><Link to="/start" className="hover:text-[#0F2B10] transition">Getting Started</Link></li>
              <li><Link to="/report" className="hover:text-[#0F2B10] transition">Report Issue</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4 text-gray-900">Trust & Legal</h3>
            <ul className="space-y-2 text-sm md:text-base text-gray-600">
              <li><Link to="/terms" className="hover:text-[#0F2B10] transition">Terms & Conditions</Link></li>
              <li><Link to="/privacy" className="hover:text-[#0F2B10] transition">Privacy Notice</Link></li>
              <li><Link to="/cookies" className="hover:text-[#0F2B10] transition">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>

      </div>

      {/* Branding Box */}
      <div className="max-w-7xl mx-auto mt-6 md:mt-10 bg-[#A4E685] rounded-2xl md:rounded-3xl flex flex-col px-4 h-20">
        <img 
          src="/logo1.png" 
          alt="Swasthya Sarathi Logo" 
          className="h-20 object-contain"
        />
      </div>

      {/* Bottom Bar */}
      <div className="text-center text-gray-300 text-xs md:text-sm py-4 md:py-6 flex flex-col md:flex-row items-center justify-center md:justify-evenly gap-2 px-4">
        <p>© 2025 Swasthya Sarathi — Designed with ❤️</p>
        <p className="hidden md:block">Designed & Developed by Nilesh Rahangdale & Khushal Bairariya</p>
        <p className="md:hidden">Designed & Developed by NR & KB</p>
      </div>

    </footer>
  );
};

export default Footer;
