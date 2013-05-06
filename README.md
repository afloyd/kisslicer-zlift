kisslicer-zlift
===============

So I like using KISSlicer, but wished it had the z-lift feature of Slic3r... I know that the feature is coming soon, but I just couldn't wait any longer. So I threw together a quick program to do just that. I've only test it with gcode from KISSlicer v0.1.9.7, so not sure if it'll work with other versions (but it should). In fact this will probaby work with any code generated for a 3D printer, but it's not been tested with any others so proceed to do so at your own risk (can always use a gcode viewer first ;) )...

Must be installed/run from the command line. NPM & Node >=v10.x required to run.


Installation
==============
$ git clone `https://github.com/afloyd/kisslicer-zlift.git`

$ npm install


That's it!


Running
===========
I have a "prints" folder on my machine, and have the kisslicer-zlift directory nested inside of it
ie:

```
c:\prints
	\kisslicer-zlift
	yoda.stl
	yoda.gcode
```

So from inside \prints to run the code I type:

`node ./kisslicer-zlift yoda.gcode`

This creates a file in the same directory it's ran called `yoda-zlifts.gcode`, which is the same gcode with the addition of z-lifts in between non-extruding moves that are longer than the default move distance (6mm).

Additional Options
==================
You can specify a few options to the command line:

`node ./kisslicer-zlift yoda.gcode -m 20` (short for `-min`) will tell it to only put in z-lift when the distance moved is greater than 20mm instead of 6mm.

`node ./kisslicer-zlift yoda.gcode -h 1` (short for `-height`) will tell it to perform 1mm z-lift instead of the default 0.5mm.

`node ./kisslicer-zlift yoda.gcode -a -modded` (short for `-append`) will tell it to name the new file `yoda-modded.gcode` instead of the default `<name>-zlifts.gcode`





I thought about allowing it to automatically overwrite the existing file, but haven't gotten around to it yet. Hope you enjoy!!

(The MIT License)

Copyright © 2013 Austin Floyd <texsc98@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
