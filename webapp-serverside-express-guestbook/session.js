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
			'bd42efa5d63ec102843072f4837d4b51',
			'aff3fb291397d820f4d40e098ff65e907e017847'
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
