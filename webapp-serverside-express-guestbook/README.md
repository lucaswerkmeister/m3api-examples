# webapp-serverside-express-guestbook m3api example

This example shows a very simple web application using [m3api][] and [m3api-oauth2][].
The application lets the user log in using OAuth
and then add themselves to the [m3api-examples guestbook][] on Test Wikipedia.
The edit is made server-side,
so that the OAuth credentials are never exposed to the user:
in a normal tool, this would guarantee that the OAuth client can’t be used to make arbitrary edits.

## Usage

After installing the dependencies, run the app using [Express][]:

```bash
npm install
npm run start
```

Then open http://localhost:8080/ in your browser.
Click the login link, then authorize the application on-wiki;
when you return to the page, click the “sign guestbook” button.
If you then follow the link on the page to the guestbook,
you should see a new edit there with your signature.

[m3api]: https://www.npmjs.com/package/m3api
[m3api-oauth2]: https://www.npmjs.com/package/m3api-oauth2
[Express]: https://expressjs.com/
[m3api-examples guestbook]: https://test.wikipedia.org/wiki/M3api-examples_guestbook
