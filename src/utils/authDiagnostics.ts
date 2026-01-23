import { auth } from '../firebase/firebaseConfig';

/**
 * Diagnostic information about the current authentication setup
 */
export interface AuthDiagnosticInfo {
  currentDomain: string;
  currentOrigin: string;
  authDomain: string;
  projectId: string;
  expectedDomains: string[];
  domainMatches: boolean;
  referrer: string | null;
}

/**
 * Get diagnostic information about the current authentication configuration
 */
export function getAuthDiagnostics(): AuthDiagnosticInfo {
  const currentDomain = window.location.hostname;
  const currentOrigin = window.location.origin;
  const authDomain = auth.config.authDomain || 'NOT SET';
  const projectId = auth.config.projectId || 'NOT SET';
  
  // Expected domains based on Firebase project
  const expectedDomains = [
    'compassion-course-websit-937d6.firebaseapp.com',
    'compassion-course-websit-937d6.web.app',
    'localhost',
    'compassioncf.com'
  ];
  
  // Check if current domain matches any expected domain
  const domainMatches = expectedDomains.some(domain => 
    currentDomain === domain || 
    currentDomain.endsWith(`.${domain}`) ||
    domain === 'localhost' && currentDomain === 'localhost'
  );
  
  // Get referrer if available
  const referrer = document.referrer || null;
  
  return {
    currentDomain,
    currentOrigin,
    authDomain,
    projectId,
    expectedDomains,
    domainMatches,
    referrer
  };
}

/**
 * Log diagnostic information to console
 */
export function logAuthDiagnostics(): void {
  const diagnostics = getAuthDiagnostics();
  
  console.group('🔍 Firebase Auth Diagnostics');
  console.log('Current Domain:', diagnostics.currentDomain);
  console.log('Current Origin:', diagnostics.currentOrigin);
  console.log('Auth Domain (from config):', diagnostics.authDomain);
  console.log('Project ID:', diagnostics.projectId);
  console.log('Expected Domains:', diagnostics.expectedDomains);
  console.log('Domain Matches Expected:', diagnostics.domainMatches ? '✅' : '❌');
  console.log('Referrer:', diagnostics.referrer || 'None');
  
  if (!diagnostics.domainMatches) {
    console.warn('⚠️ Current domain does not match expected domains!');
    console.warn('This may cause authentication to fail.');
    console.warn('Please ensure the domain is authorized in Firebase Console:');
    console.warn('1. Firebase Auth → Settings → Authorized domains');
    console.warn('2. Google Cloud Console → API Key → HTTP referrer restrictions');
    console.warn('3. Google Cloud Console → OAuth 2.0 Client ID → Authorized JavaScript origins');
  }
  
  console.groupEnd();
}

/**
 * Check if domain blocking error is likely
 */
export function isDomainBlockingError(error: any): boolean {
  if (!error || !error.code) return false;
  
  const blockingErrorCodes = [
    'auth/requests-from-referer-blocked',
    'auth/unauthorized-domain',
    'auth/operation-not-allowed'
  ];
  
  // Check if error code matches
  if (blockingErrorCodes.some(code => error.code.includes(code))) {
    return true;
  }
  
  // Check error message for domain blocking indicators
  const errorMessage = error.message?.toLowerCase() || '';
  const blockingIndicators = [
    'blocked',
    'unauthorized domain',
    'not authorized',
    'referer',
    'referrer'
  ];
  
  return blockingIndicators.some(indicator => errorMessage.includes(indicator));
}

/**
 * Get helpful error message for domain blocking errors
 */
export function getDomainBlockingErrorMessage(error: any): string {
  const diagnostics = getAuthDiagnostics();
  
  let message = 'Authentication is blocked because this domain is not authorized.\n\n';
  message += `Current domain: ${diagnostics.currentDomain}\n`;
  message += `Auth domain: ${diagnostics.authDomain}\n\n`;
  message += 'To fix this, you need to authorize the domain in three places:\n\n';
  message += '1. Firebase Console → Authentication → Settings → Authorized domains\n';
  message += '   Add: ' + diagnostics.currentDomain + '\n\n';
  message += '2. Google Cloud Console → API Key → HTTP referrer restrictions\n';
  message += '   Add: ' + diagnostics.currentOrigin + '/*\n\n';
  message += '3. Google Cloud Console → OAuth 2.0 Client ID → Authorized JavaScript origins\n';
  message += '   Add: ' + diagnostics.currentOrigin + '\n\n';
  message += 'See FIX_AUTH_DOMAIN_BLOCKING.md for detailed instructions with direct links.';
  
  return message;
}
