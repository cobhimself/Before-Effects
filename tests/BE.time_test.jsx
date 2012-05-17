/**
 * @fileoverview The script tests the functionality of the BE.comp object.
 * NOTE: It is assumed both TB and BE have been sourced. See
 * beforeeffects_tests.jsx to customize the overall BE test.
 * @author <a href="mailto:collin.brooks@gmail.com">Collin Brooks</a>
 * @version 0.1.0 dev
 */


TB.module('BE.time');
BE.require('BE.time');

TB.test('BE.time properties', function () {
    TB.hasProperty(BE, "time", "time is a property of BE");
    TB.hasProperty(BE.time, "getTimeDisplayTypeString", "BE.time.getTimeDisplayTypeString is a property of BE.time");
    TB.hasProperty(BE.time, "setTimeDisplayType", "BE.time.setTimeDisplayType is a property of BE.time");
    TB.hasProperty(BE.time, "getTimeInSeconds", "BE.time.getTimeInSeconds is a property of BE.time");
    TB.hasProperty(BE.time, "getTimeInFrames", "BE.time.getTimeInFrames is a property of BE.time");
    TB.hasProperty(BE.time, "withTimecodeRemembered", "BE.time.withTimecodeRemembered is a property of BE.time");
});

TB.test('BE.time.getTimeDisplayTypeString()', function () {
    //Initialize the testConfig comp object
    testConfig.comp.init();

    var theComp = testConfig.comp.theComp;

    if (BE.AEVersion < 10.5) {
        app.project.timecodeDisplayType = TimecodeDisplayType.FRAMES;
        TB.ok(
            BE.time.getTimeDisplayTypeString("frames"),
            "BE.time.getTimeDisplayTypeString('frames') is true."
        );
        TB.ok(
            BE.time.getTimeDisplayTypeString("FRAMES"),
            "BE.time.getTimeDisplayTypeString('FRAMES') is true."
        );

        app.project.timecodeDisplayType = TimecodeDisplayType.TIMECODE;
        TB.ok(
            BE.time.getTimeDisplayTypeString("timecode"),
            "BE.time.getTimeDisplayTypeString('timecode') is true."
        );
        TB.ok(
            BE.time.getTimeDisplayTypeString("timecode"),
            "BE.time.getTimeDisplayTypeString('timecode') is true."
        );
    } else {
        app.project.timeDisplayType = TimeDisplayType.FRAMES;
        TB.ok(
            BE.time.getTimeDisplayTypeString("frames"),
            "BE.time.getTimeDisplayTypeString('frames') is true."
        );
        TB.ok(
            BE.time.getTimeDisplayTypeString("FRAMES"),
            "BE.time.getTimeDisplayTypeString('FRAMES') is true."
        );

        app.project.timeDisplayType = TimeDisplayType.TIMECODE;
        TB.ok(
            BE.time.getTimeDisplayTypeString("timecode"),
            "BE.time.getTimeDisplayTypeString('timecode') is true."
        );
        TB.ok(
            BE.time.getTimeDisplayTypeString("timecode"),
            "BE.time.getTimeDisplayTypeString('timecode') is true."
        );
    }

    //Clean up the testConfig comp object
    testConfig.comp.clean();
});

TB.test('BE.time.timecodeDisplayTypeIs()', function () {
    //Initialize the testConfig comp object
    testConfig.comp.init();

    var theComp = testConfig.comp.theComp,
        testLayers = testConfig.comp.testLayers;

    //Set the timecode display type to frames and check.
    BE.time.setTimeDisplayType("frames");
    TB.ok(BE.time.timecodeDisplayTypeIs("frames"), "timecodeDisplayTypeIs(\"frames\") is correct!");

    //Set the timecode display type to frames and check.
    BE.time.setTimeDisplayType("FRAMES");
    TB.ok(BE.time.timecodeDisplayTypeIs("FRAMES"), "timecodeDisplayTypeIs(\"FRAMES\") is correct!");

    //Set the timecode display type to timecode and check.
    BE.time.setTimeDisplayType("timecode");
    TB.ok(BE.time.timecodeDisplayTypeIs("timecode"), "timecodeDisplayTypeIs(\"timecode\") is correct!");

    BE.time.setTimeDisplayType("TIMECODE");
    TB.ok(BE.time.timecodeDisplayTypeIs("TIMECODE"), "timecodeDisplayTypeIs(\"TIMECODE\") is correct!");

    //Clean up the testConfig comp object
    testConfig.comp.clean();
});

TB.test('BE.time.setTimeDisplayType()', function () {
    //Initialize the testConfig comp object
    testConfig.comp.init();

    var theComp = testConfig.comp.theComp,
        testLayers = testConfig.comp.testLayers;

    //Set the timecode display type to frames and check.
    BE.time.setTimeDisplayType("frames");
    TB.equal(BE.time.getTimeDisplayTypeString(), "frames", "Timecode display type is equal to frames.");

    //Set the timecode display type to timecode and check.
    BE.time.setTimeDisplayType("timecode");
    TB.equal(BE.time.getTimeDisplayTypeString(), "timecode", "Timecode display type is equal to timecode.");

    //Clean up the testConfig comp object
    testConfig.comp.clean();
});

TB.test('BE.comp.withTimecodeRemembered()', function () {
    //Initialize the testConfig comp object
    /*testConfig.comp.init();*/

    /*var theComp = testConfig.comp.theComp,*/
        /*testLayers = testConfig.comp.testLayers;*/

    TB.ok(false, "TO DO!");

    //Clean up the testConfig comp object
    /*testConfig.comp.clean();*/
});

/** TODO: **/
