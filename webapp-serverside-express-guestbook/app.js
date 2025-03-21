import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import session from 'express-session';
import createError from 'http-errors';
import { ApiErrors } from 'm3api';
import logger from 'morgan';

import tokens from './tokens.js';
import indexRouter from './routes/index.js';

const app = express();

const basePath = dirname( fileURLToPath( import.meta.url ) );

// view engine setup
app.set( 'views', join( basePath, 'views' ) );
app.set( 'view engine', 'hbs' );

app.use( logger( 'dev' ) );
app.use( express.urlencoded( { extended: false } ) );
app.use( express.static( join( basePath, 'public' ) ) );
app.use( session( {
	name: 'm3api-examples-webapp-serverside-express-guestbook',
	resave: false,
	saveUninitialized: false,
	// note: in a real app, this should come from secret configuration, not be hard-coded as part of the public source code
	secret: '410b326a-f364-4564-9a47-5260f459b9cc',
	// note: a real app would also configure a `store` here; for this example, the default MemoryStore is sufficient
} ) );

// simple token-based CSRF middleware (expects <input type=hidden name=csrfToken> data in POST requests)
app.use( async ( req, res, next ) => {
	if ( !req.session.csrfSecret ) {
		req.session.csrfSecret = await tokens.secret();
	}
	if ( req.method !== 'GET' && req.method !== 'HEAD' ) {
		if ( !tokens.verify( req.session.csrfSecret, req.body.csrfToken ) ) {
			return next( createError( 403 ) );
		}
	}
	return next();
} );

app.use( '/', indexRouter );

// catch 404 and forward to error handler
app.use( function( req, res, next ) {
	next( createError( 404 ) );
} );

// error handler
app.use( function( err, req, res, next ) {
	res.status( err.status || 500 );
	const title = 'Error';
	if ( err instanceof ApiErrors ) {
		let heading = 'API error';
		let errorHtml = '<p>The API returned the following error';
		if ( err.errors.length > 1 ) {
			heading += 's';
			errorHtml += 's';
		}
		errorHtml += ':</p><ul>';
		for ( const error of err.errors ) {
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
			message: err.message,
			error: req.app.get( 'env' ) === 'development' ? err : {},
		} );
	}
} );

export default app;
