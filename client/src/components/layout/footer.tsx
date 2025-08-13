import { Leaf, Facebook, Instagram, Twitter } from 'lucide-react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Leaf className="w-8 h-8 text-primary" />
              <span className="text-2xl font-bold">Veggies</span>
            </div>
            <p className="text-gray-400 mb-4">
              Fresh vegetables, perfectly cut, delivered to your doorstep.
            </p>
            <div className="flex space-x-4">
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-primary"
                data-testid="link-facebook"
              >
                <Facebook className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-primary"
                data-testid="link-instagram"
              >
                <Instagram className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-primary"
                data-testid="link-twitter"
              >
                <Twitter className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/catalog">
                  <Button
                    variant="ghost"
                    className="p-0 h-auto text-gray-400 hover:text-primary justify-start"
                    data-testid="footer-link-shop"
                  >
                    Shop Now
                  </Button>
                </Link>
              </li>
              <li>
                <Button
                  variant="ghost"
                  className="p-0 h-auto text-gray-400 hover:text-primary justify-start"
                  data-testid="footer-link-subscriptions"
                >
                  Subscriptions
                </Button>
              </li>
              <li>
                <Button
                  variant="ghost"
                  className="p-0 h-auto text-gray-400 hover:text-primary justify-start"
                  data-testid="footer-link-about"
                >
                  About Us
                </Button>
              </li>
              <li>
                <Button
                  variant="ghost"
                  className="p-0 h-auto text-gray-400 hover:text-primary justify-start"
                  data-testid="footer-link-contact"
                >
                  Contact
                </Button>
              </li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Customer Care</h3>
            <ul className="space-y-2">
              <li>
                <Button
                  variant="ghost"
                  className="p-0 h-auto text-gray-400 hover:text-primary justify-start"
                  data-testid="footer-link-help"
                >
                  Help Center
                </Button>
              </li>
              <li>
                <Button
                  variant="ghost"
                  className="p-0 h-auto text-gray-400 hover:text-primary justify-start"
                  data-testid="footer-link-track"
                >
                  Track Order
                </Button>
              </li>
              <li>
                <Button
                  variant="ghost"
                  className="p-0 h-auto text-gray-400 hover:text-primary justify-start"
                  data-testid="footer-link-returns"
                >
                  Returns
                </Button>
              </li>
              <li>
                <Button
                  variant="ghost"
                  className="p-0 h-auto text-gray-400 hover:text-primary justify-start"
                  data-testid="footer-link-faq"
                >
                  FAQs
                </Button>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Newsletter</h3>
            <p className="text-gray-400 mb-4">Get updates on new products and offers</p>
            <div className="flex">
              <Input
                type="email"
                placeholder="Your email"
                className="rounded-r-none bg-gray-800 border-gray-700 focus:border-primary"
                data-testid="input-newsletter-email"
              />
              <Button
                className="rounded-l-none bg-primary hover:bg-secondary"
                data-testid="button-newsletter-subscribe"
              >
                Subscribe
              </Button>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400">&copy; 2024 Veggies. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
