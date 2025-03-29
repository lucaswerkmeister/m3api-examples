# webapp-clientside-vite-guestbook m3api example

This example shows a very simple web application using [m3api][] and [m3api-oauth2][].
The application lets the user log in using OAuth
and then add themselves to the [m3api-examples guestbook][] on Test Wikipedia.
The authentication and the edit are all done client-side, i.e. in the browser:
nothing happens on the server side,
and it’s possible to deploy the app as a set of static files.

## Usage

After installing the dependencies, run the app in development mode using [Vite][]:

```bash
npm install
npm run dev
```

Then open http://localhost:8080/ in your browser.
Click the login link, then authorize the application on-wiki;
when you return to the page, click the “sign guestbook” button.
If you then follow the link on the page to the guestbook,
you should see a new edit there with your signature.

You can also build the app and then serve it using some other server,
such as Python’s built-in HTTP server:

```bash
npm run build
(cd dist/ && python -m http.server 8080)
```

Note that you need to use port 8080 (and `localhost`),
as this is included in the OAuth callback URL of the OAuth consumer / client used by this example.
If you want to run this example somewhere else,
you can register your own OAuth consumer and put its credentials in `src/session.js`.

## A note on the OAuth client

The OAuth client (ID + secret) used by this example is hard-coded in `src/session.js`,
and is thus public in two ways:
it’s included in the source code distributed as part of the m3api-examples repository,
and it’s also included in the code that’s sent to the browser and executed there
(whether you use the development mode or create a build and serve that statically).
The latter part is a necessary consequence of running the app client-side –
in theory, anyone can extract the OAuth client and use it on their own.
For this reason, the client is marked as **non-confidential**
(visible e.g. on [the client’s page][OAuth client]);
if you create your own OAuth client for a client-side (in-browser) app,
you should do the same (i.e., uncheck the “Client is confidential” checkbox).
If you want to prevent others from reusing the OAuth client and impersonating your app,
you will need a server-side component that can keep the client secret confidential:
see e.g. the [server-side example](../webapp-serverside-express-guestbook/) also included in this repository.

[m3api]: https://www.npmjs.com/package/m3api
[m3api-oauth2]: https://www.npmjs.com/package/m3api-oauth2
[Vite]: https://vite.dev/
[m3api-examples guestbook]: https://test.wikipedia.org/wiki/M3api-examples_guestbook
[OAuth client]: https://meta.wikimedia.org/wiki/Special:OAuthListConsumers/view/3176b30484225b3b594b2a3074b01aff
