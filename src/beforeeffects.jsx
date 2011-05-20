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
         * An array of includes that have already been included. This helps
         * make sure a module does not define a resource more than once.
         * @type {String[]}
         */
        included: []
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
    };
    
    /*************************************************************************\
     * >>> Public Properties:
    \*************************************************************************/

    /**
     * The base folder, relative to this file with no trailing slash.
     * @type {String}
     */
    this.BASE_PATH = new Folder(new File($.fileName).parent.fsName).fsName;
    

	/*************************************************************************\
	* >>> Public Methods
	\*************************************************************************/

    /**
     * Imports the module defined by the given name path if it has not already
     * been defined; If the module cannot be found, an exception is raised.
     * @param {String} name The path to the module using object path notation
     * to drill down to the desired script. Uses the {@link BE.BASE_PATH} as
     * the root for the search.
     * @example "BE.proj" imports proj/proj.jsxinc
     */
    this.require = function (name) {

        var log = that.log;

        log.debug('Requiring ' + name);

        if (dependencies_.visited[name]) {
            log.debug('Already visited!');
            return;
        }

        //Add the name path to the list of scripts that have been visited in
        //order to circumvent any infinite loops in the requires.
        dependencies_.visited[name] = true;

        //Run the script that correlates with the provided name
        if (!dependencies_.included[name]) {
            //Evaluate the script
            if (that.runScript(that.nameToPath(name))) {
                //Mark the name as being included.
                dependencies_.included[name] = true;
                log.debug('Require of ' + name + ' successfull!');
                return;
            } else {
                //Mark the file as not visited so the user can check the error
                //and retry.
                dependencies_.visited[name] = false;
                log.debug('Error in requiring ' + name);

                throw ('Require Error. Cannot continue');
            }
            
        }
    };


    /**
     * Provides an object structure without overwriting already defined
     * namespaces, methods or properties.
     * @param {String} name The name of the object to define.
     * @returns {Object} The last object in the path.
     * @example
     * BE.provide("BE.my.long.object.path");
     * produces:
     * BE = { my: { long: { object: { path: {}}}}};
     */
    this.provide = function (name) {
        return exportPath_(name);
    };

    /**
     * Evaluates the script that resides at the given path. Note: This method
     * does not check to see if the file has already been evaluated.
     * @param {String} path The file path for the script to be run.
     * @returns {Boolean} True if the file was succesfully evaluated, false if
     * it wasn't.
     */
    this.runScript = function (path) {
        try {
            $.evalFile(new File(that.BASE_PATH + path));

            return true;
        } catch (e) {
            that.alertError("There was an error while evaluating the " +
            "script at " + path + ".\n\nERROR:\n" + e);

            return false;
        }
    };

    /**
     * Takes a name in object notation and returns the file path to the script
     * that defines the object relative to the {@link BE.BASE_PATH}.
     * @param {String} name The name of the object to return the file path for.
     * @returns {String} The relative file path where the object with the given
     * name is defined.
     * @example
     * BE.nameToPath('BE.comp.getLayerNames'); //returns /comp/comp.jsxinc
     */
    this.nameToPath = function (name) {
        var parts = name.split('.'),
            i, max, path = '/',
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
     * Returns true if the specified value is not |undefined|.  WARNING: Do not
     * use this to test if an object has a property. Use the in operator
     * instead.  Additionally, this function assumes that the global undefined
     * variable has not been redefined.
     * @param {*} val Variable to test.
     * @returns {boolean} Whether variable is defined.
     */
    this.isDef = function (val) {
      return val !== undefined;
    };


    /**
     * Returns true if the specified value is |null|
     * @param {*} val Variable to test.
     * @returns {boolean} Whether variable is null.
     */
    this.isNull = function (val) {
      return val === null;
    };


    /**
     * Returns true if the specified value is defined and not null
     * @param {*} val Variable to test.
     * @returns {boolean} Whether variable is defined and not null.
     */
    this.isDefAndNotNull = function (val) {
      // Note that undefined == null.
      return val !== null;
    };
    

    /**
     * Returns true if the specified value is a string
     * @param {*} val Variable to test.
     * @returns {boolean} Whether variable is a string.
     */
    this.isString = function (val) {
      return typeof val === 'string';
    };


    /**
     * Returns true if the specified value is a boolean
     * @param {*} val Variable to test.
     * @returns {boolean} Whether variable is boolean.
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
     * Returns true if the specified value is a function.
     * @param {*} val Variable to test.
     * @returns {boolean} Whether variable is a function.
     */
    this.isFunc = function (val) {
        if (!(val instanceof Object) &&
            (Object.prototype.toString.call(
            /** @type {Object} */ (val)) === '[object Function]' ||
            typeof val.call !== 'undefined' &&
            typeof val.propertyIsEnumerable !== 'undefined' &&
            !val.propertyIsEnumerable('call'))) {

            return true;

        } else {
            return false;
        }
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
     * <li>EXCEPTION</li>
     * <li>WARN</li>
     * <li>DEBUG</li>
     * </ul>
     * @constant
     * @see BE.log
	 */
	this.log.types = {
		EXCEPTION: "FATAL ERROR: ",
		WARN: "WARNING: ",
        DEBUG: "INFO: "
	};

	/**
     * Writes a message out to the ExtendScript console. The individual
     * <code>BE.log.debug</code>, <code>BE.log.warn</code> and
     * <code>BE.log.error</code> can be used as short forms for the
     * functionality of this method.
     *
     * @example 
     * BE.log.write(BE.log.types.DEBUG, 'This is a debug message');
     * @param {BE.log.types} type The <code>BE.log.type</code> to use for this
     * log message
     * @param {String} message The message to log
	 */
    this.log.write = function (type, message) {
		//Make sure the debug level is at least one greater than zero.
        if (debug_ > 0) {
            switch (type) {
            case that.log.types.DEBUG:
                if (debug_ >= 1) {
                    $.writeln(type + message);
                }
                break;
            case that.log.types.WARN:
                if (debug_ >= 2) {
                    $.writeln(type + message);
                }
                break;
            case that.log.types.EXCEPTION:
                $.writeln(type + message);
                that.alertError("" + type + message);
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
        that.log.write(that.log.types.EXCEPTION, e.toString());
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
     * @param {String} s The name of the script to mention in the log start
     * @returns Nothing.
     */
    this.log.insertLogStart = function (s) {
        var d = new Date(),
            m = "----------------\n" +
               s + "\n" +
               d.toString() + "\n" +
               "----------------";
        $.writeln(m);
    };

    /**
     * Inserts a horizontal rule in the log to visually separate the info to be
     * written to the log.
     * @example
     *  BE.log.separate(1, '+', 5);
     *  //Output:
     *  
     *  +++++
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
	 * message is greater than a preset amount, the error is displayed in a
	 * scrollable window.
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

		that.log.warn(errString);
    };

	/*************************************************************************\
	* >>> ERROR
	\*************************************************************************/

    /**
     * Set of string error constants used by the global <code>BE</code> Object.
	 * 
     * The errors represented within this Object are not Error Objects; they
     * are description strings.
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
            "project could not be found!"
    };
    return this;
}());
