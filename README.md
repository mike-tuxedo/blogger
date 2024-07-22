# Welcome to BlogYourMind
BlogYourMind is a minimalist open source blogging CMS that is easy to install and use. BlogYourMind offers three pre-installed themes and for those who are familiar with styling, there is the option to disable the themes completely and design your own theme via CSS.

Experience easy blogging with BlogYourMind!

THIS IS ABSOLUTLY NOT READY YET! DON'T WASTE YOUR TIME TRYING IT OUT.
Just save it as a booking and come back later ;-)

## Development

### Sveltekit + Nodejs backend
Per default you run a standard sveltekit environment.
`npm run dev`

This, as usually, lets you run the sveltekit part of the blogger and uses the build in nodejs server api.


### Sveltekit + PHP backend
If you want to use the php api, then you need the following packages installed on your local System for development and of course on your php server, where your blog will go live. This setup should be standard and normaly you don't have to do anything else, than unzip the ready to go package, or if you build it on your own, upload your build.

- php
- php-sqlite
- Imagick
- composer
- One of the following php libraries, that the uploaded images can be converted to webp
 - cwebp (executing cwebp binary using an exec call)
 - vips (using Vips PHP extension)
 - imagick (using Imagick PHP extension)
 - gmagick (using Gmagick PHP extension)
 - imagemagick (executing imagemagick binary using an exec call)
 - graphicsmagick (executing graphicsmagick binary using an exec call)
 - ffmpeg (executing ffmpeg binary using an exec call)
 - wpc (using WebPConvert Cloud Service - an open source webp converter for PHP - based on this library)
 - ewwww (using the ewww cloud converter (1 USD startup and then free webp conversion))
 - gd (using the Gd PHP extension)


Install php dependencies. Go into the php-api folder and execute the following
`cd php-api && composer install`

Then you can run sveltekit and the php api with
`npm run dev-php`

This runs sveltekit as normal and also turns on a simple php server to serve the php api.

### Attention:
Don't forget to activate the sqlite and Imagick extensions in your php.ini (on my Manjaro linux it was in `/etc/php/php.ini`). Yout have to uncomment or add `extension=sqlite3` and `extension=imagick`.


## Updating
First, ALWAYS BACKUP YOUR FILES! Take a copy of all files and folders and move itit to a separate place on the server, or download it.

That sayd ;-) , depending on how you installed blogyourmind, there are some possible flows.

### Installed by zip on a php server
If you just downloaded the zip and unzipped it to your php-server, than just download the newest one and overwrite your existing files and folders expect the content folder. Your entire blog content is in the content folder!

### Installed by gitrepo
Just take a copy of content folder, pull changes and copy back your prevous backed up content folder, because `git pull` will overwrite the content folder.

#### Todos

1.  Add node server
2.  Add real login, check if account exist and add admin if not.
2.  Implement a category system
3.  Add themechanger
4.  Overwrite Images with the same name on the server, instead of uploading it multiple times
5.  Implement real search with server results
6.  Check if no posts are available, check if an user exists, if not show modal to switch to login page and create user.
7.  Enhance Settings
    1.  Save additional metatags
    2.  Add switch themes function
    3.  Add posibility for custom css
    4.  Check how to switch between php and nodejs api