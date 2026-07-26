import { memo } from 'react';
import { FaWhatsapp } from 'react-icons/fa';
import './WhatsAppButton.css';

const WHATSAPP_URL =
  'https://wa.me/919586342070?text=Hello%20ANOVA%20TECHNOLOGIES,%20I%20want%20to%20know%20about%20your%20services.';

/**
 * Reusable floating WhatsApp CTA.
 * - Fixed at bottom-right
 * - Accessible label + tooltip
 * - Opens WhatsApp in a new secure tab
 */
function WhatsAppButton({
  href = WHATSAPP_URL,
  ariaLabel = 'Chat with ANOVA TECHNOLOGIES on WhatsApp',
  tooltipText = '👋 Need Help? Chat with us',
  className = '',
  bottomOffset,
  rightOffset,
  zIndex = 9999,
}) {
  const style = {
    zIndex,
    ...(bottomOffset ? { '--wa-bottom-offset': bottomOffset } : {}),
    ...(rightOffset ? { '--wa-right-offset': rightOffset } : {}),
  };

  return (
    <div className={`wa-float ${className}`.trim()} style={style}>
      <span className="wa-tooltip" role="status" aria-hidden="true">
        {tooltipText}
      </span>

      <a
        href={href}
        className="wa-button"
        target="_blank"
        rel="noopener noreferrer"
        aria-label={ariaLabel}
      >
        <FaWhatsapp className="wa-icon" aria-hidden="true" focusable="false" />
        <span className="wa-status-dot" aria-hidden="true" />
      </a>
    </div>
  );
}

export default memo(WhatsAppButton);
