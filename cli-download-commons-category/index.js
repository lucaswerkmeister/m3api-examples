import { createWriteStream } from 'node:fs';
import { Readable } from 'node:stream';
import { finished } from 'node:stream/promises';
import Session, { set } from 'm3api/node.js';
import { queryFullPages } from 'm3api-query/index.js';

function error( message ) {
	console.error( message );
	process.exitCode = 1;
}

async function downloadFile( session, title ) {
	const filename = title.slice( 5 );
	const response = await fetch( `https://commons.wikimedia.org/wiki/Special:FilePath/${filename}`, {
		headers: {
			'user-agent': session.getUserAgent(), // note: this is only part of the internal interface
		},
		redirect: 'follow',
	} );
	const readable = Readable.fromWeb( response.body );
	const writeStream = createWriteStream( filename );
	await finished( readable.pipe( writeStream ) );
}

async function main( argv ) {
	const [ node, script, ...categories ] = argv;
	if ( categories.some( ( arg ) => arg.startsWith( '-' ) ) ) {
		return error( 'This program does not support any options or flags.' );
	}
	if ( !categories.length ) {
		return error( `Usage: ${node} ${script} Category:A "Category:B C"...` );
	}

	const session = new Session( 'commons.wikimedia.org', {
		formatversion: 2,
		errorformat: 'plaintext',
	}, {
		userAgent: 'm3api-examples/cli-download-commons-category (https://github.com/lucaswerkmeister/m3api-examples)',
	} );
	for ( let category of categories ) {
		if ( !category.startsWith( 'Category:' ) ) {
			category = `Category:${category}`; // do what I mean
		}
		for await ( const { title } of queryFullPages( session, {
			action: 'query',
			prop: set(),
			generator: 'categorymembers',
			gcmtitle: category,
			gcmtype: 'file',
			gcmlimit: 'max',
		} ) ) {
			await downloadFile( session, title );
		}
	}
}
main( process.argv ).catch( error );
