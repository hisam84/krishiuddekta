import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <div className="ku-footer-wrapper">
      <footer className="ku-footer">
        <div className="ku-footer-container">
          {/* Column 1: Brand */}
          <div className="ku-brand">
            <h2 className="ku-brand-text">Krishi Uddekta</h2>
            <p className="ku-desc">
              আমরা একজন কৃষি উদ্যোক্তা হিসেবে বাংলাদেশের কৃষকদের উন্নয়নে কাজ
              করছি। উন্নত মানের কৃষি উপকরণ, পরামর্শ এবং প্রযুক্তি সেবা প্রদান
              করে কৃষকদের সহায়তা করা আমাদের লক্ষ্য।
            </p>
            <h3 className="ku-social-title">Social Links</h3>
            <div className="ku-social-icons">
              <a href="#" aria-label="Facebook">
                <i className="fab fa-facebook-f" />
              </a>
              <a href="#" aria-label="YouTube">
                <i className="fab fa-youtube" />
              </a>
              <a href="#" aria-label="TikTok">
                <i className="fab fa-tiktok" />
              </a>
              <a href="#" aria-label="WhatsApp">
                <i className="fab fa-whatsapp" />
              </a>
            </div>
          </div>

          {/* Column 2: Company */}
          <div className="ku-company">
            <h3 className="ku-col-title">Company</h3>
            <ul className="ku-links">
              <li>
                <Link href="/about">
                  <i className="fas fa-chevron-right" /> About Us
                </Link>
              </li>
              <li>
                <Link href="/pages/refund-policy">
                  <i className="fas fa-chevron-right" /> রিফান্ড পলিসি
                </Link>
              </li>
              <li>
                <Link href="/pages/delivery-charge">
                  <i className="fas fa-chevron-right" /> ডেলিভারি চার্জ
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact */}
          <div className="ku-contact">
            <h3 className="ku-col-title">Contact Us</h3>
            <ul className="ku-contact-info">
              <li>
                <i className="fas fa-phone-alt" /> <span>01604-649648</span>
              </li>
              <li>
                <i className="fas fa-phone-alt" /> <span>01604-649648</span>
              </li>
              <li>
                <i className="fas fa-envelope" />{" "}
                <span>abulkasem@gmail.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom Bar */}
        <div className="ku-footer-bottom">
          <div className="ku-footer-bottom-container">
            <p>&copy; {currentYear} Krishi Uddekta. All Rights Reserved.</p>
            <p>
              Developed by:{" "}
              <a
                href="https://hisam-omega.vercel.app/"
                target="_blank"
                rel="noreferrer"
              >
                Hisam Uddin
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
