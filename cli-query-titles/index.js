import Session, { set } from 'm3api/node.js';
import { queryFullPages } from 'm3api-query/index.js';

function error( message ) {
	console.error( message );
	process.exitCode = 1;
}

async function main( argv ) {
	const [ _node, _script, endpoint, ...paramArgs ] = argv;
	if ( [ endpoint || '', ...paramArgs ].some( ( arg ) => arg.startsWith( '-' ) ) ) {
		return error( 'This program does not support any options or flags.' );
	}
	if ( !endpoint || !paramArgs.length || !endpoint.includes( '.' ) ) {
		return error( 'Usage: node index.js en.wikipedia.org generator=categorymembers gcmtitle=Category:MediaWiki' );
	}

	const session = new Session( endpoint, {
		formatversion: 2,
		errorformat: 'plaintext',
	}, {
		userAgent: 'm3api-examples/cli-query-titles (https://github.com/lucaswerkmeister/m3api-examples)',
	} );

	const params = {};
	for ( const paramArg of paramArgs ) {
		const eqIndex = paramArg.indexOf( '=' );
		if ( eqIndex === -1 ) {
			return error( `API parameter argument must contain an equals sign: ${paramArg}` );
		}
		params[ paramArg.substring( 0, eqIndex ) ] = paramArg.substring( eqIndex + 1 );
	}

	for await ( const page of queryFullPages( session, { ...params, action: 'query' } ) ) {
		console.log( page.title );
	}
}
main( process.argv ).catch( error );
