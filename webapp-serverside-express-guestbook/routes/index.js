import { Router } from 'express';
import createError from 'http-errors';
import Session from 'm3api';
import {
	completeOAuthSession,
	initOAuthSession,
	isCompleteOAuthSession,
} from 'm3api-oauth2';
import {
	loadSession,
	saveSession,
} from '../session.js';
import tokens from '../tokens.js';

const router = Router();
const title = 'Guestbook web app (server-side / Express.js edition)';

router.get( '/', async function( req, res, next ) {
	const session = loadSession( req );

	if ( !isCompleteOAuthSession( session ) ) {
		const authorizationUrl = await initOAuthSession( session );
		saveSession( req, session );
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

router.get( '/oauth-callback/', async function ( req, res, next ) {
	const session = loadSession( req );
	await completeOAuthSession( session, req.originalUrl );
	saveSession( req, session );
	res.redirect( 303, `${ req.baseUrl }/` );
} );

router.post( '/sign', async function ( req, res, next ) {
	const session = loadSession( req );

	if ( !isCompleteOAuthSession( session ) ) {
		return next( createError( 403 ) );
	}

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
} );

export default router;
