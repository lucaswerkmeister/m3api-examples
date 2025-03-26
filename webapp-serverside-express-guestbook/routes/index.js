import { Router } from 'express';
import createError from 'http-errors';
import Session, {
	ApiErrors,
} from 'm3api';
import {
	OAuthClient,
	completeOAuthSession,
	deserializeOAuthSession,
	initOAuthSession,
	isCompleteOAuthSession,
	serializeOAuthSession,
} from 'm3api-oauth2';
import tokens from '../tokens.js';

const router = Router();

const title = 'Guestbook web app (server-side / Express.js edition)';
const makeSession = () => new Session( 'test.wikipedia.org', {
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

router.get( '/', async function( req, res, next ) {
	const session = makeSession();
	if ( 'oauthSession' in req.session ) {
		deserializeOAuthSession( session, req.session.oauthSession );
	}

	if ( 'code' in req.query ) {
		// this is the OAuth callback
		// note: in a real app, this would be a separate route (e.g. /oauth/callback);
		// the OAuth client used by this example uses / as the callback because it’s also used by the client-side app
		await completeOAuthSession( session, req.originalUrl );
		req.session.oauthSession = serializeOAuthSession( session );
		res.redirect( 303, '/' );
		return;
	}

	if ( !isCompleteOAuthSession( session ) ) {
		const authorizationUrl = await initOAuthSession( session );
		req.session.oauthSession = serializeOAuthSession( session );
		res.render( 'login', {
			title,
			authorizationUrl,
		} );
		return;
	}

	res.render( 'index', {
		title,
		csrfToken: tokens.create( req.session.csrfSecret ),
	} );
} );

router.post( '/sign', async function ( req, res, next ) {
	const session = makeSession();
	deserializeOAuthSession( session, req.session.oauthSession );

	if ( !isCompleteOAuthSession( session ) ) {
		return next( createError( 403 ) );
	}

	try {
		const { edit } = await session.request( {
			action: 'edit',
			title: 'm3api-examples guestbook',
			appendtext: '\n* ~~~~',
			summary: 'm3api-examples/webapp-serverside-express-guestbook',
			bot: true,
			nocreate: true,
			watchlist: 'nochange',
		}, {
			method: 'POST',
			tokenType: 'csrf',
		} );
		res.render( 'signed', {
			title,
			signatureRevisionId: edit.newrevid,
		} );
	} catch ( e ) {
		if ( e instanceof ApiErrors ) {
			let heading = 'API error';
			let errorHtml = '<p>The API returned the following error';
			if ( e.errors.length > 1 ) {
				heading += 's';
				errorHtml += 's';
			}
			errorHtml += ':</p><ul>';
			for ( const error of e.errors ) {
				errorHtml += `<li>${error.html}</li>`;
			}
			errorHtml += '</ul>';
			res.render( 'api-errors', {
				title,
				heading,
				errorHtml,
			} );
		} else {
			res.render( 'error', {
				title,
				message: e.message,
				error: req.app.get( 'env' ) === 'development' ? e : {},
			} );
		}
	}
} );

export default router;
