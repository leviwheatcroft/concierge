### Concierge

A nodejs CLI app to curate scene movie releases.

  * detects movie from either .nfo or path, reasonably accurate
  * clean code & cool plugin architecture
  * configurable naming convention
  * works nicely as a sabnzbd post processing script


### warning

So far I've only done some really basic testing on my own machine, so if you
decide to give this a try, please don't point it at your media collection and
let it go, because it will likely do some catastrophic damage.

### installation & setup (quick start)

 * you'll need node and avprobe (from `lib-avtools` package)
 * then clone this repo, then `npm install`
 * create `config.ini` from `config.example.ini`
 * set your tmdb apiKey, parent, and output
 * run with `node concierge.js`


### installation & setup (detailed)

__install node__

This used to be really clunky, but these days it's much better, so I'd avoid
googling it and following the first guide you see because lots has changed.

Best way is to follow the instructions from [nodesource](https://github.com/nodesource/distributions)
which will go something like this:

> you shouldn't just run scripts you download from the interwebs willy nilly,
> especially as sudo.. unless like me, you like to live dangerously.


```
sudo curl -sL https://deb.nodesource.com/setup_5.x | bash -
sudo apt-get install -y nodejs
```

__install avprobe__

```
sudo apt-get install libav-tools
```

__clone & populate__

```
git clone <address>
cd <folder>
npm install
```

__setup__

rename `./config.example.ini` to `config.ini`, and edit it as you like.
you can also `node concierge.js -h` to get a list of options. All (most?)
options can be set from CLI args or from config.ini, CLI takes precedence.

 * You'll need an api key from themoviedb
 * set the path to your parent directory
 * set path to output or leave it as 'inPlace'

__run__

```
nodejs concierge.js
```



### command line usage

Concierge will read options from it's `config.ini` but those options will be
overwritten by anything you pass in from the command line.

Suppose you have a `/srv/downloads/movies/` directory and you want concierge
to process all children of that directory, you add something like
`source=/srv/downloads/movies/` to your `config.ini`.

If for whatever reason you wanted concierge to process a single release, you
use the `--target` option which only ever processes a single directory (so
`--source` will be ignored).

```
nodejs concierge.js --target /downloads/movies/some-specific-release
```

`-h` or `--help` will give you the full list of command line options, most
of which are self explanatory. All command line options are also documented in
`config.example.ini`.

### sabnzbd post processing

You just specify the included `conciergeSabnzbd.sh` as your post processing
script. You'll need to edit this that script to show the correct path to
concierge. Sabnzbd expects all your post processing scripts to be in one folder,
so if you're using sickbeard post processing or whatever just copy
`conciergeSabnzbd.sh` to your sickbeard autoProcessTV directory or wherever.


### more documentation

 * [config.example.ini](http://leviwheatcroft.github.io/concierge/config.example.ini)
will give you a good run down of the available options and configuration.
 * [onNoMedia.js](http://leviwheatcroft.github.io/concierge/docs/lib/plugins/onNoMedia.js.html)
is an example of how to write a plugin
 * [fsItems.js](http://leviwheatcroft.github.io/concierge/docs/lib/fsItems.js.html)
contains the Directory class which is used by pretty much every module.
 * [metaTmdb](http://leviwheatcroft.github.io/concierge/docs/lib/metaTmdb.js.html)
is where the "magic" happens

### Support

Post an issue here or pm /u/Mr5o1 on reddit.
