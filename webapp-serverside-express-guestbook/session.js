import Session from 'm3api';
import {
	OAuthClient,
	deserializeOAuthSession,
	serializeOAuthSession,
} from 'm3api-oauth2';

/**
 * Load the m3api session from the user session (session store).
 *
 * @param {express.Request} req
 * @return {Session}
 */
export function loadSession( req ) {
	const session = new Session( 'test.wikipedia.org', {
		formatversion: 2,
		errorformat: 'html',
		assert: 'user',
		crossorigin: true,
	}, {
		userAgent: 'm3api-examples/webapp-serverside-express-guestbook (https://github.com/lucaswerkmeister/m3api-examples)',
		'm3api-oauth2/client': new OAuthClient(
			// note: in a real app, this should come from secret configuration, not be hard-coded as part of the public source code
			'3176b30484225b3b594b2a3074b01aff',
			'503c5a6b247016bf30169c3cf8663be9f1b001ae'
		),
	} );

	if ( 'oauthSession' in req.session ) {
		deserializeOAuthSession( session, req.session.oauthSession );
	}

	return session;
}

/**
 * Save the m3api session in the user session (session store).
 *
 * @param {express.Request} req
 * @param {Session} session
 */
export function saveSession( req, session ) {
	req.session.oauthSession = serializeOAuthSession( session );
}
