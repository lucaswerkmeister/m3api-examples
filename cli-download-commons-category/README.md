# cli-download-commons-category m3api example

This example shows a CLI application to download all files in a Wikimedia Commons category.
For example, to download all files in [Category:Photographs of anti-fascist flags][]:

```sh
mkdir antifa-flags
cd antifa-flags
node ../index.js 'Photographs of anti-fascist flags'
```

The script downloads files into the current working directory,
hence the `mkdir` + `cd` above.
Also, note that files in subcategories are not included,
though you can download files from more than one category at once:

```sh
mkdir antifa-flags-with-variations
cd antifa-flags-with-variations
node ../index.js 'Photographs of anti-fascist flags' 'Photographs of Antifaschistische Aktion flag variations'
```

[Category:Photographs of anti-fascist flags]: https://commons.wikimedia.org/wiki/Category:Photographs_of_anti-fascist_flags
