<script setup>
import Session, { ApiErrors } from 'm3api/browser.js';
import {
	OAuthClient,
	completeOAuthSession,
	deserializeOAuthSession,
	initOAuthSession,
	serializeOAuthSession,
} from 'm3api-oauth2';
import { ref } from 'vue';

const STATE_BLANK = 0,
	STATE_INITED = 1,
	STATE_COMPLETING = 2,
	STATE_COMPLETED = 3,
	STATE_SIGNING = 4,
	STATE_SIGNED = 5,
	STATE_FATAL = 6;
const state = ref( STATE_BLANK );
const authorizationUrl = ref( null );
const signatureRevisionId = ref( null );
const errorHtml = ref( null );

const session = new Session( 'test.wikipedia.org', {
	formatversion: 2,
	errorformat: 'html',
	assert: 'user',
	crossorigin: true,
}, {
	userAgent: 'm3api-examples/webapp-clientside-vite-guestbook (https://github.com/lucaswerkmeister/m3api-examples)',
	'm3api-oauth2/client': new OAuthClient(
		'bd42efa5d63ec102843072f4837d4b51',
		'aff3fb291397d820f4d40e098ff65e907e017847'
	),
} );
const serialization = sessionStorage.getItem( 'oauth-session' );
if( serialization !== null ) {
	deserializeOAuthSession( session, JSON.parse( serialization ) );
}

if ( ( new URLSearchParams( location.search ) ).has( 'code' ) ) {
	state.value = STATE_COMPLETING;
	completeOAuthSession( session, location.href )
		.then( () => {
			sessionStorage.setItem( 'oauth-session',
				JSON.stringify( serializeOAuthSession( session ) ) );
			location = `${location.origin}/`; // clear URL params after processing
		} )
		.catch( ( e ) => {
			errorHtml.value = 'Error while completing OAuth session!';
			state.value = STATE_FATAL;
			console.error( e );
		} );
} else if ( serialization === null ) {
	initOAuthSession( session )
		.then( ( url ) => {
			sessionStorage.setItem( 'oauth-session',
				JSON.stringify( serializeOAuthSession( session ) ) );
			authorizationUrl.value = url;
			state.value = STATE_INITED;
		} )
		.catch( ( e ) => {
			errorHtml.value = 'Error while initializing OAuth session!';
			state.value = STATE_FATAL;
			console.error( e );
		} );
} else {
	state.value = STATE_COMPLETED;
}

function signGuestbook() {
	if ( state.value !== STATE_COMPLETED ) {
		throw new Error( 'This function can only be called when OAuth authorization is completed.' );
	}
	state.value = STATE_SIGNING;

	session.request( {
		action: 'edit',
		title: 'm3api-examples guestbook',
		appendtext: '\n* ~~~~',
		summary: 'm3api-examples/webapp-clientside-vite-guestbook',
		bot: true,
		nocreate: true,
		watchlist: 'nochange',
	}, {
		method: 'POST',
		tokenType: 'csrf',
	} ).then( ( { edit } ) => {
		signatureRevisionId.value = edit.newrevid;
		state.value = STATE_SIGNED;
	} ).catch( ( e ) => {
		if ( e instanceof ApiErrors ) {
			errorHtml.value = 'API error';
			if ( e.errors.length > 1 ) {
				errorHtml.value += 's';
			}
			errorHtml.value += ':<ul>';
			for ( const error of e.errors ) {
				errorHtml.value += `<li>${error.html}</li>`;
			}
			errorHtml.value += '</ul>';
		} else {
			errorHtml.value = 'Unexpected API error!';
			console.error( e );
		}
		state.value = STATE_FATAL;
	} );
}
</script>

<template>
	<main>
		<h1>Welcome!</h1>
		<div v-if="errorHtml" class="error" v-html="errorHtml" />
		<p>
			This is the client-side / Vite edition of the “guestbook” example web app.
		</p>
		<p v-if="state === STATE_BLANK">
			Please stand by while the authorization is being initialized.
		</p>
		<p v-else-if="state === STATE_INITED">
			<a :href="authorizationUrl">Log in</a> to get started.
		</p>
		<p v-else-if="state === STATE_COMPLETING">
			Welcome back! Please stand by while the authorization is being completed.
		</p>
		<p v-else-if="state === STATE_COMPLETED">
			Click here to add yourself to the
			<a href="https://test.wikipedia.org/wiki/M3api-examples_guestbook">guestbook</a>:
			<button @click="signGuestbook">Sign guestbook</button>
		</p>
		<p v-else-if="state === STATE_SIGNING">
			Signing guestbook…
		</p>
		<p v-else-if="state === STATE_SIGNED">
			Guestbook signed! You can review <a :href="'https://test.wikipedia.org/w/index.php?diff=' + signatureRevisionId">the edit</a> or reload the page to start over.
		</p>
		<p v-else-if="state !== STATE_FATAL">
			Unexpected state {{ state }}!
		</p>
	</main>
</template>

<style>
.error {
	background: #fee7e6;
	border: 1px solid #b32424;
}
</style>
