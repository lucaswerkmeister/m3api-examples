import { Router } from 'express';
import tokens from '../tokens.js';

const router = Router();

/* GET home page. */
router.get( '/', function( req, res, next ) {
	res.render( 'index', {
		title: 'Guestbook web app (server-side / Express.js edition)',
		csrfToken: tokens.create( req.session.csrfSecret ),
	} );
} );

router.post( '/', function( req, res, next ) {
	res.render( 'index', {
		title: 'Successful submit!',
		csrfToken: tokens.create( req.session.csrfSecret ),
	} );
} );

export default router;
