import Session from 'm3api/browser.js';
import {
	OAuthClient,
	deserializeOAuthSession,
	serializeOAuthSession,
} from 'm3api-oauth2';

/**
 * Load the m3api session from the browser session storage.
 *
 * @return {Session}
 */
export function loadSession() {
	const session = new Session( 'test.wikipedia.org', {
		formatversion: 2,
		errorformat: 'html',
		assert: 'user',
		crossorigin: true,
	}, {
		userAgent: 'm3api-examples/webapp-clientside-vite-guestbook (https://github.com/lucaswerkmeister/m3api-examples)',
		'm3api-oauth2/client': new OAuthClient(
			'3176b30484225b3b594b2a3074b01aff',
			'503c5a6b247016bf30169c3cf8663be9f1b001ae'
		),
	} );

	const serialization = sessionStorage.getItem( 'oauth-session' );
	if( serialization !== null ) {
		deserializeOAuthSession( session, JSON.parse( serialization ) );
	}

	return session;
}

/**
 * Save the m3api session in the browser session storage.
 *
 * @param {Session} session
 */
export function saveSession( session ) {
	const serialization = serializeOAuthSession( session );
	sessionStorage.setItem( 'oauth-session', JSON.stringify( serialization ) );
}
