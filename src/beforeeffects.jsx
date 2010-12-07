/**
* @fileoverview <code>BE</code> (BeforeEffects) aims to be a collection of
* useful extensions to the After Effects Object Model within ExtendScript.
* <code>BE</code> contains Objects that provide greater functionality and
* reusability than the built-in After Effects objects as well as prototyple
* modifications to the built-in Objects within JavaScript.
* 
* All prototype modifications to the built-in JavaScript Objects are handled
* gently by checking to make sure the methods/fields that are added are not
* already defined. This is helpful in that, if the standard Objects are modified
* by future ECMA specifications (or ExtendScript is modified) and they are named
* the same as methods/fields that <code>BE</code> implements, BeforeEffects will
* not overwrite the pre-defined methods. 
* 
* @author <a href="mailto:collin.brooks@gmail.com">Collin Brooks</a>
* @version 0.1.0 dev
*/


/**
 * The <code>BE</code> Object aims to be an all-purpose collection of useful
 * methods that increases efficiency in creating scripts for After Effects.
 * 
 * @return {Object} The BE Object
 * @version 0.1.0 dev
 * @namespace
 */
var BE = (function ()
{
    /*****************************************************************************\
    * >>> Private Variables
	\*****************************************************************************/
	
    /**
    * A reference to this function's 'this' value for use within
    * methods/functions defined by the BE Object.
    * 
    * @type {Object}
     */
    
    var that = this,

	/**
	 *The current version of the BE object.
	 *
	 *@type {String}
	 *@private
	 */
	version = "0.1.0 dev",

	/**
	 * <p>The current debug level. Each level builds upon the previous
	 * level. Errors are automatically output to the log. Possible values:
	 * <ul>
	 * <li>0 - No information output to console</li>
	 * <li>1 - Info output to the console</li>
	 * <li>2 - Warnings and Info output to the console</li>
	 * </ul>
	 * </p>
	 * @type {Int}
	 */
	debug = 3,

    /**
    * The base folder, relative to this file, where the "inc" folder can be
    * found.
    * @type {Folder}
    */
    includeFolder = new Folder(new File($.fileName).parent.fsName +
        "/inc").fsName, 

    /**
    * An array of filenames, relative to the inc/ folder, where the
    * modules/languages can be found.
    * @type {Array}
    */
    includes = [
        // Modules
        "/modules/BE_prototypes.jsxinc",
        "/modules/BE_PROJ_helper.jsxinc",
        "/modules/BE_COMP_helper.jsxinc",
        "/modules/BE_LAYER_helper.jsxinc",
        "/modules/BE_TIME_helper.jsxinc",
        "/modules/BE_UI_helper.jsxinc"
        //Languages
    ];
    
	/*****************************************************************************\
	* >>> Public Methods
	\*****************************************************************************/
	
	/**
     * Contains methods that help with debugging a script
	 * @memberOf BE
	 * @namespace
     */
    this.LOG = {};

	/**
	 * Log message type contstants. Values:
     * <ul>
     * <li>EXCEPTION</li>
     * <li>WARN</li>
     * <li>DEBUG</li>
     * </ul>
     * @constant
     * @see BE.LOG
	 */
	this.LOG.types = {
		EXCEPTION: "FATAL ERROR: ",
		WARN: "WARNING: ",
        DEBUG: "INFO: "
	};

	/**
     * Writes a message out to the ExtendScript console. The individual
     * <code>BE.LOG.debug</code>, <code>BE.LOG.warn</code> and
     * <code>BE.log.error</code> can be used as short forms for the
     * functionality of this method.
     *
     * @param {BE.LOG.types} type The <code>BE.LOG.type</code> to use for this
     * log message
     * @param {String} message The message to log
	 */
    this.LOG.write = function (type, message)
    {
		//Make sure the debug level is at least one greater than zero.
        if (that.debug > 0)
        {
            switch (type) {
            case that.LOG.types.DEBUG:
                if (BE.debug >= 1)
                {
                    $.writeln(type + message);
                }
                break;
            case that.LOG.types.WARN:
                if (that.debug >= 2)
                {
                    $.writeln(type + message);
                }
                break;
            case that.LOG.types.EXCEPTION:
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
     * Outputs a warning message to the console.
     * @param {String} message The message to display
     */
    this.LOG.warn = function (message) {
        that.LOG.write(that.LOG.types.WARN, message);
    };

    /**
     * Outputs an info message to the console.
     * @param {String} message The message to display
     */
    this.LOG.debug = function (message) {
        that.LOG.write(that.LOG.types.DEBUG, message);
    };

    /**
     * Outputs an error message to the console.
     * @param {Error} e The error to output.
     */
    this.LOG.error = function (e) {
        that.LOG.write(that.LOG.types.EXCEPTION, e.toString());
    };


    /**
     * Enters in a header message that visibly separates logs written by a
     * specified script.
     * @param {String} s The name of the script to mention in the log start
     * @returns Nothing.
     */
    this.LOG.insertLogStart = function (s)
    {
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
     * @param {Array|Int} [padding = 0] <p>One of two types of values can be sent as
     * the parameter for this method. If you pass an Integer or a single value
     * array, that many lines will be added before and after the separator.</p>
     * 
     * <p>If you pass a two value array, i.e. [1,2], the Integer at position 0
     * is used to determine how many blank lines to place above the separator
     * and the Integer at position [1] is used to determine how many blank lines
     * to place below the separator.</p>
     * 
     * <p>If the array sent has a length greater than 2, only the first two indices
     * are used.</p>
     * @param {String} [s="-"] The character to use as the separator.
     * @param {Int} [n = 15] How many characters to place within the horizontal
     * separator line.
     */
    this.LOG.separate = function(padding, s, n) 
	{

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
        } else if(padding instanceof String) {
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
	* Set the debug level for the Before Effects LOG method.
	* 
	* The following levels are available:
	* <ul>
	* 	<li>0 - Debug completely off.</li>
	* 	<li>1 - Information displayed.</li>
	* 	<li>2 - Warnings shown.</li>
	* </ul>
	* 
    * @param {Int} l The level number to set as the Debug Level.
	* @example
    * BE.setDebugLevel(1);
	* @returns Nothing.
	* @see BE.LOG
	*/
	this.setDebugLevel = function (l)
	{
		debug = l;	
	};

    /**
    * Returns the version string of the current BE Object.
    * 
    * @returns {String} The BE Object's version string.
    */
    this.getVersion() = function (){
       return that.version;
    };
    
	/**
	 * Checks to see if the current version of BE will work with
	 * the current version of After Effects.
	 * @returns {Bool} True if this version of BE is compatible with
	 * the current version of After Effects or False if it isn't.
     * TODO
	 */
	this.checkCompatability = function () {
		var aeVersion = (app.version) ? app.version : null;

		if(aeVersion === null) 
		{

		}
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
    this.alertError = function (e)
    {
        var errString = "",
            eWindow
			errStringMaxLength = 100;

		if (e instanceof Error) {
			errString = e.description;
			errString += (e.fileName) ? "\n\nFile: " + e.fileName : "";
		} else {
			errString = e;
		}

		if (errString.length > errStringMaxLength)
		{
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

		that.LOG.warn(errString);
    };

    /**
    * Initializes the module and language includes. To reload a module, you can
    * pass the name of the module (minus the file extension and "BE_") to the
    * init method at any time.
    * @param {String[]} [moduleList] An Array of module names to make available.
    * If blank, "all" or undefined, all modules will be loaded. If a module
    * fails to load (either because there is an error within the module itself
    * or the module doesn't exist) execution halts with an error.
    * @returns return_type return_description
    */
    this.init = function (moduleList){
        var inc;

        //If the module list is not defined, set it to "all" 
        moduleList = (!moduleList || moduleList === []) ? that.includes :
        moduleList;

        that.LOG.debug("Num Includes -> " + includes.length);

        for (inc = 0; inc < moduleList.length; inc++)
        {
            try {
                that.LOG.debug("Including -> " + "[" + inc + "]" + moduleList[inc]);
                $.evalFile(new File(that.includeFolder + "/" + moduleList[inc]));
            } catch (e) {
                that.alertError("There was an error while evaluating the " +
                "includes. The following include failed: " + moduleList[inc]);

                return false;
            }
        }
    };
    

	/*****************************************************************************\
	* >>> ERROR
	\*****************************************************************************/

    /**
     * Set of string error constants used by the global BE Object.
	 * 
	 * The errors represented within this Object are not Error Objects; they are
	 * description strings.
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
        * An error stating the active item within the currently open After Effects file cannot be
        * found.
        * @type {String}
        */
        NO_ACTIVE_ITEM : "The active item within the project could " +
            "not be found!",

        /**
        * An error stating that the active composition within the currently open project could not be found.
        * @type {String}
        */
        NO_ACTIVE_COMP : "The active composition within the " +
            "project could not be found!",
    };
    return this;
}());

//Initialize Before Effects
BE.init();
