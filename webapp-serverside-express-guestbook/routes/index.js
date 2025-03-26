import { Router } from 'express';
import Session, {
	ApiErrors,
} from 'm3api';
import {
	OAuthClient,
	completeOAuthSession,
	deserializeOAuthSession,
	initOAuthSession,
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
	if ( !( 'oauthSession' in req.session ) ) { // <-- this would become isOAuthComplete( session )
		const authorizationUrl = await initOAuthSession( session );
		req.session.oauthSession = serializeOAuthSession( session );
		res.render( 'login', {
			title,
			authorizationUrl,
		} );
		return;
	}
	// TODO just because req.session.oauthSession was *set* doesn’t mean it was *completed*…
	// m3api-oauth2 should expose some way for us to determine between three states:
	// * uninitialized (req.session.oauthSession absent or empty)
	// * initialized but not completed (req.session.oauthSession has codeVerifier but no accessToken)
	// * completed (req.session.oauthSession has accessToken; presence of refreshToken probably irrelevant?)
	// without us inspecting the opaque serialization directly
	// ---
	// actually… what are we supposed to do if it’s initialized but not completed?
	// m3api-oauth2 doesn’t currently give us a way to get the authorizationUrl again –
	// if we init a second time, it’ll regenerate the code verifier and thus invalidate the old URL.
	// maybe init should be idempotent (reuse verifier if already set)?
	// or should there be a separate “get authorization URL for inited session” function?
	// ---
	// if we make init idempotent, then we just need a single “is complete [return boolean]” function.
	// I think I might prefer that to the weird tristate thing above.
	// (“is inited” on its own, without access to the URL, is useless;
	// if anyone really wants to know if it’s already inited from m3api-oauth2’s point of view,
	// they can save the URL themselves, call init, and check if the URL is the same or not (assuming idempotent init).
	// if it isn’t the same, then the old URL they saved was useless anyway because m3api-oauth2 no longer had the corresponding codeVerifier.)
	// at least some of these fixes also apply to the client-side example btw :3 we likewise reuse serialization === null as the “needs init” condition there, should be !isOAuthComplete() instead
	res.render( 'index', {
		title,
		csrfToken: tokens.create( req.session.csrfSecret ),
	} );
} );

router.post( '/sign', async function ( req, res, next ) {
	// TODO we need to know if the session is actually in completed state… see TODO above
	// if !isOAuthComplete( session ) then return 403
	const session = makeSession();
	deserializeOAuthSession( session, req.session.oauthSession );
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
		let errorHtml;
		if ( e instanceof ApiErrors ) {
			errorHtml = 'API error';
			if ( e.errors.length > 1 ) {
				errorHtml += 's';
			}
			errorHtml += ':<ul>';
			for ( const error of e.errors ) {
				errorHtml += `<li>${error.html}</li>`;
			}
			errorHtml += '</ul>';
		} else {
			errorHtml = 'Unexpected API error!';
			console.error( e );
		}
		res.render( 'layout', {
			title,
			error,
		} );
	}
} );

export default router;
