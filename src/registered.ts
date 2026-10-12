import './styles.css';
import { config } from './config';
import { track } from './analytics';

const $ = (s: string) => document.querySelector<HTMLElement>(s)!;
const params = new URLSearchParams(location.search);
const ok = params.get('registered') === '1';

if (!ok) {
  // Landed here directly, not from the portal: don't claim a registration.
  $('[data-title]').textContent = 'You’re not registered yet.';
  $('[data-body]').textContent = 'Head back to the TRL8 page and tap “Register your interest” to log in with your learning portal credentials.';
} else {
  document.body.classList.add('is-ok');
  track('login_success');
  $('[data-title]').textContent = 'You’re registered.';
  if (config.platformUrl) {
    $('[data-body]').textContent = 'Taking you to the TRL8 platform…';
    const a = document.createElement('a');
    a.className = 'btn btn--primary';
    a.href = config.platformUrl;
    a.textContent = 'Continue to the TRL8 platform';
    $('[data-action]').append(a);
    setTimeout(() => {
      track('platform_redirect');
      location.assign(config.platformUrl);
    }, 1500);
  } else {
    $('[data-body]').textContent = 'Your interest is recorded. We’ll notify you about the next steps.';
  }
}
