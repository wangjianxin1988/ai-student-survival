import { Turnstile } from '@marsidev/react-turnstile';

interface TurnstileWidgetProps {
  onVerify: (token: string) => void;
  onExpire?: () => void;
  className?: string;
}

export function TurnstileWidget({
  onVerify,
  onExpire,
  className,
}: TurnstileWidgetProps) {
  // Use Cloudflare test sitekey for development
  // In production, replace with real sitekey from Cloudflare Dashboard
  const siteKey =
    import.meta.env.PUBLIC_TURNSTILE_SITE_KEY || '1x00000000000000000000AA';

  return (
    <div className={className}>
      <Turnstile
        siteKey={siteKey}
        onVerify={(token) => onVerify(token)}
        onExpire={onExpire}
        options={{
          theme: 'auto',
          size: 'flexible',
        }}
      />
    </div>
  );
}
