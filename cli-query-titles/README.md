# cli-query-titles m3api example

This example shows a very simple CLI application using [m3api][] and [m3api-query][].
(No CLI library is used, so the command line parsing is rudimentary.)
The application can be used to print all the titles produced by a certain API query.

For example, you can use it with a regular generator like [categorymembers][]:
```sh
node index.js en.wikipedia.org generator=categorymembers gcmtitle=Category:MediaWiki
```

Or with a generator that takes one or more pages as input,
like [links][] (print all the outgoing links of the given page):
```sh
node index.js en.wikipedia.org titles=Main_Page generator=links gpllimit=max
```
(Try removing the `gpllimit=max` and see how it takes longer to get the same result with the lower default limit!)

You can also use it without a generator,
in which case it effectively normalizes a title,
potentially resolving redirects:
```sh
node index.js en.wikipedia.org titles=Main_page redirects=1
```

Note that the application will follow continuation until the API indicates it’s finished,
so you should be careful when using it with a generator like [allpages][].
This is *not* the most efficient way to count all pages in English Wikipedia’s Module namespace ([Quarry][] would be better):
```sh
node index.js en.wikipedia.org generator=allpages gapnamespace=828 gaplimit=max | wc -l
```

[m3api]: https://www.npmjs.com/package/m3api
[m3api-query]: https://www.npmjs.com/package/m3api-query
[categorymembers]: https://www.mediawiki.org/wiki/Special:MyLanguage/API:Categorymembers
[links]: https://www.mediawiki.org/wiki/Special:MyLanguage/API:Links
[allpages]: https://www.mediawiki.org/wiki/Special:MyLanguage/API:Allpages
[Quarry]: https://meta.wikimedia.org/wiki/Research:Quarry
