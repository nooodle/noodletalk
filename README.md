# NoodleTalk Alpha
## Donate to help keep our server running! :D

<a href='http://www.pledgie.com/campaigns/17022'><img alt='Click here to lend your support to: Noodle Talk and make a donation at www.pledgie.com !' src='http://www.pledgie.com/campaigns/17022.png?skin_name=chrome' border='0' /></a>

## Contributing to the Noodle

### Try to follow our code conventions. This means:

* No one-liner conditionals for if/else blocks

* camelCase variables

* Please test your changes before you send a pull request. It would also be nice if you added tests too :D

* Assign all variables with a prepending var; don't comma-delimit them to a single one.
    ### No:
        var a = 1,
            b = 2,
            c = 3;

    ### Yes:
        var a = 1;
        var b = 2;
        var c = 3;

* No curly braces on newlines
    ### No:
        if (1 === 1)
        {

        }

    ### Yes:
        if (1 === 1) {

        }

## Installation Instructions for those who dare tread the dark path

1. Install brew https://github.com/mxcl/homebrew

2. `brew install redis`

3. `redis-server &`

4. Install node http://nodejs.org/

5. `curl http://npmjs.org/install.sh | sh`

6. `npm install`

7. `cp settings.js-local settings.js`

## Dependencies

If you are on an older version of node and don't wish to upgrade, you may need to `npm install` the following packages.

* mocha
* qs
* formidable
* mime
* active-x-obfuscator
* uglify-js

## License

This program is free software. It comes without any warranty, to the extent permitted by applicable law. You can redistribute it and/or modify it under the terms of the Do What The Fuck You Want To Public License, Version 2, as published by Sam Hocevar. See http://sam.zoy.org/wtfpl/COPYING for more details.
