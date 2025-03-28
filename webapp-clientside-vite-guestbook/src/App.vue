<script setup>
import { ApiErrors } from 'm3api/browser.js';
import {
	completeOAuthSession,
	initOAuthSession,
	isCompleteOAuthSession,
} from 'm3api-oauth2';
import { ref } from 'vue';

import {
	loadSession,
	saveSession,
} from './session.js';

const STATE_BLANK = 0,
	STATE_INITED = 1,
	STATE_COMPLETED = 2,
	STATE_SIGNING = 3,
	STATE_SIGNED = 4,
	STATE_FATAL = 5;
const state = ref( STATE_BLANK );
const authorizationUrl = ref( null );
const signatureRevisionId = ref( null );
const errorHtml = ref( null );

const session = loadSession();
if ( !isCompleteOAuthSession( session ) ) {
	initOAuthSession( session )
		.then( ( url ) => {
			saveSession( session );
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
@import './error.css';
</style>
