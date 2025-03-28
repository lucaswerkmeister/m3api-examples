<script setup>
import { completeOAuthSession } from 'm3api-oauth2';
import { ref } from 'vue';

import {
	loadSession,
	saveSession,
} from './session.js';

const errorHtml = ref( null );

const session = loadSession();

completeOAuthSession( session, location.href )
	.then( () => {
		saveSession( session );
		location = `${location.origin}/`;
	} )
	.catch( ( e ) => {
		errorHtml.value = 'Error while completing OAuth session!';
		console.error( e );
	} );
</script>

<template>
	<main>
		<h1>Welcome back!</h1>
		<p v-if="!errorHtml">
			Please stand by while the authorization is being completed.
		</p>
		<div v-else class="error" v-html="errorHtml" />
	</main>
</template>

<style>
@import './error.css';
</style>
