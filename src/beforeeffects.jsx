/**
 * @fileoverview <code>BE</code> (BeforeEffects) aims to be a collection of
 * useful extensions to the After Effects Object Model within ExtendScript.
 * <code>BE</code> contains Objects that provide greater functionality and
 * reusability than the built-in After Effects objects as well as additions to
 * the built-in Objects within JavaScript.
 * 
 * All prototype modifications to the built-in JavaScript Objects are handled
 * gently by checking to make sure the methods/properties that are added are
 * not already defined. This is helpful in that, if the standard Objects are
 * modified by future ECMA specifications (or ExtendScript is modified) and
 * they are named the same as methods/fields that <code>BE</code> implements,
 * BeforeEffects will not overwrite the pre-defined methods. 
 * 
 * @author <a href="mailto:collin.brooks@gmail.com">Collin Brooks</a>
 * @version 0.1.0 dev
 */

/*jslint white: true, onevar: true, undef: true, newcap: true, regexp: true,
 plusplus: true, bitwise: true, maxerr: 50, maxlen: 79, indent: 4 */

/**
 * The <code>BE</code> Object aims to be an all-purpose collection of useful
 * methods that increases efficiency in creating scripts for After Effects.
 * 
 * @returns {Object} The <code>BE</code> Object
 * @version 0.1.0 dev
 * @namespace
 */
var BE = (function () {
    /*************************************************************************\
     * >>> Private Variables
     * All private variables end with a _ except for 'that'
    \*************************************************************************/

    /**
     * A reference to this function's <code>this</code> value for use within
     * methods/functions defined by the <code>BE</code> Object.
     * 
     * @type {Object}
     * @inner
     * @private
     */

    var that = this,

    /**
     * Contains name/value pairs for where modules are included from relative
     * to {@link BE.BASE_PATH}.
     * @type {Object}
     * @private
     * @inner
     */
    incs = {
        comp: "comp/comp.jsxinc",
        layer: "layer/layer.jsxinc",
        proj: "proj/proj.jsxinc",
        prototypes: "prototyptes/prototypes.jsxinc",
        time: "time/time.jsxinc",
        ui: "ui/ui.jsxinc",
        settingsmanager: "util/SettingsManager.jsxinc"
    },

    /**
     * The current version of the <code>BE</code> object.
	 *
	 * @type {String}
	 * @private
     * @inner
	 */
	version_ = "0.1.0 dev",

	/**
	 * <p>The current debug level. Each level builds upon the previous
	 * level. Errors are automatically output to the log. Possible values:
	 * <ul>
	 * <li>0 - No information output to console</li>
	 * <li>1 - Info output to the console</li>
	 * <li>2 - Warnings and Info output to the console</li>
	 * </ul>
	 * </p>
	 * @type {Number}
     * @private
     * @inner
	 */
	debug_ = 3,


    /**
     * Contains the defined dependencies defined from BE.require()
     * @private
     * @type {Object}
     */
    dependencies_ = {
        /**
         * An array of object notation strings of the objects whos files have
         * at leasts been visited. Recording this allows us to not end up in an
         * infinite loop when requiring a file that requires the current file.
         * @type {String[]}
         */
        visited: [],
        /**
         * An array of includes that have already been required. This helps
         * make sure a module does not define a resource more than once.
         * @type {String[]}
         */
        included: [],
        /**
         * An array of version strings keyed by object notation. All modules
         * must start with BE.
         * @type {String[]}
         */
        versions: []
    },

    /**
     * Defines methods or properties of the given object path if they do not
     * exist.
     *
     * @param {String} path The object structure path to create 
     * @param {*} [obj=BE] The object to base the object structure in. This is
     * useful if you want to specify an object path where the generated object
     * path should be rooted. Defaults to BE.
     * @returns {Object} The last object mentioned within the path.
     * @example
     * //Creates namespace structure and 
     * //returns property1 
     * BE.exportPath("BE.obj1.obj2.property1") 
     */
    exportPath_ = function (path, obj) {
        var parts = path.split('.'),
            parent = obj || that,
            i, max;

        if (parts[0] === "BE") {
            parts = parts.slice(1);
        }

        max = parts.length;

        for (i = 0; i < max; i += 1) {
            //Create the property if it doesn't exist
            if (!that.isDef(parent[parts[i]])) {
                parent[parts[i]] = {};
            }
            parent = parent[parts[i]];
        }
        return parent;
    },

    /**
     * Records the version of the given module.
     * @param {String} name The name of the module, given in object notation
     * and starting with "BE." to register.
     * @param {String} version The version string for this module.
     * @returns Nothing.
     */
    registerModule_ = function (name, version) {
        dependencies_.versions[name] = version;
    };

    /*************************************************************************\
     * >>> Public Properties:
    \*************************************************************************/

    /**
     * The base folder of the beforeeffects.jsx file relative to this file with
     * no trailing slash.
     * @type {String}
     */
    this.BASE_PATH = new Folder(new File($.fileName).parent.fsName).fsName;

    /**
     * The current version of After Effects already converted into a float.
     * @type {Float}
     */
    this.AEVersion = parseFloat(app.version);


	/*************************************************************************\
	* >>> Public Methods
	\*************************************************************************/

    /**
     * Imports the module defined by the given name path if it has not already
     * been defined; If the module cannot be found, an exception is raised.
     * @param {String} name The path to the module using object path notation
     * to drill down to the desired module's script. Uses the
     * {@link BE.BASE_PATH} as the root for the search.
     * @example
     * BE.require("BE.proj"); //runs proj/proj.jsxinc
     */
    this.require = function (name) {

        var log = that.log;

        log.debug('Requiring ' + name);

        if (dependencies_.visited[name]) {
            log.debug('Already visited!');
            //No need to run the module because it has already been visited
            return;
        }

        //Add the name path to the list of scripts that have been visited in
        //order to circumvent any infinite loops in the requires.
        dependencies_.visited[name] = true;

        //Run the script that correlates with the provided name
        if (!dependencies_.included[name]) {
            //Evaluate the script
            try {
                that.runScript(that.nameToPath(name));

                //Mark the module as being included.
                dependencies_.included[name] = true;
                log.debug('Require of ' + name + ' successfull!');

                //Our work is done here.
                return;
            } catch (e) {
                //Mark the file as not visited so the user can check the error
                //and retry.
                dependencies_.visited[name] = false;
                log.error('Error in requiring ' + name);
                that.alertError(e);
                throw new Error('FATAL ERROR: Error in requiring ' + name + ": " + e.message);
            }

        }
    };

    /**
     * Returns an object based on its fully qualified external name.
     *
     * @param {string} name The fully qualified name.
     * @param {Object=} opt_obj The object within which to look; default is
     *     |BE|.
     * @return {?} The value (object or primitive) or, if not found, null.
     */
    this.getObjectByName = function(name, opt_obj) {
      var parts = name.split('.');
      var cur = opt_obj || that;

      //Get rid of "BE" as a part if it's the first in the array.
      if (parts[0] === "BE") {
          parts.shift();
      }

      for (var part; part = parts.shift(); ) {
        if (that.isDefAndNotNull(cur[part])) {
          cur = cur[part];
        } else {
          return null;
        }
      }
      return cur;
    };

    /**
     * Sets an object based on its fully qualified external name.
     *
     * @param {string} name The fully qualified name.
     * @return {?} The value (object or primitive) or, if not found, null.
     */
    this.setObjectByName = function(name, val) {
        var parts = name.split('.'),
            cur = that,
            max,
            part;

        //Before the object can be defined, we need to make sure the path is
        //defined.
        exportPath_(name);

        //Get rid of "BE" from the path.
        parts.shift();

        for ( i = 0; i < parts.length; i += 1) {
          if (that.isDefAndNotNull(cur[part])) {
            cur = cur[part];
            if (i === parts.length - 1) {
                cur[parts[i + 1]] = val;
            }
          } else {
            return null;
          }
        }
        return cur;
    };

    /**
     * Provides an object for the BE namespace as well as registering its
     * version number without overwriting already defined
     * namespaces, methods or properties.
     * @param {String} name The name of the object to define.
     * @param {Function} module The module, provided as a function that, when
     * ran will return the module to define.
     * @returns {Object} The last object in the path.
     * @example
     * <code>BE.provide("BE.my.long.object.path");</code>
     * same as:
     * <code>BE = { my: { long: { object: { path: {}}}}};</code>
     */
    this.provide = function (name, version, module) {
        exportPath_(name);

        //Run the module that was sent since it is provided as a function
        module.call(that.getObjectByName(name));

        //Register the module's version
        registerModule_(name, version);
    };

    /**
     * Evaluates the script that resides at the given file path relative to the
     * {@link BE.BASE_PATH}.
     * <p>
     * NOTE: This method does not check to see if the file has already been
     * evaluated.
     * @param {String} path The file path for the script to be run.
     * @returns {Boolean} True if the file was succesfully evaluated, false if
     * it wasn't.
     * @example
     * BE.runScript("comp/comp.jsxinc"); //runs BE.BASE_PATH/comp/comp.jsx
     * }
     */
    this.runScript = function (path) {
        $.evalFile(new File(that.BASE_PATH + "/" + path));
        return true;
    };

    /**
     * Takes a name in object notation and returns the file path to the script
     * that defines the object relative to the {@link BE.BASE_PATH} without the
     * / prefix.
     * @param {String} name The name of the object to return the file path for.
     * @returns {String} The relative file path where the object with the given
     * name is defined.
     * @example
     * BE.nameToPath('BE.comp'); //returns comp/comp.jsxinc
     */
    this.nameToPath = function (name) {
        var parts = name.split('.'),
            i, max, path = '',
            log = that.log;

        log.debug('nameToPath(' + name + ')');
        //Does this name start with 'BE'? If so, get rid of it.
        if (parts[0] === 'BE') {
            parts = parts.slice(1);
        }

        //The last part of the name is the name to use for the file to import.
        //Every other part should correlate with the folder structure that is
        //in the same folder as the beforeeffects.jsx script.
        for (i = 0, max = parts.length; i < max; i += 1) {
            path += parts[i] + '/';

            if (i === max - 1) {
                path += parts[i] + '.jsxinc';
            }
        }

        log.debug('returning: ' + path);
        return path;
    };

    /**
     * Returns true if the specified value is an array
     * @param {*} val Variable to test.
     * @return {boolean} Whether variable is an array.
     */
    this.isArray = function(val) {
      return that.typeOf(val) == 'array';
    };

    /**
     * Returns true if the object looks like an array. To qualify as array like
     * the value needs to be an object with a Number length property.
     * @param {*} val Variable to test.
     * @return {boolean} Whether val is an array.
     * Borrowed from Google's Closure library: {@link http://code.google.com/p/closure/library}
     */
    this.isArrayLike = function(val) {
      var type = that.typeOf(val);
      return type == 'array' || type == 'object' && typeof val.length == 'number';
    };

    /**
     * This is a "fixed" version of the typeof operator.  It differs from the typeof
     * operator in such a way that null returns 'null' and arrays return 'array'.
     * @param {*} value The value to get the type of.
     * @return {string} The name of the type.
     * Borrowed from Google's Closure library: {@link http://code.google.com/p/closure/library}
     */
    this.typeOf = function(value) {
      var s = typeof value,
          className;

      if (s == 'object') {
        if (value) {
          // Check these first, so we can avoid calling Object.prototype.toString if
          // possible.
          if (value instanceof Array) {
            return 'array';
          } else if (value instanceof Object) {
            return s;
          }

          // HACK: In order to use an Object prototype method on the arbitrary
          //   value, the compiler requires the value be cast to type Object,
          //   even though the ECMA spec explicitly allows it.
          var className = Object.prototype.toString.call(
              /** @type {Object} */ (value));

          if ((className == '[object Array]' ||
               // In IE all non value types are wrapped as objects across window
               // boundaries (not iframe though) so we have to do object detection
               // for this edge case
               typeof value.length == 'number' &&
               typeof value.splice != 'undefined' &&
               typeof value.propertyIsEnumerable != 'undefined' &&
               !value.propertyIsEnumerable('splice')

              )) {
            return 'array';
          }
          // HACK: There is still an array case that fails.
          //     function ArrayImpostor() {}
          //     ArrayImpostor.prototype = [];
          //     var impostor = new ArrayImpostor;
          // this can be fixed by getting rid of the fast path
          // (value instanceof Array) and solely relying on
          // (value && Object.prototype.toString.vall(value) === '[object Array]')
          // but that would require many more function calls and is not warranted
          // unless closure code is receiving objects from untrusted sources.

          if ((className == '[object Function]' ||
              typeof value.call != 'undefined' &&
              typeof value.propertyIsEnumerable != 'undefined' &&
              !value.propertyIsEnumerable('call'))) {
            return 'function';
          }

        } else {
          return 'null';
        }

      }
      return s;
    };

    /**
     * Returns true if the specified value is not |undefined|.
     * <p>
     * WARNING: Do not use this to test if an object has a property. Use the
     * <code>in</code> operator instead.  Additionally, this function assumes
     * that the global <code>undefined</code> variable has not been redefined.
     * </p>
     * @param {*} val Variable to test.
     * @returns {boolean} Whether variable is defined.
     * @example
     * var x;
     * BE.isDef(x); //false
     * x = 1;
     * BE.isDef(x); //true
     *
     * //To check if a object has a property use this instead:
     * var x.blah = 1;
     * "blah" in x; //true
     * "bam" in x; //false
     */
    this.isDef = function (val) {
      return val !== undefined;
    };


    /**
     * Returns true if the specified value is truly |null|.
     * <p>
     * NOTE: There are a couple
     * of things to look out for when working with null values:
     * <ul>
     * <li><code>typeof null</code> returns '<code>object</code>' instead of
     * '<code>null</code>'.</li>
     * <li><code>null == undefined</coe> returns <code>true</code></li>
     * </ul>
     * </p>
     *
     * @param {*} val Variable to test.
     * @returns {boolean} Whether variable is null.
     * @example
     * var x;
     * BE.isNull(x); //true
     * !BE.isNull(x); //false
     */
    this.isNull = function (val) {
      return val === null;
    };


    /**
     * Returns true if the specified value is defined and not null.
     *
     * <p>
     * NOTE: <code>undefined == null</code> is <code>true</code> but
     * <code>undefined === null</code> is <code>false</code>.
     * </p>
     * @param {*} val Variable to test.
     * @returns {boolean} Whether variable is defined and not null.
     * @example
     * var x = null;
     * BE.isDefAndNotNull(x); //false
     * x = "I like cake";
     * BE.isDefAndNotNull(x); //true
     */
    this.isDefAndNotNull = function (val) {
      // Note that undefined == null.
      return val !== null && val !== undefined;
    };


    /**
     * Returns true if the specified value is a string
     * @param {*} val Variable to test.
     * @returns {boolean} Whether variable is a string.
     * @example
     * var x = "howdy";
     * BE.isString(x); //true
     */
    this.isString = function (val) {
      return typeof val === 'string';
    };


    /**
     * Returns true if the specified value is a boolean
     * @param {*} val Variable to test.
     * @returns {boolean} Whether variable is boolean.
     * @example
     * var x = false;
     * BE.isBoolean(x); //true
     */
    this.isBoolean = function (val) {
      return typeof val === 'boolean';
    };


    /**
     * Returns true if the specified value is a number
     * @param {*} val Variable to test.
     * @returns {boolean} Whether variable is a number.
     */
    this.isNumber = function (val) {
      return typeof val === 'number';
    };


    /**
     * Returns true if the specified value is a function
     * @param {*} val Variable to test.
     * @return {boolean} Whether variable is a function.
     */
    this.isFunction = function(val) {
      return that.typeOf(val) == 'function';
    };

    /**
     * Returns true if the specified value is an object.  This includes arrays
     * and functions.
     * @param {*} val Variable to test.
     * @return {boolean} Whether variable is an object.
     * Borrowed from Google's Closure library: {@link http://code.google.com/p/closure/library}
     */
    this.isObject = function(val) {
      var type = that.typeOf(val);
      return type == 'object' || type == 'array' || type == 'function';
    };

    /**
     * Returns true if the object looks like a Date. To qualify as Date-like
     * the value needs to be an object and have a getFullYear() function.
     * @param {*} val Variable to test.
     * @return {boolean} Whether variable is a like a Date.
     * Borrowed from Google's Closure library: {@link http://code.google.com/p/closure/library}
     */
    this.isDateLike = function(val) {
      return that.isObject(val) && typeof val.getFullYear == 'function';
    };

    /**
     * Copies all the members of a source object to a target object. WARNING:
     * This includes items that aren't 'own' items!
     * @param {Object} target Target.
     * @param {Object} source Source.
     */
    this.mixin = function (target, source) {
        var x;
        for (x in source) {
            target[x] = source[x];
        }
    };


	/**
     * Contains methods that help with debugging a script
	 * @memberOf BE
	 * @namespace
     */
    this.log = {};

	/**
	 * Log message type contstants. Values:
     * <ul>
     * <li>ERROR</li>
     * <li>WARN</li>
     * <li>DEBUG</li>
     * </ul>
     * @constant
     * @see BE.log
	 */
	this.log.types = {
		ERROR: "ERROR: ",
		WARN: "WARNING: ",
        DEBUG: "INFO: "
	};

	/**
     * Writes a message out to the ExtendScript console. The individual
     * <code>BE.log.debug</code>, <code>BE.log.warn</code> and
     * <code>BE.log.error</code> can be used as short forms for the
     * functionality of this method.
     *
     * NOTE: BE.log.types.ERROR outputs an error message to the console but
     * does not halt the execution of the script. You must thrown an exception
     * yourself.
     *
     * @example
     * BE.log.write(BE.log.types.DEBUG, 'This is a debug message');
     * @param {BE.log.types} type The <code>BE.log.type</code> to use for this
     * log message
     * @param {String} message The message to log
	 */
    this.log.write = function (type, message) {
        var m;

		//Make sure the debug level is at least one greater than zero.
        if (debug_ > 0) {
            m = type + message;
            switch (type) {
            case that.log.types.DEBUG:
                if (debug_ >= 1) {
                    $.writeln(m);
                }
                break;
            case that.log.types.WARN:
                if (debug_ >= 2) {
                    $.writeln(m);
                }
                break;
            case that.log.types.ERROR:
                $.writeln(m);
                break;
            default:
                $.writeln("INCORRECT ERROR TYPE SENT!");
                break;
            }
        }
    };

    /**
     * Outputs a warning message to the ExtendScript Toolkit console.
     * @param {String} message The message to display
     */
    this.log.warn = function (message) {
        that.log.write(that.log.types.WARN, message);
    };

    /**
     * Outputs an info message to the ExtendScript Toolkit console.
     * @param {String} message The message to display.
     */
    this.log.debug = function (message) {
        that.log.write(that.log.types.DEBUG, message);
    };

    /**
     * Outputs an error message to the ExtendScript Toolkit console.
     * @param {Error} e The error to output.
     */
    this.log.error = function (e) {
        that.log.write(that.log.types.ERROR, e.toString());
    };


    /**
     * Enters in a header message that visibly separates logs written by a
     * specified script.
     * @example
     *      BE.log.insertLogStart('myfilename.jsx');
     *      //Ouput:
     *      ----------------
     *      myfilename.jsx
     *      <CURRENT DATE HERE>
     *      ----------------
     * @param {String} h The header string to mention in the log start.
     * @returns Nothing.
     */
    this.log.insertLogStart = function (h) {
        var d = new Date(),
            m = "----------------\n" +
               h + "\n" +
               d.toString() + "\n" +
               "----------------";
        $.writeln(m);
    };

    /**
     * Inserts a horizontal rule in the log to visually separate the info to be
     * written to the log.
     *  
     * @param {Array|Int} [padding = 0] <p>One of two types of values can be
     * sent as the parameter for this method. If you pass an Integer or a
     * single value Array, that many lines will be added before and after the
     * separator.</p>
     * 
     * <p>If you pass a two value Array, i.e. [1,2], the Integer at position 0
     * is used to determine how many blank lines to place above the separator
     * and the Integer at position [1] is used to determine how many blank
     * lines to place below the separator.</p>
     * 
     * <p>If the Array sent has a length greater than 2, only the first two
     * indices are used.</p>
     * @param {String} [s="-"] The character to use as the separator.
     * @param {Number} [n = 15] How many characters to place within the
     * horizontal separator line.
     * @example
     *  BE.log.separate(1, '+', 5);
     *  //Output:
     *  
     *  +++++
     */
    this.log.separate = function (padding, s, n) {

        var i, padBefore, padAfter, separatorString = "";

        padding = (padding === undefined) ? 0 : padding;
        s = (s === undefined) ? "-" : s;
        n = (n === undefined) ? 15 : n;

        if (padding instanceof Array) {
            //How many dimensions?
            if (padding.length === 1) {
                padBefore = padAfter = padding[0];
            } else if (padding.length >= 2) {
                padBefore = padding[0];
                padAfter = padding[1];
            }
        } else if (padding instanceof String) {
            padBefore = padAfter = parseInt(padding, 10);
        }

        //Output any padding before this separator
        for (i = 0; i < padBefore; i += 1) {
            $.writeln("");
        }

        //Output the separator
        for (i = 0; i < n; i += 1) {
            separatorString += s;
        }

        $.writeln(separatorString);

        //Output any padding after this separator
        for (i = 0; i < padAfter; i += 1) {
            $.writeln("");
        }
    };

	/**
	 * Set the debug level for the <code>BE.log</code> method.
	 * 
	 * The following levels are available:
	 * <ul>
	 *  <li>0 - Debug completely off.</li>
	 *  <li>1 - Information displayed.</li>
	 *  <li>2 - Warnings shown.</li>
	 * </ul>
	 * 
     * @param {Number} l The level number to set as the debug level.
	 * @example
     * BE.setDebugLevel(1);
	 * @returns Nothing.
	 * @see BE.log
	 */
	this.setDebugLevel = function (l) {
		debug_ = l;
	};

    /**
     * Returns the version string of the current <code>BE</code> Object.
     * 
     * @returns {String} The <code>BE</code> Object's version string.
     */
    this.getVersion = function () {
        return version_;
    };

    /**
     * Alerts an Error Object, OR a String error, to the user. If the error
     * message's length is greater than 100 character, the error is displayed
     * in a scrollable window.
     *
     * NOTE: This method alerts an error to the user but does not
     * halt the execution of the script. You must throw an error yourself to
     * halt the execution of your script.
     *
     * @param {String|Error} e If the argument is a String, this variable will
     * be used to alert the string to the user. If it is an Error, the fields
     * within the Error will be used to alert the user.
     * @return Nothing.
     */
    this.alertError = function (e) {
        var errString = "",
            eWindow,
			errStringMaxLength = 100;

		if (e instanceof Error) {
			errString = e.description;
			errString += (e.fileName) ? "\n\nFile: " + e.fileName : "";
		} else {
			errString = e;
		}
        errString += "\n\nStack:\n" + $.stack;

		if (errString.length > errStringMaxLength) {
			eWindow = new Window("dialog",
					"Error!",
					undefined,
					{resizeable: false}
					);

			eWindow.grp = eWindow.add(
				"group { orientation: 'column', margins:0," +
					"alignment: ['fill','fill'], size: [350, 450]," +
						"err: EditText {properties: {multiline:true}," +
						"alignment: ['fill', 'fill']," +
							"size: [350,430]}," +
						"b: Button {text: 'Ok'}" +
				"}");

			eWindow.grp.b.onClick = function () {
				eWindow.close();
			};

			eWindow.center();
			eWindow.grp.err.text = errString;
			eWindow.show();

		} else {
		    alert(errString);
		}

        that.log.error(errString);
    };

	/*************************************************************************\
	* >>> ERROR
	\*************************************************************************/

    /**
     * Set of string error constants used by the global <code>BE</code> Object.
	 * 
     * The errors represented within this Object are not Error Objects; they
     * are descriptive strings.
	 * @namespace
     * @constant
     */
    this.ERROR = {
		/**
		 * An error stating that there is no open After Effects
		 * project.
		 * @type {String}
		 */
        NO_OPEN_PROJECT: "An open project could not be found!",

        /**
         * An error stating the active item within the currently open After
         * Effects file cannot be found.
         * @type {String}
         */
        NO_ACTIVE_ITEM : "The active item within the project could " +
            "not be found!",

        /**
         * An error stating that the active composition within the currently
         * open project could not be found.
         * @type {String}
         */
        NO_ACTIVE_COMP : "The active composition within the " +
            "project could not be found!",

        /**
         * An error stating that a module attempting to be defined does not
         * have a version property associated with it.
         * @type {String}
         */
        NO_MODULE_VERSION: "Please make sure a version string is defined " +
            "within all modules you are attempting to provide."
    };

    return this;
}());
